import localforage from "localforage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { CrisisEvent } from "@/types/crisis-event";

export type CrisisLevel = "high" | "immediate" | "acute" | "none";
export type CrisisState = "none" | "detected" | "confirmed" | "safe";

interface CrisisStoreState {
  crisisLevel: "high" | "immediate" | "acute" | "none";
  crisisState: CrisisState;
  lastDetectedAt?: number;
  lastResolvedAt?: number;
  source?: "reflection" | "analysis";
  events: CrisisEvent[];
  updateEvent: (id: string, updates: Partial<CrisisEvent> | ((event: CrisisEvent) => CrisisEvent)) => void;
  getLastEvent: () => CrisisEvent | null;
  setCrisisLevel: (level: "high" | "immediate" | "acute" | "none") => void;
  setCrisisState: (state: CrisisState) => void;
  confirmSafety: () => void;
  addEvent: (event: CrisisEvent) => void;
  reset: () => void;
}

const CrisisStoreInitialState: Pick<
  CrisisStoreState,
  "crisisLevel" | "crisisState" | "lastDetectedAt" | "lastResolvedAt" | "source" | "events"
> = {
  crisisLevel: "none",
  crisisState: "none",
  events: [],
};

export const useCrisisStore = create<CrisisStoreState>()(
  persist(
    (set, get) => ({
      ...CrisisStoreInitialState,
      getLastEvent: () => get().events.at(-1) || null,
      setCrisisLevel: (level) => set({ crisisLevel: level }),
      setCrisisState: (state) => set({ crisisState: state }),
      confirmSafety: () =>
        set((state) => {
          const updatedEvents = state.events.map((e) =>
            !e.resolvedAt ? { ...e, confirmedSafe: true, resolvedAt: Date.now() } : e
          );
          return { crisisState: "safe", lastResolvedAt: Date.now(), events: updatedEvents };
        }),
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, event],
          crisisLevel: event.level,
          lastDetectedAt: event.detectedAt,
          crisisState: "detected",
        })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      reset: () => set(CrisisStoreInitialState),
    }),
    {
      name: "crisis-store",
      storage: createJSONStorage(() => localforage),
    }
  )
);
