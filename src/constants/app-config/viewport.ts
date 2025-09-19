import { Viewport } from "next";

export const VIEWPORT = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#000000" },
  ],
  viewportFit: "cover",
  initialScale: 1,
  width: "device-width",
  //height: "device-height",
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false, // Better for PWA experience
} as Viewport;
