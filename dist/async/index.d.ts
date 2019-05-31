import { EncryptorDecryptor, RsaKey } from "../sync/types";
declare const toBuffer: typeof import("../dist/sync").toBuffer, serializer: typeof import("../dist/sync/serializer");
export { toBuffer, serializer };
export * from "../sync/types";
export declare function disableMultithreading(): void;
declare const terminateWorkerThreads: (match?: string | ((workerThreadId: string) => boolean) | undefined) => void, listWorkerThread: () => string[];
export { terminateWorkerThreads, listWorkerThread };
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
    syncHash(text: string, salt: string, params?: Partial<import("../dist/sync/scrypt").ScryptParams> | undefined, progress?: ((percent: number) => void) | undefined): Uint8Array;
    defaultParams: import("../dist/sync/scrypt").ScryptParams;
    hash: (text: string, salt: string, params?: Partial<import("../dist/sync/scrypt").ScryptParams>, progress?: (percent: number) => void, workerThreadId?: string | undefined) => Promise<Uint8Array>;
};
