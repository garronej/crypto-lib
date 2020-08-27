"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncHash = exports.defaultParams = void 0;
var scryptsy = require("scryptsy");
exports.defaultParams = {
    "n": 13,
    "r": 8,
    "p": 1,
    "digestLengthBytes": 254
};
function syncHash(text, salt, params, progress) {
    if (params === void 0) { params = {}; }
    var _a = (function () {
        var out = __assign({}, exports.defaultParams);
        Object.keys(params)
            .filter(function (key) { return params[key] !== undefined; })
            .forEach(function (key) { return out[key] = params[key]; });
        return out;
    })(), n = _a.n, r = _a.r, p = _a.p, digestLengthBytes = _a.digestLengthBytes;
    return scryptsy(text, salt, Math.pow(2, n), r, p, digestLengthBytes, progress !== undefined ?
        (function (_a) {
            var percent = _a.percent;
            return progress(percent);
        }) :
        undefined);
}
exports.syncHash = syncHash;
