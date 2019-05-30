import { EncryptorDecryptor, Sync } from "../types";
export declare function syncEncryptorDecryptorFactory(key: Uint8Array): Sync<EncryptorDecryptor>;
export declare function generateKey(): Promise<Uint8Array>;
export declare function generateTestKey(): Promise<Uint8Array>;
