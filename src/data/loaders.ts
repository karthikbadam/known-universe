import { loadTable } from "../mosaic/coordinator";

// One definition per dataset. Components import the `TableSpec` and pass
// it to `useDataTable` rather than retyping name + URL + skip count at
// every call site. The `# provenance header` convention is uniform:
// 6 lines across every file in /public/data.

export interface TableSpec {
  /** Table name registered inside DuckDB. */
  readonly name: string;
  /** Public URL fetched at load time. */
  readonly url: string;
  /** Number of `#`-prefixed header lines to skip. */
  readonly skipHeaderLines: number;
}

const HEADER_LINES = 6;

function defineTable(name: string, file: string): TableSpec {
  // BASE_URL always ends with `/` (Vite guarantee). In production on GitHub
  // Pages it's `/known-universe/`; in dev it's `/`. Either way this resolves
  // to the correct absolute path so DuckDB-WASM can fetch the CSV.
  return {
    name,
    url: `${import.meta.env.BASE_URL}data/${file}`,
    skipHeaderLines: HEADER_LINES,
  };
}

export const TABLES = {
  hubble1929: defineTable("hubble1929", "hubble1929.csv"),
  planckDl: defineTable("planck_dl", "planck_dl.csv"),
  bbnGrid: defineTable("bbn_grid", "bbn_grid.csv"),
  bbnObserved: defineTable("bbn_observed", "bbn_observed.csv"),
  pantheonPlus: defineTable("pantheon_plus", "pantheon_plus.csv"),
  sparcGalaxies: defineTable("sparc_galaxies", "sparc_galaxies.csv"),
  bossXi: defineTable("boss_xi", "boss_xi.csv"),
  gw150914: defineTable("gw150914_strain", "gw150914_strain.csv"),
} as const;

// Backwards-compatible imperative loaders. New plot components should
// use `useDataTable(TABLES.foo)`; these stay for tests + one-off scripts.

export const HUBBLE_1929_TABLE = TABLES.hubble1929.name;
export const PLANCK_DL_TABLE = TABLES.planckDl.name;

export function loadHubble1929(): Promise<void> {
  return loadTable(TABLES.hubble1929.name, TABLES.hubble1929.url, {
    skipHeaderLines: TABLES.hubble1929.skipHeaderLines,
  });
}

export function loadPlanckDl(): Promise<void> {
  return loadTable(TABLES.planckDl.name, TABLES.planckDl.url, {
    skipHeaderLines: TABLES.planckDl.skipHeaderLines,
  });
}
