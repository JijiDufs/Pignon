import type { BillingCycle, PlanId } from "./types";

/** Everything a plan can unlock. Gate UI with `useCan(feature)` or `<PlanGate feature>`. */
export type FeatureId =
  | "full-profile" // complete business sheet beyond the free monthly quota
  | "all-da-prompts" // prompts in every art direction
  | "call-script" // personalised call script
  | "pipeline" // follow-up board
  | "live-mockup" // shareable mockup link
  | "open-alert" // alert when the shop owner opens the mockup
  | "lead-reservation" // lock a business for 30 days
  | "new-business-alerts" // freshly registered companies in the zone
  | "call-simulator" // practise against an AI shop owner
  | "export" // CSV export
  | "territory" // exclusive trade × town
  | "white-label" // mockups under the subscriber's own brand
  | "team-seats";

export interface Plan {
  id: PlanId;
  name: string;
  /** Who it is for, one short sentence */
  audience: string;
  /** Euros per month. `yearly` is the monthly price when billed once a year. */
  price: Record<BillingCycle, number>;
  limits: {
    zones: number;
    profilesPerMonth: number;
    liveMockupsPerMonth: number;
    activeReservations: number;
    /** Exclusive territories (one trade in one city) */
    territories: number;
    seats: number;
  };
  features: FeatureId[];
  /** Pricing-card bullets */
  highlights: string[];
  recommended?: boolean;
}

const SOLO: FeatureId[] = ["full-profile", "all-da-prompts", "call-script", "pipeline"];
const PRO: FeatureId[] = [
  ...SOLO,
  "live-mockup",
  "open-alert",
  "lead-reservation",
  "new-business-alerts",
  "call-simulator",
  "export",
];
const AGENCY: FeatureId[] = [...PRO, "territory", "white-label", "team-seats"];

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Découverte",
    audience: "Pour voir ce qui dort dans ta zone.",
    price: { monthly: 0, yearly: 0 },
    limits: { zones: 1, profilesPerMonth: 3, liveMockupsPerMonth: 0, activeReservations: 0, territories: 0, seats: 1 },
    features: [],
    highlights: [
      "La carte de ta zone",
      "Toutes les opportunités, noms masqués",
      "3 fiches complètes par mois",
      "Un aperçu de maquette par fiche",
    ],
  },
  {
    id: "solo",
    name: "Solo",
    audience: "Pour le freelance qui démarche chaque semaine.",
    price: { monthly: 39, yearly: 31 },
    limits: { zones: 1, profilesPerMonth: 100, liveMockupsPerMonth: 0, activeReservations: 0, territories: 0, seats: 1 },
    features: SOLO,
    highlights: [
      "100 fiches complètes par mois",
      "Le score expliqué, raison par raison",
      "Les prompts dans toutes les directions artistiques",
      "Un script d'appel écrit pour chaque commerce",
      "Le pipeline de suivi",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    audience: "Pour signer plus vite, sans croiser un concurrent.",
    price: { monthly: 89, yearly: 71 },
    limits: { zones: 3, profilesPerMonth: 300, liveMockupsPerMonth: 60, activeReservations: 25, territories: 0, seats: 1 },
    features: PRO,
    highlights: [
      "Tout Solo, sur 3 zones",
      "Les maquettes en ligne, à envoyer par SMS",
      "L'alerte quand le commerçant ouvre sa maquette",
      "25 commerces réservés pendant 30 jours",
      "Les nouvelles entreprises de ta zone, chaque matin",
      "Le simulateur d'appel",
    ],
    recommended: true,
  },
  {
    id: "agency",
    name: "Agence",
    audience: "Pour les équipes qui veulent un territoire à elles.",
    price: { monthly: 199, yearly: 159 },
    limits: { zones: 10, profilesPerMonth: 1000, liveMockupsPerMonth: 250, activeReservations: 100, territories: 5, seats: 3 },
    features: AGENCY,
    highlights: [
      "Tout Pro, sur 10 zones",
      "5 territoires exclusifs : un métier dans une ville",
      "Les maquettes à ta marque",
      "3 comptes pour ton équipe",
    ],
  },
];

export const PLAN_ORDER: PlanId[] = ["free", "solo", "pro", "agency"];

export const FEATURES: Record<FeatureId, { label: string; description: string; minPlan: PlanId }> = {
  "full-profile": {
    label: "Les fiches complètes",
    description: "Le nom, le téléphone, le diagnostic du site et le score détaillé de chaque commerce.",
    minPlan: "solo",
  },
  "all-da-prompts": {
    label: "Toutes les directions artistiques",
    description: "Le prompt prêt à coller, décliné dans chaque style de la bibliothèque.",
    minPlan: "solo",
  },
  "call-script": {
    label: "Le script d'appel",
    description: "Un script écrit avec les vraies données du commerce, et les réponses aux objections.",
    minPlan: "solo",
  },
  pipeline: {
    label: "Le pipeline",
    description: "Le suivi de chaque commerce, du premier appel à la signature.",
    minPlan: "solo",
  },
  "live-mockup": {
    label: "La maquette en ligne",
    description: "Un lien unique à envoyer par SMS pendant l'appel : le commerçant voit son futur site.",
    minPlan: "pro",
  },
  "open-alert": {
    label: "L'alerte d'ouverture",
    description: "Tu es prévenu à la seconde où le commerçant regarde sa maquette.",
    minPlan: "pro",
  },
  "lead-reservation": {
    label: "La réservation",
    description: "Le commerce disparaît pour les autres abonnés pendant 30 jours.",
    minPlan: "pro",
  },
  "new-business-alerts": {
    label: "Les nouvelles entreprises",
    description: "Les commerces tout juste immatriculés dans ta zone, avant qu'ils cherchent un prestataire.",
    minPlan: "pro",
  },
  "call-simulator": {
    label: "Le simulateur d'appel",
    description: "Entraîne-toi face à un commerçant pressé avant de décrocher pour de vrai.",
    minPlan: "pro",
  },
  export: {
    label: "L'export",
    description: "Ton pipeline en CSV, pour ton tableur ou ton CRM.",
    minPlan: "pro",
  },
  territory: {
    label: "L'exclusivité de territoire",
    description: "Un métier dans une commune, pour ton équipe et personne d'autre.",
    minPlan: "agency",
  },
  "white-label": {
    label: "Les maquettes à ta marque",
    description: "Ton logo et ton nom de domaine sur chaque maquette envoyée.",
    minPlan: "agency",
  },
  "team-seats": {
    label: "Les comptes d'équipe",
    description: "Trois comptes qui partagent les mêmes zones et le même pipeline.",
    minPlan: "agency",
  },
};

export function getPlan(id: PlanId): Plan {
  return PLANS.find((plan) => plan.id === id) ?? PLANS[0];
}

export function planRank(id: PlanId): number {
  return PLAN_ORDER.indexOf(id);
}

export function can(plan: PlanId, feature: FeatureId): boolean {
  return getPlan(plan).features.includes(feature);
}

/** Cheapest plan that includes the feature. */
export function minPlanFor(feature: FeatureId): Plan {
  return getPlan(FEATURES[feature].minPlan);
}

/** Euros saved over a year by paying yearly. */
export function yearlySaving(plan: Plan): number {
  return (plan.price.monthly - plan.price.yearly) * 12;
}
