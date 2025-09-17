"use server";

import { Prisma } from "@prisma/client";
import { nanoid } from "nanoid";

import { requireAdmin, requireCurrentUser } from "@/app/actions/auth-actions";
import { SessionMetadataSchema, SessionOverview } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES, errorManager } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { SessionCreate } from "@/lib/zod/session-create.schema";
import { logAction } from "./audit-actions";

export async function listSessions() {
  await requireAdmin();
  return await prisma.session.findMany();
}
export async function listSessionsByUser(): Promise<SessionOverview[]> {
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
    return {
      id: session.id,
      title: session.title,
      subtitle: session.subtitle,
      autoUpdateTitle: session.autoUpdateTitle,
      persistOnCloud: session.persistOnCloud,
      metadata: session.metadata
        ? SessionMetadataSchema.parse(session.metadata)
        : { messageCount: 0, tokenCount: 0, costUSD: 0, tokenUsage: [] },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    } as SessionOverview;
  });
}

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

export async function getSessionById(sessionId: string) {
  const authUser = await requireCurrentUser();

  const session = await prisma.session.findUnique({
    where: { id: sessionId, user: { authId: authUser.id } },
  });

  if (!session) return null;

  // Convert Uint8Arrays to plain arrays for serialization
  return session;
}

export async function batchGetSessionsById(sessionIds: string[]) {
  const authUser = await requireCurrentUser();
  const sessions = await prisma.session.findMany({
    where: { id: { in: sessionIds }, user: { authId: authUser.id } },
  });

  // Convert Uint8Arrays to plain arrays for serialization
  return sessions;
}

export async function createSession(sessionCreateInput: SessionCreate) {
  const authUser = await requireCurrentUser();

  const session = await errorManager.wrapOperation(
    () =>
      prisma.session.create({
        data: {
          title: sessionCreateInput.title || `New Session ${nanoid(6)}`,
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
      operation: "createSession",
      metadata: { title: sessionCreateInput.title },
    }
  );

  // Log session creation
  await logAction(authUser.id, "session_created", `Created session: ${session.title}`);

  return session;
}
export async function pushSession(sessionCreateInput: Prisma.SessionCreateWithoutUserInput) {
  const authUser = await requireCurrentUser();

  const session = await errorManager.wrapOperation(
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
      operation: "createSession",
      metadata: { data: sessionCreateInput },
    }
  );

  // Log session creation
  await logAction(authUser.id, "session_created", `Created session: ${session.title}`);

  return session;
}

export async function updateSessionEncryptedData(sessionId: string, data: EncryptedBlob) {
  const authUser = await requireCurrentUser();

  return await errorManager.wrapOperation(
    () =>
      prisma.session.update({
        where: { id: sessionId, user: { authId: authUser.id } },
        data: { encryptedData: data },
      }),
    ERROR_CODES.SESSION_UPDATE_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "updateSessionEncryptedData",
    }
  );
}
export async function updateSession(sessionId: string, data: Prisma.SessionUpdateWithoutUserInput) {
  const authUser = await requireCurrentUser();

  return await errorManager.wrapOperation(
    () =>
      prisma.session.update({
        where: { id: sessionId, user: { authId: authUser.id } },
        data,
      }),
    ERROR_CODES.SESSION_UPDATE_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "updateSession",
    }
  );
}

export async function updateSessionMetadata(
  sessionId: string,
  metadata: { messageCount?: number; tokenCount?: number; costUSD?: number; tokenUsage?: any[] }
) {
  const authUser = await requireCurrentUser();

  return await errorManager.wrapOperation(
    () =>
      prisma.session.update({
        where: { id: sessionId, user: { authId: authUser.id } },
        data: { metadata },
      }),
    ERROR_CODES.SESSION_UPDATE_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "updateSessionMetadata",
      metadata: { messageCount: metadata.messageCount, tokenCount: metadata.tokenCount },
    }
  );
}

export async function updateSessionTitle(sessionId: string, title: string, subtitle?: string) {
  const authUser = await requireCurrentUser();

  return await errorManager.wrapOperation(
    () =>
      prisma.session.update({
        where: { id: sessionId, user: { authId: authUser.id } },
        data: {
          title,
          ...(subtitle !== undefined && { subtitle }),
        },
      }),
    ERROR_CODES.SESSION_UPDATE_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "updateSessionTitle",
      metadata: { title, subtitle },
    }
  );
}

export async function deleteSession(sessionId: string) {
  const authUser = await requireCurrentUser();

  // Get session title before deleting
  const session = await prisma.session.findFirst({
    where: { id: sessionId, user: { authId: authUser.id } },
    select: { title: true },
  });

  const deletedSession = await errorManager.wrapOperation(
    () =>
      prisma.session.delete({
        where: { id: sessionId, user: { authId: authUser.id } },
      }),
    ERROR_CODES.SESSION_DELETE_FAILED,
    {
      userId: authUser.id,
      sessionId,
      operation: "deleteSession",
    }
  );

  // Log session deletion
  await logAction(authUser.id, "session_deleted", `Deleted session: ${session?.title || sessionId}`);

  return deletedSession;
}
