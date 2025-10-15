/**
 * Session Context Service
 *
 * Manages server-side session context with Next.js caching.
 * Handles encrypted therapeutic data that is NEVER sent to client.
 *
 * Features:
 * - Next.js unstable_cache for performance
 * - Tag-based cache invalidation
 * - Automatic encryption/decryption
 * - Type-safe context management
 */

import { revalidateTag, unstable_cache } from "next/cache";

import { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import { TherapeuticAnalysisWithMessageId } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
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
  continuitySummary: {
    text: string;
    updatedAt: Date;
    lastMessageIndex: number;
  } | null;
}

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  revalidate: 300, // 5 minutes
  tags: (sessionId: string) => [`session-context-${sessionId}`],
};

/**
 * Fetches and decrypts session context
 * Uses Next.js caching for performance
 *
 * @param sessionId - Session ID to fetch context for
 * @returns Decrypted session context
 *
 * @example
 * const context = await getSessionContext(sessionId);
 * const previousAnalyses = context.analysisSnapshots;
 */
export async function getSessionContext(sessionId: string, forceFresh = false): Promise<SessionContext> {
  //if (forceFresh) revalidateTag(`session-context-${sessionId}`);
  // Use Next.js unstable_cache for automatic caching
  const getCachedContext = unstable_cache(
    async (id: string) => {
      const result = await logger.wrapOperation(
        async () => {
          // Fetch session with separate context table
          const session = await prisma.session.findUnique({
            where: { id },
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
            logger.logErrorAndThrow(ERROR_CODES.SESSION_NOT_FOUND, new Error(`Session not found: ${id}`), {
              operation: "session_context_get",
              sessionId: id,
            });
            // TypeScript doesn't know logErrorAndThrow never returns
            throw new Error("Unreachable");
          }

          // If no server context exists yet, return empty context
          if (!session.serverContext) {
            return {
              sessionId: session.id,
              userId: session.userId,
              analysisSnapshots: [],
              aggregatedAnalysis: null,
              memoryStore: null,
              continuitySummary: null,
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
            continuitySummary: decryptedData.continuitySummary || null,
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
    },
    [`session-context`],
    {
      revalidate: CACHE_CONFIG.revalidate,
      tags: CACHE_CONFIG.tags(sessionId),
    }
  );

  return await getCachedContext(sessionId);
}

/**
 * Updates session context after AI operations
 * Encrypts and saves to database, then invalidates cache
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
      // Fetch current context
      const currentContext = await getSessionContext(sessionId, true);

      // Merge updates with current data
      const updatedData: ServerDataContent = {
        analysisSnapshots: updates.analysisSnapshots ?? currentContext.analysisSnapshots,
        aggregatedAnalysis: updates.aggregatedAnalysis ?? currentContext.aggregatedAnalysis,
        memoryStore: updates.memoryStore ?? currentContext.memoryStore,
        continuitySummary: updates.continuitySummary ?? currentContext.continuitySummary,
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

      // NOTE: Cache invalidation removed to prevent Next.js 15 render-time revalidateTag errors
      // Cache will expire naturally after 5 minutes (CACHE_CONFIG.revalidate)
      // For immediate updates, client should refetch or use optimistic UI updates
    },
    ERROR_CODES.SESSION_CONTEXT_UPDATE_FAILED,
    {
      operation: "session_context_update",
      sessionId,
      metadata: {
        hasAnalysisUpdate: !!updates.analysisSnapshots,
        hasMemoryUpdate: !!updates.memoryStore,
        hasContinuityUpdate: !!updates.continuitySummary,
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
        continuitySummary: null,
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
 * Manually invalidates session context cache
 * Useful for forced refreshes or after external updates
 *
 * WARNING: Can only be called from server actions/route handlers, NOT during render
 * See: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering
 *
 * @param sessionId - Session ID to invalidate cache for
 */
export function invalidateSessionCache(sessionId: string): void {
  try {
    revalidateTag(`session-context-${sessionId}`);

    logger.logInfo("Session cache invalidated", {
      operation: "session_context_invalidate_cache",
      sessionId,
    });
  } catch (error) {
    // Next.js 15: revalidateTag cannot be called during render
    logger.logWarning("Cache invalidation skipped (called during render)", {
      operation: "session_context_invalidate_cache_skipped",
      sessionId,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
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
 * Updates continuity summary
 * Helper function for summary operations
 *
 * @param sessionId - Session ID
 * @param summary - Summary object
 */
export async function updateContinuitySummary(
  sessionId: string,
  summary: {
    text: string;
    updatedAt: Date;
    lastMessageIndex: number;
  }
): Promise<void> {
  await updateSessionContext(sessionId, {
    continuitySummary: summary,
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
