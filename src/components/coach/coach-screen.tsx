"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Phone } from "lucide-react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { EmptyState } from "@/components/pignon/empty-state";
import { Kbd } from "@/components/pignon/kbd";
import { LinkButton } from "@/components/pignon/link-button";
import { MaquetteFrame } from "@/components/pignon/maquette-frame";
import { Page, PageHeader } from "@/components/pignon/page";
import { LockChip, PlanGate } from "@/components/pignon/plan-gate";
import { ScorePill } from "@/components/pignon/score";
import { startOfDay } from "@/components/pipeline/model";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildCallScript, getBusiness, getOpportunities, getSector } from "@/lib/data";
import { takenByOthers } from "@/lib/exclusivity";
import { plural } from "@/lib/format";
import { useAppStore, useCan, useNow, type CallOutcome } from "@/lib/store";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CallMode } from "./call-mode";
import { Simulator } from "./simulator";

const DONE: Record<CallOutcome, string> = {
  meeting: "Rendez-vous noté",
  callback: "À rappeler : noté",
  refused: "Passé en perdu",
  voicemail: "Répondeur : noté",
};

export function CoachScreen() {
  const preset = useSearchParams().get("commerce");
  const now = useNow();
  const user = useAppStore((state) => state.user);
  const zone = useAppStore((state) => state.zone);
  const pipeline = useAppStore((state) => state.pipeline);
  const calls = useAppStore((state) => state.calls);
  const logCall = useAppStore((state) => state.logCall);
  const updatePipelineEntry = useAppStore((state) => state.updatePipelineEntry);
  const canScript = useCan("call-script");

  // Who to call: the business asked for in the address first, then the pipeline, hottest first.
  const queue = useMemo(() => {
    const waiting = (stage: string) =>
      Object.entries(pipeline)
        .filter(([, entry]) => entry.stage === stage)
        .map(([id]) => getBusiness(id))
        .filter((business): business is Business => business !== undefined)
        .sort((a, b) => b.score - a.score);
    const asked = preset ? getBusiness(preset) : undefined;
    const list = [...waiting("to-call"), ...waiting("called")];
    return asked ? [asked, ...list.filter((business) => business.id !== asked.id)] : list;
  }, [pipeline, preset]);
  // Without a pipeline (Découverte, new account), the zone's best free businesses stand in.
  const fallback = useMemo(
    () =>
      getOpportunities(zone.cityId, zone)
        .filter((business) => !takenByOthers(business.id))
        .slice(0, 6),
    [zone],
  );
  const list = queue.length > 0 ? queue : fallback;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveId, setLiveId] = useState<string | null>(null);
  const selected = list.find((business) => business.id === selectedId) ?? list[0];
  const live = liveId ? getBusiness(liveId) : undefined;

  const today = calls.filter((call) => call.at >= startOfDay(now));
  const meetings = today.filter((call) => call.outcome === "meeting").length;

  if (live) {
    return (
      <CallMode
        business={live}
        script={buildCallScript(live, user.firstName)}
        onEnd={(outcome, duration, meetingAt) => {
          logCall(live.id, outcome, duration);
          if (meetingAt !== undefined) updatePipelineEntry(live.id, { meetingAt });
          const next = list.find((business) => business.id !== live.id);
          toast.success(DONE[outcome], { description: next ? `Suivant dans ta file : ${next.name}` : "Ta file d'appels est vide" });
          setSelectedId(next?.id ?? null);
          setLiveId(null);
        }}
      />
    );
  }

  return (
    <Page>
      <PageHeader
        title="Coach d'appel"
        description="Ce que tu as sous les yeux pendant l'appel, et de quoi t'entraîner avant."
        actions={
          today.length > 0 ? (
            <p className="cote text-sm text-brume">
              Aujourd&apos;hui : {plural(today.length, "appel")}, {plural(meetings, "rendez-vous", "rendez-vous")}
            </p>
          ) : undefined
        }
      />

      <Tabs defaultValue="appel">
        <TabsList className="h-10 bg-nuit-700 p-1">
          <TabsTrigger value="appel" className="px-4 data-active:bg-nuit-800">
            L&apos;appel
          </TabsTrigger>
          <TabsTrigger value="simulateur" className="gap-2 px-4 data-active:bg-nuit-800">
            Le simulateur
            <LockChip feature="call-simulator" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appel" className="mt-8 text-base">
          {list.length === 0 || !selected ? (
            <EmptyState
              title="Personne à appeler"
              description="Ajoute un commerce à ton pipeline depuis sa fiche : son script t'attendra ici."
              action={
                <LinkButton href="/app/radar" size="lg">
                  Ouvrir le radar
                </LinkButton>
              }
            />
          ) : (
            <PlanGate feature="call-script">
              <div className="grid gap-10 lg:grid-cols-[300px_minmax(0,1fr)]">
                <nav aria-label="File d'appels" className="min-w-0">
                  <h2 className="text-sm text-brume">{queue.length > 0 ? "Ta file d'appels" : "Les meilleures opportunités de ta zone"}</h2>
                  <ul className="mt-2 flex flex-col gap-1">
                    {list.map((business) => (
                      <li key={business.id}>
                        <button
                          type="button"
                          aria-pressed={business.id === selected.id}
                          onClick={() => setSelectedId(business.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors",
                            business.id === selected.id ? "bg-nuit-800 shadow-flottant" : "hover:bg-nuit-700",
                          )}
                        >
                          <BusinessMark sector={business.sector} heat={business.heat} size={34} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[0.9375rem] font-medium">{business.name}</span>
                            <span className="block truncate text-ui text-brume">{getSector(business.sector).label}</span>
                          </span>
                          <ScorePill score={business.score} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>

                <BeforeCall key={selected.id} business={selected} firstName={user.firstName} onPickUp={() => canScript && setLiveId(selected.id)} />
              </div>
            </PlanGate>
          )}
        </TabsContent>

        <TabsContent value="simulateur" className="mt-8 text-base">
          <PlanGate feature="call-simulator">
            <Simulator businesses={list.length > 0 ? list : fallback} firstName={user.firstName} />
          </PlanGate>
        </TabsContent>
      </Tabs>
    </Page>
  );
}

/** Before picking up: the number in large type, when to call, what to remember, and the mockup to mention. */
function BeforeCall({ business, firstName, onPickUp }: { business: Business; firstName: string; onPickUp: () => void }) {
  const script = buildCallScript(business, firstName);

  return (
    <section aria-label={`Appel à ${business.name}`} className="grid min-w-0 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      <div className="min-w-0">
        <p className="text-sm text-brume">
          {business.owner.civility} {business.owner.firstName} {business.owner.lastName}, {getSector(business.sector).label.toLowerCase()}
        </p>
        <h2 className="enseigne mt-1 text-4xl">{business.name}</h2>
        <p className="cote mt-5 text-[clamp(2rem,3.6vw,3rem)] leading-none font-medium tracking-tight whitespace-nowrap">{business.phone}</p>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Button size="xl" onClick={onPickUp}>
            <Phone aria-hidden="true" />
            Décrocher
          </Button>
          <p className="flex flex-wrap items-center gap-1.5 text-sm text-pave">
            <Kbd>Espace</Kbd> pour avancer dans le script, <Kbd>1</Kbd> à <Kbd>5</Kbd> pour les objections
          </p>
        </div>

        <div className="mt-8 border-t border-trait pt-5">
          <p className="text-sm text-brume">Le bon moment</p>
          <p className="titre mt-1 text-xl">{script.bestTime}</p>
          <p className="mt-1.5 max-w-[52ch] text-sm text-brume">{script.bestTimeWhy}</p>
        </div>

        <div className="mt-6 border-t border-trait pt-5">
          <p className="text-sm text-brume">À garder en tête</p>
          <ul className="mt-2 flex flex-col gap-2">
            {business.reasons.slice(0, 3).map((reason) => (
              <li key={reason.id} className="flex gap-3">
                <span className="cote w-9 shrink-0 font-medium text-lumiere-doux">+{reason.points}</span>
                <span>{reason.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="scene-3d min-w-0 max-xl:hidden">
        <p className="mb-3 text-sm text-brume">Sa maquette, à envoyer pendant l&apos;appel</p>
        <div className="origin-left [transform:rotateY(-12deg)_rotateX(3deg)]">
          <MaquetteFrame slug={business.slug} da={business.recommendedDas[0]} interactive={false} className="shadow-halo" />
        </div>
      </div>
    </section>
  );
}
