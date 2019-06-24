
import { toBuffer } from "./utils/toBuffer";

declare const Buffer: any;

export type Cipher = Encryptor | Decryptor | EncryptorDecryptor;

export type Encryptor = {
    /** return encryptedData */
    encrypt(plainData: Uint8Array): Promise<Uint8Array>;
};

export type Decryptor = {
    /** return plainData */
    decrypt(encryptedData: Uint8Array): Promise<Uint8Array>;
};

export type EncryptorDecryptor = Encryptor & Decryptor;

type SyncFn<T> = T extends (...args: infer A) => Promise<infer R> ? (...args: A) => R : never;
export type Sync<T extends Cipher> = { [P in keyof T]: SyncFn<T[P]>; };

export type RsaKey = RsaKey.Private | RsaKey.Public;

export namespace RsaKey {

    export function stringify(rsaKey: RsaKey): string {
        return JSON.stringify([rsaKey.format, toBuffer(rsaKey.data).toString("base64")]);
    }

    export function parse(stringifiedRsaKey: string): RsaKey {

        const [format, strData] = JSON.parse(stringifiedRsaKey) as [any, string];

        return { format, "data": new Uint8Array(Buffer.from(strData, "base64")) };

    }

    export type Public = {
        format: "pkcs1-public-der"
        data: Uint8Array
    };

    export namespace Public {

        export function match(rsaKey: RsaKey): rsaKey is Public {
            return rsaKey.format === "pkcs1-public-der";
        }

    }

    export type Private = {
        format: "pkcs1-private-der"
        data: Uint8Array
    };

    export namespace Private {

        export function match(rsaKey: RsaKey): rsaKey is Private {
            return rsaKey.format === "pkcs1-private-der";
        }

    }

}

export type ScryptParams = {
    /** 2^|n| of iterations. */
    n: number;
    /** Memory factor. */
    r: number;
    /** Parallelization factor. */
    p: number;
    digestLengthBytes: number;
};


