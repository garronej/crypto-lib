import * as types from "./types";
export declare function syncEncryptorDecryptorFactory(key: Uint8Array): types.Sync<types.EncryptorDecryptor>;
export declare function generateKey(): Promise<Uint8Array>;
export declare function generateTestKey(): Promise<Uint8Array>;
