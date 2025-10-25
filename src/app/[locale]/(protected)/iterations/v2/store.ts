import { create } from "zustand";

import { OpenChatMessage } from "@/types/open-chat-message.types";
import { EngineConfig, HolisticEngineOutput, RelationalTraceApp } from "./types";

export type StoreData = Partial<Pick<EngineStoreState, "config" | "relationalTrace" | "lastOutput">>;

const defaultConfig: EngineConfig = {
  warmth_clamp_delta: 1,
  psychoedu_cooldown_turns: 4,
  micro_breath_cooldown: 2,
};

interface EngineStoreState {
  messages: OpenChatMessage[];
  config: EngineConfig;
  relationalTrace: RelationalTraceApp;
  lastOutput: HolisticEngineOutput | null;
  crisisLevel: "high" | "immediate" | "resolved" | "none";
  addMessage: (message: OpenChatMessage) => void;
  setConfig: (cfg: Partial<EngineConfig>) => void;
  setCrisisLevel: (level: "high" | "immediate" | "resolved" | "none") => void;
  setRelationalTrace: (trace: RelationalTraceApp) => void;
  setLastOutput: (output: HolisticEngineOutput) => void;
  setData: (data: StoreData) => void;
  reset: () => void;
}

const initialState: Pick<EngineStoreState, "messages" | "config" | "relationalTrace" | "lastOutput" | "crisisLevel"> = {
  messages: [],
  config: defaultConfig,
  relationalTrace: {},
  lastOutput: null,
  crisisLevel: "none",
};

export const userEngineStore = create<EngineStoreState>((set, get) => ({
  ...initialState,
  addMessage: (message: OpenChatMessage) => set({ messages: [...get().messages, message] }),
  setCrisisLevel: (level: "high" | "immediate" | "resolved" | "none") => set({ crisisLevel: level }),
  setLastOutput: (output: HolisticEngineOutput) => set({ lastOutput: output }),
  setRelationalTrace: (trace: RelationalTraceApp) => set({ relationalTrace: trace }),
  setConfig: (cfg) => set((s) => ({ config: { ...s.config, ...cfg } })),
  setData: (data) => set(data),
  reset: () => set(initialState),
}));
