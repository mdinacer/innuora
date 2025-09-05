import { Suspense } from "react";
import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { findOrCreateUser } from "@/app/actions/user-actions";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const authUser = await findCurrentUser();

  if (!authUser) {
    redirect("/auth/sign-in");
  }

  const { isOnboarded } = await findOrCreateUser(authUser.id);

  if (!isOnboarded) {
    redirect("/onboarding");
  }
  return (
    <div className="flex flex-col min-h-screen z-20 overflow-y-auto overflow-x-hidden w-screen relative">
      {/* <Header className="fixed top-0 inset-x-0 bg-mir-bg-card" sideContent={<UserDropdown user={authUser} />} />
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex-1 pt-[85px]">{children}</div>
      </Suspense> */}
      <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
    </div>
  );
}
