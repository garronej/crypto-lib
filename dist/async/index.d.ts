/// <reference lib="dom" />
declare const toBuffer: typeof import("../dist/sync").toBuffer, serializer: typeof import("../dist/sync/serializer");
export { toBuffer, serializer };
export declare type Encryptor = import("../sync/types").Encryptor;
export declare type Decryptor = import("../sync/types").Decryptor;
export declare type EncryptorDecryptor = import("../sync/types").EncryptorDecryptor;
export declare type Sync<T extends Encryptor | Decryptor | EncryptorDecryptor> = import("../sync/types").Sync<T>;
export declare type Encoding = import("../sync/types").Encoding;
export declare const dummy: {
    syncEncryptorDecryptorFactory(): import("../dist/sync").Sync<import("../dist/sync").EncryptorDecryptor>;
    "encryptorDecryptorFactory": () => import("../dist/sync").EncryptorDecryptor;
};
export declare const aes: {
    syncEncryptorDecryptorFactory(key: Uint8Array): import("../dist/sync").Sync<import("../dist/sync").EncryptorDecryptor>;
    generateKey(): Promise<Uint8Array>;
    generateTestKey(): Promise<Uint8Array>;
    "encryptorDecryptorFactory": (key: Uint8Array) => import("../dist/sync").EncryptorDecryptor;
};
export declare const rsa: {
    syncEncryptorFactory(encryptKey: import("../dist/sync/rsa").RsaKey): import("../dist/sync").Sync<import("../dist/sync").Encryptor>;
    syncDecryptorFactory(decryptKey: import("../dist/sync/rsa").RsaKey): import("../dist/sync").Sync<import("../dist/sync").Decryptor>;
    encryptorDecryptorFactory(encryptKey: import("../dist/sync/rsa").RsaKey.Private, decryptKey: import("../dist/sync/rsa").RsaKey.Public): import("../dist/sync").Sync<import("../dist/sync").EncryptorDecryptor>;
    encryptorDecryptorFactory(encryptKey: import("../dist/sync/rsa").RsaKey.Public, decryptKey: import("../dist/sync/rsa").RsaKey.Private): import("../dist/sync").Sync<import("../dist/sync").EncryptorDecryptor>;
    syncGenerateKeys(seed: Uint8Array): {
        publicKey: import("../dist/sync/rsa").RsaKey.Public;
        privateKey: import("../dist/sync/rsa").RsaKey.Private;
    };
    RsaKey: typeof import("../dist/sync/rsa").RsaKey;
};
export declare const scrypt: {
    syncHash(text: string, salt: string, progress?: ((percent: number) => void) | undefined): Uint8Array;
};
