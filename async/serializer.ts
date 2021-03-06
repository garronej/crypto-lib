import { Encryptor, Decryptor, Sync } from "../sync/types";
import { Encoding, toBuffer } from "../sync/utils/toBuffer";
import * as ttJC from "transfer-tools/dist/lib/JSON_CUSTOM";

declare const Buffer: any;

function matchPromise<T>(prOrValue: T | Promise<T>): prOrValue is Promise<T> {
    return "then" in prOrValue;
}

let stringRepresentationEncoding = "base64" as Encoding;

export function stringifyThenEncryptFactory<T extends Encryptor | Sync<Encryptor>>(encryptor: T) {

    const { stringify } = ttJC.get();

    return function stringifyThenEncrypt<V>(value: V): T extends Encryptor ? Promise<string> : string {

        const prOrValue = encryptor.encrypt(
            Buffer.from(
                [
                    stringify(value),
                    (new Array(9 + Math.floor(Math.random() * 20)))
                        .fill(" ")
                        .join("")
                ].join(""),
                "utf8"
            )
        );

        const finalize = (value: Uint8Array) => toBuffer(
            value
        ).toString(stringRepresentationEncoding);

        return (matchPromise(prOrValue) ?
            prOrValue.then(value => finalize(value)) :
            finalize(prOrValue)) as any;

    };

}


export function decryptThenParseFactory<T extends Decryptor | Sync<Decryptor>>(decryptor: T) {

    const { parse } = ttJC.get();

    return function decryptThenParse<V>(encryptedValue: string): T extends Decryptor ? Promise<V> : V {

        const prOrValue = decryptor.decrypt(
            Buffer.from(
                encryptedValue,
                stringRepresentationEncoding
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

