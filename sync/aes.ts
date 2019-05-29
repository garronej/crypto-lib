import * as aesjs from "aes-js";
import * as types from "./types";
import * as randomBytes from "randombytes";

declare const require: any;

export function syncEncryptorDecryptorFactory(key: Uint8Array): types.Sync<types.EncryptorDecryptor> {


    const _counterLength = (new aesjs.Counter(0))._counter.length;

    return {
        "encrypt": (() => {

            const counter = new aesjs.Counter(5);

            return (plainData: Uint8Array) => {

                try {
                    const _counter = counter._counter.slice();
                    const payload = (new aesjs.ModeOfOperation.ctr(key, counter))
                        .encrypt(plainData);

                    const encryptedData = new Uint8Array(_counterLength + payload.length);
                    encryptedData.set(_counter);
                    encryptedData.set(payload, _counterLength);

                    return encryptedData;
                } catch (error) {

                    throw new Error(`key ============> ${require("util" + "").inspect(key)}${error.stack}`);

                }


            };


        })(),
        "decrypt": (() => {

            const counter = new aesjs.Counter(0);

            return (encryptedData: Uint8Array) => {

                counter.setBytes(encryptedData.slice(0, _counterLength));

                return (new aesjs.ModeOfOperation.ctr(key, counter))
                    .decrypt(
                        encryptedData.slice(
                            _counterLength,
                            encryptedData.length
                        )
                    );

            };


        })()
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

export function generateTestKey(): Promise<Uint8Array> {
    return Promise.resolve(
        new Uint8Array([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28,
            29, 30, 31
        ])
    );
}
