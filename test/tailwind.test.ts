import { expect, it } from "bun:test";
import {
  type IRenderService,
  makeRenderService,
} from "@maximedrn/react-to-svg";
import { Xml } from "@test/fixtures.constants.ts";
import { attribute, decodeImage, parseXml } from "@test/fixtures.ts";
import {
  TailwindCase,
  TailwindExpected,
  TailwindFixture,
} from "@test/tailwind.constants.ts";
import { TailwindPanel } from "@test/tailwind-fixture.tsx";
import type { Element } from "@xmldom/xmldom";
import { Effect } from "effect";
import Sharp, { type OutputInfo } from "sharp";
import { createSvgTailwindConfig } from "@/lib/svg/svg.tailwind.ts";

it(
  TailwindCase,
  (): Promise<void> =>
    Effect.runPromise(
      Effect.gen(function* () {
        const renderer: IRenderService = makeRenderService();
        const svg: string = yield* renderer.renderSVG(TailwindPanel, {
          ...TailwindFixture.frame,
          fonts: [],
          tailwindConfig: createSvgTailwindConfig(TailwindFixture.colors),
        });
        const root: Element = parseXml(svg);
        const images: Element[] = Array.from(
          root.getElementsByTagName(Xml.tags.image),
        );
        expect(images.length).toBeGreaterThan(0);
        for (const image of images) {
          const decoded: { data: Buffer; info: OutputInfo } =
            yield* Effect.promise(() =>
              Sharp(decodeImage(attribute(image, Xml.attributes.href)))
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true }),
            );
          expect(decoded.info.channels).toBe(TailwindExpected.channels);
          const gapOffset: number =
            TailwindExpected.gapX * decoded.info.channels;
          const colorOffset: number =
            TailwindExpected.secondBoxX * decoded.info.channels;
          expect([
            ...decoded.data.subarray(
              gapOffset,
              gapOffset + decoded.info.channels,
            ),
          ]).toEqual([...TailwindExpected.gap]);
          expect([
            ...decoded.data.subarray(
              colorOffset,
              colorOffset + decoded.info.channels,
            ),
          ]).toEqual([...TailwindExpected.painted]);
        }
      }),
    ),
);
