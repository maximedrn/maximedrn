import type { SimpleIcon } from "simple-icons";
import type { ProfileStack } from "@/lib/profile/profile.constants.ts";

interface ReadmeHeroProps {
  readonly portrait: string;
}

interface ReadmeToolProps {
  readonly icon: SimpleIcon;
  readonly name: string;
}

interface ReadmeToolGroupProps {
  readonly group: (typeof ProfileStack)[number];
}

type ReadmeRootProps = ReadmeHeroProps;

export type {
  ReadmeHeroProps,
  ReadmeRootProps,
  ReadmeToolGroupProps,
  ReadmeToolProps,
};
