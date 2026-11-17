import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  rewrites: () => {
    return [
      {
        source: "/trpc/:path*",
        destination: "http://localhost:3001/trpc/:path*",
      },
    ]
  },
}

export default nextConfig
