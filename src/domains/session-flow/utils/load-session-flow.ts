import z from "zod";

import { SESSION_BUILDERS, SESSION_STEP_PROPS, SessionId } from "@/domains/session-flow/constants/sessions.props";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { safeValidateSessionFlow } from "@/lib/zod/session-flow-schema";
import { SessionFlow } from "@/types/flow-session.types";

export async function loadSessionFlow(sessionId: SessionId, locale: AppLocales = "en"): Promise<SessionFlow> {
  try {
    const builder = SESSION_BUILDERS[sessionId];

    if (!builder) {
      throw new Error(`No session builder registered for sessionId: ${sessionId}`);
    }

    const sessionFlow = await builder(locale);

    const validationResult = safeValidateSessionFlow(sessionFlow);

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
            steps: sessionFlow.steps.map((step) => ({
              id: step.id,
              type: step.type,
            })),
          },
        }
      );
    }

    // Validate that technical step props remain aligned with builder output
    const expectedStepIds = Object.keys(SESSION_STEP_PROPS[sessionId]);
    const actualStepIds = validationResult.data!.steps.map((step) => step.id);

    if (expectedStepIds.length !== actualStepIds.length) {
      throw new Error(
        `Mismatch between technical step definitions and translations for session "${sessionId}" (locale: ${locale})`
      );
    }

    expectedStepIds.forEach((stepId) => {
      if (!actualStepIds.includes(stepId)) {
        throw new Error(
          `Step "${stepId}" defined in technical props is missing from builder output for session "${sessionId}" (locale: ${locale})`
        );
      }
    });

    return validationResult.data!;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }

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
