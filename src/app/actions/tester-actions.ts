"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/app/actions/auth-actions";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
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
  const admin = await requireAdmin();
  
  const tester = await logger.wrapOperation(
    () => prisma.tester.create({ data }),
    ERROR_CODES.TESTER_CREATE_FAILED,
    {
      userId: admin.id,
      operation: "admin_create_tester",
      metadata: {
        testerEmail: data.email,
        adminRole: admin.role,
        action: "create_tester"
      }
    },
    `Admin created tester: ${data.email}`
  );

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return tester;
}

export async function updateTester(id: string, data: Prisma.TesterUpdateInput) {
  const admin = await requireAdmin();
  
  return await logger.wrapOperation(
    async () => {
      // Get current tester info for audit
      const currentTester = await prisma.tester.findUnique({
        where: { id },
        select: { email: true, status: true }
      });
      
      if (!currentTester) {
        throw new Error(`Tester not found: ${id}`);
      }
      
      return await prisma.tester.update({ where: { id }, data });
    },
    ERROR_CODES.TESTER_UPDATE_FAILED,
    {
      userId: admin.id,
      operation: "admin_update_tester",
      metadata: {
        testerId: id,
        updateFields: Object.keys(data),
        adminRole: admin.role,
        action: "update_tester"
      }
    },
    "Admin updated tester"
  );
}

export async function acceptUser(id: string) {
  const admin = await requireAdmin();
  
  return await logger.wrapOperation(
    async () => {
      const tester = await prisma.tester.findUnique({
        where: { id },
        select: { email: true, accepted: true }
      });
      
      if (!tester) {
        throw new Error(`Tester not found: ${id}`);
      }
      
      return await prisma.tester.update({ where: { id }, data: { accepted: true } });
    },
    ERROR_CODES.TESTER_UPDATE_FAILED,
    {
      userId: admin.id,
      operation: "admin_accept_tester",
      metadata: {
        testerId: id,
        adminRole: admin.role,
        action: "accept_tester"
      }
    },
    "Admin accepted tester application"
  );
}

export async function deleteTester(id: string) {
  const admin = await requireAdmin();
  
  return await logger.wrapOperation(
    async () => {
      // Get tester info before deletion for audit
      const tester = await prisma.tester.findUnique({
        where: { id },
        select: { id: true, email: true, status: true, accepted: true }
      });
      
      if (!tester) {
        throw new Error(`Tester not found: ${id}`);
      }
      
      await prisma.tester.delete({ where: { id } });
      return tester;
    },
    ERROR_CODES.TESTER_DELETE_FAILED,
    {
      userId: admin.id,
      operation: "admin_delete_tester",
      metadata: {
        testerId: id,
        adminRole: admin.role,
        action: "delete_tester"
      }
    },
    "Admin deleted tester account"
  );
}

export async function deleteAllTesters() {
  const admin = await requireAdmin();
  
  return await logger.wrapOperation(
    async () => {
      // Get count for audit
      const count = await prisma.tester.count();
      
      if (count === 0) {
        return { count: 0 };
      }
      
      const result = await prisma.tester.deleteMany();
      return { count: result.count };
    },
    ERROR_CODES.TESTER_DELETE_FAILED,
    {
      userId: admin.id,
      operation: "admin_delete_all_testers",
      metadata: {
        adminRole: admin.role,
        action: "bulk_delete_testers"
      }
    },
    "Admin deleted all tester accounts"
  );
}
