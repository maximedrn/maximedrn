import type { ReactNode } from "react";
import { PreviewTheme } from "@/components/theme-switcher.tsx";
import { cn } from "@/lib/class-name";
import { PreviewCopy, PreviewDom } from "@/lib/preview/preview.constants.ts";
import {
  type PreviewProps,
  PreviewStatus,
} from "@/lib/preview/preview.types.ts";
import { ProfileAssets } from "@/lib/profile/profile.constants.ts";

const PreviewPage = (props: PreviewProps): ReactNode => (
  <main
    className={cn(
      "min-h-screen",
      "w-full",
      "p-md",
      "leading-lg",
      "sm:p-lg",
      "lg:p-xl",
    )}
  >
    <section
      aria-label={PreviewCopy.controlsLabel}
      className={cn(
        "mb-md",
        "flex",
        "items-end",
        "gap-md",
        "rounded-xl",
        "border",
        "p-md",
        "border-border",
        "bg-card",
      )}
    >
      <PreviewTheme />
      <p
        aria-live="polite"
        className={cn(
          "flex-1",
          "text-right",
          "font-mono",
          "text-sm",
          "leading-md",
          "text-primary",
        )}
        id={PreviewDom.status}
      >
        {props.preview.status === PreviewStatus.ready
          ? PreviewCopy.ready
          : PreviewCopy.renderFailed}
      </p>
    </section>
    <div
      className={cn(
        "w-full",
        "overflow-hidden",
        "rounded-xl",
        "border",
        "border-border",
      )}
      id={PreviewDom.frame}
    >
      {props.preview.status === PreviewStatus.ready ? (
        <img
          alt={ProfileAssets.alt}
          className={cn("block", "h-auto", "w-full")}
          id={PreviewDom.image}
          src={props.preview.source}
        />
      ) : (
        <p
          className={cn("p-lg", "text-md", "leading-lg", "text-destructive")}
          role="alert"
        >
          {props.preview.message}
        </p>
      )}
    </div>
  </main>
);

export { PreviewPage };
