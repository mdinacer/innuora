/**
 * Business Intelligence Dashboard
 *
 * Simple dashboard for viewing business metrics and user analytics
 * Only for admin users to track business performance.
 */

"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsSummary {
  totalUsers: number;
  totalSessions: number;
  totalRevenue: number;
  averageCreditsPerUser: number;
  conversionRate: number;
  popularPackage: string;
  activeUsers24h: number;
  errorsToday: number;
}

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from an analytics API
    // For now, we'll simulate the data structure
    const fetchAnalytics = async () => {
      try {
        // TODO: Replace with actual API call to fetch analytics from audit logs
        // const response = await fetch('/api/analytics/summary');
        // const data = await response.json();

        // Simulated data for UI development
        const simulatedData: AnalyticsSummary = {
          totalUsers: 1247,
          totalSessions: 8924,
          totalRevenue: 15620.50,
          averageCreditsPerUser: 850,
          conversionRate: 12.4,
          popularPackage: 'regular',
          activeUsers24h: 89,
          errorsToday: 3,
        };

        setMetrics(simulatedData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Failed to load analytics data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Business Intelligence Dashboard</h2>
        <Badge variant="outline">Live Data</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
          </CardContent>
        </Card>

        {/* User Metrics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        {/* Session Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Therapy conversations</p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.activeUsers24h}</div>
            <p className="text-xs text-gray-500 mt-1">Recent activity</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.conversionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Signups to purchases</p>
          </CardContent>
        </Card>

        {/* Average Credits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Credits/User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageCreditsPerUser}</div>
            <p className="text-xs text-gray-500 mt-1">Usage patterns</p>
          </CardContent>
        </Card>

        {/* Popular Package */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Popular Package</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.popularPackage}</div>
            <p className="text-xs text-gray-500 mt-1">Most purchased</p>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Errors Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics.errorsToday === 0 ? 'text-green-600' :
              metrics.errorsToday < 5 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.errorsToday}
            </div>
            <p className="text-xs text-gray-500 mt-1">System reliability</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Business Performance</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Revenue growing with {metrics.conversionRate}% conversion rate</li>
                <li>• {metrics.popularPackage.charAt(0).toUpperCase() + metrics.popularPackage.slice(1)} package is most popular</li>
                <li>• Average user consumes {metrics.averageCreditsPerUser} credits</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">User Engagement</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• {metrics.activeUsers24h} active users in last 24 hours</li>
                <li>• {metrics.totalSessions.toLocaleString()} total therapeutic sessions</li>
                <li>• System reliability: {metrics.errorsToday === 0 ? 'Excellent' :
                     metrics.errorsToday < 5 ? 'Good' : 'Needs attention'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Note */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>
              <strong>Implementation Note:</strong> This dashboard shows simulated data.
              In production, connect to analytics API endpoint to display real metrics from audit logs.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}