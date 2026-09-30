import { describe, expect, it } from "bun:test";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DataUri, Encoding, Files, Xml } from "@test/fixtures.constants.ts";
import {
  attribute,
  decodeImage,
  parseXml,
  temporaryDirectory,
} from "@test/fixtures.ts";
import { coloredImage } from "@test/portrait-fixture.ts";
import { ProfileCases, ProfileExpected } from "@test/profile.constants.ts";
import type { Element } from "@xmldom/xmldom";
import { Effect } from "effect";
import { generateProfile } from "@/lib/profile/profile.service.ts";

describe(ProfileCases.suite, (): void => {
  it(
    ProfileCases.generate,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const directory: string = yield* temporaryDirectory;
            const avatarPath: string = join(directory, Files.input);
            const outputDir: string = join(directory, Files.output);
            const source: Buffer = yield* coloredImage;
            yield* Effect.promise(
              (): Promise<void> => writeFile(avatarPath, source),
            );
            yield* generateProfile({ avatarPath, outputDir });
            const files: string[] = yield* Effect.promise(() =>
              readdir(outputDir),
            );
            expect(new Set(files)).toEqual(new Set(ProfileExpected.files));
            const readme: string = yield* Effect.promise(() =>
              readFile(join(outputDir, Files.readme), Encoding.utf8),
            );
            expect(attribute(parseXml(readme), Xml.attributes.src)).toBe(
              ProfileExpected.image,
            );
            const markup: string = yield* Effect.promise(() =>
              readFile(join(outputDir, Files.svg), Encoding.utf8),
            );
            const svg: Element = parseXml(markup);
            expect(svg.tagName).toBe(Xml.tags.svg);
            expect(Number(attribute(svg, Xml.attributes.width))).toBe(
              ProfileExpected.width,
            );
            const themes: string[] = Array.from(
              svg.getElementsByTagName(Xml.tags.group),
            )
              .filter((element: Element): boolean =>
                element.hasAttribute(Xml.attributes.className),
              )
              .map((element: Element): string =>
                attribute(element, Xml.attributes.className),
              );
            expect(themes).toEqual(
              expect.arrayContaining([...ProfileExpected.themes]),
            );
            const images: Element[] = Array.from(
              svg.getElementsByTagName(Xml.tags.image),
            );
            expect(images.length).toBeGreaterThan(0);
            let portraits: number = 0;
            for (const image of images) {
              const layer: Element = parseXml(
                decodeImage(attribute(image, Xml.attributes.href)).toString(
                  Encoding.utf8,
                ),
              );
              const nested: Element[] = Array.from(
                layer.getElementsByTagName(Xml.tags.image),
              );
              portraits += nested.filter((element: Element): boolean =>
                attribute(element, Xml.attributes.href).startsWith(DataUri.png),
              ).length;
            }
            expect(portraits).toBeGreaterThan(0);
          }),
        ),
      ),
  );
  it(
    ProfileCases.failure,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.scoped(
          Effect.gen(function* () {
            const directory: string = yield* temporaryDirectory;
            const outputDir: string = join(directory, Files.output);
            yield* Effect.flip(
              generateProfile({
                avatarPath: join(directory, Files.missing),
                outputDir,
              }),
            );
            const files: string[] = yield* Effect.promise(() =>
              readdir(directory),
            );
            expect(files).toEqual([]);
          }),
        ),
      ),
  );
});
