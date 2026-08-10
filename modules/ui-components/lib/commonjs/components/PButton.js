"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = PButton;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _theme = require("../theme");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function PButton({
  title,
  onPress,
  variant = 'primary',
  isLoading = false,
  isDisabled = false
}) {
  const isPrimary = variant === 'primary';
  const isInteractive = !isDisabled && !isLoading;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
    onPress: onPress,
    disabled: !isInteractive,
    style: [styles.base, isPrimary ? styles.primaryContainer : styles.secondaryContainer, isDisabled && styles.disabledContainer],
    activeOpacity: 0.8,
    children: isLoading ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.ActivityIndicator, {
      color: isPrimary ? _theme.colors.white : _theme.colors.primary
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      style: [styles.text, isPrimary ? styles.primaryText : styles.secondaryText, isDisabled && styles.disabledText],
      children: title
    })
  });
}
const styles = _reactNative.StyleSheet.create({
  base: {
    paddingVertical: _theme.spacing.sm,
    paddingHorizontal: _theme.spacing.md,
    borderRadius: _theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    width: '100%'
  },
  primaryContainer: {
    backgroundColor: _theme.colors.primary,
    borderWidth: 0
  },
  secondaryContainer: {
    backgroundColor: _theme.colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: _theme.colors.primary
  },
  disabledContainer: {
    backgroundColor: _theme.colors.backgroundDisabled,
    borderWidth: 1,
    borderColor: _theme.colors.borderDisabled,
    opacity: 0.7
  },
  text: {
    fontSize: _theme.typography.sizes.md,
    fontWeight: _theme.typography.weights.medium
  },
  primaryText: {
    color: _theme.colors.white
  },
  secondaryText: {
    color: _theme.colors.primary
  },
  disabledText: {
    color: _theme.colors.textDisabled
  }
});
//# sourceMappingURL=PButton.js.map