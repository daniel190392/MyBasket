import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, typography, spacing, borderRadius } from '../theme';

export type BadgeVariant = 'important' | 'warning' | 'informative';

const VARIANT_COLORS: Record<BadgeVariant, string> = {
  important: colors.secondary,
  warning: colors.primary,
  informative: colors.textPrimary,
};

const getOpacityColor = (hexColor: string, opacityHex = '26') => {
  if (hexColor.startsWith('#') && hexColor.length === 7) {
    return `${hexColor}${opacityHex}`;
  }
  return hexColor;
};

export interface PBadgeProps {
  title: string;
  variant?: BadgeVariant;
}

export default function PBadge({ title, variant = 'important' }: PBadgeProps) {
  const textColor = VARIANT_COLORS[variant] || VARIANT_COLORS.informative;
  const backgroundColor = getOpacityColor(textColor, '20');

  return (
    <View style={[styles.badge, { backgroundColor: backgroundColor }]}>
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
