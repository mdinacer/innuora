"use server";

import { decryptServerData, encryptServerData } from "@/lib/crypto/server-crypto";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";
import { AppError, ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/logger.server";
import { prisma } from "@/lib/prisma";
import { ReflectionDirective } from "../domains/directive/types";
import { FactualMemory } from "../domains/memory/types";
import { SessionPhaseEvaluation } from "../domains/phase/types";
import { RelationalTrace } from "../domains/reflection/types";
import { SessionContext, SessionDataUpdate } from "../types/session-server";

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
