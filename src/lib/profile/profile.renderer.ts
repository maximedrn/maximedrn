import type { RenderableComponent } from "@maximedrn/react-to-svg";
import { createElement, type ReactNode } from "react";
import { ReadmeRoot } from "@/components/readme/readme.root.tsx";

/**
 * Creates a renderable component for the readme with the given portrait.
 *
 * @param {string} portrait - The URL of the portrait image to be displayed in
 *   the readme.
 * @returns {RenderableComponent} A renderable component that renders the
 *   readme with the specified portrait.
 */
const makeReadme =
  (portrait: string): RenderableComponent =>
  (): ReactNode =>
    createElement(ReadmeRoot, { portrait });

export { makeReadme };
