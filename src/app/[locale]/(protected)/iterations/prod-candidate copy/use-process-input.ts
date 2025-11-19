import { useState } from "react";

import { generateId, generateMessageId } from "@/domains/session-flow/utils/generate-id";
import { useCrisisStore } from "@/stores/crisis-store";
import { CrisisEvent } from "@/types/crisis-event";
import useHandleDirective from "./directive/hook";
import useAnalyzeMemory from "./memory/hook";
import { FactualMemory, MemoryCue } from "./memory/types";
import { recallMemoriesFromCues } from "./memory/utils";
import useHandleReflection from "./reflection/hook";
import { useConversationStore } from "./stores/use-conversation-store";
import { useTelemetryStore } from "./stores/use-telemetry-store";
import useWellnessCheck from "./wellness/hook";

const MESSAGES_WINDOW_SIZE = 8;

export default function useProcessInput() {
  const [isProcessing, setProcessing] = useState(false);
  useWellnessCheck();

  const { handleReflection } = useHandleReflection();
  const { handleMemoryAnalysis } = useAnalyzeMemory();
  const { handleReflectionDirective } = useHandleDirective();

  const handleCrisis = (
    level: "high" | "immediate" | "acute",
    source: "reflection" | "analysis",
    rationale?: string
  ) => {
    const crisisStoreState = useCrisisStore.getState();

    crisisStoreState.setCrisisLevel(level);
    crisisStoreState.setCrisisState("detected");

    const event: CrisisEvent = {
      id: generateId("crisis"),
      detectedAt: Date.now(),
      level: level,
      confirmedSafe: false,
      source,
      notes: rationale,
    };

    crisisStoreState.addEvent(event);
  };

  const handleRecallMemory = (cues: MemoryCue[]): FactualMemory[] => {
    if (!cues.length) return [];
    const factualMemory = useConversationStore.getState().factualMemory;
    return recallMemoriesFromCues(cues, factualMemory);
  };

  const processUserInput = async (input: string) => {
    if (!input.trim()) throw new Error("Empty input");
    setProcessing(true);

    const conversationStore = useConversationStore.getState();
    const crisisStoreState = useCrisisStore.getState();

    if (["detected", "confirmed"].includes(crisisStoreState.crisisState)) {
      console.warn("[Innuora] Crisis detected, skipping input");
      return;
    }
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

      // ─────────────────────────────────────────────
      // 1️⃣ Progressive Memory Analysis (background on older message)
      let memoryAnalysisPromise: Promise<any> | null = null;

      if (updatedMessages.length > MESSAGES_WINDOW_SIZE) {
        const indexToAnalyze = updatedMessages.length - MESSAGES_WINDOW_SIZE - 2;
        const msgToAnalyze = updatedMessages[indexToAnalyze];

        if (msgToAnalyze?.role === "user") {
          memoryAnalysisPromise = handleMemoryAnalysis(msgToAnalyze.content).catch((e: unknown) => {
            console.error("[Innuora] handleMemoryAnalysis error:", e);
            return { data: null, tokenUsage: null, elapsedMs: 0, error: e };
          });
        }
      }

      // ─────────────────────────────────────────────
      // 2️⃣ Run directive + memory (if any) in parallel
      const [directiveSettled, memorySettled] = await Promise.allSettled([
        handleReflectionDirective(input, relationalTrace),
        memoryAnalysisPromise,
      ]);

      const directiveResults =
        directiveSettled.status === "fulfilled"
          ? directiveSettled.value
          : { response: null, tokenUsage: null, elapsedMs: 0, error: directiveSettled.reason };

      if (!directiveResults?.response) throw new Error("No directive output");

      const memoryAnalysisResults =
        memorySettled?.status === "fulfilled" && memorySettled.value
          ? memorySettled.value
          : { data: null, elapsedMs: 0, tokenUsage: null };

      if (!directiveResults?.response) throw new Error("No directive output");

      if (["high", "immediate"].includes(directiveResults.response.crisis)) {
        handleCrisis(
          directiveResults.response.crisis as "high" | "immediate",
          "analysis",
          directiveResults.response.rationale
        );
        return;
      }

      if (directiveResults?.tokenUsage) {
        telemetryStore.updateTokenTelemetry("background", "reflective_directive", directiveResults.tokenUsage);
      }
      if (memoryAnalysisResults?.tokenUsage) {
        telemetryStore.updateTokenTelemetry("background", "memory_analysis", memoryAnalysisResults.tokenUsage);
      }

      let memoryMatches: FactualMemory[] = [];
      if (memoryAnalysisResults?.data?.memory_cues?.length) {
        memoryMatches = handleRecallMemory(memoryAnalysisResults.data.memory_cues);
      }

      // ─────────────────────────────────────────────
      // 3️⃣ Reflection (depends on directive)
      const reflectionResults = await handleReflection(input, directiveResults.response, messagesWindow, memoryMatches);

      if (!reflectionResults?.data) throw new Error("No reflection output");

      if (reflectionResults.data.signals.crisis === "acute") {
        handleCrisis("acute", "reflection");
      }

      if (reflectionResults.tokenUsage) {
        telemetryStore.updateTokenTelemetry("reflection", "reflection", reflectionResults.tokenUsage);
      }

      // ─────────────────────────────────────────────
      // 4️⃣ Combine & store results
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
        content: reflectionData.reflection,
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
