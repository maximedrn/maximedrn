import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { ThemeLoaderContext } from "@/lib/theme/theme.types.ts";

// Register the CSS dependency so Next owns invalidation and HMR.
const themeLoader = function themeLoader(this: ThemeLoaderContext): string {
  const file: string = resolve(
    dirname(this.resourcePath),
    "../../app/globals.css",
  );
  this.addDependency(file);
  return `export const stylesheet = ${JSON.stringify(readFileSync(file, "utf8"))};`;
};

export default themeLoader;
