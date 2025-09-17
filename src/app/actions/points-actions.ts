"use server";

import { requireAdmin, requireCurrentUser } from "@/app/actions/auth-actions";
import { logAction } from "@/app/actions/audit-actions";
import { prisma } from "@/lib/prisma";

/**
 * Add points to user account
 * Simple credit operation
 */
export async function addPoints(userId: string, amount: number, reason: string) {
  const currentUser = await requireCurrentUser();
  
  // Only allow users to add to their own account, or admin to add to any
  if (currentUser.id !== userId && currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Update user balance and create transaction record
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        pointsBalance: {
          increment: amount,
        },
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId,
        type: "credit",
        amount,
        reason,
      },
    }),
  ]);

  // Log the action
  await logAction(userId, "points_added", `Added ${amount} points: ${reason}`);

  return updatedUser;
}

/**
 * Spend points from user account
 * Simple debit operation with balance check
 */
export async function spendPoints(userId: string, amount: number, reason: string) {
  const currentUser = await requireCurrentUser();
  
  // Only allow users to spend from their own account
  if (currentUser.id !== userId && currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Check current balance first
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pointsBalance: true },
  });

  if (!user || user.pointsBalance < amount) {
    throw new Error("Insufficient points");
  }

  // Update balance and create transaction record
  const [updatedUser] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        pointsBalance: {
          decrement: amount,
        },
        pointsConsumed: {
          increment: amount,
        },
      },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId,
        type: "debit",
        amount: -amount, // Negative for debits
        reason,
      },
    }),
  ]);

  // Log the action
  await logAction(userId, "points_spent", `Spent ${amount} points: ${reason}`);

  return updatedUser;
}

/**
 * Get user's points balance
 */
export async function getUserPoints(userId: string) {
  const currentUser = await requireCurrentUser();
  
  // Users can only see their own balance, admin can see any
  if (currentUser.id !== userId && currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      pointsBalance: true,
      pointsConsumed: true,
    },
  });
}

/**
 * Get user's points transaction history
 */
export async function getUserTransactions(userId: string, page: number = 1, limit: number = 20) {
  const currentUser = await requireCurrentUser();
  
  // Users can only see their own transactions, admin can see any
  if (currentUser.id !== userId && currentUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.pointsTransaction.count({ where: { userId } }),
  ]);

  return {
    transactions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  };
}

/**
 * Admin: Adjust user points manually
 */
export async function adminAdjustPoints(userId: string, amount: number, reason: string) {
  await requireAdmin();

  const operation = amount > 0 ? "credit" : "debit";
  const adjustmentAmount = Math.abs(amount);

  if (amount > 0) {
    return await addPoints(userId, adjustmentAmount, `Admin adjustment: ${reason}`);
  } else {
    return await spendPoints(userId, adjustmentAmount, `Admin adjustment: ${reason}`);
  }
}

/**
 * Admin: Get all transactions for overview
 */
export async function getAllTransactions(page: number = 1, limit: number = 50) {
  await requireAdmin();

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    prisma.pointsTransaction.findMany({
      include: {
        user: {
          select: {
            authId: true,
            profile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.pointsTransaction.count(),
  ]);

  return {
    transactions,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    total,
  };
}