import {
  type Attr,
  DOMParser,
  type Element,
  type Node,
  onErrorStopParsing,
  XMLSerializer,
} from "@xmldom/xmldom";
import { Option, Predicate } from "effect";
import {
  SvgAttributes,
  SvgMimeType,
  SvgNamespace,
  SvgPatterns,
  SvgPrefixes,
  SvgTags,
} from "@/lib/svg/svg.constants.ts";
import type { SvgIdAllocator } from "@/lib/svg/svg.types.ts";

const ElementNodeType = 1;

/**
 * Narrows a DOM node to an element.
 *
 * @param {Node} node - The node to inspect.
 * @returns {boolean} `true` when the node is an element.
 */
const isElement = (node: Node): node is Element =>
  node.nodeType === ElementNodeType;

/**
 * Parses SVG markup into its root `<svg>` element.
 *
 * @param {string} markup - The SVG markup to parse.
 * @returns {Element} The root `<svg>` element.
 * @throws {Error} When the markup is malformed or not an SVG document.
 */
const parseSvgRoot = (markup: string): Element => {
  const root: Element = Option.getOrThrowWith(
    Option.fromNullishOr(
      new DOMParser({ onError: onErrorStopParsing }).parseFromString(
        markup,
        SvgMimeType,
      ).documentElement,
    ),
    (): Error => new Error(SvgTags.svg),
  );
  if (root.localName !== SvgTags.svg) throw new Error(SvgTags.svg);
  return root;
};

/**
 * Parses SVG markup, reporting malformed input as `None` instead of throwing.
 *
 * @param {string} markup - The SVG markup to parse.
 * @returns {Option.Option<Element>} The root `<svg>` element, if any.
 */
const parseSvg: (markup: string) => Option.Option<Element> =
  Option.liftThrowable(parseSvgRoot);

/**
 * Serializes a DOM node back to markup.
 *
 * @param {Node} node - The node to serialize.
 * @returns {string} The node's markup.
 */
const serializeSvg = (node: Node): string =>
  new XMLSerializer().serializeToString(node);

/**
 * Snapshots the descendants of an element, so the tree can be edited while
 * iterating over them.
 *
 * @param {Element} root - The element to search.
 * @param {string} tag - The tag name to match, every element by default.
 * @returns {readonly Element[]} The matching descendants, in document order.
 */
const elementsOf = (
  root: Element,
  tag: string = SvgTags.all,
): readonly Element[] => Array.from(root.getElementsByTagName(tag));

/**
 * Lists the direct child elements of a node.
 *
 * @param {Node} node - The parent node.
 * @returns {readonly Element[]} Its child elements.
 */
const childElements = (node: Node): readonly Element[] =>
  Array.from(node.childNodes).filter(isElement);

/**
 * Reads an attribute.
 *
 * @param {Element} element - The element to read.
 * @param {string} name - The attribute name.
 * @returns {Option.Option<string>} The attribute value, if present.
 */
const attributeOf = (element: Element, name: string): Option.Option<string> =>
  Option.fromNullishOr(element.getAttribute(name));

/**
 * Reads an element's `href`, whether written plainly or with the legacy
 * `xlink` namespace.
 *
 * @param {Element} element - The element to read.
 * @returns {Option.Option<string>} The reference, if present.
 */
const hrefOf = (element: Element): Option.Option<string> =>
  Option.orElse(attributeOf(element, SvgAttributes.href), () =>
    Option.fromNullishOr(
      element.getAttributeNS(SvgNamespace.xlink, SvgAttributes.href),
    ),
  );

/**
 * Lists the ids an attribute value points at, through `url(#id)` or `#id`.
 *
 * @param {string} name - The attribute name.
 * @param {string} value - The attribute value.
 * @returns {readonly string[]} The referenced ids.
 */
const referencesIn = (name: string, value: string): readonly string[] => {
  const href: RegExpMatchArray | null = name.endsWith(SvgAttributes.href)
    ? value.match(SvgPatterns.hrefReference)
    : null;
  return Predicate.isNotNull(href) && Predicate.isNotUndefined(href[1])
    ? [href[1]]
    : Array.from(
        value.matchAll(SvgPatterns.attributeReference),
        (match: RegExpExecArray): string => match[1] ?? match[0],
      );
};

/**
 * Reads the id the first `url(#id)` of an attribute value points at.
 *
 * @param {string} value - The attribute value.
 * @returns {Option.Option<string>} The referenced id, if any.
 */
const firstReference = (value: string): Option.Option<string> =>
  Option.fromNullishOr(referencesIn(SvgAttributes.style, value)[0]);

/**
 * Collects every id referenced anywhere in the tree, from an attribute or from
 * a stylesheet.
 *
 * @param {Element} root - The tree to scan.
 * @returns {ReadonlySet<string>} The referenced ids.
 */
const referencedIds = (root: Element): ReadonlySet<string> =>
  new Set([
    ...[root, ...elementsOf(root)].flatMap((element: Element): string[] =>
      Array.from(element.attributes).flatMap(
        (attribute: Attr): readonly string[] =>
          referencesIn(attribute.name, attribute.value),
      ),
    ),
    ...elementsOf(root, SvgTags.style).flatMap(
      (style: Element): readonly string[] =>
        referencesIn(SvgAttributes.style, style.textContent ?? ""),
    ),
  ]);

/**
 * Indexes the elements of a tree by id.
 *
 * @param {Element} root - The tree to index.
 * @returns {ReadonlyMap<string, Element>} The elements, keyed by id.
 */
const elementsById = (root: Element): ReadonlyMap<string, Element> =>
  new Map(
    [root, ...elementsOf(root)].flatMap(
      (element: Element): [string, Element][] =>
        Option.match(attributeOf(element, SvgAttributes.id), {
          onNone: (): [string, Element][] => [],
          onSome: (id: string): [string, Element][] => [[id, element]],
        }),
    ),
  );

/**
 * Lists the ancestors of an element, from its parent up to the root.
 *
 * @param {Element} element - The element to start from.
 * @returns {readonly Element[]} Its ancestor elements.
 */
const ancestorsOf = (element: Element): readonly Element[] => {
  const ancestors: Element[] = [];
  for (
    let parent: Element | null = element.parentElement;
    Predicate.isNotNull(parent);
    parent = parent.parentElement
  )
    ancestors.push(parent);
  return ancestors;
};

/**
 * Adds a class to an element, keeping the classes it already has.
 *
 * @param {Element} element - The element to update.
 * @param {string} className - The class to add.
 */
const addClass = (element: Element, className: string): void => {
  element.setAttribute(
    SvgAttributes.className,
    Option.match(attributeOf(element, SvgAttributes.className), {
      onNone: (): string => className,
      onSome: (existing: string): string => `${existing} ${className}`,
    }),
  );
};

/**
 * Removes a node from its parent, if it has one.
 *
 * @param {Node} node - The node to detach.
 */
const removeNode = (node: Node): void => {
  node.parentNode?.removeChild(node);
};

/**
 * Creates an allocator handing out ids that are unique across the document, so
 * the ids of several embedded documents can be merged into it safely.
 *
 * @param {Element} root - The document whose existing ids must be avoided.
 * @returns {SvgIdAllocator} A function returning a fresh id on every call.
 */
const createIdAllocator = (root: Element): SvgIdAllocator => {
  const taken: Set<string> = new Set(elementsById(root).keys());
  let counter: number = 0;
  return (): string => {
    let id: string = `${SvgPrefixes.id}${counter.toString(36)}`;
    while (taken.has(id)) {
      counter += 1;
      id = `${SvgPrefixes.id}${counter.toString(36)}`;
    }
    taken.add(id);
    return id;
  };
};

/**
 * Rewrites the ids an attribute defines or references.
 *
 * @param {string} name - The attribute name.
 * @param {string} value - The attribute value.
 * @param {(id: string) => string} rename - Maps an id to its replacement.
 * @returns {string} The attribute value with its ids rewritten.
 */
const rewriteIds = (
  name: string,
  value: string,
  rename: (id: string) => string,
): string =>
  name === SvgAttributes.id
    ? rename(value)
    : name.endsWith(SvgAttributes.href)
      ? value.replace(
          SvgPatterns.hrefReference,
          (_match: string, id: string): string => `#${rename(id)}`,
        )
      : value.replace(
          SvgPatterns.attributeReference,
          (_match: string, id: string): string => `url(#${rename(id)})`,
        );

/**
 * Renames every id of a tree, and every reference to them, with fresh ids.
 *
 * @param {Element} root - The tree whose ids are renamed.
 * @param {SvgIdAllocator} allocate - Hands out the replacement ids.
 */
const renameIds = (root: Element, allocate: SvgIdAllocator): void => {
  const renames: ReadonlyMap<string, string> = new Map(
    Array.from(elementsById(root).keys(), (id: string): [string, string] => [
      id,
      allocate(),
    ]),
  );
  const rename = (id: string): string => renames.get(id) ?? id;
  for (const element of [root, ...elementsOf(root)])
    for (const { name, value } of Array.from(element.attributes)) {
      const renamed: string = rewriteIds(name, value, rename);
      if (renamed !== value) element.setAttribute(name, renamed);
    }
};

export {
  addClass,
  ancestorsOf,
  attributeOf,
  childElements,
  createIdAllocator,
  elementsById,
  elementsOf,
  firstReference,
  hrefOf,
  isElement,
  parseSvg,
  parseSvgRoot,
  referencedIds,
  removeNode,
  renameIds,
  rewriteIds,
  serializeSvg,
};
