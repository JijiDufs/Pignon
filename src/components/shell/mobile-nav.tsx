"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUnreadAlerts } from "@/lib/store";
import { cn } from "@/lib/utils";
import { isActive, NAV } from "./nav";

// Five destinations fit a phone; Territoire stays reachable from Alertes and the account menu.
const ITEMS = NAV.filter((item) => item.href !== "/app/territoire");

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname();
  const unread = useUnreadAlerts();

  return (
    <nav
      aria-label="Navigation principale"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-trait bg-nuit-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur",
        className,
      )}
    >
      {ITEMS.map((item) => {
        const active = isActive(item, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-14 flex-col items-center justify-center gap-1 text-2xs font-medium",
              active ? "text-lumiere" : "text-pave",
            )}
          >
            <span className="relative">
              <Icon aria-hidden="true" className="size-5" />
              {item.href === "/app/alertes" && unread > 0 && (
                <span aria-hidden="true" className="absolute -top-0.5 -right-1 size-2 rounded-full bg-enseigne" />
              )}
            </span>
            {item.label.replace(" d'appel", "")}
          </Link>
        );
      })}
    </nav>
  );
}
