import { Animated } from "@maximedrn/react-to-svg";
import type { ReactNode } from "react";
import { ReadmeAnimations } from "@/components/readme/readme.constants.ts";
import type { ReadmeHeroProps } from "@/components/readme/readme.types.ts";
import { cn } from "@/lib/class-name";

const ReadmePortrait = (props: ReadmeHeroProps): ReactNode => (
  <div className={cn("flex", "w-1/4", "shrink-0")}>
    <Animated
      animation={ReadmeAnimations.portraitEntrance}
      className={cn("w-full")}
    >
      <Animated
        animation={ReadmeAnimations.portraitDrift}
        className={cn("w-full")}
      >
        <div
          className={cn(
            "flex",
            "w-full",
            "rounded-xl",
            "overflow-hidden",
            "border",
            "border-border",
            "bg-card",
          )}
        >
          <img
            alt="Portrait of Maxime"
            className={cn("w-full")}
            src={props.portrait}
          />
        </div>
      </Animated>
    </Animated>
  </div>
);

export { ReadmePortrait };
