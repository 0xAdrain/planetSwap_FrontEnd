/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to avoid double rendering issues
  swcMinify: true,
  compiler: {
    emotion: true,
  },
  // 🚀 跳过构建时的TypeScript和ESLint检查
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    appDir: false,
    esmExternals: false,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  // Completely disable SSR for this app
  async rewrites() {
    return [];
  },
  // Disable error overlay in development
  devIndicators: {
    buildActivity: false,
  },
};

module.exports = nextConfig;
