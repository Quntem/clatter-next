import type { NextConfig } from "next"

const backendPort = process.env.BACKEND_PORT ?? "3001"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  rewrites: () => {
    return [
      {
        source: "/trpc/:path*",
        destination: `http://localhost:${backendPort}/trpc/:path*`,
      },
    ]
  },
}

export default nextConfig
