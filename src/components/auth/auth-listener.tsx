"use client";

import { useEffect } from "react";

import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { createClient } from "@/lib/supabase/client";

const AuthListener: React.FC = () => {
  const supabase = createClient();
  useEffect(() => {
    console.log("Auth listener mounted");

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
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
