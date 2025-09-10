"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/app/actions/auth-actions";
import { prisma } from "@/lib/prisma";

export async function listTesters() {
  await requireAdmin();
  return await prisma.tester.findMany();
}

export async function findTesterByEmail(email: string) {
  await requireAdmin();
  return await prisma.tester.findUnique({ where: { email } });
}

export async function createTester(data: Prisma.TesterCreateInput, redirectUrl: string) {
  await requireAdmin();
  const tester = await prisma.tester.create({ data });

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return tester;
}

export async function updateTester(id: string, data: Prisma.TesterUpdateInput) {
  await requireAdmin();
  return await prisma.tester.update({ where: { id }, data });
}

export async function acceptUser(id: string) {
  await requireAdmin();
  return await prisma.tester.update({ where: { id }, data: { accepted: true } });
}

export async function deleteTester(id: string) {
  await requireAdmin();
  return await prisma.tester.delete({ where: { id } });
}

export async function deleteAllTesters() {
  await requireAdmin();
  return await prisma.tester.deleteMany();
}
