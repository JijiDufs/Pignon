import type { SectorId } from "@/lib/types";

export interface MaisonVocab {
  /** Title of the services section, also its label in the navigation */
  services: string;
  /** Caption under the photo placeholder: tells the owner which of their photos goes there */
  photo: string;
}

/** The words that change with the trade, so the page never sounds like a bakery when it is a garage. */
export const VOCAB: Record<SectorId, MaisonVocab> = {
  garage: { services: "À l'atelier", photo: "Votre atelier, en photo" },
  restaurant: { services: "À la carte", photo: "Votre salle, en photo" },
  hairdresser: { services: "Au salon", photo: "Votre salon, en photo" },
  bakery: { services: "Au fournil", photo: "Votre fournil, en photo" },
  plumber: { services: "Nos interventions", photo: "Vos chantiers, en photo" },
  beauty: { services: "Les soins", photo: "Votre institut, en photo" },
  florist: { services: "À la boutique", photo: "Votre boutique, en photo" },
  electrician: { services: "Nos interventions", photo: "Vos chantiers, en photo" },
};

/** "04 78 12 34 56" → "tel:0478123456" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export interface NavLink {
  href: string;
  label: string;
}

export function navLinks(vocab: MaisonVocab): NavLink[] {
  return [
    { href: "#carte", label: vocab.services },
    { href: "#maison", label: "La maison" },
    { href: "#avis", label: "Avis" },
    { href: "#infos", label: "Infos pratiques" },
  ];
}
