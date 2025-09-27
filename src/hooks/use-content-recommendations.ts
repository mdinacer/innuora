"use client";

import { useEffect, useState } from "react";

import { initializeContentRegistry } from "@/lib/content/content-loader";
import {
  analysisToRecommendationContext,
  contentRecommendationEngine,
} from "@/lib/content/content-recommendation-engine";
import { ContentRecommendation, ContentRecommendationContext } from "@/types/content.types";

// =========================
// Hook for Content Recommendations
// =========================

export function useContentRecommendations(context?: ContentRecommendationContext, limit: number = 5) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        setError(null);

        // Initialize content registry if needed
        await initializeContentRegistry();

        // Get recommendations based on context
        let recs: ContentRecommendation[] = [];

        if (context) {
          recs = contentRecommendationEngine.getRecommendations(context, limit);
        } else {
          // Default to featured content if no context
          recs = contentRecommendationEngine.getRecommendations({}, limit);
        }

        setRecommendations(recs);
      } catch (err) {
        console.error("Failed to load content recommendations:", err);
        setError("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, [context, limit]);

  return {
    recommendations,
    loading,
    error,
  };
}

// =========================
// Hook for Session-Based Recommendations
// =========================

export function useSessionBasedRecommendations(
  sessionAnalysis?: {
    core_module?: string | null;
    process_module?: string | null;
    utility_module?: string | null;
    themes?: Array<{ theme: string }>;
    distortions?: Array<{ type: string }>;
  },
  completedContent?: string[],
  limit: number = 3
) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSessionRecommendations() {
      if (!sessionAnalysis) return;

      try {
        setLoading(true);

        // Initialize content registry
        await initializeContentRegistry();

        // Convert session analysis to recommendation context
        const context = analysisToRecommendationContext(sessionAnalysis);
        context.completedContent = completedContent;

        // Get personalized recommendations
        const recs = contentRecommendationEngine.getRecommendations(context, limit);
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to load session-based recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSessionRecommendations();
  }, [sessionAnalysis, completedContent, limit]);

  return {
    recommendations,
    loading,
  };
}

// =========================
// Hook for Module-Based Recommendations
// =========================

export function useModuleRecommendations(modules: string[], limit: number = 3) {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModuleRecommendations() {
      try {
        setLoading(true);

        // Initialize content registry
        await initializeContentRegistry();

        // Get module-based recommendations
        const recs = contentRecommendationEngine.getModuleBasedRecommendations(modules);
        setRecommendations(recs.slice(0, limit));
      } catch (error) {
        console.error("Failed to load module recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    if (modules.length > 0) {
      loadModuleRecommendations();
    }
  }, [modules, limit]);

  return {
    recommendations,
    loading,
  };
}

// =========================
// Hook for Crisis Recommendations
// =========================

export function useCrisisRecommendations() {
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCrisisRecommendations() {
      try {
        setLoading(true);

        // Initialize content registry
        await initializeContentRegistry();

        // Get crisis/emergency content
        const recs = contentRecommendationEngine.getCrisisRecommendations();
        setRecommendations(recs);
      } catch (error) {
        console.error("Failed to load crisis recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCrisisRecommendations();
  }, []);

  return {
    recommendations,
    loading,
  };
}
