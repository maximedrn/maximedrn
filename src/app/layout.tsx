import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PreviewProvider } from "@/components/theme-provider.tsx";
import { cn } from "@/lib/class-name";
import { PreviewCopy } from "@/lib/preview/preview.constants.ts";
import "@/app/globals.css";

const metadata: Metadata = { title: PreviewCopy.title };

interface RootLayoutProps {
  readonly children: ReactNode;
}

const RootLayout = (props: RootLayoutProps): ReactNode => (
  <html
    lang="en"
    suppressHydrationWarning={true}
  >
    <body
      className={cn(
        "min-h-screen",
        "bg-background",
        "font-sans",
        "text-foreground",
      )}
    >
      <PreviewProvider>{props.children}</PreviewProvider>
    </body>
  </html>
);

export { metadata };
export default RootLayout;
