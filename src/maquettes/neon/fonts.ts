import { Sora, Unbounded } from "next/font/google";

export const unbounded = Unbounded({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-unbounded",
});

export const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-sora",
});
