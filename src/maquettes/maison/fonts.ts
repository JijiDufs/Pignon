import { Fraunces, Karla } from "next/font/google";

// SOFT rounds the serifs and WONK brings the leaning italics: together they give the hand-painted sign feel.
export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
});

export const karla = Karla({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
  variable: "--font-karla",
});
