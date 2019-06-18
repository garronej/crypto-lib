import * as aesjs from "aes-js";
import * as randomBytes from "randombytes";
import { EncryptorDecryptor, Sync } from "../types";
import { leftShift, addPadding, uint8ArrayToNumber, numberToUint8Array, concatUint8Array } from "../utils";

export function syncEncryptorDecryptorFactory(key: Uint8Array): Sync<EncryptorDecryptor> {

    return {
        "encrypt": (() => {

            const getIv = (() => {

                const iv0 = randomBytes(16);

                return () => leftShift(iv0);

            })();

            return (plainData: Uint8Array) => {

                const iv = getIv();

                const originalLengthAsByte = addPadding(
                    "LEFT",
                    numberToUint8Array(plainData.length),
                    4
                );

                const plainDataMultipleOf16Bytes = addPadding(
                    "RIGHT",
                    plainData,
                    plainData.length + (16 - plainData.length % 16)
                );

                const encryptedDataPayload = (new aesjs.ModeOfOperation.cbc(key, iv))
                    .encrypt(plainDataMultipleOf16Bytes)
                    ;

                return concatUint8Array(
                    iv,
                    originalLengthAsByte,
                    encryptedDataPayload
                );

            };


        })(),
        "decrypt": (encryptedData: Uint8Array) => {

            const iv = encryptedData.slice(0, 16);

            const originalLengthAsByte = encryptedData.slice(16, 16 + 4);

            const originalLength = uint8ArrayToNumber(originalLengthAsByte);

            return (new aesjs.ModeOfOperation.cbc(key, iv))
                .decrypt(encryptedData.slice(16 + 4))
                .slice(0, originalLength)
                ;

        }

    };

}

export function generateKey() {
    return new Promise<Uint8Array>(
        (resolve, reject) => randomBytes(
            32,
            (err, buf) => {
                if (!!err) {
                    reject(err);
                } else {
                    resolve(buf);
                }
            }
        )
    );
}

export function getTestKey(): Promise<Uint8Array> {
    return Promise.resolve(
        new Uint8Array([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
            29, 30, 31
        ])
    );
}
