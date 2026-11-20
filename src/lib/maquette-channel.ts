import type { DaId } from "./types";

/**
 * How the public mockup page tells the app "the shop owner just opened it" without a backend:
 * a localStorage queue (survives the app being closed) plus a BroadcastChannel ping (instant, same browser).
 */

const CHANNEL = "pignon-maquette";
const QUEUE_KEY = "pignon-maquette-opens";

export interface MaquetteOpenMessage {
  slug: string;
  da: DaId;
  at: number;
}

function readQueue(): MaquetteOpenMessage[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]") as MaquetteOpenMessage[];
  } catch {
    return [];
  }
}

/** Call once when a visitor opens a mockup outside the app (never in embed mode). Browser only. */
export function announceMaquetteOpen(slug: string, da: DaId): void {
  try {
    const message: MaquetteOpenMessage = { slug, da, at: Date.now() };
    localStorage.setItem(QUEUE_KEY, JSON.stringify([...readQueue(), message].slice(-20)));
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch {
    // Storage or BroadcastChannel unavailable: the mockup still works, the alert is skipped.
  }
}

/** Used by the app shell. Delivers each open exactly once, including those queued while the app was closed. */
export function subscribeMaquetteOpens(onOpen: (message: MaquetteOpenMessage) => void): () => void {
  const drain = () => {
    const queue = readQueue();
    if (queue.length === 0) return;
    localStorage.removeItem(QUEUE_KEY);
    queue.forEach(onOpen);
  };
  drain();
  const channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = drain;
  return () => channel.close();
}
