import z from "zod";

import { SESSION_PROPS, SessionId } from "@/constants/sessions/sessions.props";
import initTranslations, { AppLocales } from "@/lib/i18n";
import { safeValidateSessionFlow } from "@/lib/zod/session-flow-schema";
import { FlowStep, SessionFlow } from "@/types/flow-session.types";

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// export function mergeStepProps<T extends FlowStep>(step: T, stepProps: Partial<T>): T {
//   const mergedStep: T = {
//     ...step,
//     ...stepProps,
//     content: {
//       ...(isObject(step.content) ? step.content : {}),
//       ...(isObject(stepProps.content) ? stepProps.content : {}),
//     },
//   };
//   return mergedStep;
// }

function deepMerge(target: any, source: any): any {
  if (!isObject(target)) return source || {};
  if (!isObject(source)) return target;

  const result = { ...target };

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue);
      } else if (sourceValue !== undefined) {
        result[key] = sourceValue;
      }
    }
  }

  return result;
}

export function mergeStepProps<T extends FlowStep>(step: T, stepProps: Partial<T>): T {
  return deepMerge(step, stepProps) as T;
}

export async function loadSessionFlow(sessionId: SessionId, locale: AppLocales = "en"): Promise<SessionFlow> {
  const { t } = await initTranslations(locale, ["sessions"]);
  const sessionData = t(sessionId, { returnObjects: true, defaultValue: {} }) as SessionFlow | undefined;

  if (!sessionData) {
    throw new Error(`No session data found for sessionId: ${sessionId}`);
  }

  const sessionProps = SESSION_PROPS[sessionId];

  if (!sessionProps) {
    throw new Error(`No session props found for sessionId: ${sessionId}`);
  }

  const mergedSteps = sessionData.steps.map((step) => {
    const stepOverrides = sessionProps[step.id as keyof typeof sessionProps] as Partial<FlowStep> | undefined;

    if (!stepOverrides) {
      return step;
    }

    return mergeStepProps(step, stepOverrides);
  });

  const { data, success, error } = safeValidateSessionFlow({
    ...sessionData,
    steps: mergedSteps,
  });

  if (!success) {
    // Enhanced error logging with better formatting
    const errorMessage = `Zod validation failed: ${JSON.stringify(z.treeifyError(error), null, 2)}`;

    console.error(`Invalid session schema for sessionId: ${sessionId}`, {
      sessionId,
      locale,
      error: errorMessage,
      originalData: sessionData,
      mergedSteps: mergedSteps.map((step) => ({ id: step.id, type: step.type })), // Log step summary for debugging
    });

    throw new Error(`Session validation failed for ${sessionId}: ${errorMessage}`);
  }

  return data;
}

// Optional: Add a helper for better error context in development
export function createSessionLoadError(sessionId: SessionId, message: string, cause?: unknown): Error {
  const error = new Error(`[SessionFlow] ${message} (sessionId: ${sessionId})`);
  if (cause) {
    error.cause = cause;
  }
  return error;
}

// Alternative version with the custom error helper
export async function loadSessionFlowWithBetterErrors(sessionId: SessionId, locale: AppLocales = "en") {
  try {
    const { t } = await initTranslations(locale, ["sessions"]);
    const sessionData = t(sessionId, { returnObjects: true, defaultValue: {} }) as SessionFlow | undefined;

    if (!sessionData) {
      throw createSessionLoadError(sessionId, "No session data found in translations");
    }

    const sessionProps = SESSION_PROPS[sessionId];

    if (!sessionProps) {
      throw createSessionLoadError(sessionId, "No session props found in SESSION_PROPS");
    }

    const mergedSteps = sessionData.steps.map((step) => {
      const stepOverrides = sessionProps[step.id as keyof typeof sessionProps] as Partial<FlowStep> | undefined;

      if (!stepOverrides) {
        return step;
      }

      return mergeStepProps(step, stepOverrides);
    });

    const { data, success, error } = safeValidateSessionFlow({
      ...sessionData,
      steps: mergedSteps,
    });

    if (!success) {
      throw createSessionLoadError(sessionId, "Schema validation failed", error);
    }

    return data;
  } catch (error) {
    // Log the full context in development
    if (process.env.NODE_ENV === "development") {
      console.error("Session loading failed:", {
        sessionId,
        locale,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
    throw error;
  }
}
