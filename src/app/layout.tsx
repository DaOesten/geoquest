import type { Metadata, Viewport } from "next";
import { Anton, Orbitron, Rubik } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
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
        {/* Reichweitenmessung ohne Cookies und ohne Geräte-Kennung — lädt nur in
            Produktion. Siehe /datenschutz; wird das hier entfernt oder gegen ein
            anderes Werkzeug getauscht, muss der Text dort mitgezogen werden. */}
        <Analytics />
      </body>
    </html>
  );
}
