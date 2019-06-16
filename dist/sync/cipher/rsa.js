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
var types_1 = require("../types");
var NodeRSA = require("node-rsa");
var environnement_1 = require("../environnement");
var getEnvironment = function () { return environnement_1.isBrowser() ? "browser" : "node"; };
var newNodeRSA = function (key) { return new NodeRSA(Buffer.from(key.data), key.format, { "environment": getEnvironment() }); };
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
            var encryptMethod = types_1.RsaKey.Private.match(encryptKey) ?
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
            var decryptMethod = types_1.RsaKey.Public.match(decryptKey) ?
                "decryptPublic" :
                "decrypt";
            return function (encryptedData) {
                return decryptNodeRSA[decryptMethod](toRealBuffer(encryptedData));
            };
        })()
    };
}
exports.syncDecryptorFactory = syncDecryptorFactory;
function syncEncryptorDecryptorFactory(encryptKey, decryptKey) {
    return __assign({}, syncEncryptorFactory(encryptKey), syncDecryptorFactory(decryptKey));
}
exports.syncEncryptorDecryptorFactory = syncEncryptorDecryptorFactory;
function syncGenerateKeys(seed, keysLengthBytes) {
    if (keysLengthBytes === void 0) { keysLengthBytes = 80; }
    var nodeRSA = NodeRSA.generateKeyPairFromSeed(toRealBuffer(seed), 8 * keysLengthBytes, undefined, getEnvironment());
    function buildKey(format) {
        return {
            format: format,
            "data": nodeRSA.exportKey(format)
        };
    }
    return {
        "publicKey": buildKey("pkcs1-public-der"),
        "privateKey": buildKey("pkcs1-private-der")
    };
}
exports.syncGenerateKeys = syncGenerateKeys;
