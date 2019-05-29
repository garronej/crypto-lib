
export type Encryptor = {
    /** return encryptedData */
    encrypt(plainData: Uint8Array): Promise<Uint8Array>;
};

export type Decryptor = {
    /** return plainData */
    decrypt(encryptedData: Uint8Array): Promise<Uint8Array>;
};



export type EncryptorDecryptor = Encryptor & Decryptor;

export type Encoding= "hex" | "base64" | "binary" | "utf8";

type SyncFn<T> = T extends (...args: infer A) => Promise<infer R> ? (...args: A) => R : never;
export type Sync<T extends Encryptor | Decryptor | EncryptorDecryptor> = { [P in keyof T]: SyncFn<T[P]>; };
