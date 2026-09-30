import { Animated, Delay } from "@maximedrn/react-to-svg";
import type { ReactNode } from "react";
import { ReadmeAbout } from "@/components/readme/readme.about.tsx";
import {
  ReadmeAnimations,
  ReadmeTimings,
} from "@/components/readme/readme.constants.ts";
import { ReadmeFooter } from "@/components/readme/readme.footer.tsx";
import { ReadmeHero } from "@/components/readme/readme.hero.tsx";
import { ReadmeStack } from "@/components/readme/readme.stack.tsx";
import type { ReadmeRootProps } from "@/components/readme/readme.types.ts";
import { cn } from "@/lib/class-name";

const ReadmeRoot = (props: ReadmeRootProps): ReactNode => (
  <div
    className={cn(
      "flex",
      "flex-col",
      "w-full",
      "p-xl",
      "text-md",
      "leading-lg",
      "font-sans",
      "bg-background",
      "text-foreground",
    )}
  >
    <ReadmeHero portrait={props.portrait} />
    <Delay byMs={ReadmeTimings.about}>
      <Animated
        animation={ReadmeAnimations.sectionEntrance}
        className={cn("w-full")}
      >
        <ReadmeAbout />
      </Animated>
    </Delay>
    <Delay byMs={ReadmeTimings.stack}>
      <Animated
        animation={ReadmeAnimations.sectionEntrance}
        className={cn("w-full")}
      >
        <ReadmeStack />
      </Animated>
    </Delay>
    <Delay byMs={ReadmeTimings.footer}>
      <Animated
        animation={ReadmeAnimations.sectionEntrance}
        className={cn("w-full")}
      >
        <ReadmeFooter />
      </Animated>
    </Delay>
  </div>
);

export { ReadmeRoot };
