import type { Attr, Document, Element, Node } from "@xmldom/xmldom";
import { Option } from "effect";
import {
  SvgAttributes,
  SvgImageViewportAttributes,
  SvgNamespace,
  SvgNoOpStyle,
  SvgPatterns,
  SvgTags,
  SvgViewportAttributes,
  SvgZero,
} from "@/lib/svg/svg.constants.ts";
import {
  attributeOf,
  elementsById,
  elementsOf,
  firstReference,
  renameIds,
} from "@/lib/svg/svg.document.ts";
import {
  embeddedSvgOf,
  isBoxResource,
  isIdentityViewport,
} from "@/lib/svg/svg.embed.ts";
import type {
  SvgBox,
  SvgEmbedded,
  SvgIdAllocator,
} from "@/lib/svg/svg.types.ts";

type SvgAttribute = readonly [string, string];

const XmlnsPrefix = "xmlns";

/**
 * Whether an `<image>` attribute still has an effect once the image is
 * replaced by its content. Its viewport attributes are consumed by the
 * replacement, `filter: none` never had an effect, and a clip path or mask
 * that only repeats the image's own box is already enforced by the viewport.
 *
 * @param {SvgAttribute} attribute - The attribute name and value.
 * @param {SvgBox} box - The box of the image.
 * @param {ReadonlyMap<string, Element>} resources - The host's elements by id.
 * @returns {boolean} `true` when the attribute must be kept.
 */
const isEffective = (
  [name, value]: SvgAttribute,
  box: SvgBox,
  resources: ReadonlyMap<string, Element>,
): boolean => {
  if (SvgImageViewportAttributes.has(name)) return false;
  if (name === SvgAttributes.style)
    return (
      value
        .replace(SvgPatterns.space, "")
        .replace(SvgPatterns.styleSeparator, "") !== SvgNoOpStyle
    );
  if (name !== SvgAttributes.clipPath && name !== SvgAttributes.mask)
    return true;
  return !Option.exists(
    Option.flatMap(firstReference(value), (id: string) =>
      Option.fromNullishOr(resources.get(id)),
    ),
    (resource: Element): boolean => isBoxResource(resource, box),
  );
};

/**
 * Lists the attributes of an element as name and value pairs.
 *
 * @param {Element} element - The element to read.
 * @returns {readonly SvgAttribute[]} Its attributes.
 */
const attributesOf = (element: Element): readonly SvgAttribute[] =>
  Array.from(
    element.attributes,
    (attribute: Attr): SvgAttribute => [attribute.name, attribute.value],
  );

/**
 * Creates the element that replaces an `<image>`: a plain group when the
 * embedded document maps one to one onto the image, or a nested `<svg>`
 * viewport reproducing the image's placement, scaling and clipping.
 *
 * @param {Document} document - The host document.
 * @param {Element} image - The image being replaced.
 * @param {SvgEmbedded} embedded - The document it embeds.
 * @returns {Element} The empty replacement element.
 */
const createViewport = (
  document: Document,
  image: Element,
  embedded: SvgEmbedded,
): Element => {
  if (isIdentityViewport(embedded))
    return document.createElementNS(SvgNamespace.svg, SvgTags.group);
  const viewport: Element = document.createElementNS(
    SvgNamespace.svg,
    SvgTags.svg,
  );
  const { box } = embedded;
  const placement: readonly SvgAttribute[] = [
    [SvgAttributes.x, String(box.x)],
    [SvgAttributes.y, String(box.y)],
  ];
  for (const [name, value] of placement)
    if (Number(value) !== SvgZero) viewport.setAttribute(name, value);
  viewport.setAttribute(SvgAttributes.width, String(box.width));
  viewport.setAttribute(SvgAttributes.height, String(box.height));
  viewport.setAttribute(SvgAttributes.viewBox, embedded.viewBox.join(" "));
  Option.map(
    attributeOf(image, SvgAttributes.preserveAspectRatio),
    (value: string): void =>
      viewport.setAttribute(SvgAttributes.preserveAspectRatio, value),
  );
  return viewport;
};

/**
 * Builds the content that replaces an `<image>`: its embedded document's
 * children, with the root's inherited presentation attributes and the image's
 * remaining attributes applied around them.
 *
 * @param {Element} image - The image being replaced.
 * @param {SvgEmbedded} embedded - The document it embeds.
 * @param {ReadonlyMap<string, Element>} resources - The host's elements by id.
 * @returns {Element} The replacement element.
 */
const buildReplacement = (
  image: Element,
  embedded: SvgEmbedded,
  resources: ReadonlyMap<string, Element>,
): Element => {
  const document: Document = Option.getOrThrow(
    Option.fromNullishOr(image.ownerDocument),
  );
  const viewport: Element = createViewport(document, image, embedded);
  for (const [name, value] of attributesOf(embedded.root))
    if (!(SvgViewportAttributes.has(name) || name.startsWith(XmlnsPrefix)))
      viewport.setAttribute(name, value);
  for (const child of Array.from(embedded.root.childNodes))
    viewport.appendChild(document.importNode(child, true));
  const kept: readonly SvgAttribute[] = attributesOf(image).filter(
    (attribute: SvgAttribute): boolean =>
      isEffective(attribute, embedded.box, resources),
  );
  const canMerge: boolean =
    viewport.localName === SvgTags.group &&
    kept.every(([name]: SvgAttribute): boolean => !viewport.hasAttribute(name));
  if (kept.length === 0) return viewport;
  const host: Element = canMerge
    ? viewport
    : document.createElementNS(SvgNamespace.svg, SvgTags.group);
  for (const [name, value] of kept) host.setAttribute(name, value);
  if (!canMerge) host.appendChild(viewport);
  return host;
};

/**
 * Replaces every `<image>` that embeds an SVG document with the document's
 * content, recursively, so the whole drawing lives in a single document that
 * the browser parses once and that the optimizer can see entirely. The ids of
 * every embedded document are renamed, since each one was only unique within
 * its own document.
 *
 * @param {Element} root - The document whose images are inlined.
 * @param {SvgIdAllocator} allocate - Hands out ids unique across the host.
 */
const inlineImages = (root: Element, allocate: SvgIdAllocator): void => {
  const resources: ReadonlyMap<string, Element> = elementsById(root);
  for (const image of elementsOf(root, SvgTags.image)) {
    Option.map(embeddedSvgOf(image), (embedded: SvgEmbedded): void => {
      inlineImages(embedded.root, allocate);
      renameIds(embedded.root, allocate);
      const replacement: Node = buildReplacement(image, embedded, resources);
      image.parentNode?.replaceChild(replacement, image);
    });
  }
};

export { inlineImages };
