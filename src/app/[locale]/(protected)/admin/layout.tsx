import Link from "next/link";
import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { findOrCreateUser } from "@/app/actions/user-actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authUser = await findCurrentUser();

  if (!authUser) {
    redirect("/auth/sign-in");
  }

  const userResult = await findOrCreateUser(authUser.id);
  if (userResult.error) {
    redirect("/auth/sign-in");
  }

  const { role } = userResult.data;

  // Only admins can access admin pages
  if (role !== "admin") {
    redirect("/sessions");
  }

  return (
    <div className="min-h-screen bg-inn-bg-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-inn-text-primary mb-2">Admin Dashboard</h1>
          <p className="text-inn-text-secondary">Manage testers and platform settings</p>
        </div>

        {/* Admin Navigation */}
        <nav className="mb-8 border-b border-inn-border">
          <div className="flex gap-6">
            <Link
              href="/admin/testers"
              className="pb-4 px-2 text-inn-text-primary hover:text-inn-bg-accent border-b-2 border-inn-bg-accent font-medium"
            >
              Testers
            </Link>
            {/* Future tabs: Users, Analytics, Settings */}
          </div>
        </nav>

        {children}
      </div>
    </div>
  );
}
