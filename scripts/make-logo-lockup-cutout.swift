import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Stellt das Logo-Lockup aus public/assets/logo-lockup.png frei (PROJ-1,
// Refinement 2026-09-20). Ergebnis: public/assets/logo-lockup-cutout.png mit
// Alpha-Kanal.
//
// Warum ueberhaupt: logo-lockup.png ist 8-bit RGB und hat damit keinen
// Alpha-Kanal — PNG *kann* Transparenz, diese Datei nutzt sie nicht. Also
// traegt jeder Pixel eine Farbe, auch dort, wo gestalterisch nichts sein soll.
// Der Bildgrund ist eine ausgemalte Flaeche: eine Platte. Sie misst
// rgb(5-6, 7-8, 9-10) gegen einen App-Hintergrund von rgb(11,15,18) und
// zeichnet sich auf / und auf /about als dunkles Rechteck ab.
//
// Aufbau nach scripts/make-mark-pin-cutout.swift (PROJ-3, 2026-09-19) —
// gleiche Fehlerklasse, gleicher Algorithmus. Die Schwellen sind andere, und
// zwei Filter kommen dazu. Gemessen, nicht geschaetzt, 1039x543 Quellbild:
//
//  - Der Grund ist hier FLACH, nicht verlaufend: mittlere Luminanz der vier
//    Eckregionen 7.11 / 7.31 / 7.32 / 7.67, Spanne 0.57. Beim Pin waren es
//    42.8 gegen 24.9 (Spanne 17.9). Freistellen bleibt trotzdem richtig: eine
//    feste Ersatzfarbe muesste bei jeder Hintergrundaenderung nachgezogen
//    werden, ein Alpha-Kanal nie.
//
//  - Das Luminanz-Histogramm hat sein Tal bei 25..48 (nur 0.63% aller Pixel).
//    Darunter liegt die Platte (0..12, 71.6%), darueber das Motiv (128..255,
//    22.5%). Die Schwellen des Pin-Skripts (LO=74, HI=124) wuerden hier das
//    GESAMTE Motiv verwerfen.
//
// Zwei Fallstricke, die das Pin-Skript nicht kennt, weil seine Quelle sie
// nicht hatte:
//
//  1. Die Quelldatei hat KORN. Nach dem Freistellen zerfaellt das Bild in 3942
//     zusammenhaengende Bereiche, davon 3884 mit <= 30 Pixeln — Filmkorn im
//     Bildgrund, das die opake Platte bisher verdeckt hat. Auf #0B0F12
//     kompositiert ergibt das eine Kanten-Abweichung von 144 im aeusseren
//     12px-Rahmen. Loesung: Bereiche unterhalb MIN_COMPONENT verwerfen. Mit 16
//     Pixeln faellt die Abweichung auf exakt 0 — dieselbe Messlatte, die
//     mark-pin.png erreicht. Kein Randpixel des Hauptmotivs ist betroffen
//     (gemessen: 0 von 188 Randtreffern gehoeren zum groessten Bereich).
//
//  2. Ein Groessenfilter allein reicht nicht. Danach bleiben Bereiche stehen,
//     die als graue Schlieren sichtbar sind — am deutlichsten ueber der
//     Wortmarke bei x 430..473 (643 Px) und x 606..677 (595 Px). Sie sind
//     groesser als 16 Pixel und ueberleben Filter 1.
//
//     Der naheliegende Griff — die SPITZENHELLIGKEIT des Bereichs — trennt
//     hier NICHT: Gemessen hat die Schliere bei x 430..473 einen Peak von 163
//     bei einer mittleren Helligkeit von 20.8. Ein einzelnes helles Korn
//     reicht, und der Bereich rutscht durch. Getestet mit MIN_PEAK = 60:
//     49 Bereiche fielen, die beiden sichtbaren Schlieren blieben stehen.
//
//     Die MITTLERE Helligkeit trennt dagegen sauber, mit einer Luecke ohne
//     einen einzigen Bereich darin: alles Korn liegt bei <= 85.8, jedes echte
//     Motivteil bei >= 91.2. MIN_MEAN = 88 sitzt mittig in dieser Luecke.
//
// Die Quelldatei bleibt liegen und wird nicht ueberschrieben: Das Skript
// braeuchte sonst sein eigenes Ergebnis als Eingabe und waere nicht mehr
// reproduzierbar. Gleiches Muster wie beim Pin, wo mark-pin.jpg als Quelle
// blieb.
//
// Aufruf: swift scripts/make-logo-lockup-cutout.swift

let srcPath = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "public/assets/logo-lockup.png"
let outPath = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : "public/assets/logo-lockup-cutout.png"

guard let isrc = CGImageSourceCreateWithURL(URL(fileURLWithPath: srcPath) as CFURL, nil),
      let img = CGImageSourceCreateImageAtIndex(isrc, 0, nil) else {
    FileHandle.standardError.write("Quellbild nicht lesbar: \(srcPath)\n".data(using: .utf8)!)
    exit(1)
}

let w = img.width, h = img.height
var rgba = [UInt8](repeating: 0, count: w * h * 4)
guard let ctx = CGContext(data: &rgba, width: w, height: h, bitsPerComponent: 8,
                          bytesPerRow: w * 4, space: CGColorSpaceCreateDeviceRGB(),
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
    FileHandle.standardError.write("Kontext fehlgeschlagen\n".data(using: .utf8)!)
    exit(1)
}
ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))

// Luminanz-Rampe ueber dem Histogramm-Tal: unterhalb LO sicher Grund,
// oberhalb HI sicher Motiv, dazwischen linear — das haelt weiche Kanten weich.
let LO = 13.0, HI = 30.0

// Filter 1: Mindestgroesse eines zusammenhaengenden Bereichs, gegen das Korn.
let MIN_COMPONENT = 16

// Filter 2: Mindest-MITTLERE-Helligkeit eines Bereichs, gegen die Schlieren.
// Nicht die Spitzenhelligkeit — siehe Begruendung oben.
let MIN_MEAN = 88.0

@inline(__always) func lum(_ i: Int) -> Double {
    0.2126 * Double(rgba[i]) + 0.7152 * Double(rgba[i + 1]) + 0.0722 * Double(rgba[i + 2])
}

var alpha = [Double](repeating: 0, count: w * h)
for p in 0..<(w * h) {
    let l = lum(p * 4)
    alpha[p] = l <= LO ? 0 : (l >= HI ? 1 : (l - LO) / (HI - LO))
}

// Flood-Fill vom Rand ueber alles, was die Rampe als (teil-)transparent sieht.
// Erreichte Pixel sind echter Hintergrund; eingeschlossenes Dunkel — die
// dunkle Kreisflaeche in der Pin-Mitte des Lockups — bleibt opak.
var isBackground = [Bool](repeating: false, count: w * h)
var stack = [Int]()
for x in 0..<w {
    stack.append(x)                 // obere Kante
    stack.append((h - 1) * w + x)   // untere Kante
}
for y in 0..<h {
    stack.append(y * w)             // linke Kante
    stack.append(y * w + w - 1)     // rechte Kante
}
while let p = stack.popLast() {
    if isBackground[p] || alpha[p] >= 1 { continue }
    isBackground[p] = true
    let x = p % w, y = p / w
    if x > 0     { stack.append(p - 1) }
    if x < w - 1 { stack.append(p + 1) }
    if y > 0     { stack.append(p - w) }
    if y < h - 1 { stack.append(p + w) }
}

// Vorlaeufiges Alpha: Motiv opak, nur am Rand erreichbares Dunkel transparent.
var work = [Double](repeating: 0, count: w * h)
for p in 0..<(w * h) {
    work[p] = isBackground[p] ? alpha[p] : 1.0
}

// Beide Filter arbeiten auf zusammenhaengenden Bereichen sichtbarer Pixel.
// Ein Bereich faellt weg, wenn er zu klein ODER zu dunkel ist — Korn ist
// beides, Schlieren sind nur das zweite.
var visited = [Bool](repeating: false, count: w * h)
var droppedSpecks = 0, droppedDim = 0, droppedPixels = 0

for start in 0..<(w * h) {
    if visited[start] || work[start] <= 0 { continue }
    var cells = [Int]()
    var sumBrightness = 0
    var queue = [start]
    visited[start] = true
    while let p = queue.popLast() {
        cells.append(p)
        let i = p * 4
        sumBrightness += Int(max(rgba[i], max(rgba[i + 1], rgba[i + 2])))
        let x = p % w, y = p / w
        if x > 0     && !visited[p - 1] && work[p - 1] > 0 { visited[p - 1] = true; queue.append(p - 1) }
        if x < w - 1 && !visited[p + 1] && work[p + 1] > 0 { visited[p + 1] = true; queue.append(p + 1) }
        if y > 0     && !visited[p - w] && work[p - w] > 0 { visited[p - w] = true; queue.append(p - w) }
        if y < h - 1 && !visited[p + w] && work[p + w] > 0 { visited[p + w] = true; queue.append(p + w) }
    }
    let tooSmall = cells.count < MIN_COMPONENT
    let tooDim = Double(sumBrightness) / Double(cells.count) < MIN_MEAN
    if tooSmall || tooDim {
        if tooSmall { droppedSpecks += 1 } else { droppedDim += 1 }
        droppedPixels += cells.count
        for p in cells { work[p] = 0 }
    }
}

var cleared = 0
for p in 0..<(w * h) {
    let a = work[p]
    if a < 1 { cleared += 1 }
    let i = p * 4
    // Die Quelle liegt als premultipliedLast vor (Alpha war durchgehend 255,
    // die Kanaele sind also unveraendert). Fuer das Ergebnis muss erneut
    // premultipliziert werden, sonst saeumt Helles dunkle Kanten.
    rgba[i]     = UInt8((Double(rgba[i])     * a).rounded())
    rgba[i + 1] = UInt8((Double(rgba[i + 1]) * a).rounded())
    rgba[i + 2] = UInt8((Double(rgba[i + 2]) * a).rounded())
    rgba[i + 3] = UInt8((a * 255).rounded())
}

guard let out = ctx.makeImage() else {
    FileHandle.standardError.write("Bild konnte nicht erzeugt werden\n".data(using: .utf8)!)
    exit(1)
}
let url = URL(fileURLWithPath: outPath) as CFURL
guard let dest = CGImageDestinationCreateWithURL(url, UTType.png.identifier as CFString, 1, nil) else {
    FileHandle.standardError.write("Ziel nicht schreibbar: \(outPath)\n".data(using: .utf8)!)
    exit(1)
}
CGImageDestinationAddImage(dest, out, nil)
guard CGImageDestinationFinalize(dest) else {
    FileHandle.standardError.write("Schreiben fehlgeschlagen\n".data(using: .utf8)!)
    exit(1)
}

let pct = 100.0 * Double(cleared) / Double(w * h)
print("\(outPath): \(w)x\(h), \(cleared) Pixel freigestellt (\(String(format: "%.1f", pct))%)")
print("  verworfen: \(droppedSpecks) Korn-Flecken (< \(MIN_COMPONENT) Px), \(droppedDim) zu dunkle Bereiche (mittl. Helligkeit < \(Int(MIN_MEAN))), zusammen \(droppedPixels) Pixel")
