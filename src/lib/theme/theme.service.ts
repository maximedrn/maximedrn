import { Effect } from "effect";
import { parse, type Root } from "postcss";
import {
  ThemeColorNames,
  ThemeErrors,
  ThemeSelectors,
  ThemeVariablePattern,
} from "@/lib/theme/theme.constants.ts";
import { stylesheet } from "@/lib/theme/theme.source.ts";
import type { ThemeColors, ThemePalettes } from "@/lib/theme/theme.types.ts";

/**
 * Reads the theme colors from the given PostCSS root for the specified selector.
 *
 * @param {Root} root - The PostCSS root to read from.
 * @param {string} selector - The CSS selector to match rules against.
 * @returns {ThemeColors} An object containing the theme colors.
 */
const readColors = (root: Root, selector: string): ThemeColors => {
  const colors: Record<string, string> = {};
  root.walkRules(selector, (rule): void => {
    rule.walkDecls(ThemeVariablePattern, (declaration): void => {
      colors[declaration.prop.slice(2)] = declaration.value;
    });
  });
  return colors;
};

/**
 * Parses the given CSS string to extract theme colors for both light and dark
 * themes.
 *
 * @param {string} css - The CSS string to parse.
 * @returns {Effect.Effect<ThemePalettes, Error>} An effect that resolves to
 *   the theme palettes or an error.
 */
const parseTheme = (css: string): Effect.Effect<ThemePalettes, Error> =>
  Effect.try({
    catch: (cause: unknown): Error =>
      new Error(ThemeErrors.failedToReadThemeColors, { cause }),
    try: (): ThemePalettes => {
      const root: Root = parse(css);
      const light: ThemeColors = readColors(root, ThemeSelectors.light);
      const dark: ThemeColors = {
        ...light,
        ...readColors(root, ThemeSelectors.dark),
      };
      // Ensure all required theme tokens are present in the light theme.
      for (const name of ThemeColorNames) {
        if (!light[name]) throw new Error(ThemeErrors.missingThemeToken(name));
      }
      return { dark, light };
    },
  });

const loadTheme = (): Effect.Effect<ThemePalettes, Error> =>
  parseTheme(stylesheet);

export { loadTheme, parseTheme };
