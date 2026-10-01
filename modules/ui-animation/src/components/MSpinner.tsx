import React from 'react';
import { Animated, ViewProps } from 'react-native';

import { borderRadius, colors, motion } from '../theme';
import { useLoopingValue } from './internal/useLoopingValue';

export interface MSpinnerProps extends ViewProps {
  size?: number;
  color?: string;
}

export function MSpinner({
  size = motion.size.spinner,
  color = colors.primary,
  style,
  ...rest
}: MSpinnerProps) {
  const progress = useLoopingValue({
    duration: motion.duration.spin,
    easing: motion.easing.linear,
    active: true,
    reverse: false,
  });

  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      {...rest}
      style={[
        {
          width: size,
          height: size,
          borderRadius: borderRadius.full,
          borderWidth: motion.size.spinnerStroke,
          borderColor: colors.primarySoft,
          borderTopColor: color,
          transform: [{ rotate }],
        },
        style,
      ]}
    />
  );
}
