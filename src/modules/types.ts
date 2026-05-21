import type { ReactNode } from 'react';

export type ModuleStatus = 'live' | 'soon';

export type ModuleCover =
  | { kind: 'image'; src: string; alt: string }
  | {
      kind: 'gradient';
      from: string;
      to: string;
      fromDark?: string;
      toDark?: string;
    };

export interface ModuleMeta {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  summary: string;
  heroLabel: string;
  status: ModuleStatus;
  cover?: ModuleCover;
  sections: () => ReactNode[];
}
