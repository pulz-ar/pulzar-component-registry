import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Map friendly paths → public JSON items
      { source: "/orb", destination: "/r/pulzar/orb.json" },
      { source: "/thread", destination: "/r/pulzar/thread.json" },
      { source: "/event", destination: "/r/pulzar/event.json" },
      { source: "/prompt", destination: "/r/pulzar/prompt.json" },
      { source: "/agents", destination: "/r/pulzar/agents.json" },
      { source: "/all", destination: "/r/pulzar/all.json" },
    ];
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
