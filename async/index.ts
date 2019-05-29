//TODO: Handle when not in the browser
/// <reference lib="dom"/> 
/// <reference path="../node_modules/@types/node/index.d.ts"/> 

import { SyncEvent } from "ts-events-extended";
import { requireNodeBuiltIn } from "./requireNodeBuiltIn";
declare const require: any;
const fs = require("fs");
const path = require("path");
//declare const __dirname: any;

//NOTE: Path has to be static or it wont be bundled.
const bundle_source = fs.readFileSync(
    path.join(__dirname, "..", "sync","_worker_thread", "bundle.js")
).toString("utf8");

let __hook: typeof import("../sync");

eval(bundle_source);

const {
    _worker_thread,
    toBuffer,
    serializer,
    scrypt: scryptSync,
    aes: aesSync,
    rsa: rsaSync,
    dummy: dummySync
} = __hook!;

export { toBuffer, serializer };

export type Encryptor = import("../sync/types").Encryptor;
export type Decryptor = import("../sync/types").Decryptor;
export type EncryptorDecryptor = import("../sync/types").EncryptorDecryptor;
export type Sync<T extends Encryptor | Decryptor | EncryptorDecryptor> = import("../sync/types").Sync<T>;
export type Encoding = import("../sync/types").Encoding;

type AsyncFactory<T> = T extends (...args: infer A) => Sync<infer R> ? (...args: A) => R : never;

const getCounter = (() => {

    let counter = 0;

    return () => counter++;

})();


const evtWorkerMessage: SyncEvent<import("../sync/_worker_thread").ThreadMessage.Response> = new SyncEvent();

const getPostMessage: () => ((action: import("../sync/_worker_thread").ThreadMessage.Action, transfer?: Transferable[]) => void) = (() => {

    if (_worker_thread.isBrowser()) {

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

            return (action: import("../sync/_worker_thread").ThreadMessage.Action, transfer?: Transferable[]) =>
                worker!.postMessage(
                    action, transfer
                );

        };

    } else {

        const child_process: typeof import("child_process") = require("child_process" + "");

        let childProcess: import("child_process").ChildProcess | undefined = undefined;

        return () => {

            if (childProcess === undefined) {

                const fs = requireNodeBuiltIn("fs");

                const random_file_path = (() => {

                    const generateRandomFilePath = () => path.join(
                        ".",
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
                    undefined, 
                    { "stdio": [ "pipe", "pipe", "pipe", "ipc"] }
                );

                childProcess.on(
                    "message",
                    message => evtWorkerMessage.post(
                        _worker_thread.ThreadMessage.transfer.restore(
                            message
                        )
                    )
                );

                /*
                childProcess.stdout.once(
                    "data",
                    () => fs.unlinkSync(random_file_path)
                );
                */

                childProcess.stdout.on(
                    "data",
                    (data: Buffer) => {

                        console.log(`ChildProcess => ${data.toString("utf8")}`);

                    }
                );


            }

            /*
            return (action: import("../sync/_worker_thread").ThreadMessage.Action) => childProcess!.send(
                _worker_thread.ThreadMessage.transfer.prepare(
                    action
                )
            );
            */

            return (action: import("../sync/_worker_thread").ThreadMessage.Action) => childProcess!.send((() => {

                const message = _worker_thread.ThreadMessage.transfer.prepare(
                    action
                );

                console.log(`before send: ${require("util" + "").inspect(message)}`);

                return message;

            })());

        };

    }

})();


async function encryptOrDecrypt(
    instanceRef: number,
    method: keyof EncryptorDecryptor,
    input: Uint8Array
): Promise<Uint8Array> {

    const actionId = getCounter();

    getPostMessage()((() => {

        const action: import("../sync/_worker_thread").ThreadMessage.EncryptOrDecrypt.Action = {
            "action": "EncryptOrDecrypt",
            actionId,
            method,
            instanceRef,
            input
        };

        return action;

    })(), [input.buffer]);

    const { output } = (await evtWorkerMessage.waitFor(
        ({ actionId: actionId_ }) => actionId_ === actionId
    )) as import("../sync/_worker_thread").ThreadMessage.EncryptOrDecrypt.Response;

    return output;

}


export const dummy = {
    "encryptorDecryptorFactory": (() => {
        const factory: AsyncFactory<typeof dummySync.syncEncryptorDecryptorFactory>
            = () => {

                const instanceRef = getCounter();

                getPostMessage()((() => {

                    const action: import("../sync/_worker_thread").ThreadMessage.DummyEncryptorDecryptorFactory.Action = {
                        "action": "DummyEncryptorDecryptorFactory",
                        instanceRef,
                    };

                    return action;

                })());

                return {
                    "encrypt": plainData => encryptOrDecrypt(instanceRef, "encrypt", plainData),
                    "decrypt": encryptedData => encryptOrDecrypt(instanceRef, "decrypt", encryptedData)
                };

            };

        return factory;

    })(),
    ...dummySync
};

export const aes = {
    "encryptorDecryptorFactory": (() => {
        const factory: AsyncFactory<typeof aesSync.syncEncryptorDecryptorFactory>
            = key => {

                console.log(`${require("util" + "").inspect({ key })}`);

                const instanceRef = getCounter();

                getPostMessage()((() => {

                    const action: import("../sync/_worker_thread").ThreadMessage.AesEncryptorDecryptorFactory.Action = {
                        "action": "AesEncryptorDecryptorFactory",
                        instanceRef,
                        "params": [key]
                    };

                    return action;

                })());

                return {
                    "encrypt": plainData => encryptOrDecrypt(instanceRef, "encrypt", plainData),
                    "decrypt": encryptedData => encryptOrDecrypt(instanceRef, "decrypt", encryptedData)
                };

            };

        return factory;

    })(),
    ...aesSync
};

export const rsa = {
    ...rsaSync
};

export const scrypt = {
    ...scryptSync
};



