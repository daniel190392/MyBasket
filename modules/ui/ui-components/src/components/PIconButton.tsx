import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native';

import {
  colors,
  borderRadius,
  iconButtonSize,
  iconSize,
  opacity,
} from '../theme';
import { IconName } from './iconShapes';
import { PIcon } from './PIcon';

export interface PIconButtonProps extends Omit<
  TouchableOpacityProps,
  'children' | 'disabled' | 'accessibilityLabel'
> {
  icon: IconName;
  onPress: (event: GestureResponderEvent) => void;
  // Required because the button has no visible text for screen readers.
  accessibilityLabel: string;
  isDisabled?: boolean;
}

export function PIconButton({
  icon,
  onPress,
  accessibilityLabel,
  isDisabled = false,
  style,
  ...rest
}: PIconButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={opacity.pressedLight}
      accessibilityRole="button"
      {...rest}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.base, isDisabled && styles.disabledContainer, style]}
    >
      <PIcon name={icon} size={iconSize.lg} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    width: iconButtonSize,
    height: iconButtonSize,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.softHighlight,
  },
  disabledContainer: {
    opacity: opacity.disabled,
  },
});
