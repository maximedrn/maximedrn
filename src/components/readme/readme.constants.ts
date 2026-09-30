import { type Animation, Easing } from "@maximedrn/react-to-svg";

const AvailabilityPulse: Animation = {
  delayMs: 0,
  durationMs: 2200,
  easing: Easing.easeInOut,
  keyframes: [
    { at: 0, opacity: 1, scale: 1 },
    { at: 0.5, opacity: 0.4, scale: 0.8 },
    { at: 1, opacity: 1, scale: 1 },
  ],
  perspective: 800,
  repeat: Number.POSITIVE_INFINITY,
};

const PortraitEntrance: Animation = {
  delayMs: 160,
  durationMs: 900,
  easing: Easing.easeOut,
  keyframes: [
    { at: 0, opacity: 0, scale: 0.96, translateY: 10 },
    { at: 1, opacity: 1, scale: 1, translateY: 0 },
  ],
  perspective: 800,
  repeat: 0,
};

const PortraitDrift: Animation = {
  delayMs: 900,
  durationMs: 6400,
  easing: Easing.easeInOut,
  keyframes: [
    { at: 0, rotate: 0, translateY: 0 },
    { at: 0.25, rotate: -0.4, translateY: -2 },
    { at: 0.5, rotate: 0, translateY: -4 },
    { at: 0.75, rotate: 0.4, translateY: -2 },
    { at: 1, rotate: 0, translateY: 0 },
  ],
  perspective: 800,
  repeat: Number.POSITIVE_INFINITY,
};

const SectionEntrance: Animation = {
  delayMs: 0,
  durationMs: 650,
  easing: Easing.easeOut,
  keyframes: [
    { at: 0, opacity: 0, translateY: 6 },
    { at: 1, opacity: 1, translateY: 0 },
  ],
  perspective: 800,
  repeat: 0,
};

const ReadmeAnimations = {
  availabilityPulse: AvailabilityPulse,
  portraitDrift: PortraitDrift,
  portraitEntrance: PortraitEntrance,
  sectionEntrance: SectionEntrance,
} as const;

const ReadmeTimings = { about: 180, footer: 540, stack: 360 } as const;

export { ReadmeAnimations, ReadmeTimings };
