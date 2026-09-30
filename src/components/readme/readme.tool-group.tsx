import type { ReactNode } from "react";
import { ReadmeTool } from "@/components/readme/readme.tool.tsx";
import type { ReadmeToolGroupProps } from "@/components/readme/readme.types.ts";
import { cn } from "@/lib/class-name";

const ReadmeToolGroup = (props: ReadmeToolGroupProps): ReactNode => (
  <div
    className={cn(
      "flex",
      "items-start",
      "gap-md",
      "py-md",
      "w-full",
      "border-b",
      "border-border",
    )}
  >
    <div className={cn("flex", "flex-col", "gap-sm", "w-1/4", "shrink-0")}>
      <span className={cn("text-md", "font-bold", "leading-md")}>
        {props.group.name}
      </span>
      <span className={cn("text-sm", "leading-md", "text-muted-foreground")}>
        {props.group.detail}
      </span>
    </div>
    <div className={cn("flex", "flex-1", "gap-sm")}>
      {props.group.tools.map(
        (tool: (typeof props.group.tools)[number]): ReactNode => (
          <ReadmeTool
            key={tool.name}
            {...tool}
          />
        ),
      )}
    </div>
  </div>
);

export { ReadmeToolGroup };
