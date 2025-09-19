/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configure for Replit proxy environment
  async rewrites() {
    return []
  },
  // Allow all hosts for Replit iframe proxy
  experimental: {
    allowedHosts: ['*'],
  },
}

export default nextConfig
