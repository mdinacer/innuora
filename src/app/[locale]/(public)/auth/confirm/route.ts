import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

import { mapSupabaseAuthError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      redirect("/auth/verify-email/result?status=success");
    } else {
      console.error("Email verification failed:", error.message);
      const errorCode = mapSupabaseAuthError(error);
      redirect(`/auth/verify-email/result?status=error&errorCode=${encodeURIComponent(errorCode)}`);
    }
  }

  // Redirect to error page if missing required parameters
  redirect("/auth/verify-email/result?status=error&errorCode=errors:auth.email_verification_failed");
}
