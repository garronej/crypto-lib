"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scryptsy = require("scryptsy");
function syncHash(text, salt, progress) {
    //The 2^number of iterations. number (integer)
    var n = 13;
    //Memory factor. number (integer)
    var r = 8;
    //Parallelization factor. number (integer)
    var p = 1;
    //The number of bytes to return. number (integer)
    var keyLenBytes = 254;
    return scryptsy(text, salt, Math.pow(2, n), r, p, keyLenBytes, progress !== undefined ?
        (function (_a) {
            var percent = _a.percent;
            return progress(percent);
        }) :
        undefined);
}
exports.syncHash = syncHash;
