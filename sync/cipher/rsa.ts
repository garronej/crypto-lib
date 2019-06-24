import { Encryptor, Decryptor, EncryptorDecryptor, Sync } from "../types";
import { RsaKey } from "../types";
import * as NodeRSA from "node-rsa";
import { environnement } from "../utils/environnement";
import { toBuffer } from "../utils/toBuffer";

declare type Buffer = any;
declare const Buffer: any;

const targetedEnvironnement = environnement.type === "NODE" ? "node" : "browser";

const newNodeRSA = (key: RsaKey) => new NodeRSA(
    Buffer.from(key.data),
    key.format,
    { "environment": targetedEnvironnement }
);


export function syncEncryptorFactory(encryptKey: RsaKey): Sync<Encryptor> {
    return {
        "encrypt": (() => {

            const encryptNodeRSA = newNodeRSA(encryptKey);

            const encryptMethod = RsaKey.Private.match(encryptKey) ?
                "encryptPrivate" :
                "encrypt"
                ;

            return (plainData: Uint8Array): Uint8Array =>
                encryptNodeRSA[encryptMethod](toBuffer(plainData))
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
                decryptNodeRSA[decryptMethod](toBuffer(encryptedData))
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

export function syncGenerateKeys(seed: Uint8Array | null, keysLengthBytes: number = 80): {
    publicKey: RsaKey.Public;
    privateKey: RsaKey.Private;
} {

    const nodeRSA = NodeRSA.generateKeyPairFromSeed(
        seed,
        8 * keysLengthBytes,
        undefined,
        targetedEnvironnement
    );

    function buildKey(format: RsaKey.Public["format"]): RsaKey.Public;
    function buildKey(format: RsaKey.Private["format"]): RsaKey.Private;
    function buildKey(format): RsaKey {
        return {
            format,
            "data": nodeRSA.exportKey(format) as Uint8Array
        };
    }

    return {
        "publicKey": buildKey("pkcs1-public-der"),
        "privateKey": buildKey("pkcs1-private-der")
    };

}
