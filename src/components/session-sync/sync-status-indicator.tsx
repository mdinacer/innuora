/**
 * SyncStatusIndicator - Shows session synchronization status to user
 * Provides visual feedback and error recovery options
 */

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Wifi, WifiOff } from "lucide-react";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useSessionSyncStatus } from "@/lib/session-sync/auto-sync-hooks";

interface SyncStatusIndicatorProps {
  sessionId: string;
  session?: Session;
  className?: string;
  showDetails?: boolean;
}

export function SyncStatusIndicator({
  sessionId,
  session,
  className = "",
  showDetails = false,
}: SyncStatusIndicatorProps) {
  const { status, lastSyncTime, retry, manualSync } = useSessionSyncStatus(sessionId);
  const [isOnline, setIsOnline] = useState(true);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-gray-400" />;
    }

    switch (status) {
      case "synced":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";

    const isCloudBacked = session?.persistOnCloud;

    switch (status) {
      case "synced":
        return isCloudBacked ? "Backed up to cloud" : "Local only";
      case "pending":
        return isCloudBacked ? "Backing up..." : "Syncing locally";
      case "syncing":
        return isCloudBacked ? "Backing up..." : "Syncing...";
      case "error":
        return isCloudBacked ? "Backup failed" : "Sync failed";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = () => {
    if (!isOnline) return "text-gray-500";

    switch (status) {
      case "synced":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "syncing":
        return "text-blue-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return "Never";

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIcon()}

      {showDetails && (
        <div className="flex flex-col">
          <span className={`text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</span>

          {lastSyncTime && <span className="text-xs text-gray-500">Last sync: {formatLastSync(lastSyncTime)}</span>}
        </div>
      )}

      {!showDetails && <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>}

      {/* Error recovery actions */}
      {status === "error" && (
        <button
          onClick={retry}
          className="ml-2 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          title="Retry sync"
        >
          Retry
        </button>
      )}

      {/* Manual sync trigger */}
      {status === "synced" && showDetails && (
        <button
          onClick={manualSync}
          className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          title="Force sync"
        >
          Sync
        </button>
      )}
    </div>
  );
}

/**
 * Global sync status indicator for app header/status bar
 */
export function GlobalSyncStatus() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleSyncFailed = () => {
      setIsVisible(true);
      // Auto-hide after 10 seconds
      setTimeout(() => setIsVisible(false), 10000);
    };

    window.addEventListener("session-sync-failed", handleSyncFailed);
    return () => window.removeEventListener("session-sync-failed", handleSyncFailed);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <div>
          <p className="font-medium">Session sync failed</p>
          <p className="text-sm">Your changes are saved locally. We'll retry automatically.</p>
        </div>
        <button onClick={() => setIsVisible(false)} className="ml-4 text-red-500 hover:text-red-700">
          ×
        </button>
      </div>
    </div>
  );
}
