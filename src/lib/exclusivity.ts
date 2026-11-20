import { DEMO_TODAY, type SectorId } from "./types";

/**
 * The demo of exclusivity: with no backend there are no other subscribers, so a fixed share of
 * businesses and territories is declared "already taken by someone else", deterministically.
 */

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Non-null when another subscriber has reserved this business. `until` is an ISO date. */
export function takenByOthers(businessId: string): { until: string } | null {
  const h = hash(businessId);
  if (h % 11 !== 0) return null;
  const until = new Date(DEMO_TODAY);
  until.setDate(until.getDate() + 4 + (h % 23));
  return { until: until.toISOString() };
}

const AGENCIES = ["Studio Lumen", "Agence Bellecour", "Atelier Numérique 69", "Pixel & Pavés"];

/** Key of a territory: one trade in one city. */
export function territoryKey(cityId: string, sector: SectorId): string {
  return `${cityId}:${sector}`;
}

/** Non-null when another agency already holds the exclusivity of this trade in this city. */
export function territoryTakenBy(cityId: string, sector: SectorId): { agency: string } | null {
  const h = hash(territoryKey(cityId, sector));
  if (h % 5 !== 0) return null;
  return { agency: AGENCIES[h % AGENCIES.length] };
}
