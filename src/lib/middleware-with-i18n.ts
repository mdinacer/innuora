import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { i18nRouter } from "next-i18n-router";

import i18nConfig from "@/lib/i18n/config";

const protectedRoutes = ["/sessions", "/billing", "/settings", "/admin", "/analytics"]; // Protected paths

export async function updateSession(request: NextRequest) {
  // First, handle i18n routing and get a response object
  const { pathname } = request.nextUrl;

  const response = i18nRouter(request, i18nConfig);

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

    // Check if the request is for a protected route
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    // Handle protected routes
    if (isProtected && (!user || error)) {
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
    // Lightweight console logging only - NO database writes in middleware
    // Middleware runs on Edge Runtime and must be fast (<50ms)
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Middleware auth error:", {
        pathname,
        error: e instanceof Error ? e.message : String(e),
      });
    }
    return response; // fallback on i18nRouter response if Supabase fails
  }
}
