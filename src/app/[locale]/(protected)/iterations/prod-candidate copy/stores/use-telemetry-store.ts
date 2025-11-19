import { create } from "zustand";

import { AIModelCategory, calculateModelCost } from "@/domains/ai-conversation/ai-models";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { ReflectionDirective } from "../directive/types";
import { MemoryAnalysis } from "../memory/types";
import { ReflectiveResponse } from "../reflection/types";
import { SessionWellness } from "../wellness/types";

/* ---------- Helpers ---------- */

const mergeDeep = <T>(target: T, source: Partial<T>): T => {
  if (Array.isArray(source)) return source as T;
  if (typeof target !== "object" || typeof source !== "object" || !target || !source) return source as T;

  const result = { ...target };
  for (const key in source) {
    const value = source[key];
    result[key] = typeof value === "object" && value !== null ? mergeDeep((target as any)[key], value) : value;
  }
  return result as T;
};

/* ---------- Types ---------- */

type AIProcessType = "memory_analysis" | "reflective_directive" | "reflection" | "session_wellness";

type EntryData<T = unknown> = {
  data: T | null;
  timeElapsed: number;
};

export interface TestEntry {
  userInput: string;
  reflection?: EntryData<ReflectiveResponse>;
  memoryAnalysis?: EntryData<MemoryAnalysis | null>;
  directive?: EntryData<ReflectionDirective>;
  wellness?: EntryData<SessionWellness>;
  [key: string]: unknown;
}

interface TokenBucket {
  prompt: number;
  completion: number;
  cached: number;
  cost: number;
}

export interface TokenTelemetry {
  totalPrompt: number;
  totalCompletion: number;
  totalCached: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, TokenBucket>;
  byProcess: Record<string, TokenBucket>;
}

export const DEFAULT_TELEMETRY: TokenTelemetry = {
  totalPrompt: 0,
  totalCompletion: 0,
  totalCached: 0,
  totalTokens: 0,
  totalCost: 0,
  byModel: {},
  byProcess: {},
};

/* ---------- Store ---------- */

interface TelemetryStore {
  rounds: Record<string, TestEntry>;
  tokenTelemetry: TokenTelemetry;

  updateTokenTelemetry: (model: AIModelCategory, process: AIProcessType, usage: ModelTokenUsage) => void;
  resetTelemetry: () => void;

  setEntries: (entries: Record<string, TestEntry>) => void;
  addEntry: (entryId: string, entry: TestEntry) => void;
  updateEntry: (entryId: string, updater: Partial<TestEntry> | ((prev: TestEntry) => TestEntry)) => void;
  resetEntries: () => void;
}

const initialTelemetryState: Pick<TelemetryStore, "tokenTelemetry" | "rounds"> = {
  tokenTelemetry: DEFAULT_TELEMETRY,
  rounds: {},
};

export const useTelemetryStore = create<TelemetryStore>((set) => ({
  ...initialTelemetryState,

  updateTokenTelemetry: (model, process, usage) =>
    set((state) => {
      const telemetry = { ...state.tokenTelemetry };

      if (!telemetry.byProcess[process])
        telemetry.byProcess[process] = { prompt: 0, completion: 0, cached: 0, cost: 0 };
      if (!telemetry.byModel[model]) telemetry.byModel[model] = { prompt: 0, completion: 0, cached: 0, cost: 0 };

      const { promptTokens, completionTokens, cachedTokens } = usage;
      const { total: cost } = calculateModelCost(model, promptTokens, completionTokens, cachedTokens);

      const updateBucket = (bucket: TokenBucket) => {
        bucket.prompt += promptTokens;
        bucket.completion += completionTokens;
        bucket.cached += cachedTokens;
        bucket.cost += cost;
      };

      updateBucket(telemetry.byProcess[process]);
      updateBucket(telemetry.byModel[model]);

      telemetry.totalPrompt += promptTokens;
      telemetry.totalCompletion += completionTokens;
      telemetry.totalCached += cachedTokens;
      telemetry.totalTokens += promptTokens + completionTokens;
      telemetry.totalCost += cost;

      return { tokenTelemetry: telemetry };
    }),

  resetTelemetry: () =>
    set((state) => ({
      ...state,
      tokenTelemetry: structuredClone(DEFAULT_TELEMETRY),
    })),

  /* ---- Rounds management ---- */

  setEntries: (rounds) => set({ rounds }),

  addEntry: (entryId, entry) =>
    set((state) => ({
      rounds: { ...state.rounds, [entryId]: entry },
    })),

  updateEntry: (entryId, updater) =>
    set((state) => {
      const prev = state.rounds[entryId];
      if (!prev) return state;

      const updated = typeof updater === "function" ? updater(prev) : mergeDeep(prev, updater);

      return {
        rounds: { ...state.rounds, [entryId]: updated },
      };
    }),

  resetEntries: () => set({ rounds: {} }),
}));
