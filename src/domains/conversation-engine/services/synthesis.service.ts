/**
 * Context Synthesis Service
 * Generates session focus directive using GPT-4o-mini with hash-based caching
 */

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { SessionDynamicsMatrix } from "@/domains/session-dynamics";
import { InnuoraAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { buildContextDirectivePrompt, computeContextHash } from "../constants/synthesis.utils";
import { RelationalTrace } from "../types/reflection.types";
import { ContextLifecycle } from "../types/synthesis.types";

export interface SynthesisServiceInput {
  sessionDynamics: SessionDynamicsMatrix;
  recentAnalysis: InnuoraAnalysis;
  relationalTrace?: RelationalTrace;
  currentLifecycle: ContextLifecycle; // Cached directive metadata
}

export interface SynthesisServiceOutput {
  directive: string;
  lifecycle: ContextLifecycle; // Updated lifecycle metadata
  cached: boolean; // True if directive was reused from cache
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    cachedTokens?: number;
  } | null;
  elapsedMs: number;
}

/**
 * Generates or reuses session focus directive
 *
 * Caching Logic:
 * - Computes hash of current emotional state (analysis + trace + dynamics)
 * - If hash matches cached directive AND within TTL → reuse directive
 * - TTL varies by session phase: early (3 turns), middle (5 turns), closing (8 turns)
 * - If hash changed OR TTL expired → generate new directive
 *
 * @param input - Synthesis generation parameters
 * @returns Session directive with caching metadata
 */
export async function generateContextDirective(input: SynthesisServiceInput): Promise<SynthesisServiceOutput> {
  const start = performance.now();

  const { sessionDynamics, recentAnalysis, relationalTrace, currentLifecycle } = input;

  // ─────────────────────────────
  // Compute Context Hash (stable emotional state fingerprint)
  // ─────────────────────────────
  const newHash = computeContextHash(recentAnalysis, relationalTrace, sessionDynamics);

  const ageMs = currentLifecycle.generatedAt ? Date.now() - currentLifecycle.generatedAt : Infinity;

  // ─────────────────────────────
  // Dynamic TTL by Session Phase
  // ─────────────────────────────
  const phase = sessionDynamics.macro.session_phase;
  const phaseTTL: Record<typeof phase, { turns: number; ms: number }> = {
    early: { turns: 3, ms: 3 * 60_000 }, // 3 minutes
    middle: { turns: 5, ms: 5 * 60_000 }, // 5 minutes
    closing: { turns: 8, ms: 8 * 60_000 }, // 8 minutes
  };

  const { turns, ms } = phaseTTL[phase];

  // ─────────────────────────────
  // Check Cache Validity
  // ─────────────────────────────
  const validCache =
    currentLifecycle.hash === newHash && // Same emotional state
    currentLifecycle.directive && // Has cached directive
    currentLifecycle.usageCount < turns && // Within turn limit
    ageMs < ms; // Within time limit

  if (validCache) {
    // Reuse cached directive
    const updatedLifecycle: ContextLifecycle = {
      ...currentLifecycle,
      usageCount: currentLifecycle.usageCount + 1, // Increment usage count
    };

    return {
      directive: currentLifecycle.directive!,
      lifecycle: updatedLifecycle,
      cached: true,
      tokenUsage: null,
      elapsedMs: performance.now() - start,
    };
  }

  // ─────────────────────────────
  // Generate New Directive (cache miss)
  // ─────────────────────────────
  const prompts: ChatCompletionMessageParam[] = buildContextDirectivePrompt(
    sessionDynamics,
    recentAnalysis,
    relationalTrace
  );

  const aiResult = await processAiPromptsWithRetry(prompts, {
    model: "auxiliary", // GPT-4o-mini alias
    response_format: { type: "text" },
    temperature: 0.35,
    top_p: 0.9,
    frequency_penalty: 0.2,
    presence_penalty: 0.1,
    max_completion_tokens: 100,
  });

  if (aiResult.error) {
    // Fallback: reuse old directive on error (non-blocking)
    console.error(`[Synthesis] Failed: ${aiResult.error.message}. Reusing old directive.`);
    return {
      directive: currentLifecycle.directive || "Hold steady and present. Meet the user where they are.",
      lifecycle: currentLifecycle,
      cached: true, // Treat as cached since we're reusing
      tokenUsage: null,
      elapsedMs: performance.now() - start,
    };
  }

  if (!aiResult.data) {
    console.error("[Synthesis] No data returned. Reusing old directive.");
    return {
      directive: currentLifecycle.directive || "Hold steady and present. Meet the user where they are.",
      lifecycle: currentLifecycle,
      cached: true,
      tokenUsage: null,
      elapsedMs: performance.now() - start,
    };
  }

  const directive = aiResult.data.message.trim();

  // ─────────────────────────────
  // Update Lifecycle (reset usage count, new hash)
  // ─────────────────────────────
  const updatedLifecycle: ContextLifecycle = {
    directive,
    hash: newHash,
    generatedAt: Date.now(),
    usageCount: 1, // First use of new directive
  };

  const elapsedMs = performance.now() - start;

  return {
    directive,
    lifecycle: updatedLifecycle,
    cached: false,
    tokenUsage: aiResult.data.modelTokenUsage,
    elapsedMs,
  };
}
