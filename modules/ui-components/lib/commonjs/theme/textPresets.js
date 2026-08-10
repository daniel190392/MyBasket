"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.textPresets = void 0;
var _colors = require("./colors");
var _typography = require("./typography");
const textPresets = exports.textPresets = {
  title: {
    fontSize: _typography.typography.sizes.lg,
    fontWeight: _typography.typography.weights.bold,
    color: _colors.colors.textPrimary
  },
  subtitle: {
    fontSize: _typography.typography.sizes.md,
    fontWeight: _typography.typography.weights.medium,
    color: _colors.colors.textPrimary
  },
  body: {
    fontSize: _typography.typography.sizes.md,
    fontWeight: _typography.typography.weights.regular,
    color: _colors.colors.textPrimary
  },
  caption: {
    fontSize: _typography.typography.sizes.sm,
    fontWeight: _typography.typography.weights.regular,
    color: _colors.colors.textSecondary
  }
};
//# sourceMappingURL=textPresets.js.map