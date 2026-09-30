import type { PreviewThemes } from "@/lib/preview/preview.constants.ts";

const PreviewStatus = {
  error: "error",
  ready: "ready",
} as const;

type PreviewStatus = (typeof PreviewStatus)[keyof typeof PreviewStatus];

type PreviewState =
  | { readonly source: string; readonly status: typeof PreviewStatus.ready }
  | { readonly message: string; readonly status: typeof PreviewStatus.error };

interface PreviewProps {
  readonly preview: PreviewState;
}

interface PreviewThemeButtonProps {
  readonly disabled: boolean;
  readonly label: string;
  readonly onSelect: (theme: PreviewThemes) => void;
  readonly selected: boolean;
  readonly theme: PreviewThemes;
}

interface PreviewThemeIconProps {
  readonly theme: PreviewThemes;
}

export type {
  PreviewProps,
  PreviewState,
  PreviewThemeButtonProps,
  PreviewThemeIconProps,
};
export { PreviewStatus };
