import type { ModuleMeta } from "../types";

import { BAOFeature } from "./plots/BAOFeature";
import { BBNAbundances } from "./plots/BBNAbundances";
import { CMBMap } from "./plots/CMBMap";
import { CMBPowerSpectrum } from "./plots/CMBPowerSpectrum";
import { EHTShadow } from "./plots/EHTShadow";
import { GW150914 } from "./plots/GW150914";
import { HubbleDiagram } from "./plots/HubbleDiagram";
import { LCDMSynthesis } from "./plots/LCDMSynthesis";
import { RotationCurves } from "./plots/RotationCurves";
import { SupernovaHubble } from "./plots/SupernovaHubble";

export const cosmologyModule: ModuleMeta = {
  id: "cosmology",
  slug: "cosmology",
  title: "Cosmology",
  heroLabel: "Module 01",
  tagline: "Ten plots build ΛCDM. Tune the parameters yourself.",
  summary:
    "Cosmology turned from a philosophy into a six-parameter ΛCDM model in modern times. Let's explore the fundamental questions that guide a deep understanding in this field. The sections below represent some of my understanding as I learn the fundamentals of this field, hence interpret with caution.",
  status: "live",
  cover: {
    kind: "gradient",
    from: "#fef3c7",
    to: "#c7d2fe",
    fromDark: "#0a0a0a",
    toDark: "#1a1a2e",
  },
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
