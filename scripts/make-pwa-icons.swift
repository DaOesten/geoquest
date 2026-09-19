import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Erzeugt die PWA-Icons aus public/assets/geoquest_pwaIcon.jpeg (PROJ-12).
// Einmalig von Hand ausgefuehrt; die PNGs werden eingecheckt.
//
// Gemessen (nicht geschaetzt): Die Pin-Gruppe (Pin + gestrichelte Route + X)
// liegt bei x 90..391, y 276..670. Zwischen ihr und dem Schriftzug liegt eine
// motivfreie Spalte bei x 392..401 — saubere Schnittkante.

let srcPath = CommandLine.arguments[1]
let outDir  = CommandLine.arguments[2]

guard let isrc = CGImageSourceCreateWithURL(URL(fileURLWithPath: srcPath) as CFURL, nil),
      let full = CGImageSourceCreateImageAtIndex(isrc, 0, nil) else {
    FileHandle.standardError.write("Quellbild nicht lesbar\n".data(using:.utf8)!); exit(1)
}

// Motiv-Rechteck mit etwas Luft, damit die Kanten der Route nicht anschneiden.
let mx0 = 90, my0 = 276, mx1 = 391, my1 = 670
let pad = 8
let cropX = mx0 - pad, cropY = my0 - pad
let cropW = (mx1 - mx0 + 1) + 2*pad, cropH = (my1 - my0 + 1) + 2*pad
guard let motif = full.cropping(to: CGRect(x: cropX, y: cropY, width: cropW, height: cropH)) else {
    FileHandle.standardError.write("Zuschnitt fehlgeschlagen\n".data(using:.utf8)!); exit(1)
}

// Gemessen: Der dunkle Grund des Quellbilds liegt im Motivbereich bei
// rgb(4,10,11) — optisch Deep Black, aber dunkler als der Token #0B0F12.
// Die Flaeche bekommt genau diesen Wert, damit an der Zuschnittkante kein
// sichtbares Rechteck entsteht (mit #0B0F12 gemessen: deutliche Bandkante).
let bg = CGColor(red: 4/255.0, green: 10/255.0, blue: 11/255.0, alpha: 1)

/// Zeichnet das Motiv zentriert auf eine quadratische Deep-Black-Flaeche.
/// `coverage` = Anteil der Kantenlaenge, den die laengere Motivseite einnimmt.
func render(size: Int, coverage: CGFloat, to name: String) {
    let cs = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(data: nil, width: size, height: size, bitsPerComponent: 8,
            bytesPerRow: 0, space: cs,
            bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else { return }
    ctx.setFillColor(bg)
    ctx.fill(CGRect(x: 0, y: 0, width: size, height: size))
    ctx.interpolationQuality = .high

    let target = CGFloat(size) * coverage
    let scale = target / CGFloat(max(cropW, cropH))
    let dw = CGFloat(cropW) * scale, dh = CGFloat(cropH) * scale
    ctx.draw(motif, in: CGRect(x: (CGFloat(size)-dw)/2, y: (CGFloat(size)-dh)/2, width: dw, height: dh))

    guard let out = ctx.makeImage() else { return }
    let url = URL(fileURLWithPath: outDir).appendingPathComponent(name) as CFURL
    guard let dest = CGImageDestinationCreateWithURL(url, UTType.png.identifier as CFString, 1, nil) else { return }
    CGImageDestinationAddImage(dest, out, nil)
    CGImageDestinationFinalize(dest)
    print("\(name)  \(size)x\(size)  coverage \(coverage)")
}

// purpose "any": Der Pin fuellt die Flaeche weitgehend aus. Nicht randlos —
// das Motiv ist hochformatig, ein randloses Skalieren wuerde es beschneiden.
render(size: 192, coverage: 0.86, to: "icon-192.png")
render(size: 512, coverage: 0.86, to: "icon-512.png")

// iOS wertet die Manifest-Icons nicht in allen Versionen aus; dieses Icon wird
// per <link rel="apple-touch-icon"> gesetzt. 180px ist Apples Referenzgroesse.
render(size: 180, coverage: 0.86, to: "apple-touch-icon.png")

// purpose "maskable": Android beschneidet zu Kreis oder Squircle. Alles, was
// erhalten bleiben muss, liegt in den inneren 80% — hier bewusst darunter.
render(size: 512, coverage: 0.62, to: "icon-maskable.png")
