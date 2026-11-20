"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, X } from "lucide-react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { ScoreDial } from "@/components/pignon/score";
import { SiteStatusBadge } from "@/components/pignon/site-status";
import { Button } from "@/components/ui/button";
import { getSector } from "@/lib/data";
import { takenByOthers } from "@/lib/exclusivity";
import { formatDate, formatDistance, formatEuro, maskName } from "@/lib/format";
import { souple } from "@/lib/motion";
import { getPlan } from "@/lib/plans";
import { useAppStore, useIsMasked, useQuota } from "@/lib/store";
import type { Business } from "@/lib/types";
import { cn } from "@/lib/utils";
import type { Availability } from "./radar-data";

interface PreviewCardProps {
  business: Business;
  availability: Availability;
  onClose: () => void;
  className?: string;
}

/** The selected business at a glance: why it is worth a call, and the way into its sheet. */
export function PreviewCard({ business, availability, onClose, className }: PreviewCardProps) {
  const router = useRouter();
  const masked = useIsMasked(business.id);
  const unlock = useAppStore((state) => state.unlock);
  const plan = useAppStore((state) => state.plan);
  const { remaining } = useQuota();
  const taken = availability === "taken" ? takenByOthers(business.id) : null;
  const name = masked ? maskName(business.name) : business.name;

  const open = () => {
    // `unlock` opens the upgrade dialog by itself when the monthly quota is used up.
    if (unlock(business.id)) router.push(`/app/commerces/${business.id}`);
  };

  return (
    <motion.article
      key={business.id}
      aria-label={`Aperçu de ${name}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={souple}
      className={cn("rounded-2xl bg-nuit-800 p-4 shadow-flottant", className)}
    >
      <header className="flex items-start gap-3">
        <BusinessMark sector={business.sector} heat={taken ? "cold" : business.heat} size={46} lit={!taken} />
        <div className="min-w-0 flex-1">
          <h2 className="titre truncate text-lg">{name}</h2>
          <p className="truncate text-ui text-brume">
            {getSector(business.sector).label}, à {formatDistance(business.distanceKm)}
            {!masked && !taken && `, ${business.address.street}`}
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" className="-mt-1 -mr-1 text-brume" aria-label="Fermer l'aperçu" onClick={onClose}>
          <X aria-hidden="true" />
        </Button>
      </header>

      <div className="mt-4 flex items-center gap-4">
        <ScoreDial score={business.score} size="md" />
        <div className="min-w-0">
          <SiteStatusBadge status={business.site.status} label="full" />
          <p className="mt-2 text-ui text-brume">
            Un site estimé à <strong className="chiffres font-semibold text-craie">{formatEuro(business.estimatedDeal)}</strong>
          </p>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2 border-t border-trait pt-3.5">
        {business.reasons.slice(0, 2).map((reason) => (
          <li key={reason.id} className="flex gap-3 text-ui">
            <span className="chiffres w-8 shrink-0 font-semibold text-lumiere">+{reason.points}</span>
            <span className="text-brume">{reason.detail}</span>
          </li>
        ))}
      </ul>

      {taken ? (
        <p className="mt-4 flex gap-2.5 rounded-xl bg-nuit-950/60 p-3 text-ui text-brume">
          <Lock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-pave" />
          <span>
            Réservé par un autre abonné jusqu&apos;au {formatDate(taken.until)}. Tant qu&apos;il le garde, personne d&apos;autre ne peut
            l&apos;appeler : c&apos;est aussi ce qui protège tes propres réservations.
          </span>
        </p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <Button size="lg" className="flex-1" onClick={open}>
            Ouvrir la fiche
          </Button>
          {masked && (
            <p className="max-w-36 text-2xs leading-snug text-pave">
              {remaining > 0
                ? `Il te reste ${remaining} ${remaining > 1 ? "fiches" : "fiche"} ce mois-ci sur ${getPlan(plan).name}.`
                : "Tu as ouvert toutes tes fiches du mois."}
            </p>
          )}
        </div>
      )}
    </motion.article>
  );
}
