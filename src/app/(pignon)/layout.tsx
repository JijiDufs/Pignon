import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/pignon/providers";
import "./globals.css";

// One family for the whole interface, and its mono partner for figures and dimensions.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Pignon, le radar à clients de ceux qui créent des sites web",
    template: "%s | Pignon",
  },
  description:
    "Pignon repère les commerces sans site web autour de toi, prépare leur maquette et t'aide à décrocher le rendez-vous.",
  // A prototype with invented businesses and simulated plans must not show up in search results.
  // Remove when the real product launches.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
