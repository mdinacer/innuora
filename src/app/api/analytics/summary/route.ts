/**
 * Analytics Summary API
 *
 * Provides business intelligence data for admin dashboard.
 * Only accessible by admin users.
 */

import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logging/unified-logger';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const user = await getCurrentUser();
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    // Query analytics data from audit logs and database
    const [
      totalUsers,
      totalSessions,
      recentActivity,
      revenueData,
      errorCount,
    ] = await Promise.all([
      // Total registered users
      prisma.user.count(),

      // Total sessions created
      prisma.session.count(),

      // Active users in last 24 hours (from audit logs)
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          operation: {
            contains: 'session',
          },
        },
      }),

      // Revenue metrics from credit transactions
      prisma.creditTransaction.aggregate({
        where: {
          type: 'CREDIT',
          reason: {
            contains: 'purchase',
          },
        },
        _sum: {
          amount: true,
        },
        _count: true,
      }),

      // Error count today
      prisma.auditLog.count({
        where: {
          level: 'ERROR',
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Calculate derived metrics
    const averageCreditsPerUser = totalUsers > 0 ? Math.round((revenueData._sum.amount || 0) / totalUsers) : 0;
    const totalRevenue = ((revenueData._sum.amount || 0) * 0.01); // Convert credits to USD
    const conversionRate = totalUsers > 0 ? Math.round((revenueData._count / totalUsers) * 100 * 10) / 10 : 0;

    // Get most popular package (simplified - would need more complex query for real data)
    const popularPackage = 'regular'; // This would be determined by analyzing purchase patterns

    const summary = {
      totalUsers,
      totalSessions,
      totalRevenue,
      averageCreditsPerUser,
      conversionRate,
      popularPackage,
      activeUsers24h: Math.min(recentActivity, totalUsers), // Can't be more than total users
      errorsToday: errorCount,
      lastUpdated: new Date().toISOString(),
    };

    await logger.logSuccess('Analytics summary accessed', {
      operation: 'analytics_summary',
      metadata: {
        requestedBy: 'admin', // Replace with actual user ID
        metrics: Object.keys(summary),
      },
    });

    return NextResponse.json(summary);

  } catch (error) {
    console.error('Analytics API Error:', error);

    await logger.logWarning('Failed to fetch analytics summary', {
      operation: 'analytics_summary',
      metadata: {
        endpoint: '/api/analytics/summary',
        error: (error as Error).message,
      },
    });

    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

// Export route configuration
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';