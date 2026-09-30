import type { ClassValue } from "clsx";

const ClassNameSuite = "Semantic Tailwind classes.";
const ClassNameCases: readonly {
  readonly expected: string;
  readonly inputs: readonly ClassValue[];
  readonly name: string;
}[] = [
  {
    expected: "flex items-center",
    inputs: [false, null, ["flex", { hidden: false, "items-center": true }]],
    name: "Flattens conditional and nested classes.",
  },
  {
    expected: "text-md text-primary",
    inputs: ["text-sm", "text-md", "text-primary"],
    name: "Replaces semantic font sizes while preserving text colors.",
  },
  {
    expected: "leading-xl",
    inputs: ["leading-sm", "leading-xl"],
    name: "Resolves conflicting semantic line heights.",
  },
  {
    expected: "p-lg gap-xl",
    inputs: ["p-sm", "p-lg", "gap-md", "gap-xl"],
    name: "Resolves spacing conflicts in each utility group.",
  },
  {
    expected: "p-sm sm:p-xl",
    inputs: ["p-sm", "sm:p-md", "sm:p-xl"],
    name: "Keeps base spacing independent from responsive spacing.",
  },
];

export { ClassNameCases, ClassNameSuite };
