declare const require: any;
declare const __dirname: any;

import { Polyfill as Map } from "minimal-polyfills/dist/lib/Map";
import { Polyfill as Set, LightSet } from "minimal-polyfills/dist/lib/Set";
import "minimal-polyfills/dist/lib/Array.from";
import "minimal-polyfills/dist/lib/ArrayBuffer.isView";

import * as runExclusive from "run-exclusive";
import { Encryptor, Decryptor, EncryptorDecryptor, RsaKey, ScryptParams } from "../sync/types";

//@ts-ignore: Need to be imported so it can be named.
import { Sync } from "../sync/types";

//TODO: See if it need to be exported for types...
import {
    GenerateRsaKeys, CipherFactory, EncryptOrDecrypt, ScryptHash
} from "../sync/_worker_thread/ThreadMessage";
import { WorkerThread } from "./WorkerThread";
import { environnement } from "../sync/utils/environnement";


const bundle_source = (() => {

    const fs = require("fs");
    const path = require("path");

    return fs.readFileSync(
        path.join(__dirname, "..", "sync", "_worker_thread", "bundle.min.js")
    ).toString("utf8");

})();

let __cryptoLib: typeof import("../sync");

eval(bundle_source);

export * from "../sync/types";

export * from "./serializer";

export { Encoding, toBuffer } from "../sync/utils/toBuffer";

let isMultithreadingEnabled = (() => {

    switch (environnement.type) {
        case "BROWSER": return (
            typeof Worker !== "undefined" &&
            typeof URL !== "undefined" &&
            typeof Blob !== "undefined"
        );
        case "LIQUID CORE": return false;
        case "NODE": return true;
    }

})();

export function disableMultithreading() {
    isMultithreadingEnabled = false;
}


export type WorkerThreadId = {
    type: "WORKER THREAD ID";
};

export namespace WorkerThreadId {

    export function generate(): WorkerThreadId {
        return { "type": "WORKER THREAD ID" };
    }

}

const [getWorkerThread, terminateWorkerThreads, listWorkerThreadIds] = (() => {

    const spawn = WorkerThread.factory(
        bundle_source,
        () => isMultithreadingEnabled
    );

    const map = new Map<WorkerThreadId, WorkerThread>();

    return [
        (workerThreadId: WorkerThreadId) => {

            let workerThread = map.get(workerThreadId);

            if (workerThread === undefined) {

                workerThread = spawn();

                map.set(workerThreadId, workerThread);

            }

            return workerThread;

        },
        (workerThreadId?: WorkerThreadId) => {

            const match: (workerThreadId: WorkerThreadId) => boolean =
                workerThreadId === undefined ?
                    (() => true)
                    :
                    (o => o === workerThreadId)
                ;

            for (const workerThreadId of Array.from(map.keys())) {

                if (!match(workerThreadId)) {
                    continue;
                }

                map.get(workerThreadId)!.terminate();
                map.delete(workerThreadId);

            }

        },
        (): WorkerThreadId[] => Array.from(map.keys())
    ] as const;

})();

export { terminateWorkerThreads };

export function preSpawnWorkerThread(workerThreadId: WorkerThreadId) {
    getWorkerThread(workerThreadId);
}

export namespace workerThreadPool {

    export type Id = {
        type: "WORKER THREAD POOL ID";
    };

    export namespace Id {

        export function generate(): Id {
            return { "type": "WORKER THREAD POOL ID" };
        }

    }

    const map = new Map<Id, LightSet<WorkerThreadId>>();

    export function preSpawn(workerThreadPoolId: Id, poolSize: number) {

        if (!map.has(workerThreadPoolId)) {
            map.set(workerThreadPoolId, new Set());
        }

        for (let i = 1; i <= poolSize; i++) {

            const workerThreadId = WorkerThreadId.generate();

            map.get(workerThreadPoolId)!.add(workerThreadId);

            preSpawnWorkerThread(workerThreadId);

        }

    }

    export function listIds(workerThreadPoolId: Id): WorkerThreadId[] {

        const set: LightSet<WorkerThreadId> = map.get(workerThreadPoolId) || new Set();

        return listWorkerThreadIds()
            .filter(workerThreadId => set.has(workerThreadId))
            ;

    }

    export function terminate(workerThreadPoolId: Id) {

        for (const workerThreadId of listIds(workerThreadPoolId)) {
            terminateWorkerThreads(workerThreadId);
        }

    }

}


const getCounter = (() => {

    let counter = 0;

    return () => counter++;

})();


const defaultWorkerPoolIds: Record<CipherFactory.CipherName, workerThreadPool.Id> = {
    "aes": workerThreadPool.Id.generate(),
    "plain": workerThreadPool.Id.generate(),
    "rsa": workerThreadPool.Id.generate()
};

function cipherFactoryPool<A extends CipherFactory.Action>(
    params: cipherFactoryPool.ActionPartial<A>,
    workerThreadPoolId?: workerThreadPool.Id
): cipherFactoryPool.Cipher<A> {

    if (workerThreadPoolId === undefined) {

        workerThreadPoolId = defaultWorkerPoolIds[params.cipherName];

        workerThreadPool.preSpawn(workerThreadPoolId, 4);

    } else if (workerThreadPool.listIds(workerThreadPoolId).length === 0) {

        throw new Error("No thread in the pool");

    }

    const runExclusiveFunctions = workerThreadPool.listIds(workerThreadPoolId)
        .map(workerThreadId => {

            const cipher = cipherFactoryPool.cipherFactory<A>(params, workerThreadId);

            return runExclusive.build(
                async (method: keyof EncryptorDecryptor, data: Uint8Array) =>
                    cipher[method](data) as Uint8Array
            );

        })
        ;

    return (() => {

        const [encrypt, decrypt] = (["encrypt", "decrypt"] as const)
            .map(method => async (data: Uint8Array) =>
                runExclusiveFunctions
                    .map(runExclusiveFunction => [
                        runExclusive.getQueuedCallCount(runExclusiveFunction),
                        runExclusiveFunction
                    ] as const)
                    .sort(([n1], [n2]) => n1 - n2)[0][1](method, data)
            )
            ;

        switch (params.components) {
            case "EncryptorDecryptor": return { encrypt, decrypt };
            case "Decryptor": return { decrypt };
            case "Encryptor": return { encrypt };
        }

    })() as any;

}

namespace cipherFactoryPool {

    type Action = CipherFactory.Action;

    export type ActionPartial<A extends Action> =
        Pick<A, Exclude<keyof A, "action" | "cipherInstanceRef">>;

    export type Cipher<A extends Action> =
        A extends CipherFactory.ActionPoly<any, infer U> ?
        (
            U extends "EncryptorDecryptor" ?
            EncryptorDecryptor
            :
            U extends "Encryptor" ? Encryptor : Decryptor
        )
        : never
        ;

    export function cipherFactory<A extends Action>(
        params: ActionPartial<A>,
        workerThreadId: WorkerThreadId
    ): Cipher<A> {

        const cipherInstanceRef = getCounter();

        const appWorker = getWorkerThread(workerThreadId);

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

        return (() => {

            const [encrypt, decrypt] = (["encrypt", "decrypt"] as const)
                .map(method => ((data: Uint8Array) => cipherFactory.encryptOrDecrypt(
                    cipherInstanceRef,
                    method,
                    data,
                    workerThreadId
                )))
                ;

            switch (params.components) {
                case "EncryptorDecryptor": return { encrypt, decrypt };
                case "Decryptor": return { decrypt };
                case "Encryptor": return { encrypt };
            }

        })() as any;


    }

    export namespace cipherFactory {

        export async function encryptOrDecrypt(
            cipherInstanceRef: number,
            method: keyof EncryptorDecryptor,
            input: Uint8Array,
            workerThreadId: WorkerThreadId
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

    }


}

export const plain = (() => {

    const encryptorDecryptorFactory = (workerThreadPoolId?: workerThreadPool.Id) =>
        cipherFactoryPool<CipherFactory.ActionPoly<"plain", "EncryptorDecryptor">>(
            {
                "cipherName": "plain",
                "components": "EncryptorDecryptor",
                "params": []
            },
            workerThreadPoolId
        );

    return {
        encryptorDecryptorFactory,
        ...__cryptoLib!.plain
    };

})();

export const aes = (() => {

    const encryptorDecryptorFactory = (key: Uint8Array, workerThreadPoolId?: workerThreadPool.Id) =>
        cipherFactoryPool<CipherFactory.ActionPoly<"aes", "EncryptorDecryptor">>(
            {
                "cipherName": "aes",
                "components": "EncryptorDecryptor",
                "params": [key]
            },
            workerThreadPoolId
        );

    return {
        encryptorDecryptorFactory,
        ...__cryptoLib!.aes
    };


})();

export const rsa = (() => {

    const encryptorFactory = (encryptKey: RsaKey, workerThreadPoolId?: workerThreadPool.Id) =>
        cipherFactoryPool<CipherFactory.ActionPoly<"rsa", "Encryptor">>(
            {
                "cipherName": "rsa",
                "components": "Encryptor",
                "params": [encryptKey]
            },
            workerThreadPoolId
        );

    const decryptorFactory = (decryptKey: RsaKey, workerThreadPoolId?: workerThreadPool.Id) =>
        cipherFactoryPool<CipherFactory.ActionPoly<"rsa", "Decryptor">>(
            {
                "cipherName": "rsa",
                "components": "Decryptor",
                "params": [decryptKey]
            },
            workerThreadPoolId
        );

    function encryptorDecryptorFactory(encryptKey: RsaKey.Private, decryptKey: RsaKey.Public, workerThreadPoolId?: workerThreadPool.Id): EncryptorDecryptor;
    function encryptorDecryptorFactory(encryptKey: RsaKey.Public, decryptKey: RsaKey.Private, workerThreadPoolId?: workerThreadPool.Id): EncryptorDecryptor;
    function encryptorDecryptorFactory(encryptKey, decryptKey, workerThreadPoolId?: workerThreadPool.Id): EncryptorDecryptor {
        return cipherFactoryPool<CipherFactory.ActionPoly<"rsa", "EncryptorDecryptor">>(
            {
                "cipherName": "rsa",
                "components": "EncryptorDecryptor",
                "params": [encryptKey, decryptKey]
            },
            workerThreadPoolId
        );
    }


    const generateKeys = async (
        seed: Uint8Array | null,
        keysLengthBytes?: number,
        workerThreadId?: WorkerThreadId
    ) => {

        type Action = GenerateRsaKeys.Action;
        type Response = GenerateRsaKeys.Response;

        const wasWorkerThreadIdSpecified = workerThreadId !== undefined;

        workerThreadId = workerThreadId !== undefined ?
            workerThreadId :
            WorkerThreadId.generate()
            ;

        const actionId = getCounter();

        const appWorker = getWorkerThread(
            workerThreadId
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

        if (!wasWorkerThreadIdSpecified) {

            terminateWorkerThreads(workerThreadId);

        }

        return outputs;

    };

    return {
        encryptorFactory,
        decryptorFactory,
        encryptorDecryptorFactory,
        generateKeys,
        ...__cryptoLib!.rsa
    };

})();

export const scrypt = (() => {

    const hash = async (
        text: string,
        salt: string,
        params: Partial<ScryptParams> = {},
        progress: (percent: number) => void = (() => { }),
        workerThreadId?: WorkerThreadId
    ) => {

        type Action = ScryptHash.Action;
        type Response_Progress = ScryptHash.Response.Progress;
        type Response_Final = ScryptHash.Response.Final;

        const actionId = getCounter();

        const wasWorkerThreadIdSpecified = workerThreadId !== undefined;

        workerThreadId = workerThreadId !== undefined ?
            workerThreadId :
            WorkerThreadId.generate()
            ;

        const appWorker = getWorkerThread(
            workerThreadId
        );

        appWorker.send((() => {

            const action: Action = {
                "action": "ScryptHash",
                actionId,
                "params": [text, salt, params]
            };

            return action;

        })());

        const boundTo = {};

        appWorker.evtResponse.attach(
            (response): response is Response_Progress => (
                response.actionId === actionId &&
                "percent" in response
            ),
            boundTo,
            ({ percent }) => progress(percent)
        );

        const { digest } = await appWorker.evtResponse.waitFor(
            (response): response is Response_Final => (
                response.actionId === actionId &&
                "digest" in response
            )
        );

        appWorker.evtResponse.detach(boundTo);

        if (!wasWorkerThreadIdSpecified) {

            terminateWorkerThreads(workerThreadId);

        }

        return digest;

    };

    return {
        hash,
        ...__cryptoLib!.scrypt
    };

})();
