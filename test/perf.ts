import * as ttTesting from "transfer-tools/dist/lib/testing";
import * as async from "../async";
import * as sync from "../sync";

declare const Buffer: any;

const text = ttTesting.genUtf8Str(1000, undefined, "salt");

type Params = {
    target: "SYNC" | "SYNC BUNDLED" | "ASYNC";
    cipherName: "plain" | "aes" | "rsa";
    threadCount?: number;
    rsaEncryptWith?: "public" | "private";
};

namespace Params {

    export function prettyPrint(p: Params): string {

        return [
            p.target,
            p.cipherName,
            p.threadCount !== undefined ? `threads pool size: ${p.threadCount}` : "",
            !!p.rsaEncryptWith ? `RSA encryption with: ${p.rsaEncryptWith}` : ""
        ].join(", ");

    }

}

async function perform(p: Params): Promise<number> {

    const workerThreadPoolId = p.threadCount !== undefined ? "myPool" : undefined;

    if (workerThreadPoolId !== undefined) {
        async.workerThreadPool.preSpawn(workerThreadPoolId, p.threadCount!);

        console.log("waiting after fork");

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log("continuing");

    }

    const aesKey = await perform.prAesKey;

    const { publicKey, privateKey } = await perform.prRsaKeys;

    const encryptorDecryptor = (() => {
        switch (p.cipherName) {
            case "plain": {
                switch (p.target) {
                    case "SYNC": return sync.plain.syncEncryptorDecryptorFactory();
                    case "SYNC BUNDLED": return async.plain.syncEncryptorDecryptorFactory();
                    case "ASYNC": return async.plain.encryptorDecryptorFactory(workerThreadPoolId);
                }
            }
            case "aes": {
                switch (p.target) {
                    case "SYNC": return sync.aes.syncEncryptorDecryptorFactory(aesKey);
                    case "SYNC BUNDLED": return async.aes.syncEncryptorDecryptorFactory(aesKey);
                    case "ASYNC": return async.aes.encryptorDecryptorFactory(aesKey, workerThreadPoolId);
                }
            }
            case "rsa": {

                const [encryptKey, decryptKey]: [any, any] = p.rsaEncryptWith === "private" ?
                    [privateKey, publicKey] :
                    [publicKey, privateKey]
                    ;

                switch (p.target) {
                    case "SYNC": return sync.rsa.syncEncryptorDecryptorFactory(encryptKey, decryptKey);
                    case "SYNC BUNDLED": return async.rsa.syncEncryptorDecryptorFactory(privateKey, publicKey);
                    case "ASYNC": return async.rsa.encryptorDecryptorFactory(privateKey, publicKey, workerThreadPoolId);
                }
            }
        }
    })()!;

    const stringifyThenEncrypt = async.serializer.stringifyThenEncryptFactory(encryptorDecryptor);
    const decryptThenParse = async.serializer.decryptThenParseFactory(encryptorDecryptor);

    const tasks: Promise<void>[] = [];

    const start = Date.now();

    for (let i = 0; i < 5; i++) {

        tasks[tasks.length] = (async () => {

            const { text: gotText } = await decryptThenParse(
                await stringifyThenEncrypt({ text })
            )

            if (text !== gotText) {

                console.log({ text, i }, p);

                throw new Error("fail");

            }

        })();

    }

    await Promise.all(tasks);

    const duration = Date.now() - start;

    if (p.target === "ASYNC") {

        async.terminateWorkerThreads();

    }

    return duration;

}

namespace perform {

    export const prAesKey = sync.aes.getTestKey();

    export const prRsaKeys = async.rsa.generateKeys(Buffer.from("seed", "utf8"));


}

type Result = { params: Params; duration: number; };

function compare(results: Result[]) {

    const durationMin = Math.min(...results.map(({ duration }) => duration));

    for (const { params, duration } of results) {

        const d = (() => {

            const v = ((duration / durationMin - 1) * 100).toFixed(2);

            return v === "0.00" ? "ref" : `+${v}%`;


        })();

        console.log(`${Params.prettyPrint(params)}: Duration: ${duration} ${d}`);

    }

}

(async () => {

    for (const cipherName of ["aes", "rsa", "plain"] as const) {

        console.log({ cipherName });

        const results: Result[] = [];

        for (const target of ["ASYNC", "SYNC BUNDLED", "SYNC"] as const) {

            console.log(target);

            const params: Params = {
                cipherName,
                target
            };

            if (target === "ASYNC") {

                for (const i of (new Array(10)).fill(0).map((_, i) => i + 1)) {

                    console.log({ "thread count": i });

                    const params1: Params = { ...params, "threadCount": i };

                    results.push({ "params": params1, "duration": await perform(params1) });

                }


            } else {

                results.push({ params, "duration": await perform(params) });

            }

            compare(results);

        }

    }

})();
