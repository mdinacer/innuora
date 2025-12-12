import { create } from "zustand";

import { ChatMessage } from "@/domains/shared-types";
import { Analysis } from "./analysis/analysis.types";
import { INITIAL_RELATIONAL_TRACE, RelationalTrace } from "./reflection/reflection.types";

interface SessionStoreState {
  messages: ChatMessage[];
  analyses: Analysis[];
  relationalTrace: RelationalTrace;
  addAnalysis: (analysis: Analysis) => void;
  addMessage: (message: ChatMessage) => void;
  setRelationalTrace: (trace: RelationalTrace) => void;
  reset: () => void;
}

const initialStoreState = {
  messages: [],
  analyses: [],
  relationalTrace: INITIAL_RELATIONAL_TRACE,
};

export const useSessionStore = create<SessionStoreState>()((set, get) => ({
  ...initialStoreState,
  addMessage: (message: ChatMessage) => set({ messages: [...get().messages, message] }),
  addAnalysis: (analysis: Analysis) => set({ analyses: [...get().analyses, analysis] }),
  setRelationalTrace: (trace) => set({ relationalTrace: trace }),
  reset: () => set(initialStoreState),
}));
