"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

interface OrderState {
  /** Business ids in the order the cards were placed by hand, all stages together */
  order: string[];
  setOrder: (order: string[]) => void;
}

const noopStorage: StateStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

/**
 * Where each card was dropped. The shared store keeps a stage but no position,
 * so the board remembers the manual order here (see `orderedIds`).
 */
export const usePipelineOrder = create<OrderState>()(
  persist((set) => ({ order: [], setOrder: (order) => set({ order }) }), {
    name: "pignon-pipeline-ordre",
    storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage : window.localStorage)),
  }),
);
