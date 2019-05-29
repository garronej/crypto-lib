import * as types from "./types";
import { toBuffer } from "./toBuffer";
import * as NodeRSA from "node-rsa";

declare type Buffer= any;
declare const Buffer: any;

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

const newNodeRSA = (key: RsaKey) => new NodeRSA(Buffer.from(key.data), key.format);


/** 
 * NOTE: The toBuffer function of the library does not  
 * guaranty that the returned object is an actually
 * buffer instance.
 * */
const toRealBuffer = (data: Uint8Array): Buffer =>
    data instanceof Buffer || Object.getPrototypeOf(data).name === "Buffer" ?
        data as Buffer :
        Buffer.from(data)
    ;

export function syncEncryptorFactory(encryptKey: RsaKey): types.Sync<types.Encryptor> {

    return {
        "encrypt": (() => {

            const encryptNodeRSA = newNodeRSA(encryptKey);

            const encryptMethod = RsaKey.Private.match(encryptKey) ?
                "encryptPrivate" :
                "encrypt"
                ;

            return (plainData: Uint8Array): Uint8Array =>
                encryptNodeRSA[encryptMethod](toRealBuffer(plainData))
                ;


        })()
    };

}

export function syncDecryptorFactory(decryptKey: RsaKey): types.Sync<types.Decryptor> {

    return {
        "decrypt": (() => {

            const decryptNodeRSA = newNodeRSA(decryptKey);

            const decryptMethod = RsaKey.Public.match(decryptKey) ?
                "decrypt" :
                "decryptPublic"
                ;

            return (encryptedData: Uint8Array): Uint8Array =>
                decryptNodeRSA[decryptMethod](toRealBuffer(encryptedData))
                ;

        })()
    };

}

export function encryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): types.Sync<types.EncryptorDecryptor>;
export function encryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): types.Sync<types.EncryptorDecryptor>;
export function encryptorDecryptorFactory(encryptKey: RsaKey, decryptKey: RsaKey): types.Sync<types.EncryptorDecryptor> {

    return {
        ...syncEncryptorFactory(encryptKey),
        ...syncDecryptorFactory(decryptKey)
    };

}

export function syncGenerateKeys(seed: Uint8Array): {
    publicKey: RsaKey.Public;
    privateKey: RsaKey.Private;
} {

    const nodeRSA = NodeRSA.generateKeyPairFromSeed(
        toRealBuffer(seed),
        8 * 80
    );

    const getData= (format: RsaKey["format"])=> nodeRSA.exportKey(format) as Uint8Array;

    return {
        "publicKey": (()=>{

            const format: RsaKey.Public["format"] = "pkcs1-public-der";

            return RsaKey.build(getData(format), format);

        })(),
        "privateKey": (()=>{

            const format: RsaKey.Private["format"] = "pkcs1-private-der";

            return RsaKey.build(getData(format), format);


        })()
    };

}
