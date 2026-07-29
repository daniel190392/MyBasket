import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';

import { colors, typography, spacing } from '../theme';

export interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
}: ButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[
        styles.base,
        isPrimary ? styles.primaryContainer : styles.secondaryContainer,
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
});
