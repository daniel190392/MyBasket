"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shadows = void 0;
var _colors = require("./colors");
const shadows = exports.shadows = {
  sm: {
    shadowColor: _colors.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  md: {
    shadowColor: _colors.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4
  }
};
//# sourceMappingURL=shadows.js.map