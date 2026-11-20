import { DEMO_TODAY, type Business, type City, type Competitor, type ScoreReason, type SectorId, type SiteStatus } from "../types";
import { FEMALE_NAMES, HOURS, MALE_NAMES, NAME_PATTERNS, PLACES, STREETS, SURNAMES } from "./names";
import { createRng } from "./prng";
import { FICTION_PHONE_PREFIX, getSector, heatOf, RECOMMENDED_DAS, SITE_STATUS } from "./reference";
import { buildSite, frDecimal, pickStatus } from "./site";

/** How many businesses of each trade a city gets (80 in all). */
const QUOTA: [SectorId, number][] = [
  ["garage", 14],
  ["restaurant", 14],
  ["hairdresser", 12],
  ["bakery", 10],
  ["plumber", 8],
  ["beauty", 8],
  ["florist", 7],
  ["electrician", 7],
];

const STAFF = ["Aucun salarié", "1 à 2 salariés", "3 à 5 salariés", "6 à 9 salariés"];
const DAY = 86_400_000;
const TODAY = new Date(DEMO_TODAY).getTime();
const RADIUS_KM = 4;

const SITE_POINTS: Record<SiteStatus, number> = {
  none: 44,
  dead: 42,
  "social-only": 34,
  insecure: 30,
  "not-mobile": 30,
  outdated: 26,
  ok: 0,
};

/** Statuses that still count as "has a website" when comparing neighbours. */
const HAS_SITE: SiteStatus[] = ["ok", "outdated", "insecure", "not-mobile"];

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function euros(value: number): string {
  return `${value.toLocaleString("fr-FR")} €`;
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = (a.lat - b.lat) * 110.574;
  const dLng = (a.lng - b.lng) * 111.32 * Math.cos((a.lat * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

type Draft = Omit<Business, "competitors" | "score" | "heat" | "reasons" | "estimatedDeal"> & { staffIndex: number };

function siteDetail(draft: Draft): string {
  const { site } = draft;
  switch (site.status) {
    case "none":
      return "En ligne, ce commerce n'existe que dans les annuaires.";
    case "social-only":
      return "Une page Facebook lui sert de site, et elle ne ressort presque jamais dans une recherche.";
    case "dead":
      return site.platform === "business.site"
        ? "Son lien business.site ne fonctionne plus depuis la fermeture du service en 2024."
        : "Son nom de domaine a expiré : l'adresse affichée partout mène à une erreur.";
    case "insecure":
      return "Le navigateur affiche « Non sécurisé » dès l'arrivée sur son site.";
    case "not-mobile":
      return "Son site est illisible sur un téléphone, là où ses clients le cherchent.";
    case "outdated":
      return `Son site est figé depuis ${site.copyrightYear}.`;
    case "ok":
      return SITE_STATUS.ok.description;
  }
}

function buildReasons(draft: Draft, competitors: Competitor[]): ScoreReason[] {
  const sector = getSector(draft.sector);
  const status = draft.site.status;
  const withSite = competitors.filter((competitor) => competitor.hasSite).length;
  const reasons: ScoreReason[] = [];

  if (status !== "ok") {
    reasons.push({ id: "site", kind: "site", label: SITE_STATUS[status].label, detail: siteDetail(draft), points: SITE_POINTS[status] });
  }

  const activity = Math.round(
    Math.min(24, (Math.min(draft.reviewCount, 150) / 150) * 15 + (Math.max(0, draft.rating - 3.6) / 1.3) * 9),
  );
  if (activity > 0) {
    const facts = `${draft.reviewCount} avis à ${frDecimal(draft.rating)} de moyenne`;
    reasons.push({
      id: "activity",
      kind: "activity",
      label: `${draft.reviewCount} avis, note de ${frDecimal(draft.rating)}`,
      detail:
        activity >= 14
          ? `${facts} : l'activité est là, il manque la vitrine.`
          : `${facts} : une clientèle fidèle, encore peu visible en ligne.`,
      points: activity,
    });
  }

  reasons.push({
    id: "competition",
    kind: "competition",
    label:
      withSite === 0
        ? "Aucun voisin n'a de site"
        : withSite === 1
          ? "1 voisin sur 3 a un site"
          : `${withSite} voisins sur 3 ont un site`,
    detail:
      withSite >= 2
        ? `${withSite} de ses 3 concurrents les plus proches ont un site : c'est eux qu'on trouve en premier.`
        : withSite === 1
          ? "Un seul de ses 3 concurrents proches a un site : il reste une place à prendre."
          : "Aucun de ses concurrents proches n'a de site : le premier qui en ouvre un prend toute la place.",
    points: [3, 8, 13, 18][withSite],
  });

  if (draft.isNew) {
    const months = Math.max(1, Math.round((TODAY - new Date(draft.registeredAt).getTime()) / (30.4 * DAY)));
    reasons.push({
      id: "urgency",
      kind: "urgency",
      label: "Entreprise toute récente",
      detail: `Créée il y a ${months} mois : c'est maintenant qu'elle choisit ses outils et ses prestataires.`,
      points: 14,
    });
  }

  if (draft.site.paysSubscription) {
    reasons.push({
      id: "subscription",
      kind: "budget",
      label: "Paie déjà un abonnement",
      detail: "Son site actuel lui coûte un abonnement mensuel : le budget existe déjà.",
      points: 4,
    });
  }

  const budget = Math.round(Math.max(0, Math.min(8, ((sector.averageDeal - 1000) / 800) * 5 + draft.staffIndex * 1.2)));
  if (budget >= 2) {
    reasons.push({
      id: "budget",
      kind: "budget",
      label: "Métier à bon panier",
      detail: `Dans ce métier, un site vitrine se vend autour de ${euros(sector.averageDeal)}.`,
      points: budget,
    });
  }

  // A decent site is not an opportunity, whatever the rest says.
  const weighted =
    status === "ok" ? reasons.map((reason) => ({ ...reason, points: Math.round(reason.points * 0.45) })) : reasons;
  const kept = weighted.filter((reason) => reason.points > 0).sort((a, b) => b.points - a.points);

  // Cap the total at 100 by trimming the weakest reasons first.
  let total = kept.reduce((sum, reason) => sum + reason.points, 0);
  for (let i = kept.length - 1; i >= 0 && total > 100; i--) {
    const cut = Math.min(kept[i].points - 1, total - 100);
    kept[i] = { ...kept[i], points: kept[i].points - cut };
    total -= cut;
  }
  return kept;
}

/** Every business of a city, in a fixed order. Same city, same result, always. */
export function generateCity(city: City): Business[] {
  const rng = createRng(`pignon:${city.id}`);
  const prefix = FICTION_PHONE_PREFIX[city.id] ?? "01 99 00";
  const usedNames = new Set<string>();
  const drafts: Draft[] = [];

  for (const [sectorId, count] of QUOTA) {
    for (let i = 0; i < count; i++) {
      const female = rng.chance(sectorId === "beauty" || sectorId === "florist" ? 0.8 : 0.35);
      let firstName = rng.pick(female ? FEMALE_NAMES : MALE_NAMES);
      let lastName = rng.pick(SURNAMES);
      let name = "";
      for (let attempt = 0; attempt < 12; attempt++) {
        name = rng.pick(NAME_PATTERNS[sectorId])({ first: firstName, last: lastName, place: rng.pick(PLACES) });
        if (!usedNames.has(name)) break;
        firstName = rng.pick(female ? FEMALE_NAMES : MALE_NAMES);
        lastName = rng.pick(SURNAMES);
      }
      if (usedNames.has(name)) name = `${name} ${city.name}`;
      usedNames.add(name);

      const distance = 0.25 + (RADIUS_KM - 0.25) * Math.pow(rng.next(), 0.85);
      const bearing = rng.next() * 360;
      const angle = (bearing * Math.PI) / 180;
      const coords = {
        lat: city.lat + (distance * Math.cos(angle)) / 110.574,
        lng: city.lng + (distance * Math.sin(angle)) / (111.32 * Math.cos((city.lat * Math.PI) / 180)),
      };

      const isNew = rng.chance(0.08);
      const registered = isNew
        ? TODAY - rng.int(12, 170) * DAY
        : Date.UTC(rng.int(1995, 2024), rng.int(0, 11), rng.int(1, 28));
      const staffIndex = isNew ? rng.int(0, 1) : rng.int(0, 3);
      const status = pickStatus(rng, isNew);
      const handle = slugify(name);
      const index = drafts.length + 1;

      drafts.push({
        id: `${city.id}-${index}`,
        slug: `${handle}-${city.id}`,
        cityId: city.id,
        name,
        sector: sectorId,
        owner: { civility: female ? "Mme" : "M.", firstName, lastName },
        address: { street: `${rng.int(1, 180)} ${rng.pick(STREETS)}`, postalCode: city.postalCode, city: city.name },
        coords,
        distanceKm: Math.round(distance * 100) / 100,
        bearing: Math.round(bearing * 10) / 10,
        phone: `${prefix} ${String(rng.int(0, 99)).padStart(2, "0")} ${String(rng.int(0, 99)).padStart(2, "0")}`,
        siret: `${rng.int(300, 989)} ${String(rng.int(0, 999)).padStart(3, "0")} ${String(rng.int(0, 999)).padStart(3, "0")} 000${rng.int(10, 49)}`,
        registeredAt: new Date(registered).toISOString().slice(0, 10),
        isNew,
        staff: STAFF[staffIndex],
        staffIndex,
        rating: Math.round((3.6 + rng.next() * 1.3) * 10) / 10,
        reviewCount: isNew ? rng.int(4, 22) : Math.round(8 + 412 * Math.pow(rng.next(), 2.2)),
        site: buildSite(rng, status, handle),
        social: {
          facebook: status === "social-only" || rng.chance(0.55),
          instagram: rng.chance(["restaurant", "beauty", "hairdresser", "florist"].includes(sectorId) ? 0.6 : 0.2),
        },
        hours: rng.pick(HOURS[sectorId]),
        recommendedDas: RECOMMENDED_DAS[sectorId],
      });
    }
  }

  return drafts.map((draft) => {
    const competitors: Competitor[] = drafts
      .filter((other) => other.sector === draft.sector && other.id !== draft.id)
      .map((other) => ({ other, km: distanceKm(draft.coords, other.coords) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, 3)
      .map(({ other, km }) => ({
        name: other.name,
        distanceM: Math.round((km * 1000) / 10) * 10,
        hasSite: HAS_SITE.includes(other.site.status),
        rating: other.rating,
        reviewCount: other.reviewCount,
      }));

    const reasons = buildReasons(draft, competitors);
    const score = reasons.reduce((sum, reason) => sum + reason.points, 0);
    const averageDeal = getSector(draft.sector).averageDeal;
    const estimatedDeal =
      Math.round((averageDeal * (0.8 + 0.45 * Math.min(1, draft.reviewCount / 220) + draft.staffIndex * 0.04)) / 50) * 50;

    const { staffIndex: _internal, ...business } = draft;
    void _internal;
    return { ...business, competitors, reasons, score, heat: heatOf(score), estimatedDeal };
  });
}
