import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const authUser = await findCurrentUser();

  if (!authUser) {
    redirect("/auth/sign-in");
  }
  return <>{children}</>;
}
