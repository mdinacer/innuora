"use client";

import { useEffect, useRef, useState } from "react";

import { ContentTrackingService } from "@/lib/analytics/content-tracking";

// =========================
// Content View Tracking Hook
// =========================

export function useContentViewTracking(contentSlug: string, contentCategory: string, contentTitle: string) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      ContentTrackingService.trackContentView(contentSlug, contentCategory, contentTitle);
      tracked.current = true;
    }
  }, [contentSlug, contentCategory, contentTitle]);
}

// =========================
// Content Reading Progress Hook
// =========================

export function useReadingProgress(
  contentSlug: string,
  contentCategory: string,
  estimatedReadingTime: number = 8 // minutes
) {
  const [progress, setProgress] = useState({
    scrollDepth: 0,
    timeSpent: 0,
    wordsRead: 0,
  });

  const startTime = useRef<number>(Date.now());
  const lastScrollDepth = useRef(0);
  const engagementTracked = useRef(false);
  const completionTracked = useRef(false);

  useEffect(() => {
    const updateProgress = () => {
      // Calculate scroll depth
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;

      // Calculate time spent
      const timeSpent = (Date.now() - startTime.current) / 1000; // seconds

      // Estimate words read based on scroll depth and reading time
      const estimatedWordCount = estimatedReadingTime * 200; // ~200 words per minute
      const wordsRead = Math.round((scrollDepth / 100) * estimatedWordCount);

      setProgress({
        scrollDepth,
        timeSpent,
        wordsRead,
      });

      // Track engagement after 30 seconds and significant scroll
      if (!engagementTracked.current && timeSpent > 30 && scrollDepth > 25) {
        ContentTrackingService.trackContentEngagement(contentSlug, contentCategory, {
          scrollDepth,
          timeSpent,
          wordsRead,
        });
        engagementTracked.current = true;
      }

      // Track completion when user reaches 80% scroll or spends enough time
      const expectedTimeSpent = estimatedReadingTime * 60 * 0.7; // 70% of expected reading time
      if (!completionTracked.current && (scrollDepth > 80 || timeSpent > expectedTimeSpent)) {
        ContentTrackingService.trackContentCompletion(
          contentSlug,
          contentCategory,
          timeSpent / 60 // convert to minutes
        );
        completionTracked.current = true;
      }

      lastScrollDepth.current = scrollDepth;
    };

    // Track scroll events
    const handleScroll = () => {
      updateProgress();
    };

    // Track time spent every 10 seconds
    const timeInterval = setInterval(updateProgress, 10000);

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Track initial state
    updateProgress();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timeInterval);

      // Track final engagement when component unmounts
      // Capture the start time at cleanup to ensure we use the same value
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const startTimeValue = startTime.current;
      const finalTimeSpent = (Date.now() - startTimeValue) / 1000;
      if (finalTimeSpent > 10) {
        // Only track if spent more than 10 seconds
        ContentTrackingService.trackContentEngagement(contentSlug, contentCategory, {
          scrollDepth: lastScrollDepth.current,
          timeSpent: finalTimeSpent,
          wordsRead: progress.wordsRead,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentSlug, contentCategory, estimatedReadingTime]);

  return progress;
}

// =========================
// Content Recommendation Tracking Hook
// =========================

export function useRecommendationTracking() {
  const trackRecommendationClick = (
    recommendedSlug: string,
    sourceSlug: string,
    reason: string,
    relevanceScore: number
  ) => {
    ContentTrackingService.trackRecommendationClick(recommendedSlug, sourceSlug, reason, relevanceScore);
  };

  return { trackRecommendationClick };
}

// =========================
// Content Sharing Hook
// =========================

export function useContentSharing(contentSlug: string, contentCategory: string) {
  const [isSharing, setIsSharing] = useState(false);

  const shareContent = async (method: "copy" | "twitter" | "facebook" | "email", url: string, title: string) => {
    setIsSharing(true);

    try {
      switch (method) {
        case "copy":
          await navigator.clipboard.writeText(url);
          break;
        case "twitter":
          window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
            "_blank"
          );
          break;
        case "facebook":
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
          break;
        case "email":
          window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
          break;
      }

      // Track the share action
      ContentTrackingService.trackContentShare(contentSlug, contentCategory, method);
    } catch (error) {
      console.error("Failed to share content:", error);
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareContent,
    isSharing,
  };
}

// =========================
// Content Performance Hook
// =========================

export function useContentPerformance() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = () => {
      try {
        const events = ContentTrackingService.getStoredEvents();

        // Calculate basic metrics
        const totalViews = events.filter((e) => e.action === "view").length;
        const totalEngagements = events.filter((e) => e.action === "engagement").length;
        const totalCompletions = events.filter((e) => e.action === "complete").length;
        const totalShares = events.filter((e) => e.action === "share").length;

        // Group by content category
        const categoryMetrics = events.reduce(
          (acc, event) => {
            const category = event.properties?.category || "unknown";
            if (!acc[category]) {
              acc[category] = { views: 0, engagements: 0, completions: 0, shares: 0 };
            }

            if (event.action === "view") acc[category].views++;
            if (event.action === "engagement") acc[category].engagements++;
            if (event.action === "complete") acc[category].completions++;
            if (event.action === "share") acc[category].shares++;

            return acc;
          },
          {} as Record<string, any>
        );

        setMetrics({
          total: {
            views: totalViews,
            engagements: totalEngagements,
            completions: totalCompletions,
            shares: totalShares,
            completionRate: totalViews > 0 ? (totalCompletions / totalViews) * 100 : 0,
          },
          byCategory: categoryMetrics,
        });
      } catch (error) {
        console.error("Failed to load content metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return { metrics, loading };
}
