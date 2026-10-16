import type { Element } from "@xmldom/xmldom";
import { Option, Predicate } from "effect";
import { type AtRule, type Declaration, parse, type Rule } from "postcss";
import {
  SvgAttributes,
  SvgPaintProperties,
  SvgPatterns,
  SvgTags,
} from "@/lib/svg/svg.constants.ts";
import { attributeOf, elementsOf } from "@/lib/svg/svg.document.ts";
import type { SvgStylesheet } from "@/lib/svg/svg.types.ts";

const KeyframesRule = "keyframes";
const AnimationProperty = /^animation(?:-name)?$/;
const DeclarationSeparator = ";";
const PropertySeparator = ":";

/**
 * Parses every `<style>` element of a document.
 *
 * @param {Element} root - The document root.
 * @returns {readonly SvgStylesheet[]} The stylesheets, in document order.
 */
const readStylesheets = (root: Element): readonly SvgStylesheet[] =>
  elementsOf(root, SvgTags.style).map(
    (element: Element): SvgStylesheet => ({
      css: parse(element.textContent ?? ""),
      element,
    }),
  );

/**
 * Writes the stylesheets back into their `<style>` elements.
 *
 * @param {readonly SvgStylesheet[]} sheets - The edited stylesheets.
 */
const writeStylesheets = (sheets: readonly SvgStylesheet[]): void => {
  for (const sheet of sheets) sheet.element.textContent = sheet.css.toString();
};

/**
 * Lists the `@keyframes` rules of the stylesheets.
 *
 * @param {readonly SvgStylesheet[]} sheets - The stylesheets.
 * @returns {readonly AtRule[]} The `@keyframes` rules.
 */
const keyframesRules = (sheets: readonly SvgStylesheet[]): readonly AtRule[] =>
  sheets.flatMap((sheet: SvgStylesheet): AtRule[] => {
    const rules: AtRule[] = [];
    sheet.css.walkAtRules(KeyframesRule, (rule: AtRule): void => {
      rules.push(rule);
    });
    return rules;
  });

/**
 * Reads the body of a `@keyframes` rule in a canonical form, so that two
 * rules describing the same motion compare equal.
 *
 * @param {AtRule} rule - The `@keyframes` rule.
 * @returns {string} Its body, whitespace-normalized.
 */
const keyframesBody = (rule: AtRule): string =>
  (rule.nodes ?? [])
    .map((node): string => node.toString())
    .join("")
    .replace(SvgPatterns.space, "");

/**
 * Maps every `@keyframes` name to its canonical body.
 *
 * @param {readonly SvgStylesheet[]} sheets - The stylesheets.
 * @returns {ReadonlyMap<string, string>} The bodies, keyed by name.
 */
const keyframesOf = (
  sheets: readonly SvgStylesheet[],
): ReadonlyMap<string, string> =>
  new Map(
    keyframesRules(sheets).map((rule: AtRule): [string, string] => [
      rule.params,
      keyframesBody(rule),
    ]),
  );

/**
 * Rewrites the animation names an inline style refers to.
 *
 * @param {string} style - The inline style.
 * @param {ReadonlySet<string>} names - The known `@keyframes` names.
 * @param {(name: string) => string} rename - Maps a name to its replacement.
 * @returns {string} The style with its animation names rewritten.
 */
const mapAnimationNames = (
  style: string,
  names: ReadonlySet<string>,
  rename: (name: string) => string,
): string =>
  style
    .split(DeclarationSeparator)
    .map((declaration: string): string => {
      const colon: number = declaration.indexOf(PropertySeparator);
      const property: string = declaration.slice(0, colon).trim();
      return AnimationProperty.test(property)
        ? `${declaration.slice(0, colon + 1)}${declaration
            .slice(colon + 1)
            .replace(SvgPatterns.identifier, (token: string): string =>
              names.has(token) ? rename(token) : token,
            )}`
        : declaration;
    })
    .join(DeclarationSeparator);

/**
 * Merges the `@keyframes` rules that describe the same motion, and drops the
 * ones no animation refers to anymore.
 *
 * @param {Element} root - The document root.
 * @param {readonly SvgStylesheet[]} sheets - Its stylesheets.
 */
const pruneKeyframes = (
  root: Element,
  sheets: readonly SvgStylesheet[],
): void => {
  const bodies: ReadonlyMap<string, string> = keyframesOf(sheets);
  const names: ReadonlySet<string> = new Set(bodies.keys());
  const firstByBody: Map<string, string> = new Map();
  for (const [name, body] of bodies)
    if (!firstByBody.has(body)) firstByBody.set(body, name);
  const used: Set<string> = new Set();
  const rename = (name: string): string => {
    const canonical: string = firstByBody.get(bodies.get(name) ?? "") ?? name;
    used.add(canonical);
    return canonical;
  };
  for (const element of [root, ...elementsOf(root)])
    Option.map(attributeOf(element, SvgAttributes.style), (style: string) => {
      const renamed: string = mapAnimationNames(style, names, rename);
      if (renamed !== style) element.setAttribute(SvgAttributes.style, renamed);
    });
  for (const sheet of sheets)
    sheet.css.walkDecls(AnimationProperty, (declaration: Declaration): void => {
      declaration.value = mapAnimationNames(
        `${declaration.prop}:${declaration.value}`,
        names,
        rename,
      ).slice(declaration.prop.length + 1);
    });
  for (const rule of keyframesRules(sheets))
    if (!used.has(rule.params)) rule.remove();
};

/**
 * Collects the classes through which the stylesheets may paint an element.
 *
 * @param {readonly SvgStylesheet[]} sheets - The stylesheets.
 * @returns {Option.Option<ReadonlySet<string>>} The painting classes, or
 *   `None` when a rule paints through a selector other than a single class,
 *   so that any element may be painted.
 */
const paintedClassesOf = (
  sheets: readonly SvgStylesheet[],
): Option.Option<ReadonlySet<string>> => {
  const classes: Set<string> = new Set();
  let isUnbounded: boolean = false;
  for (const sheet of sheets)
    sheet.css.walkRules((rule: Rule): void => {
      const paints: boolean = (rule.nodes ?? []).some(
        (node): boolean =>
          node.type === "decl" && SvgPaintProperties.has(node.prop),
      );
      for (const selector of paints ? rule.selectors : []) {
        const name: string | undefined = selector
          .trim()
          .match(SvgPatterns.classSelector)?.[1];
        if (Predicate.isUndefined(name)) isUnbounded = true;
        else classes.add(name);
      }
    });
  return isUnbounded ? Option.none() : Option.some(classes);
};

export {
  keyframesOf,
  mapAnimationNames,
  paintedClassesOf,
  pruneKeyframes,
  readStylesheets,
  writeStylesheets,
};
