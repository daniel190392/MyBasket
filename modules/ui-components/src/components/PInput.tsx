import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';

import {
  colors,
  spacing,
  borderRadius,
  borderWidth,
  controlHeight,
  opacity,
  textPresets,
  typography,
} from '../theme';

import type { ReactNode } from 'react';

type FocusEvent = NativeSyntheticEvent<TextInputFocusEventData>;

export interface PInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

export const PInput = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  disabled = false,
  placeholderTextColor = colors.textMuted,
  ...rest
}: PInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: FocusEvent) => {
    if (disabled) return;
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = Boolean(error);
  const getContainerStateStyle = () => {
    if (disabled) return styles.disabledContainer;
    if (hasError) return styles.errorContainer;
    if (isFocused) return styles.focusedContainer;
    return styles.defaultContainer;
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {Boolean(label) && (
        <Text style={[styles.label, disabled && styles.disabledText]}>
          {label}
        </Text>
      )}

      <View style={[styles.inputContainer, getContainerStateStyle()]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          {...rest}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={
            disabled ? colors.textDisabled : placeholderTextColor
          }
          style={[
            styles.input,
            disabled && styles.disabledInputText,
            inputStyle,
          ]}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {(hasError || Boolean(helperText)) && (
        <Text
          style={[
            styles.helperText,
            { color: hasError ? colors.error : colors.textSecondary },
            disabled && styles.disabledText,
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: spacing.md,
  },
  label: {
    ...textPresets.caption,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: controlHeight.lg,
  },
  defaultContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: borderWidth.medium,
    borderColor: colors.primary,
  },
  focusedContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: borderWidth.thick,
    borderColor: colors.primaryPressed,
  },
  errorContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: borderWidth.medium,
    borderColor: colors.error,
  },
  disabledContainer: {
    backgroundColor: colors.backgroundDisabled,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderDisabled,
    opacity: opacity.disabled,
  },
  input: {
    ...textPresets.body,
    flex: 1,
    color: colors.textPrimary,
    height: '100%',
    paddingVertical: 0,
  },
  disabledInputText: {
    color: colors.textDisabled,
  },
  disabledText: {
    color: colors.textDisabled,
  },
  iconLeft: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconRight: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    ...textPresets.caption,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
