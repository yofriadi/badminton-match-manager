/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    externalDir: true,
  },
  serverExternalPackages: ["pg"],
  transpilePackages: ["@workspace/ui"],
};

export default nextConfig
