import type { ReactNode } from "react";
import type { ReadmeToolProps } from "@/components/readme/readme.types.ts";
import { cn } from "@/lib/class-name";

const ReadmeTool = (props: ReadmeToolProps): ReactNode => (
  <div
    className={cn(
      "flex",
      "flex-1",
      "flex-col",
      "items-center",
      "justify-center",
      "gap-sm",
    )}
  >
    <svg
      aria-label={props.name}
      className={cn("w-xl", "h-xl", "text-foreground")}
      role="img"
      viewBox="0 0 24 24"
    >
      <path
        d={props.icon.path}
        fill="currentColor"
      />
    </svg>
    <span className={cn("text-sm", "leading-md", "text-muted-foreground")}>
      {props.name}
    </span>
  </div>
);

export { ReadmeTool };
