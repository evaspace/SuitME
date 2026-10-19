import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Keep dynamic route output streamable while prerendering the rest. */
  cacheComponents: true,
  partialPrefetching: true,
  allowedDevOrigins: ['10.90.125.209'],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
