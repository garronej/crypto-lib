import { Encryptor, Decryptor, EncryptorDecryptor, Sync } from "../types";
import { RsaKey } from "../types";
export declare function syncEncryptorFactory(encryptKey: RsaKey): Sync<Encryptor>;
export declare function syncDecryptorFactory(decryptKey: RsaKey): Sync<Decryptor>;
export declare function syncEncryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): Sync<EncryptorDecryptor>;
export declare function syncEncryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): Sync<EncryptorDecryptor>;
export declare function syncGenerateKeys(seed: Uint8Array | null, keysLengthBytes?: number): {
    publicKey: RsaKey.Public;
    privateKey: RsaKey.Private;
};
