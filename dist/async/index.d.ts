import "minimal-polyfills/Array.from";
import { Encryptor, Decryptor, EncryptorDecryptor, RsaKey, ScryptParams } from "../sync/types";
import { Sync } from "../sync/types";
export * from "../sync/types";
export * from "./serializer";
export { Encoding, toBuffer } from "../sync/utils/toBuffer";
export declare function disableMultithreading(): void;
export declare type WorkerThreadId = {
    type: "WORKER THREAD ID";
};
export declare namespace WorkerThreadId {
    function generate(): WorkerThreadId;
}
declare const terminateWorkerThreads: (workerThreadId?: WorkerThreadId | undefined) => void;
export { terminateWorkerThreads };
export declare function preSpawnWorkerThread(workerThreadId: WorkerThreadId): void;
export declare namespace workerThreadPool {
    type Id = {
        type: "WORKER THREAD POOL ID";
    };
    namespace Id {
        function generate(): Id;
    }
    function preSpawn(workerThreadPoolId: Id, poolSize: number): void;
    function listIds(workerThreadPoolId: Id): WorkerThreadId[];
    function terminate(workerThreadPoolId: Id): void;
}
export declare const plain: {
    syncEncryptorDecryptorFactory(): Sync<EncryptorDecryptor>;
    encryptorDecryptorFactory: (workerThreadPoolId?: workerThreadPool.Id | undefined) => EncryptorDecryptor;
};
export declare const aes: {
    syncEncryptorDecryptorFactory(key: Uint8Array): Sync<EncryptorDecryptor>;
    generateKey(): Promise<Uint8Array>;
    getTestKey(): Promise<Uint8Array>;
    encryptorDecryptorFactory: (key: Uint8Array, workerThreadPoolId?: workerThreadPool.Id | undefined) => EncryptorDecryptor;
};
export declare const rsa: {
    syncEncryptorFactory(encryptKey: RsaKey): Sync<Encryptor>;
    syncDecryptorFactory(decryptKey: RsaKey): Sync<Decryptor>;
    syncEncryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): Sync<EncryptorDecryptor>;
    syncEncryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): Sync<EncryptorDecryptor>;
    syncGenerateKeys(seed: Uint8Array | null, keysLengthBytes?: number | undefined): {
        publicKey: RsaKey.Public;
        privateKey: RsaKey.Private;
    };
    encryptorFactory: (encryptKey: RsaKey, workerThreadPoolId?: workerThreadPool.Id | undefined) => Encryptor;
    decryptorFactory: (decryptKey: RsaKey, workerThreadPoolId?: workerThreadPool.Id | undefined) => Decryptor;
    encryptorDecryptorFactory: {
        (encryptKey: RsaKey.Private, decryptKey: RsaKey.Public, workerThreadPoolId?: workerThreadPool.Id | undefined): EncryptorDecryptor;
        (encryptKey: RsaKey.Public, decryptKey: RsaKey.Private, workerThreadPoolId?: workerThreadPool.Id | undefined): EncryptorDecryptor;
    };
    generateKeys: (seed: Uint8Array | null, keysLengthBytes?: number | undefined, workerThreadId?: WorkerThreadId | undefined) => Promise<{
        publicKey: RsaKey.Public;
        privateKey: RsaKey.Private;
    }>;
};
export declare const scrypt: {
    syncHash(text: string, salt: string, params?: Partial<ScryptParams> | undefined, progress?: ((percent: number) => void) | undefined): Uint8Array;
    defaultParams: ScryptParams;
    hash: (text: string, salt: string, params?: Partial<ScryptParams>, progress?: (percent: number) => void, workerThreadId?: WorkerThreadId | undefined) => Promise<Uint8Array>;
};
