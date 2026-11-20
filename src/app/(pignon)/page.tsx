import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { PreuveMaquette } from "@/components/landing/preuve-maquette";
import { PreuveReservation } from "@/components/landing/preuve-reservation";
import { PreuveScore } from "@/components/landing/preuve-score";
import { Appel, Contraste, DernierAppel, Etapes, FormulesEnBref, Questions } from "@/components/landing/sections";
import { getReservables, getScored, getVedette } from "@/components/landing/vedette";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getCity, getZoneStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pignon, les commerces sans site de ta ville et leur maquette déjà prête",
  description:
    "Pignon scanne ta ville, repère les commerces sans site, prépare leur maquette et t'écrit le script de l'appel. Pour ceux qui vendent des sites web.",
};

export default function AccueilPage() {
  // One business is followed down the page, from its mockup to the call.
  const vedette = getVedette();

  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Contraste />
        <PreuveMaquette business={vedette} />
        <PreuveReservation businesses={getReservables()} />
        <PreuveScore businesses={getScored()} />
        <Appel business={vedette} />
        <Etapes />
        <FormulesEnBref />
        <Questions />
        <DernierAppel count={getZoneStats("lille").opportunities} city={getCity("lille")?.name ?? "Lille"} />
      </main>
      <SiteFooter />
    </>
  );
}
