"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toBuffer_1 = require("./utils/toBuffer");
var RsaKey;
(function (RsaKey) {
    function stringify(rsaKey) {
        return JSON.stringify([rsaKey.format, toBuffer_1.toBuffer(rsaKey.data).toString("base64")]);
    }
    RsaKey.stringify = stringify;
    function parse(stringifiedRsaKey) {
        var _a = JSON.parse(stringifiedRsaKey), format = _a[0], strData = _a[1];
        return { format: format, "data": new Uint8Array(Buffer.from(strData, "base64")) };
    }
    RsaKey.parse = parse;
    var Public;
    (function (Public) {
        function match(rsaKey) {
            return rsaKey.format === "pkcs1-public-der";
        }
        Public.match = match;
    })(Public = RsaKey.Public || (RsaKey.Public = {}));
    var Private;
    (function (Private) {
        function match(rsaKey) {
            return rsaKey.format === "pkcs1-private-der";
        }
        Private.match = match;
    })(Private = RsaKey.Private || (RsaKey.Private = {}));
})(RsaKey = exports.RsaKey || (exports.RsaKey = {}));
