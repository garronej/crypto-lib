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
var toBuffer_1 = require("./toBuffer");
var NodeRSA = require("node-rsa");
var RsaKey;
(function (RsaKey) {
    function stringify(rsaKey) {
        return JSON.stringify([rsaKey.format, toBuffer_1.toBuffer(rsaKey.data).toString("binary")]);
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
var newNodeRSA = function (key) { return new NodeRSA(Buffer.from(key.data), key.format); };
/**
 * NOTE: The toBuffer function of the library does not
 * guaranty that the returned object is an actually
 * buffer instance.
 * */
var toRealBuffer = function (data) {
    return data instanceof Buffer || Object.getPrototypeOf(data).name === "Buffer" ?
        data :
        Buffer.from(data);
};
function syncEncryptorFactory(encryptKey) {
    return {
        "encrypt": (function () {
            var encryptNodeRSA = newNodeRSA(encryptKey);
            var encryptMethod = RsaKey.Private.match(encryptKey) ?
                "encryptPrivate" :
                "encrypt";
            return function (plainData) {
                return encryptNodeRSA[encryptMethod](toRealBuffer(plainData));
            };
        })()
    };
}
exports.syncEncryptorFactory = syncEncryptorFactory;
function syncDecryptorFactory(decryptKey) {
    return {
        "decrypt": (function () {
            var decryptNodeRSA = newNodeRSA(decryptKey);
            var decryptMethod = RsaKey.Public.match(decryptKey) ?
                "decrypt" :
                "decryptPublic";
            return function (encryptedData) {
                return decryptNodeRSA[decryptMethod](toRealBuffer(encryptedData));
            };
        })()
    };
}
exports.syncDecryptorFactory = syncDecryptorFactory;
function encryptorDecryptorFactory(encryptKey, decryptKey) {
    return __assign({}, syncEncryptorFactory(encryptKey), syncDecryptorFactory(decryptKey));
}
exports.encryptorDecryptorFactory = encryptorDecryptorFactory;
function syncGenerateKeys(seed) {
    var nodeRSA = NodeRSA.generateKeyPairFromSeed(toRealBuffer(seed), 8 * 80);
    var getData = function (format) { return nodeRSA.exportKey(format); };
    return {
        "publicKey": (function () {
            var format = "pkcs1-public-der";
            return RsaKey.build(getData(format), format);
        })(),
        "privateKey": (function () {
            var format = "pkcs1-private-der";
            return RsaKey.build(getData(format), format);
        })()
    };
}
exports.syncGenerateKeys = syncGenerateKeys;
