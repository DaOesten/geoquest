import type { Metadata, Viewport } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

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
    <html lang="de" data-theme="dark">
      <body className="min-h-dvh">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
