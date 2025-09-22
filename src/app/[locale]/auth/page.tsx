import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Authentication - Mirael",
  description: "Sign in or create your Mirael account to start your emotional clarity journey.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthRoute() {
  return redirect("/auth/sign-in");
}
