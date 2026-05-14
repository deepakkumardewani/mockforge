import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@mockforge/types"],
  reactStrictMode: true,
};

export default withMDX(nextConfig);
