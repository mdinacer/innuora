"use server";

import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types/action-result";
import { requireCurrentUser } from "./auth-actions";

/**
 * GDPR-compliant data export (Article 20 - Right to Data Portability)
 * Exports all user personal data in machine-readable JSON format
 */
export async function exportUserData(): Promise<
  ActionResult<{
    filename: string;
    data: string;
    size: number;
    format: string;
  }>
> {
  const authUser = await requireCurrentUser();

  return await logger.wrapOperation(
    async () => {
      // Get all user data with relationships
      const user = await prisma.user.findUnique({
        where: { authId: authUser.id },
        include: {
          profile: true,
          config: true,
          sessions: {
            select: {
              id: true,
              title: true,
              subtitle: true,
              autoUpdateTitle: true,
              persistOnCloud: true,
              metadata: true,
              // Note: encryptedData excluded as user has the decryption key
              createdAt: true,
              updatedAt: true,
            },
          },
          creditTransactions: {
            orderBy: { createdAt: "desc" },
          },
          subscriptions: {
            include: {
              renewals: true,
            },
          },
        },
      });

      if (!user) {
        logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error(`User not found for export: ${authUser.id}`), {
          operation: "export_user_data",
          userId: authUser.id,
        });
        throw new Error("Unreachable");
      }

      // Get recent audit logs (last 1000 entries for transparency)
      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: authUser.id },
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      // Create GDPR-compliant export package
      const exportData = {
        exportMetadata: {
          exportDate: new Date().toISOString(),
          format: "JSON",
          version: "1.0",
          dataController: {
            name: "Innuora",
            contact: "privacy@innuora.com",
          },
          legalBasis: "GDPR Article 20 - Right to Data Portability",
        },

        personalInformation: {
          userId: user.id,
          authId: user.authId,
          email: authUser.email,
          role: user.role,
          accountStatus: user.status,
          onboardingCompleted: user.isOnboarded,
          accountCreatedAt: user.createdAt,
          lastUpdated: user.updatedAt,
        },

        profile: user.profile
          ? {
              displayName: user.profile.displayName,
              ageGroup: user.profile.ageGroup,
              identityConnection: user.profile.identityConnection,
              copingMechanism: user.profile.copingMechanism,
              socialPressureSources: user.profile.socialPressureSources,
              emotionalConcerns: user.profile.emotionalConcerns,
              emotionalAspirations: user.profile.emotionalAspirations,
            }
          : null,

        preferences: user.config
          ? {
              theme: user.config.theme,
              fontSize: user.config.fontSize,
              analyticsOptIn: user.config.analyticsOptIn,
              shareImprovements: user.config.shareImprovements,
              marketingEmails: user.config.marketingEmails,
            }
          : null,

        sessions: {
          totalCount: user.sessions.length,
          sessions: user.sessions.map((session) => ({
            id: session.id,
            title: session.title,
            subtitle: session.subtitle,

            cloudBackupEnabled: session.persistOnCloud,
            autoUpdateTitle: session.autoUpdateTitle,
            metadata: session.metadata,
            createdAt: session.createdAt,
            lastUpdated: session.updatedAt,
            note: "Encrypted conversation data is accessible via your decryption key in the app",
          })),
        },

        financialData: {
          creditsBalance: user.creditsBalance,
          totalTransactions: user.creditTransactions.length,
          transactions: user.creditTransactions.map((tx) => ({
            id: tx.id,
            type: tx.type,
            amount: tx.amount,
            reason: tx.reason,
            sessionId: tx.sessionId,
            metadata: tx.metadata,
            date: tx.createdAt,
          })),
          subscriptions: user.subscriptions.map((sub) => ({
            id: sub.id,
            planId: sub.planId,
            status: sub.status,
            creditsPerPeriod: sub.creditsPerPeriod,
            priceAmount: `${sub.priceAmountCents / 100} ${sub.currency.toUpperCase()}`,
            currentPeriodStart: sub.currentPeriodStart,
            currentPeriodEnd: sub.currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
            canceledAt: sub.canceledAt,
            renewals: sub.renewals.map((r) => ({
              id: r.id,
              status: r.status,
              periodStart: r.periodStart,
              periodEnd: r.periodEnd,
              creditsGranted: r.creditsGranted,
              amountPaid: `${r.amountPaidCents / 100} USD`,
              processedAt: r.processedAt,
            })),
          })),
        },

        activityLog: {
          totalEntries: auditLogs.length,
          note: "Showing last 1000 entries for privacy and file size considerations",
          entries: auditLogs.map((log) => ({
            id: log.id,
            operation: log.operation,
            level: log.level,
            message: log.message,
            errorCode: log.errorCode,
            sessionId: log.sessionId,
            timestamp: log.createdAt,
          })),
        },

        dataProtectionRights: {
          rightToAccess: "✓ You are exercising this right now",
          rightToRectification: "Update your data in Profile Settings",
          rightToErasure: "Delete account in Settings > Privacy > Danger Zone",
          rightToRestriction: "Pause processing by disabling cloud sync per session",
          rightToPortability: "✓ This export provides your data in JSON format",
          rightToObject: "Contact privacy@innuora.com to object to processing",
          rightToWithdrawConsent: "Manage consent in Privacy Settings",
        },

        thirdPartyProcessors: [
          {
            name: "Supabase",
            purpose: "Authentication and database hosting",
            dataShared: "Email, encrypted session data",
            location: "United States",
          },
          {
            name: "OpenAI",
            purpose: "AI conversation processing",
            dataShared: "Conversation content (not stored by OpenAI)",
            location: "United States",
          },
          {
            name: "Stripe",
            purpose: "Payment processing",
            dataShared: "Payment information",
            location: "United States",
          },
        ],
      };

      // Convert to downloadable JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = Buffer.from(jsonData).toString("base64");

      return {
        filename: `innuora-data-export-${user.id}-${Date.now()}.json`,
        data: blob,
        size: Buffer.byteLength(jsonData),
        format: "application/json",
      };
    },
    ERROR_CODES.SERVER_ERROR,
    {
      operation: "export_user_data",
      userId: authUser.id,
      metadata: {
        action: "gdpr_data_export",
      },
    },
    "User data export completed successfully"
  );
}
