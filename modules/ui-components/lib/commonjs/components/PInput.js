"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PInput = void 0;
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _theme = require("../theme");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const PInput = ({
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
  placeholderTextColor = _theme.colors.textMuted,
  ...rest
}) => {
  const [isFocused, setIsFocused] = (0, _react.useState)(false);
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
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
    style: [styles.wrapper, containerStyle],
    children: [Boolean(label) && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      style: [styles.label, disabled && styles.disabledText],
      children: label
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: [styles.inputContainer, getContainerStateStyle()],
      children: [leftIcon && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: styles.iconLeft,
        children: leftIcon
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TextInput, {
        ...rest,
        editable: !disabled,
        onFocus: handleFocus,
        onBlur: handleBlur,
        placeholderTextColor: disabled ? _theme.colors.textDisabled : placeholderTextColor,
        style: [styles.input, disabled && styles.disabledInputText, inputStyle]
      }), rightIcon && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
        style: styles.iconRight,
        children: rightIcon
      })]
    }), (hasError || Boolean(helperText)) && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
      style: [styles.helperText, {
        color: hasError ? _theme.colors.error : _theme.colors.textSecondary
      }, disabled && styles.disabledText],
      children: error || helperText
    })]
  });
};
exports.PInput = PInput;
const styles = _reactNative.StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: _theme.spacing.md
  },
  label: {
    ..._theme.textPresets.caption,
    color: _theme.colors.textPrimary,
    fontWeight: _theme.typography.weights.medium,
    marginBottom: _theme.spacing.xs
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: _theme.borderRadius.md,
    paddingHorizontal: _theme.spacing.md,
    height: 52
  },
  defaultContainer: {
    backgroundColor: _theme.colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: _theme.colors.primary
  },
  focusedContainer: {
    backgroundColor: _theme.colors.surfaceInput,
    borderWidth: 2,
    borderColor: _theme.colors.primaryPressed
  },
  errorContainer: {
    backgroundColor: _theme.colors.surfaceInput,
    borderWidth: 1.5,
    borderColor: _theme.colors.error
  },
  disabledContainer: {
    backgroundColor: _theme.colors.backgroundDisabled,
    borderWidth: 1,
    borderColor: _theme.colors.borderDisabled,
    opacity: 0.7
  },
  input: {
    ..._theme.textPresets.body,
    flex: 1,
    color: _theme.colors.textPrimary,
    height: '100%',
    paddingVertical: 0
  },
  disabledInputText: {
    color: _theme.colors.textDisabled // Texto tenue al estar inactivo
  },
  disabledText: {
    color: _theme.colors.textDisabled
  },
  iconLeft: {
    marginRight: _theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconRight: {
    marginLeft: _theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center'
  },
  helperText: {
    ..._theme.textPresets.caption,
    marginTop: _theme.spacing.xs,
    marginLeft: _theme.spacing.xs
  }
});
//# sourceMappingURL=PInput.js.map