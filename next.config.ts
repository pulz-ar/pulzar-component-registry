import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Map /ui/:name → public/r/pulzar/:name.json
      { source: "/ui/:name", destination: "/r/pulzar/:name.json" },
    ];
  },
};

export default nextConfig;
