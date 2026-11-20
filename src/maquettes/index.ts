import type { DaId } from "@/lib/types";
import Atelier from "./atelier";
import Clair from "./clair";
import Maison from "./maison";
import Neon from "./neon";
import type { MaquetteTemplate } from "./types";

export const TEMPLATES: Record<DaId, MaquetteTemplate> = {
  atelier: Atelier,
  clair: Clair,
  maison: Maison,
  neon: Neon,
};

export function isDaId(value: unknown): value is DaId {
  return typeof value === "string" && value in TEMPLATES;
}
