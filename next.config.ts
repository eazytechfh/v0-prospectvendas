import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["@react-pdf/renderer"],
}

export default nextConfig

