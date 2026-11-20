"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { ScorePill } from "@/components/pignon/score";
import { SectorIcon } from "@/components/pignon/sector-icon";
import { Button } from "@/components/ui/button";
import { getSector } from "@/lib/data";
import { formatDate, maskName } from "@/lib/format";
import { DEMO_TODAY, type Business } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bloc } from "./bloc";

const UNTIL = formatDate(new Date(DEMO_TODAY).getTime() + 30 * 86_400_000);

/** Proof 2: reserving a business locks it for every other subscriber. Two radars side by side show both views. */
export function PreuveReservation({ businesses }: { businesses: Business[] }) {
  const [reserved, setReserved] = useState<string[]>([]);
  const toggle = (id: string) => setReserved((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));

  return (
    <Bloc
      title="Un commerce réservé disparaît pour les autres"
      lead="Réserve un commerce : il est à toi pendant 30 jours. Les autres abonnés le voient verrouillé, sans nom ni téléphone. Personne ne l'appelle avant toi."
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <Radar title="Ton radar" caption="Clique sur « Réserver » et regarde l'autre radar">
          {businesses.map((business) => {
            const mine = reserved.includes(business.id);
            return (
              <li key={business.id} className="flex items-center gap-3 py-3.5">
                <Trade business={business} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{business.name}</p>
                  <p className={cn("truncate text-ui", mine ? "text-lumiere-doux" : "text-brume")}>
                    {mine ? `Réservé pour toi jusqu'au ${UNTIL}` : getSector(business.sector).label}
                  </p>
                </div>
                <ScorePill score={business.score} />
                <Button variant={mine ? "ghost" : "default"} size="sm" className="w-24" aria-pressed={mine} onClick={() => toggle(business.id)}>
                  {mine ? "Libérer" : "Réserver"}
                </Button>
              </li>
            );
          })}
        </Radar>

        <Radar title="Le radar des autres abonnés" caption="Ce qu'ils voient, au même moment">
          {businesses.map((business) => {
            const taken = reserved.includes(business.id);
            return (
              <li key={business.id} aria-live="polite" className={cn("flex items-center gap-3 py-3.5 transition-opacity duration-500", taken && "opacity-55")}>
                <Trade business={business} muted={taken} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{taken ? maskName(business.name) : business.name}</p>
                  <p className="truncate text-ui text-brume">
                    {taken ? `Réservé par un autre abonné jusqu'au ${UNTIL}` : getSector(business.sector).label}
                  </p>
                </div>
                {taken ? (
                  <Lock aria-hidden="true" className="mr-1 size-4 text-pave" />
                ) : (
                  <>
                    <ScorePill score={business.score} />
                    <span className="grid h-7 w-24 place-items-center rounded-lg border border-trait-fort text-ui text-brume">Disponible</span>
                  </>
                )}
              </li>
            );
          })}
        </Radar>
      </div>
      <p className="mt-8 max-w-[62ch] text-sm text-brume">
        La règle vaut dans les deux sens : un commerce réservé par un autre abonné s&apos;affiche verrouillé chez toi. La réservation
        commence avec la formule Pro.
      </p>
    </Bloc>
  );
}

function Radar({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl bg-nuit-800 p-5 shadow-flottant sm:p-6">
      <h3 className="titre text-lg">{title}</h3>
      <p className="mt-0.5 text-ui text-pave">{caption}</p>
      <ul className="mt-3 divide-y divide-trait">{children}</ul>
    </div>
  );
}

function Trade({ business, muted = false }: { business: Business; muted?: boolean }) {
  return (
    <span aria-hidden="true" className={cn("grid size-9 shrink-0 place-items-center rounded-lg bg-nuit-700", muted ? "text-pave" : "text-craie")}>
      <SectorIcon sector={business.sector} className="size-4" />
    </span>
  );
}
