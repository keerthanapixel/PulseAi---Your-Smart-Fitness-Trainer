import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PULSE AI — Unified Fitness Intelligence",
  description: "Modern dark-mode fitness ecosystem featuring zero-latency client-side MediaPipe Pose tracking, Virtual Gym Buddy, AI Dietician, and Gym Recommender.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PULSE AI",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#060608",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-obsidian-950 text-slate-100 min-h-screen selection:bg-brand-emerald selection:text-obsidian-950 antialiased">
        {children}
      </body>
    </html>
  );
}
