"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { PreviewThemes } from "@/lib/preview/preview.constants.ts";

const PreviewProvider = (props: {
  readonly children: ReactNode;
}): ReactNode => (
  <ThemeProvider
    attribute="data-theme"
    defaultTheme={PreviewThemes.system}
    disableTransitionOnChange={true}
    enableColorScheme={true}
    enableSystem={true}
    storageKey="preview-theme"
  >
    {props.children}
  </ThemeProvider>
);

export { PreviewProvider };
