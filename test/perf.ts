import * as ttTesting from "transfer-tools/dist/lib/testing";
import * as async from "../async";
import * as sync from "../sync";

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

const texts: string[] = [];


async function perform(p: Params): Promise<number> {

    const workerThreadPoolId = p.threadCount !== undefined ? 
        async.workerThreadPool.Id.generate() : undefined;

    if (workerThreadPoolId !== undefined) {
        async.workerThreadPool.preSpawn(workerThreadPoolId, p.threadCount!);

        console.log("waiting after fork");

        await new Promise(resolve => setTimeout(resolve, typeof Worker === "undefined" ? 2000 : 1000));

        console.log("continuing");


    }

    const aesKey = await perform.prAesKey;

    const { publicKey, privateKey } = await perform.prRsaKeys;

    let iterations = texts.length;

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

                iterations = 12;

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

    const stringifyThenEncrypt = async.stringifyThenEncryptFactory(encryptorDecryptor);
    const decryptThenParse = async.decryptThenParseFactory(encryptorDecryptor);

    const tasks: Promise<void>[] = [];

    const start = Date.now();

    for (let i = 0; i < iterations; i++) {

        const text = texts[i];

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

    export const prAesKey = async.aes.getTestKey();

    export const prRsaKeys = async.rsa.generateKeys(null);

}

type Result = { params: Params; duration: number; };

function compare(results: Result[]) {

    const durationMin = Math.min(...results.map(({ duration }) => duration));

    let str = "";

    for (const { params, duration } of results) {

        const d = (() => {

            const v = ((duration / durationMin - 1) * 100).toFixed(2);

            return v === "0.00" ? "ref" : `+${v}%`;


        })();

        str += `${Params.prettyPrint(params)}: Duration: ${duration} ${d}\n`;

    }

    console.log(str);

    if (typeof alert !== "undefined") {
        alert(str);
    }

}

(async () => {

    if (typeof alert !== "undefined") {
        alert("The main thread will now freeze, it's normal");
    }

    for (let i = 0; i < 150; i++) {

        texts[i] = ttTesting.genUtf8Str(500, undefined, `${i}`);

    }

    for (const cipherName of ["rsa", "aes", "plain"] as const) {

        console.log({ cipherName });

        for (const rsaEncryptWith of cipherName === "rsa" ? ["private", "public"] as const : [undefined]) {

            const results: Result[] = [];


            for (const target of ["SYNC", "ASYNC", "SYNC BUNDLED"] as const) {

                console.log(target);

                const params: Params = {
                    cipherName,
                    target,
                    rsaEncryptWith
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

            }

            compare(results);

        }

    }

})();
