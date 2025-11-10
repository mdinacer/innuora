import { useState } from "react";

import { generateMessageId } from "@/domains/session-flow/utils/generate-id";
import useAnalyzeMemory from "./memory/analysis/hook";
import { FactualMemory, MemoryCue } from "./memory/analysis/types";
import { recallMemoriesFromCues } from "./memory/analysis/utils";
import useHandleDirective from "./reflection-directive/hook";
import useHandleReflection from "./reflection/hook";
import { useConversationStore } from "./stores/use-conversation-store";
import { useTelemetryStore } from "./stores/use-telemetry-store";

const MESSAGES_WINDOW_SIZE = 8;

export default function useProcessInput() {
  const [isProcessing, setProcessing] = useState(false);

  const { handleReflection } = useHandleReflection();
  const { handleMemoryAnalysis } = useAnalyzeMemory();
  const { handleReflectionDirective } = useHandleDirective();

  const handleRecallMemory = (cures: MemoryCue[]): FactualMemory[] => {
    if (!cures.length) return [] as [];
    const factualMemory = useConversationStore.getState().factualMemory;

    const matches = recallMemoriesFromCues(cures, factualMemory);

    return matches;
  };

  const processUserInput = async (input: string) => {
    if (!input.trim()) throw new Error("Empty input");
    setProcessing(true);

    const conversationStore = useConversationStore.getState();
    const telemetryStore = useTelemetryStore.getState();

    try {
      const { relationalTrace } = conversationStore;

      const updatedMessages = [...conversationStore.messages];
      const messagesWindow = updatedMessages.slice(-MESSAGES_WINDOW_SIZE);

      const messageId = generateMessageId();

      conversationStore.addMessage({
        id: messageId,
        role: "user",
        content: input,
        timestamp: Date.now(),
      });

      // const memoryAnalysisPromise = handleMemoryAnalysis(input).catch((e: unknown) => {
      //   console.error("[Innuora] handleMemoryAnalysis error:", e);
      //   return {
      //     data: null,
      //     tokenUsage: null,
      //     elapsedMs: 0,
      //     error: e,
      //   };
      // });

      // ─────────────────────────────────────────────
      // 1️⃣ Progressive Memory Analysis (only on the message that fell out of window)
      let memoryAnalysisPromise: Promise<any> | null = null;
      if (updatedMessages.length > MESSAGES_WINDOW_SIZE) {
        const indexToAnalyze = updatedMessages.length - MESSAGES_WINDOW_SIZE - 1;
        const msgToAnalyze = updatedMessages[indexToAnalyze];

        if (msgToAnalyze.role === "user") {
          //msgToAnalyze.memoryProcessed = true;
          memoryAnalysisPromise = handleMemoryAnalysis(msgToAnalyze.content).catch((e: unknown) => {
            console.error("[Innuora] handleMemoryAnalysis error:", e);
            return { data: null, tokenUsage: null, elapsedMs: 0, error: e };
          });
        }
      }
      // ─────────────────────────────────────────────

      const directiveResults = await handleReflectionDirective(input, relationalTrace);

      if (directiveResults.tokenUsage) {
        telemetryStore.updateTokenTelemetry("background", "reflective_directive", directiveResults.tokenUsage);
      }

      const memoryAnalysisResults = memoryAnalysisPromise ? await memoryAnalysisPromise : { data: null };
      if (memoryAnalysisResults?.tokenUsage) {
        telemetryStore.updateTokenTelemetry("background", "memory_analysis", memoryAnalysisResults.tokenUsage);
      }

      let memoryMatches: FactualMemory[] = [];

      if (memoryAnalysisResults?.data) {
        const { memory_cues = [] } = memoryAnalysisResults.data;
        console.log("Should Recall");

        memoryMatches = handleRecallMemory(memory_cues);
      }

      // ───────────────── Reflection (GPT-4o)
      const reflectionResults = await handleReflection(input, directiveResults.response, messagesWindow, memoryMatches);
      if (!reflectionResults?.data) throw new Error("No reflection output");

      if (reflectionResults.tokenUsage) {
        telemetryStore.updateTokenTelemetry("reflection", "reflection", reflectionResults.tokenUsage);
      }

      const reflectionData = reflectionResults.data;

      const content = [
        reflectionData.reflection,
        reflectionData.psychoeducation?.content,
        reflectionData.follow_up_question,
      ]
        .filter(Boolean)
        .join("\n\n");

      telemetryStore.addEntry(messageId, {
        userInput: input.trim(),
        memory: {
          extracted: memoryAnalysisResults?.data?.extracted_memories,
          cues: memoryAnalysisResults?.data?.memory_cues,
          matches: memoryMatches,
          recalled: memoryMatches.length > 0,
          timeElapsed: memoryAnalysisResults.elapsedMs,
        },
        directive: {
          data: directiveResults.response,
          timeElapsed: directiveResults.elapsedMs,
        },
        reflection: {
          data: reflectionResults.data,
          timeElapsed: reflectionResults.elapsedTime,
        },
      });

      conversationStore.addMessage({
        id: generateMessageId(),
        role: "assistant",
        content,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("[Innuora] processUserInput error:", err);
      throw err;
    } finally {
      setProcessing(false);
    }
  };

  return { isProcessing, processUserInput };
}
