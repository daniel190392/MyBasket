"use strict";

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, borderRadius } from "../theme/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
export default function PButton({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  isDisabled = false
}) {
  const isPrimary = variant === 'primary';
  const isInteractive = !isDisabled && !isLoading;
  return /*#__PURE__*/_jsx(TouchableOpacity, {
    onPress: onPress,
    disabled: !isInteractive,
    style: [styles.base, isPrimary ? styles.primaryContainer : styles.secondaryContainer, isDisabled && styles.disabledContainer],
    activeOpacity: 0.8,
    children: isLoading ? /*#__PURE__*/_jsx(ActivityIndicator, {
      color: isPrimary ? colors.white : colors.primary
    }) : /*#__PURE__*/_jsx(Text, {
      style: [styles.text, isPrimary ? styles.primaryText : styles.secondaryText, isDisabled && styles.disabledText],
      children: title
    })
  });
}
const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%'
  },
  primaryContainer: {
    backgroundColor: colors.primary,
    borderWidth: 0
  },
  secondaryContainer: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: colors.primary
  },
  disabledContainer: {
    backgroundColor: colors.backgroundDisabled,
    borderWidth: 1,
    borderColor: colors.borderDisabled,
    opacity: 0.7
  },
  text: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium
  },
  primaryText: {
    color: colors.white
  },
  secondaryText: {
    color: colors.primary
  },
  disabledText: {
    color: colors.textDisabled
  }
});
//# sourceMappingURL=PButton.js.map