import { Animated } from "@maximedrn/react-to-svg";
import type { ReactNode } from "react";
import { ReadmeAnimations } from "@/components/readme/readme.constants.ts";
import { cn } from "@/lib/class-name";
import { ProfileCopy } from "@/lib/profile/profile.constants.ts";

const ReadmeAbout = (): ReactNode => (
  <div
    className={cn(
      "flex",
      "items-center",
      "gap-md",
      "w-full",
      "py-md",
      "border-t",
      "border-b",
      "border-border",
    )}
  >
    <Animated
      animation={ReadmeAnimations.availabilityPulse}
      className={cn("h-sm", "w-sm", "shrink-0")}
    >
      <div
        className={cn("flex", "rounded-full", "h-sm", "w-sm", "bg-success")}
      />
    </Animated>
    <div className={cn("flex", "flex-col", "gap-sm")}>
      <span className={cn("text-md", "leading-md")}>
        {ProfileCopy.availabilityLabel}
      </span>
      <span className={cn("text-sm", "leading-md", "text-muted-foreground")}>
        {ProfileCopy.availability}
      </span>
    </div>
  </div>
);

export { ReadmeAbout };
