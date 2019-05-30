import { Sync, EncryptorDecryptor, RsaKey } from "../sync/types";
declare const toBuffer: typeof import("../dist/sync").toBuffer, serializer: typeof import("../dist/sync/serializer");
export { toBuffer, serializer };
export * from "../sync/types";
export declare const plain: {
    syncEncryptorDecryptorFactory(): Sync<EncryptorDecryptor>;
    encryptorDecryptorFactory: () => EncryptorDecryptor;
};
export declare const aes: {
    syncEncryptorDecryptorFactory(key: Uint8Array): Sync<EncryptorDecryptor>;
    generateKey(): Promise<Uint8Array>;
    generateTestKey(): Promise<Uint8Array>;
    encryptorDecryptorFactory: (key: Uint8Array) => EncryptorDecryptor;
};
export declare const rsa: {
    syncEncryptorFactory(encryptKey: RsaKey): Sync<import("../dist/sync").Encryptor>;
    syncDecryptorFactory(decryptKey: RsaKey): Sync<import("../dist/sync").Decryptor>;
    syncEncryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): Sync<EncryptorDecryptor>;
    syncEncryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): Sync<EncryptorDecryptor>;
    syncGenerateKeys(seed: Uint8Array): {
        publicKey: RsaKey.Public;
        privateKey: RsaKey.Private;
    };
    encryptorFactory: (encryptKey: RsaKey) => import("../dist/sync").Encryptor;
    decryptorFactory: (decryptKey: RsaKey) => import("../dist/sync").Decryptor;
    encryptorDecryptorFactory: {
        (encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): EncryptorDecryptor;
        (encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): EncryptorDecryptor;
    };
    generateKeys: (seed: Uint8Array) => Promise<{
        publicKey: RsaKey.Public;
        privateKey: RsaKey.Private;
    }>;
};
export declare const scrypt: {
    syncHash(text: string, salt: string, progress?: ((percent: number) => void) | undefined): Uint8Array;
};
