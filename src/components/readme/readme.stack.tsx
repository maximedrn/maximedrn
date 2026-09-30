import type { ReactNode } from "react";
import { ReadmeToolGroup } from "@/components/readme/readme.tool-group.tsx";
import { cn } from "@/lib/class-name";
import { ProfileCopy, ProfileStack } from "@/lib/profile/profile.constants.ts";

const ReadmeStack = (): ReactNode => (
  <div className={cn("flex", "flex-col", "mt-lg", "w-full")}>
    <span
      className={cn(
        "text-lg",
        "font-bold",
        "tracking-tight",
        "leading-md",
        "mb-sm",
      )}
    >
      {ProfileCopy.sectionStack}
    </span>
    {ProfileStack.map(
      (group: (typeof ProfileStack)[number]): ReactNode => (
        <ReadmeToolGroup
          group={group}
          key={group.name}
        />
      ),
    )}
  </div>
);

export { ReadmeStack };
