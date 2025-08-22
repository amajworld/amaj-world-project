/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // Increase body size limit for server actions
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'blogger.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
      }
    ],
  },
};

module.exports = nextConfig;
