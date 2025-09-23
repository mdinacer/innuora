/**
 * React Hook for Analytics Tracking
 *
 * Provides easy-to-use analytics tracking for React components
 * with automatic session and user context.
 */

import React, { useCallback } from 'react';

import { AnalyticsEvent, AnalyticsProperties, analytics, trackConversion, trackError, trackUserAction } from './analytics';

export function useAnalytics() {
  // Track generic analytics events
  const track = useCallback((event: AnalyticsEvent, properties?: AnalyticsProperties) => {
    analytics.track(event, properties);
  }, []);

  // Track user interactions (button clicks, form submissions, etc.)
  const trackAction = useCallback((action: string, properties?: AnalyticsProperties) => {
    trackUserAction(action, properties);
  }, []);

  // Track business conversions
  const trackConversionEvent = useCallback(
    (type: 'signup' | 'purchase' | 'retention' | 'onboarding', properties?: AnalyticsProperties) => {
      trackConversion(type, properties);
    },
    []
  );

  // Track feature usage
  const trackFeature = useCallback((feature: string, action: string, properties?: AnalyticsProperties) => {
    analytics.trackFeature(feature, action, properties);
  }, []);

  // Track business metrics
  const trackBusiness = useCallback((metric: string, value: number, properties?: AnalyticsProperties) => {
    analytics.trackBusiness(metric, value, properties);
  }, []);

  // Track errors with context
  const trackErrorEvent = useCallback((error: Error, context?: AnalyticsProperties) => {
    trackError(error, context);
  }, []);

  // Track page views or component mounts
  const trackPageView = useCallback((page: string, properties?: AnalyticsProperties) => {
    trackAction('page_view', {
      ...properties,
      feature: 'navigation',
      action: 'page_view',
      metadata: {
        ...properties?.metadata,
        page,
      },
    });
  }, [trackAction]);

  return {
    track,
    trackAction,
    trackConversion: trackConversionEvent,
    trackFeature,
    trackBusiness,
    trackError: trackErrorEvent,
    trackPageView,
  };
}

// Higher-order component for automatic page tracking
export function withAnalytics<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  pageName: string
): React.ComponentType<T> {
  return function AnalyticsWrapper(props: T) {
    const { trackPageView } = useAnalytics();

    // Track page view on mount
    React.useEffect(() => {
      trackPageView(pageName);
    }, [trackPageView]);

    return React.createElement(Component, props);
  };
}