/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    // @react-pdf/renderer uses Node-only APIs (fs, font handling). Letting Next bundle
    // it for the server runtime sometimes breaks builds; this opts it out of bundling.
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
};

export default nextConfig;
