import { create } from "zustand";
import type {
  ConversationMessage,
  ContinuousMemory,
} from "../types/continuous-memory.types";

interface ConversationState {
  messages: ConversationMessage[];
  memory: ContinuousMemory | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addMessage: (message: ConversationMessage) => void;
  updateMemory: (memory: ContinuousMemory) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
  messages: [],
  memory: null,
  isLoading: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMemory: (memory) =>
    set({
      memory,
    }),

  setLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  setError: (error) =>
    set({
      error,
    }),

  clearConversation: () =>
    set({
      messages: [],
      memory: null,
      error: null,
    }),
}));
