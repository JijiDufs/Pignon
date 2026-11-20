import {
  Brush,
  CakeSlice,
  ChefHat,
  Cog,
  Croissant,
  Droplets,
  Flower,
  Flower2,
  Gauge,
  Hand,
  Lightbulb,
  Plug,
  Scissors,
  ShowerHead,
  Sparkles,
  SprayCan,
  Sprout,
  UtensilsCrossed,
  Wheat,
  Wine,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { SectorId } from "@/lib/types";

/** Three emblems per trade, used by every art direction where a real site would show photos. */
export const SECTOR_ART: Record<SectorId, [LucideIcon, LucideIcon, LucideIcon]> = {
  garage: [Wrench, Cog, Gauge],
  restaurant: [UtensilsCrossed, ChefHat, Wine],
  hairdresser: [Scissors, SprayCan, Brush],
  bakery: [Croissant, Wheat, CakeSlice],
  plumber: [ShowerHead, Wrench, Droplets],
  beauty: [Sparkles, Flower, Hand],
  florist: [Flower2, Sprout, Scissors],
  electrician: [Zap, Plug, Lightbulb],
};

/** Caption of the place where the shop's own photo will go. */
export const PHOTO_CAPTION: Record<SectorId, string> = {
  garage: "Votre atelier, en photo",
  restaurant: "Votre salle, en photo",
  hairdresser: "Votre salon, en photo",
  bakery: "Votre fournil, en photo",
  plumber: "Vos chantiers, en photo",
  beauty: "Votre institut, en photo",
  florist: "Votre boutique, en photo",
  electrician: "Vos chantiers, en photo",
};

/** Heading of the services section, in the words of the trade. */
export const SERVICES_TITLE: Record<SectorId, string> = {
  garage: "Prestations et tarifs",
  restaurant: "La carte et les menus",
  hairdresser: "Prestations et tarifs",
  bakery: "Du fournil à la vitrine",
  plumber: "Prestations et tarifs",
  beauty: "Soins et tarifs",
  florist: "Bouquets et services",
  electrician: "Prestations et tarifs",
};

export const SECTIONS = [
  { href: "#prestations", label: "Prestations" },
  { href: "#atouts", label: "Points forts" },
  { href: "#a-propos", label: "À propos" },
  { href: "#avis", label: "Avis" },
  { href: "#infos", label: "Horaires et accès" },
];

/** "04 65 71 12 34" → "tel:+33465711234" */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:${digits.startsWith("0") ? `+33${digits.slice(1)}` : digits}`;
}

/** 4.7 → "4,7" */
export function note(rating: number): string {
  return rating.toFixed(1).replace(".", ",");
}

/** The contact form of every mockup: looks real, sends nothing, says so. */
export function DemoForm({ className, fieldClassName, buttonClassName }: { className?: string; fieldClassName?: string; buttonClassName?: string }) {
  return (
    <form className={className} aria-label="Formulaire de contact (démonstration)">
      <label style={{ display: "block" }}>
        <span>Votre nom</span>
        <input type="text" name="nom" autoComplete="off" className={fieldClassName} disabled />
      </label>
      <label style={{ display: "block" }}>
        <span>Votre téléphone</span>
        <input type="tel" name="telephone" autoComplete="off" className={fieldClassName} disabled />
      </label>
      <label style={{ display: "block" }}>
        <span>Votre message</span>
        <textarea name="message" rows={3} className={fieldClassName} disabled />
      </label>
      <button type="button" disabled className={buttonClassName}>
        Formulaire de démonstration
      </button>
    </form>
  );
}
