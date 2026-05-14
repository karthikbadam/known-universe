/// <reference types="vite/client" />

// Mosaic packages ship JSDoc-typed JS without first-class .d.ts files for
// every export. Declare the bare-minimum surface area we use so TS strict
// can compile. Refine these as the codebase grows.
declare module "@uwdata/vgplot" {
  export const plot: (...directives: unknown[]) => HTMLElement;
  export const dot: (source: unknown, channels?: unknown) => unknown;
  export const line: (source: unknown, channels?: unknown) => unknown;
  export const ruleX: (data: unknown, channels?: unknown) => unknown;
  export const ruleY: (data: unknown, channels?: unknown) => unknown;
  export const from: (table: string, options?: unknown) => unknown;
  export const sql: (
    strings: TemplateStringsArray,
    ...exprs: unknown[]
  ) => unknown;
  export const xLabel: (s: string) => unknown;
  export const yLabel: (s: string) => unknown;
  export const xDomain: (d: ReadonlyArray<number>) => unknown;
  export const yDomain: (d: ReadonlyArray<number>) => unknown;
  export const width: (n: number) => unknown;
  export const height: (n: number) => unknown;
  export const marginLeft: (n: number) => unknown;
  export const marginRight: (n: number) => unknown;
  export const marginTop: (n: number) => unknown;
  export const marginBottom: (n: number) => unknown;
}
