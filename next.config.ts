import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { getPwaConfig } from "./src/config/pwa";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const withPWA = withPWAInit(getPwaConfig(process.env.NODE_ENV ?? "development"));

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Polyfill `global` for Nostr/Node.js-oriented libraries
    const webpack = require("webpack");
    config.plugins.push(
      new webpack.DefinePlugin({
        global: "globalThis",
      }),
    );
    return config;
  },
};

export default withPWA(nextConfig);
