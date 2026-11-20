import Link from "next/link";
import { LinkButton } from "@/components/pignon/link-button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buildCallScript } from "@/lib/data";
import { PLANS } from "@/lib/plans";
import type { Business } from "@/lib/types";
import { Bloc, Titre } from "./bloc";

const CONTRASTE: [string, string][] = [
  ["Un nom, un numéro, la mention « pas de site »", "Son site déjà dessiné, à son nom, avec ses horaires"],
  ["La même liste, vendue à tous les abonnés", "Le commerce réservé pour toi pendant 30 jours"],
  ["Aucune idée de qui appeler en premier", "Un score sur 100, et les raisons derrière"],
  ["À toi d'improviser au téléphone", "Le script de l'appel, écrit pour ce commerce"],
];

/** The positioning, shown as what you hold in each case rather than argued. */
export function Contraste() {
  return (
    <Bloc title="Les autres te vendent une liste. Pignon t'amène au rendez-vous.">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th scope="col" className="w-1/2 pr-6 pb-4 text-sm font-normal text-pave">
              Avec une liste de prospects
            </th>
            <th scope="col" className="pb-4 text-sm font-normal text-pave">
              Avec Pignon
            </th>
          </tr>
        </thead>
        <tbody>
          {CONTRASTE.map(([list, pignon]) => (
            <tr key={pignon} className="border-t border-trait align-top">
              <td className="py-5 pr-6 text-base text-pave sm:text-lg lg:text-xl">{list}</td>
              <td className="py-5 text-base font-medium sm:text-lg lg:text-xl">{pignon}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Bloc>
  );
}

/** The call: the first lines as they are said, and the objections the visitor can open. */
export function Appel({ business }: { business: Business }) {
  const script = buildCallScript(business, "Camille");

  return (
    <section className="mx-auto grid max-w-[1240px] gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-20 lg:px-10 lg:py-28">
      <div>
        <Titre
          title="Le script de l'appel est déjà écrit"
          lead="Avec les vrais chiffres du commerce : ses avis, ses voisins, l'état de son site. Tu n'improvises pas, tu parles."
        />
        <ol className="mt-10 flex flex-col gap-7 border-l border-trait-fort pl-6">
          {script.steps.slice(0, 3).map((step) => (
            <li key={step.id}>
              <p className="flex items-baseline gap-2.5 text-sm text-brume">
                {step.title}
                <span className="cote text-2xs text-pave">{step.durationSec} s</span>
              </p>
              <p className="voix mt-1.5 text-lg sm:text-xl">{step.line}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="lg:pt-3">
        <h3 className="titre text-xl">Ce qu&apos;on va te répondre</h3>
        <p className="mt-1.5 text-sm text-brume">Ouvre une objection pour lire la réponse</p>
        <Accordion className="mt-5 border-t border-trait">
          {script.objections.slice(0, 4).map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-trait">
              <AccordionTrigger className="py-4 text-base font-normal hover:no-underline">« {item.objection} »</AccordionTrigger>
              <AccordionContent className="pb-5">
                <p className="voix max-w-[48ch] text-base text-brume">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="cote mt-6 text-ui text-pave">Meilleur créneau pour ce commerce : {script.bestTime.toLowerCase()}</p>
      </div>
    </section>
  );
}

const ETAPES = [
  {
    title: "Scanner",
    text: "Choisis ta ville, ton rayon et tes métiers. Pignon passe la zone au crible et relève les commerces sans site, ou avec un site à l'abandon.",
  },
  {
    title: "Choisir",
    text: "Trie par score, ouvre une fiche : le diagnostic du site, les voisins, la maquette. Réserve les commerces que tu veux appeler.",
  },
  {
    title: "Appeler",
    text: "Suis le script, envoie la maquette par SMS pendant l'appel et propose deux créneaux pour passer la montrer.",
  },
  {
    title: "Signer",
    text: "Le pipeline suit chaque commerce du premier appel à la signature, et te dit chaque matin qui rappeler.",
  },
];

export function Etapes() {
  return (
    <Bloc id="fonctionnement" title="Du scan à la signature, en quatre temps" className="border-t border-trait">
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {ETAPES.map((etape, index) => (
          <li key={etape.title} className="border-t border-craie pt-5">
            <span className="cote text-sm text-pave">0{index + 1}</span>
            <h3 className="titre mt-6 text-2xl">{etape.title}</h3>
            <p className="mt-2.5 text-brume">{etape.text}</p>
          </li>
        ))}
      </ol>
    </Bloc>
  );
}

/** The four plans in one line each. The full comparison lives on /tarifs. */
export function FormulesEnBref() {
  return (
    <div className="border-y border-trait bg-nuit-800">
      <Bloc title="Quatre formules, sans engagement" lead="Commence gratuitement, passe à la suite quand tu signes ton premier site.">
        <ul className="border-t border-trait">
          {PLANS.map((plan) => (
            <li key={plan.id} className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-trait py-5 sm:grid-cols-[10rem_1fr_auto]">
              <h3 className="titre flex items-baseline gap-2.5 text-xl">
                {plan.name}
                {plan.recommended && <span className="text-2xs font-normal text-lumiere-doux">conseillée</span>}
              </h3>
              <p className="col-span-2 row-start-2 text-brume sm:col-span-1 sm:row-start-auto">{plan.audience}</p>
              <p className="cote col-start-2 row-start-1 text-right sm:col-start-3">
                <span className="text-xl font-medium">{plan.price.monthly} €</span>
                <span className="text-ui text-pave"> par mois</span>
              </p>
            </li>
          ))}
        </ul>
        <LinkButton href="/tarifs" variant="outline" size="lg" className="mt-8">
          Comparer les formules
        </LinkButton>
      </Bloc>
    </div>
  );
}

const QUESTIONS = [
  {
    id: "donnees",
    question: "D'où viennent les données ?",
    answer:
      "Du registre public des entreprises, croisé avec une analyse de la présence en ligne de chaque commerce : son site, ses réseaux, sa fiche d'établissement. Dans cette version de démonstration, les commerces sont inventés.",
  },
  {
    id: "commercant",
    question: "Que voit le commerçant quand il ouvre la maquette ?",
    answer:
      "Un site à son nom, coiffé d'un bandeau qui précise que c'est une maquette de démonstration et pas son site officiel. La page n'est jamais indexée par les moteurs de recherche.",
  },
  {
    id: "exclusivite",
    question: "Plusieurs abonnés peuvent-ils appeler le même commerce ?",
    answer:
      "Pas s'il est réservé. À partir de la formule Pro, tu réserves un commerce pour 30 jours et il s'affiche verrouillé chez les autres. La formule Agence ajoute l'exclusivité d'un métier dans une ville.",
  },
  {
    id: "coder",
    question: "Faut-il savoir coder ?",
    answer:
      "Non. Pignon te donne la maquette et le prompt prêt à coller dans ton outil de création. Le site final, tu le construis avec ce que tu utilises déjà.",
  },
  {
    id: "arreter",
    question: "Puis-je arrêter quand je veux ?",
    answer: "Oui. Les formules sont sans engagement, et la formule Découverte reste gratuite.",
  },
];

export function Questions() {
  return (
    <section id="questions" className="mx-auto grid max-w-[1240px] scroll-mt-16 gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-20 lg:px-10 lg:py-28">
      <Titre title="Les questions qu'on nous pose" />
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
    </section>
  );
}

export function DernierAppel({ count, city }: { count: number; city: string }) {
  return (
    <section className="border-t border-trait">
      <div className="mx-auto flex max-w-[1240px] flex-col items-start gap-8 px-4 py-24 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:py-32">
        <div>
          <h2 className="enseigne max-w-[16ch] text-[clamp(2.25rem,5vw,4rem)]">
            <span className="cote text-lumiere">{count}</span> commerces attendent leur site à {city}
          </h2>
          <p className="mt-5 max-w-[48ch] text-lg text-brume">
            La formule Découverte montre toute ta zone et ouvre trois fiches par mois. Pas de carte bancaire.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LinkButton href="/inscription" size="xl">
            Essayer gratuitement
          </LinkButton>
          <Link href="/app" className="rounded-lg px-3 py-2 font-medium underline decoration-trait-fort underline-offset-4 hover:decoration-craie">
            Voir la démo
          </Link>
        </div>
      </div>
    </section>
  );
}
