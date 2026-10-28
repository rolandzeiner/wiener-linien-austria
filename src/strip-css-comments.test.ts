// The production-build plugin that drops comments and indentation from Lit
// `css` templates. A wrong cut here breaks every card at load, and only in
// the shipped bundle: `vp test` and `npm run dev` run without the plugin.

import { describe, expect, it, vi } from "vite-plus/test";

import stripCssComments from "../scripts/strip-css-comments.mjs";

const ID = "/repo/src/card-styles.ts";

function transform(code: string, id = ID): string | null {
  const result = stripCssComments().transform(code, id);
  return result ? result.code : null;
}

describe("strip-css-comments", () => {
  it("drops comments, indentation and blank lines from a css template", () => {
    const code = [
      "export const s = css`",
      "  /* the card's frame */",
      "  :host {",
      "    display: block;",
      "",
      "    margin: 0 auto;",
      "  }",
      "`;",
    ].join("\n");
    expect(transform(code)).toBe(
      "export const s = css`:host {\ndisplay: block;\nmargin: 0 auto;\n}`;",
    );
  });

  it("matches the tag with a space before the backtick", () => {
    expect(transform("css `\n  a { b: c; }\n`")).toBe("css `a { b: c; }`");
  });

  it("strips every css template in the file and leaves the code between them alone", () => {
    const code =
      "const a = css`\n  x { y: z; }\n`;\nconst keep = 1;\nconst b = css`\n  /* c */\n`;";
    expect(transform(code)).toBe("const a = css`x { y: z; }`;\nconst keep = 1;\nconst b = css``;");
  });

  it("leaves a template with an interpolation untouched", () => {
    const code = "css`\n  /* kept */\n  a { color: ${c}; }\n`";
    expect(transform(code)).toBeNull();
  });

  it("does not end the template at an escaped backtick", () => {
    const code = "css`\n  a::before { content: '\\`'; }\n`";
    expect(transform(code)).toBe("css`a::before { content: '\\`'; }`");
  });

  it("stops at an unterminated template instead of guessing its end", () => {
    expect(transform("css`\n  /* never closed */")).toBeNull();
  });

  it("returns null when a template has nothing to strip", () => {
    expect(transform("css`a{b:c}`")).toBeNull();
  });

  it("leaves html templates alone", () => {
    expect(transform("html`\n  <!-- note -->\n  <p></p>\n`")).toBeNull();
  });

  it("only touches TypeScript files under src/", () => {
    const code = "css`\n  /* c */\n`";
    expect(transform(code, "/repo/node_modules/lit/index.ts")).toBeNull();
    expect(transform(code, "/repo/src/card-styles.js")).toBeNull();
  });

  it("reports the bytes it saved once per build, then starts over", () => {
    const plugin = stripCssComments();
    plugin.transform("css`\n  /* 1234 */\n`", ID);
    const warn = vi.fn();
    plugin.buildEnd.call({ warn });
    expect(warn).toHaveBeenCalledWith("strip-css-comments: removed 14 bytes");
    plugin.buildEnd.call({ warn });
    expect(warn).toHaveBeenCalledOnce();
  });
});
