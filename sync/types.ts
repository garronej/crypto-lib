import { toBuffer } from "./toBuffer";

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


export type Encoding = "hex" | "base64" | "binary" | "utf8";

export type RsaKey= RsaKey.Private | RsaKey.Public;

export namespace RsaKey {

    export function stringify(rsaKey: RsaKey): string {
        return JSON.stringify([ rsaKey.format, toBuffer(rsaKey.data).toString("binary") ]);
    }

    export function parse(stringifiedRsaKey: string): RsaKey {

        const [format, strData] = JSON.parse(stringifiedRsaKey) as [ any, string];

        return { format, "data": new Uint8Array(Buffer.from(strData,"binary")) };

    }

    /** 
     * If |data| is a string it must be string representation
     * of the data in binary encoding.
     * Example: data is an Uint8Array the corresponding string should be:
     *  Buffer.from(data).toString("binary")
     */
    export function build(data: Uint8Array | string, format: Public["format"]): Public;
    export function build(data: Uint8Array | string, format: Private["format"]): Private;
    export function build(data: Uint8Array | string, format): RsaKey{

        return {
            format,
            "data": typeof data === "string" ? 
                Buffer.from(data, "binary") : data
        };

    }

    export type Public = {
        format: "pkcs1-public-der"
        data: Uint8Array
    };

    export namespace Public {

        export function build(data: Uint8Array | string): Public {
            return RsaKey.build(data, "pkcs1-public-der");
        }

        export function match(rsaKey: RsaKey): rsaKey is Public {
            return rsaKey.format === "pkcs1-public-der";
        }

    }

    export type Private = {
        format: "pkcs1-private-der"
        data: Uint8Array
    };

    export namespace Private {

        export function build(data: Uint8Array | string): Private {
            return RsaKey.build(data, "pkcs1-private-der");
        }

        export function match(rsaKey: RsaKey): rsaKey is Private {
            return rsaKey.format === "pkcs1-private-der";
        }

    }

}

