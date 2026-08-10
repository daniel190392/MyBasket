"use strict";

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, textPresets, typography } from "../theme/index.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const handleFocus = e => {
    if (disabled) return;
    setIsFocused(true);
    onFocus?.(e);
  };
  const handleBlur = e => {
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
  return /*#__PURE__*/_jsxs(View, {
    style: [styles.wrapper, containerStyle],
    children: [Boolean(label) && /*#__PURE__*/_jsx(Text, {
      style: [styles.label, disabled && styles.disabledText],
      children: label
    }), /*#__PURE__*/_jsxs(View, {
      style: [styles.inputContainer, getContainerStateStyle()],
      children: [leftIcon && /*#__PURE__*/_jsx(View, {
        style: styles.iconLeft,
        children: leftIcon
      }), /*#__PURE__*/_jsx(TextInput, {
        ...rest,
        editable: !disabled,
        onFocus: handleFocus,
        onBlur: handleBlur,
        placeholderTextColor: disabled ? colors.textDisabled : placeholderTextColor,
        style: [styles.input, disabled && styles.disabledInputText, inputStyle]
      }), rightIcon && /*#__PURE__*/_jsx(View, {
        style: styles.iconRight,
        children: rightIcon
      })]
    }), (hasError || Boolean(helperText)) && /*#__PURE__*/_jsx(Text, {
      style: [styles.helperText, {
        color: hasError ? colors.error : colors.textSecondary
      }, disabled && styles.disabledText],
      children: error || helperText
    })]
  });
};
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: spacing.md
  },
  label: {
    ...textPresets.caption,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 52
  },
  defaultContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  focusedContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 2,
    borderColor: colors.primaryPressed
  },
  errorContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: colors.error
  },
  disabledContainer: {
    backgroundColor: colors.backgroundDisabled,
    borderWidth: 1,
    borderColor: colors.borderDisabled,
    opacity: 0.7
  },
  input: {
    ...textPresets.body,
    flex: 1,
    color: colors.textPrimary,
    height: '100%',
    paddingVertical: 0
  },
  disabledInputText: {
    color: colors.textDisabled // Texto tenue al estar inactivo
  },
  disabledText: {
    color: colors.textDisabled
  },
  iconLeft: {
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconRight: {
    marginLeft: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  helperText: {
    ...textPresets.caption,
    marginTop: spacing.xs,
    marginLeft: spacing.xs
  }
});
//# sourceMappingURL=PInput.js.map