import { Suspense } from "react";
import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { findOrCreateUser } from "@/app/actions/user-actions";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const authUser = await findCurrentUser();

  if (!authUser) {
    redirect("/auth/sign-in");
  }

  const { isOnboarded, role } = await findOrCreateUser(authUser.id);
  if (role !== "admin" && role !== "tester") {
    redirect("/");
  }

  if (!isOnboarded) {
    redirect("/onboarding");
  }
  return (
    <div className="flex flex-col min-h-screen z-20 overflow-y-auto overflow-x-hidden w-screen standalone:w-full relative">
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}
