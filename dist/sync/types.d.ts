export declare type Encryptor = {
    /** return encryptedData */
    encrypt(plainData: Uint8Array): Promise<Uint8Array>;
};
export declare type Decryptor = {
    /** return plainData */
    decrypt(encryptedData: Uint8Array): Promise<Uint8Array>;
};
export declare type EncryptorDecryptor = Encryptor & Decryptor;
export declare type Encoding = "hex" | "base64" | "binary" | "utf8";
declare type SyncFn<T> = T extends (...args: infer A) => Promise<infer R> ? (...args: A) => R : never;
export declare type Sync<T extends Encryptor | Decryptor | EncryptorDecryptor> = {
    [P in keyof T]: SyncFn<T[P]>;
};
export {};
