import type { Metadata } from "next";
import { DernierAppel } from "@/components/landing/sections";
import { Comparison } from "@/components/pricing/comparison";
import { TarifsOffre } from "@/components/pricing/tarifs-offre";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCity, getZoneStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tarifs de Pignon : Découverte, Solo, Pro, Agence",
  description: "Quatre formules sans engagement, de 0 à 199 € par mois. Un site signé paie l'abonnement pour des mois : fais le calcul.",
};

const QUESTIONS = [
  {
    id: "changer",
    question: "Puis-je changer de formule en cours de mois ?",
    answer: "Oui, à tout moment depuis la page Abonnement. La nouvelle formule s'applique tout de suite.",
  },
  {
    id: "arreter",
    question: "Comment arrêter ?",
    answer: "En un clic, depuis la page Abonnement. Tu repasses sur Découverte, gratuite, et tu gardes ton compte.",
  },
  {
    id: "maquettes",
    question: "Que deviennent mes maquettes si j'arrête ?",
    answer:
      "Les maquettes en ligne restent accessibles tant que l'abonnement est actif. Si tu repasses sur Découverte, leurs liens sont dépubliés et tes réservations sont libérées.",
  },
  {
    id: "facture",
    question: "Est-ce que je reçois une facture ?",
    answer: "Oui, une facture à chaque échéance, à télécharger depuis la page Abonnement.",
  },
  {
    id: "paiement",
    question: "Quels sont les moyens de paiement ?",
    answer:
      "La carte bancaire. Dans cette version de démonstration, aucun paiement n'est effectué : les formules s'activent sans carte.",
  },
];

export default function TarifsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <TarifsOffre />

        <section className="mx-auto max-w-[1240px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <h2 className="enseigne max-w-[20ch] text-[clamp(2rem,4vw,3.125rem)]">Le détail, ligne par ligne</h2>
          <Comparison className="mt-6" />
        </section>

        <section className="border-t border-trait">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20 lg:px-10 lg:py-28">
            <h2 className="enseigne max-w-[14ch] text-[clamp(2rem,4vw,3.125rem)]">Facturation, changement, arrêt</h2>
            <Accordion className="border-t border-trait">
              {QUESTIONS.map((item) => (
                <AccordionItem key={item.id} value={item.id} className="border-trait">
                  <AccordionTrigger className="py-5 text-lg font-medium hover:no-underline">{item.question}</AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="max-w-[60ch] text-base text-brume">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <DernierAppel count={getZoneStats("lille").opportunities} city={getCity("lille")?.name ?? "Lille"} />
      </main>
      <SiteFooter />
    </>
  );
}
