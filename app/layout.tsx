import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "./pwa-register";

export const metadata: Metadata = {
  title: "ADV Simples",
  description: "Você advoga. A gente organiza.",
  manifest: "/manifest.webmanifest",
  applicationName: "ADV Simples",
  appleWebApp: {
    capable: true,
    title: "ADV Simples",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#08111f",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
