import * as ttTesting from "transfer-tools/dist/lib/testing";
import * as lib from "../async";

(async () => {

    const workerThreadPoolId = "aes pool";

    const results: { [n: number]: number; }= {};

    for (const n of [5, 1]) {


        lib.workerThreadPool.preSpawn(workerThreadPoolId, n);

        await new Promise(resolve=> setTimeout(resolve, 5000));

        console.log(`Started with a pool of ${n} thread !`);

        const aesKey = await lib.aes.getTestKey();

        {

            const encryptorDecryptor = lib.aes.encryptorDecryptorFactory(
                aesKey,
                workerThreadPoolId
            );


            const tasks: Promise<void>[] = [];


            const stringifyThenEncrypt = lib.serializer.stringifyThenEncryptFactory(encryptorDecryptor);
            const decryptThenParse = lib.serializer.decryptThenParseFactory(encryptorDecryptor);

            const text = ttTesting.genUtf8Str(1000, undefined, `${0}`);

            for (let i = 1; i < 1000; i++) {

                console.log(i);

                //const text = ttTesting.genUtf8Str(60, undefined, `${i}`);

                tasks[tasks.length] = (async () => {

                    if (text !== await decryptThenParse<string>(await stringifyThenEncrypt<string>(text))) {

                        throw new Error(`failed with ${JSON.stringify(text)}`);

                    }


                })();

                //await new Promise(resolve=> setTimeout(resolve,10));

            }

            const start = Date.now();

            await Promise.all(tasks);


            results[n]= Date.now() - start

            console.log(`PASS in ${results[n]}ms`);

        }
    }

    const [t1, t2 ]= Object.keys(results).map(n=> results[n]);

    console.log(`Ratio single/multi thread: ${(t1/t2).toFixed(2)}`);

    lib.workerThreadPool.terminate(workerThreadPoolId);

    console.log("DONE");

})();


        /*
        {

            let encrypt: lib.Encryptor["encrypt"] | undefined = undefined;
            let decrypt: lib.Decryptor["decrypt"] | undefined = undefined;

            const text = ttTesting.genUtf8Str(60, undefined, "seed");

            const tasks: Promise<void>[] = [];

            for (let i = 1; i < 100; i++) {

                if (i % 5 === 0) {
                    encrypt = undefined;
                }

                if (i % 7 === 0) {
                    decrypt = undefined;
                }

                if (encrypt === undefined) {

                    encrypt = lib.aes.encryptorDecryptorFactory(
                        aesKey,
                        workerThreadPoolId
                    ).encrypt;

                }

                if (decrypt === undefined) {

                    decrypt = lib.aes.encryptorDecryptorFactory(
                        aesKey,
                        workerThreadPoolId
                    ).decrypt;

                }

                tasks[tasks.length] = (async () => {

                    if (
                        lib.toBuffer(await decrypt(
                            await encrypt(
                                Buffer.from(text, "utf8")
                            )
                        )).toString("utf8") !== text
                    ) {

                        throw new Error(`failed with ${JSON.stringify(text)}`);

                    }

                })();


            }

            await Promise.all(tasks);

            console.log("PASS 0");

        }
        */