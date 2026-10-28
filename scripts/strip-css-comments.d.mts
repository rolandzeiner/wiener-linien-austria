// Hand-written types for strip-css-comments.mjs, so its tests type-check.
// Keep them in step with what stripCssComments() returns.
interface StripCssCommentsPlugin {
  name: string;
  transform(code: string, id: string): { code: string; map: null } | null;
  buildEnd(this: { warn(message: string): void }): void;
}

export default function stripCssComments(options?: { include?: string }): StripCssCommentsPlugin;
