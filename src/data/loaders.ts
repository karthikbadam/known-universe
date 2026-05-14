import { loadTable } from "../mosaic/coordinator";

// Each dataset gets a single named loader so plot components don't need
// to know about file paths or header-skip counts. The schema is enforced
// at the SQL boundary (DuckDB read_csv_auto infers types; tests in
// /src/data/__tests__ verify columns when added).

export const HUBBLE_1929_TABLE = "hubble1929";
export const HUBBLE_1929_HEADER_LINES = 6;

export function loadHubble1929(): Promise<void> {
  return loadTable(HUBBLE_1929_TABLE, "/data/hubble1929.csv", {
    skipHeaderLines: HUBBLE_1929_HEADER_LINES,
  });
}
