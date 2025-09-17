"use client";

import { useState, useEffect } from "react";

import { getUserPoints } from "@/app/actions/points-actions";

interface UserPoints {
  pointsBalance: number;
  pointsConsumed: number;
}

interface PointsBalanceDisplayProps {
  userId: string;
  className?: string;
}

export function PointsBalanceDisplay({ userId, className }: PointsBalanceDisplayProps) {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPoints();
  }, [userId]);

  const loadUserPoints = async () => {
    setLoading(true);
    try {
      const result = await getUserPoints(userId);
      setPoints(result);
    } catch (error) {
      console.error("Failed to load user points:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!points) {
    return (
      <div className={className}>
        <span className="text-red-500">Error loading points</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-green-600">
          {points.pointsBalance}
        </span>
        <span className="text-xs text-gray-500">points</span>
      </div>
      
      {points.pointsConsumed > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>•</span>
          <span>{points.pointsConsumed} used</span>
        </div>
      )}
    </div>
  );
}