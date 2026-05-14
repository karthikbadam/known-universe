import { useEffect, useState } from "react";

import { ensureCoordinator, loadTable } from "./coordinator";

interface UseDataTableResult {
  ready: boolean;
  error: string | null;
}

/**
 * Boots the Mosaic coordinator (idempotent) and loads a single CSV into
 * a DuckDB-WASM table on mount. Returns a `{ ready, error }` state pair
 * the consumer can branch on. Every plot section that depends on a
 * CSV/JSON dataset uses this — keeps the load/error handshake in one place.
 */
export function useDataTable(
  tableName: string,
  url: string,
  options: { skipHeaderLines?: number } = {},
): UseDataTableResult {
  const [ready, setReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const skip = options.skipHeaderLines ?? 0;

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);
    (async () => {
      try {
        ensureCoordinator();
        await loadTable(tableName, url, { skipHeaderLines: skip });
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tableName, url, skip]);

  return { ready, error };
}
