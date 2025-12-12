import { create } from "zustand";

import { ChatMessage } from "@/domains/shared-types";
import { Analysis } from "./analysis/analysis.types";
import { INITIAL_REFLECTION_METADATA, Metadata } from "./reflection/reflection.types";

interface SessionStoreState {
  messages: ChatMessage[];
  analyses: Analysis[];
  metadata: Metadata;
  addMessage: (message: ChatMessage) => void;
  setMetadata: (metadata: Metadata) => void;
  reset: () => void;
}

const initialStoreState = {
  messages: [],
  analyses: [],
  metadata: INITIAL_REFLECTION_METADATA,
};

export const useSessionStore = create<SessionStoreState>()((set, get) => ({
  ...initialStoreState,
  addMessage: (message: ChatMessage) => set({ messages: [...get().messages, message] }),

  setMetadata: (metadata) => set({ metadata }),
  reset: () => set(initialStoreState),
}));
