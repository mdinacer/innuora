"use server";

import { Prisma, Session } from "@prisma/client";
import { nanoid } from "nanoid";

import { requireCurrentUser } from "@/app/actions/auth-actions";
import { SessionMetadataSchema, SessionOverview } from "@/domains/open-chat/open-chat.types";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { SessionCreate } from "@/lib/zod/session-create.schema";

function mapSessionMetadata<T extends Partial<Session>>(session: T) {
  if (!session.metadata) return session;
  return {
    ...session,
    metadata: session.metadata
      ? SessionMetadataSchema.parse(session.metadata)
      : { messageCount: 0, tokenCount: 0, costUSD: 0, tokenUsage: [] },
  } as Session;
}
export async function getUserSessionOverviews(): Promise<SessionOverview[]> {
  const authUser = await requireCurrentUser();

  const data = await prisma.session.findMany({
    where: { user: { authId: authUser.id } },
    select: {
      id: true,
      title: true,
      subtitle: true,
      autoUpdateTitle: true,
      persistOnCloud: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return data.map((session) => {
    const mappedSession = mapSessionMetadata(session);
    return {
      id: mappedSession.id,
      title: mappedSession.title,
      subtitle: mappedSession.subtitle,
      autoUpdateTitle: mappedSession.autoUpdateTitle,
      persistOnCloud: mappedSession.persistOnCloud,
      metadata: mappedSession.metadata,
      createdAt: mappedSession.createdAt,
      updatedAt: mappedSession.updatedAt,
    } as SessionOverview;
  });
}

export async function getUserSessions(): Promise<Session[]> {
  const authUser = await requireCurrentUser();
  const data = await prisma.session.findMany({ where: { user: { authId: authUser.id } } });
  return data.map(mapSessionMetadata);
}

export async function getUserSession(sessionId: string): Promise<Session | null> {
  const authUser = await requireCurrentUser();
  const session = await prisma.session.findFirst({ where: { id: sessionId, user: { authId: authUser.id } } });
  return session ? mapSessionMetadata(session) : null;
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
            tokenCount: 0,
            costUSD: 0,
          },
          user: {
            connect: { authId: authUser.id },
          },
        },
      }),
    ERROR_CODES.SESSION_CREATE_FAILED,
    {
      userId: authUser.id,
      operation: "encrypted_session_create",
      metadata: { 
        title: sessionTitle,
        autoUpdateTitle: sessionCreateInput.autoUpdateTitle,
        persistOnCloud: sessionCreateInput.persistOnCloud
      },
    },
    `Encrypted session created: ${sessionTitle}`
  );
}

export async function addSession(sessionCreateInput: Prisma.SessionCreateWithoutUserInput) {
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
      operation: "encrypted_session_add",
      metadata: { 
        title: sessionCreateInput.title,
        hasEncryptedData: !!sessionCreateInput.encryptedData
      },
    },
    `Encrypted session added: ${sessionCreateInput.title}`
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
      operation: "encrypted_session_update",
      metadata: {
        fieldsUpdated: Object.keys(data),
        hasEncryptedData: 'encryptedData' in data
      }
    },
    "Encrypted session updated"
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
        throw new Error(`Encrypted session not found: ${sessionId}`);
      }

      const deletedSession = await prisma.session.delete({
        where: { id: sessionId, user: { authId: authUser.id } },
      });

      return { ...deletedSession, title: session.title };
    },
    ERROR_CODES.SESSION_DELETE_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "encrypted_session_delete",
      metadata: {
        action: "delete_encrypted_session"
      }
    },
    "Encrypted session deleted"
  );
}

export async function getSessionsLastUpdate(): Promise<{ id: string; updatedAt: Date }[]> {
  const authUser = await requireCurrentUser();

  return await prisma.session.findMany({
    where: { user: { authId: authUser.id } },
    select: {
      id: true,
      updatedAt: true,
    },
  });
}
export async function getSessionLastUpdate(sessionId: string): Promise<{ id: string; updatedAt: Date } | null> {
  const authUser = await requireCurrentUser();

  return await logger.wrapOperation(
    () =>
      prisma.session.findUnique({
        where: { id: sessionId, user: { authId: authUser.id } },
        select: {
          id: true,
          updatedAt: true,
        },
      }),
    ERROR_CODES.SESSION_READ_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "encrypted_session_get_last_update",
    }
  );
}
