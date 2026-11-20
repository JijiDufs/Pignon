"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronsUpDown, LogOut, Undo2 } from "lucide-react";
import { Logo } from "@/components/pignon/logo";
import { LinkButton } from "@/components/pignon/link-button";
import { LockChip, PlanBadge } from "@/components/pignon/plan-gate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatNumber, initials } from "@/lib/format";
import { vif } from "@/lib/motion";
import { useAppStore, useQuota, useUnreadAlerts } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ACCOUNT_NAV, isActive, NAV, type NavItem } from "./nav";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const unread = useUnreadAlerts();

  return (
    <aside className={cn("w-[244px] shrink-0 flex-col px-3 pt-5 pb-3", className)}>
      <Link href="/app" className="mb-7 ml-2 inline-flex w-fit rounded-md" aria-label="Pignon, retour à Aujourd'hui">
        <Logo className="text-xl" />
      </Link>

      <nav aria-label="Navigation principale" className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item, pathname)}
            count={item.href === "/app/alertes" ? unread : 0}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2.5">
        <QuotaCard />
        <UserMenu />
      </div>
    </aside>
  );
}

function NavLink({ item, active, count }: { item: NavItem; active: boolean; count: number }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors",
        active ? "text-craie" : "text-brume hover:bg-nuit-700 hover:text-craie",
      )}
    >
      {active && (
        // The lit window slides to the page you are on.
        <motion.span
          layoutId="nav-actif"
          transition={vif}
          className="absolute inset-0 rounded-lg bg-nuit-700"
        />
      )}
      <Icon aria-hidden="true" strokeWidth={1.75} className={cn("relative size-4", active ? "text-craie" : "text-pave")} />
      <span className="relative flex-1">{item.label}</span>
      {count > 0 && (
        <span className="cote relative grid h-5 min-w-5 place-items-center rounded-md bg-lumiere px-1 text-2xs font-medium text-nuit-950">
          {count}
          <span className="sr-only"> non lues</span>
        </span>
      )}
      {item.feature && <LockChip feature={item.feature} className="relative" />}
    </Link>
  );
}

function QuotaCard() {
  const { used, limit, remaining } = useQuota();
  const plan = useAppStore((state) => state.plan);
  const ratio = Math.min(1, used / limit);
  const low = remaining <= Math.max(1, limit * 0.1);

  return (
    <div className="rounded-xl border border-trait bg-nuit-900 p-3">
      <div className="flex items-baseline justify-between gap-2 text-ui">
        <span className="truncate text-brume">Fiches ce mois-ci</span>
        <span className="cote shrink-0 font-medium whitespace-nowrap">
          {formatNumber(used)} sur {formatNumber(limit)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Fiches ouvertes ce mois-ci"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-nuit-700"
      >
        <motion.div
          className={cn("h-full rounded-full", low ? "bg-lumiere" : "bg-craie")}
          initial={false}
          animate={{ width: `${ratio * 100}%` }}
          transition={vif}
        />
      </div>
      {plan === "free" && (
        <LinkButton href="/app/abonnement" size="sm" className="mt-3 w-full">
          Passer à Solo
        </LinkButton>
      )}
    </div>
  );
}

export function UserMenu({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const plan = useAppStore((state) => state.plan);
  const name = `${user.firstName} ${user.lastName}`.trim();

  const avatar = (
    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-craie text-2xs font-medium text-nuit-950">
      {initials(name)}
    </span>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={compact ? `Compte de ${name}` : undefined}
        className={cn(
          "flex items-center gap-2.5 rounded-xl text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-lumiere",
          compact ? "rounded-full" : "w-full p-1.5 hover:bg-nuit-700 aria-expanded:bg-nuit-700",
        )}
      >
        {avatar}
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{name}</span>
              <span className="block truncate text-2xs text-pave">{user.company}</span>
            </span>
            <PlanBadge plan={plan} />
            <ChevronsUpDown aria-hidden="true" className="size-3.5 text-pave" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={compact ? "bottom" : "top"} align={compact ? "end" : "start"} className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate text-pave">{user.email}</DropdownMenuLabel>
          {ACCOUNT_NAV.map((item) => (
            <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
              <item.icon aria-hidden="true" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/")}>
            <Undo2 aria-hidden="true" />
            Revenir au site
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/connexion")}>
            <LogOut aria-hidden="true" />
            Se déconnecter
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
