import { defineTable } from "../../../data/loaders";

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
