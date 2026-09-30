import type { ReactNode } from "react";
import { cn } from "@/lib/class-name";
import { ProfileCopy } from "@/lib/profile/profile.constants.ts";

const ReadmeFooter = (): ReactNode => (
  <div
    className={cn(
      "flex",
      "items-center",
      "justify-between",
      "gap-md",
      "mt-lg",
      "w-full",
      "text-sm",
      "leading-md",
      "font-mono",
      "text-muted-foreground",
    )}
  >
    <span className={cn("text-primary")}>{ProfileCopy.email}</span>
    <span>{ProfileCopy.linkedin}</span>
  </div>
);

export { ReadmeFooter };
