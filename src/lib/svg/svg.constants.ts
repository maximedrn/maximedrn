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
          inlineStyles: false,
          removeHiddenElems: false,
        },
      },
    },
  ],
};

const SvgDataUriConfig: Config = {
  ...SvgOptimizationConfig,
  datauri: "enc",
};

const SvgEmbeddedPattern = /data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/g;

const SvgErrors = {
  optimize: "Failed to optimize the generated SVG.",
} as const;

export {
  SvgDataUriConfig,
  SvgEmbeddedPattern,
  SvgErrors,
  SvgOptimizationConfig,
};
