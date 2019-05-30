declare const require: any;
declare const __dirname: any;
declare type ChildProcess= any;
declare const Buffer: any;

import { SyncEvent } from "ts-events-extended";
import { requireNodeBuiltIn } from "./requireNodeBuiltIn";
import { Sync, EncryptorDecryptor, RsaKey } from "../sync/types";
import { isBrowser } from "../sync/_worker_thread/environnement";
import { ThreadMessage, GenerateRsaKeys, CipherFactory, EncryptOrDecrypt, transfer } from "../sync/_worker_thread/ThreadMessage";

const fs= require("fs");
const path= require("path");

//NOTE: Path has to be static or it wont be bundled.
const bundle_source = fs.readFileSync(
    path.join(__dirname, "..", "sync", "_worker_thread", "bundle.min.js")
).toString("utf8");

let __hook: typeof import("../sync");

eval(bundle_source);

const {
    toBuffer,
    serializer,
    scrypt: sync_scrypt,
    aes: sync_aes,
    rsa: sync_rsa,
    plain: sync_plain
} = __hook!;

export { toBuffer, serializer };
export * from "../sync/types";


const getCounter = (() => {

    let counter = 0;

    return () => counter++;

})();


const evtWorkerMessage: SyncEvent<ThreadMessage.Response> = new SyncEvent();

const getPostMessage: () => ((action: ThreadMessage.Action, transfer?: ArrayBuffer[]) => void) = (() => {

    if (isBrowser()) {

        let worker: Worker | undefined = undefined;

        return () => {

            if (worker === undefined) {

                worker = new Worker(
                    window.URL.createObjectURL(
                        new Blob(
                            [bundle_source],
                            { "type": 'text/javascript' }
                        )

                    )
                );

                worker.addEventListener(
                    "message",
                    ev => evtWorkerMessage.post(
                        ev.data
                    )
                );

            }

            return (action: ThreadMessage.Action, transfer?: ArrayBuffer[]) =>
                worker!.postMessage(
                    action, transfer
                );

        };

    } else {

        const child_process = requireNodeBuiltIn("child_process");

        let childProcess: ChildProcess | undefined = undefined;

        return () => {

            if (childProcess === undefined) {

                const fs = requireNodeBuiltIn("fs");
                const path= requireNodeBuiltIn("path");

                const random_file_path = (() => {

                    let base_path = path.join("/", "tmp");

                    if (!fs.existsSync(base_path)) {
                        base_path = path.join(".");
                    }

                    const generateRandomFilePath = () => path.join(
                        base_path,
                        requireNodeBuiltIn("crypto")
                            .randomBytes(4)
                            .toString("hex")
                    );

                    let out = generateRandomFilePath();

                    while (fs.existsSync(out)) {
                        out = generateRandomFilePath();
                    }

                    return out;

                })();

                fs.writeFileSync(
                    random_file_path,
                    Buffer.from(
                        [
                            `console.log("LOADED");`,
                            `var __process_node= process;`,
                            bundle_source
                        ].join("\n"),
                        "utf8"
                    )
                );

                childProcess = child_process.fork(
                    random_file_path,
                    [],
                    { "silent": true }
                );

                childProcess.stdout.once(
                    "data",
                    () => fs.unlinkSync(random_file_path)
                );

                childProcess.on(
                    "message",
                    message => evtWorkerMessage.post(
                        transfer.restore(
                            message
                        )
                    )
                );

            }

            return (action: ThreadMessage.Action) => childProcess!.send(
                transfer.prepare(
                    action
                )
            );

        };

    }

})();


async function encryptOrDecrypt(
    cipherInstanceRef: number,
    method: keyof EncryptorDecryptor,
    input: Uint8Array
): Promise<Uint8Array> {

    const actionId = getCounter();

    getPostMessage()((() => {

        const action: EncryptOrDecrypt.Action = {
            "action": "EncryptOrDecrypt",
            actionId,
            cipherInstanceRef,
            method,
            input
        };

        return action;

    })(), [input.buffer]);

    const { output } = (await evtWorkerMessage.waitFor(
        ({ actionId: actionId_ }) => actionId_ === actionId
    )) as EncryptOrDecrypt.Response;

    return output;

}

function cipherFactory<A extends CipherFactory.Action>(
    params: Pick<A, Exclude<keyof A, "action" | "cipherInstanceRef">>
): A extends CipherFactory.ActionPoly<any, infer U> ? CipherFactory.Type<U> : never {

    const cipherInstanceRef = getCounter();

    getPostMessage()((() => {

        const action: CipherFactory.Action = {
            "action": "CipherFactory",
            cipherInstanceRef,
            ...params
        };

        return action;

    })());

    const cipher: any = (() => {

        const encrypt = (plainData: Uint8Array) => encryptOrDecrypt(cipherInstanceRef, "encrypt", plainData);
        const decrypt = (encryptedData: Uint8Array) => encryptOrDecrypt(cipherInstanceRef, "decrypt", encryptedData);

        switch (params.components) {
            case "EncryptorDecryptor": return { encrypt, decrypt };
            case "Decryptor": return { decrypt };
            case "Encryptor": return { encrypt };
        }

    })();

    return cipher;

}

type AsyncFactory<T> = T extends (...args: infer A) => Sync<infer R> ? (...args: A) => R : never;

export const plain = (() => {

    const encryptorDecryptorFactory: AsyncFactory<typeof sync_plain.syncEncryptorDecryptorFactory> =
        () => cipherFactory<CipherFactory.ActionPoly<"plain", "EncryptorDecryptor">>({
            "cipherName": "plain",
            "components": "EncryptorDecryptor",
            "params": []
        });

    return {
        encryptorDecryptorFactory,
        ...sync_plain
    };

})();

export const aes = (() => {

    const encryptorDecryptorFactory: AsyncFactory<typeof sync_aes.syncEncryptorDecryptorFactory> =
        key => cipherFactory<CipherFactory.ActionPoly<"aes", "EncryptorDecryptor">>({
            "cipherName": "aes",
            "components": "EncryptorDecryptor",
            "params": [key]
        });

    return {
        encryptorDecryptorFactory,
        ...sync_aes
    };


})();

export const rsa = (() => {

    const encryptorFactory: AsyncFactory<typeof sync_rsa.syncEncryptorFactory>
        = encryptKey => cipherFactory<CipherFactory.ActionPoly<"rsa", "Encryptor">>({
            "cipherName": "rsa",
            "components": "Encryptor",
            "params": [encryptKey]
        });

    const decryptorFactory: AsyncFactory<typeof sync_rsa.syncDecryptorFactory>
        = decryptKey => cipherFactory<CipherFactory.ActionPoly<"rsa", "Decryptor">>({
            "cipherName": "rsa",
            "components": "Decryptor",
            "params": [decryptKey]
        });

    function encryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public): EncryptorDecryptor;
    function encryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private): EncryptorDecryptor;
    function encryptorDecryptorFactory(encryptKey, decryptKey) {
        return cipherFactory<CipherFactory.ActionPoly<"rsa", "EncryptorDecryptor">>({
            "cipherName": "rsa",
            "components": "EncryptorDecryptor",
            "params": [encryptKey, decryptKey]
        });
    }

    type AsyncFn<T> = T extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : never;

    const generateKeys: AsyncFn<typeof sync_rsa.syncGenerateKeys> =
        async seed => {

            const actionId = getCounter();

            getPostMessage()((() => {

                const action: GenerateRsaKeys.Action = {
                    "action": "GenerateRsaKeys",
                    actionId,
                    "params": [seed]
                };

                return action;

            })());

            const { outputs } = (await evtWorkerMessage.waitFor(
                ({ actionId: actionId_ }) => actionId_ === actionId
            )) as GenerateRsaKeys.Response;

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

export const scrypt = (()=>{

    return {
        ...sync_scrypt
    };

})();