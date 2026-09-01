import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./launch-splash.css";
import PWARegister from "./pwa-register";
import LaunchSplash from "./launch-splash";
import BetaMonitor from "./beta-monitor";

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
    icon: "/icon.svg?v=original-1",
    apple: "/icon.svg?v=original-1",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#08111f" },
  ],
  colorScheme: "light dark",
  viewportFit: "cover",
};

const themeScript = `
(function(){
  try {
    var saved = localStorage.getItem('adv-theme');
    var theme = saved === 'light' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch(e) {
    document.documentElement.dataset.theme = 'dark';
  }
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <PWARegister />
        <LaunchSplash />
        <BetaMonitor />
        {children}
      </body>
    </html>
  );
}
