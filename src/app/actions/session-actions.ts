"use server";

import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

import { requireCurrentUser } from "@/app/actions/auth-actions";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { SessionCreate } from "@/lib/zod/session-create.schema";

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
