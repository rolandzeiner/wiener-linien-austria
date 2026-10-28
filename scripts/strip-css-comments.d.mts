// Types for the plugin, so its tests type-check.
interface StripCssCommentsPlugin {
  name: string;
  transform(code: string, id: string): { code: string; map: null } | null;
  buildEnd(this: { warn(message: string): void }): void;
}

export default function stripCssComments(options?: { include?: string }): StripCssCommentsPlugin;
