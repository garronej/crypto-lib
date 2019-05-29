import * as types from "./types";
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
export declare function syncEncryptorFactory(encryptKey: RsaKey): types.Sync<types.Encryptor>;
export declare function syncDecryptorFactory(decryptKey: RsaKey): types.Sync<types.Decryptor>;
export declare function encryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): types.Sync<types.EncryptorDecryptor>;
export declare function encryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): types.Sync<types.EncryptorDecryptor>;
export declare function syncGenerateKeys(seed: Uint8Array): {
    publicKey: RsaKey.Public;
    privateKey: RsaKey.Private;
};
