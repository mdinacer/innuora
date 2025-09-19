import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,

  // SEO and Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Enable experimental features for better SEO
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Security headers that help with SEO trust signals
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache static assets
        source: "/assets/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Image optimization for better Core Web Vitals
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
