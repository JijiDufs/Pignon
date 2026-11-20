import { describe, expect, it } from "vitest";
import {
  buildCallScript,
  buildPrompt,
  CITIES,
  DAS,
  getBusiness,
  getBusinessBySlug,
  getBusinesses,
  getMaquetteContent,
  getNewRegistrations,
  getOpportunities,
  getZoneStats,
  heatOf,
  searchBusinesses,
  SECTORS,
} from "./index";
import { generateCity } from "./generate";

const all = CITIES.flatMap((city) => getBusinesses(city.id));

describe("generated businesses", () => {
  it("is deterministic", () => {
    const city = CITIES[0];
    expect(generateCity(city)).toEqual(generateCity(city));
  });

  it("gives every city 80 businesses with unique ids and slugs", () => {
    for (const city of CITIES) expect(getBusinesses(city.id)).toHaveLength(80);
    expect(new Set(all.map((b) => b.id)).size).toBe(all.length);
    expect(new Set(all.map((b) => b.slug)).size).toBe(all.length);
  });

  it("scores as the sum of its reasons, within 0–100, with the matching heat", () => {
    for (const b of all) {
      expect(b.reasons.reduce((sum, r) => sum + r.points, 0)).toBe(b.score);
      expect(b.score).toBeGreaterThanOrEqual(0);
      expect(b.score).toBeLessThanOrEqual(100);
      expect(b.heat).toBe(heatOf(b.score));
      expect([...b.reasons].sort((x, y) => y.points - x.points)).toEqual(b.reasons);
    }
  });

  it("keeps a correct site cold and has a believable mix of statuses", () => {
    for (const b of all) if (b.site.status === "ok") expect(b.score).toBeLessThan(40);
    const share = (status: string) => all.filter((b) => b.site.status === status).length / all.length;
    expect(share("none")).toBeGreaterThan(0.22);
    expect(share("ok")).toBeGreaterThan(0.12);
    expect(all.some((b) => b.heat === "hot")).toBe(true);
    expect(all.some((b) => b.site.platform === "business.site")).toBe(true);
    expect(all.some((b) => b.site.paysSubscription)).toBe(true);
  });

  it("fills competitors, hours, art directions and fictional phone numbers", () => {
    for (const b of all) {
      expect(b.competitors).toHaveLength(3);
      expect(b.hours).toHaveLength(7);
      expect(b.recommendedDas).toHaveLength(3);
      expect(b.phone).toMatch(/^(01 99 00|02 61 91|03 53 01|04 65 71|05 36 49) \d\d \d\d$/);
      expect(b.site.url === undefined).toBe(b.site.status === "none");
    }
  });
});

describe("lookups", () => {
  it("finds a business by id and by slug", () => {
    for (const b of all.slice(0, 200)) {
      expect(getBusiness(b.id)).toBe(b);
      expect(getBusinessBySlug(b.slug)).toBe(b);
    }
    expect(getBusiness("nulle-part-3")).toBeUndefined();
    expect(getBusinessBySlug("inconnu-villeurbanne")).toBeUndefined();
  });

  it("lists opportunities by score, filtered by zone", () => {
    const opportunities = getOpportunities("lille");
    expect(opportunities.every((b) => b.site.status !== "ok")).toBe(true);
    expect(opportunities.map((b) => b.score)).toEqual([...opportunities.map((b) => b.score)].sort((a, b) => b - a));
    const near = getOpportunities("lille", { radiusKm: 2, sectors: ["garage"] });
    expect(near.every((b) => b.distanceKm <= 2 && b.sector === "garage")).toBe(true);
    const stats = getZoneStats("lille");
    expect(stats.opportunities).toBe(opportunities.length);
    expect(stats.scanned).toBe(80);
  });

  it("searches without accents or case", () => {
    const target = all.find((b) => /é|è/.test(b.name));
    expect(target).toBeDefined();
    const plain = target!.name.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
    expect(searchBusinesses(plain, 50)).toContain(target);
  });

  it("lists 12 recent registrations per city", () => {
    const list = getNewRegistrations("lille");
    expect(list).toHaveLength(12);
    expect(new Set(list.map((r) => r.id)).size).toBe(12);
  });
});

describe("generated copy", () => {
  it("writes a script, a site and a prompt for every trade", () => {
    for (const sector of SECTORS) {
      const b = all.find((item) => item.sector === sector.id)!;
      const script = buildCallScript(b, "Léa");
      expect(script.steps.map((s) => s.id)).toEqual(["opening", "reason", "proof", "closing"]);
      expect(script.objections.length).toBeGreaterThanOrEqual(4);
      expect(script.smsTemplate).toContain("{lien}");
      expect(script.steps[0].line).toContain(b.owner.lastName);
      const content = getMaquetteContent(b);
      expect(content.services.length).toBeGreaterThanOrEqual(4);
      expect(content.tagline).not.toMatch(/[{}]/);
      expect(content.about.paragraphs.join(" ")).not.toMatch(/[{}]/);
      for (const da of DAS) expect(buildPrompt(b, da.id)).toContain(da.name);
    }
  });
});
