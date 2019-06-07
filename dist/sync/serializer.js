"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var ttJC = require("transfer-tools/dist/lib/JSON_CUSTOM");
function matchPromise(prOrValue) {
    return "then" in prOrValue;
}
var stringRepresentationEncoding = "binary";
function stringifyThenEncryptFactory(encryptor) {
    var stringify = ttJC.get().stringify;
    return function stringifyThenEncrypt(value) {
        var prOrValue = encryptor.encrypt(Buffer.from([
            stringify(value),
            (new Array(9 + Math.floor(Math.random() * 50)))
                .fill(" ")
                .join("")
        ].join(""), "utf8"));
        var finalize = function (value) { return types_1.toBuffer(value).toString(stringRepresentationEncoding); };
        return (matchPromise(prOrValue) ?
            prOrValue.then(function (value) { return finalize(value); }) :
            finalize(prOrValue));
    };
}
exports.stringifyThenEncryptFactory = stringifyThenEncryptFactory;
function decryptThenParseFactory(decryptor) {
    var parse = ttJC.get().parse;
    return function decryptThenParse(encryptedValue) {
        var prOrValue = decryptor.decrypt(Buffer.from(encryptedValue, stringRepresentationEncoding));
        var finalize = function (value) { return parse(types_1.toBuffer(value).toString("utf8")); };
        return matchPromise(prOrValue) ?
            prOrValue.then(function (value) { return finalize(value); }) :
            finalize(prOrValue);
    };
}
exports.decryptThenParseFactory = decryptThenParseFactory;
