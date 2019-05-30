import { EncryptorDecryptor, RsaKey } from "../sync/types";
declare const toBuffer: typeof import("../dist/sync").toBuffer, serializer: typeof import("../dist/sync/serializer");
export { toBuffer, serializer };
export * from "../sync/types";
declare const terminateWorkerThreads: (match?: ((workerThreadId: string) => boolean) | undefined) => void;
export { terminateWorkerThreads };
export declare function preSpawnWorkerThread(workerThreadId: string): void;
export declare const plain: {
    syncEncryptorDecryptorFactory(): import("../dist/sync").Sync<EncryptorDecryptor>;
    encryptorDecryptorFactory: (workerThreadId?: string | undefined) => EncryptorDecryptor;
};
export declare const aes: {
    syncEncryptorDecryptorFactory(key: Uint8Array): import("../dist/sync").Sync<EncryptorDecryptor>;
    generateKey(): Promise<Uint8Array>;
    generateTestKey(): Promise<Uint8Array>;
    encryptorDecryptorFactory: (key: Uint8Array, workerThreadId?: string | undefined) => EncryptorDecryptor;
};
export declare const rsa: {
    syncEncryptorFactory(encryptKey: RsaKey): import("../dist/sync").Sync<import("../dist/sync").Encryptor>;
    syncDecryptorFactory(decryptKey: RsaKey): import("../dist/sync").Sync<import("../dist/sync").Decryptor>;
    syncEncryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): import("../dist/sync").Sync<EncryptorDecryptor>;
    syncEncryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): import("../dist/sync").Sync<EncryptorDecryptor>;
    syncGenerateKeys(seed: Uint8Array, keysLengthBytes?: number | undefined): {
        publicKey: RsaKey.Public;
        privateKey: RsaKey.Private;
    };
    encryptorFactory: (encryptKey: RsaKey, workerThreadId?: string | undefined) => import("../dist/sync").Encryptor;
    decryptorFactory: (decryptKey: RsaKey, workerThreadId?: string | undefined) => import("../dist/sync").Decryptor;
    encryptorDecryptorFactory: {
        (encryptKey: RsaKey.Private, decryptKey: RsaKey.Public, workerThreadId?: string | undefined): EncryptorDecryptor;
        (encryptKey: RsaKey.Public, decryptKey: RsaKey.Private, workerThreadId?: string | undefined): EncryptorDecryptor;
    };
    generateKeys: (seed: Uint8Array, keysLengthBytes?: number | undefined, workerThreadId?: string | undefined) => Promise<{
        publicKey: RsaKey.Public;
        privateKey: RsaKey.Private;
    }>;
};
export declare const scrypt: {
    syncHash(text: string, salt: string, progress?: ((percent: number) => void) | undefined): Uint8Array;
};
