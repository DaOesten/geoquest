import AVFoundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

// Zieht das Poster-Bild fuer das Erklaervideo auf /about aus dem Video selbst
// (PROJ-13, Refinement 10). Aufruf aus dem Projektwurzelverzeichnis:
//
//   swift scripts/make-video-poster.swift
//
// Warum ein eigenes Poster: Das Video beginnt mit einem schwarzen Frame. Mit
// `preload="none"` zeigt der Browser vor dem Klick sonst eine leere Flaeche.
//
// Warum 39 s: der GPS-Pfeil mit Live-Entfernung ("03 Spielen"). Die Titelkarte
// (~9 s) und der Einstieg ("Die reale Welt wird zum ...", ~3 s) doppeln Logo
// und Headline, die direkt darueber im Hero stehen.

let source = "public/assets/video-geoquest-4x5-game-web.mp4"
let target = "public/assets/video-geoquest-4x5-game-poster.jpg"
let seconds = 39.0

let generator = AVAssetImageGenerator(asset: AVURLAsset(url: URL(fileURLWithPath: source)))
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero

let semaphore = DispatchSemaphore(value: 0)
generator.generateCGImageAsynchronously(for: CMTime(seconds: seconds, preferredTimescale: 600)) { image, _, error in
  guard let image else { fatalError("Frame nicht lesbar: \(String(describing: error))") }
  let url = URL(fileURLWithPath: target) as CFURL
  guard let dest = CGImageDestinationCreateWithURL(url, UTType.jpeg.identifier as CFString, 1, nil) else {
    fatalError("Ziel nicht schreibbar: \(target)")
  }
  CGImageDestinationAddImage(dest, image, [kCGImageDestinationLossyCompressionQuality: 0.82] as CFDictionary)
  guard CGImageDestinationFinalize(dest) else { fatalError("Schreiben fehlgeschlagen") }
  print("\(target): \(image.width)x\(image.height)")
  semaphore.signal()
}
semaphore.wait()
