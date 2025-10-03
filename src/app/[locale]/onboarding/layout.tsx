import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { createUserWithDefaults, getCurrentUser } from "@/app/actions/user-actions";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const authUser = await findCurrentUser();

  if (!authUser) {
    redirect("/auth/sign-in");
  }
  const user = await getCurrentUser();

  if (!user) {
    await createUserWithDefaults(authUser.id);
  }

  // if (user?.isOnboarded) {
  //   redirect("/sessions");
  // }
  return <main>{children}</main>;
}
