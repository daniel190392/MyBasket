"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withOpacity = void 0;
const withOpacity = (hexColor, opacity) => {
  const cleanHex = hexColor.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
exports.withOpacity = withOpacity;
//# sourceMappingURL=utils.js.map