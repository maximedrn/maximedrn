const Encoding = { base64: "base64", utf8: "utf8" } as const;
const Text = { empty: "", newline: "\n" } as const;
const DataUri = {
  png: "data:image/png;base64,",
  svg: "data:image/svg+xml,",
  svgBase64: "data:image/svg+xml;base64,",
} as const;
const Xml = {
  attributes: {
    alt: "alt",
    className: "class",
    fill: "fill",
    href: "href",
    src: "src",
    width: "width",
  },
  mimeType: "image/svg+xml",
  tags: {
    all: "*",
    anchor: "a",
    group: "g",
    image: "image",
    img: "img",
    rect: "rect",
    style: "style",
    svg: "svg",
  },
} as const;
const Files = {
  input: "portrait.png",
  missing: "missing.png",
  output: "output",
  prefix: "mosaic-tests-",
  readme: "README.md",
  svg: "assets/profile.svg",
} as const;
const FixtureErrors = {
  attribute: (name: string): string => `Missing XML attribute: ${name}.`,
  dataUri: "Unsupported image data URI.",
  root: "Missing XML root element.",
} as const;

export { DataUri, Encoding, Files, FixtureErrors, Text, Xml };
