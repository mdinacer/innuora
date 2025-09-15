"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { clearSessionKey, getSessionKey } from "@/lib/crypto/encryption";
import { createClient } from "@/lib/supabase/client";

export default function RequireKeyPhrase() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function verifyKeyPhrase() {
      const key = await getSessionKey();

      if (!key) {
        // Clear any remaining session data
        await clearSessionKey();
        await supabase.auth.signOut();

        // Redirect to login
        router.replace("/auth");
      }
    }

    verifyKeyPhrase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return null; // This component renders nothing
}
