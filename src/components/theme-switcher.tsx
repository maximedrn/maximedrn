"use client";

import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useState } from "react";
import { PreviewThemeButton } from "@/components/theme-button.tsx";
import { cn } from "@/lib/class-name";
import {
  PreviewCopy,
  PreviewDom,
  PreviewThemeOptions,
} from "@/lib/preview/preview.constants.ts";

const PreviewTheme = (): ReactNode => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect((): void => setMounted(true), []);

  return (
    <fieldset
      className={cn("min-w-0", "shrink-0")}
      id={PreviewDom.theme}
    >
      <legend
        className={cn(
          "mb-sm",
          "font-mono",
          "text-sm",
          "leading-md",
          "text-primary",
        )}
      >
        {PreviewCopy.themeLabel}
      </legend>
      <div className={cn("flex", "items-center", "gap-sm")}>
        {PreviewThemeOptions.map(
          (option): ReactNode => (
            <PreviewThemeButton
              disabled={!mounted}
              key={option.value}
              label={option.label}
              onSelect={setTheme}
              selected={mounted && theme === option.value}
              theme={option.value}
            />
          ),
        )}
      </div>
    </fieldset>
  );
};

export { PreviewTheme };
