import { redirect } from "next/navigation";

import { findCurrentUser } from "@/app/actions/auth-actions";
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

export default async function Home() {
  const authUser = await findCurrentUser();

  try {
    if (authUser) {
      const supabase = await createClient();
      const profiled = await supabase.from("profile").select("*").eq("id", authUser.id).single();
      console.log(profiled);
      const { profile } = prisma.user.findUniqueOrThrow({
        where: { authId: authUser.id },
      });
      console.log(profile);

      //redirect("/sessions/");
    }
  } catch (error) {
    console.error(error);
  }

  return (
    <main className="relative font-sans min-h-screen w-screen scroll-smooth overflow-hidden bg-mir-bg-primary transition-all duration-300 ease-in text-mir-text-primary">
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
