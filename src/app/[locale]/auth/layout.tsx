import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
import Header from "@/components/header";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const authUser = await findCurrentUser();
  if (authUser) {
    redirect("/sessions");
  }
  return (
    <div className="min-h-screen w-screen standalone:w-full flex flex-col bg-inn-bg-primary text-inn-text-primary">
      <Header />
      <main>{children}</main>
    </div>
  );
}
