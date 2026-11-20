"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Radar, RotateCcw } from "lucide-react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { ScorePill } from "@/components/pignon/score";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getOpportunities, getSector } from "@/lib/data";
import { useAppStore } from "@/lib/store";
import { ACCOUNT_NAV, NAV } from "./nav";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** ⌘K: jump to a page, a business you already opened, or an action. */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const cityId = useAppStore((state) => state.zone.cityId);
  const unlocked = useAppStore((state) => state.unlocked);
  const resetDemo = useAppStore((state) => state.resetDemo);

  // Only businesses whose sheet is open: a locked name must not leak through search.
  const businesses = useMemo(() => {
    const ids = new Set(unlocked);
    return getOpportunities(cityId).filter((business) => ids.has(business.id));
  }, [cityId, unlocked]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Recherche"
      description="Chercher un commerce, une page ou une action"
      className="sm:max-w-xl"
    >
      <Command>
        <CommandInput placeholder="Chercher un commerce, une page, une action" />
        <CommandList className="max-h-[min(60vh,420px)]">
          <CommandEmpty>Rien ne correspond. Essaie le nom d&apos;un commerce ou d&apos;une rue.</CommandEmpty>
          <CommandGroup heading="Aller à">
            {[...NAV, ...ACCOUNT_NAV].map((item) => (
              <CommandItem key={item.href} value={item.href} keywords={[item.label]} onSelect={() => go(item.href)}>
                <item.icon aria-hidden="true" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
          {businesses.length > 0 && (
            <CommandGroup heading="Commerces">
              {businesses.map((business) => (
                <CommandItem
                  key={business.id}
                  value={business.id}
                  keywords={[business.name, business.address.street, getSector(business.sector).label]}
                  onSelect={() => go(`/app/commerces/${business.id}`)}
                >
                  <BusinessMark sector={business.sector} heat={business.heat} size={24} />
                  <span className="min-w-0 flex-1 truncate">{business.name}</span>
                  <span className="hidden truncate text-pave sm:block">{business.address.street}</span>
                  <ScorePill score={business.score} />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Actions">
            <CommandItem value="scan" keywords={["scanner", "zone", "radar"]} onSelect={() => go("/app/radar?scan=1")}>
              <Radar aria-hidden="true" />
              Scanner la zone
            </CommandItem>
            <CommandItem
              value="reset"
              keywords={["réinitialiser", "démo"]}
              onSelect={() => {
                resetDemo();
                onOpenChange(false);
              }}
            >
              <RotateCcw aria-hidden="true" />
              Réinitialiser la démo
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
