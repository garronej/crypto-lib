"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aesjs = require("aes-js");
var randomBytes = require("randombytes");
function syncEncryptorDecryptorFactory(key) {
    var _counterLength = (new aesjs.Counter(0))._counter.length;
    return {
        "encrypt": (function () {
            var counter = new aesjs.Counter(5);
            return function (plainData) {
                var _counter = counter._counter.slice();
                var payload = (new aesjs.ModeOfOperation.ctr(key, counter))
                    .encrypt(plainData);
                var encryptedData = new Uint8Array(_counterLength + payload.length);
                encryptedData.set(_counter);
                encryptedData.set(payload, _counterLength);
                return encryptedData;
            };
        })(),
        "decrypt": (function () {
            var counter = new aesjs.Counter(0);
            return function (encryptedData) {
                counter.setBytes(encryptedData.slice(0, _counterLength));
                return (new aesjs.ModeOfOperation.ctr(key, counter))
                    .decrypt(encryptedData.slice(_counterLength, encryptedData.length));
            };
        })()
    };
}
exports.syncEncryptorDecryptorFactory = syncEncryptorDecryptorFactory;
function generateKey() {
    return new Promise(function (resolve, reject) { return randomBytes(32, function (err, buf) {
        if (!!err) {
            reject(err);
        }
        else {
            resolve(buf);
        }
    }); });
}
exports.generateKey = generateKey;
function generateTestKey() {
    return Promise.resolve(new Uint8Array([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
        16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30, 31
    ]));
}
exports.generateTestKey = generateTestKey;
