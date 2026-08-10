"use strict";

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, textPresets } from "../theme/index.js";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
export const PLink = ({
  text = '',
  link,
  variant = 'primary',
  align = 'left',
  onPress
}) => {
  const isPrimary = variant === 'primary';
  const alignStyle = alignMap[align];
  return /*#__PURE__*/_jsx(TouchableOpacity, {
    activeOpacity: 0.7,
    onPress: onPress,
    hitSlop: {
      top: spacing.sm,
      bottom: spacing.sm,
      left: spacing.lg,
      right: spacing.lg
    },
    children: /*#__PURE__*/_jsx(View, {
      style: [styles.container, {
        alignItems: alignStyle
      }],
      children: /*#__PURE__*/_jsxs(Text, {
        style: [styles.baseText, {
          textAlign: align
        }],
        children: [text && /*#__PURE__*/_jsxs(Text, {
          style: {
            color: colors.textPrimary
          },
          children: [text, " "]
        }), /*#__PURE__*/_jsx(Text, {
          style: {
            color: isPrimary ? colors.primary : colors.textSecondary
          },
          children: link
        })]
      })
    })
  });
};
const alignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
};
const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center'
  },
  baseText: {
    ...textPresets.caption
  }
});
//# sourceMappingURL=PLink.js.map