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

export const PlanckDlRow = z.object({
  ell: z.number(),
  Dl: z.number(),
  Dl_lower: z.number(),
  Dl_upper: z.number(),
  sigma: z.number(),
});
export type PlanckDlRow = z.infer<typeof PlanckDlRow>;
