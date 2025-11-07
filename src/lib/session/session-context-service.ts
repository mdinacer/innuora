/**
 * Session Context Service
 *
 * Manages server-side session context WITHOUT caching.
 * Handles encrypted therapeutic data that is NEVER sent to client.
 *
 * Features:
 * - NO CACHING: Context changes on every user message, caching would cause stale data
 * - Automatic encryption/decryption
 * - Type-safe context management
 *
 * Performance Note:
 * Session context is fetched infrequently (only during AI operations),
 * so caching provides minimal benefit while risking stale data.
 */

import type { RelationalTrace } from "@/domains/conversation-engine/types/reflection.types";
import type { ContextLifecycle } from "@/domains/conversation-engine/types/synthesis.types";
import type { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import type { SessionDynamicsMatrix } from "@/domains/session-dynamics";
import type {
  InnuoraAnalysis,
  TherapeuticAnalysisWithMessageId,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { decryptServerData, encryptServerData, ServerDataContent } from "@/lib/crypto/server-crypto";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";

/**
 * Session context returned to AI operations
 * Contains decrypted therapeutic data for processing
 */
export interface SessionContext {
  sessionId: string;
  userId: string;
  analysisSnapshots: TherapeuticAnalysisWithMessageId[];
  aggregatedAnalysis: SessionAnalysis | null;
  memoryStore: string | null;
  v7_relational_trace: RelationalTrace | null;
  v7_analyses: InnuoraAnalysis[];
  v7_context_lifecycle: ContextLifecycle | null;
  v7_session_dynamics: SessionDynamicsMatrix | null;
}

/**
 * Fetches and decrypts session context
 * NO CACHING - Session context changes on every user message
 *
 * SECURITY: Validates session ownership when requiredUserId is provided
 *
 * @param sessionId - Session ID to fetch context for
 * @param requiredUserId - Optional user ID to validate session ownership (RECOMMENDED)
 * @returns Decrypted session context
 *
 * @example
 * // With ownership validation (RECOMMENDED)
 * const user = await requireCurrentUser();
 * const dbUser = await prisma.user.findUnique({ where: { authId: user.id } });
 * const context = await getSessionContext(sessionId, dbUser.id);
 *
 * @example
 * // Without validation (USE ONLY if ownership already validated)
 * const context = await getSessionContext(sessionId);
 */
export async function getSessionContext(sessionId: string, requiredUserId?: string): Promise<SessionContext> {
  const result = await logger.wrapOperation(
    async () => {
      // Fetch session with separate context table
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          userId: true,
          serverContext: {
            select: {
              encryptedData: true,
            },
          },
        },
      });

      if (!session) {
        logger.logErrorAndThrow(ERROR_CODES.SESSION_NOT_FOUND, new Error(`Session not found: ${sessionId}`), {
          operation: "session_context_get",
          sessionId,
        });
        // TypeScript doesn't know logErrorAndThrow never returns
        throw new Error("Unreachable");
      }

      // SECURITY: Validate session ownership if requiredUserId provided
      if (requiredUserId && session.userId !== requiredUserId) {
        logger.logErrorAndThrow(
          ERROR_CODES.AUTH_UNAUTHORIZED,
          new Error(`User ${requiredUserId} does not own session ${sessionId}`),
          {
            operation: "session_context_get_ownership_check",
            sessionId,
            metadata: {
              requiredUserId,
              actualUserId: session.userId,
            },
          }
        );
      }

      // If no server context exists yet, return empty context
      if (!session.serverContext) {
        return {
          sessionId: session.id,
          userId: session.userId,
          analysisSnapshots: [],
          aggregatedAnalysis: null,
          memoryStore: null,
          v7_relational_trace: null,
          v7_analyses: [],
          v7_context_lifecycle: null,
          v7_session_dynamics: null,
        };
      }

      // Decrypt server data from SessionContext table
      const decryptedData = await decryptServerData<ServerDataContent>(
        session.serverContext.encryptedData as EncryptedBlob
      );

      return {
        sessionId: session.id,
        userId: session.userId,
        analysisSnapshots: decryptedData.analysisSnapshots || [],
        aggregatedAnalysis: decryptedData.aggregatedAnalysis || null,
        memoryStore: decryptedData.memoryStore || null,
        v7_relational_trace: (decryptedData.v7_relational_trace as RelationalTrace) ?? null,
        v7_analyses: (decryptedData.v7_analyses as InnuoraAnalysis[]) ?? [],
        v7_context_lifecycle: (decryptedData.v7_context_lifecycle as ContextLifecycle) ?? null,
        v7_session_dynamics: (decryptedData.v7_session_dynamics as SessionDynamicsMatrix) ?? null,
      };
    },
    ERROR_CODES.SESSION_CONTEXT_FETCH_FAILED,
    {
      operation: "session_context_get",
      sessionId,
    },
    "Session context fetched successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Updates session context after AI operations
 * Encrypts and saves to database
 *
 * @param sessionId - Session ID to update
 * @param updates - Partial updates to apply
 *
 * @example
 * await updateSessionContext(sessionId, {
 *   analysisSnapshots: [...prev, newAnalysis],
 *   memoryStore: updatedMemory
 * });
 */
export async function updateSessionContext(
  sessionId: string,
  updates: Partial<Omit<ServerDataContent, "sessionId" | "userId">>
): Promise<void> {
  const result = await logger.wrapOperation(
    async () => {
      // Fetch current context (always fresh, no cache)
      const currentContext = await getSessionContext(sessionId);

      // Merge updates with current data
      const updatedData: ServerDataContent = {
        analysisSnapshots: updates.analysisSnapshots ?? currentContext.analysisSnapshots,
        aggregatedAnalysis: updates.aggregatedAnalysis ?? currentContext.aggregatedAnalysis,
        memoryStore: updates.memoryStore ?? currentContext.memoryStore,
        v7_relational_trace: updates.v7_relational_trace ?? currentContext.v7_relational_trace ?? null,
        v7_analyses: updates.v7_analyses ?? currentContext.v7_analyses ?? [],
        v7_context_lifecycle: updates.v7_context_lifecycle ?? currentContext.v7_context_lifecycle ?? null,
        v7_session_dynamics: updates.v7_session_dynamics ?? currentContext.v7_session_dynamics ?? null,
      };

      // Encrypt updated data
      const encryptedData = await encryptServerData(updatedData);

      // Upsert to SessionContext table (create if doesn't exist, update if exists)
      await prisma.sessionContext.upsert({
        where: { sessionId },
        create: {
          sessionId,
          encryptedData: encryptedData as any,
        },
        update: {
          encryptedData: encryptedData as any,
          updatedAt: new Date(),
        },
      });

      // Also update session timestamp
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          updatedAt: new Date(),
        },
      });
    },
    ERROR_CODES.SESSION_CONTEXT_UPDATE_FAILED,
    {
      operation: "session_context_update",
      sessionId,
      metadata: {
        hasAnalysisUpdate: !!updates.analysisSnapshots,
        hasMemoryUpdate: !!updates.memoryStore,
      },
    },
    "Session context updated successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }
}

/**
 * Initializes server data for a new session
 * Creates empty encrypted blob
 *
 * @param sessionId - Session ID to initialize
 */
export async function initializeSessionContext(sessionId: string): Promise<void> {
  const result = await logger.wrapOperation(
    async () => {
      // Create empty server data
      const emptyData: ServerDataContent = {
        analysisSnapshots: [],
        aggregatedAnalysis: null,
        memoryStore: null,
        v7_relational_trace: null,
        v7_analyses: [],
        v7_context_lifecycle: null,
        v7_session_dynamics: null,
      };

      // Encrypt
      const encryptedData = await encryptServerData(emptyData);

      // Create SessionContext entry
      await prisma.sessionContext.create({
        data: {
          sessionId,
          encryptedData: encryptedData as any,
        },
      });
    },
    ERROR_CODES.SESSION_INITIALIZATION_FAILED,
    {
      operation: "session_context_initialize",
      sessionId,
    },
    "Session context initialized successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }
}

/**
 * Adds a new analysis snapshot to session context
 * Helper function for common operation
 *
 * @param sessionId - Session ID
 * @param analysis - New analysis to add
 */
export async function addAnalysisToContext(
  sessionId: string,
  analysis: TherapeuticAnalysisWithMessageId
): Promise<void> {
  const context = await getSessionContext(sessionId);

  await updateSessionContext(sessionId, {
    analysisSnapshots: [...context.analysisSnapshots, analysis],
  });
}

/**
 * Updates session memory
 * Helper function for memory operations
 *
 * @param sessionId - Session ID
 * @param memory - New memory text
 */
export async function updateSessionMemory(sessionId: string, memory: string): Promise<void> {
  await updateSessionContext(sessionId, {
    memoryStore: memory,
  });
}

/**
 * Gets only analysis snapshots (lightweight)
 * Useful when only analysis history is needed
 *
 * @param sessionId - Session ID
 * @returns Analysis snapshots only
 */
export async function getAnalysisSnapshots(sessionId: string): Promise<TherapeuticAnalysisWithMessageId[]> {
  const context = await getSessionContext(sessionId);
  return context.analysisSnapshots;
}

/**
 * Gets only session memory (lightweight)
 * Useful when only memory is needed
 *
 * @param sessionId - Session ID
 * @returns Memory string or null
 */
export async function getSessionMemory(sessionId: string): Promise<string | null> {
  const context = await getSessionContext(sessionId);
  return context.memoryStore;
}
