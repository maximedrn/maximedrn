import type { NextConfig } from "next";

const config: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ["@maximedrn/react-to-svg", "sharp", "svgo"],
  turbopack: {
    rules: {
      "theme.source.ts": {
        as: "*.js",
        loaders: ["./src/lib/theme/theme.loader.ts"],
      },
    },
  },
};

export default config;
