"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { BillingToggle } from "@/components/pricing/billing-toggle";
import { chargePerPeriod } from "@/components/pricing/pricing-logic";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatEuro } from "@/lib/format";
import { apparition, cascade } from "@/lib/motion";
import { FEATURES, getPlan, yearlySaving } from "@/lib/plans";
import { useAppStore } from "@/lib/store";
import type { BillingCycle, PlanId } from "@/lib/types";
import { FEATURE_HOME, gained } from "./billing-logic";
import { DemoCard } from "./demo-card";

interface CheckoutDialogProps {
  /** Plan being bought */
  planId: PlanId;
  /** Plan held when the dialog opened */
  from: PlanId;
  onClose: () => void;
}

type Phase = "recap" | "processing" | "done";

/** The fake checkout: a recap, the demo card, then the features that just opened, one after the other. */
export function CheckoutDialog({ planId, from, onClose }: CheckoutDialogProps) {
  const setPlan = useAppStore((state) => state.setPlan);
  const [cycle, setCycle] = useState<BillingCycle>(() => useAppStore.getState().cycle);
  const [phase, setPhase] = useState<Phase>("recap");
  const plan = getPlan(planId);
  const unlocked = gained(from, planId);
  const amount = chargePerPeriod(plan, cycle);

  const confirm = () => {
    setPhase("processing");
    // No payment is made: the pause only gives the confirmation a beat.
    window.setTimeout(() => {
      setPlan(planId, cycle);
      setPhase("done");
    }, 1000);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && phase !== "processing" && onClose()}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg" showCloseButton={phase !== "processing"}>
        {phase === "done" ? (
          <div className="p-6 sm:p-8">
            <span className="grid size-11 place-items-center rounded-full bg-craie text-nuit-950">
              <Check aria-hidden="true" className="size-5" />
            </span>
            <DialogHeader className="mt-5">
              <DialogTitle className="enseigne text-3xl">Tu es sur {plan.name}</DialogTitle>
              <DialogDescription className="text-[0.9375rem] text-brume">
                {unlocked.length > 0 ? "Voici ce qui vient de s'ouvrir, et où t'en servir." : "Ta formule est à jour."}
              </DialogDescription>
            </DialogHeader>
            <motion.ul variants={cascade(0.12, 0.15)} initial="cache" animate="visible" className="mt-5 flex flex-col">
              {unlocked.map((feature) => (
                <motion.li key={feature} variants={apparition} className="flex items-center gap-3 border-t border-trait py-3">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-lumiere" />
                  <span className="min-w-0 flex-1 text-sm font-medium">{FEATURES[feature].label}</span>
                  <Link
                    href={FEATURE_HOME[feature].href}
                    onClick={onClose}
                    className="flex shrink-0 items-center gap-1 rounded-md text-ui text-brume hover:text-craie"
                  >
                    {FEATURE_HOME[feature].label}
                    <ArrowUpRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <Button size="lg" className="mt-6 w-full" onClick={onClose}>
              Terminer
            </Button>
          </div>
        ) : (
          <>
            <div className="p-6 pb-0 sm:p-8 sm:pb-0">
              <DialogHeader>
                <DialogTitle className="enseigne text-3xl">Passer à {plan.name}</DialogTitle>
                <DialogDescription className="text-[0.9375rem] text-brume">{plan.audience}</DialogDescription>
              </DialogHeader>

              <BillingToggle
                cycle={cycle}
                onChange={setCycle}
                disabled={phase === "processing"}
                className="mt-6"
                note={`En annuel, tu économises ${formatEuro(yearlySaving(plan))} par an sur ${plan.name}.`}
              />

              <dl className="mt-6 border-y border-trait py-4 text-sm">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-brume">Formule {plan.name}</dt>
                  <dd className="cote">{formatEuro(plan.price[cycle])} par mois</dd>
                </div>
                <div className="mt-2 flex items-baseline justify-between gap-4">
                  <dt className="font-medium">{cycle === "yearly" ? "Facturé aujourd'hui, pour un an" : "Facturé aujourd'hui, puis chaque mois"}</dt>
                  <dd className="cote text-xl font-medium">{formatEuro(amount)}</dd>
                </div>
              </dl>

              {unlocked.length > 0 && (
                <>
                  <p className="mt-5 text-sm text-brume">Ce qui s&apos;ouvre avec {plan.name} :</p>
                  <ul className="mt-2.5 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                    {unlocked.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-pave" />
                        {FEATURES[feature].label}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <DemoCard className="mt-6" />
            </div>
            <DialogFooter className="mx-0 mt-6 mb-0 px-6 sm:px-8">
              <Button variant="ghost" onClick={onClose} disabled={phase === "processing"}>
                Annuler
              </Button>
              <Button size="lg" onClick={confirm} disabled={phase === "processing"} aria-live="polite">
                {phase === "processing" ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="animate-spin" />
                    Activation de la formule
                  </>
                ) : (
                  `Confirmer, ${formatEuro(amount)}`
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
