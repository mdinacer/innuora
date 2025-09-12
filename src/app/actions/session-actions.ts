"use server";

import { Session } from "@prisma/client";
import { nanoid } from "nanoid";

import { requireAdmin, requireCurrentUser } from "@/app/actions/auth-actions";
import { SessionMetadataSchema, SessionOverview } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { prisma } from "@/lib/prisma";
import { SessionCreate } from "@/lib/zod/session-create.schema";

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
      metadata: session.metadata
        ? SessionMetadataSchema.parse(session.metadata)
        : { messageCount: 0, tokenCount: 0, costUSD: 0, tokenUsage: [] },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    } as SessionOverview;
  });
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const authUser = await requireCurrentUser();

  return await prisma.session.findUnique({
    where: { id: sessionId, user: { authId: authUser.id } },
  });
}

export async function createSession(sessionCreateInput: SessionCreate) {
  const authUser = await requireCurrentUser();

  return await prisma.session.create({
    data: {
      title: sessionCreateInput.title || `New Session ${nanoid(6)}`,
      subtitle: sessionCreateInput.subtitle || null,
      autoUpdateTitle: sessionCreateInput.autoUpdateTitle || false,
      metadata: {
        messageCount: 0,
        tokenCount: 0,
        costUSD: 0,
      },
      user: {
        connect: { authId: authUser.id },
      },
    },
  });
}

// export async function updateSession(sessionId: string, data: EncryptedDataPayload) {
//   const authUser = await requireCurrentUser();

//   return await prisma.session.update({
//     where: { id: sessionId, user: { authId: authUser.id } },
//     data: payloadToEncryptionResult(data),
//   });
// }

export async function deleteSession(sessionId: string) {
  const authUser = await requireCurrentUser();

  return await prisma.session.delete({
    where: { id: sessionId, user: { authId: authUser.id } },
  });
}
