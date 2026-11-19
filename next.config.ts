import type { NextConfig } from "next";

/**
 * GITHUB_PAGES=1 builds a fully static site into ./out for GitHub Pages.
 * NEXT_PUBLIC_BASE_PATH is the repository sub-path (e.g. "/rune-codes"), empty for a custom domain.
 */
const isPages = process.env.GITHUB_PAGES === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(isPages
    ? { output: "export" as const, basePath, trailingSlash: true, images: { unoptimized: true } }
    : { cacheComponents: true, partialPrefetching: true }),
  turbopack: {
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
