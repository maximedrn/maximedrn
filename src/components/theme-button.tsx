import { type ReactNode, useCallback } from "react";
import { PreviewThemeIcon } from "@/components/theme-icon.tsx";
import { cn } from "@/lib/class-name";
import type { PreviewThemeButtonProps } from "@/lib/preview/preview.types.ts";

const PreviewThemeButton = (props: PreviewThemeButtonProps): ReactNode => {
  const selectTheme = useCallback(
    (): void => props.onSelect(props.theme),
    [props.onSelect, props.theme],
  );

  return (
    <button
      aria-label={props.label}
      aria-pressed={props.selected}
      className={cn(
        "flex",
        "items-center",
        "justify-center",
        "rounded-full",
        "border-2",
        "p-sm",
        "cursor-pointer",
        "transition-colors",
        "motion-reduce:transition-none",
        "focus-visible:outline-2",
        "focus-visible:outline-offset-2",
        "focus-visible:outline-primary",
        "disabled:cursor-wait",
        props.selected ? "border-primary" : "border-border",
        props.selected ? "bg-primary" : "bg-background",
        props.selected ? "text-background" : "text-muted-foreground",
        !props.selected && "hover:border-primary",
        !props.selected && "hover:text-primary",
      )}
      disabled={props.disabled}
      onClick={selectTheme}
      title={props.label}
      type="button"
    >
      <PreviewThemeIcon theme={props.theme} />
    </button>
  );
};

export { PreviewThemeButton };
