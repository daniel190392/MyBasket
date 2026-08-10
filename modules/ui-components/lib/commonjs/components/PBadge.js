"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PBadge;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _theme = require("../theme");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const VARIANT_COLORS = {
  important: _theme.colors.secondary,
  warning: _theme.colors.primary,
  informative: _theme.colors.textPrimary
};
const getOpacityColor = (hexColor, opacityHex = '26') => {
  if (hexColor.startsWith('#') && hexColor.length === 7) {
    return `${hexColor}${opacityHex}`;
  }
  return hexColor;
};
function PBadge({
  title,
  variant = 'important'
}) {
  const textColor = VARIANT_COLORS[variant] || VARIANT_COLORS.informative;
  const backgroundColor = getOpacityColor(textColor, '20');
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: [styles.badge, {
      backgroundColor: backgroundColor
    }],
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      style: [styles.badgeText, {
        color: textColor
      }],
      children: title
    })
  });
}
const styles = _reactNative.StyleSheet.create({
  badge: {
    paddingHorizontal: _theme.spacing.sm,
    paddingVertical: _theme.spacing.xs,
    borderRadius: _theme.borderRadius.sm,
    alignSelf: 'flex-start'
  },
  badgeText: {
    fontSize: _theme.typography.sizes.xs,
    fontWeight: _theme.typography.weights.bold,
    textTransform: 'uppercase'
  }
});
//# sourceMappingURL=PBadge.js.map