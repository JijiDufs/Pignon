"use client";

import { motion } from "motion/react";
import { BusinessMark } from "@/components/pignon/business-mark";
import { LinkButton } from "@/components/pignon/link-button";
import { MaquetteFrame } from "@/components/pignon/maquette-frame";
import { Button } from "@/components/ui/button";
import { getBusiness, getNewRegistrations, getSector } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { souple } from "@/lib/motion";
import { useAppStore, type AppAlert } from "@/lib/store";
import type { Business, NewRegistration } from "@/lib/types";
import { cn } from "@/lib/utils";
import { alertTime, KINDS, LIVE_MS } from "./alert-model";

const MONTH = new Intl.DateTimeFormat("fr-FR", { month: "short" });

/** One alert of the feed. Each kind has its own shape: a mockup on a phone, a register extract, a deadline, a calendar leaf. */
export function AlertRow({ alert, now }: { alert: AppAlert; now: number }) {
  const markAlertRead = useAppStore((state) => state.markAlertRead);
  const release = useAppStore((state) => state.release);
  const reservation = useAppStore((state) => (alert.businessId ? state.reservations[alert.businessId] : undefined));
  const meetingAt = useAppStore((state) => (alert.businessId ? state.pipeline[alert.businessId]?.meetingAt : undefined));
  const da = useAppStore((state) => (alert.businessId ? state.shared[alert.businessId]?.da : undefined));
  const cityId = useAppStore((state) => state.zone.cityId);

  const business = alert.businessId ? getBusiness(alert.businessId) : undefined;
  const registration = alert.registrationId ? getNewRegistrations(cityId).find((item) => item.id === alert.registrationId) : undefined;
  const live = alert.kind === "mockup-opened" && now - alert.at < LIVE_MS;
  const Icon = KINDS[alert.kind].icon;

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={souple}
      // Opening an alert reads it: any click inside counts, its own actions included.
      onClick={() => !alert.read && markAlertRead(alert.id)}
      className={cn("relative flex gap-4 rounded-2xl p-4 transition-colors sm:p-5", alert.read ? "" : "bg-nuit-800 shadow-flottant")}
    >
      <div className="shrink-0">
        {alert.kind === "meeting-soon" && meetingAt !== undefined ? (
          <span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-nuit-700 text-center leading-none">
            <span>
              <span className="cote block text-base font-medium">{new Date(meetingAt).getDate()}</span>
              <span className="block text-2xs text-brume">{MONTH.format(meetingAt).replace(".", "")}</span>
            </span>
          </span>
        ) : business && alert.kind !== "new-business" ? (
          <BusinessMark sector={business.sector} heat={business.heat} size={44} lit={alert.kind === "mockup-opened"} />
        ) : (
          <span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-nuit-700 text-brume">
            <Icon className="size-5" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <h3 className={cn("titre min-w-0 flex-1 text-[1.0625rem]", alert.read && "font-normal")}>
            {!alert.read && <span className="sr-only">Non lue : </span>}
            {alert.title}
          </h3>
          <time dateTime={new Date(alert.at).toISOString()} className="cote shrink-0 pt-0.5 text-2xs text-pave">
            {alertTime(alert.at, now)}
          </time>
        </div>

        {live && (
          <p className="mt-1 flex items-center gap-2 text-ui font-medium text-lumiere-doux">
            <span aria-hidden="true" className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-lumiere opacity-60 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-lumiere" />
            </span>
            En direct
          </p>
        )}

        {registration ? <Register registration={registration} /> : <p className="mt-1 max-w-[60ch] text-sm text-brume">{alert.body}</p>}

        {alert.kind === "reservation-ending" && reservation && (
          <p className="cote mt-1.5 text-ui text-pave">Réservé jusqu&apos;au {formatDate(reservation.until)}</p>
        )}
        <div className="mt-3.5 flex flex-wrap gap-2">
          <Actions alert={alert} business={business} registration={registration} onRelease={() => alert.businessId && release(alert.businessId)} held={Boolean(reservation)} />
        </div>
      </div>

      {alert.kind === "mockup-opened" && business && da && (
        <div aria-hidden="true" className="w-[84px] shrink-0 self-start max-sm:hidden">
          <MaquetteFrame slug={business.slug} da={da} device="mobile" interactive={false} />
        </div>
      )}

      {!alert.read && <span aria-hidden="true" className="absolute top-3 left-1.5 size-1.5 rounded-full bg-lumiere" />}
    </motion.li>
  );
}

interface ActionsProps {
  alert: AppAlert;
  business?: Business;
  registration?: NewRegistration;
  held: boolean;
  onRelease: () => void;
}

function Actions({ alert, business, registration, held, onRelease }: ActionsProps) {
  const sheet = business ?? (registration?.businessId ? getBusiness(registration.businessId) : undefined);
  const fiche = sheet && (
    <LinkButton href={`/app/commerces/${sheet.id}`} variant="outline" className="bg-nuit-800">
      {alert.kind === "new-business" ? "Ouvrir la fiche" : "Voir la fiche"}
    </LinkButton>
  );

  if (alert.kind === "mockup-opened" && business) {
    return (
      <>
        <LinkButton href={`/app/coach?commerce=${business.id}`}>Rappeler maintenant</LinkButton>
        {fiche}
      </>
    );
  }
  if (alert.kind === "reservation-ending" && business) {
    return (
      <>
        <LinkButton href={`/app/coach?commerce=${business.id}`}>Appeler</LinkButton>
        {held && (
          <Button variant="outline" className="bg-nuit-800" onClick={onRelease}>
            Libérer
          </Button>
        )}
      </>
    );
  }
  return fiche ?? null;
}

/** A new company, set like an extract of the trade register. */
export function Register({ registration, className }: { registration: NewRegistration; className?: string }) {
  return (
    <dl className={cn("cote mt-2 grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 border-l-2 border-trait-fort pl-3 text-ui", className)}>
      <dt className="text-pave">Activité</dt>
      <dd>{getSector(registration.sector).label}</dd>
      <dt className="text-pave">Adresse</dt>
      <dd>{registration.street}</dd>
      <dt className="text-pave">Immatriculée</dt>
      <dd>
        le {formatDate(registration.registeredAt, true)}, {registration.legalForm}
      </dd>
    </dl>
  );
}
