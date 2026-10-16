import type { Element } from "@xmldom/xmldom";
import { Effect } from "effect";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server.edge";
import { optimize } from "svgo";
import { SvgReducedMotionStyle } from "@/components/svg/svg.reduced-motion-style.tsx";
import { removeInvisiblePaint } from "@/lib/svg/svg.clean.ts";
import { SvgErrors, SvgOptimizationConfig } from "@/lib/svg/svg.constants.ts";
import {
  createIdAllocator,
  parseSvgRoot,
  serializeSvg,
} from "@/lib/svg/svg.document.ts";
import { inlineImages } from "@/lib/svg/svg.layers.ts";
import { compressRasters } from "@/lib/svg/svg.raster.ts";
import {
  pruneKeyframes,
  readStylesheets,
  writeStylesheets,
} from "@/lib/svg/svg.styles.ts";
import { mergeThemes } from "@/lib/svg/svg.themes.ts";

const ClosingTag = "</svg>";

/**
 * Flattens the document: every embedded SVG layer is inlined, the paint that
 * can never be seen is removed, the two themes are merged when they only
 * differ by colors, and the keyframes left duplicated or unused are pruned.
 *
 * @param {Element} root - The document root, edited in place.
 */
const restructure = (root: Element): void => {
  inlineImages(root, createIdAllocator(root));
  removeInvisiblePaint(root);
  mergeThemes(root);
  const sheets = readStylesheets(root);
  pruneKeyframes(root, sheets);
  writeStylesheets(sheets);
};

/**
 * Renders the stylesheet that disables the animations for users who prefer
 * reduced motion.
 *
 * @returns {Effect.Effect<string, Error>} An effect that resolves to the
 *   `<style>` markup.
 */
const renderReducedMotionStyle = (): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    catch: (cause: unknown): Error => new Error(SvgErrors.optimize, { cause }),
    try: async (): Promise<string> =>
      await new Response(
        await renderToReadableStream(createElement(SvgReducedMotionStyle)),
      ).text(),
  });

/**
 * Optimizes the given SVG string. The optimization process includes:
 * - Inlining the SVG layers and icons embedded as data URIs, so the browser
 *   parses a single document and the optimizer sees all of it.
 * - Removing the invisible filters, masks and patterns Satori emits.
 * - Merging the light and dark themes into one drawing with themed colors.
 * - Re-encoding embedded PNG images as pixel-identical lossless WebP.
 * - Adding a reduced motion style to the SVG for accessibility.
 * - Applying general SVGO optimizations to the entire SVG.
 *
 * @param {string} svg - The SVG string to be optimized.
 * @returns {Effect.Effect<string, Error>} An effect that resolves to the
 *   optimized SVG string or an error if optimization fails.
 */
const optimizeSvg = (svg: string): Effect.Effect<string, Error> =>
  Effect.gen(function* () {
    const root: Element = yield* Effect.try({
      catch: (cause: unknown): Error => new Error(SvgErrors.parse, { cause }),
      try: (): Element => {
        const parsed: Element = parseSvgRoot(svg);
        restructure(parsed);
        return parsed;
      },
    });
    yield* compressRasters(root);
    const style: string = yield* renderReducedMotionStyle();
    const markup: string = serializeSvg(root);
    const end: number = markup.lastIndexOf(ClosingTag);
    return yield* Effect.try({
      catch: (cause: unknown): Error =>
        new Error(SvgErrors.optimize, { cause }),
      try: (): string =>
        optimize(
          `${markup.slice(0, end)}${style}${markup.slice(end)}`,
          SvgOptimizationConfig,
        ).data,
    });
  });

export { optimizeSvg };
