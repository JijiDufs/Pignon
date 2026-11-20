import { chargePerPeriod } from "@/components/pricing/pricing-logic";
import { getPlan, PLAN_ORDER, type FeatureId, type Plan } from "@/lib/plans";
import type { BillingCycle, PlanId } from "@/lib/types";

export function isPlanId(value: string | null): value is PlanId {
  return value !== null && (PLAN_ORDER as string[]).includes(value);
}

/** Features the `to` plan has and the `from` plan lacks. */
export function gained(from: PlanId, to: PlanId): FeatureId[] {
  const before = getPlan(from).features;
  return getPlan(to).features.filter((feature) => !before.includes(feature));
}

/** Where each feature is used, for the "go and try it" links of the success screen. */
export const FEATURE_HOME: Record<FeatureId, { href: string; label: string }> = {
  "full-profile": { href: "/app/radar", label: "Ouvrir le radar" },
  "all-da-prompts": { href: "/app/radar", label: "Choisir un commerce" },
  "call-script": { href: "/app/coach", label: "Préparer un appel" },
  pipeline: { href: "/app/pipeline", label: "Voir le pipeline" },
  "live-mockup": { href: "/app/radar", label: "Choisir un commerce" },
  "open-alert": { href: "/app/alertes", label: "Voir les alertes" },
  "lead-reservation": { href: "/app/radar", label: "Réserver un commerce" },
  "new-business-alerts": { href: "/app/alertes", label: "Voir les nouvelles entreprises" },
  "call-simulator": { href: "/app/coach", label: "Lancer le simulateur" },
  export: { href: "/app/pipeline", label: "Exporter le pipeline" },
  territory: { href: "/app/territoire", label: "Prendre un territoire" },
  "white-label": { href: "/app/reglages", label: "Régler ta marque" },
  "team-seats": { href: "/app/reglages", label: "Inviter ton équipe" },
};

export interface Invoice {
  id: string;
  /** Timestamp of the invoice */
  at: number;
  label: string;
  amount: number;
}

function monthsBefore(now: number, months: number): number {
  const date = new Date(now);
  date.setMonth(date.getMonth() - months);
  return date.getTime();
}

/** Same day next month (or next year): the renewal date shown on the plan. */
export function nextRenewal(now: number, cycle: BillingCycle): number {
  const date = new Date(now);
  if (cycle === "yearly") date.setFullYear(date.getFullYear() + 1);
  else date.setMonth(date.getMonth() + 1);
  return date.getTime();
}

/** Invented invoices, consistent with the plan and its cycle. None on the free plan. */
export function buildInvoices(plan: Plan, cycle: BillingCycle, now: number): Invoice[] {
  if (plan.price.monthly === 0) return [];
  const count = cycle === "yearly" ? 1 : 3;
  return Array.from({ length: count }, (_, index) => {
    const at = monthsBefore(now, index);
    const date = new Date(at);
    return {
      id: `PG-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${String(1042 - index * 97)}`,
      at,
      label: `Pignon ${plan.name}, ${cycle === "yearly" ? "un an" : "un mois"}`,
      amount: chargePerPeriod(plan, cycle),
    };
  });
}
