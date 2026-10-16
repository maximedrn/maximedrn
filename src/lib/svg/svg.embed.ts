import type { Attr, Element } from "@xmldom/xmldom";
import { Option } from "effect";
import {
  SvgAttributes,
  SvgBoxRectAttributes,
  SvgDataUri,
  SvgNonPortableTags,
  SvgOpaqueWhites,
  SvgPatterns,
  SvgTags,
  SvgZero,
} from "@/lib/svg/svg.constants.ts";
import {
  attributeOf,
  childElements,
  elementsOf,
  hrefOf,
  parseSvg,
} from "@/lib/svg/svg.document.ts";
import type { SvgBox, SvgEmbedded } from "@/lib/svg/svg.types.ts";

const Base64Marker = ";base64";
const ViewBoxLength = 4;

/**
 * Decodes an SVG data URI, whether base64- or percent-encoded.
 *
 * @param {string} href - The `href` of an `<image>`.
 * @returns {Option.Option<string>} The embedded SVG markup, if any.
 */
const decodeSvgDataUri = (href: string): Option.Option<string> => {
  const comma: number = href.indexOf(",");
  if (!href.startsWith(SvgDataUri.svg) || comma < SvgZero) return Option.none();
  const payload: string = href.slice(comma + 1);
  return href.slice(0, comma).endsWith(Base64Marker)
    ? Option.some(Buffer.from(payload, "base64").toString("utf8"))
    : Option.liftThrowable(decodeURIComponent)(payload);
};

/**
 * Reads a strictly numeric attribute.
 *
 * @param {Element} element - The element to read.
 * @param {string} name - The attribute name.
 * @param {number} fallback - The value of an absent attribute.
 * @returns {Option.Option<number>} The value, or `None` when it has units.
 */
const numberOf = (
  element: Element,
  name: string,
  fallback: number,
): Option.Option<number> =>
  Option.liftPredicate(
    Number(
      Option.getOrElse(attributeOf(element, name), (): number => fallback),
    ),
    Number.isFinite,
  );

/**
 * Reads the box an element occupies in its parent's user space.
 *
 * @param {Element} element - An `<image>` or a `<rect>`.
 * @returns {Option.Option<SvgBox>} Its box, when every side is numeric.
 */
const boxOf = (element: Element): Option.Option<SvgBox> =>
  Option.all({
    height: numberOf(element, SvgAttributes.height, Number.NaN),
    width: numberOf(element, SvgAttributes.width, Number.NaN),
    x: numberOf(element, SvgAttributes.x, SvgZero),
    y: numberOf(element, SvgAttributes.y, SvgZero),
  });

/**
 * Whether two boxes cover exactly the same area.
 *
 * @param {SvgBox} left - The first box.
 * @param {SvgBox} right - The second box.
 * @returns {boolean} `true` when both boxes are identical.
 */
const isSameBox = (left: SvgBox, right: SvgBox): boolean =>
  left.x === right.x &&
  left.y === right.y &&
  left.width === right.width &&
  left.height === right.height;

/**
 * Reads the coordinate system of an embedded document.
 *
 * @param {Element} root - The embedded `<svg>` root.
 * @returns {Option.Option<readonly number[]>} Its `viewBox`, or one derived
 *   from a numeric size.
 */
const viewBoxOf = (root: Element): Option.Option<readonly number[]> =>
  Option.match(attributeOf(root, SvgAttributes.viewBox), {
    onNone: (): Option.Option<readonly number[]> =>
      Option.map(boxOf(root), (box: SvgBox): readonly number[] => [
        SvgZero,
        SvgZero,
        box.width,
        box.height,
      ]),
    onSome: (value: string): Option.Option<readonly number[]> =>
      Option.liftPredicate(
        value.trim().split(SvgPatterns.viewBox).map(Number),
        (box: number[]): boolean =>
          box.length === ViewBoxLength && box.every(Number.isFinite),
      ),
  });

/**
 * Whether the content of an embedded document behaves the same once moved
 * into the host: no stylesheet or script would leak into it, and no color is
 * inherited from the context it is drawn in.
 *
 * @param {Element} root - The embedded `<svg>` root.
 * @param {string} markup - Its markup.
 * @returns {boolean} `true` when the content can be inlined as is.
 */
const isSelfContained = (root: Element, markup: string): boolean =>
  !SvgPatterns.currentColor.test(markup) &&
  SvgNonPortableTags.every(
    (tag: string): boolean => elementsOf(root, tag).length === 0,
  );

/**
 * Reads and parses the SVG document an `<image>` embeds.
 *
 * @param {Element} image - The `<image>` element.
 * @returns {Option.Option<SvgEmbedded>} The embedded document, when it can be
 *   inlined without changing how it renders.
 */
const embeddedSvgOf = (image: Element): Option.Option<SvgEmbedded> =>
  Option.gen(function* () {
    const markup: string = yield* Option.flatMap(
      hrefOf(image),
      decodeSvgDataUri,
    );
    const root: Element = yield* parseSvg(markup);
    if (!isSelfContained(root, markup)) return yield* Option.none();
    return {
      box: yield* boxOf(image),
      root,
      viewBox: yield* viewBoxOf(root),
    };
  });

/**
 * Whether an embedded document maps one to one onto the box it is drawn in,
 * in which case its content can be inlined without a nested viewport.
 *
 * @param {SvgEmbedded} embedded - The embedded document.
 * @returns {boolean} `true` when no translation or scaling is involved.
 */
const isIdentityViewport = (embedded: SvgEmbedded): boolean => {
  const [x, y, width, height] = embedded.viewBox;
  return isSameBox(embedded.box, {
    height: height ?? Number.NaN,
    width: width ?? Number.NaN,
    x: x ?? Number.NaN,
    y: y ?? Number.NaN,
  });
};

/**
 * Whether a `<rect>` exactly covers a box, and is opaque white when required.
 *
 * @param {Element} shape - The candidate `<rect>`.
 * @param {SvgBox} box - The box it should cover.
 * @param {boolean} opaque - Whether it must be filled with opaque white.
 * @returns {boolean} `true` when the rectangle is exactly the box.
 */
const isBoxRect = (shape: Element, box: SvgBox, opaque: boolean): boolean =>
  shape.localName === SvgTags.rect &&
  Array.from(shape.attributes).every((attribute: Attr): boolean =>
    SvgBoxRectAttributes.has(attribute.name),
  ) &&
  (!opaque ||
    Option.exists(attributeOf(shape, SvgAttributes.fill), (fill: string) =>
      SvgOpaqueWhites.has(fill.toLowerCase()),
    )) &&
  Option.exists(boxOf(shape), (rect: SvgBox): boolean => isSameBox(rect, box));

/**
 * Whether a clip path or mask only repeats the box the content is already
 * clipped to by its own viewport.
 *
 * @param {Element} resource - The referenced `<clipPath>` or `<mask>`.
 * @param {SvgBox} box - The box of the inlined image.
 * @returns {boolean} `true` when dropping the reference changes nothing.
 */
const isBoxResource = (resource: Element, box: SvgBox): boolean => {
  const shapes: readonly Element[] = childElements(resource);
  return (
    shapes.length === 1 &&
    resource.attributes.length === 1 &&
    shapes.every((shape: Element): boolean =>
      isBoxRect(shape, box, resource.localName === SvgTags.mask),
    )
  );
};

export { embeddedSvgOf, isBoxResource, isIdentityViewport };
