import {
  Croissant,
  Flower2,
  Scissors,
  ShowerHead,
  Sparkles,
  UtensilsCrossed,
  Wrench,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { SectorId } from "@/lib/types";

const ICONS: Record<SectorId, LucideIcon> = {
  garage: Wrench,
  restaurant: UtensilsCrossed,
  hairdresser: Scissors,
  bakery: Croissant,
  plumber: ShowerHead,
  beauty: Sparkles,
  florist: Flower2,
  electrician: Zap,
};

/** The icon of a trade. Decorative by default: pair it with the trade's label. */
export function SectorIcon({ sector, ...props }: { sector: SectorId } & LucideProps) {
  const Icon = ICONS[sector];
  return <Icon aria-hidden="true" {...props} />;
}
