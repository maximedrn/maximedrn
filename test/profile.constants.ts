import { Files } from "@test/fixtures.constants.ts";

const ProfileCases = {
  failure:
    "Does not write output files when the source portrait cannot be read.",
  generate:
    "Generates a self-contained themed SVG and a README pointing to it.",
  readme:
    "Renders the Jinja image reference and escapes the profile description.",
  suite: "Profile generation.",
} as const;
const ProfileExpected = {
  altEscape: "&amp;",
  files: [Files.readme, "assets"],
  image: `./${Files.svg}`,
  themes: ["dark", "light"],
  width: 840,
} as const;

export { ProfileCases, ProfileExpected };
