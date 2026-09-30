import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  DataUri,
  Encoding,
  Files,
  FixtureErrors,
  Xml,
} from "@test/fixtures.constants.ts";
import { DOMParser, type Element, onErrorStopParsing } from "@xmldom/xmldom";
import { Effect, Option, type Scope } from "effect";

const temporaryDirectory: Effect.Effect<string, never, Scope.Scope> =
  Effect.acquireRelease(
    Effect.promise(
      (): Promise<string> => mkdtemp(join(tmpdir(), Files.prefix)),
    ),
    (directory: string): Effect.Effect<void> =>
      Effect.promise(
        (): Promise<void> => rm(directory, { force: true, recursive: true }),
      ),
  );

const parseXml = (markup: string): Element =>
  Option.getOrThrowWith(
    Option.fromNullable(
      new DOMParser({ onError: onErrorStopParsing }).parseFromString(
        markup,
        Xml.mimeType,
      ).documentElement,
    ),
    (): Error => new Error(FixtureErrors.root),
  );

const attribute = (element: Element, name: string): string =>
  Option.getOrThrowWith(
    Option.fromNullable(element.getAttribute(name)),
    (): Error => new Error(FixtureErrors.attribute(name)),
  );

const decodeImage = (source: string): Buffer => {
  for (const prefix of [DataUri.png, DataUri.svgBase64]) {
    if (source.startsWith(prefix))
      return Buffer.from(source.slice(prefix.length), Encoding.base64);
  }
  if (source.startsWith(DataUri.svg))
    return Buffer.from(
      decodeURIComponent(source.slice(DataUri.svg.length)),
      Encoding.utf8,
    );
  throw new Error(FixtureErrors.dataUri);
};

export { attribute, decodeImage, parseXml, temporaryDirectory };
