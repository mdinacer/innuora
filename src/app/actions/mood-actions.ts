"use server";

import { revalidatePath } from "next/cache";

import type { EmotionCategory, MoodContext, MoodTrend, MoodValue } from "@/domains/mood-tracking/mood-tracking.types";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "./auth-actions";

export interface CreateMoodEntryData {
  moodValue: MoodValue;
  emotions: EmotionCategory[];
  notes?: string;
  context?: Partial<MoodContext>;
  sessionId?: string;
}

export async function createMoodEntry(data: CreateMoodEntryData) {
  return await logger.wrapOperation(
    async () => {
      const user = await requireCurrentUser();

      // Validate mood value
      if (data.moodValue < 1 || data.moodValue > 10) {
        throw new Error("Mood value must be between 1 and 10");
      }

      // Validate session if provided
      if (data.sessionId) {
        const session = await prisma.session.findFirst({
          where: {
            id: data.sessionId,
            userId: user.id,
          },
        });

        if (!session) {
          throw new Error("Session not found or access denied");
        }
      }

      // Create mood entry
      const moodEntry = await prisma.moodEntry.create({
        data: {
          userId: user.id,
          sessionId: data.sessionId || null,
          moodValue: data.moodValue,
          emotions: data.emotions,
          notes: data.notes || null,
          context: data.context ? (data.context as any) : null,
        },
      });

      // Revalidate relevant pages
      revalidatePath("/insights");
      revalidatePath("/sessions");

      return moodEntry;
    },
    ERROR_CODES.SESSION_CREATE_FAILED, // Reusing existing error code
    {
      operation: "create_mood_entry",
      userId: "pending", // Will be filled by logger
      metadata: {
        moodValue: data.moodValue,
        emotionCount: data.emotions.length,
        hasNotes: !!data.notes,
        hasContext: !!data.context,
        linkedToSession: !!data.sessionId,
      },
    },
    "Mood entry created successfully"
  );
}

export interface GetMoodEntriesOptions {
  limit?: number;
  sortBy?: "recent" | "oldest";
  offset?: number;
}

// Define return type for mood entries with session info
export interface MoodEntryWithSession {
  id: string;
  userId: string;
  sessionId: string | null;
  moodValue: number; // Prisma returns number, but MoodValue is 1-10 constraint
  emotions: EmotionCategory[];
  notes: string | null;
  context: any; // JsonValue from Prisma, flexible for different contexts
  createdAt: Date;
  updatedAt: Date;
  session: {
    id: string;
    title: string;
    createdAt: Date;
  } | null;
}

// Overloaded function signatures
export async function getUserMoodEntries(
  userId: string,
  options?: GetMoodEntriesOptions
): Promise<MoodEntryWithSession[]>;
export async function getUserMoodEntries(limit?: number, offset?: number): Promise<MoodEntryWithSession[]>;

export async function getUserMoodEntries(
  userIdOrLimit?: string | number,
  optionsOrOffset?: GetMoodEntriesOptions | number
): Promise<MoodEntryWithSession[]> {
  return await logger.wrapOperation(
    async () => {
      let targetUserId: string;
      let queryLimit = 30;
      let queryOffset = 0;
      let sortOrder: "desc" | "asc" = "desc";

      // Handle different calling patterns
      if (typeof userIdOrLimit === "string") {
        // Called with userId and options: getUserMoodEntries(userId, { limit: 10, sortBy: "recent" })
        targetUserId = userIdOrLimit;
        const options = optionsOrOffset as GetMoodEntriesOptions;
        queryLimit = options?.limit || 30;
        queryOffset = options?.offset || 0;
        sortOrder = options?.sortBy === "oldest" ? "asc" : "desc";
      } else {
        // Called with limit and offset: getUserMoodEntries(30, 0)
        const user = await requireCurrentUser();
        targetUserId = user.id;
        queryLimit = (userIdOrLimit as number) || 30;
        queryOffset = (optionsOrOffset as number) || 0;
      }

      const moodEntries = await prisma.moodEntry.findMany({
        where: {
          userId: targetUserId,
        },
        orderBy: {
          createdAt: sortOrder,
        },
        take: queryLimit,
        skip: queryOffset,
        include: {
          session: {
            select: {
              id: true,
              title: true,
              createdAt: true,
            },
          },
        },
      });

      return moodEntries as MoodEntryWithSession[];
    },
    ERROR_CODES.SESSION_NOT_FOUND, // Reusing existing error code
    {
      operation: "get_user_mood_entries",
      userId: "pending",
      metadata: {
        userIdOrLimit: typeof userIdOrLimit,
        queryLimit:
          typeof userIdOrLimit === "string" ? (optionsOrOffset as GetMoodEntriesOptions)?.limit : userIdOrLimit,
      },
    },
    "Retrieved mood entries successfully"
  );
}

export async function getMoodTrends(period: "week" | "month" | "3months" = "month") {
  return await logger.wrapOperation(
    async () => {
      const user = await requireCurrentUser();

      // Calculate date range
      const now = new Date();
      const startDate = new Date();

      switch (period) {
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          startDate.setMonth(now.getMonth() - 3);
          break;
      }

      // Get mood entries for the period
      const moodEntries = await prisma.moodEntry.findMany({
        where: {
          userId: user.id,
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (moodEntries.length === 0) {
        return {
          period,
          averageMood: 0,
          moodVariability: 0,
          mostCommonEmotions: [],
          improvement: 0,
          insights: ["Start tracking your mood to see trends and patterns."],
        };
      }

      // Calculate average mood
      const averageMood = moodEntries.reduce((sum, entry) => sum + entry.moodValue, 0) / moodEntries.length;

      // Calculate mood variability (standard deviation)
      const variance =
        moodEntries.reduce((sum, entry) => sum + Math.pow(entry.moodValue - averageMood, 2), 0) / moodEntries.length;
      const moodVariability = Math.sqrt(variance);

      // Find most common emotions
      const emotionCounts: Record<string, number> = {};
      moodEntries.forEach((entry) => {
        entry.emotions.forEach((emotion) => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      });

      const mostCommonEmotions = Object.entries(emotionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([emotion]) => emotion as EmotionCategory);

      // Calculate improvement (compare first half to second half)
      const midPoint = Math.floor(moodEntries.length / 2);
      const firstHalf = moodEntries.slice(midPoint);
      const secondHalf = moodEntries.slice(0, midPoint);

      const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.moodValue, 0) / firstHalf.length;
      const secondHalfAvg =
        secondHalf.length > 0
          ? secondHalf.reduce((sum, entry) => sum + entry.moodValue, 0) / secondHalf.length
          : firstHalfAvg;

      const improvement =
        firstHalf.length > 0 && secondHalf.length > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;

      // Generate insights
      const insights: string[] = [];

      if (averageMood >= 7) {
        insights.push("You've been feeling quite positive overall! Keep up the great work.");
      } else if (averageMood >= 5) {
        insights.push("Your mood has been fairly balanced. Consider what helps you feel your best.");
      } else {
        insights.push(
          "It looks like you've been having a tough time. Remember that seeking support is a sign of strength."
        );
      }

      if (improvement > 10) {
        insights.push("Your mood has been improving significantly - that's wonderful progress!");
      } else if (improvement < -10) {
        insights.push("Your mood has been declining lately. Consider what changes might help support your wellbeing.");
      }

      if (moodVariability > 2) {
        insights.push(
          "Your mood has been quite variable. Tracking patterns might help identify triggers and helpful strategies."
        );
      }

      const trend: MoodTrend = {
        period,
        averageMood: Math.round(averageMood * 10) / 10,
        moodVariability: Math.round(moodVariability * 10) / 10,
        mostCommonEmotions,
        improvement: Math.round(improvement * 10) / 10,
        insights,
      };

      return trend;
    },
    ERROR_CODES.SESSION_NOT_FOUND,
    {
      operation: "get_mood_trends",
      userId: "pending",
      metadata: { period },
    },
    `Retrieved ${period} mood trends successfully`
  );
}

export async function deleteMoodEntry(entryId: string) {
  return await logger.wrapOperation(
    async () => {
      const user = await requireCurrentUser();

      // Verify ownership
      const moodEntry = await prisma.moodEntry.findFirst({
        where: {
          id: entryId,
          userId: user.id,
        },
      });

      if (!moodEntry) {
        throw new Error("Mood entry not found or access denied");
      }

      // Delete the entry
      await prisma.moodEntry.delete({
        where: {
          id: entryId,
        },
      });

      // Revalidate relevant pages
      revalidatePath("/insights");

      return { success: true };
    },
    ERROR_CODES.SESSION_DELETE_FAILED,
    {
      operation: "delete_mood_entry",
      userId: "pending",
      metadata: { entryId },
    },
    "Mood entry deleted successfully"
  );
}

export async function getMoodStats() {
  return await logger.wrapOperation(
    async () => {
      const user = await requireCurrentUser();

      const [totalEntries, recentEntries, averageMoodLast7Days] = await Promise.all([
        // Total mood entries count
        prisma.moodEntry.count({
          where: { userId: user.id },
        }),

        // Recent entries for streak calculation
        prisma.moodEntry.findMany({
          where: {
            userId: user.id,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
          orderBy: { createdAt: "desc" },
          select: {
            createdAt: true,
            moodValue: true,
          },
        }),

        // Average mood for last 7 days
        prisma.moodEntry.aggregate({
          where: {
            userId: user.id,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
          _avg: {
            moodValue: true,
          },
        }),
      ]);

      // Calculate current streak (consecutive days with entries)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentStreak = 0;
      const checkDate = new Date(today);

      while (checkDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        // Check up to 30 days back
        const dayStart = new Date(checkDate);
        const dayEnd = new Date(checkDate);
        dayEnd.setHours(23, 59, 59, 999);

        const hasEntryOnDay = recentEntries.some((entry) => entry.createdAt >= dayStart && entry.createdAt <= dayEnd);

        if (hasEntryOnDay) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return {
        totalEntries,
        currentStreak,
        entriesLast7Days: recentEntries.length,
        averageMoodLast7Days: averageMoodLast7Days._avg.moodValue || 0,
        lastEntryDate: recentEntries[0]?.createdAt || null,
      };
    },
    ERROR_CODES.SESSION_NOT_FOUND,
    {
      operation: "get_mood_stats",
      userId: "pending",
    },
    "Retrieved mood statistics successfully"
  );
}
