import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration options here
  // Note: Turbopack root is automatically detected
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;