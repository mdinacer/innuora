import { ReflectionDirective } from "../directive/types";
import { RelationalTrace } from "../reflection/types";
import { SessionProcessType } from "./session-runtime";

export interface TokenUsageRecord {
  /** Which pipeline step produced this usage */
  process: SessionProcessType;
  /** Tokens used in the prompt for this call */
  promptTokens: number;
  /** Tokens used in the completion for this call */
  completionTokens: number;
  /** Tokens retrieved from cache for this call */
  cachedTokens: number;
  /** Cost in USD (float, consider cents for precise billing) */
  costUsd: number;
}

export interface SessionTelemetry {
  /** Total accumulated cost in USD */
  totalCostUsd: number;
  /** Total tokens used across all prompts */
  totalPromptTokens: number;
  /** Total tokens generated in completions */
  totalCompletionTokens: number;
  /** Total tokens served from cache */
  totalCachedTokens: number;
  /** Sum of all tokens */
  totalTokens: number;
  /** Individual usage samples (per request) */
  tokenUsages: TokenUsageRecord[];
}

export interface ServerSessionData {
  id: string;
  userId: string;
  relationalTraces: RelationalTrace[];
  directives: ReflectionDirective[];
  telemetry: SessionTelemetry;
}
