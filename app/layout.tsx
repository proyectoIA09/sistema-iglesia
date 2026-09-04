import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegistrarServiceWorker from "@/components/RegistrarServiceWorker";

export const metadata: Metadata = {
  title: "Sistema de Iglesia",
  description: "Control de finanzas, células y reportes de iglesia",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sistema de Iglesia",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#16233f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <RegistrarServiceWorker />
        {children}
      </body>
    </html>
  );
}
