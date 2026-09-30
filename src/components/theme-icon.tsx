import { Match } from "effect";
import { type LucideIcon, Monitor, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/class-name";
import { PreviewThemes } from "@/lib/preview/preview.constants.ts";
import type { PreviewThemeIconProps } from "@/lib/preview/preview.types.ts";

const PreviewThemeIcon = (props: PreviewThemeIconProps): ReactNode => {
  const Icon: LucideIcon = Match.value(props.theme).pipe(
    Match.when(PreviewThemes.light, (): LucideIcon => Sun),
    Match.when(PreviewThemes.dark, (): LucideIcon => Moon),
    Match.orElse((): LucideIcon => Monitor),
  );

  return (
    <Icon
      aria-hidden="true"
      className={cn("h-lg", "w-lg", "shrink-0")}
      focusable="false"
      strokeWidth={1.75}
    />
  );
};

export { PreviewThemeIcon };
