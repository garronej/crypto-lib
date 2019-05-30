import { Encryptor, Decryptor, EncryptorDecryptor, Sync } from "../types";
import { RsaKey } from "../types";
import * as NodeRSA from "node-rsa";
import { isBrowser } from "../environnement";

declare type Buffer= any;
declare const Buffer: any;

const getEnvironment= ()=> isBrowser() ? "browser" : "node";

const newNodeRSA = (key: RsaKey) => new NodeRSA(
    Buffer.from(key.data), 
    key.format,
    { "environment": getEnvironment() }
);

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

export function syncEncryptorFactory(encryptKey: RsaKey): Sync<Encryptor> {
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


export function syncDecryptorFactory(decryptKey: RsaKey): Sync<Decryptor> {
    return {
        "decrypt": (() => {

            const decryptNodeRSA = newNodeRSA(decryptKey);

            const decryptMethod = RsaKey.Public.match(decryptKey) ?
                "decryptPublic" :
                "decrypt" 
                ;

            return (encryptedData: Uint8Array): Uint8Array =>
                decryptNodeRSA[decryptMethod](toRealBuffer(encryptedData))
                ;

        })()
    };
}


export function syncEncryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): Sync<EncryptorDecryptor>;
export function syncEncryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): Sync<EncryptorDecryptor>;
export function syncEncryptorDecryptorFactory(encryptKey, decryptKey) {

    return {
        ...syncEncryptorFactory(encryptKey),
        ...syncDecryptorFactory(decryptKey)
    }

}

export function syncGenerateKeys(seed: Uint8Array, keysLengthBytes: number= 80): {
    publicKey: RsaKey.Public;
    privateKey: RsaKey.Private;
} {

    const nodeRSA = NodeRSA.generateKeyPairFromSeed(
        toRealBuffer(seed),
        8 * keysLengthBytes,
        undefined,
        getEnvironment()
    );

    const getData = (format: RsaKey["format"]) => nodeRSA.exportKey(format) as Uint8Array;

    return {
        "publicKey": (() => {

            const format: RsaKey.Public["format"] = "pkcs1-public-der";

            return RsaKey.build(getData(format), format);

        })(),
        "privateKey": (() => {

            const format: RsaKey.Private["format"] = "pkcs1-private-der";

            return RsaKey.build(getData(format), format);

        })()
    };

}
