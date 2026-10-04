import { Easing } from 'react-native';

export const motion = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 600,
    loop: 1000,
    spin: 800,
  },
  easing: {
    standard: Easing.bezier(0.4, 0, 0.2, 1),
    decelerate: Easing.out(Easing.cubic),
    linear: Easing.linear,
    inOut: Easing.inOut(Easing.ease),
  },
  distance: {
    enter: 16,
  },
  scale: {
    pressed: 0.96,
    pulse: 1.08,
  },
  opacity: {
    hidden: 0,
    visible: 1,
    skeletonLow: 0.4,
  },
  size: {
    spinner: 24,
    spinnerStroke: 3,
    skeletonHeight: 16,
  },
} as const;
