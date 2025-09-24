import { Suspense } from "react";
import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await findCurrentUser();

  if (user?.email_confirmed_at || user?.confirmed_at) {
    redirect("/auth/sign-in");
  }
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
}
