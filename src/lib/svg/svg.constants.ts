import type { Config } from "svgo";

const SvgFloatPrecision = 3;

const SvgOptimizationConfig: Config = {
  floatPrecision: SvgFloatPrecision,
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        floatPrecision: SvgFloatPrecision,
        overrides: {
          // The stylesheet only targets classes and keyframes, never ids, so
          // the ids can be minified even though a <style> element is present.
          cleanupIds: { force: true },
          inlineStyles: false,
          removeHiddenElems: false,
        },
      },
    },
  ],
};

const SvgNamespace = {
  svg: "http://www.w3.org/2000/svg",
  xlink: "http://www.w3.org/1999/xlink",
} as const;

const SvgMimeType = "image/svg+xml";

const SvgDataUri = {
  png: "data:image/png;base64,",
  svg: "data:image/svg+xml",
  svgBase64: "data:image/svg+xml;base64,",
  webp: "data:image/webp;base64,",
} as const;

const SvgTags = {
  all: "*",
  clipPath: "clipPath",
  defs: "defs",
  feComposite: "feComposite",
  feFlood: "feFlood",
  filter: "filter",
  foreignObject: "foreignObject",
  group: "g",
  image: "image",
  linearGradient: "linearGradient",
  mask: "mask",
  pattern: "pattern",
  radialGradient: "radialGradient",
  rect: "rect",
  script: "script",
  stop: "stop",
  style: "style",
  svg: "svg",
} as const;

const SvgAttributes = {
  className: "class",
  clipPath: "clip-path",
  fill: "fill",
  filter: "filter",
  floodColor: "flood-color",
  floodOpacity: "flood-opacity",
  height: "height",
  href: "href",
  id: "id",
  in: "in",
  mask: "mask",
  operator: "operator",
  preserveAspectRatio: "preserveAspectRatio",
  result: "result",
  stopColor: "stop-color",
  stopOpacity: "stop-opacity",
  stroke: "stroke",
  strokeWidth: "stroke-width",
  style: "style",
  viewBox: "viewBox",
  width: "width",
  x: "x",
  y: "y",
} as const;

// Elements whose content is only rendered when referenced, never in place.
const SvgResourceTags: ReadonlySet<string> = new Set([
  SvgTags.clipPath,
  SvgTags.defs,
  SvgTags.filter,
  SvgTags.linearGradient,
  SvgTags.mask,
  SvgTags.pattern,
  SvgTags.radialGradient,
  "marker",
  "symbol",
]);

// Resources that can be dropped once nothing references them anymore.
const SvgReferencedTags: ReadonlySet<string> = new Set([
  SvgTags.clipPath,
  SvgTags.filter,
  SvgTags.linearGradient,
  SvgTags.mask,
  SvgTags.pattern,
  SvgTags.radialGradient,
]);

const SvgShapeTags: ReadonlySet<string> = new Set([
  "circle",
  "ellipse",
  "line",
  "path",
  "polygon",
  "polyline",
  SvgTags.rect,
]);

// Content that cannot be moved into another document without rewriting it.
const SvgNonPortableTags: readonly string[] = [
  SvgTags.foreignObject,
  SvgTags.script,
  SvgTags.style,
];

// Root attributes that only describe the embedded document's own viewport.
const SvgViewportAttributes: ReadonlySet<string> = new Set([
  "baseProfile",
  SvgAttributes.height,
  SvgAttributes.preserveAspectRatio,
  "version",
  SvgAttributes.viewBox,
  SvgAttributes.width,
  SvgAttributes.x,
  "xmlns",
  SvgAttributes.y,
]);

// Image attributes consumed while inlining it as a nested <svg> viewport.
const SvgImageViewportAttributes: ReadonlySet<string> = new Set([
  SvgAttributes.height,
  SvgAttributes.href,
  SvgAttributes.preserveAspectRatio,
  SvgAttributes.width,
  SvgAttributes.x,
  "xlink:href",
  SvgAttributes.y,
]);

// Attributes a clip or mask rectangle may carry while still being a plain box.
const SvgBoxRectAttributes: ReadonlySet<string> = new Set([
  SvgAttributes.fill,
  SvgAttributes.height,
  SvgAttributes.width,
  SvgAttributes.x,
  SvgAttributes.y,
]);

const SvgInvisiblePaints: ReadonlySet<string> = new Set([
  "none",
  "transparent",
]);
const SvgOpaqueWhites: ReadonlySet<string> = new Set([
  "#fff",
  "#ffffff",
  "white",
]);
const SvgNoOpStyle = "filter:none";
const SvgCompositeIn = "in";
const SvgZero = 0;

// Attributes that only carry a color, so two themes may disagree on them.
const SvgColorAttributes: ReadonlySet<string> = new Set([
  "color",
  SvgAttributes.fill,
  SvgAttributes.floodColor,
  "lighting-color",
  SvgAttributes.stopColor,
  SvgAttributes.stroke,
]);

// CSS properties through which a stylesheet can make a shape visible.
const SvgPaintProperties: ReadonlySet<string> = new Set([
  SvgAttributes.fill,
  SvgAttributes.filter,
  SvgAttributes.stroke,
  SvgAttributes.strokeWidth,
]);

const SvgThemes = {
  dark: "dark",
  darkMedia: "(prefers-color-scheme: dark)",
  light: "light",
} as const;

const SvgPatterns = {
  attributeReference: /url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/g,
  classSelector: /^\.([A-Za-z_][\w-]*)$/,
  currentColor: /currentColor/i,
  hrefReference: /^#(.+)$/,
  identifier: /[A-Za-z_][\w-]*/g,
  invisibleColor: /^(?:transparent|rgba?\([^)]*,\s*0(?:\.0*)?\s*\))$/i,
  space: /\s+/g,
  styleSeparator: /;$/,
  viewBox: /[\s,]+/,
} as const;

const SvgPrefixes = {
  className: "t",
  id: "i",
} as const;

const SvgWebpOptions = { effort: 6, lossless: true } as const;
const SvgRasterConcurrency = 4;

const SvgErrors = {
  optimize: "Failed to optimize the generated SVG.",
  parse: "Failed to parse the generated SVG.",
} as const;

export {
  SvgAttributes,
  SvgBoxRectAttributes,
  SvgColorAttributes,
  SvgCompositeIn,
  SvgDataUri,
  SvgErrors,
  SvgImageViewportAttributes,
  SvgInvisiblePaints,
  SvgMimeType,
  SvgNamespace,
  SvgNonPortableTags,
  SvgNoOpStyle,
  SvgOpaqueWhites,
  SvgOptimizationConfig,
  SvgPaintProperties,
  SvgPatterns,
  SvgPrefixes,
  SvgRasterConcurrency,
  SvgReferencedTags,
  SvgResourceTags,
  SvgShapeTags,
  SvgTags,
  SvgThemes,
  SvgViewportAttributes,
  SvgWebpOptions,
  SvgZero,
};
