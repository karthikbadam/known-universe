// Generic table-spec helpers. Module-specific table definitions live next
// to the modules that own them (e.g. `src/modules/cosmology/data/tables.ts`).
// The `# provenance header` convention is uniform: 6 lines across every file
// in /public/data.

export interface TableSpec {
  /** Table name registered inside DuckDB. */
  readonly name: string;
  /** Public URL fetched at load time. */
  readonly url: string;
  /** Number of `#`-prefixed header lines to skip. */
  readonly skipHeaderLines: number;
}

export const HEADER_LINES = 6;

export function defineTable(name: string, file: string): TableSpec {
  // BASE_URL always ends with `/` (Vite guarantee). In production on GitHub
  // Pages it's `/known-universe/`; in dev it's `/`. Either way this resolves
  // to the correct absolute path so DuckDB-WASM can fetch the CSV.
  return {
    name,
    url: `${import.meta.env.BASE_URL}data/${file}`,
    skipHeaderLines: HEADER_LINES,
  };
}
