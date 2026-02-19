import type { NextConfig } from "next";

/**
 * Next.js Configuration
 *
 * ✅ OPTIMIZED for Development Performance with Turbopack
 * - Turbopack: Ultra-fast bundler (Rust-based)
 * - Package import optimization
 * - Better caching
 * - Webpack fallback support
 */
const nextConfig: NextConfig = {
  // ✅ Enable React Strict Mode for better debugging
  reactStrictMode: true,

  // ✅ Exclude @react-pdf/renderer from server bundling (uses native Node modules)
  serverExternalPackages: ['@react-pdf/renderer'],

  // ✅ Optimize package imports - reduces bundle size and compilation time
  // Works with both Turbopack and Webpack
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
    ],
  },

  // ✅ Webpack optimizations (only used when NOT using Turbopack)
  // Turbopack ignores this config automatically
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // ✅ Optimize module resolution for Webpack
      config.resolve.symlinks = false
    }

    return config
  },
};

export default nextConfig;
