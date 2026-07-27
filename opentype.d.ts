/**
 * opentype.js v2 ships no bundled types and there is no @types package for it,
 * so `await import("opentype.js")` was an implicit-any and failed
 * `next build`'s type check (it never surfaced in dev, only in the production
 * build). Only the surface Signature.tsx actually uses is declared.
 */
declare module "opentype.js" {
  export interface BoundingBox {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }

  export interface Path {
    getBoundingBox(): BoundingBox;
    /** @param decimalPlaces digits kept per coordinate */
    toPathData(decimalPlaces?: number): string;
  }

  export interface Font {
    getPath(
      text: string,
      x: number,
      y: number,
      fontSize: number,
      options?: Record<string, unknown>,
    ): Path;
  }

  export function parse(buffer: ArrayBuffer): Font;

  const _default: { parse: typeof parse };
  export default _default;
}
