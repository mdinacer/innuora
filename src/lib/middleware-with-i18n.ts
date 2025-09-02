import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { i18nRouter } from "next-i18n-router";

import i18nConfig from "@/lib/i18n/config";

export async function updateSession(request: NextRequest) {
  // First, handle i18n routing and get a response object
  const response = i18nRouter(request, { ...i18nConfig, prefixDefault: true });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Get user session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Handle protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && (!user || error)) {
      const signInUrl = new URL("auth/sign-in", request.url);
      // Preserve the locale in the redirect
      if (response instanceof NextResponse && response.headers.get("x-pathname")) {
        const locale = response.headers.get("x-pathname")?.split("/")[1];
        if (locale && i18nConfig.locales.includes(locale)) {
          signInUrl.pathname = `/${locale}/auth/sign-in`;
        }
      }
      return NextResponse.redirect(signInUrl);
    }

    // Handle authenticated user redirects (if needed)
    // Remove this if you don't want to redirect authenticated users from home
    // if (request.nextUrl.pathname === "/" && user && !error) {
    //   return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    return response;
  } catch (e) {
    console.error("Middleware error:", e);
    return response; // fallback on i18nRouter response if Supabase fails
  }
}

// Configure which paths the middleware should run on

export const config = {
  matcher: [
    // Skip all internal paths (_next, _static, etc.)
    // Skip all API routes
    // Skip root favicon.ico
    "/((?!_next|_static|_vercel|api|favicon.ico).*)",
  ],
};
