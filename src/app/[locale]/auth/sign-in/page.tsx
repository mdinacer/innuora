import Link from "next/link";

export default function SignInRoute() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* <!-- Welcome Header --> */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-3">Welcome back</h1>
          <p className="text-mir-text-secondary">Continue your reflection journey</p>
        </div>

        {/* <!-- Sign In Form --> */}
        <div className="rounded-2xl border border-mir-border-light bg-mir-bg-card p-8 shadow-card">
          <form id="signinForm" className="space-y-6">
            {/* <!-- Email Field --> */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 text-mir-text-primary placeholder-mir-text-secondary outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
              />
            </div>

            {/* <!-- Password Field --> */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-mir-border-light bg-mir-bg-input px-4 py-3 pr-12 text-mir-text-primary placeholder-mir-text-secondary outline-none transition focus:border-mir-bg-accent focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-20"
                />
                <button
                  type="button"
                  id="togglePassword"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-mir-text-secondary hover:text-mir-text-primary transition"
                  aria-label="Toggle password visibility"
                >
                  <svg
                    id="eyeOpen"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  <svg
                    id="eyeClosed"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    className="hidden"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                </button>
              </div>
            </div>

            {/* <!-- Forgot Password --> */}
            <div className="text-right">
              <Link href="#" className="text-sm text-mir-bg-accent hover:underline">
                Forgot your password?
              </Link>
            </div>

            {/* <!-- Submit Button --> */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-mir-bg-accent px-6 py-3 font-semibold text-white shadow transition hover:translate-y-[-1px] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mir-bg-accent focus:ring-opacity-50"
            >
              Sign in
            </button>
          </form>
        </div>

        {/* <!-- Sign Up Link --> */}
        <div className="text-center mt-6">
          <p className="text-mir-text-secondary">
            Don't have an account?
            <Link href="/auth/sign-up" className="text-mir-bg-accent font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* <!-- Privacy Note --> */}
        <div className="mt-8 p-4 rounded-xl bg-mir-bg-soft border border-mir-bg-accent/15">
          <p className="text-sm text-mir-text-secondary text-center">
            Your reflections are private by default. By signing in, you agree to our
            <Link href="#" className="text-mir-bg-accent hover:underline">
              Terms of Use
            </Link>{" "}
            and
            <Link href="#" className="text-mir-bg-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
