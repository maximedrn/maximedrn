import type { Element } from "@xmldom/xmldom";
import { Option } from "effect";
import {
  SvgAttributes,
  SvgCompositeIn,
  SvgInvisiblePaints,
  SvgNoOpStyle,
  SvgPatterns,
  SvgResourceTags,
  SvgShapeTags,
  SvgTags,
  SvgZero,
} from "@/lib/svg/svg.constants.ts";
import {
  ancestorsOf,
  attributeOf,
  childElements,
  firstReference,
} from "@/lib/svg/svg.document.ts";

/**
 * Whether a color paints nothing.
 *
 * @param {string} value - A color or paint value.
 * @returns {boolean} `true` for `none`, `transparent` and zero-alpha colors.
 */
const isInvisibleColor = (value: string): boolean =>
  SvgInvisiblePaints.has(value.trim().toLowerCase()) ||
  SvgPatterns.invisibleColor.test(value.trim());

/**
 * Whether an attribute is present and explicitly paints nothing.
 *
 * @param {Element} element - The element to read.
 * @param {string} color - The color attribute.
 * @param {string} opacity - The matching opacity attribute.
 * @returns {boolean} `true` when the color or its opacity makes it invisible.
 */
const isInvisible = (
  element: Element,
  color: string,
  opacity: string,
): boolean =>
  Option.exists(attributeOf(element, color), isInvisibleColor) ||
  Option.exists(
    attributeOf(element, opacity),
    (value: string): boolean => Number(value) === SvgZero,
  );

/**
 * Whether a filter always outputs transparent black: its result is a
 * transparent flood, or such a flood composited `in` anything.
 *
 * @param {Element} filter - The `<filter>` element.
 * @returns {boolean} `true` when the filtered element can never be seen.
 */
const isTransparentFilter = (filter: Element): boolean => {
  const primitives: readonly Element[] = childElements(filter);
  const floods: ReadonlyMap<string, Element> = new Map(
    primitives
      .filter(
        (primitive: Element): boolean =>
          primitive.localName === SvgTags.feFlood,
      )
      .map((flood: Element): [string, Element] => [
        Option.getOrElse(
          attributeOf(flood, SvgAttributes.result),
          (): string => "",
        ),
        flood,
      ]),
  );
  const isTransparentFlood = (flood: Element): boolean =>
    isInvisible(flood, SvgAttributes.floodColor, SvgAttributes.floodOpacity);
  return Option.exists(
    Option.fromNullishOr(primitives.at(-1)),
    (last: Element): boolean =>
      last.localName === SvgTags.feFlood
        ? isTransparentFlood(last)
        : last.localName === SvgTags.feComposite &&
          Option.contains(
            attributeOf(last, SvgAttributes.operator),
            SvgCompositeIn,
          ) &&
          Option.exists(
            Option.flatMap(attributeOf(last, SvgAttributes.in), (input) =>
              Option.fromNullishOr(floods.get(input)),
            ),
            isTransparentFlood,
          ),
  );
};

/**
 * Whether a gradient only has transparent stops.
 *
 * @param {Element} gradient - A `<linearGradient>` or `<radialGradient>`.
 * @returns {boolean} `true` when the gradient paints nothing.
 */
const isTransparentGradient = (gradient: Element): boolean => {
  const stops: readonly Element[] = childElements(gradient);
  return (
    stops.length > 0 &&
    !gradient.hasAttribute(SvgAttributes.href) &&
    stops.every(
      (stop: Element): boolean =>
        stop.localName === SvgTags.stop &&
        !stop.hasAttribute(SvgAttributes.style) &&
        isInvisible(stop, SvgAttributes.stopColor, SvgAttributes.stopOpacity),
    )
  );
};

/**
 * Whether an element is a resource, or is defined inside one, so it is never
 * rendered in place.
 *
 * @param {Element} element - The element to inspect.
 * @returns {boolean} `true` when the element is only rendered by reference.
 */
const isInResource = (element: Element): boolean =>
  [element, ...ancestorsOf(element)].some((node: Element): boolean =>
    SvgResourceTags.has(node.localName ?? ""),
  );

/**
 * Whether an element or one of its ancestors sets a stroke.
 *
 * @param {Element} element - The element to inspect.
 * @returns {boolean} `true` when a stroke may be inherited.
 */
const inheritsStroke = (element: Element): boolean =>
  [element, ...ancestorsOf(element)].some((node: Element): boolean =>
    node.hasAttribute(SvgAttributes.stroke),
  );

/**
 * Whether a shape draws nothing: neither its fill nor its stroke is visible.
 *
 * @param {Element} shape - The shape to inspect.
 * @param {ReadonlySet<string>} transparent - Ids of transparent paint servers.
 * @returns {boolean} `true` when the shape can be removed.
 */
const isInvisibleShape = (
  shape: Element,
  transparent: ReadonlySet<string>,
): boolean => {
  const isPaintInvisible = (value: string): boolean =>
    isInvisibleColor(value) ||
    Option.exists(firstReference(value), (id: string): boolean =>
      transparent.has(id),
    );
  const style: string = Option.getOrElse(
    attributeOf(shape, SvgAttributes.style),
    (): string => SvgNoOpStyle,
  );
  const hasNoStroke: boolean =
    Option.exists(attributeOf(shape, SvgAttributes.stroke), isPaintInvisible) ||
    Option.exists(
      attributeOf(shape, SvgAttributes.strokeWidth),
      (width: string): boolean => Number(width) === SvgZero,
    ) ||
    !inheritsStroke(shape);
  return (
    SvgShapeTags.has(shape.localName ?? "") &&
    style
      .replace(SvgPatterns.space, "")
      .replace(SvgPatterns.styleSeparator, "") === SvgNoOpStyle &&
    !shape.hasAttribute(SvgAttributes.id) &&
    Option.exists(attributeOf(shape, SvgAttributes.fill), isPaintInvisible) &&
    hasNoStroke
  );
};

export {
  isInResource,
  isInvisibleShape,
  isTransparentFilter,
  isTransparentGradient,
};
