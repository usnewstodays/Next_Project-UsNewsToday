/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  
  // Optimization flags for TLS and security
  // Note: compress is disabled for Cloudflare Pages compatibility
  compress: false,
  poweredByHeader: false,
  
  // Security headers
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  
  // Redirects for cleaner URLs
  redirects: async () => {
    return [];
  },
  
  // Rewrites for API routes
  rewrites: async () => {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Environment variables - only include non-Next.js specific ones
  env: {
    SITE_URL: process.env.SITE_URL,
    SITE_TITLE: process.env.SITE_TITLE,
    SITE_DESCRIPTION: process.env.SITE_DESCRIPTION,
    SITE_NAME: process.env.SITE_NAME,
    SITE_COPYRIGHT: process.env.SITE_COPYRIGHT,
    PUBLIC_GA_ID: process.env.PUBLIC_GA_ID
  },

  // Image configuration for Cloudflare Pages
  // Cloudflare Pages doesn't support Next.js Image Optimization API
  // so we must use unoptimized images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true, // Required for Cloudflare Pages compatibility
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack configuration with optimizations
  webpack: (config, { isServer, dev }) => {
    // Only run in production builds
    if (!dev) {
      // Enable tree shaking and module concatenation
      config.optimization.concatenateModules = true;
      config.optimization.usedExports = true;
      
      // Minification options - preserve existing minimizers and add TerserPlugin
      const TerserPlugin = require('terser-webpack-plugin');
      config.optimization.minimize = true;
      // Find existing TerserPlugin or add a new one
      const existingMinimizer = config.optimization.minimizer || [];
      const terserPluginIndex = existingMinimizer.findIndex(
        (plugin) => plugin.constructor.name === 'TerserPlugin'
      );
      
      if (terserPluginIndex !== -1) {
        // Update existing TerserPlugin
        existingMinimizer[terserPluginIndex] = new TerserPlugin({
          parallel: true,
          terserOptions: {
            compress: {
              drop_console: true, // Remove console.log in production
            },
          },
        });
      } else {
        // Add new TerserPlugin to existing minimizers
        existingMinimizer.push(
          new TerserPlugin({
            parallel: true,
            terserOptions: {
              compress: {
                drop_console: true, // Remove console.log in production
              },
            },
          })
        );
      }
      config.optimization.minimizer = existingMinimizer;
    }
    
    // Resolve fallbacks for Cloudflare Pages compatibility
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;
