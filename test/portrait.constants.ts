const PortraitInput = {
  channels: 3,
  color: { b: 16, g: 32, r: 240 },
  invalid: "This is not an image.",
  large: { height: 564, width: 752 },
  orientation: 6,
  pixels: [255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255],
  rotated: { height: 3, width: 6 },
  small: { height: 2, width: 2 },
} as const;

const PortraitExpected = {
  format: "png",
  grayscaleChannels: 3,
  largeSize: 376,
  rotated: { height: 6, width: 3 },
  small: { height: 2, width: 2 },
} as const;
const PortraitCases = {
  grayscale:
    "Converts colored pixels to gray while preserving tonal variation.",
  invalid: "Keeps invalid image failures in the Effect error channel.",
  orientation: "Applies EXIF orientation before producing the portrait.",
  resize: "Crops large inputs to the portrait size.",
  small: "Preserves the dimensions of small inputs without enlargement.",
  suite: "Portrait rendering.",
} as const;
const ImageColorSpace = "srgb";

export { ImageColorSpace, PortraitCases, PortraitExpected, PortraitInput };
