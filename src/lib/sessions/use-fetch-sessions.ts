import { useCallback, useEffect, useMemo, useState } from "react";

import { listSessionsByUser } from "@/app/actions/session-actions";
import { SessionOverview } from "@/lib/ai/mirael-core/v2/open-chat-session.types";

export default function useFetchSessions() {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionOverview[]>([]);

  const shouldFetch = useMemo(() => Object.keys(sessions).length === 0 && !loading, [loading, sessions]);

  const handleFetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data: SessionOverview[] = await listSessionsByUser();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (shouldFetch) {
      handleFetchSessions();
    }
  }, [handleFetchSessions, shouldFetch]);

  return { sessions, loading };
}
