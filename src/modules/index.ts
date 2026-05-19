import type { ModuleMeta } from './types';

// TODO: register module entries here (e.g. cosmology) as they are extracted
// into their own folders under src/modules/<slug>/.
export const MODULES: readonly ModuleMeta[] = [];

export function getModuleBySlug(slug: string): ModuleMeta | undefined {
  return MODULES.find((m) => m.slug === slug);
}

export function getLiveModules(): readonly ModuleMeta[] {
  return MODULES.filter((m) => m.status === 'live');
}
