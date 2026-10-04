import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';

import {
  colors,
  typography,
  spacing,
  borderRadius,
  withOpacity,
} from '../theme';

export type BadgeVariant = 'important' | 'warning' | 'informative';

const BACKGROUND_OPACITY = 0.125;

const VARIANT_COLORS: Record<BadgeVariant, string> = {
  important: colors.secondary,
  warning: colors.primary,
  informative: colors.textPrimary,
};

export interface PBadgeProps extends ViewProps {
  title: string;
  variant?: BadgeVariant;
}

export function PBadge({
  title,
  variant = 'important',
  style,
  ...rest
}: PBadgeProps) {
  const textColor = VARIANT_COLORS[variant];
  const backgroundColor = withOpacity(textColor, BACKGROUND_OPACITY);

  return (
    <View {...rest} style={[styles.badge, { backgroundColor }, style]}>
      <Text style={[styles.badgeText, { color: textColor }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
});
