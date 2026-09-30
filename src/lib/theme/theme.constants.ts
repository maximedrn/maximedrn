const ThemeErrors = {
  failedToReadThemeColors: "Failed to read theme colors from globals.css.",
  missingThemeToken: (name: string): string =>
    `Missing CSS theme token: --${name}.`,
} as const;

const ThemeSelectors = { dark: '[data-theme="dark"]', light: ":root" } as const;

const ThemeColorNames = [
  "background",
  "foreground",
  "card",
  "primary",
  "muted-foreground",
  "border",
  "success",
  "destructive",
] as const;

const ThemeVariablePattern = /^--/;

export { ThemeColorNames, ThemeErrors, ThemeSelectors, ThemeVariablePattern };
