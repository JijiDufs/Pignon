"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BellRing, Building2, FlaskConical, RotateCcw, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getOpportunities } from "@/lib/data";
import { PLANS } from "@/lib/plans";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useNewBusinessNotifier, useOpenNotifier } from "./use-open-notifier";

/** Controls that only exist because this is a demo: switch plan, trigger events, reset. */
export function DemoMenu() {
  const router = useRouter();
  const plan = useAppStore((state) => state.plan);
  const setPlan = useAppStore((state) => state.setPlan);
  const resetDemo = useAppStore((state) => state.resetDemo);
  const startFresh = useAppStore((state) => state.startFresh);
  const notifyOpen = useOpenNotifier();
  const notifyNewBusiness = useNewBusinessNotifier();

  const simulateOpen = () => {
    const { shared, opens, zone } = useAppStore.getState();
    // Prefer a mockup that was sent and not opened in the last hour.
    const recent = new Set(opens.filter((open) => Date.now() - open.at < 3_600_000).map((open) => open.businessId));
    const sentId = Object.keys(shared).find((id) => !recent.has(id)) ?? Object.keys(shared)[0];
    if (sentId) {
      notifyOpen(sentId, shared[sentId].da);
      return;
    }
    const first = getOpportunities(zone.cityId)[0];
    if (first) notifyOpen(first.id, first.recommendedDas[0]);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 text-brume">
            <FlaskConical aria-hidden="true" />
            Démo
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 gap-3 p-3.5">
        <PopoverHeader>
          <PopoverTitle>Mode démo</PopoverTitle>
          <PopoverDescription>
            Les commerces sont inventés. Rien n&apos;est facturé, rien n&apos;est envoyé.
          </PopoverDescription>
        </PopoverHeader>

        <fieldset>
          <legend className="mb-1.5 text-ui text-brume">Formule affichée</legend>
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-nuit-700 p-1">
            {PLANS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={plan === item.id}
                onClick={() => {
                  setPlan(item.id);
                  toast(`Formule ${item.name} affichée`);
                }}
                className={cn(
                  "h-8 rounded-md text-2xs font-medium transition-colors",
                  plan === item.id ? "bg-craie text-nuit-950" : "text-brume hover:bg-nuit-600",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1.5">
          <Button variant="secondary" className="justify-start" onClick={simulateOpen}>
            <BellRing aria-hidden="true" />
            Simuler une maquette ouverte
          </Button>
          <Button variant="secondary" className="justify-start" onClick={notifyNewBusiness}>
            <Building2 aria-hidden="true" />
            Simuler une nouvelle entreprise
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            className="justify-start text-brume"
            onClick={() => {
              startFresh();
              router.push("/bienvenue");
            }}
          >
            <UserPlus aria-hidden="true" />
            Repartir d&apos;un compte neuf
          </Button>
          <Button
            variant="ghost"
            className="justify-start text-brume"
            onClick={() => {
              resetDemo();
              toast("Démo réinitialisée");
            }}
          >
            <RotateCcw aria-hidden="true" />
            Réinitialiser la démo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
