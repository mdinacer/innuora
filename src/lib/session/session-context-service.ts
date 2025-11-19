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
import { ReflectionDirective } from "@/domains/guidance-flow/directive/types";
import { FactualMemory } from "@/domains/guidance-flow/memory/types";
import { SessionPhaseEvaluation } from "@/domains/guidance-flow/phase/types";
import { SessionContext, SessionDataUpdate } from "@/domains/guidance-flow/types/session-server";
import { decryptServerData, encryptServerData } from "@/lib/crypto/server-crypto";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";
import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";

/**
 * Session context returned to AI operations
 * Contains decrypted therapeutic data for processing
 */

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
  try {
    // Fetch session with separate context table
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        userId: true,
        serverContext: {
          select: {
            factualMemory: true,
            relationalTrace: true,
            sessionWellness: true,
            directives: true,
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
        factualMemory: [],
        relationalTrace: null,
        sessionWellness: null,
        directives: [],
      };
    }

    // Decrypt server data from SessionContext table
    const decryptedData = session.serverContext.factualMemory
      ? await decryptServerData<FactualMemory[]>(session.serverContext.factualMemory as EncryptedBlob)
      : [];

    return {
      sessionId: session.id,
      factualMemory: decryptedData,
      relationalTrace: session.serverContext.relationalTrace as RelationalTrace | null,
      sessionWellness: session.serverContext.sessionWellness as SessionPhaseEvaluation | null,
      directives: session.serverContext.directives as ReflectionDirective[],
    };
  } catch (error) {
    if (error instanceof AppError) throw error;

    const err = error instanceof Error ? error : new Error(String(error));
    await logger.logError("Session context fetch failed", {
      operation: "session_context_get",
      sessionId,
    });
    throw err;
  }
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
export async function updateSessionContext(sessionId: string, updates: SessionDataUpdate): Promise<void> {
  try {
    // Fetch current context (always fresh, no cache)
    const currentContext = await getSessionContext(sessionId);

    const encryptedMemories: EncryptedBlob | undefined =
      updates.factualMemory && updates.factualMemory.length > 0
        ? await encryptServerData([...currentContext.factualMemory, ...updates.factualMemory])
        : undefined;

    // Merge updates with current data
    const updatedData = {
      factualMemory: encryptedMemories,
      ...(updates.directive ? { directives: { create: [updates.directive] } } : {}),
      ...(updates.relationalTrace ? { relationalTrace: updates.relationalTrace as any } : {}),
      ...(updates.sessionWellness ? { sessionWellness: updates.sessionWellness as any } : {}),
    };

    // Encrypt updated data

    // Upsert to SessionContext table (create if doesn't exist, update if exists)
    // await prisma.sessionContext.upsert({
    //   where: { sessionId },
    //   create: {
    //     sessionId,
    //     ...updatedData,
    //   },
    //   update: updatedData,
    // });

    // // Also update session timestamp
    // await prisma.session.update({
    //   where: { id: sessionId },
    //   data: {
    //     updatedAt: new Date(),
    //   },
    // });

    await prisma.$transaction([
      prisma.sessionContext.upsert({
        where: { sessionId },
        create: { sessionId, ...updatedData },
        update: updatedData,
      }),
      prisma.session.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      }),
    ]);
  } catch (error) {
    if (error instanceof AppError) throw error;

    const err = error instanceof Error ? error : new Error(String(error));
    await logger.logError("Session context update failed", {
      operation: "session_context_update",
      sessionId,
      metadata: {
        hadDirectiveUpdate: !!updates.directive,
        hasMemoryUpdate: !!updates.factualMemory,
        hasRelationalTraceUpdate: !!updates.relationalTrace,
        hasSessionWellnessUpdate: !!updates.sessionWellness,
      },
    });
    throw err;
  }
}

// /**
//  * Initializes server data for a new session
//  * Creates empty encrypted blob
//  *
//  * @param sessionId - Session ID to initialize
//  */
// export async function initializeSessionContext(sessionId: string): Promise<void> {
//   try {
//     // Create empty server data
//     const emptyData: ServerDataContent = {
//       analysisSnapshots: [],
//       aggregatedAnalysis: null,
//       memoryStore: null,
//       v7_relational_trace: null,
//       v7_analyses: [],
//       v7_context_lifecycle: null,
//       v7_session_dynamics: null,
//     };

//     // Encrypt
//     const encryptedData = await encryptServerData(emptyData);

//     // Create SessionContext entry
//     await prisma.sessionContext.create({
//       data: {
//         sessionId,
//         encryptedData: encryptedData as any,
//       },
//     });
//   } catch (error) {
//     if (error instanceof AppError) throw error;

//     const err = error instanceof Error ? error : new Error(String(error));
//     await logger.logError("Session context initialization failed", {
//       operation: "session_context_initialize",
//       sessionId,
//     });
//     throw err;
//   }
// }

// /**
//  * Adds a new analysis snapshot to session context
//  * Helper function for common operation
//  *
//  * @param sessionId - Session ID
//  * @param analysis - New analysis to add
//  */
// export async function addAnalysisToContext(
//   sessionId: string,
//   analysis: TherapeuticAnalysisWithMessageId
// ): Promise<void> {
//   const context = await getSessionContext(sessionId);

//   await updateSessionContext(sessionId, {
//     analysisSnapshots: [...context.analysisSnapshots, analysis],
//   });
// }

// /**
//  * Updates session memory
//  * Helper function for memory operations
//  *
//  * @param sessionId - Session ID
//  * @param memory - New memory text
//  */
// export async function updateSessionMemory(sessionId: string, memory: string): Promise<void> {
//   await updateSessionContext(sessionId, {
//     memoryStore: memory,
//   });
// }

// /**
//  * Gets only analysis snapshots (lightweight)
//  * Useful when only analysis history is needed
//  *
//  * @param sessionId - Session ID
//  * @returns Analysis snapshots only
//  */
// export async function getAnalysisSnapshots(sessionId: string): Promise<TherapeuticAnalysisWithMessageId[]> {
//   const context = await getSessionContext(sessionId);
//   return context.analysisSnapshots;
// }

// /**
//  * Gets only session memory (lightweight)
//  * Useful when only memory is needed
//  *
//  * @param sessionId - Session ID
//  * @returns Memory string or null
//  */
// export async function getSessionMemory(sessionId: string): Promise<string | null> {
//   const context = await getSessionContext(sessionId);
//   return context.memoryStore;
// }
