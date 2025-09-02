"use server";

import { createClient } from "@/lib/supabase/server";

export async function findCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}
