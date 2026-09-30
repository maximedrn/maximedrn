import type { ReactNode } from "react";
import { cn } from "@/lib/class-name";
import { ProfileCopy } from "@/lib/profile/profile.constants.ts";

const ReadmeHeroText = (): ReactNode => (
  <div className={cn("flex", "flex-col", "w-full")}>
    <span className={cn("text-sm", "leading-md", "font-mono", "text-primary")}>
      {ProfileCopy.eyebrow}
    </span>
    <span
      className={cn(
        "mt-md",
        "text-xl",
        "font-bold",
        "tracking-tight",
        "leading-sm",
      )}
    >
      {ProfileCopy.name}
    </span>
    <span className={cn("mt-sm", "text-md", "leading-md")}>
      {ProfileCopy.role}
    </span>
    <span
      className={cn("mt-md", "text-md", "leading-lg", "text-muted-foreground")}
    >
      {ProfileCopy.about}
    </span>
  </div>
);

export { ReadmeHeroText };
