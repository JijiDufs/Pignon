import { DEMO_TODAY, type Business, type Heat, type NewRegistration, type SectorId, type SiteStatus, type ZoneStats } from "../types";
import { generateCity } from "./generate";
import { NAME_PATTERNS, PLACES, STREETS, SURNAMES, FEMALE_NAMES, MALE_NAMES } from "./names";
import { createRng } from "./prng";
import { CITIES, getCity, SECTORS } from "./reference";

/**
 * The invented world of the fake MVP: cities, trades, businesses, website copy, call scripts.
 * Everything is deterministic (seeded per city) so every screen and every reload shows the same data.
 */

export { CITIES, DAS, getCity, getDa, getSector, HEAT, heatOf, PIPELINE_STAGES, SECTORS, SITE_STATUS } from "./reference";
export { getMaquetteContent } from "./content";
export { buildCallScript } from "./script";
export { buildPrompt } from "./prompt";

interface ZoneFilter {
  sectors?: SectorId[];
  radiusKm?: number;
}

const cache = new Map<string, Business[]>();

/** Every business of a city, including those whose site is fine. Empty for an unknown city. */
export function getBusinesses(cityId: string): Business[] {
  const cached = cache.get(cityId);
  if (cached) return cached;
  const city = getCity(cityId);
  const businesses = city ? generateCity(city) : [];
  cache.set(cityId, businesses);
  return businesses;
}

function inZone(business: Business, { sectors, radiusKm }: ZoneFilter): boolean {
  if (sectors && !sectors.includes(business.sector)) return false;
  if (radiusKm !== undefined && business.distanceKm > radiusKm) return false;
  return true;
}

/** Businesses worth calling (everything but a correct site), best score first. */
export function getOpportunities(cityId: string, filter: ZoneFilter = {}): Business[] {
  return getBusinesses(cityId)
    .filter((business) => business.site.status !== "ok" && inZone(business, filter))
    .sort((a, b) => b.score - a.score);
}

/** Ids look like "villeurbanne-12". */
export function getBusiness(id: string): Business | undefined {
  const cityId = id.slice(0, id.lastIndexOf("-"));
  return getBusinesses(cityId).find((business) => business.id === id);
}

/** Slugs end with the city id: "garage-ferreira-villeurbanne". */
export function getBusinessBySlug(slug: string): Business | undefined {
  const city = CITIES.find((item) => slug.endsWith(`-${item.id}`));
  return city ? getBusinesses(city.id).find((business) => business.slug === slug) : undefined;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Search by name, street or trade, across every city. Accent and case insensitive. */
export function searchBusinesses(query: string, limit = 12): Business[] {
  const needle = normalize(query.trim());
  if (!needle) return [];
  const results: Business[] = [];
  for (const city of CITIES) {
    for (const business of getBusinesses(city.id)) {
      const sector = SECTORS.find((item) => item.id === business.sector);
      const haystack = normalize(`${business.name} ${business.address.street} ${sector?.label ?? ""} ${city.name}`);
      if (haystack.includes(needle)) results.push(business);
      if (results.length >= limit) return results;
    }
  }
  return results;
}

/** The numbers of a zone: what was scanned, what is worth calling, what it could bring in. */
export function getZoneStats(cityId: string, filter: ZoneFilter = {}): ZoneStats {
  const byStatus: Record<SiteStatus, number> = {
    none: 0,
    "social-only": 0,
    dead: 0,
    insecure: 0,
    "not-mobile": 0,
    outdated: 0,
    ok: 0,
  };
  const byHeat: Record<Heat, number> = { hot: 0, warm: 0, mild: 0, cold: 0 };
  const bySector: Partial<Record<SectorId, number>> = {};
  let scanned = 0;
  let opportunities = 0;
  let potentialRevenue = 0;

  for (const business of getBusinesses(cityId)) {
    if (!inZone(business, filter)) continue;
    scanned++;
    byStatus[business.site.status]++;
    if (business.site.status === "ok") continue;
    opportunities++;
    byHeat[business.heat]++;
    bySector[business.sector] = (bySector[business.sector] ?? 0) + 1;
    potentialRevenue += business.estimatedDeal;
  }

  return { scanned, opportunities, byStatus, byHeat, bySector, potentialRevenue };
}

const DAY = 86_400_000;
const LEGAL_FORMS = ["SAS", "SARL", "EURL", "Entreprise individuelle", "SASU"];
const registrations = new Map<string, NewRegistration[]>();

/** The 12 latest company registrations of the last 30 days in a city, newest first. */
export function getNewRegistrations(cityId: string): NewRegistration[] {
  const cached = registrations.get(cityId);
  if (cached) return cached;

  const today = new Date(DEMO_TODAY).getTime();
  const rng = createRng(`registrations:${cityId}`);

  // Freshly registered businesses of the generated set come first: they have a sheet to open.
  const known: NewRegistration[] = getBusinesses(cityId)
    .filter((business) => business.isNew && today - new Date(business.registeredAt).getTime() <= 30 * DAY)
    .map((business) => ({
      id: `reg-${business.id}`,
      cityId,
      name: business.name,
      sector: business.sector,
      street: business.address.street,
      registeredAt: business.registeredAt,
      legalForm: rng.pick(LEGAL_FORMS),
      businessId: business.id,
    }));

  const others: NewRegistration[] = [];
  for (let i = 0; known.length + others.length < 12; i++) {
    const sector = rng.pick(SECTORS).id;
    const name = rng.pick(NAME_PATTERNS[sector])({
      first: rng.pick(rng.chance(0.5) ? FEMALE_NAMES : MALE_NAMES),
      last: rng.pick(SURNAMES),
      place: rng.pick(PLACES),
    });
    others.push({
      id: `reg-${cityId}-${i + 1}`,
      cityId,
      name,
      sector,
      street: `${rng.int(1, 180)} ${rng.pick(STREETS)}`,
      registeredAt: new Date(today - rng.int(1, 29) * DAY).toISOString().slice(0, 10),
      legalForm: rng.pick(LEGAL_FORMS),
    });
  }

  const list = [...known, ...others].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  registrations.set(cityId, list);
  return list;
}
