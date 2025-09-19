"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { clearStoredContentKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
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

        console.log("No key found, redirecting to login");
        // Redirect to login
        router.replace("/auth");
      }
    }

    verifyKeyPhrase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return null; // This component renders nothing
}
