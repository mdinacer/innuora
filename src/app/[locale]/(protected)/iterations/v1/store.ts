import { create } from "zustand";

import { OpenChatMessage } from "@/types/open-chat-message.types";
import { EmotionalReadingResult, ReflectiveExpressionResponse, RelationalTrace } from "./types";

interface MockStoreState {
  messages: OpenChatMessage[];
  emotionalReadings: EmotionalReadingResult[];
  reflections: (ReflectiveExpressionResponse & { messageId: string })[];
  crisisLevel: "high" | "immediate" | "resolved" | "none";
  relationalTraces: RelationalTrace[];
  addRelationalTrace: (trace: RelationalTrace) => void;
  addEmotionalReading: (reading: EmotionalReadingResult) => void;
  addMessage: (message: OpenChatMessage) => void;
  addReflection: (messageId: string, reflection: ReflectiveExpressionResponse) => void;
  setCrisisLevel: (level: "high" | "immediate" | "resolved" | "none") => void;
  reset: () => void;
}

const initialState: Pick<
  MockStoreState,
  "messages" | "emotionalReadings" | "reflections" | "relationalTraces" | "crisisLevel"
> = {
  messages: [],
  emotionalReadings: [],
  crisisLevel: "none",
  reflections: [],
  relationalTraces: [],
};

export const useMockStore = create<MockStoreState>((set, get) => ({
  ...initialState,
  addMessage: (message: OpenChatMessage) => set({ messages: [...get().messages, message] }),
  addEmotionalReading: (reading: EmotionalReadingResult) =>
    set({ emotionalReadings: [...get().emotionalReadings, reading] }),
  addReflection: (messageId: string, reflection: ReflectiveExpressionResponse) =>
    set({ reflections: [...get().reflections, { ...reflection, messageId }] }),
  addRelationalTrace: (trace: RelationalTrace) => set({ relationalTraces: [...get().relationalTraces, trace] }),
  setCrisisLevel: (level: "high" | "immediate" | "resolved" | "none") => set({ crisisLevel: level }),
  reset: () => set(initialState),
}));
