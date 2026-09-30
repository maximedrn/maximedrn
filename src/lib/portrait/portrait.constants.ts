const PortraitErrors = {
  render: "Failed to render the grayscale portrait.",
} as const;

const PortraitMetrics = {
  mediaType: "data:image/png;base64,",
  size: 376,
} as const;

const PortraitPng = {
  compressionLevel: 9,
  effort: 10,
} as const;

export { PortraitErrors, PortraitMetrics, PortraitPng };
