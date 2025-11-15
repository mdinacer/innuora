import { create } from "zustand";

import { AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { ReflectionDirective } from "./directive/types";
import { ReflectiveResponse } from "./reflection/types";

const mergeDeep = <T>(target: T, source: Partial<T>): T => {
  if (typeof target !== "object" || typeof source !== "object" || !target || !source) return source as T;

  const result = { ...target };
  for (const key in source) {
    const value = source[key];
    result[key] = typeof value === "object" && value !== null ? mergeDeep((target as any)[key], value) : value;
  }
  return result as T;
};

type EntryData<T = unknown> = {
  data: T;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cachedTokens?: number;
    cost: number;
  } | null;
  model: AIModelCategory;
  timeElapsed: number;
};

export interface TestEntry {
  userInput?: string;
  reflection?: EntryData<ReflectiveResponse>;
  directive?: EntryData<ReflectionDirective>;
}

interface TestStoreState {
  entries: Record<string, TestEntry>;
  setEntries: (entries: Record<string, TestEntry>) => void;
  addEntry: (entryId: string, entry: TestEntry) => void;
  updateEntry: (entryId: string, updater: Partial<TestEntry> | ((prev: TestEntry) => TestEntry)) => void;
  resetEntries: () => void;
}

export const useTestStore = create<TestStoreState>((set) => ({
  entries: {},

  setEntries: (entries) => set({ entries }),

  addEntry: (entryId, entry) =>
    set((state) => ({
      entries: { ...state.entries, [entryId]: entry },
    })),

  updateEntry: (entryId, updater) =>
    set((state) => {
      const prev = state.entries[entryId];
      if (!prev) return state;

      const updated = typeof updater === "function" ? updater(prev) : mergeDeep(prev, updater);

      return {
        entries: {
          ...state.entries,
          [entryId]: updated,
        },
      };
    }),

  resetEntries: () => set({ entries: {} }),
}));
