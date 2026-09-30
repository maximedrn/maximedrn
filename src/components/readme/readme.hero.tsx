import { Animated } from "@maximedrn/react-to-svg";
import type { ReactNode } from "react";
import { ReadmeAnimations } from "@/components/readme/readme.constants.ts";
import { ReadmeHeroText } from "@/components/readme/readme.hero-text.tsx";
import { ReadmePortrait } from "@/components/readme/readme.portrait.tsx";
import type { ReadmeHeroProps } from "@/components/readme/readme.types.ts";
import { cn } from "@/lib/class-name";

const ReadmeHero = (props: ReadmeHeroProps): ReactNode => (
  <div className={cn("flex", "items-center", "w-full", "pb-lg")}>
    <div className={cn("flex", "w-3/4", "pr-lg")}>
      <Animated
        animation={ReadmeAnimations.sectionEntrance}
        className={cn("w-full")}
      >
        <ReadmeHeroText />
      </Animated>
    </div>
    <ReadmePortrait portrait={props.portrait} />
  </div>
);

export { ReadmeHero };
