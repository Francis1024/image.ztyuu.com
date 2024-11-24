/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@imgly/background-removal-node': 'commonjs @imgly/background-removal-node',
      })
    }
    return config
  },
};

export default nextConfig;
