import { Encryptor, Decryptor, EncryptorDecryptor, RsaKey, ScryptParams } from "../sync/types";
export * from "../sync/types";
export * from "./serializer";
export declare function disableMultithreading(): void;
declare const terminateWorkerThreads: (workerThreadId?: string | undefined) => void, listWorkerThreadIds: () => string[];
export { terminateWorkerThreads, listWorkerThreadIds };
export declare function preSpawnWorkerThread(workerThreadId: string): void;
export declare namespace workerThreadPool {
    function preSpawn(workerThreadPoolId: string, poolSize: number): void;
    function listIds(workerThreadPoolId: string): string[];
    function terminate(workerThreadPoolId: string): void;
}
export declare const plain: {
    syncEncryptorDecryptorFactory(): import("../dist/sync").Sync<EncryptorDecryptor>;
    encryptorDecryptorFactory: (workerThreadPoolId?: string | undefined) => EncryptorDecryptor;
};
export declare const aes: {
    syncEncryptorDecryptorFactory(key: Uint8Array): import("../dist/sync").Sync<EncryptorDecryptor>;
    generateKey(): Promise<Uint8Array>;
    getTestKey(): Promise<Uint8Array>;
    encryptorDecryptorFactory: (key: Uint8Array, workerThreadPoolId?: string | undefined) => EncryptorDecryptor;
};
export declare const rsa: {
    syncEncryptorFactory(encryptKey: RsaKey): import("../dist/sync").Sync<Encryptor>;
    syncDecryptorFactory(decryptKey: RsaKey): import("../dist/sync").Sync<Decryptor>;
    syncEncryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): import("../dist/sync").Sync<EncryptorDecryptor>;
    syncEncryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): import("../dist/sync").Sync<EncryptorDecryptor>;
    syncGenerateKeys(seed: Uint8Array, keysLengthBytes?: number | undefined): {
        publicKey: RsaKey.Public;
        privateKey: RsaKey.Private;
    };
    encryptorFactory: (encryptKey: RsaKey, workerThreadPoolId?: string | undefined) => Encryptor;
    decryptorFactory: (decryptKey: RsaKey, workerThreadPoolId?: string | undefined) => Decryptor;
    encryptorDecryptorFactory: {
        (encryptKey: RsaKey.Private, decryptKey: RsaKey.Public, workerThreadPoolId?: string | undefined): EncryptorDecryptor;
        (encryptKey: RsaKey.Public, decryptKey: RsaKey.Private, workerThreadPoolId?: string | undefined): EncryptorDecryptor;
    };
    generateKeys: (seed: Uint8Array, keysLengthBytes?: number | undefined, workerThreadId?: string | undefined) => Promise<{
        publicKey: RsaKey.Public;
        privateKey: RsaKey.Private;
    }>;
};
export declare const scrypt: {
    syncHash(text: string, salt: string, params?: Partial<ScryptParams> | undefined, progress?: ((percent: number) => void) | undefined): Uint8Array;
    defaultParams: ScryptParams;
    hash: (text: string, salt: string, params?: Partial<ScryptParams>, progress?: (percent: number) => void, workerThreadId?: string | undefined) => Promise<Uint8Array>;
};
