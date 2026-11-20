"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { getBusiness, getNewRegistrations, getOpportunities, getSector } from "@/lib/data";
import { takenByOthers, territoryKey } from "@/lib/exclusivity";
import { can, getPlan, type FeatureId } from "@/lib/plans";
import type { BillingCycle, DaId, NewRegistration, PipelineStage, PlanId, SectorId } from "@/lib/types";

/**
 * The whole "backend" of the fake MVP: one persisted store (localStorage).
 * Read with `useAppStore(selector)`, write with the actions below.
 * Only use it under /app (client-only, after hydration) — see CLAUDE.md.
 */

export interface Zone {
  cityId: string;
  radiusKm: number;
  sectors: SectorId[];
}

export interface DemoUser {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export interface PipelineEntry {
  stage: PipelineStage;
  addedAt: number;
  updatedAt: number;
  /** Set when signed, in euros */
  dealValue?: number;
  /** Timestamp of the meeting */
  meetingAt?: number;
  note?: string;
}

export interface Reservation {
  at: number;
  until: number;
}

export interface SharedMaquette {
  da: DaId;
  at: number;
  channel: "sms" | "link";
}

export interface MaquetteOpen {
  id: string;
  businessId: string;
  da: DaId;
  at: number;
}

export type AlertKind = "mockup-opened" | "new-business" | "reservation-ending" | "meeting-soon";

export interface AppAlert {
  id: string;
  kind: AlertKind;
  title: string;
  body: string;
  at: number;
  read: boolean;
  businessId?: string;
  registrationId?: string;
}

export type CallOutcome = "meeting" | "callback" | "refused" | "voicemail";

export interface CallLog {
  id: string;
  businessId: string;
  at: number;
  outcome: CallOutcome;
  durationSec: number;
}

interface AppData {
  seeded: boolean;
  user: DemoUser;
  plan: PlanId;
  cycle: BillingCycle;
  onboarded: boolean;
  zone: Zone;
  lastScanAt: number | null;
  /** Business ids whose full sheet was opened this month (counts against the plan quota) */
  unlocked: string[];
  pipeline: Record<string, PipelineEntry>;
  reservations: Record<string, Reservation>;
  shared: Record<string, SharedMaquette>;
  opens: MaquetteOpen[];
  alerts: AppAlert[];
  calls: CallLog[];
  /** Exclusive territories held by the account (Agence): keys from `territoryKey(cityId, sector)` */
  territories: string[];
  /** Notification and display switches of the settings page, by key */
  preferences: Record<string, boolean>;
  /** Feature the global upgrade dialog is currently pitching (not persisted) */
  upgradePrompt: FeatureId | null;
}

interface AppActions {
  setUser: (user: Partial<DemoUser>) => void;
  setPlan: (plan: PlanId, cycle?: BillingCycle) => void;
  setZone: (zone: Partial<Zone>) => void;
  markScanned: () => void;
  /** Opens a full sheet. Returns false (and opens the upgrade dialog) when the monthly quota is used up. */
  unlock: (businessId: string) => boolean;
  /** Creates or moves a pipeline entry. */
  setStage: (businessId: string, stage: PipelineStage, extra?: Partial<PipelineEntry>) => void;
  updatePipelineEntry: (businessId: string, patch: Partial<PipelineEntry>) => void;
  removeFromPipeline: (businessId: string) => void;
  /** Locks a business for 30 days. Returns false (and opens the upgrade dialog) when the plan does not allow it. */
  reserve: (businessId: string) => boolean;
  release: (businessId: string) => void;
  shareMaquette: (businessId: string, da: DaId, channel: SharedMaquette["channel"]) => void;
  /** The shop owner opened the mockup: stores the open and raises an alert. */
  recordOpen: (businessId: string, da: DaId) => AppAlert | null;
  addNewBusinessAlert: (registration: NewRegistration) => AppAlert;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  logCall: (businessId: string, outcome: CallOutcome, durationSec: number) => void;
  /** Takes the exclusivity of a trade in a city. Returns false (and opens the upgrade dialog) when the plan does not allow it. */
  claimTerritory: (cityId: string, sector: SectorId) => boolean;
  releaseTerritory: (key: string) => void;
  setPreference: (key: string, value: boolean) => void;
  promptUpgrade: (feature: FeatureId) => void;
  dismissUpgrade: () => void;
  /** Back to the pre-filled Pro demo. */
  resetDemo: () => void;
  /** Empty Découverte account, as right after sign-up. */
  startFresh: (user?: Partial<DemoUser>) => void;
  completeOnboarding: (zone: Zone) => void;
}

export type AppState = AppData & AppActions;

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
export const RESERVATION_DAYS = 30;

/** The city the demo account prospects in. */
export const DEMO_CITY = "lille";

const ALL_SECTORS: SectorId[] = [
  "garage",
  "restaurant",
  "hairdresser",
  "bakery",
  "plumber",
  "beauty",
  "florist",
  "electrician",
];

const DEMO_USER: DemoUser = {
  firstName: "Camille",
  lastName: "Roux",
  email: "camille@studio-roux.fr",
  company: "Studio Roux",
};

const emptyData: AppData = {
  seeded: false,
  user: DEMO_USER,
  plan: "pro",
  cycle: "monthly",
  onboarded: true,
  zone: { cityId: DEMO_CITY, radiusKm: 2, sectors: ALL_SECTORS },
  lastScanAt: null,
  unlocked: [],
  pipeline: {},
  reservations: {},
  shared: {},
  opens: [],
  alerts: [],
  calls: [],
  territories: [],
  preferences: { "notify-open": true, "notify-new-business": true, "weekly-digest": false },
  upgradePrompt: null,
};

function without<T>(record: Record<string, T>, key: string): Record<string, T> {
  const copy = { ...record };
  delete copy[key];
  return copy;
}

function newId(): string {
  return crypto.randomUUID();
}

function atHour(now: number, daysAhead: number, hour: number, minute = 0): number {
  const date = new Date(now + daysAhead * DAY);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

/** A Pro account that looks three weeks old, so every screen has something to show. */
function buildSeed(now: number): AppData {
  // Businesses "reserved by another subscriber" cannot be in this account's pipeline.
  const opps = getOpportunities(DEMO_CITY).filter((business) => !takenByOthers(business.id));
  const pipeline: AppData["pipeline"] = {};
  const reservations: AppData["reservations"] = {};
  const shared: AppData["shared"] = {};
  const opens: MaquetteOpen[] = [];
  const alerts: AppAlert[] = [];
  let n = 0;
  const id = () => `seed-${++n}`;

  const stage = (index: number, value: PipelineStage, age: number, extra: Partial<PipelineEntry> = {}) => {
    const business = opps[index];
    if (!business) return;
    pipeline[business.id] = { stage: value, addedAt: now - age - 2 * DAY, updatedAt: now - age, ...extra };
  };
  const reserve = (index: number, age: number) => {
    const business = opps[index];
    if (business) reservations[business.id] = { at: now - age, until: now - age + RESERVATION_DAYS * DAY };
  };
  const share = (index: number, age: number, channel: SharedMaquette["channel"] = "sms") => {
    const business = opps[index];
    if (business) shared[business.id] = { da: business.recommendedDas[0], at: now - age, channel };
  };
  const open = (index: number, age: number) => {
    const business = opps[index];
    if (business) opens.push({ id: id(), businessId: business.id, da: business.recommendedDas[0], at: now - age });
  };

  stage(0, "to-call", 2 * HOUR);
  stage(1, "mockup-sent", 40 * MIN);
  stage(2, "meeting", DAY, { meetingAt: atHour(now, 1, 14) });
  stage(3, "called", DAY + 3 * HOUR);
  stage(4, "to-call", 5 * HOUR);
  stage(5, "to-call", 2 * DAY);
  stage(7, "won", 9 * DAY, { dealValue: opps[7]?.estimatedDeal });
  stage(9, "won", 3 * DAY, { dealValue: opps[9]?.estimatedDeal });
  stage(10, "lost", 6 * DAY);
  stage(12, "called", 4 * DAY);
  stage(14, "mockup-sent", 2 * DAY);
  stage(16, "meeting", 3 * DAY, { meetingAt: atHour(now, 3, 10, 30) });

  reserve(0, 2 * HOUR);
  reserve(1, 3 * DAY);
  reserve(2, 6 * DAY);
  reserve(3, 27 * DAY);
  reserve(14, 8 * DAY);
  reserve(16, 5 * DAY);

  share(1, 40 * MIN);
  share(2, 2 * DAY);
  share(7, 11 * DAY);
  share(9, 5 * DAY, "link");
  share(14, 2 * DAY);
  share(16, 4 * DAY);

  open(1, 12 * MIN);
  open(2, 2 * DAY);
  open(2, 2 * DAY - HOUR);
  open(14, DAY);
  open(16, 4 * DAY);
  open(9, 5 * DAY);
  open(7, 10 * DAY);

  if (opps[1]) {
    alerts.push({
      id: id(),
      kind: "mockup-opened",
      businessId: opps[1].id,
      title: `${opps[1].name} regarde sa maquette`,
      body: "Ouverte il y a quelques minutes. C'est le bon moment pour rappeler.",
      at: now - 12 * MIN,
      read: false,
    });
  }
  const registration = getNewRegistrations(DEMO_CITY)[0];
  if (registration) {
    alerts.push({
      id: id(),
      kind: "new-business",
      registrationId: registration.id,
      businessId: registration.businessId,
      title: `${registration.name} vient d'être immatriculé`,
      body: `${getSector(registration.sector).label}, ${registration.street}. Aucun site pour l'instant.`,
      at: now - 3 * HOUR,
      read: false,
    });
  }
  if (opps[2]) {
    alerts.push({
      id: id(),
      kind: "meeting-soon",
      businessId: opps[2].id,
      title: "Rendez-vous demain à 14 h",
      body: `${opps[2].name}, ${opps[2].address.street}.`,
      at: now - 20 * HOUR,
      read: true,
    });
  }
  if (opps[14]) {
    alerts.push({
      id: id(),
      kind: "mockup-opened",
      businessId: opps[14].id,
      title: `${opps[14].name} a ouvert sa maquette`,
      body: "Consultée deux minutes sur mobile.",
      at: now - DAY,
      read: true,
    });
  }
  if (opps[3]) {
    alerts.push({
      id: id(),
      kind: "reservation-ending",
      businessId: opps[3].id,
      title: "Une réservation se termine dans 3 jours",
      body: `${opps[3].name} redeviendra visible pour les autres abonnés.`,
      at: now - 2 * DAY,
      read: true,
    });
  }

  const outcomes: CallOutcome[] = ["voicemail", "callback", "meeting", "refused", "callback", "voicemail", "meeting"];
  const calls: CallLog[] = Array.from({ length: 18 }, (_, i) => {
    const business = opps[i % Math.max(1, Math.min(opps.length, 17))];
    return {
      id: id(),
      businessId: business?.id ?? "",
      at: now - (i * 15 + 2) * HOUR,
      outcome: outcomes[i % outcomes.length],
      durationSec: 35 + ((i * 53) % 260),
    };
  }).filter((call) => call.businessId);

  return {
    ...emptyData,
    seeded: true,
    lastScanAt: now - 5 * HOUR,
    unlocked: opps.slice(0, 26).map((business) => business.id),
    pipeline,
    reservations,
    shared,
    opens,
    alerts,
    calls,
  };
}

const noopStorage: StateStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...emptyData,

      setUser: (user) => set((state) => ({ user: { ...state.user, ...user } })),

      setPlan: (plan, cycle) =>
        set((state) => {
          // Dropping to a smaller plan keeps only what its quota allows (one sheet left to open on Découverte).
          const limit = getPlan(plan).limits.profilesPerMonth;
          const keep = plan === "free" ? limit - 1 : limit;
          return { plan, cycle: cycle ?? state.cycle, unlocked: state.unlocked.slice(0, keep) };
        }),

      setZone: (zone) => set((state) => ({ zone: { ...state.zone, ...zone } })),

      markScanned: () => set({ lastScanAt: Date.now() }),

      unlock: (businessId) => {
        const state = get();
        if (state.unlocked.includes(businessId)) return true;
        if (state.unlocked.length >= getPlan(state.plan).limits.profilesPerMonth) {
          set({ upgradePrompt: "full-profile" });
          return false;
        }
        set({ unlocked: [...state.unlocked, businessId] });
        return true;
      },

      setStage: (businessId, stage, extra) =>
        set((state) => {
          const now = Date.now();
          const previous = state.pipeline[businessId];
          const entry: PipelineEntry = { ...previous, ...extra, addedAt: previous?.addedAt ?? now, stage, updatedAt: now };
          if (stage === "won" && entry.dealValue === undefined) {
            entry.dealValue = getBusiness(businessId)?.estimatedDeal;
          }
          return { pipeline: { ...state.pipeline, [businessId]: entry } };
        }),

      updatePipelineEntry: (businessId, patch) =>
        set((state) => {
          const previous = state.pipeline[businessId];
          if (!previous) return state;
          return { pipeline: { ...state.pipeline, [businessId]: { ...previous, ...patch, updatedAt: Date.now() } } };
        }),

      removeFromPipeline: (businessId) =>
        set((state) => {
          return { pipeline: without(state.pipeline, businessId) };
        }),

      reserve: (businessId) => {
        const state = get();
        if (state.reservations[businessId]) return true;
        if (takenByOthers(businessId)) return false;
        const limit = getPlan(state.plan).limits.activeReservations;
        if (!can(state.plan, "lead-reservation") || Object.keys(state.reservations).length >= limit) {
          set({ upgradePrompt: "lead-reservation" });
          return false;
        }
        const now = Date.now();
        set({
          reservations: { ...state.reservations, [businessId]: { at: now, until: now + RESERVATION_DAYS * DAY } },
          // A reserved business is one you intend to call.
          pipeline: state.pipeline[businessId]
            ? state.pipeline
            : { ...state.pipeline, [businessId]: { stage: "to-call", addedAt: now, updatedAt: now } },
        });
        return true;
      },

      release: (businessId) =>
        set((state) => {
          return { reservations: without(state.reservations, businessId) };
        }),

      shareMaquette: (businessId, da, channel) =>
        set((state) => {
          const now = Date.now();
          const previous = state.pipeline[businessId];
          const early = !previous || previous.stage === "to-call" || previous.stage === "called";
          return {
            shared: { ...state.shared, [businessId]: { da, at: now, channel } },
            pipeline: early
              ? {
                  ...state.pipeline,
                  [businessId]: { ...previous, addedAt: previous?.addedAt ?? now, stage: "mockup-sent", updatedAt: now },
                }
              : state.pipeline,
          };
        }),

      recordOpen: (businessId, da) => {
        const business = getBusiness(businessId);
        if (!business) return null;
        const now = Date.now();
        const alert: AppAlert = {
          id: newId(),
          kind: "mockup-opened",
          businessId,
          title: `${business.name} regarde sa maquette`,
          body: "Ouverte à l'instant. C'est le bon moment pour rappeler.",
          at: now,
          read: false,
        };
        set((state) => ({
          opens: [{ id: newId(), businessId, da, at: now }, ...state.opens],
          alerts: [alert, ...state.alerts],
        }));
        return alert;
      },

      addNewBusinessAlert: (registration) => {
        const alert: AppAlert = {
          id: newId(),
          kind: "new-business",
          registrationId: registration.id,
          businessId: registration.businessId,
          title: `${registration.name} vient d'être immatriculé`,
          body: `${getSector(registration.sector).label}, ${registration.street}. Aucun site pour l'instant.`,
          at: Date.now(),
          read: false,
        };
        set((state) => ({ alerts: [alert, ...state.alerts] }));
        return alert;
      },

      markAlertRead: (id) =>
        set((state) => ({
          alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, read: true } : alert)),
        })),

      markAllAlertsRead: () =>
        set((state) => ({ alerts: state.alerts.map((alert) => ({ ...alert, read: true })) })),

      logCall: (businessId, outcome, durationSec) =>
        set((state) => {
          const now = Date.now();
          const previous = state.pipeline[businessId];
          let stage: PipelineStage = previous?.stage ?? "called";
          if (outcome === "meeting") stage = "meeting";
          else if (outcome === "refused") stage = "lost";
          else if (!previous || previous.stage === "to-call") stage = "called";
          return {
            calls: [{ id: newId(), businessId, at: now, outcome, durationSec }, ...state.calls],
            pipeline: {
              ...state.pipeline,
              [businessId]: { ...previous, addedAt: previous?.addedAt ?? now, stage, updatedAt: now },
            },
          };
        }),

      claimTerritory: (cityId, sector) => {
        const state = get();
        const key = territoryKey(cityId, sector);
        if (state.territories.includes(key)) return true;
        const limit = getPlan(state.plan).limits.territories;
        if (!can(state.plan, "territory")) {
          set({ upgradePrompt: "territory" });
          return false;
        }
        if (state.territories.length >= limit) return false;
        set({ territories: [...state.territories, key] });
        return true;
      },

      releaseTerritory: (key) =>
        set((state) => ({ territories: state.territories.filter((item) => item !== key) })),

      setPreference: (key, value) =>
        set((state) => ({ preferences: { ...state.preferences, [key]: value } })),

      promptUpgrade: (feature) => set({ upgradePrompt: feature }),
      dismissUpgrade: () => set({ upgradePrompt: null }),

      resetDemo: () => set(buildSeed(Date.now())),

      startFresh: (user) =>
        set((state) => ({
          ...emptyData,
          seeded: true,
          plan: "free",
          onboarded: false,
          user: { ...state.user, ...user },
        })),

      completeOnboarding: (zone) => set({ zone, onboarded: true, lastScanAt: null }),
    }),
    {
      name: "pignon-demo",
      version: 2,
      // A state saved by an earlier version is dropped: the demo account is rebuilt.
      migrate: () => ({}) as AppState,
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : window.localStorage)),
      partialize: (state) => ({ ...state, upgradePrompt: null }),
    },
  ),
);

// First visit in this browser: fill the demo account. Client only (the seed reads the clock).
if (typeof window !== "undefined" && !useAppStore.getState().seeded) {
  useAppStore.setState(buildSeed(Date.now()));
}

/** True when the current plan includes the feature. */
export function useCan(feature: FeatureId): boolean {
  return useAppStore((state) => can(state.plan, feature));
}

export function usePlan() {
  return getPlan(useAppStore((state) => state.plan));
}

/** Full sheets opened this month against the plan's quota. */
export function useQuota() {
  const used = useAppStore((state) => state.unlocked.length);
  const limit = usePlan().limits.profilesPerMonth;
  return { used, limit, remaining: Math.max(0, limit - used) };
}

export function useIsUnlocked(businessId: string): boolean {
  return useAppStore((state) => state.unlocked.includes(businessId));
}

export function useUnreadAlerts(): number {
  return useAppStore((state) => state.alerts.reduce((count, alert) => count + (alert.read ? 0 : 1), 0));
}

const subscribeNever = () => () => {};

/** False on the server and during hydration, true afterwards. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
}

/** A clock for relative times ("il y a 12 min"), refreshed every `intervalMs`. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/** On Découverte, a business whose sheet was not opened shows a masked name and no contact details. */
export function useIsMasked(businessId: string): boolean {
  return useAppStore((state) => state.plan === "free" && !state.unlocked.includes(businessId));
}
