import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isAfter } from "date-fns";
import { CloudIcon, CloudOffIcon, DownloadIcon, UploadIcon } from "lucide-react";

import {
  deleteSession,
  getSessionById,
  getSessionUpdateInfo,
  pushSession,
  updateSession,
} from "@/app/actions/session-actions";
import { Button } from "@/components/mir-ui/button";
import Card from "@/components/mir-ui/card";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { updateStoreSession } from "@/domains/encrypted-session/encrypted-session.utils";
import { Session, SessionMetadataSchema } from "@/domains/open-chat/open-chat.types";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";

interface Props {
  className?: string;
  session: Session;
}

type SyncStatus = "synced" | "localNewer" | "cloudNewer";

const SessionDetailsSyncStatus: React.FC<Props> = ({ className, session }) => {
  const router = useRouter();
  const [cloudInfo, setCloudInfo] = useState<{ id: string; updatedAt: Date } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformForUpdate = useCallback(
    (encryptedSession: any) => {
      const { id, userId, createdAt, updatedAt, ...rest } = encryptedSession;
      // Store extracted IDs for potential future use
      const metadata = {
        originalId: id,
        originalUserId: userId,
        originalCreatedAt: createdAt,
        originalUpdatedAt: updatedAt,
      };

      return {
        ...rest,
        subtitle: session.subtitle || null,
        metadata: encryptedSession.metadata ? SessionMetadataSchema.parse(encryptedSession.metadata) : metadata,
        encryptedData: encryptedSession.encryptedData as EncryptedBlob,
      };
    },
    [session.subtitle]
  );

  const transformForCreate = useCallback(
    (encryptedSession: any) => {
      const { encryptedData, metadata, ...rest } = encryptedSession;
      return {
        ...rest,
        subtitle: session.subtitle || null,
        metadata: metadata ? SessionMetadataSchema.parse(metadata) : {},
        encryptedData: encryptedData as EncryptedBlob,
      };
    },
    [session.subtitle]
  );

  const pushToCloud = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const state = useSessionStore.getState();
      const encryptedSession = state.sessions[session.id];
      if (!encryptedSession) throw new Error("Session not found");

      let result;
      if (session.persistOnCloud) {
        const payload = transformForUpdate(encryptedSession);
        result = await updateSession(session.id, payload);
      } else {
        const payload = transformForCreate(encryptedSession);
        result = await pushSession(payload);
      }

      // Handle error
      if (result.error) {
        setError(result.error.message);
        return;
      }

      const sessionData = result.data;

      if (!session.persistOnCloud) {
        const publicId = state.publicIdMap[session.id];
        if (sessionData.id && publicId) state.setSession(publicId, sessionData);
        router.refresh();
      }

      setCloudInfo({ id: sessionData.id, updatedAt: sessionData.updatedAt });
      state.setSession(session.id, sessionData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to sync");
    } finally {
      setLoading(false);
    }
  }, [session, transformForUpdate, transformForCreate, router]);

  const pullFromCloud = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const state = useSessionStore.getState();
      const publicId = state.getSessionPublicId(session.id);
      const result = await getSessionById(session.id);

      if (result && publicId) {
        state.setSession(publicId, result);
        setCloudInfo({ id: result.id, updatedAt: result.updatedAt });
      } else {
        throw new Error("Session not found on cloud");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to pull");
    } finally {
      setLoading(false);
    }
  }, [session.id]);
  const removeFromCloud = useCallback(async () => {
    if (!confirm("Remove this session from cloud? This cannot be undone.")) return;

    setLoading(true);
    setError(null);
    try {
      await deleteSession(session.id);
      const state = useSessionStore.getState();
      await updateStoreSession(session.id, { ...session, persistOnCloud: false }, state);
      setCloudInfo(null);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to remove");
    } finally {
      setLoading(false);
    }
  }, [session, router]);
  const isOnCloud = session.persistOnCloud;

  const getCloudSessionInfo = useCallback(async () => {
    if (!isOnCloud) {
      setCloudInfo(null);
      return;
    }

    try {
      const data = await getSessionUpdateInfo(session.id);
      setCloudInfo(data);
    } catch (error) {
      console.error("Failed to get cloud info:", error);
    }
  }, [session.id, isOnCloud]);

  const status = useMemo<SyncStatus>(() => {
    if (!cloudInfo || !isOnCloud) return "synced";

    const localDate = session.updatedAt;
    const cloudDate = cloudInfo.updatedAt;

    if (isAfter(localDate, cloudDate)) return "localNewer";
    if (isAfter(cloudDate, localDate)) return "cloudNewer";
    return "synced";
  }, [cloudInfo, session.updatedAt, isOnCloud]);

  useEffect(() => {
    const timeoutId = setTimeout(getCloudSessionInfo, 100);
    return () => clearTimeout(timeoutId);
  }, [getCloudSessionInfo]);

  const statusStyles = {
    localNewer: {
      bg: "bg-yellow-50 dark:bg-yellow-950",
      border: "border-yellow-200 dark:border-yellow-800",
      dot: "bg-yellow-500 dark:bg-yellow-400",
      label: "Local has updates",
    },
    cloudNewer: {
      bg: "bg-blue-50 dark:bg-blue-950",
      border: "border-blue-200 dark:border-blue-800",
      dot: "bg-blue-500 dark:bg-blue-400",
      label: "Cloud has updates",
    },
    synced: {
      bg: "bg-green-50 dark:bg-green-950",
      border: "border-green-200 dark:border-green-800",
      dot: "bg-green-500 dark:bg-green-400",
      label: "Synced",
    },
  }[status];

  return (
    <Card className={className}>
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <CloudIcon className="size-5 text-inn-bg-accent shrink-0" />
        Cloud Sync
      </h3>

      <div className="space-y-3">
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

        {!isOnCloud && (
          <Button variant="secondary" size="full" onClick={pushToCloud} disabled={loading}>
            <CloudIcon className="size-4 shrink-0" />
            {loading ? "Pushing..." : "Push to Cloud"}
          </Button>
        )}

        {isOnCloud && (
          <>
            <div
              className={`flex flex-col items-center justify-between p-3 rounded-xl ${statusStyles.bg} ${statusStyles.border}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusStyles.dot}`}></div>
                <span className="text-sm font-medium">{statusStyles.label}</span>
              </div>
              <span className="text-xs">{cloudInfo ? cloudInfo.updatedAt.toLocaleTimeString() : "—"}</span>
            </div>

            {status === "cloudNewer" && (
              <Button variant="secondary" size="full" onClick={pullFromCloud} disabled={loading}>
                <DownloadIcon className="size-4 shrink-0" />
                {loading ? "Pulling..." : "Pull Updates"}
              </Button>
            )}

            {status === "localNewer" && (
              <Button variant="outline" size="full" onClick={pushToCloud} disabled={loading}>
                <UploadIcon className="size-4 shrink-0" />
                {loading ? "Pushing..." : "Push Updates"}
              </Button>
            )}

            <Button variant="destructive" size="full" onClick={removeFromCloud} disabled={loading}>
              <CloudOffIcon className="size-4 shrink-0" />
              {loading ? "Removing..." : "Remove from Cloud"}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default SessionDetailsSyncStatus;
