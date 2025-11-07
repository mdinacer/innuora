"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { clearStoredContentKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { logger } from "@/lib/logging/logger.client";
import { createClient } from "@/lib/supabase/client";

export default function RequireKeyPhrase() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function verifyKeyPhrase() {
      const key = await getStoredContentKey();

      if (!key) {
        // Key missing - user needs to sign in again to regenerate it
        // Note: This preserves local sessions in IndexedDB (they'll be accessible after re-login)
        await clearStoredContentKey(); // Ensure key is cleared
        await supabase.auth.signOut(); // Clear auth session

        logger.logInfo("Encryption key missing, redirecting to sign-in", {
          operation: "require_key_phrase_redirect",
          metadata: {
            reason: "key_missing",
            message: "User must sign in again to regenerate encryption key and access sessions",
          },
        });

        // Redirect to login with message
        router.replace("/auth/sign-in?reason=key_missing");
      }
    }

    verifyKeyPhrase();
  }, [router, supabase]);

  return null; // This component renders nothing
}
