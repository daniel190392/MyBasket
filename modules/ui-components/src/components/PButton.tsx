import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';

import { colors, typography, spacing } from '../theme';

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
        !isInteractive && styles.disabledContainer,
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
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryContainer: {
    backgroundColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
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
  disabledContainer: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
    opacity: 0.8,
  },
  disabledText: {
    color: colors.textDisabled,
  },
});
