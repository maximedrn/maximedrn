import { mkdir, readFile } from "node:fs/promises";
import {
  type FontConfig,
  type RenderError,
  RenderService,
  RenderServiceLive,
  type ThemeVariant,
} from "@maximedrn/react-to-svg";
import { Effect } from "effect";
import { renderPortrait } from "@/lib/portrait/portrait.service";
import {
  ProfileAssets,
  ProfileErrors,
  ProfileFonts,
  ProfileViewport,
} from "@/lib/profile/profile.constants.ts";
import { makeReadme } from "@/lib/profile/profile.renderer.ts";
import type { GenerateOptions } from "@/lib/profile/profile.types.ts";
import { renderReadme } from "@/lib/readme/readme.service";
import { optimizeSvg } from "@/lib/svg/svg.service";
import { createSvgTailwindConfig } from "@/lib/svg/svg.tailwind.ts";
import { loadTheme } from "@/lib/theme/theme.service";

/**
 * Loads a font from the specified face configuration and returns an effect
 * that resolves to the font configuration.
 *
 * @param {(typeof ProfileFonts)[number]} face - The font face configuration
 *   to load.
 * @returns {Effect.Effect<FontConfig, Error>} An effect that resolves to the
 *   font configuration or an error if the font could not be loaded.
 */
const loadFont = (
  face: (typeof ProfileFonts)[number],
): Effect.Effect<FontConfig, Error> =>
  Effect.tryPromise({
    catch: (cause: unknown): Error =>
      new Error(ProfileErrors.readFont(face.file), { cause }),
    try: async (): Promise<FontConfig> => ({
      data: new Uint8Array(
        await readFile(`${ProfileAssets.fontDirectory}/${face.file}`),
      ).buffer,
      name: face.name,
      weight: face.weight,
    }),
  });

/**
 * Renders the profile SVG with the specified avatar path and returns an effect
 * that resolves to the rendered SVG as a string.
 *
 * @param {string} avatarPath - The path to the avatar image to be used in the
 *   profile.
 * @returns {Effect.Effect<string, Error | RenderError>} An effect that resolves
 *   to the rendered SVG as a string or an error if rendering fails.
 */
const renderProfile = (
  avatarPath: string,
): Effect.Effect<string, Error | RenderError> =>
  Effect.gen(function* () {
    const renderer = yield* RenderService;
    const portrait: string = yield* renderPortrait(avatarPath);
    const fonts: readonly FontConfig[] = yield* Effect.forEach(
      ProfileFonts,
      loadFont,
    );
    const palettes = yield* loadTheme();
    // Render the readme with the portrait and optimize the resulting SVG.
    const svg: string = yield* renderer.renderSVG(makeReadme(portrait), {
      fonts,
      tailwindConfig: (theme: ThemeVariant) =>
        createSvgTailwindConfig(palettes[theme]),
      width: ProfileViewport.width,
    });
    return yield* optimizeSvg(svg);
  }).pipe(Effect.provide(RenderServiceLive));

/**
 * Generates the profile by rendering the profile SVG and README, creating the
 * output directory, and writing the rendered files to the specified output
 * directory.
 *
 * @param {GenerateOptions} options - The options for generating the profile,
 *   including the avatar path and output directory.
 * @returns {Effect.Effect<void, Error | RenderError>} An effect that resolves
 *   when the profile has been generated or an error if generation fails.
 */
const generateProfile = (
  options: GenerateOptions,
): Effect.Effect<void, Error | RenderError> =>
  Effect.gen(function* () {
    const rendered: string = yield* renderProfile(options.avatarPath);
    const readme: string = yield* renderReadme();
    // Create the output directory and write the rendered SVG and README to the
    // specified output directory.
    yield* Effect.tryPromise({
      catch: (cause: unknown): Error =>
        new Error(ProfileErrors.createDirectory, { cause }),
      try: (): Promise<string | undefined> =>
        mkdir(`${options.outputDir}/${ProfileAssets.directory}`, {
          recursive: true,
        }),
    });
    // Write the rendered SVG to the output directory.
    yield* Effect.tryPromise({
      catch: (cause: unknown): Error =>
        new Error(ProfileErrors.writeSvg, { cause }),
      try: (): Promise<number> =>
        Bun.write(`${options.outputDir}/${ProfileAssets.output}`, rendered),
    });
    // Write the rendered README to the output directory.
    yield* Effect.tryPromise({
      catch: (cause: unknown): Error =>
        new Error(ProfileErrors.writeReadme, { cause }),
      try: (): Promise<number> =>
        Bun.write(`${options.outputDir}/${ProfileAssets.readme}`, readme),
    });
  });

export { generateProfile, renderProfile };
