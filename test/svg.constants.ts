const SvgInput = {
  document: (
    layer: string,
  ): string => `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20">
    <style>.dark { display: none; } @media (prefers-color-scheme: dark) { .dark { display: inline; } .light { display: none; } } @keyframes pulse { from { opacity: 0; } to { opacity: 1; } }</style>
    <g class="light"><image width="20" height="20" href="${layer}"/></g>
    <g class="dark"><image width="20" height="20" href="${layer}"/></g>
    <g style="animation: pulse 1s infinite"><rect width="4" height="4" fill="blue"/></g>
  </svg>`,
  invalid: "<svg><g></svg>",
  layer:
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="#ff0000"/></svg>',
} as const;
const SvgExpected = {
  color: [255, 0, 0],
  imageCount: 2,
  themes: ["dark", "light"],
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
  transform: "transform",
} as const;
const SvgCases = {
  invalid: "Rejects malformed SVG through the Effect error channel.",
  layers: "Optimizes embedded layers and preserves the theme classes.",
  motion: "Keeps animations and adds effective reduced motion declarations.",
  suite: "SVG optimization.",
} as const;

export { CssSyntax, SvgCases, SvgExpected, SvgInput };
