import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  GestureResponderEvent,
} from 'react-native';

import { colors, spacing, borderRadius, shadows, opacity } from '../theme';

export interface PCardProps extends Omit<
  TouchableOpacityProps,
  'children' | 'disabled'
> {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  isClickable?: boolean;
}

export function PCard({
  children,
  onPress,
  isClickable = true,
  style,
  ...rest
}: PCardProps) {
  if (!isClickable) {
    return (
      <View style={[styles.card, styles.disabledCard, style]}>{children}</View>
    );
  }

  if (!onPress) {
    return <View style={[styles.card, style]}>{children}</View>;
  }

  return (
    <TouchableOpacity
      activeOpacity={opacity.pressed}
      {...rest}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm,
  },
  disabledCard: {
    opacity: opacity.muted,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    backgroundColor: colors.backgroundDisabled,
  },
});
