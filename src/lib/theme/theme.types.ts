import type { ThemeVariant } from "@maximedrn/react-to-svg";

type ThemeColors = Readonly<Record<string, string>>;
type ThemePalettes = Readonly<Record<ThemeVariant, ThemeColors>>;

interface ThemeLoaderContext {
  readonly addDependency: (file: string) => void;
  readonly resourcePath: string;
}

export type { ThemeColors, ThemeLoaderContext, ThemePalettes };
