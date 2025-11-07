"use server";

import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

import { requireCurrentUser } from "@/app/actions/auth-actions";
import { SESSION_TITLE_GENERATE_PROMPT_LOCALIZED } from "@/domains/ai-conversation/prompts/prompt.session-title";
import { mapAnalysesToChartData } from "@/domains/session-analysis/session-analysis.utils";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { ERROR_CODES } from "@/lib/errors";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { getSessionContext } from "@/lib/session/session-context-service";
import { formatMessages } from "@/lib/utils/format-message";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { SessionCreate } from "@/lib/zod/session-create.schema";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { AnalysisChartPoint } from "@/types/session-analysis-chart";
import { processAiPromptsWithRetry } from "./ai-client-actions";
import { deductCreditsFromUser } from "./credit-actions";
import { getAuthenticatedUserContext } from "./user-context";

export async function getSessionUpdateInfo(sessionId: string): Promise<{ id: string; updatedAt: Date } | null> {
  const authUser = await requireCurrentUser();
  return await prisma.session.findUnique({
    where: { id: sessionId, user: { authId: authUser.id } },
    select: {
      id: true,
      updatedAt: true,
      persistOnCloud: true,
    },
  });
}
export async function getSessionsUpdateInfo(): Promise<{ id: string; updatedAt: Date }[]> {
  const authUser = await requireCurrentUser();
  return await prisma.session.findMany({
    where: { user: { authId: authUser.id } },
    select: {
      id: true,
      updatedAt: true,
      persistOnCloud: true,
    },
  });
}
export async function getSessionsInfo(): Promise<
  Prisma.SessionGetPayload<{ select: { id: true; updatedAt: true; title: true; metadata: true } }>[]
> {
  const authUser = await requireCurrentUser();
  return await prisma.session.findMany({
    where: { user: { authId: authUser.id } },
    select: {
      id: true,
      updatedAt: true,
      title: true,
      metadata: true,
    },
  });
}

export async function getSessionById(sessionId: string) {
  const authUser = await requireCurrentUser();

  const session = await prisma.session.findUnique({
    where: { id: sessionId, user: { authId: authUser.id } },
  });

  if (!session) return null;

  // Convert Uint8Arrays to plain arrays for serialization
  return session;
}

export async function createSession(sessionCreateInput: SessionCreate) {
  const authUser = await requireCurrentUser();

  const sessionTitle = sessionCreateInput.title || `New Session ${nanoid(6)}`;

  return await logger.wrapOperation(
    () =>
      prisma.session.create({
        data: {
          title: sessionTitle,
          subtitle: sessionCreateInput.subtitle || null,
          autoUpdateTitle: sessionCreateInput.autoUpdateTitle || false,
          persistOnCloud: sessionCreateInput.persistOnCloud || false,
          metadata: {
            messageCount: 0,
          },
          user: {
            connect: { authId: authUser.id },
          },
        },
      }),
    ERROR_CODES.SESSION_CREATE_FAILED,
    {
      userId: authUser.id,
      operation: "session_create",
      metadata: {
        title: sessionTitle,
        autoUpdateTitle: sessionCreateInput.autoUpdateTitle,
        persistOnCloud: sessionCreateInput.persistOnCloud,
      },
    },
    `Session created: ${sessionTitle}`
  );
}
export async function pushSession(sessionCreateInput: Prisma.SessionCreateWithoutUserInput) {
  const authUser = await requireCurrentUser();

  return await logger.wrapOperation(
    () =>
      prisma.session.create({
        data: {
          ...sessionCreateInput,
          user: {
            connect: { authId: authUser.id },
          },
        },
      }),
    ERROR_CODES.SESSION_CREATE_FAILED,
    {
      userId: authUser.id,
      operation: "session_push",
      metadata: {
        title: sessionCreateInput.title,
        hasEncryptedData: !!sessionCreateInput.encryptedData,
      },
    },
    `Session pushed: ${sessionCreateInput.title}`
  );
}

export async function updateSession(sessionId: string, data: Prisma.SessionUpdateWithoutUserInput) {
  const authUser = await requireCurrentUser();

  return await logger.wrapOperation(
    () =>
      prisma.session.update({
        where: { id: sessionId, user: { authId: authUser.id } },
        data,
      }),
    ERROR_CODES.SESSION_UPDATE_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "session_update",
      metadata: {
        fieldsUpdated: Object.keys(data),
        hasTitle: "title" in data,
        hasMetadata: "metadata" in data,
      },
    },
    "Session updated"
  );
}

export async function deleteSession(sessionId: string) {
  const authUser = await requireCurrentUser();

  return await logger.wrapOperation(
    async () => {
      // Get session info before deleting for audit
      const session = await prisma.session.findFirst({
        where: { id: sessionId, user: { authId: authUser.id } },
        select: { title: true, persistOnCloud: true },
      });

      if (!session) {
        logger.logErrorAndThrow(ERROR_CODES.SESSION_NOT_FOUND, new Error(`Session not found: ${sessionId}`), {
          userId: authUser.id,
          sessionId,
          operation: "session_delete_find_session",
        });
      }

      const deletedSession = await prisma.session.delete({
        where: { id: sessionId, user: { authId: authUser.id } },
      });

      return { ...deletedSession, title: session!.title };
    },
    ERROR_CODES.SESSION_DELETE_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "session_delete",
      metadata: {
        action: "delete_session",
      },
    },
    "Session deleted"
  );
}

export async function getSessionChartData(sessionId: string): Promise<AnalysisChartPoint[]> {
  const authenticatedUser = await getAuthenticatedUserContext();
  try {
    if (!sessionId) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("Session ID is required"), {
        operation: "get_session_chart_data",
        userId: authenticatedUser.id,
      });
    }
    // Fetch session context WITH ownership validation
    const sessionContext = await getSessionContext(sessionId as string, authenticatedUser.id);

    const analysis = sessionContext.analysisSnapshots;

    return mapAnalysesToChartData(analysis);
  } catch (error) {
    logger.logWarning("Failed to get session chart data", {
      operation: "get_session_chart_data_failed",
      userId: authenticatedUser.id,
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

async function processCreditsDeduction(
  authId: string | undefined,
  userId: string | undefined,
  responseCredits: number,
  responseMessage: string,
  sessionId?: string,
  operation?: string
): Promise<number> {
  if (!userId || !authId) {
    logger.logWarning("Credit deduction skipped - Missing userId or authId", {
      operation: "open_chat_credit_deduction_skipped",
      sessionId,
      metadata: {
        hasUserId: !!userId,
        hasAuthId: !!authId,
      },
    });
    return 0;
  }

  logger.logInfo("Attempting credit deduction", {
    operation: operation || "credit_deduction_attempt",
    sessionId,
    userId,
    metadata: {
      authId,
      responseCredits: responseCredits || 0,
    },
  });

  const deductResult = await deductCreditsFromUser(authId, responseCredits, "ai_usage", sessionId, {
    responseCredits: responseCredits || 0,
    responseLength: responseMessage.length,
  });

  if (deductResult.error) {
    logger.logWarning("Credit deduction failed", {
      operation: "open_chat_credit_deduction_failed",
      sessionId,
      userId,
      metadata: {
        error: deductResult.error.message,
        errorCode: deductResult.error.code,
        responseCredits: responseCredits || 0,
      },
    });
  } else {
    logger.logInfo("Credit deduction successful", {
      operation: "open_chat_credit_deduction_success",
      sessionId,
      userId,
      metadata: {
        creditsDeducted: responseCredits || 0,
        newBalance: deductResult.data?.newBalance,
      },
    });
  }

  return responseCredits || 0;
}
export async function generateSessionTitle(
  sessionId: string,
  messages: OpenChatMessage[],
  locale: AppLocales = "en"
): Promise<{
  response: {
    title: string;
    subtitle: string;
  };
  creditsUsed: number;
}> {
  const authenticatedUser = await getAuthenticatedUserContext();
  try {
    if (!messages.length) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("Messages cannot be empty"), {
        operation: "generate_session_title",
        userId: authenticatedUser.id,
        sessionId,
      });
    }

    if (!sessionId) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("Session ID is required"), {
        operation: "generate_session_title",
        userId: authenticatedUser.id,
      });
    }

    const formattedMessages = formatMessages(messages.slice(-6));

    const responseResult = await processAiPromptsWithRetry(
      [
        {
          role: "system",
          content: SESSION_TITLE_GENERATE_PROMPT_LOCALIZED[locale].replace("{{session_messages}}", formattedMessages),
        },
      ],
      {
        temperature: 0.7,
        max_completion_tokens: 115,
        top_p: 0.9,
        model: "background", // Use GPT-4.1-mini for title generation
      }
    );

    if (responseResult.error) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_RESPONSE_FAILED, new Error(responseResult.error.message), {
        operation: "generate_session_title",
        userId: authenticatedUser.id,
        sessionId,
      });
    }

    const aiResponse = responseResult.data;
    if (!aiResponse) {
      throw new Error("AI response is null");
    }

    // Step 7: Process credit deduction
    const creditsUsed = await processCreditsDeduction(
      authenticatedUser.authId,
      authenticatedUser.id,
      aiResponse.consumedCredits || 0,
      aiResponse.message,
      sessionId,
      "generate_session_title"
    );

    const parsedData = parseJsonObject(aiResponse.message) as { title: string; subtitle: string } | null;
    if (!parsedData || !parsedData.title || !parsedData.subtitle) {
      logger.logErrorAndThrow(
        ERROR_CODES.CHAT_RESPONSE_FAILED,
        new Error("AI response missing required fields (title, subtitle)"),
        {
          operation: "generate_session_title",
          userId: authenticatedUser.id,
          sessionId,
          metadata: { parsedData },
        }
      );
    }

    // Log AI operation (fire-and-forget)
    if (aiResponse.modelTokenUsage && authenticatedUser.id) {
      logAiOperation({
        userId: authenticatedUser.id,
        sessionId: sessionId,
        operation: "TITLE_UPDATE",
        tokenUsage: aiResponse.modelTokenUsage,
        creditsCharged: aiResponse.consumedCredits || 0,
      }).catch((error) => {
        logger.logWarning("Failed to log AI operation", {
          operation: "generate_session_title_log_ai_operation_failed",
          sessionId,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      });
    }

    return {
      response: {
        title: parsedData!.title,
        subtitle: parsedData!.subtitle,
      },
      creditsUsed,
    };
  } catch (error) {
    logger.logWarning("Failed to generate session title", {
      operation: "generate_session_title_failed",
      userId: authenticatedUser.id,
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        locale,
        messageCount: messages.length,
      },
    });
    throw error;
  }
}
