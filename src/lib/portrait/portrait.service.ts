import { Effect } from "effect";
import Sharp from "sharp";
import {
  PortraitErrors,
  PortraitMetrics,
  PortraitPng,
} from "@/lib/portrait/portrait.constants.ts";

/**
 * Renders a portrait image from the given source.
 *
 * @param {string | Buffer} source - The source image to be rendered.
 * @returns {Effect.Effect<string, Error>} An effect that resolves to the
 *   rendered portrait as a base64-encoded string or an error if rendering
 *   fails.
 */
const renderPortrait = (
  source: string | Buffer,
): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    catch: (cause: unknown): Error =>
      new Error(PortraitErrors.render, { cause }),
    try: async (): Promise<string> => {
      const png: Buffer = await Sharp(source)
        // Convert the image to the correct orientation.
        .autoOrient()
        // Resize the image to the specified size while maintaining aspect
        // ratio and without enlarging it.
        .resize(PortraitMetrics.size, PortraitMetrics.size, {
          fit: "cover",
          withoutEnlargement: true,
        })
        // Convert the image to grayscale.
        .greyscale()
        .png(PortraitPng)
        .toBuffer();
      return `${PortraitMetrics.mediaType}${png.toString("base64")}`;
    },
  });

export { renderPortrait };
