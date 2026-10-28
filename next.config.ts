import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* This app is a small, local, single-user tool that's almost entirely
   * dynamic (reads/writes JSON files on every request) and isn't deployed
   * behind a CDN, so Cache Components/PPR would add Suspense boundaries
   * everywhere for no benefit. Using the classic dynamic rendering model
   * instead (`dynamic = "force-dynamic"` in src/app/layout.tsx). */
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
