import React, { useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { motion } from '../theme';

export interface MPressableScaleProps extends Omit<
  PressableProps,
  'children' | 'style'
> {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function MPressableScale({
  children,
  style,
  onPressIn,
  onPressOut,
  ...rest
}: MPressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (toValue: number) =>
    Animated.timing(scale, {
      toValue,
      duration: motion.duration.fast,
      easing: motion.easing.standard,
      useNativeDriver: true,
    }).start();

  const handlePressIn = (event: GestureResponderEvent) => {
    animateTo(motion.scale.pressed);
    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    animateTo(1);
    onPressOut?.(event);
  };

  return (
    <Pressable {...rest} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
