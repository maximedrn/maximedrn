import type { Attr, Element, Node } from "@xmldom/xmldom";
import { Option } from "effect";
import { atRule, decl, type Root, type Rule, rule } from "postcss";
import {
  SvgAttributes,
  SvgColorAttributes,
  SvgPrefixes,
  SvgTags,
  SvgThemes,
} from "@/lib/svg/svg.constants.ts";
import {
  addClass,
  attributeOf,
  childElements,
  elementsById,
  isElement,
  removeNode,
  rewriteIds,
} from "@/lib/svg/svg.document.ts";
import {
  keyframesOf,
  mapAnimationNames,
  readStylesheets,
  writeStylesheets,
} from "@/lib/svg/svg.styles.ts";
import type {
  SvgStylesheet,
  SvgThemeColor,
  SvgThemeEdit,
} from "@/lib/svg/svg.types.ts";

const MediaRule = "media";
const ThemeSelectors: ReadonlySet<string> = new Set([
  `.${SvgThemes.dark}`,
  `.${SvgThemes.light}`,
]);

/**
 * What the alignment of the two theme trees needs and accumulates. Ids are
 * compared by their order of appearance, since each tree got its own.
 */
interface AlignContext {
  readonly canonicalStyle: (style: string) => string;
  readonly darkIds: ReadonlyMap<string, string>;
  readonly edits: SvgThemeEdit[];
  readonly lightIds: ReadonlyMap<string, string>;
}

const ReferencePrefix = "url(";

/**
 * Numbers the ids of a tree by order of appearance.
 *
 * @param {Element} group - The tree.
 * @returns {ReadonlyMap<string, string>} The canonical name of every id.
 */
const canonicalIdsOf = (group: Element): ReadonlyMap<string, string> =>
  new Map(
    Array.from(
      elementsById(group).keys(),
      (id: string, index: number): [string, string] => [id, `#${index}`],
    ),
  );

/**
 * Finds the top-level group that holds one theme's drawing.
 *
 * @param {Element} root - The document root.
 * @param {string} theme - The theme class.
 * @returns {Option.Option<Element>} The theme group, if any.
 */
const themeGroupOf = (root: Element, theme: string): Option.Option<Element> =>
  Option.fromNullishOr(
    childElements(root).find(
      (child: Element): boolean =>
        child.localName === SvgTags.group &&
        Option.contains(attributeOf(child, SvgAttributes.className), theme),
    ),
  );

/**
 * Compares the attributes of two elements that sit at the same place in each
 * theme. Inline styles may only differ by the name of identical keyframes, and
 * any other difference must be a color, recorded so it can become a class.
 *
 * @param {Element} light - The element of the light tree.
 * @param {Element} dark - The element of the dark tree.
 * @param {AlignContext} context - The accumulated color edits.
 * @returns {boolean} `true` when the elements only differ by colors.
 */
const alignAttributes = (
  light: Element,
  dark: Element,
  context: AlignContext,
): boolean =>
  light.attributes.length === dark.attributes.length &&
  Array.from(light.attributes).every(({ name, value }: Attr): boolean =>
    Option.exists(
      attributeOf(dark, name),
      (other: string): boolean =>
        isSameAttribute(name, value, other, context) ||
        recordColor(
          { attribute: name, dark: other, element: light, light: value },
          context,
        ),
    ),
  );

/**
 * Whether an attribute has the same meaning in both themes: equal once their
 * ids are numbered by order of appearance, and, for an inline style, once its
 * animation names are replaced by the keyframes they play.
 *
 * @param {string} name - The attribute name.
 * @param {string} light - Its value in the light tree.
 * @param {string} dark - Its value in the dark tree.
 * @param {AlignContext} context - The canonical ids and keyframes.
 * @returns {boolean} `true` when both values are equivalent.
 */
const isSameAttribute = (
  name: string,
  light: string,
  dark: string,
  context: AlignContext,
): boolean => {
  const canonical = (raw: string, ids: ReadonlyMap<string, string>): string =>
    rewriteIds(name, raw, (id: string): string => ids.get(id) ?? id);
  const lightValue: string = canonical(light, context.lightIds);
  const darkValue: string = canonical(dark, context.darkIds);
  return (
    lightValue === darkValue ||
    (name === SvgAttributes.style &&
      context.canonicalStyle(lightValue) === context.canonicalStyle(darkValue))
  );
};

/**
 * Records a difference between the themes when it is a plain color, which a
 * class can carry. References to paint servers cannot be themed this way.
 *
 * @param {SvgThemeEdit} edit - The differing attribute.
 * @param {AlignContext} context - The accumulated color edits.
 * @returns {boolean} `true` when the difference was recorded.
 */
const recordColor = (edit: SvgThemeEdit, context: AlignContext): boolean => {
  const isColor: boolean =
    SvgColorAttributes.has(edit.attribute) &&
    !edit.light.includes(ReferencePrefix) &&
    !edit.dark.includes(ReferencePrefix);
  if (isColor) context.edits.push(edit);
  return isColor;
};

/**
 * Compares the children of two nodes that sit at the same place in each theme.
 *
 * @param {Node} light - The node of the light tree.
 * @param {Node} dark - The node of the dark tree.
 * @param {AlignContext} context - The accumulated color edits.
 * @returns {boolean} `true` when the children only differ by colors.
 */
const alignChildren = (
  light: Node,
  dark: Node,
  context: AlignContext,
): boolean => {
  const lights: readonly Node[] = Array.from(light.childNodes);
  const darks: readonly Node[] = Array.from(dark.childNodes);
  return (
    lights.length === darks.length &&
    lights.every((child: Node, index: number): boolean =>
      Option.exists(Option.fromNullishOr(darks[index]), (other: Node) =>
        alignNodes(child, other, context),
      ),
    )
  );
};

/**
 * Compares two nodes that sit at the same place in each theme.
 *
 * @param {Node} light - The node of the light tree.
 * @param {Node} dark - The node of the dark tree.
 * @param {AlignContext} context - The accumulated color edits.
 * @returns {boolean} `true` when the nodes only differ by colors.
 */
const alignNodes = (
  light: Node,
  dark: Node,
  context: AlignContext,
): boolean => {
  if (light.nodeType !== dark.nodeType) return false;
  if (!(isElement(light) && isElement(dark)))
    return light.nodeValue === dark.nodeValue;
  return (
    light.localName === dark.localName &&
    alignAttributes(light, dark, context) &&
    alignChildren(light, dark, context)
  );
};

/**
 * Turns the recorded color edits into classes on the light tree, sharing one
 * class per distinct pair of colors.
 *
 * @param {readonly SvgThemeEdit[]} edits - The colors the themes disagree on.
 * @returns {readonly SvgThemeColor[]} The themed colors, one per class.
 */
const applyEdits = (
  edits: readonly SvgThemeEdit[],
): readonly SvgThemeColor[] => {
  const colors: Map<string, SvgThemeColor> = new Map();
  for (const edit of edits) {
    const key: string = [edit.attribute, edit.light, edit.dark].join("\n");
    const color: SvgThemeColor = colors.get(key) ?? {
      attribute: edit.attribute,
      className: `${SvgPrefixes.className}${colors.size.toString(36)}`,
      dark: edit.dark,
      light: edit.light,
    };
    colors.set(key, color);
    edit.element.removeAttribute(edit.attribute);
    addClass(edit.element, color.className);
  }
  return [...colors.values()];
};

/**
 * Replaces the stylesheet rules that toggle the theme groups with the rules
 * of the themed colors: light by default, dark under `prefers-color-scheme`.
 *
 * @param {readonly SvgStylesheet[]} sheets - The document stylesheets.
 * @param {readonly SvgThemeColor[]} colors - The themed colors.
 */
const rewriteThemeRules = (
  sheets: readonly SvgStylesheet[],
  colors: readonly SvgThemeColor[],
): void => {
  for (const { css } of sheets) {
    css.walkRules((themeRule: Rule): void => {
      if (themeRule.selectors.every((selector) => ThemeSelectors.has(selector)))
        themeRule.remove();
    });
    css.walkAtRules(MediaRule, (media): void => {
      if ((media.nodes ?? []).length === 0) media.remove();
    });
  }
  const colorRule = (color: SvgThemeColor, value: string): Rule =>
    rule({ selector: `.${color.className}` }).append(
      decl({ prop: color.attribute, value }),
    );
  Option.map(
    Option.fromNullishOr(sheets[0]),
    ({ css }: { readonly css: Root }): void => {
      css.append(
        ...colors.map(
          (color: SvgThemeColor): Rule => colorRule(color, color.light),
        ),
        atRule({ name: MediaRule, params: SvgThemes.darkMedia }).append(
          ...colors.map(
            (color: SvgThemeColor): Rule => colorRule(color, color.dark),
          ),
        ),
      );
    },
  );
};

/**
 * Merges the light and dark drawings into one, when they only differ by
 * colors: the colors become classes whose value follows the color scheme, so
 * the geometry, the text outlines and the images are only stored once.
 * Documents whose themes differ in any other way are left untouched.
 *
 * @param {Element} root - The document root.
 * @returns {boolean} `true` when the themes were merged.
 */
const mergeThemes = (root: Element): boolean =>
  Option.match(
    Option.all([
      themeGroupOf(root, SvgThemes.light),
      themeGroupOf(root, SvgThemes.dark),
    ]),
    {
      onNone: (): boolean => false,
      onSome: ([light, dark]: [Element, Element]): boolean => {
        const sheets: readonly SvgStylesheet[] = readStylesheets(root);
        const keyframes: ReadonlyMap<string, string> = keyframesOf(sheets);
        const names: ReadonlySet<string> = new Set(keyframes.keys());
        const context: AlignContext = {
          canonicalStyle: (style: string): string =>
            mapAnimationNames(
              style,
              names,
              (name: string): string => keyframes.get(name) ?? name,
            ),
          darkIds: canonicalIdsOf(dark),
          edits: [],
          lightIds: canonicalIdsOf(light),
        };
        if (sheets.length === 0 || !alignChildren(light, dark, context))
          return false;
        rewriteThemeRules(sheets, applyEdits(context.edits));
        writeStylesheets(sheets);
        for (const child of Array.from(light.childNodes))
          root.insertBefore(child, light);
        removeNode(light);
        removeNode(dark);
        return true;
      },
    },
  );

export { mergeThemes };
