import type { MetadataRoute } from "next";

import { APP_CONFIG } from "@/config/app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    short_name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    start_url: "/en",
    background_color: "#000000",
    theme_color: "#000000",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    id: "/",
    categories: ["health", "wellness", "lifestyle"],
    lang: "en",
    icons: [
      // iOS Icons
      {
        src: "/assets/icons/ios/180.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/assets/icons/ios/152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        src: "/assets/icons/ios/144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        src: "/assets/icons/ios/120.png",
        sizes: "120x120",
        type: "image/png",
      },
      // Android Icons
      {
        src: "/assets/icons/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/assets/icons/android/android-launchericon-192-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/icons/android/android-launchericon-144-144.png",
        sizes: "144x144",
        type: "image/png",
      },
      // Fallback icons
      {
        src: "/assets/icons/ios/512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

// import { appIcons } from "@/metadata/mirael";
// import { Metadata } from "next";

// export default function manifest(): Metadata {
//   return {
//     title: "Mirael — A Gentle Companion for Emotional Clarity",
//     description:
//       "Mirael is a soft and emotionally intelligent space for high-functioning yet emotionally exhausted women to reconnect with themselves, gain clarity, and find gentle insight.",
//     keywords: [
//       "emotional wellness",
//       "self-awareness",
//       "burnout recovery",
//       "CBT",
//       "emotional exhaustion",
//       "women mental health",
//       "introspective app",
//       "gentle companion",
//       "Mirael",
//       "healing",
//       "clarity",
//     ],
//     applicationName: "Mirael",
//     authors: [{ name: "Mirael" }],
//     creator: "Mirael",
//     category: "health",
//     //colorScheme: "light dark",
//     metadataBase: new URL("https://mirael.app"), // Replace with actual domain
//     openGraph: {
//       title: "Mirael — A Gentle Companion for Emotional Clarity",
//       description:
//         "Designed for emotionally exhausted, high-functioning women. Mirael helps you reconnect with your inner self and find peace through introspective flow.",
//       url: "https://mirael.app",
//       siteName: "Mirael",
//       images: [
//         {
//           url: "/og/mirael-cover.png",
//           width: 1200,
//           height: 630,
//           alt: "Mirael App Open Graph Cover",
//         },
//       ],
//       locale: "en_US",
//       type: "website",
//     },
//     // icons: {
//     //   apple: {
//     //     sizes: "180x180",
//     //     url: "/apple-touch-icon.png",
//     //   },
//     // },
//     //icons: appIcons.map(({ sizes, src }) => ({ url: `/assets/icons/${src}`, sizes, type: "image/png" })),

//     // Remove this line - Next.js 15 auto-generates from manifest.ts
//     // manifest: "/site.webmanifest",
//     twitter: {
//       card: "summary_large_image",
//       title: "Mirael — A Gentle Companion for Emotional Clarity",
//       description:
//         "Mirael is an emotionally intelligent app helping high-functioning women navigate disconnection, burnout, and emotional numbness with grace.",
//       creator: "@miraelapp", // optional
//       images: ["/og/mirael-cover.png"],
//     },
//   };
// }
