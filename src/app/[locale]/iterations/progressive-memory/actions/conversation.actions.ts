"use server";

import { processAiPrompts } from "@/app/actions/ai-client-actions";
import { buildReflectionPrompt } from "../prompts/memory-extraction.prompt";
import { updateMemory } from "../services/memory-update.service";
import type { ContinuousMemory, ConversationMessage } from "../types/continuous-memory.types";
import { createEmptyMemory } from "../types/continuous-memory.types";

/**
 * Handle user message and generate response with memory update
 */
export async function handleConversation(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  currentMemory: ContinuousMemory | null
): Promise<{
  assistantMessage: string;
  updatedMemory: ContinuousMemory;
  error?: string;
}> {
  try {
    // Initialize memory if first conversation
    const memory = currentMemory || createEmptyMemory();

    // Generate reflection using current memory
    const reflectionPrompt = buildReflectionPrompt(
      userMessage,
      memory,
      conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
    );

    const result = await processAiPrompts(
      [
        {
          role: "system",
          content:
            "You are a warm, understanding companion for women. Provide clarity and meaning, not just companionship. Be warm but not clinical.",
        },
        { role: "user", content: reflectionPrompt },
      ],
      { temperature: 0.7, model: "background" }
    );

    if (result.error) {
      throw new Error(result.error.message || "Failed to generate response");
    }

    const assistantMessage = result.data.message;

    // Update memory with this conversation
    const updatedMemory = await updateMemory(userMessage, assistantMessage, memory);

    return {
      assistantMessage,
      updatedMemory,
    };
  } catch (error) {
    console.error("Error in handleConversation:", error);
    return {
      assistantMessage: "I'm having trouble responding right now. Please try again.",
      updatedMemory: currentMemory || createEmptyMemory(),
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get memory summary for debugging/display
 */
export async function getMemorySummary(memory: ContinuousMemory): Promise<string> {
  const parts: string[] = [];

  parts.push(`## Session Count: ${memory.sessionCount}`);
  parts.push(`## Last Updated: ${new Date(memory.lastUpdated).toLocaleString()}`);

  if (Object.keys(memory.lifeContext.relationships).length > 0) {
    parts.push("\n### Life Context:");
    parts.push(JSON.stringify(memory.lifeContext, null, 2));
  }

  if (memory.emotionalPatterns.recurringFeelings.length > 0) {
    parts.push("\n### Emotional Patterns:");
    parts.push(`- Feelings: ${memory.emotionalPatterns.recurringFeelings.join(", ")}`);
    if (memory.emotionalPatterns.emotionalTriggers.length > 0) {
      parts.push(`- Triggers: ${memory.emotionalPatterns.emotionalTriggers.join(", ")}`);
    }
  }

  if (memory.relationalPatterns.withPartner) {
    parts.push("\n### Partner Dynamic:");
    parts.push(`- Pattern: ${memory.relationalPatterns.withPartner.pattern}`);
    parts.push(`- Underlying: ${memory.relationalPatterns.withPartner.underlyingDynamic}`);
  }

  if (memory.behavioralPatterns.whatSheDoesRepeatedly.length > 0) {
    parts.push("\n### Behavioral Patterns:");
    parts.push(`- Repeatedly: ${memory.behavioralPatterns.whatSheDoesRepeatedly.slice(0, 3).join(", ")}`);
  }

  if (memory.coreStruggles.primaryThemes.length > 0) {
    parts.push("\n### Core Struggles:");
    parts.push(`- Themes: ${memory.coreStruggles.primaryThemes.join(", ")}`);
    if (memory.coreStruggles.repeatingCycle) {
      parts.push(`- Cycle: ${memory.coreStruggles.repeatingCycle}`);
    }
  }

  if (memory.underlyingBeliefs.aboutSelf.length > 0) {
    parts.push("\n### Underlying Beliefs:");
    parts.push(`- About self: ${memory.underlyingBeliefs.aboutSelf.slice(0, 2).join("; ")}`);
  }

  if (memory.protectivePatterns.coreProtection) {
    parts.push("\n### Protective Pattern:");
    parts.push(`${memory.protectivePatterns.coreProtection}`);
  }

  if (memory.progression.newAwareness.length > 0) {
    parts.push("\n### Progression:");
    parts.push(`- New awareness: ${memory.progression.newAwareness.slice(-2).join("; ")}`);
    if (memory.progression.shifts.length > 0) {
      parts.push(`- Shifts: ${memory.progression.shifts.slice(-2).join("; ")}`);
    }
  }

  return parts.join("\n");
}
