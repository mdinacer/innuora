import { redirect } from "next/navigation";

export default function AuthRoute() {
  return redirect("/auth/sign-in");
}
