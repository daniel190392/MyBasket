import { useEffect, useRef } from 'react';
import { Animated, EasingFunction } from 'react-native';

interface LoopingValueOptions {
  duration: number;
  easing: EasingFunction;
  active: boolean;
  reverse: boolean;
}

/**
 * Animated value looping from 0 to 1. With `reverse` it goes back to 0
 * (ping-pong); otherwise it restarts from 0 on every cycle.
 */
export const useLoopingValue = ({
  duration,
  easing,
  active,
  reverse,
}: LoopingValueOptions) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;

    const forward = Animated.timing(progress, {
      toValue: 1,
      duration,
      easing,
      useNativeDriver: true,
    });
    const backward = Animated.timing(progress, {
      toValue: 0,
      duration,
      easing,
      useNativeDriver: true,
    });
    const cycle = reverse ? Animated.sequence([forward, backward]) : forward;
    const loop = Animated.loop(cycle);

    loop.start();

    return () => {
      loop.stop();
      progress.setValue(0);
    };
  }, [progress, duration, easing, active, reverse]);

  return progress;
};
