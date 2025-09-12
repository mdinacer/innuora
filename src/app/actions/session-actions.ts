"use server";

import { Prisma, Session } from "@prisma/client";

import { requireAdmin, requireCurrentUser } from "@/app/actions/auth-actions";
import { EncryptedDataPayload, payloadToEncryptionResult } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { prisma } from "@/lib/prisma";

export async function listSessions() {
  await requireAdmin();
  return await prisma.session.findMany();
}
export async function listSessionsByUser() {
  const authUser = await requireCurrentUser();

  return await prisma.session.findMany({
    where: { user: { authId: authUser.id } },
  });
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const authUser = await requireCurrentUser();

  return await prisma.session.findUnique({
    where: { id: sessionId, user: { authId: authUser.id } },
  });
}

export async function createSession(sessionCreateInput: EncryptedDataPayload) {
  const authUser = await requireCurrentUser();

  const sessionInput: Prisma.SessionCreateWithoutUserInput = payloadToEncryptionResult(sessionCreateInput);

  return await prisma.session.create({
    data: {
      ...sessionInput,
      user: {
        connect: { authId: authUser.id },
      },
    },
  });
}

export async function updateSession(sessionId: string, data: EncryptedDataPayload) {
  const authUser = await requireCurrentUser();

  return await prisma.session.update({
    where: { id: sessionId, user: { authId: authUser.id } },
    data: payloadToEncryptionResult(data),
  });
}

export async function deleteSession(sessionId: string) {
  const authUser = await requireCurrentUser();

  return await prisma.session.delete({
    where: { id: sessionId, user: { authId: authUser.id } },
  });
}
