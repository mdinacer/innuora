/**
 * Current (Broken) Flow Orchestration
 * Simplified - no server/db/logging infrastructure
 */

import { generateAnalysis, generateContextDirective, generateReflection } from "./stages";
import type {
  ContextLifecycle,
  InnuoraAnalysis,
  OpenChatMessage,
  RelationalTrace,
  SessionDynamicsMatrix,
} from "./types";

export interface FlowInput {
  userInput: string;
  messagesWindow: OpenChatMessage[];
  prevAnalysis?: InnuoraAnalysis;
  prevTrace?: RelationalTrace;
  sessionDynamics?: SessionDynamicsMatrix;
  contextLifecycle?: ContextLifecycle;
  prevAnalyses?: InnuoraAnalysis[];
}

export interface FlowOutput {
  response: string;
  nextTrace: RelationalTrace;
  currentAnalysis: InnuoraAnalysis;
  nextContextDirective: string;
  nextContextLifecycle: ContextLifecycle;
}

/**
 * CURRENT FLOW (What's Running Now - BROKEN)
 *
 * 1. Context Synthesis FIRST (using PREVIOUS analysis)
 * 2. PARALLEL: Reflection + Analysis
 * 3. Return reflection response
 */
export async function runCurrentFlow(input: FlowInput): Promise<FlowOutput> {
  const {
    userInput,
    messagesWindow,
    prevAnalysis,
    prevTrace,
    sessionDynamics,
    contextLifecycle,
    prevAnalyses = [],
  } = input;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Step 1: Context Synthesis (using PREVIOUS analysis)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let contextDirective: string | null = null;
  let updatedContextLifecycle: ContextLifecycle = contextLifecycle || { usageCount: 0 };

  if (sessionDynamics && prevAnalysis) {
    const synthesisResult = generateContextDirective({
      sessionDynamics,
      recentAnalysis: prevAnalysis, // Using PREVIOUS analysis
      relationalTrace: prevTrace,
      currentLifecycle: contextLifecycle || { usageCount: 0 },
    });

    contextDirective = synthesisResult.directive;
    updatedContextLifecycle = synthesisResult.lifecycle;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Step 2: PARALLEL EXECUTION (Reflection + Analysis)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [reflectionResult, analysisResult] = await Promise.all([
    // Reflection uses contextDirective from step 1
    generateReflection({
      userInput,
      messagesWindow,
      contextDirective, // From synthesis above
      prevAnalysis,
      relationalTrace: prevTrace,
    }),

    // Analysis runs independently
    generateAnalysis({
      userInput,
      messagesWindow, // Should this be here???
      prevAnalyses, // Should this be here???
    }),
  ]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Step 3: Return Response
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return {
    response: reflectionResult.response.reflection,
    nextTrace: reflectionResult.nextTrace,
    currentAnalysis: analysisResult.analysis,
    nextContextDirective: contextDirective || "",
    nextContextLifecycle: updatedContextLifecycle,
  };
}

/**
 * V7 FLOW (What SHOULD Be Running - User's Original Design)
 *
 * PARALLEL execution of TWO branches:
 * ├─ Branch 1: Reflection
 * │  └─ Uses: prevAnalysis, prevTrace, prevContextDirective
 * │
 * └─ Branch 2: Analysis → Context Synthesis pipeline
 *    ├─ Analysis runs FIRST (minimal input???)
 *    └─ Context Synthesis takes NEW analysis → generates context for NEXT round
 */
export async function runV7Flow(input: FlowInput): Promise<FlowOutput> {
  const {
    userInput,
    messagesWindow,
    prevAnalysis,
    prevTrace,
    sessionDynamics,
    contextLifecycle,
    prevAnalyses = [],
  } = input;

  // Get previous context directive (from previous round's synthesis)
  const prevContextDirective = contextLifecycle?.directive || null;

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PARALLEL: Branch 1 (Reflection) + Branch 2 (Analysis → Synthesis)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const [reflectionResult, synthesisResult] = await Promise.all([
    // Branch 1: Reflection (uses PREVIOUS round's data)
    generateReflection({
      userInput,
      messagesWindow,
      contextDirective: prevContextDirective, // From PREVIOUS round
      prevAnalysis, // From PREVIOUS round
      relationalTrace: prevTrace, // From PREVIOUS round
    }),

    // Branch 2: Analysis → Synthesis pipeline
    (async () => {
      // Step 2a: Analysis (minimal input???)
      const analysisResult = generateAnalysis({
        userInput,
        messagesWindow: [], // TODO: What should this be???
        prevAnalyses: [], // TODO: What should this be???
      });

      // Step 2b: Context Synthesis (uses NEW analysis)
      const synthesisResult = generateContextDirective({
        sessionDynamics: sessionDynamics || ({} as SessionDynamicsMatrix), // TODO: Should this be computed from NEW analysis???
        recentAnalysis: analysisResult.analysis, // NEW analysis from this round
        relationalTrace: prevTrace,
        currentLifecycle: contextLifecycle || { usageCount: 0 },
      });

      return {
        analysis: analysisResult.analysis,
        synthesis: synthesisResult,
      };
    })(),
  ]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Return Response
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return {
    response: reflectionResult.response.reflection,
    nextTrace: reflectionResult.nextTrace,
    currentAnalysis: synthesisResult.analysis,
    nextContextDirective: synthesisResult.synthesis.directive,
    nextContextLifecycle: synthesisResult.synthesis.lifecycle,
  };
}
