import type { SectorId } from "@/lib/types";

/** The few words that change with the trade. Everything else comes from MaquetteContent. */
interface Wording {
  /** Heading of the services section */
  services: string;
  /** Its short form, for the menu */
  servicesNav: string;
  /** Caption of the tool board, where the shop's own photo will go */
  photo: string;
}

export const WORDING: Record<SectorId, Wording> = {
  garage: { services: "Prestations et tarifs", servicesNav: "Prestations", photo: "Votre atelier, en photo" },
  restaurant: { services: "La carte et les menus", servicesNav: "La carte", photo: "Votre salle, en photo" },
  hairdresser: { services: "Prestations et tarifs", servicesNav: "Prestations", photo: "Votre salon, en photo" },
  bakery: { services: "Du fournil à la vitrine", servicesNav: "Spécialités", photo: "Votre fournil, en photo" },
  plumber: { services: "Prestations et tarifs", servicesNav: "Prestations", photo: "Vos chantiers, en photo" },
  beauty: { services: "Soins et tarifs", servicesNav: "Soins", photo: "Votre institut, en photo" },
  florist: { services: "Bouquets et services", servicesNav: "Bouquets", photo: "Votre boutique, en photo" },
  electrician: { services: "Prestations et tarifs", servicesNav: "Prestations", photo: "Vos chantiers, en photo" },
};

export function navItems(sector: SectorId): { href: string; label: string }[] {
  return [
    { href: "#prestations", label: WORDING[sector].servicesNav },
    { href: "#atouts", label: "Points forts" },
    { href: "#a-propos", label: "À propos" },
    { href: "#avis", label: "Avis" },
    { href: "#infos", label: "Horaires et accès" },
  ];
}

/** "04 65 71 12 34" → "tel:+33465711234" */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:${digits.startsWith("0") ? `+33${digits.slice(1)}` : digits}`;
}

/**
 * Isolates the amount of a price so the board can set it in large figures:
 * "à partir de 15 € par pneu" → { before: "à partir de", amount: "15 €", after: "par pneu" }.
 * Returns null when there is no amount ("sur devis").
 */
export function splitPrice(price: string): { before: string; amount: string; after: string } | null {
  const match = /^(.*?)(\d[\d\s,]*(?:à\s*\d[\d\s,]*)?€)(.*)$/.exec(price);
  if (!match) return null;
  return { before: match[1].trim(), amount: match[2].replace(/\s+/g, " "), after: match[3].trim() };
}
