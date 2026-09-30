const PreviewCopy = {
  controlsLabel: "Preview controls",
  ready: "Up to date.",
  renderFailed: "Could not render the SVG.",
  themeLabel: "Theme",
  title: "Preview",
} as const;

const PreviewErrorEndingPattern = /[.\s]+$/u;

const PreviewErrors = {
  render: (message: string): string =>
    `${PreviewCopy.renderFailed} ${message.trim().replace(PreviewErrorEndingPattern, "")}.`,
} as const;

const PreviewDom = {
  frame: "preview-frame",
  image: "preview-image",
  status: "preview-status",
  theme: "preview-theme",
} as const;

const PreviewMetrics = {
  mediaType: "data:image/svg+xml;base64,",
} as const;

const PreviewThemesSelector = {
  dark: "Dark",
  light: "Light",
  system: "System",
} as const;

type PreviewThemesSelector =
  (typeof PreviewThemesSelector)[keyof typeof PreviewThemesSelector];

const PreviewThemes = {
  dark: "dark",
  light: "light",
  system: "system",
} as const;

type PreviewThemes = (typeof PreviewThemes)[keyof typeof PreviewThemes];

const PreviewThemeOptions = [
  { label: PreviewThemesSelector.light, value: PreviewThemes.light },
  { label: PreviewThemesSelector.dark, value: PreviewThemes.dark },
  { label: PreviewThemesSelector.system, value: PreviewThemes.system },
] as const;

export {
  PreviewCopy,
  PreviewDom,
  PreviewErrors,
  PreviewMetrics,
  PreviewThemeOptions,
  PreviewThemes,
  PreviewThemesSelector,
};
