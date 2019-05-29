
import * as environnement from "./environnement";

export type ThreadMessage = ThreadMessage.Action | ThreadMessage.Response;

export namespace ThreadMessage {

    export type Action =
        GenerateRsaKeys.Action |
        DummyEncryptorDecryptorFactory.Action |
        AesEncryptorDecryptorFactory.Action |
        RsaDecryptorFactory.Action |
        RsaEncryptorFactory.Action |
        EncryptOrDecrypt.Action;

    export type Response =
        GenerateRsaKeys.Response |
        EncryptOrDecrypt.Response;


    export namespace GenerateRsaKeys {

        export type Action = {
            action: "GenerateRsaKeys";
            actionId: number;
            params: Parameters<typeof import("../rsa").syncEncryptorFactory>;
        };

        export type Response = {
            actionId: number;
            outputs: ReturnType<typeof import("../rsa").syncGenerateKeys>;
        };

    }

    export namespace DummyEncryptorDecryptorFactory {

        export type Action = {
            action: "DummyEncryptorDecryptorFactory",
            instanceRef: number
        };

    }

    export namespace AesEncryptorDecryptorFactory {

        export type Action = {
            action: "AesEncryptorDecryptorFactory",
            instanceRef: number,
            params: Parameters<typeof import("../aes").syncEncryptorDecryptorFactory>;
        };

    }

    export namespace RsaEncryptorFactory {

        export type Action = {
            action: "RsaEncryptorFactory";
            instanceRef: number;
            params: Parameters<typeof import("../rsa").syncEncryptorFactory>;
        };

    }

    export namespace RsaDecryptorFactory {

        export type Action = {
            action: "RsaDecryptorFactory";
            instanceRef: number;
            params: Parameters<typeof import("../rsa").syncDecryptorFactory>;
        };

    }

    export namespace EncryptOrDecrypt {

        export type Action = {
            action: "EncryptOrDecrypt";
            actionId: number;
            instanceRef: number;
            method: keyof import("../types").EncryptorDecryptor;
            input: Uint8Array;
        };

        export type Response = {
            actionId: number;
            output: Uint8Array
        };

    }

    export namespace transfer {

        type SerializableUint8Array = {
            type: "Uint8Array",
            data: number[]
        };

        namespace SerializableUint8Array {

            export function match(value: any): value is SerializableUint8Array {
                return (
                    value instanceof Object &&
                    (value as SerializableUint8Array).type === "Uint8Array" &&
                    (value as SerializableUint8Array).data instanceof Array
                );
            }

            export function build(value: Uint8Array): SerializableUint8Array {
                return {
                    "type": "Uint8Array",
                    "data": Array.from(value)
                }
            }

            export function restore(value: SerializableUint8Array): Uint8Array {
                return Uint8Array.from(value.data);
            }

        }


        export function prepare<T extends ThreadMessage>(data: T): any {

            if (environnement.isBrowser()) {
                throw new Error("only for node");
            }

            const message: any = {};

            for (const key in data) {

                const value = data[key];

                message[key] = (() => {
                    if (value instanceof Uint8Array) {
                        return SerializableUint8Array.build(value);
                    } else if (value instanceof Object) {
                        return prepare<any>(value);
                    } else {
                        return value;
                    }
                })();


            }

            return message;

        }


        export function restore<T extends ThreadMessage>(message: any): T {

            if (environnement.isBrowser()) {
                throw new Error("only for node");
            }

            const data: any = {};

            for (const key in message) {

                const value = message[key];

                data[key] = (() => {
                    if (SerializableUint8Array.match(value)) {
                        return SerializableUint8Array.restore(value);
                    } else if (value instanceof Object) {
                        return restore(value);
                    } else {
                        return value;
                    }
                })();

            }

            return data;

        }

    }

}


