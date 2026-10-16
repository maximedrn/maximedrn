import { expect, it } from "bun:test";
import {
  type IRenderService,
  makeRenderService,
} from "@maximedrn/react-to-svg";
import { Xml } from "@test/fixtures.constants.ts";
import { parseXml } from "@test/fixtures.ts";
import {
  TailwindCase,
  TailwindExpected,
  TailwindFixture,
} from "@test/tailwind.constants.ts";
import { TailwindPanel } from "@test/tailwind-fixture.tsx";
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
        expect(parseXml(svg).getElementsByTagName(Xml.tags.image)).toHaveLength(
          0,
        );
        const decoded: { data: Buffer; info: OutputInfo } =
          yield* Effect.promise(() =>
            Sharp(Buffer.from(svg))
              .ensureAlpha()
              .raw()
              .toBuffer({ resolveWithObject: true }),
          );
        expect(decoded.info.channels).toBe(TailwindExpected.channels);
        const gapOffset: number = TailwindExpected.gapX * decoded.info.channels;
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
      }),
    ),
);
