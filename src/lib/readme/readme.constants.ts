const ReadmeTemplate = { path: "README.md.j2" } as const;

const ReadmeErrors = {
  render: "Failed to render the README template.",
} as const;

export { ReadmeErrors, ReadmeTemplate };
