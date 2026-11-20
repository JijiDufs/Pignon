"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, LockKeyhole, MessageSquareText } from "lucide-react";
import { MaquetteFrame, maquetteUrl } from "@/components/pignon/maquette-frame";
import { MaquetteStage } from "@/components/pignon/maquette-stage";
import { LockChip } from "@/components/pignon/plan-gate";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DAS, getDa } from "@/lib/data";
import { useAppStore, useCan, useNow } from "@/lib/store";
import type { Business, DaId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { messageSms, phraseOuvertures } from "./lecture";
import { Section } from "./section";

interface MaquetteBlockProps {
  business: Business;
  da: DaId;
  onDa: (da: DaId) => void;
  /** The mockup comes forward at the end of the arrival sequence */
  lit: boolean;
  /** Reserved by another subscriber: the mockup can be seen, not sent */
  restricted: boolean;
  smsTemplate: string;
}

type View = "apres" | "comparer";

/** The hero of the sheet: the site this business could have, shown as an object you can pick up. */
export function MaquetteBlock({ business, da, onDa, lit, restricted, smsTemplate }: MaquetteBlockProps) {
  const [view, setView] = useState<View>("apres");
  const [split, setSplit] = useState(50);
  const [smsOpen, setSmsOpen] = useState(false);
  const now = useNow();

  const canAllDas = useCan("all-da-prompts");
  const canShare = useCan("live-mockup");
  const promptUpgrade = useAppStore((state) => state.promptUpgrade);
  const shareMaquette = useAppStore((state) => state.shareMaquette);
  const shared = useAppStore((state) => state.shared[business.id]);
  const opens = useAppStore((state) => state.opens);
  const openTimes = opens.filter((open) => open.businessId === business.id).map((open) => open.at);

  // Recommended art directions first, then the rest of the library.
  const ordered = [...business.recommendedDas, ...DAS.map((item) => item.id).filter((id) => !business.recommendedDas.includes(id))];
  const current = getDa(da);
  const publicPath = maquetteUrl(business.slug, da);

  const guard = (action: () => void) => () => (canShare ? action() : promptUpgrade("live-mockup"));

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
    shareMaquette(business.id, da, "link");
    toast.success("Lien copié", { description: "La maquette est marquée comme envoyée" });
  };

  return (
    <Section
      id="maquette"
      title="Sa maquette"
      lead={`${current.name} : ${current.tagline}`}
      action={
        <div role="group" aria-label="Affichage de la maquette" className="flex rounded-lg bg-nuit-700 p-1 text-ui font-medium">
          {(["apres", "comparer"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              onClick={() => setView(item)}
              className={cn(
                "h-8 rounded-md px-3 transition-colors",
                view === item ? "bg-nuit-800 text-craie shadow-petit" : "text-brume hover:text-craie",
              )}
            >
              {item === "apres" ? "La maquette" : "Avant et après"}
            </button>
          ))}
        </div>
      }
    >
      <div role="group" aria-label="Direction artistique" className="mb-4 flex flex-wrap gap-2">
        {ordered.map((id, index) => {
          const item = getDa(id);
          const locked = !canAllDas && index > 0;
          const active = id === da;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => (locked ? promptUpgrade("all-da-prompts") : onDa(id))}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-lg border px-3 text-sm transition-colors",
                active ? "border-craie bg-nuit-800 font-medium text-craie" : "border-trait-fort bg-nuit-800 text-brume hover:border-pave hover:text-craie",
              )}
            >
              <span aria-hidden="true" className="flex -space-x-1">
                {item.palette.slice(0, 3).map((color) => (
                  <i key={color.hex} className="size-3.5 rounded-full ring-1 ring-nuit-800" style={{ background: color.hex }} />
                ))}
              </span>
              {item.name}
              {locked && <LockKeyhole aria-label="Formule Solo" className="size-3.5 text-pave" />}
              {index === 0 && <span className="text-2xs text-pave">conseillée</span>}
            </button>
          );
        })}
      </div>

      {view === "apres" ? (
        <MaquetteStage slug={business.slug} da={da} name={business.name} lit={lit} />
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-nuit-700 p-3 sm:p-4">
          <div className="relative overflow-hidden rounded-2xl shadow-flottant">
            <MaquetteFrame slug={business.slug} da={da} chrome={false} interactive={false} className="rounded-none" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
              <MaquetteFrame slug={business.slug} da={da} view="avant" chrome={false} interactive={false} className="rounded-none" />
            </div>
            <span className="absolute top-3 left-3 rounded-md bg-nuit-800 px-2 py-1 text-ui font-medium shadow-petit">Avant</span>
            <span className="absolute top-3 right-3 rounded-md bg-craie px-2 py-1 text-ui font-medium text-nuit-950">Après</span>
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-craie" style={{ left: `${split}%` }}>
              <span className="absolute top-1/2 left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full bg-craie text-nuit-950 shadow-flottant">
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
                </svg>
              </span>
            </div>
            {/* A native range input drives the split: pointer, touch and keyboard for free. */}
            <input
              type="range"
              min={0}
              max={100}
              value={split}
              onChange={(event) => setSplit(Number(event.target.value))}
              aria-label="Part de l'écran qui montre le site actuel"
              aria-valuetext={`${split} % avant, ${100 - split} % après`}
              className="absolute inset-0 size-full cursor-ew-resize opacity-0"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button onClick={guard(() => setSmsOpen(true))} disabled={restricted}>
          <MessageSquareText aria-hidden="true" />
          Envoyer par SMS
          <LockChip feature="live-mockup" />
        </Button>
        <Button variant="secondary" onClick={guard(copyLink)} disabled={restricted}>
          <Copy aria-hidden="true" />
          Copier le lien
        </Button>
        {canShare && !restricted && (
          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-brume hover:bg-nuit-700 hover:text-craie"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            Ouvrir dans un onglet
          </a>
        )}
        <p className="cote ml-auto text-2xs text-pave">
          {restricted ? "Envoi impossible : réservé par un autre abonné" : phraseOuvertures(openTimes, shared, now)}
        </p>
      </div>

      <Dialog open={smsOpen} onOpenChange={setSmsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="titre text-xl">Envoyer la maquette par SMS</DialogTitle>
            <DialogDescription>
              À {business.owner.civility} {business.owner.lastName}, au {business.phone}. Démo : aucun SMS ne part vraiment.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl bg-nuit-700 p-4">
            <p className="voix ml-auto max-w-[32ch] rounded-2xl rounded-br-md bg-craie px-4 py-3 text-[0.9375rem] text-nuit-950">
              {messageSms(smsTemplate, `pignon.app${publicPath.split("?")[0]}`)}
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSmsOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                shareMaquette(business.id, da, "sms");
                setSmsOpen(false);
                toast.success("Maquette envoyée par SMS", { description: "Tu seras prévenu dès qu'elle est ouverte" });
              }}
            >
              Envoyer le SMS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Section>
  );
}
