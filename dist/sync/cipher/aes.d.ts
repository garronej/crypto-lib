import { EncryptorDecryptor, Sync } from "../types";
export declare function syncEncryptorDecryptorFactory(key: Uint8Array): Sync<EncryptorDecryptor>;
export declare function generateKey(): Promise<Uint8Array>;
export declare function getTestKey(): Promise<Uint8Array>;
