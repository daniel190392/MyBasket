import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';

import { colors, typography, spacing, borderRadius } from '../theme';

export interface PButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  isDisabled?: boolean;
}

export default function PButton({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  isDisabled = false,
}: PButtonProps) {
  const isPrimary = variant === 'primary';
  const isInteractive = !isDisabled && !isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!isInteractive}
      style={[
        styles.base,
        isPrimary ? styles.primaryContainer : styles.secondaryContainer,
        isDisabled && styles.disabledContainer,
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary ? styles.primaryText : styles.secondaryText,
            isDisabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%',
  },
  primaryContainer: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  secondaryContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  disabledContainer: {
    backgroundColor: colors.backgroundDisabled,
    borderWidth: 1,
    borderColor: colors.borderDisabled,
    opacity: 0.7,
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.primary,
  },
  disabledText: {
    color: colors.textDisabled,
  },
});
