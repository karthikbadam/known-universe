import type { ModuleMeta } from "./types";
import { cosmologyModule } from "./cosmology";
import { comingSoonModule } from "./_placeholder";

export const MODULES: readonly ModuleMeta[] = [
  cosmologyModule,
  comingSoonModule,
];

export function getModuleBySlug(slug: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getLiveModules(): readonly ModuleMeta[] {
  return MODULES.filter((m) => m.status === "live");
}
