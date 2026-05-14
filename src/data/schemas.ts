import { z } from "zod";

// Runtime schemas for every dataset. Each plot's loader can call
// `parseRows(schema, rows)` to assert column shape after a SQL fetch,
// which catches silent column-rename drift between the simulate and
// fetch paths.

export const Hubble1929Row = z.object({
  name: z.string(),
  distance_mpc: z.number(),
  velocity_km_s: z.number(),
});
export type Hubble1929Row = z.infer<typeof Hubble1929Row>;
