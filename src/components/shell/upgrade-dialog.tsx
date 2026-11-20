"use client";

import { useRouter } from "next/navigation";
import { Check, LockKeyholeOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatEuro } from "@/lib/format";
import { FEATURES, minPlanFor } from "@/lib/plans";
import { useAppStore } from "@/lib/store";

/**
 * The one upgrade prompt of the app. Open it with `promptUpgrade(feature)` from the store;
 * it hands over to /app/abonnement?choisir=<plan>, where the (fake) checkout lives.
 */
export function UpgradeDialog() {
  const router = useRouter();
  const feature = useAppStore((state) => state.upgradePrompt);
  const cycle = useAppStore((state) => state.cycle);
  const dismiss = useAppStore((state) => state.dismissUpgrade);

  const copy = feature ? FEATURES[feature] : null;
  const plan = feature ? minPlanFor(feature) : null;

  const go = (href: string) => {
    dismiss();
    router.push(href);
  };

  return (
    <Dialog open={feature !== null} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
        {copy && plan && (
          <>
            <div className="px-6 pt-7 pb-5">
              <span className="grid size-11 place-items-center rounded-full bg-craie text-nuit-950">
                <LockKeyholeOpen aria-hidden="true" className="size-5" />
              </span>
              <DialogHeader className="mt-4">
                <DialogTitle className="titre text-2xl">{copy.label}</DialogTitle>
                <DialogDescription className="text-[0.9375rem] text-brume">{copy.description}</DialogDescription>
              </DialogHeader>
            </div>

            <div className="px-6 pb-6">
              <p className="text-sm text-brume">
                Inclus dans <strong className="font-medium text-craie">{plan.name}</strong>, avec aussi :
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {plan.highlights.slice(0, 4).map((highlight) => (
                  <li key={highlight} className="flex gap-2.5">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-pharmacie" />
                    {highlight}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-2">
                <Button size="lg" onClick={() => go(`/app/abonnement?choisir=${plan.id}`)}>
                  Passer à {plan.name}, {formatEuro(plan.price[cycle])} par mois
                </Button>
                <Button variant="ghost" className="text-brume" onClick={() => go("/app/abonnement")}>
                  Comparer les formules
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
