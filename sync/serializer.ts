import * as types from "./types";
import { toBuffer } from "./toBuffer";
import * as ttJC from "transfer-tools/dist/lib/JSON_CUSTOM";

declare const Buffer: any;

function matchPromise<T>(prOrValue: T | Promise<T>): prOrValue is Promise<T> {
    return "then" in prOrValue;
}

export function stringifyThenEncryptFactory(encryptor: types.Sync<types.Encryptor>): <T>(value: T) => string;
export function stringifyThenEncryptFactory(encryptor: types.Encryptor): <T>(value: T) => Promise<string>;
export function stringifyThenEncryptFactory(encryptor: types.Sync<types.Encryptor> | types.Encryptor): <T>(value: T) => string | Promise<string> {

    const { stringify } = ttJC.get();

    return function stringifyThenEncrypt<T>(value: T): string | Promise<string> {

        const prOrValue = encryptor.encrypt(
            Buffer.from(
                [
                    stringify(value),
                    (new Array(9 + Math.floor(Math.random() * 50)))
                        .fill(" ")
                        .join("")
                ].join(""),
                "utf8"
            )
        );

        const finalize = (value: Uint8Array) => toBuffer(
            value
        ).toString(stringifyThenEncryptFactory.stringRepresentationEncoding);

        return matchPromise(prOrValue) ?
            prOrValue.then(value => finalize(value)) :
            finalize(prOrValue);

    };

}

stringifyThenEncryptFactory.stringRepresentationEncoding = "binary" as types.Encoding;

export function decryptThenParseFactory(decryptor: types.Sync<types.Decryptor>): <T>(encryptedValue: string) => T;
export function decryptThenParseFactory(decryptor: types.Decryptor): <T>(encryptedValue: string) => Promise<T>;
export function decryptThenParseFactory(decryptor: types.Sync<types.Decryptor> | types.Decryptor): <T>(encryptedValue: string) => T | Promise<T> {

    const { parse } = ttJC.get();

    return function decryptThenParse<T>(encryptedValue: string): T | Promise<T> {

        const prOrValue = decryptor.decrypt(
            Buffer.from(
                encryptedValue,
                stringifyThenEncryptFactory.stringRepresentationEncoding
            )
        );

        const finalize = (value: Uint8Array) => parse(
            toBuffer(
                value
            ).toString("utf8")
        );

        return matchPromise(prOrValue) ?
            prOrValue.then(value => finalize(value)) :
            finalize(prOrValue);


    }

}
