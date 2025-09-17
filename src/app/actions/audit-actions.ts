"use server";

import { requireAdmin } from "@/app/actions/auth-actions";
import { prisma } from "@/lib/prisma";

/**
 * Log an action to the audit trail
 * Simple function that just records what happened
 */
export async function logAction(
  userId: string,
  action: string,
  details?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        metadata: details ? { details } : {},
      },
    });
  } catch (error) {
    // Don't break the main operation if audit logging fails
    console.error("Failed to log action:", error);
  }
}

/**
 * Get recent audit logs (Admin only)
 * Simple list with basic pagination
 */
export async function getAuditLogs(page: number = 1, limit: number = 50) {
  await requireAdmin();

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            authId: true,
            role: true,
            profile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.auditLog.count(),
  ]);

  return {
    logs,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  };
}