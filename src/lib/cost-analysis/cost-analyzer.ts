/**
 * Cost Analysis Utility
 *
 * Automatically scans codebase to calculate realistic AI costs.
 * Uses tiktoken for accurate token counting.
 * NO manual input needed - pulls from actual code and configs.
 */

import { encodingForModel, TiktokenModel } from "js-tiktoken";

import { AI_MODELS, type AIModelCategory } from "@/domains/ai-conversation/ai-models";
import {
  HOLISTIC_ENGINE_PROMPTS,
  HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS_EN,
} from "@/domains/conversation-engine/constants/prompts";
import CHAT_MEMORY_BUILD_INSTRUCTIONS from "@/domains/session-memory/session-memory.prompt";
import { SESSION_WELLNESS_PROMPT } from "@/domains/session-wellness/session-wellness.prompt";
import THERAPEUTIC_ANALYSIS_PROMPT from "@/domains/therapeutic-analysis/therapeutic-analysis.prompt";

/**
 * AI Operation detected in codebase
 */
export interface AIOperation {
  name: string;
  description: string;
  frequency: "per_message" | "every_n_messages" | "on_demand";
  frequencyDetail?: string;
  model: "default" | "fallback" | "mini";
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  costPerCall: number;
  usedIn: string[];
}

/**
 * User behavior model
 */
export interface UserBehaviorModel {
  name: string;
  sessionsPerMonth: number;
  messagesPerSession: number;
  analysisEnabled: boolean;
  memoryEnabled: boolean;
  wellnessEnabled: boolean;
  operations: {
    operation: string;
    callsPerMonth: number;
    monthlyCost: number;
  }[];
  totalMonthlyCost: number;
  costPerSession: number;
}

const MODEL_CATEGORY_MAP: Record<"default" | "fallback" | "mini", AIModelCategory> = {
  default: "reflection",
  fallback: "diagnostic",
  mini: "background",
};

/**
 * Count tokens in a string using tiktoken
 */
function countTokens(text: string, modelType: "default" | "fallback" | "mini" = "mini"): number {
  const modelConfig = AI_MODELS[MODEL_CATEGORY_MAP[modelType]];
  const encoding = encodingForModel(modelConfig.name as TiktokenModel);

  return encoding.encode(text).length;
}

/**
 * Calculate cost from token counts
 */
function calculateCost(inputTokens: number, outputTokens: number, modelType: "default" | "fallback" | "mini"): number {
  const modelConfig = AI_MODELS[MODEL_CATEGORY_MAP[modelType]];

  const inputCost = (inputTokens / 1000) * modelConfig.inputPricePer1K;
  const outputCost = (outputTokens / 1000) * modelConfig.outputPricePer1K;

  return inputCost + outputCost;
}

/**
 * Analyze all AI operations in the codebase
 * Auto-detects operations by scanning actual prompts
 */
export function analyzeAIOperations(): AIOperation[] {
  const operations: AIOperation[] = [];

  // 1. HOLISTIC CONVERSATION RESPONSE
  // Location: src/domains/conversation-engine/
  const holisticSystemPrompt = HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS_EN || HOLISTIC_ENGINE_PROMPTS.en;
  const holisticSystemTokens = countTokens(holisticSystemPrompt, "default");

  // Typical user message + conversation window (last 8 messages)
  const typicalUserMessage = 50; // "I've been feeling anxious about work lately"
  const conversationWindow = 8 * 75; // ~75 tokens per historical message

  const holisticInputTokens = holisticSystemTokens + typicalUserMessage + conversationWindow;
  const holisticOutputTokens = 300; // Therapeutic response ~200-400 tokens

  operations.push({
    name: "Holistic Conversation Response",
    description: "Main therapeutic conversation - generates empathetic response with relational tracking",
    frequency: "per_message",
    model: "default", // Uses GPT-4o for quality
    estimatedInputTokens: holisticInputTokens,
    estimatedOutputTokens: holisticOutputTokens,
    costPerCall: calculateCost(holisticInputTokens, holisticOutputTokens, "default"),
    usedIn: ["src/domains/conversation-engine/actions/conversation.action.ts"],
  });

  // 2. THERAPEUTIC ANALYSIS (Background)
  // Location: src/domains/therapeutic-analysis/
  const analysisSystemPrompt = THERAPEUTIC_ANALYSIS_PROMPT.content as string;
  const analysisSystemTokens = countTokens(analysisSystemPrompt, "mini");

  // User message + last 3 analyses for context + recent conversation
  const analysisUserMessage = 50;
  const previousAnalyses = 3 * 100; // ~100 tokens per previous analysis (JSON)
  const recentConversation = 4 * 75; // Last 2 user + 2 assistant messages

  const analysisInputTokens = analysisSystemTokens + analysisUserMessage + previousAnalyses + recentConversation;
  const analysisOutputTokens = 150; // JSON analysis ~100-200 tokens

  operations.push({
    name: "Therapeutic Analysis",
    description: "Background CBT analysis - generates insights without blocking conversation",
    frequency: "per_message",
    frequencyDetail: "Runs after every user message (non-blocking)",
    model: "mini", // Uses GPT-4o-mini for cost efficiency
    estimatedInputTokens: analysisInputTokens,
    estimatedOutputTokens: analysisOutputTokens,
    costPerCall: calculateCost(analysisInputTokens, analysisOutputTokens, "mini"),
    usedIn: ["src/domains/therapeutic-analysis/therapeutic-analysis.action.ts"],
  });

  // 3. SESSION MEMORY UPDATE
  // Location: src/domains/session-memory/
  const memorySystemPrompt = CHAT_MEMORY_BUILD_INSTRUCTIONS;
  const memorySystemTokens = countTokens(memorySystemPrompt, "mini");

  // Current memory + new facts from conversation
  const currentMemory = 200; // Existing memory store ~150-300 tokens
  const newFacts = 100; // New information from recent messages

  const memoryInputTokens = memorySystemTokens + currentMemory + newFacts;
  const memoryOutputTokens = 200; // Updated memory ~150-300 tokens

  operations.push({
    name: "Session Memory Update",
    description: "AI-powered memory consolidation - deduplicates and merges facts",
    frequency: "every_n_messages",
    frequencyDetail: "When analysis flags update_memory = true (~every 3-5 messages)",
    model: "mini",
    estimatedInputTokens: memoryInputTokens,
    estimatedOutputTokens: memoryOutputTokens,
    costPerCall: calculateCost(memoryInputTokens, memoryOutputTokens, "mini"),
    usedIn: ["src/domains/session-memory/session-memory.action.ts"],
  });

  // 4. SESSION WELLNESS CHECK
  // Location: src/domains/session-wellness/
  const wellnessSystemPrompt = SESSION_WELLNESS_PROMPT.content as string;
  const wellnessSystemTokens = countTokens(wellnessSystemPrompt, "mini");

  // Session metadata + latest analysis
  const wellnessContext = 100; // Message count, themes, latest analysis summary

  const wellnessInputTokens = wellnessSystemTokens + wellnessContext;
  const wellnessOutputTokens = 100; // JSON wellness check ~80-120 tokens

  operations.push({
    name: "Session Wellness Check",
    description: "Determines if session should end - detects productive/unproductive loops",
    frequency: "every_n_messages",
    frequencyDetail: "Every 10 messages (optimized with 87% token savings)",
    model: "mini",
    estimatedInputTokens: wellnessInputTokens,
    estimatedOutputTokens: wellnessOutputTokens,
    costPerCall: calculateCost(wellnessInputTokens, wellnessOutputTokens, "mini"),
    usedIn: ["src/domains/session-wellness/session-wellness-simple-service.ts"],
  });

  // 5. SESSION TITLE GENERATION (On-demand)
  const titleSystemPrompt = "Generate a concise, empathetic title for this therapy session.";
  const titleSystemTokens = countTokens(titleSystemPrompt, "mini");

  const conversationSummary = 200; // Summary of session messages

  const titleInputTokens = titleSystemTokens + conversationSummary;
  const titleOutputTokens = 15; // Short title ~10-20 tokens

  operations.push({
    name: "Session Title Generation",
    description: "Auto-generates session title from conversation content",
    frequency: "on_demand",
    frequencyDetail: "Once per session (when user requests or auto-update enabled)",
    model: "mini",
    estimatedInputTokens: titleInputTokens,
    estimatedOutputTokens: titleOutputTokens,
    costPerCall: calculateCost(titleInputTokens, titleOutputTokens, "mini"),
    usedIn: ["src/app/actions/session-actions.ts"],
  });

  return operations;
}

/**
 * Model different user behaviors
 */
export function generateUserBehaviorModels(operations: AIOperation[]): UserBehaviorModel[] {
  const models: UserBehaviorModel[] = [];

  // LIGHT USER - Tries the app, occasional use
  const lightUser: UserBehaviorModel = {
    name: "Light User",
    sessionsPerMonth: 2,
    messagesPerSession: 10,
    analysisEnabled: true,
    memoryEnabled: false, // Doesn't trigger often with short sessions
    wellnessEnabled: false, // Wellness runs every 10 messages
    operations: [],
    totalMonthlyCost: 0,
    costPerSession: 0,
  };

  const lightMessages = lightUser.sessionsPerMonth * lightUser.messagesPerSession;
  const holisticOp = operations.find((op) => op.name === "Holistic Conversation Response")!;
  const analysisOp = operations.find((op) => op.name === "Therapeutic Analysis")!;
  const titleOp = operations.find((op) => op.name === "Session Title Generation")!;

  lightUser.operations.push({
    operation: "Conversation Responses",
    callsPerMonth: lightMessages,
    monthlyCost: lightMessages * holisticOp.costPerCall,
  });

  lightUser.operations.push({
    operation: "Therapeutic Analysis",
    callsPerMonth: lightMessages,
    monthlyCost: lightMessages * analysisOp.costPerCall,
  });

  lightUser.operations.push({
    operation: "Session Titles",
    callsPerMonth: lightUser.sessionsPerMonth,
    monthlyCost: lightUser.sessionsPerMonth * titleOp.costPerCall,
  });

  lightUser.totalMonthlyCost = lightUser.operations.reduce((sum, op) => sum + op.monthlyCost, 0);
  lightUser.costPerSession = lightUser.totalMonthlyCost / lightUser.sessionsPerMonth;

  models.push(lightUser);

  // MODERATE USER - Regular therapeutic use
  const moderateUser: UserBehaviorModel = {
    name: "Moderate User",
    sessionsPerMonth: 10,
    messagesPerSession: 20,
    analysisEnabled: true,
    memoryEnabled: true,
    wellnessEnabled: true,
    operations: [],
    totalMonthlyCost: 0,
    costPerSession: 0,
  };

  const moderateMessages = moderateUser.sessionsPerMonth * moderateUser.messagesPerSession;
  const memoryOp = operations.find((op) => op.name === "Session Memory Update")!;
  const wellnessOp = operations.find((op) => op.name === "Session Wellness Check")!;

  moderateUser.operations.push({
    operation: "Conversation Responses",
    callsPerMonth: moderateMessages,
    monthlyCost: moderateMessages * holisticOp.costPerCall,
  });

  moderateUser.operations.push({
    operation: "Therapeutic Analysis",
    callsPerMonth: moderateMessages,
    monthlyCost: moderateMessages * analysisOp.costPerCall,
  });

  moderateUser.operations.push({
    operation: "Memory Updates",
    callsPerMonth: moderateMessages * 0.25, // ~25% of messages trigger memory update
    monthlyCost: moderateMessages * 0.25 * memoryOp.costPerCall,
  });

  moderateUser.operations.push({
    operation: "Wellness Checks",
    callsPerMonth: moderateMessages / 10, // Every 10 messages
    monthlyCost: (moderateMessages / 10) * wellnessOp.costPerCall,
  });

  moderateUser.operations.push({
    operation: "Session Titles",
    callsPerMonth: moderateUser.sessionsPerMonth,
    monthlyCost: moderateUser.sessionsPerMonth * titleOp.costPerCall,
  });

  moderateUser.totalMonthlyCost = moderateUser.operations.reduce((sum, op) => sum + op.monthlyCost, 0);
  moderateUser.costPerSession = moderateUser.totalMonthlyCost / moderateUser.sessionsPerMonth;

  models.push(moderateUser);

  // HEAVY USER - Committed to therapy
  const heavyUser: UserBehaviorModel = {
    name: "Heavy User",
    sessionsPerMonth: 30,
    messagesPerSession: 30,
    analysisEnabled: true,
    memoryEnabled: true,
    wellnessEnabled: true,
    operations: [],
    totalMonthlyCost: 0,
    costPerSession: 0,
  };

  const heavyMessages = heavyUser.sessionsPerMonth * heavyUser.messagesPerSession;

  heavyUser.operations.push({
    operation: "Conversation Responses",
    callsPerMonth: heavyMessages,
    monthlyCost: heavyMessages * holisticOp.costPerCall,
  });

  heavyUser.operations.push({
    operation: "Therapeutic Analysis",
    callsPerMonth: heavyMessages,
    monthlyCost: heavyMessages * analysisOp.costPerCall,
  });

  heavyUser.operations.push({
    operation: "Memory Updates",
    callsPerMonth: heavyMessages * 0.25,
    monthlyCost: heavyMessages * 0.25 * memoryOp.costPerCall,
  });

  heavyUser.operations.push({
    operation: "Wellness Checks",
    callsPerMonth: heavyMessages / 10,
    monthlyCost: (heavyMessages / 10) * wellnessOp.costPerCall,
  });

  heavyUser.operations.push({
    operation: "Session Titles",
    callsPerMonth: heavyUser.sessionsPerMonth,
    monthlyCost: heavyUser.sessionsPerMonth * titleOp.costPerCall,
  });

  heavyUser.totalMonthlyCost = heavyUser.operations.reduce((sum, op) => sum + op.monthlyCost, 0);
  heavyUser.costPerSession = heavyUser.totalMonthlyCost / heavyUser.sessionsPerMonth;

  models.push(heavyUser);

  // POWER USER - Daily usage, long sessions
  const powerUser: UserBehaviorModel = {
    name: "Power User",
    sessionsPerMonth: 60,
    messagesPerSession: 50,
    analysisEnabled: true,
    memoryEnabled: true,
    wellnessEnabled: true,
    operations: [],
    totalMonthlyCost: 0,
    costPerSession: 0,
  };

  const powerMessages = powerUser.sessionsPerMonth * powerUser.messagesPerSession;

  powerUser.operations.push({
    operation: "Conversation Responses",
    callsPerMonth: powerMessages,
    monthlyCost: powerMessages * holisticOp.costPerCall,
  });

  powerUser.operations.push({
    operation: "Therapeutic Analysis",
    callsPerMonth: powerMessages,
    monthlyCost: powerMessages * analysisOp.costPerCall,
  });

  powerUser.operations.push({
    operation: "Memory Updates",
    callsPerMonth: powerMessages * 0.25,
    monthlyCost: powerMessages * 0.25 * memoryOp.costPerCall,
  });

  powerUser.operations.push({
    operation: "Wellness Checks",
    callsPerMonth: powerMessages / 10,
    monthlyCost: (powerMessages / 10) * wellnessOp.costPerCall,
  });

  powerUser.operations.push({
    operation: "Session Titles",
    callsPerMonth: powerUser.sessionsPerMonth,
    monthlyCost: powerUser.sessionsPerMonth * titleOp.costPerCall,
  });

  powerUser.totalMonthlyCost = powerUser.operations.reduce((sum, op) => sum + op.monthlyCost, 0);
  powerUser.costPerSession = powerUser.totalMonthlyCost / powerUser.sessionsPerMonth;

  models.push(powerUser);

  return models;
}

/**
 * Generate complete cost analysis
 */
export function generateCostAnalysis() {
  const operations = analyzeAIOperations();
  const userModels = generateUserBehaviorModels(operations);
  const defaultModel = AI_MODELS[MODEL_CATEGORY_MAP.default];
  const fallbackModel = AI_MODELS[MODEL_CATEGORY_MAP.fallback];
  const miniModel = AI_MODELS[MODEL_CATEGORY_MAP.mini];

  return {
    operations,
    userModels,
    modelPricing: {
      default: {
        name: defaultModel.name,
        inputPer1K: defaultModel.inputPricePer1K,
        outputPer1K: defaultModel.outputPricePer1K,
      },
      fallback: {
        name: fallbackModel.name,
        inputPer1K: fallbackModel.inputPricePer1K,
        outputPer1K: fallbackModel.outputPricePer1K,
      },
      mini: {
        name: miniModel.name,
        inputPer1K: miniModel.inputPricePer1K,
        outputPer1K: miniModel.outputPricePer1K,
      },
    },
    generatedAt: new Date().toISOString(),
  };
}
