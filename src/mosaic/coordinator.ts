import {
  Coordinator,
  coordinator as getOrSetCoordinator,
  wasmConnector,
} from "@uwdata/mosaic-core";

// The Mosaic Coordinator is a singleton per page. wasmConnector lazily
// boots a DuckDB-WASM instance on first use. We register a single connector
// at startup so every plot section shares the same DuckDB connection (and
// therefore the same in-memory tables).
//
// Tables are created on demand by loadTable() below. Each plot section's
// data loader calls loadTable("hubble1929", "/data/hubble1929.csv") once,
// idempotently.

let connectorInitialized = false;
const loadedTables = new Set<string>();
const inflightLoads = new Map<string, Promise<void>>();

export function ensureCoordinator(): Coordinator {
  const c = getOrSetCoordinator() as Coordinator;
  if (!connectorInitialized) {
    c.databaseConnector(wasmConnector());
    connectorInitialized = true;
  }
  return c;
}

// Loads a CSV from a static URL into a DuckDB table.
// `skipHeaderLines` lets us skip the 6-line provenance comment block
// at the top of every dataset in /public/data.
export async function loadTable(
  tableName: string,
  url: string,
  options: { skipHeaderLines?: number } = {},
): Promise<void> {
  if (loadedTables.has(tableName)) return;
  const existing = inflightLoads.get(tableName);
  if (existing) return existing;

  const c = ensureCoordinator();
  const skip = options.skipHeaderLines ?? 0;

  // DuckDB-WASM fetches the URL through the host fetch(). An absolute URL
  // built from window.location.origin avoids any relative-path quirks when
  // the app is served from a sub-path.
  const absoluteUrl = new URL(url, window.location.origin).toString();

  // read_csv_auto handles the header detection; `skip=<n>` drops the 6-line
  // provenance comment block. We quote-escape the URL into the SQL literal.
  const sql = `
    CREATE TABLE IF NOT EXISTS ${tableName} AS
    SELECT * FROM read_csv_auto(
      '${absoluteUrl.replace(/'/g, "''")}',
      skip=${skip},
      header=true,
      sample_size=-1
    )
  `;

  const promise = c
    .exec(sql)
    .then(() => {
      loadedTables.add(tableName);
    })
    .finally(() => {
      inflightLoads.delete(tableName);
    });

  inflightLoads.set(tableName, promise);
  return promise;
}
