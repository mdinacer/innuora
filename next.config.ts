import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  // analyzerMode: "json",
  // openAnalyzer: false,
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,

  // SEO and Performance optimizations
  compress: true,
  poweredByHeader: false,

  // Bundle optimization settings
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Enable aggressive tree shaking
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        // Split chunks more aggressively
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: "all",
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              priority: 10,
              chunks: "all",
            },
            ai: {
              test: /[\\/]node_modules[\\/](openai|js-tiktoken)[\\/]/,
              name: "ai",
              priority: 20,
              chunks: "all",
            },
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
              name: "ui",
              priority: 15,
              chunks: "all",
            },
          },
        },
      };
    }
    return config;
  },

  // Enable experimental features for better SEO and bundle optimization
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-label",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "date-fns",
      "react-hook-form",
      "react-markdown",
      "zod",
      "@stripe/react-stripe-js",
      "@stripe/stripe-js",
    ],
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

export default withBundleAnalyzer(nextConfig);
