import { describe, expect, it } from "bun:test";
import { DataUri, Encoding, Text, Xml } from "@test/fixtures.constants.ts";
import { attribute, decodeImage, parseXml } from "@test/fixtures.ts";
import {
  CssSyntax,
  SvgCases,
  SvgExpected,
  SvgInput,
} from "@test/svg.constants.ts";
import type { Element } from "@xmldom/xmldom";
import { Effect } from "effect";
import { type AtRule, type Declaration, parse, type Root } from "postcss";
import Sharp from "sharp";
import { optimizeSvg } from "@/lib/svg/svg.service.ts";

const source: string = SvgInput.document(
  `${DataUri.svgBase64}${Buffer.from(SvgInput.layer).toString(Encoding.base64)}`,
);

describe(SvgCases.suite, (): void => {
  it(
    SvgCases.layers,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const optimized: string = yield* optimizeSvg(source);
          const root: Element = parseXml(optimized);
          const groups: string[] = Array.from(
            root.getElementsByTagName(Xml.tags.all),
          )
            .filter((group: Element): boolean =>
              group.hasAttribute(Xml.attributes.className),
            )
            .map((group: Element): string =>
              attribute(group, Xml.attributes.className),
            );
          expect(new Set(groups)).toEqual(new Set(SvgExpected.themes));
          const images: Element[] = Array.from(
            root.getElementsByTagName(Xml.tags.image),
          );
          expect(images).toHaveLength(SvgExpected.imageCount);
          for (const image of images) {
            const href: string = attribute(image, Xml.attributes.href);
            expect(href.startsWith(DataUri.svg)).toBe(true);
            const layer: Element = parseXml(
              decodeImage(href).toString(Encoding.utf8),
            );
            expect(layer.tagName).toBe(Xml.tags.svg);
            const pixels: Buffer = yield* Effect.promise(() =>
              Sharp(decodeImage(href)).removeAlpha().raw().toBuffer(),
            );
            expect([...pixels.subarray(0, SvgExpected.color.length)]).toEqual([
              ...SvgExpected.color,
            ]);
          }
        }),
      ),
  );
  it(
    SvgCases.motion,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const optimized: string = yield* optimizeSvg(source);
          const root: Element = parseXml(optimized);
          const css: Root = parse(
            Array.from(root.getElementsByTagName(Xml.tags.style))
              .map(
                (element: Element): string => element.textContent ?? Text.empty,
              )
              .join(Text.newline),
          );
          const motion: Map<string, Declaration> = new Map();
          const defaultDark: Declaration[] = [];
          const keyframes: AtRule[] = [];
          css.walkRules(CssSyntax.darkSelector, (rule): void => {
            if (rule.parent === css)
              rule.walkDecls(
                CssSyntax.display,
                (declaration: Declaration): void => {
                  defaultDark.push(declaration);
                },
              );
          });
          css.walkAtRules(CssSyntax.keyframes, (rule: AtRule): void => {
            keyframes.push(rule);
          });
          css.walkAtRules(CssSyntax.media, (rule: AtRule): void => {
            if (
              rule.params.replace(CssSyntax.space, Text.empty) ===
              CssSyntax.reduce
            )
              rule.walkRules(CssSyntax.animatedSelector, (animated): void => {
                animated.walkDecls((declaration: Declaration): void => {
                  motion.set(declaration.prop, declaration);
                });
              });
          });
          expect(keyframes.length).toBeGreaterThan(0);
          expect(defaultDark).toHaveLength(1);
          expect(defaultDark[0]?.value).toBe(CssSyntax.none);
          expect(motion.get(CssSyntax.animation)).toMatchObject({
            important: true,
            value: CssSyntax.none,
          });
          expect(motion.get(CssSyntax.transform)).toMatchObject({
            important: true,
            value: CssSyntax.none,
          });
          expect(motion.get(CssSyntax.opacity)).toMatchObject({
            important: true,
            value: CssSyntax.opacityValue,
          });
          expect(optimized).toContain(CssSyntax.infinite);
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
