import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ActivityIndicator,
  View,
} from 'react-native';

import {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  controlHeight,
  iconSize,
  opacity,
} from '../theme';
import { IconName } from './iconShapes';
import { PIcon } from './PIcon';

export interface PButtonProps extends Omit<
  TouchableOpacityProps,
  'children' | 'disabled'
> {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary';
  /** Shown before the title, in the same color as the text. */
  icon?: IconName;
  isLoading?: boolean;
  isDisabled?: boolean;
}

function getTextColor(isPrimary: boolean, isDisabled: boolean): string {
  if (isDisabled) return colors.textDisabled;
  return isPrimary ? colors.white : colors.primary;
}

export function PButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  isLoading = false,
  isDisabled = false,
  style,
  ...rest
}: PButtonProps) {
  const isPrimary = variant === 'primary';
  const isInteractive = !isDisabled && !isLoading;
  const textColor = getTextColor(isPrimary, isDisabled);

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
        <View style={styles.content}>
          {icon && <PIcon name={icon} size={iconSize.md} color={textColor} />}
          <Text style={[styles.text, { color: textColor }]}>{title}</Text>
        </View>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});
