import { describe, expect, it } from "bun:test";
import { Text, Xml } from "@test/fixtures.constants.ts";
import { attribute, parseXml, renderPixel } from "@test/fixtures.ts";
import {
  CssSyntax,
  SvgCases,
  SvgColors,
  SvgExpected,
  SvgInput,
} from "@test/svg.constants.ts";
import type { Element } from "@xmldom/xmldom";
import { Effect } from "effect";
import {
  type AtRule,
  type ChildNode,
  type Declaration,
  parse,
  type Root,
} from "postcss";
import { optimizeSvg } from "@/lib/svg/svg.service.ts";

const merged: Effect.Effect<string, Error> = optimizeSvg(
  SvgInput.document(
    SvgInput.layer(SvgColors.light, SvgInput.sameWidth),
    SvgInput.layer(SvgColors.dark, SvgInput.sameWidth),
  ),
);

const stylesheetOf = (markup: string): Root =>
  parse(
    Array.from(parseXml(markup).getElementsByTagName(Xml.tags.style))
      .map((element: Element): string => element.textContent ?? Text.empty)
      .join(Text.newline),
  );

const classesOf = (markup: string): string[] =>
  Array.from(parseXml(markup).getElementsByTagName(Xml.tags.all))
    .filter((element: Element): boolean =>
      element.hasAttribute(Xml.attributes.className),
    )
    .flatMap((element: Element): string[] =>
      attribute(element, Xml.attributes.className).split(CssSyntax.space),
    );

// Applies the dark color scheme by hoisting its rules out of the media query.
const asDark = (markup: string): string => {
  const css: Root = stylesheetOf(markup);
  css.walkAtRules(CssSyntax.media, (rule: AtRule): void => {
    if (
      rule.params.replace(CssSyntax.space, Text.empty) === SvgExpected.darkMedia
    )
      rule.replaceWith(
        ...(rule.nodes ?? []).map((node: ChildNode) => node.clone()),
      );
  });
  return markup.replace(
    CssSyntax.styleElement,
    `<style>${css.toString()}</style>`,
  );
};

describe(SvgCases.suite, (): void => {
  it(
    SvgCases.themes,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const optimized: string = yield* merged;
          const classes: string[] = classesOf(optimized);
          for (const theme of SvgExpected.themes)
            expect(classes).not.toContain(theme);
          expect(
            classes.some((name: string): boolean =>
              SvgExpected.colorClass.test(name),
            ),
          ).toBe(true);
          for (const pixel of Object.values(SvgExpected.pixel)) {
            const light: number[] = yield* renderPixel(optimized, pixel);
            const dark: number[] = yield* renderPixel(asDark(optimized), pixel);
            expect(light).toEqual([...SvgExpected.light]);
            expect(dark).toEqual([...SvgExpected.dark]);
          }
          const keyframes: AtRule[] = [];
          stylesheetOf(optimized).walkAtRules(
            CssSyntax.keyframes,
            (rule: AtRule): void => {
              keyframes.push(rule);
            },
          );
          expect(keyframes).toHaveLength(SvgExpected.keyframes);
        }),
      ),
  );
  it(
    SvgCases.distinct,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const optimized: string = yield* optimizeSvg(
            SvgInput.document(
              SvgInput.layer(SvgColors.light, SvgInput.sameWidth),
              SvgInput.layer(SvgColors.dark, SvgInput.shorterWidth),
            ),
          );
          expect(new Set(classesOf(optimized))).toEqual(
            new Set(SvgExpected.themes),
          );
          const defaultDark: Declaration[] = [];
          const css: Root = stylesheetOf(optimized);
          css.walkRules(CssSyntax.darkSelector, (rule): void => {
            if (rule.parent === css)
              rule.walkDecls(
                CssSyntax.display,
                (declaration: Declaration): void => {
                  defaultDark.push(declaration);
                },
              );
          });
          expect(defaultDark).toHaveLength(1);
          expect(defaultDark[0]?.value).toBe(CssSyntax.none);
        }),
      ),
  );
  it(
    SvgCases.motion,
    (): Promise<void> =>
      Effect.runPromise(
        Effect.gen(function* () {
          const optimized: string = yield* merged;
          const css: Root = stylesheetOf(optimized);
          const motion: Map<string, Declaration> = new Map();
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
});
