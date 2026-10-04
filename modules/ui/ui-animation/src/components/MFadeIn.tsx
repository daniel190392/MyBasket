import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';

import { motion } from '../theme';

export interface MFadeInProps extends ViewProps {
  delay?: number;
  duration?: number;
}

export function MFadeIn({
  delay = 0,
  duration = motion.duration.normal,
  style,
  children,
  ...rest
}: MFadeInProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      delay,
      duration,
      easing: motion.easing.decelerate,
      useNativeDriver: true,
    });

    animation.start();

    return () => animation.stop();
  }, [progress, delay, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [motion.distance.enter, 0],
  });

  return (
    <Animated.View
      {...rest}
      style={[style, { opacity: progress, transform: [{ translateY }] }]}
    >
      {children}
    </Animated.View>
  );
}
