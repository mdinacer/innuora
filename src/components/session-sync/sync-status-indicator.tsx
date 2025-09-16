/**
 * SyncStatusIndicator - Shows session synchronization status to user
 * Provides visual feedback and error recovery options
 */

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Wifi, WifiOff } from "lucide-react";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { simpleSessionSync, SyncStatusDetailed } from "@/lib/session-sync/simple-sync";

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
  const [syncStatus, setSyncStatus] = useState<SyncStatusDetailed>({ local: "synced", cloud: "synced" });
  const [lastSyncTimes, setLastSyncTimes] = useState<{ local: Date | null; cloud: Date | null }>({
    local: null,
    cloud: null,
  });
  const [isOnline, setIsOnline] = useState(true);

  // Poll sync status
  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(simpleSessionSync.getSyncStatus(sessionId));
      setLastSyncTimes(simpleSessionSync.getLastSyncTimes(sessionId));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000); // Update every second

    return () => clearInterval(interval);
  }, [sessionId]);

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

    // Determine overall status priority: error > syncing > pending > synced
    const localStatus = syncStatus.local;
    const cloudStatus = syncStatus.cloud;

    if (localStatus === "error" || cloudStatus === "error") {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (localStatus === "syncing" || cloudStatus === "syncing") {
      return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
    if (localStatus === "pending" || cloudStatus === "pending") {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    if (localStatus === "synced" && (cloudStatus === "synced" || cloudStatus === "disabled")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    return <Wifi className="h-4 w-4 text-gray-400" />;
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";

    const localStatus = syncStatus.local;
    const cloudStatus = syncStatus.cloud;
    const isCloudEnabled = session?.persistOnCloud;

    // Handle error states first
    if (localStatus === "error" && cloudStatus === "error") {
      return "Sync failed";
    }
    if (localStatus === "error") {
      return "Local sync failed";
    }
    if (cloudStatus === "error") {
      return "Cloud sync failed";
    }

    // Handle syncing states
    if (localStatus === "syncing" && cloudStatus === "syncing") {
      return "Syncing to cloud...";
    }
    if (localStatus === "syncing") {
      return "Syncing locally...";
    }
    if (cloudStatus === "syncing") {
      return "Backing up to cloud...";
    }

    // Handle pending states
    if (localStatus === "pending" || cloudStatus === "pending") {
      return isCloudEnabled ? "Pending sync..." : "Syncing locally...";
    }

    // Handle synced states
    if (localStatus === "synced") {
      if (cloudStatus === "synced") {
        return "Backed up to cloud";
      }
      if (cloudStatus === "disabled" || !isCloudEnabled) {
        return "Local only";
      }
    }

    return "Unknown status";
  };

  const getStatusColor = () => {
    if (!isOnline) return "text-gray-500";

    const localStatus = syncStatus.local;
    const cloudStatus = syncStatus.cloud;

    // Priority: error > syncing > pending > synced
    if (localStatus === "error" || cloudStatus === "error") {
      return "text-red-600";
    }
    if (localStatus === "syncing" || cloudStatus === "syncing") {
      return "text-blue-600";
    }
    if (localStatus === "pending" || cloudStatus === "pending") {
      return "text-yellow-600";
    }
    if (localStatus === "synced" && (cloudStatus === "synced" || cloudStatus === "disabled")) {
      return "text-green-600";
    }

    return "text-gray-500";
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

          {(lastSyncTimes.local || lastSyncTimes.cloud) && (
            <div className="text-xs text-gray-500">
              {lastSyncTimes.local && <div>Local: {formatLastSync(lastSyncTimes.local)}</div>}
              {lastSyncTimes.cloud && <div>Cloud: {formatLastSync(lastSyncTimes.cloud)}</div>}
            </div>
          )}
        </div>
      )}

      {!showDetails && <span className={`text-sm ${getStatusColor()}`}>{getStatusText()}</span>}

      {/* Error recovery actions */}
      {(syncStatus.local === "error" || syncStatus.cloud === "error") && (
        <div className="flex gap-1">
          {syncStatus.local === "error" && (
            <button
              onClick={() => simpleSessionSync.retryFailedSync(sessionId, "local")}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              title="Retry local sync"
            >
              Retry Local
            </button>
          )}
          {syncStatus.cloud === "error" && (
            <button
              onClick={() => simpleSessionSync.retryFailedSync(sessionId, "cloud")}
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              title="Retry cloud sync"
            >
              Retry Cloud
            </button>
          )}
        </div>
      )}

      {/* Manual sync triggers */}
      {syncStatus.local === "synced" && syncStatus.cloud !== "error" && showDetails && (
        <div className="flex gap-1">
          <button
            onClick={() => simpleSessionSync.syncSessionLocal(sessionId)}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            title="Force local sync"
          >
            Sync Local
          </button>
          {session?.persistOnCloud && (
            <button
              onClick={() => simpleSessionSync.syncSessionCloud(sessionId)}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title="Force cloud sync"
            >
              Sync Cloud
            </button>
          )}
        </div>
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
