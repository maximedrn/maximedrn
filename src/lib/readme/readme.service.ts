import { readFile } from "node:fs/promises";
import { Template } from "@huggingface/jinja";
import { Effect } from "effect";
import { ProfileAssets, ProfileCopy } from "@/lib/profile/profile.constants.ts";
import { ReadmeErrors, ReadmeTemplate } from "@/lib/readme/readme.constants.ts";

/**
 * Renders the README file by loading the README template, populating it with
 * the profile assets and copy, and returning the rendered README as a string.
 *
 * @returns {Effect.Effect<string, Error>} An effect that resolves to the
 *   rendered README as a string or an error if rendering fails.
 */
const renderReadme = (): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    catch: (cause: unknown): Error => new Error(ReadmeErrors.render, { cause }),
    try: async (): Promise<string> => {
      const source: string = await readFile(ReadmeTemplate.path, "utf8");
      const template: Template = new Template(source);
      const rendered: string = template.render({
        assets: ProfileAssets,
        imageAlt: Bun.escapeHTML(`${ProfileCopy.name} — ${ProfileCopy.role}`),
      });
      return `${rendered.trimEnd()}\n`;
    },
  });

export { renderReadme };
