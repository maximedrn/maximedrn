import type { Element } from "@xmldom/xmldom";
import { Effect, Option } from "effect";
import Sharp from "sharp";
import {
  SvgAttributes,
  SvgDataUri,
  SvgErrors,
  SvgRasterConcurrency,
  SvgTags,
  SvgWebpOptions,
} from "@/lib/svg/svg.constants.ts";
import { attributeOf, elementsOf } from "@/lib/svg/svg.document.ts";

const ComparedColorSpace = "srgb";

/**
 * Decodes an image to straight RGBA pixels, so that two encodings of the same
 * picture can be compared byte for byte.
 *
 * @param {Buffer} image - The encoded image.
 * @returns {Promise<Buffer>} Its RGBA pixels.
 */
const pixelsOf = (image: Buffer): Promise<Buffer> =>
  Sharp(image).toColourspace(ComparedColorSpace).ensureAlpha().raw().toBuffer();

/**
 * Re-encodes an embedded PNG as lossless WebP, keeping the PNG unless the WebP
 * is smaller and decodes to exactly the same pixels.
 *
 * @param {Element} image - An `<image>` embedding a PNG data URI.
 * @param {string} href - Its PNG data URI.
 * @returns {Effect.Effect<void, Error>} An effect that swaps the data URI.
 */
const compressImage = (
  image: Element,
  href: string,
): Effect.Effect<void, Error> =>
  Effect.tryPromise({
    catch: (cause: unknown): Error => new Error(SvgErrors.optimize, { cause }),
    try: async (): Promise<void> => {
      const png: Buffer = Buffer.from(
        href.slice(SvgDataUri.png.length),
        "base64",
      );
      const webp: Buffer = await Sharp(png).webp(SvgWebpOptions).toBuffer();
      if (webp.length >= png.length) return;
      const [expected, actual]: [Buffer, Buffer] = await Promise.all([
        pixelsOf(png),
        pixelsOf(webp),
      ]);
      if (expected.equals(actual))
        image.setAttribute(
          SvgAttributes.href,
          `${SvgDataUri.webp}${webp.toString("base64")}`,
        );
    },
  });

/**
 * Re-encodes every embedded PNG as lossless WebP when that is smaller. The
 * pixels are compared after decoding, so the swap never changes the picture.
 * Satori only lays out PNG and JPEG images, so this has to happen after it.
 *
 * @param {Element} root - The document root.
 * @returns {Effect.Effect<void, Error>} An effect that re-encodes the images.
 */
const compressRasters = (root: Element): Effect.Effect<void, Error> =>
  Effect.forEach(
    elementsOf(root, SvgTags.image).flatMap(
      (image: Element): [Element, string][] =>
        Option.toArray(
          Option.map(
            Option.filter(
              attributeOf(image, SvgAttributes.href),
              (href: string): boolean => href.startsWith(SvgDataUri.png),
            ),
            (href: string): [Element, string] => [image, href],
          ),
        ),
    ),
    ([image, href]: [Element, string]): Effect.Effect<void, Error> =>
      compressImage(image, href),
    { concurrency: SvgRasterConcurrency, discard: true },
  );

export { compressRasters };
