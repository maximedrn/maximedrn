import tailwindConfig from "@config/tailwind.config.ts";
import type { RenderOptions, ThemeVariant } from "@maximedrn/react-to-svg";
import type { ThemeColors } from "@/lib/theme/theme.types.ts";

type SvgTailwindConfig = Exclude<
  NonNullable<RenderOptions["tailwindConfig"]>,
  (theme: ThemeVariant) => unknown
>;
type TailwindPlugin = NonNullable<SvgTailwindConfig["plugins"]>[number];

// Satori's Tailwind parser needs explicit gap utilities.
const svgTailwindConfig: SvgTailwindConfig = {
  ...tailwindConfig,
  plugins: [
    {
      handler: ({
        addUtilities,
      }: Parameters<TailwindPlugin["handler"]>[0]): void => {
        addUtilities(
          Object.fromEntries(
            Object.entries(tailwindConfig.theme.extend.spacing).map(
              ([name, gap]) => [`gap-${name}`, { gap }],
            ),
          ),
        );
      },
    },
  ],
};

/**
 * Creates a Tailwind configuration for SVG rendering by extending the base
 * Tailwind configuration with the provided theme colors.
 *
 * @param {ThemeColors} colors - The theme colors to be added to the Tailwind
 *   configuration.
 * @returns {SvgTailwindConfig} A Tailwind configuration object for SVG
 *   rendering that includes the provided theme colors.
 */
const createSvgTailwindConfig = (colors: ThemeColors): SvgTailwindConfig => ({
  ...svgTailwindConfig,
  theme: {
    ...tailwindConfig.theme,
    extend: { ...tailwindConfig.theme.extend, colors },
  },
});

export { createSvgTailwindConfig, svgTailwindConfig };
