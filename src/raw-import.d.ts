// Vite — and therefore Vitest — resolves a `?raw` import to the file's contents
// as a string. Declared here so the catalogue guard test can read source files
// without pulling in `@types/node`: this tsconfig targets the DOM, and adding
// Node's globals just to call readFileSync is a heavy answer to a small need.
declare module "*?raw" {
  const content: string;
  export default content;
}
