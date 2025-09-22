"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { clearStoredContentKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { logger } from "@/lib/logging/unified-logger";
import { createClient } from "@/lib/supabase/client";

export default function RequireKeyPhrase() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function verifyKeyPhrase() {
      const key = await getStoredContentKey();

      if (!key) {
        // Clear any remaining session data
        await clearStoredContentKey();
        await supabase.auth.signOut();

        logger.logInfo("No key found, redirecting to login", {
          operation: "require_key_phrase_redirect",
        });
        // Redirect to login
        router.replace("/auth");
      }
    }

    verifyKeyPhrase();
  }, [router, supabase]);

  return null; // This component renders nothing
}
