"use client";

import { useEffect } from "react";

import { useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";
import { createClient } from "@/lib/supabase/client";

const AuthListener: React.FC = () => {
  const supabase = createClient();
  useEffect(() => {
    console.log("Auth listener mounted");

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "INITIAL_SESSION") {
        // handle initial session
      } else if (event === "SIGNED_IN") {
        // handle sign in event
      } else if (event === "SIGNED_OUT") {
        // if (getSessionKey()) {
        //   clearSessionKey();
        // }
        useEncryptedSessionStore.persist.clearStorage();

        // handle sign out event
      } else if (event === "PASSWORD_RECOVERY") {
        // handle password recovery event
      } else if (event === "TOKEN_REFRESHED") {
        // handle token refreshed event
      } else if (event === "USER_UPDATED") {
        // handle user updated event
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return null; // This component doesn't render anything
};

export default AuthListener;
