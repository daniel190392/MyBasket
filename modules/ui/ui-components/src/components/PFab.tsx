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
  controlHeight,
  iconSize,
  opacity,
  shadows,
} from '../theme';
import { IconName } from './iconShapes';
import { PIcon } from './PIcon';

export interface PFabProps extends Omit<
  TouchableOpacityProps,
  'children' | 'disabled'
> {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  icon?: IconName;
  isDisabled?: boolean;
}

// Placement (absolute position, safe-area insets) is left to the consumer, as
// it depends on the screen the button floats over.
export function PFab({
  label,
  onPress,
  icon,
  isDisabled = false,
  style,
  ...rest
}: PFabProps) {
  return (
    <TouchableOpacity
      activeOpacity={opacity.pressedLight}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...rest}
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, isDisabled && styles.disabledContainer, style]}
    >
      {icon ? (
        <PIcon name={icon} size={iconSize.lg} color={colors.white} />
      ) : null}
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    minHeight: controlHeight.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    ...shadows.md,
  },
  disabledContainer: {
    opacity: opacity.disabled,
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
