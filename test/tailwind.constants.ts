import type { CSSProperties } from "react";

const TailwindCase =
  "Applies semantic gaps and palette overrides in an actual SVG render.";
const TailwindFixture = {
  classes: { child: "flex bg-primary", root: "flex gap-lg" },
  colors: { primary: "#123456" },
  frame: { height: 20, width: 80 },
  style: { height: 20, width: 20 } satisfies CSSProperties,
} as const;
// Two 20px boxes separated by the 24px semantic large gap. Pixel positions
// are established from the fixture geometry, not by reading Tailwind config.
const TailwindExpected = {
  channels: 4,
  gap: [0, 0, 0, 0],
  gapX: 30,
  painted: [18, 52, 86, 255],
  secondBoxX: 44,
} as const;

export { TailwindCase, TailwindExpected, TailwindFixture };
