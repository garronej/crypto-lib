import { Encryptor, Decryptor, Sync, Encoding } from "./types";
export declare function stringifyThenEncryptFactory<T extends Encryptor | Sync<Encryptor>>(encryptor: T): <V>(value: V) => T extends Encryptor ? Promise<string> : string;
export declare namespace stringifyThenEncryptFactory {
    var stringRepresentationEncoding: Encoding;
}
export declare function decryptThenParseFactory<T extends Decryptor | Sync<Decryptor>>(decryptor: T): <V>(encryptedValue: string) => T extends Decryptor ? Promise<V> : V;
