import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
import CodeView from "@/components/code-view";
import HomePageDemo from "@/components/home-page/home-page.demo";
import HomePageEarlyAccess from "@/components/home-page/home-page.early-access";
import HomePageFAQ from "@/components/home-page/home-page.faq";
import HomePageFooter from "@/components/home-page/home-page.footer";
import HomePageHeader from "@/components/home-page/home-page.header";
import HomePageHero from "@/components/home-page/home-page.hero";
import HomePageHowItHelps from "@/components/home-page/home-page.how-it-helps";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { findOrCreateUser } from "../actions/user-actions";

async function getByPrisma(authUserId: string | undefined) {
  if (!authUserId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { authId: authUserId },
    });
    return user;
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
}

async function getBySupabase(authUserId: string | undefined) {
  if (!authUserId) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("user").select("*").eq("auth_id", authUserId).single();
  if (error) {
    return { error: JSON.stringify(error) };
  }
  return data;
}

export default async function Home() {
  const authUser = await findCurrentUser();

  const prismaUser = await getByPrisma(authUser?.id);
  const supabaseUser = await getBySupabase(authUser?.id);

  return (
    <main className="relative font-sans min-h-screen w-screen scroll-smooth overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
      <CodeView data={{ authUser, prismaUser, supabaseUser }} className="fixed top-4 right-4 z-50" />

      {/* <!-- Header --> */}
      <HomePageHeader />
      {/* <!-- Hero --> */}
      <HomePageHero />
      {/* <!-- How it helps --> */}
      <HomePageHowItHelps />
      {/* <!-- Demo --> */}
      <HomePageDemo />
      {/* <!-- Early Access CTA --> */}
      <HomePageEarlyAccess />
      {/* <!-- FAQ (native details/summary for a11y, no extra JS needed) --> */}
      <HomePageFAQ />
      {/* <!-- Footer --> */}
      <HomePageFooter />
    </main>
  );
}
