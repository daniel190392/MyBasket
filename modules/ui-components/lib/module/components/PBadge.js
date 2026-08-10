"use strict";

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from "../theme/index.js";
import { jsx as _jsx } from "react/jsx-runtime";
const VARIANT_COLORS = {
  important: colors.secondary,
  warning: colors.primary,
  informative: colors.textPrimary
};
const getOpacityColor = (hexColor, opacityHex = '26') => {
  if (hexColor.startsWith('#') && hexColor.length === 7) {
    return `${hexColor}${opacityHex}`;
  }
  return hexColor;
};
export default function PBadge({
  title,
  variant = 'important'
}) {
  const textColor = VARIANT_COLORS[variant] || VARIANT_COLORS.informative;
  const backgroundColor = getOpacityColor(textColor, '20');
  return /*#__PURE__*/_jsx(View, {
    style: [styles.badge, {
      backgroundColor: backgroundColor
    }],
    children: /*#__PURE__*/_jsx(Text, {
      style: [styles.badgeText, {
        color: textColor
      }],
      children: title
    })
  });
}
const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start'
  },
  badgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase'
  }
});
//# sourceMappingURL=PBadge.js.map