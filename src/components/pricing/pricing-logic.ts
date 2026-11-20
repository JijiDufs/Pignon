import { formatEuro, formatNumber } from "@/lib/format";
import { can, FEATURES, PLANS, planRank, yearlySaving, type FeatureId, type Plan } from "@/lib/plans";
import type { BillingCycle, PlanId } from "@/lib/types";

/** Pure pricing rules shared by /tarifs and the app. Every number comes from `PLANS`. */

export const PAID_PLANS = PLANS.filter((plan) => plan.price.monthly > 0);
export const RECOMMENDED_PLAN = PLANS.find((plan) => plan.recommended) ?? PLANS[0];

export const CYCLE_LABEL: Record<BillingCycle, string> = { monthly: "Mensuel", yearly: "Annuel" };

/** What one renewal costs: a month, or twelve months at the yearly rate. */
export function chargePerPeriod(plan: Plan, cycle: BillingCycle): number {
  return cycle === "yearly" ? plan.price.yearly * 12 : plan.price.monthly;
}

/** "de Pro", "d'Agence" */
export function de(name: string): string {
  return /^[aeiouyéè]/i.test(name) ? `d'${name}` : `de ${name}`;
}

const list = new Intl.ListFormat("fr", { style: "long", type: "conjunction" });

/** "96 € sur Solo, 216 € sur Pro et 480 € sur Agence" */
export function yearlySavingsSentence(): string {
  return list.format(PAID_PLANS.map((plan) => `${formatEuro(yearlySaving(plan))} sur ${plan.name}`));
}

/** Line under the price of a plan. */
export function priceNote(plan: Plan, cycle: BillingCycle): string {
  if (plan.price.monthly === 0) return "Sans carte bancaire, sans limite de durée.";
  if (cycle === "monthly") return `Ou ${formatEuro(plan.price.yearly)} par mois en annuel.`;
  return `${formatEuro(plan.price.yearly * 12)} facturés une fois par an.`;
}

/** Button of a plan seen from the subscriber's current plan. */
export function switchLabel(target: Plan, current: PlanId): string {
  return planRank(target.id) > planRank(current) ? `Passer à ${target.name}` : `Revenir à ${target.name}`;
}

export interface Simulation {
  /** Euros earned in a month */
  revenue: number;
  /** How many times that month's revenue pays that month's subscription */
  timesRepaid: number;
  /** Months of subscription paid by a single site */
  monthsPerSite: number;
}

export const SIMULATOR = {
  sites: { min: 0, max: 10, initial: 2 },
  price: { min: 500, max: 3000, step: 100, initial: 1500 },
} as const;

export function simulate(sites: number, averagePrice: number, plan: Plan, cycle: BillingCycle): Simulation {
  const cost = plan.price[cycle];
  const revenue = sites * averagePrice;
  return {
    revenue,
    timesRepaid: cost > 0 ? Math.floor(revenue / cost) : 0,
    monthsPerSite: cost > 0 ? Math.floor(averagePrice / cost) : 0,
  };
}

export type Cell = { kind: "yes" } | { kind: "no" } | { kind: "value"; text: string };

export interface ComparisonRow {
  id: string;
  label: string;
  description: string;
  cells: Record<PlanId, Cell>;
}

export interface ComparisonGroup {
  id: string;
  title: string;
  rows: ComparisonRow[];
}

const LIMIT_ROWS: { key: keyof Plan["limits"]; label: string; description: string }[] = [
  { key: "zones", label: "Zones de prospection", description: "Une ville et son rayon, scannés pour toi." },
  {
    key: "profilesPerMonth",
    label: "Fiches complètes par mois",
    description: "Chaque fiche ouverte compte une fois, puis reste ouverte tout le mois.",
  },
  {
    key: "liveMockupsPerMonth",
    label: "Maquettes en ligne par mois",
    description: "Des liens que le commerçant ouvre sur son téléphone.",
  },
  {
    key: "activeReservations",
    label: "Commerces réservés en même temps",
    description: "Chaque réservation dure 30 jours, puis la place se libère.",
  },
  { key: "territories", label: "Territoires exclusifs", description: "Un métier dans une ville, pour toi seul." },
  { key: "seats", label: "Comptes", description: "Les personnes qui se connectent au même espace." },
];

/** Every feature of `FEATURES`, once, under the step of the job it serves. */
export const THEMES: { id: string; title: string; features: FeatureId[] }[] = [
  { id: "trouver", title: "Trouver", features: ["full-profile", "new-business-alerts"] },
  { id: "preparer", title: "Préparer", features: ["all-da-prompts", "call-script", "call-simulator"] },
  { id: "demarcher", title: "Démarcher", features: ["live-mockup", "open-alert", "pipeline", "export"] },
  { id: "exclusivite", title: "Exclusivité", features: ["lead-reservation", "territory"] },
  { id: "equipe", title: "Équipe", features: ["team-seats", "white-label"] },
];

function cells(of: (plan: Plan) => Cell): Record<PlanId, Cell> {
  return Object.fromEntries(PLANS.map((plan) => [plan.id, of(plan)])) as Record<PlanId, Cell>;
}

function featureCell(plan: Plan, feature: FeatureId): Cell {
  if (can(plan.id, feature)) return { kind: "yes" };
  // Découverte has no unlimited sheets, but it is not empty-handed either.
  if (feature === "full-profile") return { kind: "value", text: `${formatNumber(plan.limits.profilesPerMonth)} par mois` };
  return { kind: "no" };
}

export function comparisonGroups(): ComparisonGroup[] {
  const volumes: ComparisonGroup = {
    id: "volumes",
    title: "Volumes",
    rows: LIMIT_ROWS.map((row) => ({
      id: row.key,
      label: row.label,
      description: row.description,
      cells: cells((plan) => {
        const limit = plan.limits[row.key];
        return limit === 0 ? { kind: "no" } : { kind: "value", text: formatNumber(limit) };
      }),
    })),
  };

  const themes: ComparisonGroup[] = THEMES.map((theme) => ({
    id: theme.id,
    title: theme.title,
    rows: theme.features.map((feature) => ({
      id: feature,
      label: FEATURES[feature].label,
      description: FEATURES[feature].description,
      cells: cells((plan) => featureCell(plan, feature)),
    })),
  }));

  // The rule behind `useIsMasked`: only Découverte hides names in lists.
  themes[0].rows.splice(1, 0, {
    id: "names",
    label: "Les noms dans les listes",
    description: "Sur Découverte, le nom d'un commerce apparaît quand tu ouvres sa fiche.",
    cells: cells((plan) => ({ kind: "value", text: plan.id === "free" ? "Masqués" : "Visibles" })),
  });

  return [volumes, ...themes];
}
