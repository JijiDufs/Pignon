"use client";

import Link from "next/link";
import { CalendarClock, Ellipsis, Eye, Lock } from "lucide-react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { ScorePill } from "@/components/pignon/score";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSector, PIPELINE_STAGES } from "@/lib/data";
import { formatDate, formatEuro } from "@/lib/format";
import type { PipelineEntry } from "@/lib/store";
import type { Business, PipelineStage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { entryValue, lastActivity, meetingLabel, shortAgo } from "./model";

export interface CardData {
  business: Business;
  entry: PipelineEntry;
  /** End of the reservation held on this business, if any */
  reservedUntil?: number;
  /** Last time the shop owner opened the mockup */
  openedAt?: number;
}

interface PipelineCardProps {
  data: CardData;
  now: number;
  /** Stage the card is shown in (a card waiting for its signature shows in "Signé" before it is stored there) */
  stage: PipelineStage;
  /** Just signed: the card comes in lit */
  lit?: boolean;
  /** Without them the card is a still picture (the preview behind the lock, the card under the pointer) */
  onMove?: (stage: PipelineStage) => void;
  onRemove?: () => void;
  className?: string;
}

/** A business on the board: who it is, what it is worth, and the signals that say what to do next. */
export function PipelineCard({ data, now, stage, lit = false, onMove, onRemove, className }: PipelineCardProps) {
  const { business, entry, reservedUntil, openedAt } = data;
  const won = stage === "won";

  return (
    <article className={cn("rounded-xl bg-nuit-800 p-3.5 shadow-petit ring-1 ring-trait", lit && "animate-allumage ring-lumiere", className)}>
      <div className="flex items-start gap-3">
        <BusinessMark sector={business.sector} heat={business.heat} size={36} lit={won} />
        <div className="min-w-0 flex-1">
          {onMove ? (
            <Link href={`/app/commerces/${business.id}`} className="line-clamp-2 rounded text-[0.9375rem] leading-snug font-medium hover:underline">
              {business.name}
            </Link>
          ) : (
            <p className="line-clamp-2 text-[0.9375rem] leading-snug font-medium">{business.name}</p>
          )}
          <p className="truncate text-ui text-brume">{getSector(business.sector).label}</p>
        </div>
        {onMove && (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label={`Déplacer ${business.name}`}
              className="-mt-1 -mr-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-pave outline-none hover:bg-nuit-700 hover:text-craie focus-visible:ring-2 focus-visible:ring-craie aria-expanded:bg-nuit-700"
            >
              <Ellipsis aria-hidden="true" className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-pave">Déplacer vers</DropdownMenuLabel>
                {PIPELINE_STAGES.filter((item) => item.id !== stage).map((item) => (
                  <DropdownMenuItem key={item.id} onClick={() => onMove(item.id)}>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              {onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onRemove}>Retirer du pipeline</DropdownMenuItem>
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-ui">
        <ScorePill score={business.score} />
        <span className={cn("cote", won ? "font-medium text-craie" : "text-brume")}>{formatEuro(entryValue({ ...entry, stage }, business))}</span>
        <span className="ml-auto flex items-center gap-2.5 text-pave">
          {reservedUntil !== undefined && (
            <span title={`Réservé pour toi jusqu'au ${formatDate(reservedUntil)}`}>
              <Lock aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Réservé pour toi jusqu&apos;au {formatDate(reservedUntil)}</span>
            </span>
          )}
          {openedAt !== undefined && (
            <span className="flex items-center gap-1 text-lumiere-doux">
              <Eye aria-hidden="true" className="size-3.5" />
              <span className="sr-only">Maquette ouverte</span>
              <span className="text-2xs whitespace-nowrap">{shortAgo(openedAt, now)}</span>
            </span>
          )}
        </span>
      </div>

      <p className="mt-2 flex items-center gap-1.5 text-2xs text-pave">
        {stage === "meeting" && entry.meetingAt !== undefined ? (
          <>
            <CalendarClock aria-hidden="true" className="size-3.5 text-craie" />
            <span className="text-craie first-letter:uppercase">{meetingLabel(entry.meetingAt, now)}</span>
          </>
        ) : (
          lastActivity(entry, now)
        )}
      </p>
    </article>
  );
}
