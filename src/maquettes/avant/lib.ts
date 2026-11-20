import { DEMO_TODAY, type Business, type MaquetteContent, type SectorId } from "@/lib/types";

/** What every "before" variant receives: the business and the same content as its mockup. */
export interface AvantProps {
  business: Business;
  content: MaquetteContent;
}

/** Stable number drawn from a string: varies the small details from one business to the next. */
export function seed(text: string): number {
  let hash = 7;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return hash;
}

/** DEMO_TODAY moved back in time. Noon UTC, so the day never shifts with the server's time zone. */
export function before(months: number, days = 0): Date {
  const date = new Date(`${DEMO_TODAY}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - months);
  date.setUTCDate(date.getUTCDate() - days);
  return date;
}

/** "Garage du Centre" → "garage-du-centre" */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The address as a browser bar shows it: no scheme, no trailing slash. Invented when the diagnosis has none. */
export function hostOf(business: Business): string {
  const url = business.site.url ?? `www.${slugify(business.name)}.fr`;
  return url.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

/** "04 78 12 34 56" → "0478123456", for tel: links */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

interface Tint {
  main: string;
  dark: string;
  pale: string;
  accent: string;
}

/** The colours each trade used to pick for its site: garages in blue and red, bakers in brown and gold. */
export const SECTOR_TINT: Record<SectorId, Tint> = {
  garage: { main: "#1f4e8c", dark: "#12305a", pale: "#dfe9f5", accent: "#c62828" },
  restaurant: { main: "#7a1f2b", dark: "#4a1019", pale: "#f5ebdf", accent: "#b9852a" },
  hairdresser: { main: "#5b2a6e", dark: "#371743", pale: "#efe4f3", accent: "#c2336b" },
  bakery: { main: "#8a5a2b", dark: "#57371a", pale: "#f6ecd9", accent: "#c97a14" },
  plumber: { main: "#17708f", dark: "#0d465a", pale: "#dff0f5", accent: "#d9731a" },
  beauty: { main: "#a84274", dark: "#6d2a4b", pale: "#fae6ef", accent: "#7a5aa6" },
  florist: { main: "#3d7a3a", dark: "#244a22", pale: "#e6f2df", accent: "#c8427a" },
  electrician: { main: "#2f4257", dark: "#1a2633", pale: "#eef0e2", accent: "#d9a400" },
};
