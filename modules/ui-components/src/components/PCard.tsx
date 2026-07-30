import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';

import { colors, spacing, borderRadius, shadows } from '../theme';

export interface PCardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  isClickable?: boolean;
}

export function PCard({ children, onPress, isClickable = true }: PCardProps) {
  const canClick = isClickable && Boolean(onPress);

  if (!canClick) {
    return (
      <View style={[styles.card, !isClickable && styles.disabledCard]}>
        {children}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card]}
      activeOpacity={0.7}
      disabled={!isClickable}
      onPress={onPress}
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
    opacity: 0.6,
  },
});
