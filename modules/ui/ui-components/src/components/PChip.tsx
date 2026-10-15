import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

import {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  opacity,
} from '../theme';

export interface PChipProps extends Omit<
  TouchableOpacityProps,
  'children' | 'disabled'
> {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  isSelected?: boolean;
  isDisabled?: boolean;
}

export function PChip({
  label,
  onPress,
  isSelected = false,
  isDisabled = false,
  style,
  ...rest
}: PChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={opacity.pressedLight}
      accessibilityRole="button"
      {...rest}
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        isSelected ? styles.selectedContainer : styles.unselectedContainer,
        isDisabled && styles.disabledContainer,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          isSelected ? styles.selectedText : styles.unselectedText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedContainer: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unselectedContainer: {
    backgroundColor: colors.surfaceInput,
    borderColor: colors.border,
  },
  disabledContainer: {
    opacity: opacity.disabled,
  },
  text: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  selectedText: {
    color: colors.white,
  },
  unselectedText: {
    color: colors.textSecondary,
  },
});
