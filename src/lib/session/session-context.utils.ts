/**
 * Session Context Utilities
 * Type-safe wrappers for accessing and updating session context fields
 */

import { RelationalTrace } from "@/domains/conversation-engine/types/reflection.types";
import { ContextLifecycle, initialContextLifecycle } from "@/domains/conversation-engine/types/synthesis.types";
import { SessionDynamicsMatrix } from "@/domains/session-dynamics";
import { InnuoraAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { SessionContext } from "./session-context-service";

//───────────────────────────────────────────────────────────────
// SESSION CONTEXT DATA EXTRACTION
//───────────────────────────────────────────────────────────────

export interface SessionData {
  relationalTrace: RelationalTrace | null;
  analyses: InnuoraAnalysis[];
  contextLifecycle: ContextLifecycle;
  sessionDynamics: SessionDynamicsMatrix | null;
}

/**
 * Extract typed session data from encrypted session context
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

//───────────────────────────────────────────────────────────────
// SESSION CONTEXT UPDATE BUILDERS
//───────────────────────────────────────────────────────────────

export interface SessionDataUpdate {
  v7_relational_trace?: RelationalTrace;
  v7_analyses?: InnuoraAnalysis[];
  v7_context_lifecycle?: ContextLifecycle;
  v7_session_dynamics?: SessionDynamicsMatrix;
}

/**
 * Build session context update object
 */
export function buildSessionContextUpdate(updates: {
  relationalTrace?: RelationalTrace;
  analyses?: InnuoraAnalysis[];
  contextLifecycle?: ContextLifecycle;
  sessionDynamics?: SessionDynamicsMatrix;
}): SessionDataUpdate {
  const update: SessionDataUpdate = {};

  if (updates.relationalTrace) {
    update.v7_relational_trace = updates.relationalTrace;
  }

  if (updates.analyses) {
    update.v7_analyses = updates.analyses;
  }

  if (updates.contextLifecycle) {
    update.v7_context_lifecycle = updates.contextLifecycle;
  }

  if (updates.sessionDynamics) {
    update.v7_session_dynamics = updates.sessionDynamics;
  }

  return update;
}
