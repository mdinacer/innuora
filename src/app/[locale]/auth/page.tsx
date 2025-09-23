import { Metadata } from "next";
import { redirect } from "next/navigation";

import { APP_CONFIG } from "@/config/app";

export const metadata: Metadata = {
  title: `Authentication - ${APP_CONFIG.name}`,
  description: `Sign in or create your ${APP_CONFIG.name} account to start your emotional clarity journey.`,
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthRoute() {
  return redirect("/auth/sign-in");
}
