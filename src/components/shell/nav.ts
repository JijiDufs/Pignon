import { Bell, CreditCard, Kanban, MapPinned, PhoneCall, Radar, Settings2, Sun, type LucideIcon } from "lucide-react";
import type { FeatureId } from "@/lib/plans";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shows a plan tag while the feature is locked */
  feature?: FeatureId;
  /** Extra path prefixes that keep the item active */
  also?: string[];
}

export const NAV: NavItem[] = [
  { href: "/app", label: "Aujourd'hui", icon: Sun },
  { href: "/app/radar", label: "Radar", icon: Radar, also: ["/app/commerces"] },
  { href: "/app/pipeline", label: "Pipeline", icon: Kanban, feature: "pipeline" },
  { href: "/app/coach", label: "Coach d'appel", icon: PhoneCall, feature: "call-script" },
  { href: "/app/alertes", label: "Alertes", icon: Bell },
  { href: "/app/territoire", label: "Territoire", icon: MapPinned, feature: "territory" },
];

export const ACCOUNT_NAV: NavItem[] = [
  { href: "/app/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/app/reglages", label: "Réglages", icon: Settings2 },
];

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href === "/app") return pathname === "/app";
  return [item.href, ...(item.also ?? [])].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
