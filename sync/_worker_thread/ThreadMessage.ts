
import * as environnement from "../environnement";
import { toBuffer } from "../toBuffer";
import { Encryptor, Decryptor, EncryptorDecryptor, RsaKey } from "../types";
declare const Buffer: any;

export type ThreadMessage = ThreadMessage.Action | ThreadMessage.Response;

export namespace ThreadMessage {

    export type Action =
        ScryptHash.Action |
        GenerateRsaKeys.Action |
        CipherFactory.Action |
        EncryptOrDecrypt.Action;

    export type Response =
        ScryptHash.Response |
        GenerateRsaKeys.Response |
        EncryptOrDecrypt.Response;

}

export namespace GenerateRsaKeys {

    export type Action = {
        action: "GenerateRsaKeys";
        actionId: number;
        params: Parameters<typeof import("../cipher/rsa").syncGenerateKeys>;
    };

    export type Response = {
        actionId: number;
        outputs: ReturnType<typeof import("../cipher/rsa").syncGenerateKeys>;
    };

}

export namespace CipherFactory {

    export type CipherName = "aes" | "rsa" | "plain";
    export type Components = "Encryptor" | "Decryptor" | "EncryptorDecryptor";

    export type Type<U extends Components> =
        U extends "EncryptorDecryptor" ?
        EncryptorDecryptor :
        U extends "Encryptor" ? Encryptor : Decryptor
        ;


    export type ActionPoly<T extends CipherName, U extends Components> = {
        action: "CipherFactory";
        cipherName: T;
        components: U;
        cipherInstanceRef: number;
        params:
        T extends "aes" ?
        (
            Parameters<typeof import("../cipher/aes").syncEncryptorDecryptorFactory>
        )
        : T extends "rsa" ?
        (
            U extends "EncryptorDecryptor" ?
            [RsaKey.Private, RsaKey.Public] | [RsaKey.Public, RsaKey.Private]
            : Parameters<typeof import("../cipher/rsa").syncEncryptorFactory>
        )
        :
        (
            []
        );
    };

    export type Action = ActionPoly<CipherName, Components>;

}

export namespace EncryptOrDecrypt {

    export type Action = {
        action: "EncryptOrDecrypt";
        actionId: number;
        cipherInstanceRef: number;
        method: keyof import("../types").EncryptorDecryptor;
        input: Uint8Array;
    };

    export type Response = {
        actionId: number;
        output: Uint8Array
    };

}

export namespace ScryptHash {

    export type Action = {
        action: "ScryptHash";
        actionId: number;
        params: [string, string, Partial<import("../scrypt").ScryptParams>]
    };

    export type Response = Response.Progress | Response.Final;

    export namespace Response {

        export type Progress = {
            actionId: number;
            percent: number;
        };

        export type Final = {
            actionId: number;
            digest: Uint8Array;
        };

    }

}


export namespace transfer {

    type SerializableUint8Array = {
        type: "Uint8Array";
        data: string;
    };

    namespace SerializableUint8Array {

        export function match(value: any): value is SerializableUint8Array {
            return (
                value instanceof Object &&
                (value as SerializableUint8Array).type === "Uint8Array" &&
                typeof (value as SerializableUint8Array).data === "string"
            );
        }

        export function build(value: Uint8Array): SerializableUint8Array {
            return {
                "type": "Uint8Array",
                "data": toBuffer(value).toString("binary")
            }
        }

        export function restore(value: SerializableUint8Array): Uint8Array {
            return Buffer.from(value.data, "binary");
        }

    }


    export function prepare<T extends ThreadMessage>(threadMessage: T): any {

        if (environnement.isBrowser()) {
            throw new Error("only for node");
        }

        const message = (() => {

            if (threadMessage instanceof Uint8Array) {
                return SerializableUint8Array.build(threadMessage);
            } else if (threadMessage instanceof Array) {
                return threadMessage.map(entry => prepare<any>(entry));
            } else if (threadMessage instanceof Object) {

                const out: any = {};

                for (const key in threadMessage) {
                    out[key] = prepare<any>(threadMessage[key]);
                }

                return out;


            } else {
                return threadMessage;
            }

        })();

        return message;

    }


    export function restore<T extends ThreadMessage>(message: any): T {

        if (environnement.isBrowser()) {
            throw new Error("only for node");
        }

        const threadMessage = (() => {

            if (SerializableUint8Array.match(message)) {
                return SerializableUint8Array.restore(message);
            } else if (message instanceof Array) {
                return message.map(entry => restore(entry));
            } else if (message instanceof Object) {

                const out: any = {};

                for (const key in message) {
                    out[key] = restore<any>(message[key]);
                }

                return out;


            } else {
                return message;
            }

        })();

        return threadMessage;


    }

}


