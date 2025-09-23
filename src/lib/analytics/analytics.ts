/**
 * Business Intelligence & Analytics Service
 *
 * Provides user behavior tracking, conversion metrics, and business insights
 * without compromising user privacy or encrypting sensitive data.
 */

import { logger } from "@/lib/logging/unified-logger";

// Analytics event types for business intelligence
export type AnalyticsEvent =
  | "user_signup"
  | "user_signin"
  | "session_start"
  | "session_end"
  | "credits_purchased"
  | "ai_message_sent"
  | "session_created"
  | "onboarding_completed"
  | "error_encountered"
  | "feature_used";

// Event properties (non-sensitive data only)
export interface AnalyticsProperties {
  // User context (anonymized)
  userId?: string; // Anonymous user ID, not personal data
  sessionId?: string;

  // Feature usage
  feature?: string;
  action?: string;

  // Business metrics
  creditsAmount?: number;
  modelUsed?: string;
  sessionDuration?: number; // in seconds
  messageCount?: number;

  // Technical context
  errorCode?: string;
  userAgent?: string;
  locale?: string;

  // Additional metadata (non-sensitive)
  metadata?: Record<string, string | number | boolean>;
}

// Analytics configuration
interface AnalyticsConfig {
  enabled: boolean;
  environment: "development" | "staging" | "production";
  sampleRate: number; // 0-1, percentage of events to track
}

class AnalyticsService {
  private config: AnalyticsConfig;

  constructor() {
    this.config = {
      enabled: process.env.NODE_ENV === "production" || process.env.ENABLE_ANALYTICS === "true",
      environment: (process.env.NODE_ENV as any) || "development",
      sampleRate: parseFloat(process.env.ANALYTICS_SAMPLE_RATE || "1.0"),
    };
  }

  /**
   * Track user behavior event for business intelligence
   */
  async track(event: AnalyticsEvent, properties: AnalyticsProperties = {}): Promise<void> {
    if (!this.config.enabled) return;
    if (!this.shouldSample()) return;

    try {
      // Log to audit system for business intelligence
      await logger.logSuccess(`Analytics: ${event}`, {
        operation: "analytics_track",
        userId: properties.userId,
        sessionId: properties.sessionId,
        metadata: {
          event,
          properties: this.sanitizeProperties(properties),
          timestamp: new Date().toISOString(),
          environment: this.config.environment,
        },
      });

      // In production, this could also send to external analytics services
      if (this.config.environment === "production") {
        await this.sendToExternalServices(event, properties);
      }
    } catch (error) {
      // Don't let analytics failures break the user experience
      console.warn("Analytics tracking failed:", error);
    }
  }

  /**
   * Track conversion events for business metrics
   */
  async trackConversion(
    event: "signup" | "purchase" | "retention" | "onboarding",
    properties: AnalyticsProperties = {}
  ): Promise<void> {
    await this.track("feature_used", {
      ...properties,
      feature: "conversion",
      action: event,
    });
  }

  /**
   * Track feature usage for product insights
   */
  async trackFeature(feature: string, action: string, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track("feature_used", {
      ...properties,
      feature,
      action,
    });
  }

  /**
   * Track business metrics (revenue, usage, etc.)
   */
  async trackBusiness(metric: string, value: number, properties: AnalyticsProperties = {}): Promise<void> {
    await this.track("feature_used", {
      ...properties,
      feature: "business_metric",
      action: metric,
      metadata: {
        ...properties.metadata,
        value,
      },
    });
  }

  /**
   * Track user session metrics
   */
  async trackSession(
    action: "start" | "end" | "message_sent",
    sessionMetrics: {
      sessionId: string;
      userId: string;
      duration?: number;
      messageCount?: number;
      creditsUsed?: number;
      modelUsed?: string;
    }
  ): Promise<void> {
    const event = action === "start" ? "session_start" : action === "end" ? "session_end" : "ai_message_sent";

    await this.track(event, {
      userId: sessionMetrics.userId,
      sessionId: sessionMetrics.sessionId,
      sessionDuration: sessionMetrics.duration,
      messageCount: sessionMetrics.messageCount,
      creditsAmount: sessionMetrics.creditsUsed,
      modelUsed: sessionMetrics.modelUsed,
    });
  }

  /**
   * Track errors for monitoring and improvement
   */
  async trackError(error: Error, context: AnalyticsProperties = {}): Promise<void> {
    await this.track("error_encountered", {
      ...context,
      errorCode: error.name,
      metadata: {
        ...context.metadata,
        errorMessage: error.message,
        stack: error.stack ? error.stack.substring(0, 500) : "No stack trace", // Truncate for storage
      },
    });
  }

  /**
   * Determine if this event should be tracked (sampling)
   */
  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  /**
   * Remove sensitive data from properties before logging
   */
  private sanitizeProperties(properties: AnalyticsProperties): AnalyticsProperties {
    const sanitized = { ...properties };

    // Remove any potentially sensitive metadata
    if (sanitized.metadata) {
      const cleanMetadata: Record<string, any> = {};

      for (const [key, value] of Object.entries(sanitized.metadata)) {
        // Skip fields that might contain sensitive data
        if (
          !key.toLowerCase().includes("password") &&
          !key.toLowerCase().includes("token") &&
          !key.toLowerCase().includes("secret") &&
          !key.toLowerCase().includes("email") &&
          !key.toLowerCase().includes("phone")
        ) {
          cleanMetadata[key] = value;
        }
      }

      sanitized.metadata = cleanMetadata;
    }

    return sanitized;
  }

  /**
   * Send analytics to external services (Vercel, PostHog, etc.)
   */
  private async sendToExternalServices(event: AnalyticsEvent, properties: AnalyticsProperties): Promise<void> {
    // Vercel Analytics integration
    if (typeof window !== "undefined" && (window as any).va) {
      (window as any).va("track", event, properties);
    }

    // Future: Add PostHog, Mixpanel, or other analytics services here
    // Note: Only send non-sensitive, aggregated data to external services
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Convenience functions for common tracking scenarios
export const trackUserAction = (action: string, properties?: AnalyticsProperties) =>
  analytics.trackFeature("user_interaction", action, properties);

export const trackConversion = (
  type: "signup" | "purchase" | "retention" | "onboarding",
  properties?: AnalyticsProperties
) => analytics.trackConversion(type, properties);

export const trackError = (error: Error, context?: AnalyticsProperties) => analytics.trackError(error, context);

export const trackSession = (
  action: "start" | "end" | "message_sent",
  metrics: Parameters<typeof analytics.trackSession>[1]
) => analytics.trackSession(action, metrics);
