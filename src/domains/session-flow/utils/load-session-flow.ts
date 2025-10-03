import z from "zod";

import { APP_CONFIG } from "@/config/app";
import { SESSION_PROPS, SessionId } from "@/domains/session-flow/constants/sessions.props";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import initTranslations, { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { safeValidateSessionFlow } from "@/lib/zod/session-flow-schema";
import { FlowStep, SessionFlow } from "@/types/flow-session.types";

export function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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
  try {
    const { t } = await initTranslations(locale, ["sessions"]);
    const sessionData = t(sessionId, {
      returnObjects: true,
      defaultValue: {},
      app_name: APP_CONFIG.name,
    }) as SessionFlow | undefined;

    if (!sessionData) {
      throw new Error(`No session data found for sessionId: ${sessionId}`);
    }

    const sessionProps = SESSION_PROPS[sessionId];
    if (!sessionProps) {
      throw new Error(`No session props found for sessionId: ${sessionId}`);
    }

    // Merge translation content with technical props
    const mergedSteps = sessionData.steps.map((step) => {
      const stepProps = sessionProps[step.id as keyof typeof sessionProps] as Partial<FlowStep> | undefined;

      // Ensure step exists in props - fail fast if mismatch
      if (!stepProps) {
        throw new Error(
          `Step "${step.id}" found in ${locale} translations but missing in SESSION_PROPS. ` +
            `This indicates a mismatch between JSON and props files.`
        );
      }

      return mergeStepProps(step, stepProps);
    });

    // Validate merged result
    const validationResult = safeValidateSessionFlow({
      ...sessionData,
      steps: mergedSteps,
    });

    if (!validationResult.success || !validationResult.data) {
      const errorMessage = JSON.stringify(z.treeifyError(validationResult.error), null, 2);

      logger.logErrorAndThrow(
        ERROR_CODES.VALIDATION_SCHEMA_PARSE_FAILED,
        new Error(`Session flow validation failed: ${errorMessage}`),
        {
          operation: "flow-session.load",
          metadata: {
            sessionId,
            locale,
            errorMessage,
            mergedSteps: mergedSteps.map((step) => ({ id: step.id, type: step.type })),
          },
        }
      );
    }

    // TypeScript doesn't understand that logErrorAndThrow never returns, so we use non-null assertion
    return validationResult.data!;
  } catch (error) {
    // If error is already an AppError (from logErrorAndThrow), just re-throw
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

    // Otherwise, log and throw new error (this always throws, never returns)
    return logger.logErrorAndThrow(
      ERROR_CODES.SESSION_READ_FAILED,
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "flow-session.load",
        metadata: { sessionId, locale },
      }
    );
  }
}
