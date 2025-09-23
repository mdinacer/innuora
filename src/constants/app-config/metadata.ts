import { Metadata } from "next";

import { APP_CONFIG, APP_NAMES } from "@/config/app";

export const METADATA: Metadata = {
  title: APP_NAMES.taglined,
  description: APP_CONFIG.description,
  keywords: [
    // Primary keywords - core problems Innuora solves
    "emotional burnout support",
    "women burnout recovery",
    "high-functioning women support",
    "emotional overwhelm relief",
    "perfectionist burnout help",
    "emotional exhaustion support",
    "cognitive distortions help",
    "emotional clarity app",
    "women emotional wellness",
    "overachiever stress relief",

    // Secondary keywords - specific features & benefits
    "safe space for women online",
    "emotional mirror app",
    "emotional reflection tool",
    "support for overwhelmed women",
    "silent rules therapy",
    "emotional patterns recognition",
    "self-criticism help",
    "internal pressure relief",
    "emotional validation app",
    "working women emotional support",

    // Branding keywords - what Innuora is
    "AI emotional companion",
    "digital emotional support",
    "emotional companion for women",
    "compassionate AI support",
    "emotional awareness tool",
    "emotional insight companion",
    "gentle emotional guidance",
    "emotional safe space app",
    "emotional wellness companion",

    // Long-tail problem-focused keywords
    "app for emotionally exhausted women",
    "support for high-functioning anxiety",
    "emotional burnout recovery for women",
    "help with perfectionist tendencies",
    "emotional overwhelm support app",
    "cognitive distortion awareness tool",
    "safe space for emotional reflection",
    "support for women carrying expectations",
    "emotional clarity for working women",
    "help with silent emotional rules",

    // Core identity
    APP_CONFIG.name,
    "emotional companion",
    "women emotional clarity",
  ],

  applicationName: APP_CONFIG.name,
  authors: [{ name: APP_CONFIG.company.founder }],
  creator: APP_CONFIG.company.founder,
  category: "health",
  metadataBase: new URL(APP_CONFIG.domains.primary),
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      ar: "/ar",
      fr: "/fr",
    },
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // iOS PWA Support
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_CONFIG.name,
    startupImage: [
      {
        url: "/splash_screens/iPhone_17_Pro_Max__iPhone_16_Pro_Max_landscape.png",
        media:
          "screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_17_Pro_Max__iPhone_16_Pro_Max_portrait.png",
        media:
          "screen and (device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_landscape.png",
        media:
          "screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_17_Pro__iPhone_17__iPhone_16_Pro_portrait.png",
        media:
          "screen and (device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_16_Plus__iPhone_15_Plus_landscape.png",
        media:
          "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_16_Plus__iPhone_15_Plus_portrait.png",
        media:
          "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_16__iPhone_15_landscape.png",
        media:
          "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_16__iPhone_15_portrait.png",
        media:
          "screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_SE_landscape.png",
        media:
          "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_SE_portrait.png",
        media:
          "screen and (device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_XR__iPhone_11_landscape.png",
        media:
          "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_XR__iPhone_11_portrait.png",
        media:
          "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_12_Pro_Max__iPhone_13_Pro_Max__iPhone_14_Plus_landscape.png",
        media:
          "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_12_Pro_Max__iPhone_13_Pro_Max__iPhone_14_Plus_portrait.png",
        media:
          "screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_12__iPhone_12_Pro__iPhone_13__iPhone_13_Pro__iPhone_14__iPhone_15_Pro_landscape.png",
        media:
          "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_12__iPhone_12_Pro__iPhone_13__iPhone_13_Pro__iPhone_14__iPhone_15_Pro_portrait.png",
        media:
          "screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_14_Pro__iPhone_15_Pro_Max_landscape.png",
        media:
          "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_14_Pro__iPhone_15_Pro_Max_portrait.png",
        media:
          "screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPhone_X__iPhone_11_Pro__iPhone_12_mini__iPhone_13_mini_landscape.png",
        media:
          "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPhone_X__iPhone_11_Pro__iPhone_12_mini__iPhone_13_mini_portrait.png",
        media:
          "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPad_Mini_landscape.png",
        media:
          "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPad_Mini_portrait.png",
        media:
          "screen and (device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPad_Pro_11_landscape.png",
        media:
          "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPad_Pro_11_portrait.png",
        media:
          "screen and (device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/splash_screens/iPad_Pro_12.9_landscape.png",
        media:
          "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/splash_screens/iPad_Pro_12.9_portrait.png",
        media:
          "screen and (device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
  // appleWebApp: {
  //   capable: true,
  //   statusBarStyle: "black-translucent",
  //   title: APP_CONFIG.name,
  //   startupImage: [
  //     {
  //       url: "/assets/icons/ios/1024.png",
  //       media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
  //     },
  //   ],
  // },

  // Icons
  icons: {
    icon: [
      { url: "/assets/icons/ios/16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/icons/ios/32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icons/ios/192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/icons/ios/512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/assets/icons/ios/180.png", sizes: "180x180", type: "image/png" },
      { url: "/assets/icons/ios/152.png", sizes: "152x152", type: "image/png" },
      { url: "/assets/icons/ios/144.png", sizes: "144x144", type: "image/png" },
      { url: "/assets/icons/ios/120.png", sizes: "120x120", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-startup-image",
        url: "/assets/icons/ios/1024.png",
      },
    ],
  },

  openGraph: {
    title: `${APP_CONFIG.name} — AI for Emotional Clarity, Reflection, and Insight`,
    description: `${APP_CONFIG.name} helps high-functioning women navigate emotional exhaustion, perfectionism, and stress by reflecting emotions, uncovering silent rules, and offering actionable self-insight.`,
    url: APP_CONFIG.domains.primary,
    siteName: APP_CONFIG.name,
    images: [
      {
        url: "/og/innuora-cover.png",
        width: 1200,
        height: 630,
        alt: `${APP_CONFIG.name} App Open Graph Cover`,
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: `${APP_CONFIG.name} — AI for Emotional Clarity, Reflection, and Insight`,
    description: `${APP_CONFIG.name} is a unique AI companion helping high-functioning women gain clarity, process overwhelm, and navigate perfectionism with emotional reflection and insight.`,
    creator: APP_CONFIG.social.twitter.creator,
    images: ["/og/innuora-cover.png"],
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": APP_CONFIG.name,
    "msapplication-TileColor": "#ffffff",
    "msapplication-config": "/browserconfig.xml",
  },
};
