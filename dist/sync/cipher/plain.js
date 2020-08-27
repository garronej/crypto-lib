"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncEncryptorDecryptorFactory = void 0;
function syncEncryptorDecryptorFactory() {
    return {
        "encrypt": function (plainData) { return plainData; },
        "decrypt": function (encryptedData) { return encryptedData; }
    };
}
exports.syncEncryptorDecryptorFactory = syncEncryptorDecryptorFactory;
