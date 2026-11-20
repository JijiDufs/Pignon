"use client";

import Link from "next/link";
import { Bell, MapPin, Search } from "lucide-react";
import { Kbd } from "@/components/pignon/kbd";
import { PignonMark } from "@/components/pignon/logo";
import { getCity } from "@/lib/data";
import { useAppStore, useUnreadAlerts } from "@/lib/store";
import { DemoMenu } from "./demo-menu";
import { UserMenu } from "./sidebar";

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const zone = useAppStore((state) => state.zone);
  const unread = useUnreadAlerts();
  const city = getCity(zone.cityId);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-trait px-3 sm:px-4">
      <Link href="/app" aria-label="Pignon, retour à Aujourd'hui" className="rounded-md lg:hidden">
        <PignonMark className="size-7" />
      </Link>

      <Link
        href="/app/radar"
        className="flex h-9 min-w-0 items-center gap-1.5 rounded-lg px-2 text-sm transition-colors hover:bg-nuit-700"
      >
        <MapPin aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-pave" />
        <span className="truncate font-medium">{city?.name ?? "Choisir une zone"}</span>
        <span className="cote shrink-0 text-ui text-pave">{zone.radiusKm} km</span>
        <span className="sr-only">, ta zone : ouvrir le radar</span>
      </Link>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onOpenPalette}
        className="hidden h-9 w-72 items-center gap-2 rounded-lg border border-trait bg-nuit-800 px-2.5 text-left text-sm text-pave transition-colors hover:border-trait-fort hover:text-brume md:flex"
      >
        <Search aria-hidden="true" className="size-4" />
        <span className="flex-1 truncate">Chercher un commerce</span>
        <Kbd>⌘K</Kbd>
      </button>
      <button
        type="button"
        onClick={onOpenPalette}
        aria-label="Rechercher"
        className="grid size-9 place-items-center rounded-lg text-brume hover:bg-nuit-800/70 md:hidden"
      >
        <Search aria-hidden="true" className="size-4" />
      </button>

      <DemoMenu />

      <Link
        href="/app/alertes"
        aria-label={unread > 0 ? `Alertes, ${unread} non lues` : "Alertes"}
        className="relative grid size-9 place-items-center rounded-lg text-brume transition-colors hover:bg-nuit-800/70 hover:text-craie"
      >
        <Bell aria-hidden="true" className="size-4" />
        {unread > 0 && (
          <span aria-hidden="true" className="absolute top-1.5 right-1.5 size-2 rounded-full bg-lumiere ring-2 ring-nuit-900" />
        )}
      </Link>

      <div className="lg:hidden">
        <UserMenu compact />
      </div>
    </header>
  );
}
