export declare type Cipher = Encryptor | Decryptor | EncryptorDecryptor;
export declare type Encryptor = {
    /** return encryptedData */
    encrypt(plainData: Uint8Array): Promise<Uint8Array>;
};
export declare type Decryptor = {
    /** return plainData */
    decrypt(encryptedData: Uint8Array): Promise<Uint8Array>;
};
export declare type EncryptorDecryptor = Encryptor & Decryptor;
declare type SyncFn<T> = T extends (...args: infer A) => Promise<infer R> ? (...args: A) => R : never;
export declare type Sync<T extends Cipher> = {
    [P in keyof T]: SyncFn<T[P]>;
};
export declare type Encoding = "hex" | "base64" | "binary" | "utf8";
export declare type RsaKey = RsaKey.Private | RsaKey.Public;
export declare namespace RsaKey {
    function stringify(rsaKey: RsaKey): string;
    function parse(stringifiedRsaKey: string): RsaKey;
    /**
     * If |data| is a string it must be string representation
     * of the data in binary encoding.
     * Example: data is an Uint8Array the corresponding string should be:
     *  Buffer.from(data).toString("binary")
     */
    function build(data: Uint8Array | string, format: Public["format"]): Public;
    function build(data: Uint8Array | string, format: Private["format"]): Private;
    type Public = {
        format: "pkcs1-public-der";
        data: Uint8Array;
    };
    namespace Public {
        function build(data: Uint8Array | string): Public;
        function match(rsaKey: RsaKey): rsaKey is Public;
    }
    type Private = {
        format: "pkcs1-private-der";
        data: Uint8Array;
    };
    namespace Private {
        function build(data: Uint8Array | string): Private;
        function match(rsaKey: RsaKey): rsaKey is Private;
    }
}
export {};
