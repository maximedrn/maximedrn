import { describe, expect, it } from "bun:test";
import { DataUri, Encoding, Xml } from "@test/fixtures.constants.ts";
import { attribute, parseXml, renderPixel } from "@test/fixtures.ts";
import {
  SvgCases,
  SvgColors,
  SvgExpected,
  SvgInput,
} from "@test/svg.constants.ts";
import type { Element } from "@xmldom/xmldom";
import { Effect } from "effect";
import Sharp from "sharp";
import { optimizeSvg } from "@/lib/svg/svg.service.ts";

const count = (root: Element, tag: string): number =>
  root.getElementsByTagName(tag).length;

describe(SvgCases.suite, (): void => {
  it(
    SvgCases.layers,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const optimized: string = yield* optimizeSvg(
            SvgInput.document(
              SvgInput.layer(SvgColors.light, SvgInput.sameWidth),
              SvgInput.layer(SvgColors.dark, SvgInput.sameWidth),
            ),
          );
          expect(count(parseXml(optimized), Xml.tags.image)).toBe(0);
          for (const pixel of Object.values(SvgExpected.pixel)) {
            const color: number[] = yield* renderPixel(optimized, pixel);
            expect(color).toEqual([...SvgExpected.light]);
          }
        }),
      ),
  );
  it(
    SvgCases.invisible,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const root: Element = parseXml(
            yield* optimizeSvg(SvgInput.invisible),
          );
          expect(count(root, Xml.tags.filter)).toBe(SvgExpected.visibleFilters);
          expect(count(root, Xml.tags.mask)).toBe(0);
          expect(count(root, Xml.tags.pattern)).toBe(0);
          expect(count(root, Xml.tags.linearGradient)).toBe(0);
        }),
      ),
  );
  it(
    SvgCases.classPainted,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const root: Element = parseXml(
            yield* optimizeSvg(SvgInput.classPainted),
          );
          expect(count(root, Xml.tags.rect) + count(root, Xml.tags.path)).toBe(
            SvgExpected.classPaintedShapes,
          );
        }),
      ),
  );
  it(
    SvgCases.raster,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const size: number = SvgInput.rasterSize;
          const pixels: Buffer = Buffer.alloc(
            size * size * SvgExpected.rasterChannels,
          );
          for (let offset: number = 0; offset < pixels.length; offset += 1)
            pixels[offset] =
              offset % SvgExpected.rasterChannels === 2
                ? SvgExpected.rasterColor
                : (Math.floor(offset / SvgExpected.rasterChannels) % size) *
                  SvgInput.rasterStep;
          const png: Buffer = yield* Effect.promise(
            (): Promise<Buffer> =>
              Sharp(pixels, {
                raw: {
                  channels: SvgExpected.rasterChannels,
                  height: size,
                  width: size,
                },
              })
                .png()
                .toBuffer(),
          );
          const root: Element = parseXml(
            yield* optimizeSvg(
              SvgInput.raster(`${DataUri.png}${png.toString(Encoding.base64)}`),
            ),
          );
          const images: Element[] = Array.from(
            root.getElementsByTagName(Xml.tags.image),
          );
          expect(images).toHaveLength(1);
          const href: string = attribute(
            images[0] ?? root,
            Xml.attributes.href,
          );
          expect(href.startsWith(DataUri.webp)).toBe(true);
          const decoded: Buffer = yield* Effect.promise(
            (): Promise<Buffer> =>
              Sharp(
                Buffer.from(href.slice(DataUri.webp.length), Encoding.base64),
              )
                .removeAlpha()
                .raw()
                .toBuffer(),
          );
          expect(decoded.equals(pixels)).toBe(true);
        }),
      ),
  );
  it(
    SvgCases.invalid,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const failure: Error = yield* Effect.flip(
            optimizeSvg(SvgInput.invalid),
          );
          expect(failure.cause).toBeInstanceOf(Error);
        }),
      ),
  );
});
