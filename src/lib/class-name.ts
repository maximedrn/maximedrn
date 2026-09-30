import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["sm", "md", "lg", "xl"] }],
      leading: [{ leading: ["sm", "md", "lg", "xl"] }],
    },
    theme: { spacing: ["sm", "md", "lg", "xl"] },
  },
});

/**
 * Merges and deduplicates Tailwind CSS class names, ensuring that the final
 * output is optimized for use in a React component or any other context where
 * class names are applied.
 *
 * @param {ClassValue[]} inputs - An array of class names or class name objects
 *   to be merged.
 * @returns {string} A single string containing the merged and deduplicated
 *   class names.
 */
const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

export { cn };
