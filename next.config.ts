import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent bcryptjs from being bundled into client-side output
  serverExternalPackages: ['bcryptjs'],
};

export default nextConfig;
