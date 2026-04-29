import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow product images from any HTTPS domain
      {
        protocol: "https",
        hostname: "**",
      },
      // Also allow HTTP (dev/local backends)
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },

  // Allow ngrok and local network origins during development
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok-free.dev", 
    "*.ngrok.io",
  ],
};

export default nextConfig;