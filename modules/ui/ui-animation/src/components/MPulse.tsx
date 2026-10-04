import React from 'react';
import { Animated, ViewProps } from 'react-native';

import { motion } from '../theme';
import { useLoopingValue } from './internal/useLoopingValue';

export interface MPulseProps extends ViewProps {
  active?: boolean;
}

export function MPulse({
  active = true,
  style,
  children,
  ...rest
}: MPulseProps) {
  const progress = useLoopingValue({
    duration: motion.duration.loop,
    easing: motion.easing.inOut,
    active,
    reverse: true,
  });

  const scale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, motion.scale.pulse],
  });

  return (
    <Animated.View {...rest} style={[style, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}
