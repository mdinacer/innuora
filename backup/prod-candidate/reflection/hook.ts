import { OpenChatMessage } from "@/types/open-chat-message.types";
import { FactualMemory } from "../memory/analysis/types";
import { ReflectionDirective } from "../reflection-directive/types";
import { useConversationStore } from "../stores/use-conversation-store";
import { generateReflection } from "./actions";
import { ReflectiveResponse, RelationalTraceApp } from "./types";

export default function useHandleReflection() {
  const handleReflection = async (
    input: string,
    directive: ReflectionDirective,
    messagesWindow: OpenChatMessage[],
    matches?: FactualMemory[]
  ) => {
    const conversationStore = useConversationStore.getState();

    const { relationalTrace } = conversationStore;

    const reflectionResults = await generateReflection(
      input,
      messagesWindow,
      directive,
      relationalTrace as RelationalTraceApp,
      matches
    );

    const { nextTrace, tokenUsage, data } = reflectionResults;

    conversationStore.setRelationalTrace(nextTrace);

    return {
      data: data as ReflectiveResponse,
      tokenUsage,
      elapsedTime: reflectionResults.elapsedMs,
    };
  };

  return { handleReflection };
}
