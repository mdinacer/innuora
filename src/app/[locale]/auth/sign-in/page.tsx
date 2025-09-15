import { findCurrentUser } from "@/app/actions/auth-actions";
import SignInForm from "@/components/auth/sign-in-form";
import CodeView from "@/components/code-view";

export default async function SignInRoute() {
  const currentUser = await findCurrentUser();

  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-12">
      <CodeView data={JSON.stringify(currentUser, null, 2)} />
      <SignInForm />
    </main>
  );
}
