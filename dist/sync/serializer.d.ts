import * as types from "./types";
export declare function stringifyThenEncryptFactory(encryptor: types.Sync<types.Encryptor>): <T>(value: T) => string;
export declare namespace stringifyThenEncryptFactory {
    var stringRepresentationEncoding: types.Encoding;
}
export declare function stringifyThenEncryptFactory(encryptor: types.Encryptor): <T>(value: T) => Promise<string>;
export declare namespace stringifyThenEncryptFactory {
    var stringRepresentationEncoding: types.Encoding;
}
export declare function decryptThenParseFactory(decryptor: types.Sync<types.Decryptor>): <T>(encryptedValue: string) => T;
export declare function decryptThenParseFactory(decryptor: types.Decryptor): <T>(encryptedValue: string) => Promise<T>;
