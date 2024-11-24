/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'sharp']
    return config
  },
};

export default nextConfig;
