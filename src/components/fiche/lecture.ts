import { formatRating, formatRelative, plural } from "@/lib/format";
import { DEMO_TODAY, type Competitor, type FindingSeverity, type SiteDiagnosis, type SiteFinding, type SiteStatus } from "@/lib/types";

/** How the sheet reads the raw data of a business: every sentence and verdict it writes, kept pure so it can be tested. */

export type EtatControle = "ok" | "ko" | "na";

export interface PointDeControle {
  id: "https" | "mobile" | "speed" | "freshness";
  label: string;
  etat: EtatControle;
  /** What was measured: "7,2 s sur mobile" */
  valeur: string;
  /** One short line of context, empty when there is nothing to add */
  note: string;
}

// Past three seconds on a phone, most visitors leave; a footer more than two years old reads as abandoned.
const SLOW_AFTER_SEC = 3;
const STALE_AFTER_YEARS = 2;
const DEMO_YEAR = Number(DEMO_TODAY.slice(0, 4));

/** The four checks of the inspection. A check that could not run is "na", never a pass. */
export function pointsDeControle(site: SiteDiagnosis): PointDeControle[] {
  // A dead address answers nothing: whatever was known about it before no longer counts.
  const measurable = site.status !== "none" && site.status !== "dead";
  const skipped = site.status === "none" ? "Rien à contrôler" : site.status === "dead" ? "Injoignable" : "Sans objet";
  const na = (id: PointDeControle["id"], label: string): PointDeControle => ({ id, label, etat: "na", valeur: skipped, note: "" });

  const https =
    !measurable || site.https === undefined
      ? na("https", "Connexion")
      : site.https
        ? { id: "https" as const, label: "Connexion", etat: "ok" as const, valeur: "HTTPS actif", note: "Le cadenas s'affiche à côté de l'adresse." }
        : { id: "https" as const, label: "Connexion", etat: "ko" as const, valeur: "Pas de HTTPS", note: "Le navigateur affiche « Non sécurisé »." };

  const mobile =
    !measurable || site.mobileFriendly === undefined
      ? na("mobile", "Mobile")
      : site.mobileFriendly
        ? { id: "mobile" as const, label: "Mobile", etat: "ok" as const, valeur: "Lisible sur téléphone", note: "La page s'adapte à l'écran." }
        : { id: "mobile" as const, label: "Mobile", etat: "ko" as const, valeur: "Illisible sur téléphone", note: "Il faut zoomer pour lire." };

  const speed =
    !measurable || site.loadTimeSec === undefined
      ? na("speed", "Vitesse")
      : {
          id: "speed" as const,
          label: "Vitesse",
          etat: site.loadTimeSec <= SLOW_AFTER_SEC ? ("ok" as const) : ("ko" as const),
          valeur: `${formatRating(site.loadTimeSec)} s sur mobile`,
          note: site.performance === undefined ? "" : `Performance : ${site.performance} sur 100.`,
        };

  const age = site.copyrightYear === undefined ? 0 : DEMO_YEAR - site.copyrightYear;
  const freshness =
    !measurable || site.copyrightYear === undefined
      ? na("freshness", "Fraîcheur")
      : {
          id: "freshness" as const,
          label: "Fraîcheur",
          etat: age <= STALE_AFTER_YEARS ? ("ok" as const) : ("ko" as const),
          valeur: `Copyright ${site.copyrightYear}`,
          note: age <= 0 ? "Mis à jour cette année." : `${plural(age, "an")} sans mise à jour visible.`,
        };

  return [https, mobile, speed, freshness];
}

export type ResultatControle = "Favorable" | "Contre-visite" | "Non présenté";

/** The stamp of the report, in the words of a French vehicle inspection. */
export function resultatControle(status: SiteStatus): ResultatControle {
  if (status === "ok") return "Favorable";
  if (status === "none" || status === "social-only") return "Non présenté";
  return "Contre-visite";
}

export const GRAVITES: Record<FindingSeverity, { label: string; rank: number; one: string; many: string }> = {
  high: { label: "Critique", rank: 0, one: "critique", many: "critiques" },
  medium: { label: "Majeure", rank: 1, one: "majeure", many: "majeures" },
  low: { label: "Mineure", rank: 2, one: "mineure", many: "mineures" },
};

/** Failures, most serious first. A sound site has none: its single finding says so. */
export function defaillances(site: SiteDiagnosis): SiteFinding[] {
  if (site.status === "ok") return [];
  return [...site.findings].sort((a, b) => GRAVITES[a.severity].rank - GRAVITES[b.severity].rank);
}

/** "3 défaillances : 1 critique, 2 majeures" */
export function bilanDefaillances(findings: SiteFinding[]): string {
  if (findings.length === 0) return "Aucune défaillance";
  const parts = (Object.keys(GRAVITES) as FindingSeverity[])
    .map((severity) => {
      const count = findings.filter((finding) => finding.severity === severity).length;
      return count === 0 ? "" : `${count} ${count > 1 ? GRAVITES[severity].many : GRAVITES[severity].one}`;
    })
    .filter(Boolean);
  return `${plural(findings.length, "défaillance")} : ${parts.join(", ")}`;
}

/** "2 de ses 3 voisins ont un site." */
export function phraseVoisins(competitors: Competitor[]): string {
  const total = competitors.length;
  const withSite = competitors.filter((competitor) => competitor.hasSite).length;
  if (total === 0) return "Aucun concurrent du même métier à proximité.";
  if (withSite === 0) return `Aucun de ses ${total} voisins n'a de site.`;
  if (withSite === total) return `Ses ${total} voisins ont tous un site.`;
  return `${withSite} de ses ${total} voisins ${withSite > 1 ? "ont" : "a"} un site.`;
}

/** A relative time that reads well after a comma: "il y a 12 min", "hier", "le 3 octobre 2026". */
export function quand(date: number, now: number): string {
  const relative = formatRelative(date, now);
  return /^\d/.test(relative) ? `le ${relative}` : relative;
}

/** "Ouverte 2 fois, la dernière il y a 12 min" */
export function phraseOuvertures(
  opens: number[],
  shared: { at: number; channel: "sms" | "link" } | undefined,
  now: number,
): string {
  if (opens.length === 1) return `Ouverte une fois, ${quand(opens[0], now)}`;
  if (opens.length > 1) return `Ouverte ${opens.length} fois, la dernière ${quand(Math.max(...opens), now)}`;
  if (shared) return `Envoyée ${shared.channel === "sms" ? "par SMS" : "par lien"} ${quand(shared.at, now)}, pas encore ouverte`;
  return "Pas encore envoyée";
}

/** "encore 30 jours", for « Réservé, encore 30 jours » */
export function joursRestants(until: number, now: number): string {
  const days = Math.ceil((until - now) / 86_400_000);
  return days <= 1 ? "dernier jour" : `encore ${days} jours`;
}

/** The text message with its link in place. */
export function messageSms(template: string, link: string): string {
  return template.replace("{lien}", link);
}
