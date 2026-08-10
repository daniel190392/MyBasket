"use strict";

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from "../theme/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
export function PCard({
  children,
  onPress,
  isClickable = true
}) {
  const canClick = isClickable && Boolean(onPress);
  if (!canClick) {
    return /*#__PURE__*/_jsx(View, {
      style: [styles.card, !isClickable && styles.disabledCard],
      children: children
    });
  }
  return /*#__PURE__*/_jsx(TouchableOpacity, {
    style: [styles.card],
    activeOpacity: 0.7,
    disabled: !isClickable,
    onPress: onPress,
    children: children
  });
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.sm
  },
  disabledCard: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: {
      width: 0,
      height: 0
    },
    backgroundColor: colors.backgroundDisabled
  }
});
//# sourceMappingURL=PCard.js.map