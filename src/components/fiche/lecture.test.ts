import { describe, expect, it } from "vitest";
import type { Competitor, SiteDiagnosis } from "@/lib/types";
import {
  bilanDefaillances,
  defaillances,
  joursRestants,
  messageSms,
  phraseOuvertures,
  phraseVoisins,
  pointsDeControle,
  resultatControle,
} from "./lecture";

const MIN = 60_000;
const DAY = 86_400_000;
const now = new Date("2026-11-20T10:00:00").getTime();

const neighbour = (hasSite: boolean): Competitor => ({ name: "Voisin", distanceM: 200, hasSite, rating: 4.2, reviewCount: 30 });

describe("le contrôle technique", () => {
  it("ne contrôle rien quand il n'y a pas de site", () => {
    const points = pointsDeControle({ status: "none", findings: [] });
    expect(points.map((point) => point.etat)).toEqual(["na", "na", "na", "na"]);
    expect(points[0].valeur).toBe("Rien à contrôler");
    expect(resultatControle("none")).toBe("Non présenté");
  });

  it("ne valide pas le HTTPS d'un site mort", () => {
    const points = pointsDeControle({ status: "dead", https: true, findings: [] });
    expect(points.every((point) => point.etat === "na" && point.valeur === "Injoignable")).toBe(true);
    expect(resultatControle("dead")).toBe("Contre-visite");
  });

  it("relève chaque défaillance d'un vieux site", () => {
    const site: SiteDiagnosis = {
      status: "insecure",
      https: false,
      mobileFriendly: true,
      loadTimeSec: 5.2,
      performance: 31,
      copyrightYear: 2014,
      findings: [
        { label: "Copyright 2014", detail: "", severity: "medium" },
        { label: "Pas de HTTPS", detail: "", severity: "high" },
      ],
    };
    const [https, mobile, speed, freshness] = pointsDeControle(site);
    expect([https.etat, mobile.etat, speed.etat, freshness.etat]).toEqual(["ko", "ok", "ko", "ko"]);
    expect(speed.valeur).toBe("5,2 s sur mobile");
    expect(freshness.note).toBe("12 ans sans mise à jour visible.");
    expect(defaillances(site).map((finding) => finding.severity)).toEqual(["high", "medium"]);
    expect(bilanDefaillances(defaillances(site))).toBe("2 défaillances : 1 critique, 1 majeure");
  });

  it("ne trouve rien à redire à un site correct", () => {
    const site: SiteDiagnosis = { status: "ok", findings: [{ label: "Rien à signaler", detail: "", severity: "low" }] };
    expect(defaillances(site)).toEqual([]);
    expect(bilanDefaillances([])).toBe("Aucune défaillance");
    expect(resultatControle("ok")).toBe("Favorable");
  });
});

describe("les phrases", () => {
  it("compte les voisins qui ont un site", () => {
    expect(phraseVoisins([neighbour(false), neighbour(false), neighbour(false)])).toBe("Aucun de ses 3 voisins n'a de site.");
    expect(phraseVoisins([neighbour(true), neighbour(false), neighbour(false)])).toBe("1 de ses 3 voisins a un site.");
    expect(phraseVoisins([neighbour(true), neighbour(true), neighbour(false)])).toBe("2 de ses 3 voisins ont un site.");
    expect(phraseVoisins([neighbour(true), neighbour(true), neighbour(true)])).toBe("Ses 3 voisins ont tous un site.");
  });

  it("raconte les ouvertures de la maquette", () => {
    expect(phraseOuvertures([now - 2 * DAY, now - 12 * MIN], undefined, now)).toBe("Ouverte 2 fois, la dernière il y a 12 min");
    expect(phraseOuvertures([now - DAY], undefined, now)).toBe("Ouverte une fois, hier");
    expect(phraseOuvertures([], { at: now - 40 * MIN, channel: "sms" }, now)).toBe("Envoyée par SMS il y a 40 min, pas encore ouverte");
    expect(phraseOuvertures([], undefined, now)).toBe("Pas encore envoyée");
  });

  it("compte les jours de réservation et place le lien dans le SMS", () => {
    expect(joursRestants(now + 30 * DAY, now)).toBe("encore 30 jours");
    expect(joursRestants(now + 3 * DAY - MIN, now)).toBe("encore 3 jours");
    expect(joursRestants(now + 2 * 3_600_000, now)).toBe("dernier jour");
    expect(messageSms("Voici la maquette : {lien} Bonne journée.", "https://x.fr/m/a")).toBe(
      "Voici la maquette : https://x.fr/m/a Bonne journée.",
    );
  });
});
