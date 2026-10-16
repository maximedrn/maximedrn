import type { Element } from "@xmldom/xmldom";
import { Option } from "effect";
import {
  SvgAttributes,
  SvgPatterns,
  SvgReferencedTags,
  SvgTags,
} from "@/lib/svg/svg.constants.ts";
import {
  ancestorsOf,
  attributeOf,
  childElements,
  elementsOf,
  firstReference,
  referencedIds,
  removeNode,
} from "@/lib/svg/svg.document.ts";
import {
  isInResource,
  isInvisibleShape,
  isTransparentFilter,
  isTransparentGradient,
} from "@/lib/svg/svg.paint.ts";
import { paintedClassesOf, readStylesheets } from "@/lib/svg/svg.styles.ts";

/**
 * Collects the ids of the elements of a tree that match a predicate.
 *
 * @param {readonly Element[]} elements - The candidate elements.
 * @param {(element: Element) => boolean} predicate - The test to pass.
 * @returns {ReadonlySet<string>} The ids of the matching elements.
 */
const idsWhere = (
  elements: readonly Element[],
  predicate: (element: Element) => boolean,
): ReadonlySet<string> =>
  new Set(
    elements
      .filter(predicate)
      .flatMap((element: Element): string[] =>
        Option.toArray(attributeOf(element, SvgAttributes.id)),
      ),
  );

/**
 * Collects the paint servers that paint nothing: gradients with transparent
 * stops only, and patterns whose content is invisible.
 *
 * @param {Element} root - The tree to scan.
 * @returns {ReadonlySet<string>} The ids of the transparent paint servers.
 */
const transparentPaintServers = (root: Element): ReadonlySet<string> => {
  const gradients: ReadonlySet<string> = idsWhere(
    [
      ...elementsOf(root, SvgTags.linearGradient),
      ...elementsOf(root, SvgTags.radialGradient),
    ],
    isTransparentGradient,
  );
  const patterns: ReadonlySet<string> = idsWhere(
    elementsOf(root, SvgTags.pattern),
    (pattern: Element): boolean =>
      !pattern.hasAttribute(SvgAttributes.href) &&
      childElements(pattern)
        .filter(
          (child: Element): boolean =>
            child.localName !== SvgTags.linearGradient &&
            child.localName !== SvgTags.radialGradient,
        )
        .every((child: Element): boolean => isInvisibleShape(child, gradients)),
  );
  return new Set([...gradients, ...patterns]);
};

/**
 * Removes the resources nothing references anymore, until none is left, and
 * the `<defs>` they leave empty.
 *
 * @param {Element} root - The tree to clean.
 */
const removeUnreferenced = (root: Element): void => {
  for (;;) {
    const referenced: ReadonlySet<string> = referencedIds(root);
    const unused: readonly Element[] = elementsOf(root).filter(
      (element: Element): boolean =>
        SvgReferencedTags.has(element.localName ?? "") &&
        !Option.exists(attributeOf(element, SvgAttributes.id), (id: string) =>
          referenced.has(id),
        ),
    );
    if (unused.length === 0) break;
    for (const element of unused) removeNode(element);
  }
  for (const defs of elementsOf(root, SvgTags.defs))
    if (childElements(defs).length === 0) removeNode(defs);
};

/**
 * Whether a stylesheet class may paint an element, or one it inherits from.
 *
 * @param {Element} element - The element to inspect.
 * @param {ReadonlySet<string>} painted - The classes stylesheets paint with.
 * @returns {boolean} `true` when a class may make the element visible.
 */
const isPaintedByClass = (
  element: Element,
  painted: ReadonlySet<string>,
): boolean =>
  [element, ...ancestorsOf(element)].some((node: Element): boolean =>
    Option.exists(attributeOf(node, SvgAttributes.className), (classes) =>
      classes
        .split(SvgPatterns.space)
        .some((name: string): boolean => painted.has(name)),
    ),
  );

/**
 * Removes the elements that can never be seen: the ones drawn through a filter
 * whose output is transparent black, and the shapes whose fill and stroke are
 * both invisible, unless a stylesheet class may paint them.
 *
 * @param {Element} root - The tree to clean.
 * @param {ReadonlySet<string>} painted - The classes stylesheets paint with.
 */
const removeInvisibleElements = (
  root: Element,
  painted: ReadonlySet<string>,
): void => {
  const filters: ReadonlySet<string> = idsWhere(
    elementsOf(root, SvgTags.filter),
    isTransparentFilter,
  );
  const transparent: ReadonlySet<string> = transparentPaintServers(root);
  const isFilteredOut = (element: Element): boolean =>
    Option.exists(
      Option.flatMap(
        attributeOf(element, SvgAttributes.filter),
        firstReference,
      ),
      (id: string): boolean => filters.has(id),
    );
  for (const element of elementsOf(root))
    if (
      !(isInResource(element) || isPaintedByClass(element, painted)) &&
      (isFilteredOut(element) || isInvisibleShape(element, transparent))
    )
      removeNode(element);
};

/**
 * Removes the paint that can never be seen: elements drawn through a filter
 * whose output is transparent black, shapes whose fill and stroke are both
 * invisible, and every resource left unreferenced. Satori emits such paint to
 * neutralize a style it cannot remove; it renders nothing, yet every filter
 * and mask still costs an offscreen pass on each animation frame. When a
 * stylesheet may paint any element, only unreferenced resources are removed.
 *
 * @param {Element} root - The tree to clean.
 */
const removeInvisiblePaint = (root: Element): void => {
  Option.map(
    paintedClassesOf(readStylesheets(root)),
    (painted: ReadonlySet<string>): void =>
      removeInvisibleElements(root, painted),
  );
  removeUnreferenced(root);
};

export { removeInvisiblePaint };
