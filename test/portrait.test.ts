import { describe, expect, it } from "bun:test";
import { decodeImage } from "@test/fixtures.ts";
import {
  ImageColorSpace,
  PortraitCases,
  PortraitExpected,
  PortraitInput,
} from "@test/portrait.constants.ts";
import { coloredImage } from "@test/portrait-fixture.ts";
import { Effect } from "effect";
import Sharp, { type Metadata, type OutputInfo } from "sharp";
import { renderPortrait } from "@/lib/portrait/portrait.service.ts";

describe(PortraitCases.suite, (): void => {
  it(
    PortraitCases.grayscale,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const source: Buffer = yield* coloredImage;
          const portrait: string = yield* renderPortrait(source);
          const decoded: { data: Buffer; info: OutputInfo } =
            yield* Effect.promise(() =>
              Sharp(decodeImage(portrait))
                .toColourspace(ImageColorSpace)
                .removeAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true }),
            );
          expect(decoded.info.channels).toBe(
            PortraitExpected.grayscaleChannels,
          );
          const tones: Set<number> = new Set();
          for (
            let offset: number = 0;
            offset < decoded.data.length;
            offset += decoded.info.channels
          ) {
            expect(decoded.data[offset]).toBe(decoded.data[offset + 1]);
            expect(decoded.data[offset]).toBe(decoded.data[offset + 2]);
            tones.add(decoded.data.readUInt8(offset));
          }
          expect(tones.size).toBeGreaterThan(1);
        }),
      ),
  );
  it(
    PortraitCases.small,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const source: Buffer = yield* coloredImage;
          const portrait: string = yield* renderPortrait(source);
          const metadata: Metadata = yield* Effect.promise(() =>
            Sharp(decodeImage(portrait)).metadata(),
          );
          expect(metadata).toMatchObject({
            ...PortraitExpected.small,
            format: PortraitExpected.format,
          });
        }),
      ),
  );
  it(
    PortraitCases.resize,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const source: Buffer = yield* Effect.promise(() =>
            Sharp({
              create: {
                ...PortraitInput.large,
                background: PortraitInput.color,
                channels: PortraitInput.channels,
              },
            })
              .png()
              .toBuffer(),
          );
          const portrait: string = yield* renderPortrait(source);
          const metadata: Metadata = yield* Effect.promise(() =>
            Sharp(decodeImage(portrait)).metadata(),
          );
          expect(metadata).toMatchObject({
            height: PortraitExpected.largeSize,
            width: PortraitExpected.largeSize,
          });
        }),
      ),
  );
  it(
    PortraitCases.orientation,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const source: Buffer = yield* Effect.promise(() =>
            Sharp({
              create: {
                ...PortraitInput.rotated,
                background: PortraitInput.color,
                channels: PortraitInput.channels,
              },
            })
              .withMetadata({ orientation: PortraitInput.orientation })
              .png()
              .toBuffer(),
          );
          const portrait: string = yield* renderPortrait(source);
          const metadata: Metadata = yield* Effect.promise(() =>
            Sharp(decodeImage(portrait)).metadata(),
          );
          expect(metadata).toMatchObject(PortraitExpected.rotated);
          expect(metadata.orientation).toBeUndefined();
        }),
      ),
  );
  it(
    PortraitCases.invalid,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const failure: Error = yield* Effect.flip(
            renderPortrait(Buffer.from(PortraitInput.invalid)),
          );
          expect(failure.cause).toBeInstanceOf(Error);
        }),
      ),
  );
});
