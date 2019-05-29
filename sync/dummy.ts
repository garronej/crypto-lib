
import * as types from "./types";

export function syncEncryptorDecryptorFactory(): types.Sync<types.EncryptorDecryptor> {

    return {
        "encrypt": plainData => plainData,
        "decrypt": encryptedData => encryptedData
    };

}

