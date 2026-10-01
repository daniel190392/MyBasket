import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';

import {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  controlHeight,
  opacity,
} from '../theme';

export interface PButtonProps extends Omit<
  TouchableOpacityProps,
  'children' | 'disabled'
> {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function PButton({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  isDisabled = false,
  style,
  ...rest
}: PButtonProps) {
  const isPrimary = variant === 'primary';
  const isInteractive = !isDisabled && !isLoading;

  return (
    <TouchableOpacity
      activeOpacity={opacity.pressedLight}
      {...rest}
      onPress={onPress}
      disabled={!isInteractive}
      style={[
        styles.base,
        isPrimary ? styles.primaryContainer : styles.secondaryContainer,
        isDisabled && styles.disabledContainer,
        style,
      ]}
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
    minHeight: controlHeight.md,
    width: '100%',
  },
  primaryContainer: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
  secondaryContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: borderWidth.medium,
    borderColor: colors.primary,
  },
  disabledContainer: {
    backgroundColor: colors.backgroundDisabled,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderDisabled,
    opacity: opacity.disabled,
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
