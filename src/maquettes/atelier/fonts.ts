import { Barlow, Barlow_Condensed } from "next/font/google";

export const atelierDisplay = Barlow_Condensed({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-atl-display",
});

export const atelierText = Barlow({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-atl-text",
});
