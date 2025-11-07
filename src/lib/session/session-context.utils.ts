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
export function getSessionData(sessionContext: SessionContext | null): SessionData {
  if (!sessionContext) {
    return {
      relationalTrace: null,
      analyses: [],
      contextLifecycle: initialContextLifecycle,
      sessionDynamics: null,
    };
  }

  const relationalTrace = (sessionContext.v7_relational_trace as RelationalTrace) || null;
  const analyses = (sessionContext.v7_analyses as InnuoraAnalysis[]) || [];
  const contextLifecycle = (sessionContext.v7_context_lifecycle as ContextLifecycle) || initialContextLifecycle;
  const sessionDynamics = (sessionContext.v7_session_dynamics as SessionDynamicsMatrix) || null;

  return {
    relationalTrace,
    analyses,
    contextLifecycle,
    sessionDynamics,
  };
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
