import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-expect-error - undocumented Next.js property for resolving HMR cross-origin block
  allowedDevOrigins: ['192.168.1.3', 'localhost', '127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
