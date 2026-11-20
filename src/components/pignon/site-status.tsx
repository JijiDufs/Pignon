import { AtSign, CircleCheck, CircleDashed, History, LockOpen, Smartphone, Unplug, type LucideIcon } from "lucide-react";
import { SITE_STATUS } from "@/lib/data";
import type { SiteStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Icon and colour of each website status. */
export const SITE_STATUS_STYLE: Record<SiteStatus, { icon: LucideIcon; color: string }> = {
  none: { icon: CircleDashed, color: "var(--color-lumiere)" },
  "social-only": { icon: AtSign, color: "var(--color-lilas)" },
  dead: { icon: Unplug, color: "var(--color-enseigne)" },
  insecure: { icon: LockOpen, color: "var(--color-enseigne)" },
  "not-mobile": { icon: Smartphone, color: "var(--color-ambre)" },
  outdated: { icon: History, color: "var(--color-paille)" },
  ok: { icon: CircleCheck, color: "var(--color-pave)" },
};

interface SiteStatusBadgeProps {
  status: SiteStatus;
  /** "short" for lists ("Site mort"), "full" for the sheet ("Pas adapté au mobile") */
  label?: "short" | "full";
  className?: string;
}

export function SiteStatusBadge({ status, label = "short", className }: SiteStatusBadgeProps) {
  const { icon: Icon, color } = SITE_STATUS_STYLE[status];
  const meta = SITE_STATUS[status];
  return (
    <span
      className={cn("inline-flex h-6 items-center gap-1.5 rounded-md bg-nuit-700 px-2 text-ui whitespace-nowrap text-brume", className)}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" style={{ color }} />
      {label === "short" ? meta.short : meta.label}
    </span>
  );
}
