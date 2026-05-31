import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(), // Tells Turbopack to use the current working directory
  },
};

export default nextConfig;
