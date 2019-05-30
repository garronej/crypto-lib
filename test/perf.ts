
import * as ttTesting from "transfer-tools/dist/lib/testing";
import * as lib from "../async";
import * as libSync from "../sync";

declare const Buffer: any;

(async () => {

    console.log("Started");

    const aesKey = await lib.aes.generateTestKey();
    //const text = ttTesting.genUtf8Str(10000, undefined, "seed");
    const text = ttTesting.genUtf8Str(2000, undefined, "seed");

    for (const type of ["async.aes", "async.dummy", "async.syncAes", "async.syncDummy", "sync.aes", "sync.dummy"] as const) {

        const encryptorDecryptor = (() => {
            switch (type) {
                case "async.aes": return lib.aes.encryptorDecryptorFactory(aesKey);
                case "async.dummy": return lib.plain.encryptorDecryptorFactory();
                case "async.syncAes": return lib.aes.syncEncryptorDecryptorFactory(aesKey);
                case "async.syncDummy": return lib.plain.syncEncryptorDecryptorFactory();
                case "sync.aes": return libSync.aes.syncEncryptorDecryptorFactory(aesKey);
                case "sync.dummy": return libSync.plain.syncEncryptorDecryptorFactory();
            }
        })();

        await new Promise(resolve=> setTimeout(resolve, 3000));

        console.log(`Go ${type}`);

        const timeStart = Date.now();

        let timeLast = Date.now();

        const n = 100;
        for (let i = 1; i <= n; i++) {

            await encryptorDecryptor.decrypt(
                await encryptorDecryptor.encrypt(
                    Buffer.from(text, "utf8")
                )
            );

            const duration = Date.now() - timeLast;

            if (i === 1) {

                console.log(`first: ${duration}ms`);

            }

            if (i === n) {

                console.log(`last: ${duration}ms`);

            }


            await new Promise(resolve => setTimeout(resolve, 0));

            timeLast = Date.now();

        }

        console.log(`total: ${Date.now() - timeStart}ms\n`);

    }

    console.log("DONE");

})();
