/**
 * Shared domain types for Pignon (fake MVP: every value is generated, nothing is fetched).
 * Ids are English, every user-facing label is French and lives in src/lib/data.
 */

export type SectorId =
  | "garage"
  | "restaurant"
  | "hairdresser"
  | "bakery"
  | "plumber"
  | "beauty"
  | "florist"
  | "electrician";

export interface Sector {
  id: SectorId;
  /** "Garage auto" */
  label: string;
  /** "Garages auto" */
  plural: string;
  /** How the owner is called in a sentence: "le garagiste", "la fleuriste" */
  ownerNoun: string;
  /** NAF code shown as a credibility detail: "45.20A" */
  naf: string;
  /** Typical price of a website sold to this trade, in euros */
  averageDeal: number;
}

export interface City {
  id: string;
  name: string;
  postalCode: string;
  /** "Rhône (69)" */
  department: string;
  lat: number;
  lng: number;
}

/** State of the business's web presence, from best opportunity to none. */
export type SiteStatus =
  | "none" // no website at all
  | "social-only" // only a Facebook / Instagram page
  | "dead" // link exists but the site is down (expired domain, closed business.site…)
  | "insecure" // no HTTPS
  | "not-mobile" // unusable on a phone
  | "outdated" // works but looks 10 years old
  | "ok"; // decent site, not an opportunity

export type FindingSeverity = "high" | "medium" | "low";

export interface SiteFinding {
  /** Short label: "Pas de version mobile" */
  label: string;
  /** One plain French sentence a freelancer can repeat on the phone */
  detail: string;
  severity: FindingSeverity;
}

export interface SiteDiagnosis {
  status: SiteStatus;
  /** Undefined when status is "none" */
  url?: string;
  /** "business.site", "Solocal (PagesJaunes)", "Wix", "Facebook", "WordPress 4.9", "Jimdo"… */
  platform?: string;
  /** Year found in the footer */
  copyrightYear?: number;
  https?: boolean;
  mobileFriendly?: boolean;
  /** Mobile load time in seconds */
  loadTimeSec?: number;
  /** 0–100 performance score */
  performance?: number;
  /** True when the owner already pays a monthly fee for the current site (Solocal…) */
  paysSubscription?: boolean;
  findings: SiteFinding[];
}

export type Heat = "hot" | "warm" | "mild" | "cold";

export type ReasonKind = "site" | "activity" | "competition" | "urgency" | "budget";

export interface ScoreReason {
  id: string;
  kind: ReasonKind;
  /** "Aucun site web" */
  label: string;
  /** Full French sentence explaining why it matters */
  detail: string;
  /** Contribution to the score; reasons are sorted by points, and they sum to the score */
  points: number;
}

export interface Competitor {
  name: string;
  distanceM: number;
  hasSite: boolean;
  rating: number;
  reviewCount: number;
}

export interface DayHours {
  /** "Lundi" */
  day: string;
  /** "8 h – 12 h, 14 h – 18 h 30" or "Fermé" */
  hours: string;
}

export interface Business {
  /** `${cityId}-${index}`, e.g. "villeurbanne-12" */
  id: string;
  /** Unique, URL-safe: "garage-ferreira-villeurbanne" */
  slug: string;
  cityId: string;
  name: string;
  sector: SectorId;
  owner: { civility: "M." | "Mme"; firstName: string; lastName: string };
  address: { street: string; postalCode: string; city: string };
  coords: { lat: number; lng: number };
  /** Distance from the city centre, in km */
  distanceKm: number;
  /** 0–360°, clockwise from north, as seen from the city centre (drives the radar sweep) */
  bearing: number;
  /** "04 78 12 34 56" (fictional) */
  phone: string;
  /** Fictional 14-digit SIRET, formatted "123 456 789 00012" */
  siret: string;
  /** ISO date of company registration */
  registeredAt: string;
  /** Registered less than 6 months before DEMO_TODAY */
  isNew: boolean;
  /** "1 à 2 salariés" */
  staff: string;
  rating: number;
  reviewCount: number;
  site: SiteDiagnosis;
  social: { facebook: boolean; instagram: boolean };
  /** The 3 nearest businesses of the same trade */
  competitors: Competitor[];
  /** 0–100 opportunity score */
  score: number;
  heat: Heat;
  reasons: ScoreReason[];
  /** What a signed website is worth for this business, in euros */
  estimatedDeal: number;
  hours: DayHours[];
  /** 3 art directions, best fit first */
  recommendedDas: DaId[];
}

/** Art directions ("directions artistiques") of the mockup library. */
export type DaId = "atelier" | "maison" | "clair" | "neon";

export interface Da {
  id: DaId;
  /** "Atelier" */
  name: string;
  /** One line: "Brut, direct, taillé pour les métiers manuels" */
  tagline: string;
  description: string;
  palette: { name: string; hex: string }[];
  fonts: { display: string; text: string };
  mood: string[];
  bestFor: SectorId[];
}

/** Everything a mockup template needs to render a site for one business. */
export interface MaquetteContent {
  businessName: string;
  sector: SectorId;
  sectorLabel: string;
  city: string;
  /** Hero headline */
  tagline: string;
  /** Hero paragraph */
  intro: string;
  services: { name: string; description: string; price?: string }[];
  strengths: { title: string; text: string }[];
  about: { title: string; paragraphs: string[] };
  /** Short facts: { value: "127", label: "avis Google" } */
  facts: { value: string; label: string }[];
  cta: { primary: string; secondary: string };
  phone: string;
  address: string;
  hours: DayHours[];
  reviewSummary: { rating: number; count: number };
  /** Example quotes, always displayed as examples and never as real reviews */
  sampleReviews: { author: string; text: string }[];
}

export type ScriptStepId = "opening" | "reason" | "proof" | "closing";

export interface CallScript {
  businessId: string;
  /** "Entre 14 h et 16 h 30" */
  bestTime: string;
  /** Why this time slot */
  bestTimeWhy: string;
  steps: {
    id: ScriptStepId;
    /** "L'ouverture" */
    title: string;
    durationSec: number;
    /** What the caller says, personalised with the business's data */
    line: string;
    /** Coaching note on why it works */
    tip: string;
  }[];
  objections: { id: string; objection: string; answer: string }[];
  /** Text message that carries the mockup link; contains the token {lien} */
  smsTemplate: string;
}

/** A company freshly registered in the zone (SIRENE-like feed). */
export interface NewRegistration {
  id: string;
  cityId: string;
  name: string;
  sector: SectorId;
  street: string;
  /** ISO date */
  registeredAt: string;
  /** "SAS", "EURL", "Entreprise individuelle"… */
  legalForm: string;
  /** Id of the matching Business when it is part of the opportunities */
  businessId?: string;
}

export interface ZoneStats {
  /** Businesses scanned in the zone */
  scanned: number;
  /** Opportunities (everything except status "ok") */
  opportunities: number;
  byStatus: Record<SiteStatus, number>;
  byHeat: Record<Heat, number>;
  bySector: Partial<Record<SectorId, number>>;
  /** Sum of estimatedDeal over opportunities */
  potentialRevenue: number;
}

export type PipelineStage =
  | "to-call"
  | "called"
  | "mockup-sent"
  | "meeting"
  | "won"
  | "lost";

export type PlanId = "free" | "solo" | "pro" | "agency";

export type BillingCycle = "monthly" | "yearly";

/** Fixed "today" of the demo, so generated dates never depend on the real clock. */
export const DEMO_TODAY = "2026-11-20";
