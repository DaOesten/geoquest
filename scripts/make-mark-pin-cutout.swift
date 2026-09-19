import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Stellt das Pin-Motiv aus public/assets/mark-pin.jpg frei (PROJ-3, Refinement
// 2026-09-19). Ergebnis: public/assets/mark-pin.png mit Alpha-Kanal.
//
// Warum ueberhaupt: mark-pin.jpg ist ein JPEG und hat damit keinen Alpha-Kanal —
// es bringt seinen eigenen dunklen Grund mit. Auf dem Gratulations- und dem
// Outro-Screen steht dieser Grund auf dem App-Hintergrund und zeichnet sich als
// Rechteck ab.
//
// Gemessen (nicht geschaetzt), 546x558 Quellbild:
//   - Der Grund ist NICHT flach, sondern ein Verlauf: mittlere Luminanz 42.8
//     oben links gegen 24.9 unten rechts. Deshalb kann keine feste Farbe ihn
//     treffen — die Differenz zum Token-Hintergrund #0B0F12 (Luminanz 14.2)
//     bleibt immer sichtbar. Freistellen ist der einzige Weg.
//   - Das Luminanz-Histogramm hat ein Tal bei 96..127 (nur 1.3% aller Pixel).
//     Darunter liegt der Grund (16..79, ~78%), darueber das Motiv (128..223,
//     ~19%). Dieses Tal ist die Trennlinie.
//
// Zwei Fallstricke, die eine einfache Schwelle nicht loest:
//
//  1. Die dunkle Kreisflaeche in der Pin-Mitte und der dunkelgruene Schatten
//     sind selbst dunkel — eine reine Luminanzschwelle stanzt ein Loch mitten
//     durch den Pin. Loesung: Flood-Fill vom Bildrand. Nur Dunkel, das vom Rand
//     aus erreichbar ist, ist Hintergrund; eingeschlossenes Dunkel ist Motiv.
//
//  2. Die Lime-Elemente haben einen Neon-Glow, der weich in den Grund laeuft.
//     Eine harte Schwelle schneidet ihn zu einem gezackten Halo ab. Loesung:
//     Alpha als Rampe ueber das Histogramm-Tal statt als Ja/Nein — der Glow
//     wird zu Teil-Alpha und laeuft auf jedem Hintergrund sauber aus.
//
// Aufruf: swift scripts/make-mark-pin-cutout.swift public/assets/mark-pin.jpg public/assets/mark-pin.png

let srcPath = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "public/assets/mark-pin.jpg"
let outPath = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : "public/assets/mark-pin.png"

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
// oberhalb HI sicher Motiv, dazwischen linear — das haelt den Neon-Glow weich.
let LO = 74.0, HI = 124.0

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
// Kreisflaeche in der Pin-Mitte, der Schatten — bleibt unangetastet opak.
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

// Motiv-Pixel werden voll opak; nur am Rand erreichbares Dunkel wird
// transparent — dort traegt die Rampe den weichen Auslauf des Glows.
var cleared = 0
for p in 0..<(w * h) {
    let a = isBackground[p] ? alpha[p] : 1.0
    if a < 1 { cleared += 1 }
    let i = p * 4
    // Die Quelle liegt als premultipliedLast vor (Alpha war durchgehend 255,
    // die Kanaele sind also unveraendert). Fuer das Ergebnis muss erneut
    // premultipliziert werden, sonst saeumt der helle Glow dunkle Kanten.
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
