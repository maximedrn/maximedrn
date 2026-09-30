import { Effect } from "effect";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server.edge";
import { optimize } from "svgo";
import { SvgReducedMotionStyle } from "@/components/svg/svg.reduced-motion-style.tsx";
import {
  SvgDataUriConfig,
  SvgEmbeddedPattern,
  SvgErrors,
  SvgOptimizationConfig,
} from "@/lib/svg/svg.constants.ts";

/**
 * Optimizes a base64-encoded SVG layer by decoding it, applying SVGO
 * optimizations, and returning the optimized SVG as a base64-encoded string.
 *
 * @param {string} encoded - The base64-encoded SVG layer to be optimized.
 * @returns {string} The optimized SVG layer as a base64-encoded string.
 */
const optimizeLayer = (encoded: string): string => {
  const source: string = Buffer.from(encoded, "base64").toString("utf8");
  return optimize(source, SvgDataUriConfig).data;
};

/**
 * Optimizes the given SVG string by applying SVGO optimizations and handling
 * embedded base64-encoded SVG layers. The optimization process includes:
 * - Decoding and optimizing any embedded base64-encoded SVG layers.
 * - Adding a reduced motion style to the SVG for accessibility.
 * - Applying general SVGO optimizations to the entire SVG.
 *
 * @param {string} svg - The SVG string to be optimized.
 * @returns {Effect.Effect<string, Error>} An effect that resolves to the
 *   optimized SVG string or an error if optimization fails.
 */
const optimizeSvg = (svg: string): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    catch: (cause: unknown): Error => new Error(SvgErrors.optimize, { cause }),
    try: async (): Promise<string> => {
      const layers: string = svg.replace(
        SvgEmbeddedPattern,
        (_match: string, encoded: string): string => optimizeLayer(encoded),
      );
      const style: string = await new Response(
        await renderToReadableStream(createElement(SvgReducedMotionStyle)),
      ).text();
      const accessible: string = layers.replace("</svg>", `${style}</svg>`);
      return optimize(accessible, SvgOptimizationConfig).data;
    },
  });

export { optimizeSvg };
