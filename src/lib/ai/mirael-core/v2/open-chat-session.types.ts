import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { ModelCode, MODELS_CODES } from "@/lib/constants/ai-models";
import { SessionEncryptionResult } from "@/lib/crypto/  session-encryption";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { SessionAnalysis } from "./session-analysis/session-analysis.types";

export interface Session {
  id: string;
  title: string;
  subtitle?: string;

  createdAt: Date;
  updatedAt?: Date;

  messages: OpenChatMessage[];

  memoryStore: string | null;
  continuitySummary: SessionSummary | null;
  aggregatedAnalysis: SessionAnalysis | null;
  analysisSnapshots: StateAnalysis[];

  modelCode: ModelCode;
  persistOnCloud: boolean;
  aiSuggestedTitle: boolean;

  metadata: SessionMeta;
}

export interface SessionSummary {
  text: string;
  updatedAt: Date;
  lastMessageIndex: number;
}

export interface SessionMeta {
  tokenUsage: ModelTokenUsage[];
  messageCount: number;
  tokenCount: number;
  costUSD: number;
  [key: string]: unknown; // more flexible than `any`
}

export type PersistedSessionData = Omit<
  Session,
  "id" | "createdAt" | "updatedAt" | "analysisSnapshots" | "modelCode" | "persistOnCloud" | "metadata"
> & {
  metadata: Pick<SessionMeta, "messageCount" | "tokenCount" | "costUSD"> & { modelCode: ModelCode };
};

export interface EncryptedDataPayload {
  encryptedData: number[]; // Uint8Array converted to array
  iv: number[];
  authTag: number[];
  encAlg: string;
}
export interface EncryptedData {
  encryptedData: Uint8Array<ArrayBufferLike>; // Uint8Array converted to array
  iv: Uint8Array<ArrayBufferLike>;
  authTag: Uint8Array<ArrayBufferLike>;
  encAlg: string;
}

export const payloadToEncryptionResult = (payload: EncryptedDataPayload): SessionEncryptionResult => ({
  encryptedData: new Uint8Array(payload.encryptedData),
  iv: new Uint8Array(payload.iv),
  authTag: new Uint8Array(payload.authTag).slice(0, 16),
  encAlg: payload.encAlg,
});

export const encryptionResultToPayload = (result: SessionEncryptionResult): EncryptedDataPayload => ({
  encryptedData: Array.from(result.encryptedData),
  iv: Array.from(result.iv),
  authTag: Array.from(result.authTag).slice(0, 16),
  encAlg: result.encAlg,
});

export const sessionToPersistedSession = (session: Session): PersistedSessionData => ({
  title: session.title,
  subtitle: session.subtitle,
  messages: session.messages,
  memoryStore: session.memoryStore,
  continuitySummary: session.continuitySummary,
  aggregatedAnalysis: session.aggregatedAnalysis,
  aiSuggestedTitle: session.aiSuggestedTitle,
  metadata: {
    messageCount: session.metadata.messageCount,
    tokenCount: session.metadata.tokenCount,
    costUSD: session.metadata.costUSD,
    modelCode: session.modelCode,
  },
});

export const persistedSessionToSession = (
  persisted: Partial<PersistedSessionData>
): Omit<Session, "id" | "createdAt" | "updatedAt"> => ({
  title: persisted.title ?? "Untitled Session",
  subtitle: persisted.subtitle,
  messages: persisted.messages ?? [],
  memoryStore: persisted.memoryStore ?? null,
  continuitySummary: persisted.continuitySummary ?? null,
  aggregatedAnalysis: persisted.aggregatedAnalysis ?? null,
  analysisSnapshots: [],
  modelCode: persisted.metadata?.modelCode ?? MODELS_CODES.M1,
  aiSuggestedTitle: persisted.aiSuggestedTitle ?? false,
  metadata: {
    tokenUsage: [],
    messageCount: persisted.metadata?.messageCount ?? 0,
    tokenCount: persisted.metadata?.tokenCount ?? 0,
    costUSD: persisted.metadata?.costUSD ?? 0,
  },
  persistOnCloud: true,
});
