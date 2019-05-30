"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function syncEncryptorDecryptorFactory() {
    return {
        "encrypt": function (plainData) { return plainData; },
        "decrypt": function (encryptedData) { return encryptedData; }
    };
}
exports.syncEncryptorDecryptorFactory = syncEncryptorDecryptorFactory;
