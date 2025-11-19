import { ReflectionDirective } from "@/domains/guidance-flow/directive/types";
import { FactualMemory } from "@/domains/guidance-flow/memory/types";
import { SessionPhaseEvaluation } from "@/domains/guidance-flow/phase/types";
import { RelationalTrace, RelationalTraceApp } from "@/domains/guidance-flow/reflection/types";
import { SessionMetadata, SessionProcessType } from "@/domains/guidance-flow/types/session-runtime";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";

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

export type SessionContext = {
  sessionId: string;
  sessionWellness: SessionPhaseEvaluation | null;
  relationalTrace: RelationalTraceApp | null;
  directives: ReflectionDirective[];
  factualMemory: FactualMemory[];
};

export type EncryptedSession = {
  id: string;
  userId: string;
  title: string;
  subtitle: string | null;
  createdAt: Date;
  updatedAt: Date;
  autoUpdateTitle: boolean;
  persistOnCloud: boolean;
  metadata: SessionMetadata | null;
  messages: EncryptedBlob | null;
};

export type SessionDataUpdate = {
  factualMemory?: FactualMemory[];
  relationalTrace?: RelationalTrace;
  sessionWellness?: SessionPhaseEvaluation;
  directive?: ReflectionDirective;
};
