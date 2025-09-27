"use client";

import { track } from "@vercel/analytics";

// =========================
// Content Analytics Events
// =========================

export interface ContentAnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

// =========================
// Content Tracking Service
// =========================

export class ContentTrackingService {
  /**
   * Track content view
   */
  static trackContentView(contentSlug: string, contentCategory: string, contentTitle: string) {
    track("content_view", {
      content_slug: contentSlug,
      content_category: contentCategory,
      content_title: contentTitle,
    });

    // Also track for internal analytics
    this.trackInternalEvent({
      action: "view",
      category: "content",
      label: contentSlug,
      properties: {
        category: contentCategory,
        title: contentTitle,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track content engagement (scroll depth, reading time)
   */
  static trackContentEngagement(
    contentSlug: string,
    contentCategory: string,
    engagement: {
      scrollDepth: number; // percentage 0-100
      timeSpent: number; // seconds
      wordsRead?: number;
    }
  ) {
    track("content_engagement", {
      content_slug: contentSlug,
      content_category: contentCategory,
      scroll_depth: engagement.scrollDepth,
      time_spent: engagement.timeSpent,
      words_read: engagement.wordsRead || 0,
    });

    this.trackInternalEvent({
      action: "engagement",
      category: "content",
      label: contentSlug,
      value: engagement.timeSpent,
      properties: {
        scroll_depth: engagement.scrollDepth,
        time_spent: engagement.timeSpent,
        words_read: engagement.wordsRead,
        category: contentCategory,
      },
    });
  }

  /**
   * Track content completion
   */
  static trackContentCompletion(contentSlug: string, contentCategory: string, readingTime: number) {
    track("content_complete", {
      content_slug: contentSlug,
      content_category: contentCategory,
      reading_time: readingTime,
    });

    this.trackInternalEvent({
      action: "complete",
      category: "content",
      label: contentSlug,
      value: readingTime,
      properties: {
        category: contentCategory,
        reading_time: readingTime,
      },
    });
  }

  /**
   * Track content recommendations interaction
   */
  static trackRecommendationClick(recommendedSlug: string, sourceSlug: string, reason: string, relevanceScore: number) {
    track("recommendation_click", {
      recommended_slug: recommendedSlug,
      source_slug: sourceSlug,
      reason: reason,
      relevance_score: relevanceScore,
    });

    this.trackInternalEvent({
      action: "recommendation_click",
      category: "content",
      label: recommendedSlug,
      value: Math.round(relevanceScore * 100),
      properties: {
        source_slug: sourceSlug,
        reason: reason,
        relevance_score: relevanceScore,
      },
    });
  }

  /**
   * Track content sharing
   */
  static trackContentShare(
    contentSlug: string,
    contentCategory: string,
    shareMethod: "copy" | "twitter" | "facebook" | "email"
  ) {
    track("content_share", {
      content_slug: contentSlug,
      content_category: contentCategory,
      share_method: shareMethod,
    });

    this.trackInternalEvent({
      action: "share",
      category: "content",
      label: `${contentSlug}_${shareMethod}`,
      properties: {
        category: contentCategory,
        share_method: shareMethod,
      },
    });
  }

  /**
   * Track content-to-platform conversion
   */
  static trackContentConversion(
    contentSlug: string,
    contentCategory: string,
    conversionType: "signup" | "session_start" | "credits_purchase"
  ) {
    track("content_conversion", {
      content_slug: contentSlug,
      content_category: contentCategory,
      conversion_type: conversionType,
    });

    this.trackInternalEvent({
      action: "conversion",
      category: "content",
      label: `${contentSlug}_${conversionType}`,
      properties: {
        category: contentCategory,
        conversion_type: conversionType,
      },
    });
  }

  /**
   * Track search within content
   */
  static trackContentSearch(query: string, resultCount: number) {
    track("content_search", {
      query: query,
      result_count: resultCount,
    });

    this.trackInternalEvent({
      action: "search",
      category: "content",
      label: query,
      value: resultCount,
      properties: {
        query: query,
        result_count: resultCount,
      },
    });
  }

  // =========================
  // Internal Event Tracking
  // =========================

  private static trackInternalEvent(event: ContentAnalyticsEvent) {
    // Store events in localStorage for internal analytics
    try {
      const existingEvents = JSON.parse(localStorage.getItem("innuora_content_events") || "[]");

      existingEvents.push({
        ...event,
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId(),
      });

      // Keep only last 100 events to avoid storage bloat
      const recentEvents = existingEvents.slice(-100);

      localStorage.setItem("innuora_content_events", JSON.stringify(recentEvents));
    } catch (error) {
      // Silently fail if localStorage is not available
      console.warn("Failed to store content analytics event:", error);
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem("innuora_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem("innuora_session_id", sessionId);
    }
    return sessionId;
  }

  /**
   * Get stored analytics events (for internal reporting)
   */
  static getStoredEvents(): ContentAnalyticsEvent[] {
    try {
      return JSON.parse(localStorage.getItem("innuora_content_events") || "[]");
    } catch {
      return [];
    }
  }

  /**
   * Clear stored events
   */
  static clearStoredEvents() {
    try {
      localStorage.removeItem("innuora_content_events");
    } catch {
      // Silently fail
    }
  }
}

// =========================
// Content Performance Metrics
// =========================

export interface ContentMetrics {
  slug: string;
  title: string;
  category: string;
  views: number;
  averageTimeSpent: number;
  averageScrollDepth: number;
  completionRate: number;
  shareCount: number;
  conversionCount: number;
  lastViewed?: Date;
}

export class ContentMetricsCalculator {
  /**
   * Calculate metrics for a piece of content
   */
  static calculateMetrics(contentSlug: string, events: ContentAnalyticsEvent[]): ContentMetrics {
    const contentEvents = events.filter(
      (event) => event.label === contentSlug || event.properties?.content_slug === contentSlug
    );

    const viewEvents = contentEvents.filter((e) => e.action === "view");
    const engagementEvents = contentEvents.filter((e) => e.action === "engagement");
    const completionEvents = contentEvents.filter((e) => e.action === "complete");
    const shareEvents = contentEvents.filter((e) => e.action === "share");
    const conversionEvents = contentEvents.filter((e) => e.action === "conversion");

    // Calculate averages
    const totalTimeSpent = engagementEvents.reduce((sum, e) => sum + (e.value || 0), 0);
    const averageTimeSpent = engagementEvents.length > 0 ? totalTimeSpent / engagementEvents.length : 0;

    const totalScrollDepth = engagementEvents.reduce((sum, e) => sum + (e.properties?.scroll_depth || 0), 0);
    const averageScrollDepth = engagementEvents.length > 0 ? totalScrollDepth / engagementEvents.length : 0;

    const completionRate = viewEvents.length > 0 ? (completionEvents.length / viewEvents.length) * 100 : 0;

    // Get last viewed date
    const lastViewEvent = viewEvents[viewEvents.length - 1];
    const lastViewed = lastViewEvent?.properties?.timestamp ? new Date(lastViewEvent.properties.timestamp) : undefined;

    return {
      slug: contentSlug,
      title: contentEvents[0]?.properties?.title || contentSlug,
      category: contentEvents[0]?.properties?.category || "unknown",
      views: viewEvents.length,
      averageTimeSpent,
      averageScrollDepth,
      completionRate,
      shareCount: shareEvents.length,
      conversionCount: conversionEvents.length,
      lastViewed,
    };
  }

  /**
   * Get top performing content
   */
  static getTopContent(events: ContentAnalyticsEvent[], limit: number = 10): ContentMetrics[] {
    // Get unique content slugs
    const contentSlugs = [...new Set(events.filter((e) => e.label && e.category === "content").map((e) => e.label!))];

    // Calculate metrics for each content
    const metrics = contentSlugs.map((slug) => this.calculateMetrics(slug, events));

    // Sort by a composite score (views * completion rate * average time)
    return metrics
      .map((m) => ({
        ...m,
        score: m.views * (m.completionRate / 100) * (m.averageTimeSpent / 60),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}
