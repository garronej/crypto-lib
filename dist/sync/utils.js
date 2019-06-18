"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environnement_1 = require("./environnement");
var randombytes = require("randombytes");
exports.randomBytes = environnement_1.isBrowser() ?
    randombytes
    :
        (function () {
            var nodeCrypto = require("" + "crypto");
            return nodeCrypto.randomBytes.bind(nodeCrypto);
        })();
function concatUint8Array() {
    var uint8Arrays = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        uint8Arrays[_i] = arguments[_i];
    }
    var out = new Uint8Array(uint8Arrays
        .map(function (_a) {
        var length = _a.length;
        return length;
    })
        .reduce(function (prev, curr) { return prev + curr; }, 0));
    var offset = 0;
    for (var i = 0; i < uint8Arrays.length; i++) {
        var uint8Array = uint8Arrays[i];
        out.set(uint8Array, offset);
        offset += uint8Array.length;
    }
    return out;
}
exports.concatUint8Array = concatUint8Array;
function addPadding(position, uint8Array, targetLengthBytes) {
    var paddingBytes = new Uint8Array(targetLengthBytes - uint8Array.length).fill(0);
    return concatUint8Array.apply(void 0, (function () {
        switch (position) {
            case "LEFT": return [paddingBytes, uint8Array];
            case "RIGHT": return [uint8Array, paddingBytes];
        }
    })());
}
exports.addPadding = addPadding;
function numberToUint8Array(n) {
    var str = n.toString(16);
    var arr = [];
    var curr = "";
    for (var i = str.length - 1; i >= 0; i--) {
        curr = str[i] + curr;
        if (curr.length === 2 || i === 0) {
            arr = [parseInt(curr, 16)].concat(arr);
            curr = "";
        }
    }
    return new Uint8Array(arr);
}
exports.numberToUint8Array = numberToUint8Array;
function uint8ArrayToNumber(uint8Array) {
    var n = 0;
    var exp = 0;
    for (var i = uint8Array.length - 1; i >= 0; i--) {
        n += uint8Array[i] * Math.pow(256, exp++);
    }
    return n;
}
exports.uint8ArrayToNumber = uint8ArrayToNumber;
/** +1, in place ( array is updated ) */
function leftShift(uint8Array) {
    var c = true;
    for (var i = uint8Array.length - 1; c && i >= 0; i--) {
        if (++uint8Array[i] !== 256) {
            c = false;
        }
    }
    return uint8Array;
}
exports.leftShift = leftShift;
