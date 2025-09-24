import type { MetadataRoute } from "next";

import { APP_CONFIG } from "@/config/app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
    short_name: APP_CONFIG.name,
    description: APP_CONFIG.description,
    start_url: "/en",
    background_color: "#ffffff",
    theme_color: "#6366f1",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    screenshots: [
      // iPadOS / iOS
      {
        platform: "ipados",
        form_factor: "wide",
        label: "iPad 10.2 Landscape",
        src: "/splash_screens/10.2__iPad_landscape.png",
      },
      {
        platform: "ipados",
        form_factor: "narrow",
        label: "iPad 10.2 Portrait",
        src: "/splash_screens/10.2__iPad_portrait.png",
      },
      {
        platform: "ipados",
        form_factor: "wide",
        label: "iPad Air 10.5 Landscape",
        src: "/splash_screens/10.5__iPad_Air_landscape.png",
      },
      {
        platform: "ipados",
        form_factor: "narrow",
        label: "iPad Air 10.5 Portrait",
        src: "/splash_screens/10.5__iPad_Air_portrait.png",
      },
      {
        platform: "ipados",
        form_factor: "wide",
        label: "iPad Air 10.9 Landscape",
        src: "/splash_screens/10.9__iPad_Air_landscape.png",
      },
      {
        platform: "ipados",
        form_factor: "narrow",
        label: "iPad Air 10.9 Portrait",
        src: "/splash_screens/10.9__iPad_Air_portrait.png",
      },
      {
        platform: "ipados",
        form_factor: "wide",
        label: "iPad Pro 11 M4 Landscape",
        src: "/splash_screens/11__iPad_Pro_M4_landscape.png",
      },
      {
        platform: "ipados",
        form_factor: "narrow",
        label: "iPad Pro 11 M4 Portrait",
        src: "/splash_screens/11__iPad_Pro_M4_portrait.png",
      },
      {
        platform: "ipados",
        form_factor: "wide",
        label: "iPad Pro 12.9 Landscape",
        src: "/splash_screens/12.9__iPad_Pro_landscape.png",
      },
      {
        platform: "ipados",
        form_factor: "narrow",
        label: "iPad Pro 12.9 Portrait",
        src: "/splash_screens/12.9__iPad_Pro_portrait.png",
      },

      // iPhone / iOS
      {
        platform: "ios",
        form_factor: "wide",
        label: "iPhone 11 Pro Max Landscape",
        src: "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_landscape.png",
      },
      {
        platform: "ios",
        form_factor: "narrow",
        label: "iPhone 11 Pro Max Portrait",
        src: "/splash_screens/iPhone_11_Pro_Max__iPhone_XS_Max_portrait.png",
      },
      {
        platform: "ios",
        form_factor: "wide",
        label: "iPhone 11 Landscape",
        src: "/splash_screens/iPhone_11__iPhone_XR_landscape.png",
      },
      {
        platform: "ios",
        form_factor: "narrow",
        label: "iPhone 11 Portrait",
        src: "/splash_screens/iPhone_11__iPhone_XR_portrait.png",
      },
      {
        platform: "ios",
        form_factor: "wide",
        label: "iPhone 13 Mini Landscape",
        src: "/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_landscape.png",
      },
      {
        platform: "ios",
        form_factor: "narrow",
        label: "iPhone 13 Mini Portrait",
        src: "/splash_screens/iPhone_13_mini__iPhone_12_mini__iPhone_11_Pro__iPhone_XS__iPhone_X_portrait.png",
      },
      {
        platform: "ios",
        form_factor: "wide",
        label: "iPhone 14 Plus Landscape",
        src: "/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_landscape.png",
      },
      {
        platform: "ios",
        form_factor: "narrow",
        label: "iPhone 14 Plus Portrait",
        src: "/splash_screens/iPhone_14_Plus__iPhone_13_Pro_Max__iPhone_12_Pro_Max_portrait.png",
      },

      // iOS / iPhone SE / 4-inch
      {
        platform: "ios",
        form_factor: "wide",
        label: "iPhone SE Landscape",
        src: "/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_landscape.png",
      },
      {
        platform: "ios",
        form_factor: "narrow",
        label: "iPhone SE Portrait",
        src: "/splash_screens/4__iPhone_SE__iPod_touch_5th_generation_and_later_portrait.png",
      },

      // iOS / iPad Mini 8.3-inch
      {
        platform: "ipados",
        form_factor: "wide",
        label: "iPad Mini Landscape",
        src: "/splash_screens/8.3__iPad_Mini_landscape.png",
      },
      {
        platform: "ipados",
        form_factor: "narrow",
        label: "iPad Mini Portrait",
        src: "/splash_screens/8.3__iPad_Mini_portrait.png",
      },

      // App icon fallback
      { platform: "ios", src: "/splash_screens/icon.png", type: "image/png", sizes: "any" },
    ],
    id: "/",
    categories: ["health", "wellness", "lifestyle", "productivity"],
    lang: "en",
    icons: [
      // iOS
      { src: "/assets/icons/ios/120.png", sizes: "120x120", type: "image/png" },
      { src: "/assets/icons/ios/152.png", sizes: "152x152", type: "image/png" },
      { src: "/assets/icons/ios/180.png", sizes: "180x180", type: "image/png", purpose: "maskable" },
      { src: "/assets/icons/ios/1024.png", sizes: "1024x1024", type: "image/png" },

      // Android
      { src: "/assets/icons/android/android-launchericon-144-144.png", sizes: "144x144", type: "image/png" },
      { src: "/assets/icons/android/android-launchericon-192-192.png", sizes: "192x192", type: "image/png" },
      {
        src: "/assets/icons/android/android-launchericon-512-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },

      // Windows 11 / Microsoft
      { src: "/assets/icons/windows11/SmallTile.scale-100.png", sizes: "71x71", type: "image/png" },
      { src: "/assets/icons/windows11/SmallTile.scale-200.png", sizes: "142x142", type: "image/png" },
      { src: "/assets/icons/windows11/LargeTile.scale-100.png", sizes: "150x150", type: "image/png" },
      { src: "/assets/icons/windows11/LargeTile.scale-200.png", sizes: "300x300", type: "image/png" },
      { src: "/assets/icons/windows11/StoreLogo.scale-100.png", sizes: "50x50", type: "image/png" },
      { src: "/assets/icons/windows11/Wide310x150Logo.scale-100.png", sizes: "310x150", type: "image/png" },
    ],
    shortcuts: [
      {
        name: "Start New Session",
        short_name: "New Session",
        description: "Begin a new therapeutic conversation",
        url: "/en/sessions/new",
        icons: [
          {
            src: "/assets/icons/android/android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "View Insights",
        short_name: "Insights",
        description: "Review your emotional patterns and insights",
        url: "/en/insights",
        icons: [
          {
            src: "/assets/icons/android/android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "My Sessions",
        short_name: "Sessions",
        description: "Access your conversation history",
        url: "/en/sessions",
        icons: [
          {
            src: "/assets/icons/android/android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
  };
}
