"use client";

import { useEffect } from "react";

import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { createClient } from "@/lib/supabase/client";

const AuthListener: React.FC = () => {
  const supabase = createClient();
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        // Clear current user ID to hide sessions
        useSessionStore.getState().setCurrentUserId(null);

        // Clear storage (sessions are backed up to cloud if persistOnCloud=true)
        useSessionStore.persist.clearStorage();
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return null; // This component doesn't render anything
};

export default AuthListener;
