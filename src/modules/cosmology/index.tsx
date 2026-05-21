import type { ModuleMeta } from '../types';

import { BAOFeature } from './plots/BAOFeature';
import { BBNAbundances } from './plots/BBNAbundances';
import { CMBMap } from './plots/CMBMap';
import { CMBPowerSpectrum } from './plots/CMBPowerSpectrum';
import { EHTShadow } from './plots/EHTShadow';
import { GW150914 } from './plots/GW150914';
import { HubbleDiagram } from './plots/HubbleDiagram';
import { LCDMSynthesis } from './plots/LCDMSynthesis';
import { RotationCurves } from './plots/RotationCurves';
import { SupernovaHubble } from './plots/SupernovaHubble';

export const cosmologyModule: ModuleMeta = {
  id: 'cosmology',
  slug: 'cosmology',
  title: 'Cosmology',
  heroLabel: 'Module 01 / Cosmology',
  tagline: 'Ten plots build ΛCDM. Tune the parameters yourself.',
  summary:
    'Known Universe is an interactive journal of canonical visualizations in scientific fields. Cosmology is the first of many modules. One scroll through the visualizations that turned cosmology from philosophy into a six-parameter model. Each plot opens with the scientific question it answers, then shows the math, then the data, then sliders so you can see what changes when a parameter moves.',
  status: 'live',
  cover: { kind: 'gradient', from: '#0a0a0a', to: '#1a1a2e' },
  sections: () => [
    <HubbleDiagram key="hubble" />,
    <BBNAbundances key="bbn" />,
    <CMBMap key="cmb-map" />,
    <CMBPowerSpectrum key="cmb-power" />,
    <SupernovaHubble key="supernova" />,
    <RotationCurves key="rotation" />,
    <BAOFeature key="bao" />,
    <EHTShadow key="eht" />,
    <GW150914 key="gw150914" />,
    <LCDMSynthesis key="lcdm" />,
  ],
};
