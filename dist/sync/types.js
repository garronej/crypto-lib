"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * NOTE: Does not guaranty that the returned object is an acutal
 * buffer instance, just that the to string method can be called
 * as on the Buffer prototype. ( even if the current implementation does)
 */
function toBuffer(uint8Array) {
    return Buffer.from(uint8Array.buffer, uint8Array.byteOffset, uint8Array.length);
}
exports.toBuffer = toBuffer;
var RsaKey;
(function (RsaKey) {
    function stringify(rsaKey) {
        return JSON.stringify([rsaKey.format, toBuffer(rsaKey.data).toString("binary")]);
    }
    RsaKey.stringify = stringify;
    function parse(stringifiedRsaKey) {
        var _a = JSON.parse(stringifiedRsaKey), format = _a[0], strData = _a[1];
        return { format: format, "data": new Uint8Array(Buffer.from(strData, "binary")) };
    }
    RsaKey.parse = parse;
    function build(data, format) {
        return {
            format: format,
            "data": typeof data === "string" ?
                Buffer.from(data, "binary") : data
        };
    }
    RsaKey.build = build;
    var Public;
    (function (Public) {
        function build(data) {
            return RsaKey.build(data, "pkcs1-public-der");
        }
        Public.build = build;
        function match(rsaKey) {
            return rsaKey.format === "pkcs1-public-der";
        }
        Public.match = match;
    })(Public = RsaKey.Public || (RsaKey.Public = {}));
    var Private;
    (function (Private) {
        function build(data) {
            return RsaKey.build(data, "pkcs1-private-der");
        }
        Private.build = build;
        function match(rsaKey) {
            return rsaKey.format === "pkcs1-private-der";
        }
        Private.match = match;
    })(Private = RsaKey.Private || (RsaKey.Private = {}));
})(RsaKey = exports.RsaKey || (exports.RsaKey = {}));
