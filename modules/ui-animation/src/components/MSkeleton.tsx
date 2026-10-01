import React from 'react';
import { Animated, DimensionValue, ViewProps } from 'react-native';

import { borderRadius, colors } from 'ui-components';

import { motion } from '../theme';
import { useLoopingValue } from './internal/useLoopingValue';

export interface MSkeletonProps extends ViewProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
}

export function MSkeleton({
  width = '100%',
  height = motion.size.skeletonHeight,
  radius = borderRadius.sm,
  style,
  ...rest
}: MSkeletonProps) {
  const progress = useLoopingValue({
    duration: motion.duration.loop,
    easing: motion.easing.inOut,
    active: true,
    reverse: true,
  });

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [motion.opacity.visible, motion.opacity.skeletonLow],
  });

  return (
    <Animated.View
      {...rest}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.skeleton,
        },
        style,
        { opacity },
      ]}
    />
  );
}
