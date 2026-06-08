import type { NextConfig } from "next";

const maxFileSizeMb = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "50");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: `${maxFileSizeMb}mb`,
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  turbopack: {},
};

export default nextConfig;
