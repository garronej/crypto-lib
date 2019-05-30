declare const require: any;
declare const __dirname: any;

import { EncryptorDecryptor, RsaKey } from "../sync/types";
import { GenerateRsaKeys, CipherFactory, EncryptOrDecrypt } from "../sync/_worker_thread/ThreadMessage";
import { WorkerThread } from "./WorkerThread";
import { isBrowser } from "../sync/environnement";

const bundle_source = (() => {

    const fs = require("fs");
    const path = require("path");

    return fs.readFileSync(
        path.join(__dirname, "..", "sync", "_worker_thread", "bundle.min.js")
    ).toString("utf8");

})();

let __cryptoLib: typeof import("../sync");

eval(bundle_source);

const {
    toBuffer,
    serializer,
    scrypt: sync_scrypt,
    aes: sync_aes,
    rsa: sync_rsa,
    plain: sync_plain
} = __cryptoLib!;

export { toBuffer, serializer };
export * from "../sync/types";

let isMultithreadingEnabled = isBrowser() ? (
    typeof Worker !== "undefined" &&
    typeof URL !== "undefined" &&
    typeof Blob !== "undefined") : true;

export function disableMultithreading() {
    isMultithreadingEnabled = false;
}

const [getWorkerThread, terminateWorkerThreads] = (() => {

    const spawn = WorkerThread.factory(
        bundle_source,
        () => isMultithreadingEnabled
    );

    const record: Record<string, WorkerThread> = {};

    return [
        (workerThreadId: string) => {

            let appWorker = record[workerThreadId];

            if (appWorker === undefined) {

                appWorker = spawn();

                record[workerThreadId] = appWorker;

            }

            return appWorker;

        },
        (match?: (workerThreadId: string) => boolean) =>
            Object.keys(record)
                .filter(id => !!match ? match(id) : true)
                .map(id => [record[id], id] as const)
                .filter(([appWorker]) => appWorker !== undefined)
                .forEach(([appWorker, id]) => {
                    appWorker.terminate();
                    delete record[id];
                })
    ] as const;

})();

export { terminateWorkerThreads };

export function preSpawnWorkerThread(workerThreadId: string) {
    getWorkerThread(workerThreadId);
}

const getCounter = (() => {

    let counter = 0;

    return () => counter++;

})();


async function encryptOrDecrypt(
    cipherInstanceRef: number,
    method: keyof EncryptorDecryptor,
    input: Uint8Array,
    workerThreadId: string
): Promise<Uint8Array> {

    type Action = EncryptOrDecrypt.Action;
    type Response = EncryptOrDecrypt.Response;

    const actionId = getCounter();

    const appWorker = getWorkerThread(workerThreadId);

    appWorker.send(
        (() => {

            const action: Action = {
                "action": "EncryptOrDecrypt",
                actionId,
                cipherInstanceRef,
                method,
                input
            };

            return action;

        })(),
        [input.buffer]
    );

    const { output } = await appWorker.evtResponse.waitFor(
        (response): response is Response =>
            response.actionId === actionId
    );

    return output;

}



function cipherFactory<A extends CipherFactory.Action>(
    params: Pick<A, Exclude<keyof A, "action" | "cipherInstanceRef">>,
    workerThreadId?: string
): A extends CipherFactory.ActionPoly<any, infer U> ? CipherFactory.Type<U> : never {

    type Action = CipherFactory.Action;

    const cipherInstanceRef = getCounter();

    const appWorker = getWorkerThread(params.cipherName);

    appWorker.send(
        (() => {

            const action: Action = {
                "action": "CipherFactory",
                cipherInstanceRef,
                ...params
            };

            return action;

        })()
    );


    const cipher: any = (() => {

        const [encrypt, decrypt] = (["encrypt", "decrypt"] as const)
            .map(method => ((data: Uint8Array) => encryptOrDecrypt(
                cipherInstanceRef,
                method,
                data,
                workerThreadId === undefined ? params.cipherName : workerThreadId
            )))
            ;

        switch (params.components) {
            case "EncryptorDecryptor": return { encrypt, decrypt };
            case "Decryptor": return { decrypt };
            case "Encryptor": return { encrypt };
        }

    })();

    return cipher;

}


export const plain = (() => {

    const encryptorDecryptorFactory = (workerThreadId?: string) =>
        cipherFactory<CipherFactory.ActionPoly<"plain", "EncryptorDecryptor">>(
            {
                "cipherName": "plain",
                "components": "EncryptorDecryptor",
                "params": []
            },
            workerThreadId
        );

    return {
        encryptorDecryptorFactory,
        ...sync_plain
    };

})();

export const aes = (() => {

    const encryptorDecryptorFactory = (key: Uint8Array, workerThreadId?: string) =>
        cipherFactory<CipherFactory.ActionPoly<"aes", "EncryptorDecryptor">>(
            {
                "cipherName": "aes",
                "components": "EncryptorDecryptor",
                "params": [key]
            },
            workerThreadId
        );

    return {
        encryptorDecryptorFactory,
        ...sync_aes
    };


})();

export const rsa = (() => {

    const encryptorFactory = (encryptKey: RsaKey, workerThreadId?: string) =>
        cipherFactory<CipherFactory.ActionPoly<"rsa", "Encryptor">>(
            {
                "cipherName": "rsa",
                "components": "Encryptor",
                "params": [encryptKey]
            },
            workerThreadId
        );

    const decryptorFactory = (decryptKey: RsaKey, workerThreadId?: string) =>
        cipherFactory<CipherFactory.ActionPoly<"rsa", "Decryptor">>(
            {
                "cipherName": "rsa",
                "components": "Decryptor",
                "params": [decryptKey]
            },
            workerThreadId
        );

    function encryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public, workerThreadId?: string): EncryptorDecryptor;
    function encryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private, workerThreadId?: string): EncryptorDecryptor;
    function encryptorDecryptorFactory(encryptKey, decryptKey, workerThreadId?: string): EncryptorDecryptor {
        return cipherFactory<CipherFactory.ActionPoly<"rsa", "EncryptorDecryptor">>(
            {
                "cipherName": "rsa",
                "components": "EncryptorDecryptor",
                "params": [encryptKey, decryptKey]
            },
            workerThreadId
        );
    }


    const generateKeys = async (seed: Uint8Array, keysLengthBytes?: number, workerThreadId?: string) => {

        type Action = GenerateRsaKeys.Action;
        type Response = GenerateRsaKeys.Response;

        const actionId = getCounter();

        const appWorker = getWorkerThread(
            workerThreadId === undefined ? "rsa" : workerThreadId
        );

        appWorker.send((() => {

            const action: Action = {
                "action": "GenerateRsaKeys",
                actionId,
                "params": [seed, keysLengthBytes]
            };

            return action;

        })());

        const { outputs } = await appWorker.evtResponse.waitFor(
            (response): response is Response =>
                response.actionId === actionId
        );

        return outputs;

    };

    return {
        encryptorFactory,
        decryptorFactory,
        encryptorDecryptorFactory,
        generateKeys,
        ...sync_rsa
    };

})();

export const scrypt = (() => {

    return {
        ...sync_scrypt
    };

})();