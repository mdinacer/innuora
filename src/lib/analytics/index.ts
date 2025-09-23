/**
 * Analytics & Business Intelligence Module
 *
 * Centralized exports for analytics, performance monitoring, and business intelligence
 */

export { analytics } from './analytics';
export type { AnalyticsEvent, AnalyticsProperties } from './analytics';
export {
  trackUserAction,
  trackConversion,
  trackError,
  trackSession,
} from './analytics';

export { useAnalytics, withAnalytics } from './use-analytics';

export {
  performanceMonitor,
  startTimer,
  endTimer,
  recordError,
  measureAsync,
  measure,
} from './performance-monitor';

export { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';