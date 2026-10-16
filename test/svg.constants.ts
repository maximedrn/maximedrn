import { DataUri, Encoding } from "@test/fixtures.constants.ts";

const SvgColors = {
  dark: "#0000ff",
  light: "#ff0000",
} as const;

const svgDataUri = (markup: string): string =>
  `${DataUri.svgBase64}${Buffer.from(markup).toString(Encoding.base64)}`;

const icon = (fill: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" aria-label="Icon" role="img" width="null" height="null" viewBox="0 0 2 2"><path d="M0 0h2v2H0z" fill="${fill}"/></svg>`;

const SvgInput = {
  classPainted: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20">
    <style>.t0 { stroke: #000; }</style>
    <rect x="0" y="0" width="40" height="20" fill="none" stroke-width="2" class="t0"/>
    <g class="t0"><rect x="5" y="5" width="10" height="10" fill="transparent"/></g>
  </svg>`,
  document: (
    light: string,
    dark: string,
  ): string => `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20">
    <style>@keyframes a-dark-0 { from { opacity: 0; } to { opacity: 1; } } @keyframes a-light-0 { from { opacity: 0; } to { opacity: 1; } } .dark { display: none; } @media (prefers-color-scheme: dark) { .light { display: none; } .dark { display: block; } }</style>
    <g class="dark"><g style="animation:a-dark-0 1s ease-in-out 0ms infinite both"><image width="40" height="20" x="0" y="0" href="${svgDataUri(dark)}"/></g></g>
    <g class="light"><g style="animation:a-light-0 1s ease-in-out 0ms infinite both"><image width="40" height="20" x="0" y="0" href="${svgDataUri(light)}"/></g></g>
  </svg>`,
  invalid: "<svg><g></svg>",
  invisible: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20">
    <defs><pattern id="satori_pattern_id_0" x="0" y="0" width="1" height="1" patternUnits="objectBoundingBox"><linearGradient id="satori_bg_0" x1="0" y1="0" x2="0" y2="1" spreadMethod="pad"><stop offset="0%" stop-color="transparent"/><stop offset="100%" stop-color="transparent"/></linearGradient><rect x="0" y="0" width="40" height="20" fill="url(#satori_bg_0)"/></pattern></defs>
    <mask id="satori_ms-id-0" maskUnits="userSpaceOnUse"><rect x="0" y="0" width="40" height="20" fill="#fff"/><rect x="0" y="0" width="40" height="20" fill="#000" stroke-width="0"/></mask>
    <defs><filter id="satori_s-id-0" x="0%" y="0%" width="100%" height="100%"><feGaussianBlur stdDeviation="0" result="b"/><feFlood flood-color="transparent" in="SourceGraphic" result="f"/><feComposite in="f" in2="b" operator="in"/></filter></defs>
    <g mask="url(#satori_ms-id-0)" filter="url(#satori_s-id-0)" opacity="1"><rect x="0" y="0" width="40" height="20" fill="#fff" stroke="#fff" stroke-width="0"/></g>
    <rect x="0" y="0" width="40" height="20" fill="transparent" style="filter:none"/>
    <rect x="0" y="0" width="40" height="20" fill="url(#satori_pattern_id_0)" style="filter:none"/>
    <defs><filter id="shadow"><feFlood flood-color="#000" result="f"/><feComposite in="f" in2="SourceAlpha" operator="in"/></filter></defs>
    <rect x="10" y="5" width="10" height="10" fill="#00f" filter="url(#shadow)"/>
  </svg>`,
  layer: (
    fill: string,
    width: number,
  ): string => `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20">
    <clipPath id="satori_cp-id-0"><rect x="20" y="0" width="20" height="20"/></clipPath>
    <mask id="satori_om-id-0"><rect x="20" y="0" width="20" height="20" fill="#fff"/></mask>
    <rect x="0" y="0" width="${String(width)}" height="20" fill="${fill}"/>
    <image x="20" y="0" width="20" height="20" href="data:image/svg+xml;utf8,${encodeURIComponent(icon(fill))}" preserveAspectRatio="none" style="filter:none" clip-path="url(#satori_cp-id-0)" mask="url(#satori_om-id-0)"/>
  </svg>`,
  raster: (
    png: string,
  ): string => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <image width="32" height="32" href="${png}"/>
  </svg>`,
  rasterSize: 32,
  rasterStep: 8,
  sameWidth: 20,
  shorterWidth: 10,
} as const;
const SvgExpected = {
  classPaintedShapes: 2,
  colorClass: /^t\d+$/,
  dark: [0, 0, 255],
  darkMedia: "(prefers-color-scheme:dark)",
  fillProperty: "fill",
  keyframes: 1,
  light: [255, 0, 0],
  pixel: { icon: { x: 30, y: 10 }, layer: { x: 5, y: 10 } },
  rasterChannels: 3,
  rasterColor: 128,
  themes: ["dark", "light"],
  visibleFilters: 1,
} as const;
const CssSyntax = {
  animatedSelector: /^\[style\*=(?:"animation"|'animation'|animation)\]$/,
  animation: "animation",
  darkSelector: ".dark",
  display: "display",
  infinite: "infinite",
  keyframes: "keyframes",
  media: "media",
  none: "none",
  opacity: "opacity",
  opacityValue: "1",
  reduce: "(prefers-reduced-motion:reduce)",
  space: /\s+/g,
  styleElement: /<style>[\s\S]*<\/style>/,
  transform: "transform",
} as const;
const SvgCases = {
  classPainted: "Keeps the invisible shapes a stylesheet class may paint.",
  distinct: "Keeps both theme groups when their drawings differ.",
  invalid: "Rejects malformed SVG through the Effect error channel.",
  invisible: "Removes the invisible paint Satori emits and keeps the rest.",
  layers: "Inlines the embedded SVG layers and icons into one document.",
  motion: "Keeps animations and adds effective reduced motion declarations.",
  raster: "Re-encodes embedded PNG images as pixel-identical lossless WebP.",
  suite: "SVG optimization.",
  themes: "Merges themes that only differ by colors into themed classes.",
} as const;

export { CssSyntax, SvgCases, SvgColors, SvgExpected, SvgInput };
