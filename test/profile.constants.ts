import { DataUri, Files } from "@test/fixtures.constants.ts";

const ProfileCases = {
  failure:
    "Does not write output files when the source portrait cannot be read.",
  generate:
    "Generates a single flat SVG with themed colors and a README pointing to it.",
  readme:
    "Renders the Jinja image reference and escapes the profile description.",
  suite: "Profile generation.",
} as const;
const ProfileExpected = {
  altEscape: "&amp;",
  darkMedia: "@media (prefers-color-scheme:dark)",
  files: [Files.readme, "assets"],
  image: `./${Files.svg}`,
  rasters: [DataUri.png, DataUri.webp],
  themes: ["dark", "light"],
  width: 840,
} as const;

export { ProfileCases, ProfileExpected };
