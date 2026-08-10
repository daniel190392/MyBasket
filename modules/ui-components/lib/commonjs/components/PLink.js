"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PLink = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _theme = require("../theme");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const PLink = ({
  text = '',
  link,
  variant = 'primary',
  align = 'left',
  onPress
}) => {
  const isPrimary = variant === 'primary';
  const alignStyle = alignMap[align];
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
    activeOpacity: 0.7,
    onPress: onPress,
    hitSlop: {
      top: _theme.spacing.sm,
      bottom: _theme.spacing.sm,
      left: _theme.spacing.lg,
      right: _theme.spacing.lg
    },
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: [styles.container, {
        alignItems: alignStyle
      }],
      children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
        style: [styles.baseText, {
          textAlign: align
        }],
        children: [text && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
          style: {
            color: _theme.colors.textPrimary
          },
          children: [text, " "]
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: {
            color: isPrimary ? _theme.colors.primary : _theme.colors.textSecondary
          },
          children: link
        })]
      })
    })
  });
};
exports.PLink = PLink;
const alignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
};
const styles = _reactNative.StyleSheet.create({
  container: {
    paddingVertical: _theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center'
  },
  baseText: {
    ..._theme.textPresets.caption
  }
});
//# sourceMappingURL=PLink.js.map