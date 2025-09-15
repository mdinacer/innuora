import SignInForm from "@/components/auth/sign-in-form";

export default async function SignInRoute() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-12">
      <SignInForm />
    </main>
  );
}
