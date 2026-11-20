"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PignonMark } from "@/components/pignon/logo";
import { useAppStore, useIsClient } from "@/lib/store";
import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { UpgradeDialog } from "./upgrade-dialog";
import { useMaquetteOpens } from "./use-open-notifier";

/** Shown while the browser takes over: the sign warming up. */
export function AppSplash() {
  return (
    <div role="status" className="grid h-dvh place-items-center bg-nuit-950">
      <PignonMark className="size-12 animate-veille" />
      <span className="sr-only">Chargement de Pignon</span>
    </div>
  );
}

/**
 * Everything under /app renders in the browser only: the demo state lives in localStorage
 * and the screens read the clock. The server (and the static shell) only ever sees the splash.
 */
export function AppGate({ children }: { children: React.ReactNode }) {
  const ready = useIsClient();
  if (!ready) return <AppSplash />;
  return <AppShell>{children}</AppShell>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const onboarded = useAppStore((state) => state.onboarded);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useMaquetteOpens();

  useEffect(() => {
    if (!onboarded) router.replace("/bienvenue");
  }, [onboarded, router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!onboarded) return <AppSplash />;

  return (
    <div className="flex h-dvh overflow-hidden bg-nuit-700">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-lumiere focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-nuit-950"
      >
        Aller au contenu
      </a>
      <Sidebar className="hidden lg:flex" />
      <div className="flex min-w-0 flex-1 flex-col lg:py-2 lg:pr-2">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background lg:rounded-2xl lg:border lg:border-trait lg:shadow-petit">
          <TopBar onOpenPalette={() => setPaletteOpen(true)} />
          <main id="contenu" tabIndex={-1} className="scrollbar-fin relative min-h-0 flex-1 overflow-y-auto pb-14 outline-none lg:pb-0">
            {children}
          </main>
        </div>
      </div>
      <MobileNav className="lg:hidden" />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <UpgradeDialog />
    </div>
  );
}
