import { Metadata } from "next";
import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { getUserWithRelationsById } from "@/app/actions/user-actions";
import { DynamicPages } from "@/components/dynamic-loaders";
import Header from "@/components/header";
import { APP_CONFIG } from "@/config/app";
import UserMenu from "@/user-menu";

// =========================
// Metadata
// =========================

export const metadata: Metadata = {
  title: `Account Settings | ${APP_CONFIG.name}`,
  description: "Manage your credits, view purchase history, and secure ongoing therapeutic support.",
};

// =========================
// Account Page Component
// =========================

export default async function AccountPage() {
  const authUser = await findCurrentUser();
  // Get user information

  if (!authUser) {
    // This should be handled by middleware, but just in case
    redirect("/auth/sign-in");
  }

  const user = await getUserWithRelationsById(authUser.id);

  if (!user || user.error || !user.data) {
    // This should be handled by middleware, but just in case
    redirect("/auth/sign-in");
  }

  return (
    <div className="h-full w-full mt-30">
      <Header className="fixed inset-x-0 top-0 py-1" sideContent={<UserMenu />} />
      <DynamicPages.AccountManagement authUser={authUser} user={user.data} />
    </div>
  );
}
