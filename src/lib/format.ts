/** French formatting helpers. Pure functions: pass `now` explicitly when a clock is involved. */

const euro = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const number = new Intl.NumberFormat("fr-FR");
const decimal = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const dayMonth = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" });
const dayMonthYear = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const weekdayTime = new Intl.DateTimeFormat("fr-FR", { weekday: "long", hour: "numeric", minute: "2-digit" });
const time = new Intl.DateTimeFormat("fr-FR", { hour: "numeric", minute: "2-digit" });

/** 1600 → "1 600 €" */
export function formatEuro(value: number): string {
  return euro.format(value);
}

/** 12480 → "12 480" */
export function formatNumber(value: number): string {
  return number.format(value);
}

/** 4.7 → "4,7" */
export function formatRating(value: number): string {
  return decimal.format(value);
}

/** 0.35 → "350 m", 2.4 → "2,4 km" */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 100) * 10} m`;
  return `${decimal.format(km)} km`;
}

/** "20 novembre" or, with `withYear`, "20 novembre 2026" */
export function formatDate(date: number | string | Date, withYear = false): string {
  return (withYear ? dayMonthYear : dayMonth).format(new Date(date));
}

/** "jeudi à 14:00" */
export function formatWeekdayTime(date: number | string | Date): string {
  return weekdayTime.format(new Date(date)).replace(" ", " à ");
}

/** "14:05" */
export function formatTime(date: number | string | Date): string {
  return time.format(new Date(date));
}

/** "à l'instant", "il y a 12 min", "il y a 3 h", "hier", "il y a 4 jours", then a date */
export function formatRelative(date: number | string | Date, now: number): string {
  const then = new Date(date).getTime();
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  return formatDate(then, true);
}

/** "dans 3 jours", "demain", "aujourd'hui" */
export function formatDaysLeft(until: number, now: number): string {
  const days = Math.ceil((until - now) / 86_400_000);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return "demain";
  return `dans ${days} jours`;
}

/** 95 → "1 min 35" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s} s`;
  return `${m} min ${String(s).padStart(2, "0")}`;
}

/** French plural: plural(3, "commerce") → "3 commerces" */
export function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${formatNumber(count)} ${count > 1 ? pluralForm : singular}`;
}

/** "M. Ferreira" → initials for avatars: "Camille Roux" → "CR" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Name shown while a sheet is locked (Découverte plan): "Garage Ferreira" → "Garage F•••••••" */
export function maskName(name: string): string {
  const words = name.split(" ");
  const last = words.pop() ?? "";
  const hidden = `${last[0] ?? ""}${"•".repeat(Math.max(4, last.length - 1))}`;
  return [...words, hidden].join(" ");
}
