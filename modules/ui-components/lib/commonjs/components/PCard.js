"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PCard = PCard;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _theme = require("../theme");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function PCard({
  children,
  onPress,
  isClickable = true
}) {
  const canClick = isClickable && Boolean(onPress);
  if (!canClick) {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: [styles.card, !isClickable && styles.disabledCard],
      children: children
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
    style: [styles.card],
    activeOpacity: 0.7,
    disabled: !isClickable,
    onPress: onPress,
    children: children
  });
}
const styles = _reactNative.StyleSheet.create({
  card: {
    backgroundColor: _theme.colors.surface,
    borderRadius: _theme.borderRadius.md,
    padding: _theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ..._theme.shadows.sm
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
    backgroundColor: _theme.colors.backgroundDisabled
  }
});
//# sourceMappingURL=PCard.js.map