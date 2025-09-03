import { Suspense } from "react";
import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
import Header from "@/components/layout/header";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await findCurrentUser();

  if (user?.email_confirmed_at || user?.confirmed_at) {
    redirect("/auth/sign-in");
  }
  return (
    <div className="min-h-screen w-screen flex flex-col bg-mir-bg-primary text-mir-text-primary">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}
