import type { Element } from "@xmldom/xmldom";
import type { Root } from "postcss";

/**
 * A rectangle in the user space of the element that draws it.
 */
interface SvgBox {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

/**
 * An SVG document embedded in an `<image>`, parsed and ready to be inlined.
 */
interface SvgEmbedded {
  readonly box: SvgBox;
  readonly root: Element;
  readonly viewBox: readonly number[];
}

/**
 * A `<style>` element together with its parsed stylesheet.
 */
interface SvgStylesheet {
  readonly css: Root;
  readonly element: Element;
}

/**
 * A color attribute on which the light and dark trees disagree.
 */
interface SvgThemeEdit {
  readonly attribute: string;
  readonly dark: string;
  readonly element: Element;
  readonly light: string;
}

/**
 * One themed color, applied through a class whose value depends on the
 * color scheme.
 */
interface SvgThemeColor {
  readonly attribute: string;
  readonly className: string;
  readonly dark: string;
  readonly light: string;
}

/**
 * Hands out ids that are unique across the host document.
 */
type SvgIdAllocator = () => string;

export type {
  SvgBox,
  SvgEmbedded,
  SvgIdAllocator,
  SvgStylesheet,
  SvgThemeColor,
  SvgThemeEdit,
};
