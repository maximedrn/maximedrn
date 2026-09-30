import { Effect } from "effect";
import { ProfileAssets } from "@/lib/profile/profile.constants.ts";
import { generateProfile } from "@/lib/profile/profile.service";

const root: string = `${import.meta.dir}/..`;

await Effect.runPromise(
  generateProfile({
    avatarPath: `${root}/${ProfileAssets.source}`,
    outputDir: root,
  }),
);
