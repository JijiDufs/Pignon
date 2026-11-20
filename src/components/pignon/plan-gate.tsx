"use client";

import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEATURES, getPlan, minPlanFor, type FeatureId } from "@/lib/plans";
import { useAppStore, useCan } from "@/lib/store";
import type { PlanId } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlanGateProps {
  feature: FeatureId;
  /** The real content. When locked it is rendered blurred behind the lock, as a preview. */
  children: React.ReactNode;
  /** Override the default copy from `FEATURES` */
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Shows `children` when the current plan includes `feature`.
 * Otherwise shows them blurred under a lock that opens the upgrade dialog.
 */
export function PlanGate({ feature, children, title, description, className }: PlanGateProps) {
  const allowed = useCan(feature);
  const promptUpgrade = useAppStore((state) => state.promptUpgrade);
  if (allowed) return <>{children}</>;

  const plan = minPlanFor(feature);
  const copy = FEATURES[feature];
  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl border border-trait", className)}>
      <div aria-hidden="true" inert className="pointer-events-none opacity-60 blur-[6px] select-none">
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center bg-nuit-900/70 p-6">
        <div className="flex max-w-sm flex-col items-center text-center">
          <span className="grid size-11 place-items-center rounded-full bg-craie text-nuit-950">
            <LockKeyhole aria-hidden="true" className="size-5" />
          </span>
          <p className="titre mt-4 text-lg">{title ?? copy.label}</p>
          <p className="mt-1.5 text-sm text-brume">{description ?? copy.description}</p>
          <Button className="mt-5" size="lg" onClick={() => promptUpgrade(feature)}>
            Débloquer avec {plan.name}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Small "Pro" / "Agence" tag next to a locked menu item or button. */
export function LockChip({ feature, className }: { feature: FeatureId; className?: string }) {
  const allowed = useCan(feature);
  if (allowed) return null;
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-md bg-nuit-700 px-1.5 text-2xs font-medium text-brume",
        className,
      )}
    >
      <LockKeyhole aria-hidden="true" className="size-2.5" />
      {minPlanFor(feature).name}
    </span>
  );
}

const PLAN_TONE: Record<PlanId, string> = {
  free: "bg-nuit-700 text-brume",
  solo: "bg-nuit-700 text-craie",
  pro: "bg-craie text-nuit-950",
  agency: "bg-craie text-nuit-950",
};

/** The name of a plan as a tag. */
export function PlanBadge({ plan, className }: { plan: PlanId; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center rounded-md px-1.5 text-2xs font-medium", PLAN_TONE[plan], className)}>
      {getPlan(plan).name}
    </span>
  );
}
