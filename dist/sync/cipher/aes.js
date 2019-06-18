"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var aesjs = require("aes-js");
var utils_1 = require("../utils");
function syncEncryptorDecryptorFactory(key) {
    return {
        "encrypt": (function () {
            var getIv = (function () {
                var iv0 = utils_1.randomBytes(16);
                return function () { return utils_1.leftShift(iv0); };
            })();
            return function (plainData) {
                var iv = getIv();
                var originalLengthAsByte = utils_1.addPadding("LEFT", utils_1.numberToUint8Array(plainData.length), 4);
                var plainDataMultipleOf16Bytes = utils_1.addPadding("RIGHT", plainData, plainData.length + (16 - plainData.length % 16));
                var encryptedDataPayload = (new aesjs.ModeOfOperation.cbc(key, iv))
                    .encrypt(plainDataMultipleOf16Bytes);
                return utils_1.concatUint8Array(iv, originalLengthAsByte, encryptedDataPayload);
            };
        })(),
        "decrypt": function (encryptedData) {
            var iv = encryptedData.slice(0, 16);
            var originalLengthAsByte = encryptedData.slice(16, 16 + 4);
            var originalLength = utils_1.uint8ArrayToNumber(originalLengthAsByte);
            return (new aesjs.ModeOfOperation.cbc(key, iv))
                .decrypt(encryptedData.slice(16 + 4))
                .slice(0, originalLength);
        }
    };
}
exports.syncEncryptorDecryptorFactory = syncEncryptorDecryptorFactory;
function generateKey() {
    return new Promise(function (resolve, reject) { return utils_1.randomBytes(32, function (err, buf) {
        if (!!err) {
            reject(err);
        }
        else {
            resolve(buf);
        }
    }); });
}
exports.generateKey = generateKey;
function getTestKey() {
    return Promise.resolve(new Uint8Array([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
        16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
        29, 30, 31
    ]));
}
exports.getTestKey = getTestKey;
