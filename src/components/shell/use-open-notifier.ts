"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getBusinessBySlug, getNewRegistrations } from "@/lib/data";
import { subscribeMaquetteOpens } from "@/lib/maquette-channel";
import { can } from "@/lib/plans";
import { useAppStore } from "@/lib/store";
import type { DaId } from "@/lib/types";

/** Raises the "the shop owner is looking at the mockup" alert, or teases it on plans that don't include it. */
export function useOpenNotifier() {
  const router = useRouter();

  return useCallback(
    (businessId: string, da: DaId) => {
      const { plan, recordOpen, promptUpgrade } = useAppStore.getState();
      if (!can(plan, "open-alert")) {
        toast("Quelqu'un regarde une de tes maquettes", {
          description: "Avec Pro, tu sais qui, à la seconde où ça arrive.",
          action: { label: "Voir Pro", onClick: () => promptUpgrade("open-alert") },
        });
        return;
      }
      const alert = recordOpen(businessId, da);
      if (!alert) return;
      toast(alert.title, {
        description: alert.body,
        duration: 9000,
        action: { label: "Ouvrir la fiche", onClick: () => router.push(`/app/commerces/${businessId}`) },
      });
    },
    [router],
  );
}

/** Listens for real mockup opens coming from another tab. Mount once, in the app shell. */
export function useMaquetteOpens(): void {
  const notify = useOpenNotifier();
  const lastSeen = useRef(new Map<string, number>());

  useEffect(
    () =>
      subscribeMaquetteOpens(({ slug, da, at }) => {
        const business = getBusinessBySlug(slug);
        if (!business) return;
        // A reload of the mockup is not a second visit.
        const previous = lastSeen.current.get(business.id) ?? 0;
        if (at - previous < 60_000) return;
        lastSeen.current.set(business.id, at);
        notify(business.id, da);
      }),
    [notify],
  );
}

/** Demo helper: a company has just been registered in the zone. */
export function useNewBusinessNotifier() {
  const router = useRouter();

  return useCallback(() => {
    const { plan, zone, alerts, addNewBusinessAlert, promptUpgrade } = useAppStore.getState();
    if (!can(plan, "new-business-alerts")) {
      toast("Une entreprise vient de s'immatriculer dans ta zone", {
        description: "Avec Pro, tu reçois son nom et son adresse le matin même.",
        action: { label: "Voir Pro", onClick: () => promptUpgrade("new-business-alerts") },
      });
      return;
    }
    const known = new Set(alerts.map((alert) => alert.registrationId));
    const registrations = getNewRegistrations(zone.cityId);
    const registration = registrations.find((item) => !known.has(item.id)) ?? registrations[0];
    if (!registration) return;
    const alert = addNewBusinessAlert(registration);
    toast(alert.title, {
      description: alert.body,
      duration: 9000,
      action: { label: "Voir les alertes", onClick: () => router.push("/app/alertes") },
    });
  }, [router]);
}
