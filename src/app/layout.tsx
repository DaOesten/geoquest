import type { Metadata, Viewport } from "next";
import { Anton, Orbitron, Rubik } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

/**
 * Schriften werden zur Build-Zeit heruntergeladen und von der eigenen Domain
 * ausgeliefert — es geht zur Laufzeit KEINE Anfrage an Google, und damit auch
 * keine Besucher-IP. Vorher lud `globals.css` sie per @import direkt von
 * fonts.googleapis.com; siehe /datenschutz, das diese Drittübertragung nicht
 * auswies.
 *
 * Gewichte bewusst auf die tatsächlich genutzten begrenzt (400–700).
 */
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
  fallback: ["Bebas Neue", "Impact", "sans-serif"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-tech",
  fallback: ["Rubik", "sans-serif"],
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-body",
  fallback: ["Helvetica Neue", "sans-serif"],
});

export const metadata: Metadata = {
  // Needed so per-page Open Graph images resolve to absolute URLs when shared.
  // Vercel injects VERCEL_PROJECT_PRODUCTION_URL; falls back to localhost in dev.
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"
  ),
  title: "Geo Quest",
  description:
    "Erstelle und spiele GPS-basierte Schnitzeljagden. Navigiere. Entdecke. Löse.",

  /**
   * Eigener `apple-touch-icon` neben den Manifest-Icons (PROJ-12).
   *
   * iOS wertet die Icon-Liste des Manifests nicht in allen Versionen aus. Ohne
   * dieses Icon legt Safari einen Screenshot der Seite auf den Homescreen —
   * zwischen echten App-Icons sofort als Fremdkörper erkennbar.
   *
   * `<link rel="manifest">` setzt Next.js selbst, sobald `app/manifest.ts`
   * existiert; es gehört deshalb nicht hierher.
   */
  appleWebApp: {
    capable: true,
    title: "Geo Quest",
    // Deep Black hinter der Statusleiste, passend zu `themeColor` unten.
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      data-theme="dark"
      className={`${anton.variable} ${orbitron.variable} ${rubik.variable}`}
    >
      <body className="min-h-dvh">
        {children}
        <Toaster />
        {/* Meldet den Service Worker an — die Bedingung dafuer, dass Chrome auf
            Android einen Installationsweg anbietet (PROJ-12). Er cacht nichts
            ausser der Offline-Fallback-Seite. */}
        <ServiceWorkerRegistration />
        {/* Reichweitenmessung ohne Cookies und ohne Geräte-Kennung — lädt nur in
            Produktion. Siehe /datenschutz; wird das hier entfernt oder gegen ein
            anderes Werkzeug getauscht, muss der Text dort mitgezogen werden. */}
        <Analytics />
      </body>
    </html>
  );
}
