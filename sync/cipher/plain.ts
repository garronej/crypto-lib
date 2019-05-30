
import { EncryptorDecryptor, Sync } from "../types";

export function syncEncryptorDecryptorFactory(): Sync<EncryptorDecryptor> {
        return {
                "encrypt": plainData => plainData,
                "decrypt": encryptedData => encryptedData
        };
}




