"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  PBadge: true,
  PCard: true,
  PButton: true
};
Object.defineProperty(exports, "PBadge", {
  enumerable: true,
  get: function () {
    return _PBadge.default;
  }
});
Object.defineProperty(exports, "PButton", {
  enumerable: true,
  get: function () {
    return _PButton.default;
  }
});
Object.defineProperty(exports, "PCard", {
  enumerable: true,
  get: function () {
    return _PCard.PCard;
  }
});
var _PBadge = _interopRequireDefault(require("./PBadge"));
var _PCard = require("./PCard");
var _PButton = _interopRequireDefault(require("./PButton"));
var _PInput = require("./PInput");
Object.keys(_PInput).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _PInput[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _PInput[key];
    }
  });
});
var _PLink = require("./PLink");
Object.keys(_PLink).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _PLink[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _PLink[key];
    }
  });
});
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
//# sourceMappingURL=index.js.map