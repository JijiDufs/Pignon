import type { Metadata } from "next";
import "./maquette.css";

// Mockups must never be indexed: they show a real-looking site for a business that did not order it.
export const metadata: Metadata = {
  title: "Maquette de site",
  robots: { index: false, follow: false },
};

export default function MaquetteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
