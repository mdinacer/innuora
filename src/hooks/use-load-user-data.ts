import { useCallback, useEffect, useMemo } from "react";
import { User as AuthUser } from "@supabase/supabase-js";

import { getUserWithRelationsById } from "@/app/actions/user-actions";
import { useSessionStore } from "@/domains/session-persistence";
import { useAppUserStore } from "@/stores/app-user.store";

export default function useLoadUserData({ authUser }: { authUser: AuthUser }) {
  const user = useAppUserStore((state) => state.user);
  const hasHydrated = useAppUserStore((state) => state.hasHydrated);

  const handleLoadUserData = useCallback(async (authUser: AuthUser) => {
    try {
      const result = await getUserWithRelationsById(authUser.id);

      // Unwrap ActionResult
      if (result.error) {
        throw new Error(result.error.message);
      }

      const appUser = result.data;
      if (!appUser) {
        throw new Error("App User not found");
      }
      const storeState = useAppUserStore.getState();
      storeState.setAuthUser({ email: authUser.email, email_confirmed_at: authUser.email_confirmed_at });
      storeState.setUser(appUser);

      // Set current user ID in session store for filtering
      useSessionStore.getState().setUserId(appUser.id);
    } catch {
      // Error already logged by the action
    }
  }, []);

  const shouldLoad = useMemo(() => {
    if (!authUser) return false;
    if (!hasHydrated) return true;
    if (user && !user) return true;
    if (user && user.id !== authUser.id) return true;
    return false;
  }, [authUser, hasHydrated, user]);

  useEffect(() => {
    if (shouldLoad) {
      handleLoadUserData(authUser);
    }
  }, [authUser, handleLoadUserData, shouldLoad]);

  return null;
}
