import type { ReactNode } from "react";

const SvgReducedMotionStyle = (): ReactNode => (
  <style>
    {`
      @media (prefers-reduced-motion: reduce) {
        [style*="animation"] {
          animation: none !important;
          transform: none !important;
          opacity: 1 !important;
        }
      }
    `}
  </style>
);

export { SvgReducedMotionStyle };
