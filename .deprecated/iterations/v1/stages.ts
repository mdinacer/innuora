/**
 * Individual stage functions (pure logic, no AI calls)
 * These are MOCKUPS - replace with actual AI calls when testing
 */

import { applyMetaGuidanceGating, buildReflectionDirective, updateTraceFromOutput } from "./reflection-regulation";
import { buildContextDirectivePrompt, computeContextHash } from "./synthesis-utils";
import type {
  AnalysisInput,
  AnalysisOutput,
  InnuoraAnalysis,
  ReflectionInput,
  ReflectionOutput,
  RelationalTrace,
  SynthesisInput,
  SynthesisOutput,
} from "./types";

// ============================================================================
// STAGE 1: REFLECTION
// ============================================================================

export function generateReflection(input: ReflectionInput): ReflectionOutput {
  const { userInput, messagesWindow, contextDirective, prevAnalysis, relationalTrace } = input;

  // ─────────────────────────────
  // Build Prompts with Dynamic Gating
  // ─────────────────────────────
  const prompts: Array<{ role: string; content: string }> = [
    {
      role: "system",
      content: "REFLECTION_SYSTEM_PROMPT", // Would be from prompts.ts
    },

    // Add reflection directive if we have previous analysis
    ...(prevAnalysis
      ? [
          {
            role: "system",
            content: buildReflectionDirective(prevAnalysis, relationalTrace),
          },
        ]
      : []),

    // Add relational trace notes for continuity
    ...(relationalTrace?.notes
      ? [
          {
            role: "system",
            content: `Relational context: ${relationalTrace.notes}. Maintain pacing and containment.`,
          },
        ]
      : []),

    // Add session directive from context synthesis
    ...(contextDirective
      ? [
          {
            role: "system",
            content: `Session focus directive: ${contextDirective}. Stay aligned with this focus.`,
          },
        ]
      : []),

    // Add conversation window
    ...messagesWindow.map((m) => ({ role: m.role, content: m.content })),

    // Current user input
    { role: "user", content: userInput },
  ];

  // TODO: Replace with actual GPT-4o API call
  // const aiResult = await callGPT4o(prompts, INNUORA_REFLECTION_PROMPT_OPTIONS);

  // Mock response
  const rawResponse = {
    reflection: "That exhaustion sounds deeper than just being tired.",
    follow_up_question: null,
    psychoeducation: null,
    signals: {
      resistance: "none" as const,
      crisis: "none" as const,
    },
    next_relational_trace: {
      relational_stance: "steady" as const,
      tone: "warm" as const,
      focus: "emotional exhaustion",
      notes: "User opening up about fatigue",
      psychoeducation_last_turn: false,
      curiosity_last_turn: false,
      used_lived_line: false,
    },
  };

  // ─────────────────────────────
  // Apply Meta-Gating + Update Trace
  // ─────────────────────────────
  const gated = applyMetaGuidanceGating(rawResponse, prevAnalysis, relationalTrace);
  const nextTrace = updateTraceFromOutput(relationalTrace, gated);

  const regulated = {
    ...gated,
    next_relational_trace: nextTrace,
  };

  return {
    response: regulated,
    nextTrace,
  };
}

// ============================================================================
// STAGE 2: ANALYSIS
// ============================================================================

export function generateAnalysis(input: AnalysisInput): AnalysisOutput {
  const { userInput, messagesWindow, prevAnalyses } = input;

  // TODO: Replace with actual GPT-4.1-mini API call
  // const prompts = [
  //   { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
  //   { role: "user", content: JSON.stringify({ current_message: userInput }) }
  // ];
  // const aiResult = await callGPT41Mini(prompts, INNUORA_ANALYSIS_PROMPT_OPTIONS);

  // Mock response
  const analysis: InnuoraAnalysis = {
    intensity: "moderate",
    readiness: "open",
    emotion: "sadness",
    distortion: "emotional reasoning",
    theme: "emotional exhaustion",
    crisis_level: "none",
    allow_curiosity: false,
    allow_psychoeducation: false,
    psychoedu_ready: true,
    rationale: "moderate fatigue; containment over exploration",
    notes: "energy depletion; mild emotional blunting",
  };

  return { analysis };
}

// ============================================================================
// STAGE 3: CONTEXT SYNTHESIS
// ============================================================================

export function generateContextDirective(input: SynthesisInput): SynthesisOutput {
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
    const updatedLifecycle = {
      ...currentLifecycle,
      usageCount: currentLifecycle.usageCount + 1, // Increment usage count
    };

    return {
      directive: currentLifecycle.directive!,
      lifecycle: updatedLifecycle,
      cached: true,
    };
  }

  // ─────────────────────────────
  // Generate New Directive (cache miss)
  // ─────────────────────────────
  const prompts = buildContextDirectivePrompt(sessionDynamics, recentAnalysis, relationalTrace);

  // TODO: Replace with actual GPT-4o-mini API call
  // const aiResult = await callGPT4oMini(prompts, {
  //   model: "gpt-4o-mini",
  //   temperature: 0.35,
  //   max_tokens: 100,
  // });

  // Mock response
  const directive = "Hold steady and present. Meet the user where they are.";

  // ─────────────────────────────
  // Update Lifecycle (reset usage count, new hash)
  // ─────────────────────────────
  const updatedLifecycle = {
    directive,
    hash: newHash,
    generatedAt: Date.now(),
    usageCount: 1, // First use of new directive
  };

  return {
    directive,
    lifecycle: updatedLifecycle,
    cached: false,
  };
}
