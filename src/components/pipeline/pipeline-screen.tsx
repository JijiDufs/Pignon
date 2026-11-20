"use client";

import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { AnimatedNumber } from "@/components/pignon/animated-number";
import { EmptyState } from "@/components/pignon/empty-state";
import { LinkButton } from "@/components/pignon/link-button";
import { Page, PageHeader } from "@/components/pignon/page";
import { LockChip, PlanGate } from "@/components/pignon/plan-gate";
import { Button } from "@/components/ui/button";
import { getBusiness, getOpportunities, getSector, PIPELINE_STAGES, SECTORS } from "@/lib/data";
import { formatEuro, plural } from "@/lib/format";
import { useAppStore, useCan, useNow } from "@/lib/store";
import type { PipelineStage, SectorId } from "@/lib/types";
import { Board } from "./board";
import type { CardData } from "./card";
import { downloadCsv, toCsv } from "./csv";
import { MeetingDialog, SignDialog } from "./dialogs";
import { conversion, entryValue, orderedIds, previewPipeline, reorder, signedThisMonth, toColumns, type Pipeline } from "./model";
import { usePipelineOrder } from "./order-store";

const percent = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 0 });

export function PipelineScreen() {
  const allowed = useCan("pipeline");
  const now = useNow();
  const zone = useAppStore((state) => state.zone);
  const stored = useAppStore((state) => state.pipeline);

  if (!allowed) {
    // Behind the lock: a believable board, built from the zone's own businesses.
    const preview = previewPipeline(getOpportunities(zone.cityId), now);
    return (
      <Page width="full">
        <PageHeader title="Pipeline" description="Chaque commerce, du premier appel à la signature." />
        <PlanGate feature="pipeline">
          <div className="p-4">
            <Board columns={toColumns(Object.keys(preview), preview)} cards={toCards(preview, {}, [], now)} now={now} />
          </div>
        </PlanGate>
      </Page>
    );
  }

  if (Object.keys(stored).length === 0) {
    return (
      <Page width="full">
        <PageHeader title="Pipeline" description="Chaque commerce, du premier appel à la signature." />
        <EmptyState
          title="Ton pipeline est vide"
          description="Ouvre une fiche depuis le radar et ajoute le commerce : il arrive ici, dans la colonne « À appeler »."
          action={
            <LinkButton href="/app/radar" size="lg">
              Ouvrir le radar
            </LinkButton>
          }
        />
      </Page>
    );
  }

  return <Pipelined now={now} />;
}

function toCards(
  pipeline: Pipeline,
  reservations: Record<string, { until: number }>,
  opens: { businessId: string; at: number }[],
  now: number,
): Record<string, CardData> {
  const cards: Record<string, CardData> = {};
  for (const [id, entry] of Object.entries(pipeline)) {
    const business = getBusiness(id);
    if (!business) continue;
    const until = reservations[id]?.until;
    const opened = opens.filter((open) => open.businessId === id).map((open) => open.at);
    cards[id] = {
      business,
      entry,
      reservedUntil: until !== undefined && until > now ? until : undefined,
      openedAt: opened.length > 0 ? Math.max(...opened) : undefined,
    };
  }
  return cards;
}

type Pending = { id: string; stage: "won" | "meeting"; columnIds: string[] };

function Pipelined({ now }: { now: number }) {
  const filterId = useId();
  const pipeline = useAppStore((state) => state.pipeline);
  const reservations = useAppStore((state) => state.reservations);
  const opens = useAppStore((state) => state.opens);
  const setStage = useAppStore((state) => state.setStage);
  const removeFromPipeline = useAppStore((state) => state.removeFromPipeline);
  const promptUpgrade = useAppStore((state) => state.promptUpgrade);
  const canExport = useCan("export");
  const order = usePipelineOrder((state) => state.order);
  const setOrder = usePipelineOrder((state) => state.setOrder);

  const [sector, setSector] = useState<SectorId | "all">("all");
  // A card dropped on "Signé" or "Rendez-vous" waits there until its dialog is answered.
  const [pending, setPending] = useState<Pending | null>(null);
  const [litId, setLitId] = useState<string | null>(null);

  const cards = useMemo(() => toCards(pipeline, reservations, opens, now), [pipeline, reservations, opens, now]);
  const ids = useMemo(() => orderedIds(pipeline, order), [pipeline, order]);
  const visible = useMemo(() => ids.filter((id) => cards[id] && (sector === "all" || cards[id].business.sector === sector)), [ids, cards, sector]);
  const columns = toColumns(visible, pipeline, pending);
  const sectors = SECTORS.filter((item) => Object.values(cards).some((card) => card.business.sector === item.id));

  const entries = Object.values(pipeline);
  const signed = signedThisMonth(entries, now);
  const rate = conversion(entries);
  const lost = ids.filter((id) => pipeline[id]?.stage === "lost" && cards[id]);

  const place = (id: string, stage: PipelineStage, columnIds: string[]) => {
    if (stage === pipeline[id]?.stage) {
      setOrder(reorder(ids, id, columnIds));
      return;
    }
    if (stage === "won" || stage === "meeting") {
      setPending({ id, stage, columnIds });
      return;
    }
    setOrder(reorder(ids, id, columnIds));
    setStage(id, stage);
  };

  const settle = (extra: { dealValue?: number; meetingAt?: number }) => {
    if (!pending) return;
    setOrder(reorder(ids, pending.id, pending.columnIds));
    setStage(pending.id, pending.stage, extra);
    if (pending.stage === "won") {
      setLitId(pending.id);
      toast.success(`${cards[pending.id]?.business.name} a signé`, { description: `${formatEuro(extra.dealValue ?? 0)} de plus ce mois-ci` });
    }
    setPending(null);
  };

  const exportCsv = () => {
    if (!canExport) {
      promptUpgrade("export");
      return;
    }
    const rows = ids
      .filter((id) => cards[id])
      .map((id) => {
        const { business, entry } = cards[id];
        const stage = PIPELINE_STAGES.find((item) => item.id === entry.stage)?.label ?? entry.stage;
        return [business.name, getSector(business.sector).label, stage, entryValue(entry, business), business.phone];
      });
    downloadCsv("pipeline-pignon.csv", toCsv(["Nom", "Métier", "Étape", "Valeur en euros", "Téléphone"], rows));
    toast.success("Pipeline exporté", { description: plural(rows.length, "commerce") });
  };

  const waiting = pending ? cards[pending.id]?.business : undefined;

  return (
    <Page width="full">
      <PageHeader
        title="Pipeline"
        description="Chaque commerce, du premier appel à la signature. Glisse une carte, ou passe par son menu."
        actions={
          <>
            <label htmlFor={filterId} className="sr-only">
              Filtrer par métier
            </label>
            <select
              id={filterId}
              value={sector}
              onChange={(event) => setSector(event.target.value as SectorId | "all")}
              className="h-9 rounded-lg border border-trait-fort bg-nuit-800 px-2.5 text-sm outline-none focus-visible:border-craie focus-visible:ring-3 focus-visible:ring-craie/15"
            >
              <option value="all">Tous les métiers</option>
              {sectors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.plural}
                </option>
              ))}
            </select>
            <Button variant="outline" className="bg-nuit-800" onClick={exportCsv}>
              <Download aria-hidden="true" />
              Exporter en CSV
              <LockChip feature="export" />
            </Button>
          </>
        }
      />

      <dl className="mb-8 flex flex-wrap gap-x-14 gap-y-5">
        <div className="flex flex-col-reverse justify-end">
          <dt className="mt-1 text-sm text-brume">
            signés ce mois-ci, {plural(signed.count, "site")}
          </dt>
          <dd>
            <AnimatedNumber value={signed.total} format={formatEuro} className="cote text-4xl font-medium tracking-tight text-lumiere" />
          </dd>
        </div>
        <div className="flex flex-col-reverse justify-end">
          <dt className="mt-1 text-sm text-brume">
            de transformation, {rate.won} signés sur {plural(rate.called, "commerce appelé", "commerces appelés")}
          </dt>
          <dd className="cote text-4xl font-medium tracking-tight">{percent.format(rate.rate)}</dd>
        </div>
      </dl>

      <Board columns={columns} cards={cards} now={now} litId={litId} onPlace={place} onRemove={removeFromPipeline} />

      {lost.length > 0 && (
        <details className="mt-10 border-t border-trait pt-4">
          <summary className="w-fit rounded-md text-sm font-medium text-brume hover:text-craie">Perdus, {plural(lost.length, "commerce")}</summary>
          <ul className="mt-3 grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">
            {lost.map((id) => (
              <li key={id} className="flex items-center gap-3 border-b border-trait py-3 text-sm">
                <span className="min-w-0 flex-1 truncate">
                  {cards[id].business.name} <span className="text-pave">{getSector(cards[id].business.sector).label}</span>
                </span>
                <Button variant="ghost" size="sm" onClick={() => setStage(id, "to-call")}>
                  Rouvrir
                </Button>
              </li>
            ))}
          </ul>
        </details>
      )}

      {pending?.stage === "won" && waiting && (
        <SignDialog business={waiting} onCancel={() => setPending(null)} onConfirm={(dealValue) => settle({ dealValue })} />
      )}
      {pending?.stage === "meeting" && waiting && (
        <MeetingDialog business={waiting} onCancel={() => setPending(null)} onConfirm={(meetingAt) => settle({ meetingAt })} />
      )}
    </Page>
  );
}
