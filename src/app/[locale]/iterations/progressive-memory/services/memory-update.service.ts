import { processAiPrompts } from "@/app/actions/ai-client-actions";
import type {
  ContinuousMemory,
  MemoryExtraction,
} from "../types/continuous-memory.types";
import { buildMemoryExtractionPrompt } from "../prompts/memory-extraction.prompt";

/**
 * Update continuous memory with new conversation
 * Uses GPT-4o-mini to extract relevant updates
 */
export async function updateMemory(
  userMessage: string,
  assistantResponse: string,
  existingMemory: ContinuousMemory
): Promise<ContinuousMemory> {
  const sessionCount = existingMemory.sessionCount + 1;

  // Build extraction prompt
  const extractionPrompt = buildMemoryExtractionPrompt(
    userMessage,
    assistantResponse,
    existingMemory,
    sessionCount
  );

  // Call GPT-4o-mini to extract updates
  const result = await processAiPrompts(
    [
      {
        role: "system",
        content:
          "You are a memory extraction system. Extract structured updates from conversation and return valid JSON only.",
      },
      { role: "user", content: extractionPrompt },
    ],
    {
      temperature: 0.3,
      response_format: { type: "json_object" },
      model: "background", // Use GPT-4o-mini for memory extraction
    }
  );

  if (result.error) {
    console.error("Failed to extract memory:", result.error.message);
    // Return existing memory if extraction fails
    return {
      ...existingMemory,
      sessionCount,
      lastUpdated: new Date().toISOString(),
    };
  }

  const extractionResponse = result.data.message;

  // Parse extraction
  let extraction: MemoryExtraction;
  try {
    extraction = JSON.parse(extractionResponse);
  } catch (error) {
    console.error("Failed to parse memory extraction:", error);
    // Return existing memory if extraction fails
    return {
      ...existingMemory,
      sessionCount,
      lastUpdated: new Date().toISOString(),
    };
  }

  // Merge updates into existing memory
  const updatedMemory = mergeMemoryUpdates(existingMemory, extraction);

  // Update metadata
  updatedMemory.sessionCount = sessionCount;
  updatedMemory.lastUpdated = new Date().toISOString();

  return updatedMemory;
}

/**
 * Merge extracted updates into existing memory
 * Strengthens patterns (doesn't just overwrite)
 */
function mergeMemoryUpdates(
  existing: ContinuousMemory,
  extraction: MemoryExtraction
): ContinuousMemory {
  const updated = { ...existing };

  // Life Context - Merge new facts
  if (extraction.lifeContextUpdates) {
    updated.lifeContext = {
      relationships: {
        ...existing.lifeContext.relationships,
        ...extraction.lifeContextUpdates.relationships,
      },
      responsibilities: mergeArrays(
        existing.lifeContext.responsibilities,
        extraction.lifeContextUpdates.responsibilities || []
      ),
      constraints: mergeArrays(
        existing.lifeContext.constraints,
        extraction.lifeContextUpdates.constraints || []
      ),
    };
  }

  // Emotional Patterns - Strengthen recurring patterns
  if (extraction.emotionalPatternsUpdates) {
    updated.emotionalPatterns = {
      recurringFeelings: mergeArrays(
        existing.emotionalPatterns.recurringFeelings,
        extraction.emotionalPatternsUpdates.recurringFeelings || []
      ),
      emotionalTriggers: mergeArrays(
        existing.emotionalPatterns.emotionalTriggers,
        extraction.emotionalPatternsUpdates.emotionalTriggers || []
      ),
      emotionalCoping:
        extraction.emotionalPatternsUpdates.emotionalCoping ||
        existing.emotionalPatterns.emotionalCoping,
    };
  }

  // Relational Patterns - Update or add patterns
  if (extraction.relationalPatternsUpdates) {
    updated.relationalPatterns = {
      ...existing.relationalPatterns,
      ...extraction.relationalPatternsUpdates,
    };
  }

  // Behavioral Patterns - Merge behaviors
  if (extraction.behavioralPatternsUpdates) {
    updated.behavioralPatterns = {
      whatSheDoesRepeatedly: mergeArrays(
        existing.behavioralPatterns.whatSheDoesRepeatedly,
        extraction.behavioralPatternsUpdates.whatSheDoesRepeatedly || []
      ),
      consequencesOfPattern: mergeArrays(
        existing.behavioralPatterns.consequencesOfPattern,
        extraction.behavioralPatternsUpdates.consequencesOfPattern || []
      ),
      whatSheAvoidsOrFears: mergeArrays(
        existing.behavioralPatterns.whatSheAvoidsOrFears,
        extraction.behavioralPatternsUpdates.whatSheAvoidsOrFears || []
      ),
    };
  }

  // Core Struggles - Update themes and cycles
  if (extraction.coreStrugglesUpdates) {
    updated.coreStruggles = {
      primaryThemes: mergeArrays(
        existing.coreStruggles.primaryThemes,
        extraction.coreStrugglesUpdates.primaryThemes || []
      ),
      surfaceVsDeeper: {
        surface:
          extraction.coreStrugglesUpdates.surfaceVsDeeper?.surface ||
          existing.coreStruggles.surfaceVsDeeper.surface,
        deeper:
          extraction.coreStrugglesUpdates.surfaceVsDeeper?.deeper ||
          existing.coreStruggles.surfaceVsDeeper.deeper,
      },
      repeatingCycle:
        extraction.coreStrugglesUpdates.repeatingCycle ||
        existing.coreStruggles.repeatingCycle,
    };
  }

  // Underlying Beliefs - Merge beliefs
  if (extraction.underlyingBeliefsUpdates) {
    updated.underlyingBeliefs = {
      aboutSelf: mergeArrays(
        existing.underlyingBeliefs.aboutSelf,
        extraction.underlyingBeliefsUpdates.aboutSelf || []
      ),
      aboutOthers: mergeArrays(
        existing.underlyingBeliefs.aboutOthers,
        extraction.underlyingBeliefsUpdates.aboutOthers || []
      ),
      aboutRelationships: mergeArrays(
        existing.underlyingBeliefs.aboutRelationships,
        extraction.underlyingBeliefsUpdates.aboutRelationships || []
      ),
      whereLearnedThis:
        extraction.underlyingBeliefsUpdates.whereLearnedThis ||
        existing.underlyingBeliefs.whereLearnedThis,
    };
  }

  // Protective Patterns - Update patterns
  if (extraction.protectivePatternsUpdates) {
    updated.protectivePatterns = {
      coreProtection:
        extraction.protectivePatternsUpdates.coreProtection ||
        existing.protectivePatterns.coreProtection,
      secondaryProtections: mergeArrays(
        existing.protectivePatterns.secondaryProtections,
        extraction.protectivePatternsUpdates.secondaryProtections || []
      ),
      whatTheyProtectAgainst:
        extraction.protectivePatternsUpdates.whatTheyProtectAgainst ||
        existing.protectivePatterns.whatTheyProtectAgainst,
    };
  }

  // Progression - Track changes
  if (extraction.progressionUpdates) {
    updated.progression = {
      newAwareness: mergeArrays(
        existing.progression.newAwareness,
        extraction.progressionUpdates.newAwareness || []
      ),
      shifts: mergeArrays(
        existing.progression.shifts,
        extraction.progressionUpdates.shifts || []
      ),
      resistance: mergeArrays(
        existing.progression.resistance,
        extraction.progressionUpdates.resistance || []
      ),
      currentFocus:
        extraction.progressionUpdates.currentFocus ||
        existing.progression.currentFocus,
    };
  }

  // Recent Context - Rolling window
  if (extraction.recentContextUpdates) {
    updated.recentContext = {
      lastThreeSessionTopics: [
        ...(extraction.recentContextUpdates.lastThreeSessionTopics || []),
        ...existing.recentContext.lastThreeSessionTopics,
      ].slice(0, 3),
      activeStruggles:
        extraction.recentContextUpdates.activeStruggles ||
        existing.recentContext.activeStruggles,
      emotionalState:
        extraction.recentContextUpdates.emotionalState ||
        existing.recentContext.emotionalState,
    };
  }

  return updated;
}

/**
 * Merge arrays without duplicates, preserving order
 */
function mergeArrays(existing: string[], newItems: string[]): string[] {
  const combined = [...existing];

  for (const item of newItems) {
    // Only add if not already present (case-insensitive check)
    if (
      !combined.some(
        (existingItem) => existingItem.toLowerCase() === item.toLowerCase()
      )
    ) {
      combined.push(item);
    }
  }

  return combined;
}
