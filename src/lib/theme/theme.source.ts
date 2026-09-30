import { readFileSync } from "node:fs";

const stylesheet: string = readFileSync(
  new URL("../../app/globals.css", import.meta.url),
  "utf8",
);

export { stylesheet };
