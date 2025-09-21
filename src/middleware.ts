import { NextRequest } from "next/server";

import { updateSession } from "@/lib/middleware-with-i18n";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// export const config = {
//   matcher: [
//     // Exclude sitemap.xml, robots.txt, favicon, etc. AND exclude all API routes
//     "/((?!sitemap\\.xml|robots\\.txt|favicon\\.ico|api|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Include trpc only (if needed)
//     "/(trpc.*)",
//   ],
// };

export const config = {
  matcher: [
    // Match all routes except API, Next internals, and common static/special files
    "/((?!api|_next|sitemap\\.xml|robots\\.txt|favicon\\.ico|manifest\\.webmanifest|.*\\.(?:html?|css|js|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip)).*)",

    // TRPC routes only
    "/trpc/:path*",
  ],
};
