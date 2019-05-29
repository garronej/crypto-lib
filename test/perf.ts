
import * as ttTesting from "transfer-tools/dist/lib/testing";
import * as lib from "../async";

declare const Buffer: any;

(async () => {

    console.log("Started");

    const aesKey = await lib.aes.generateTestKey();
    const text = ttTesting.genUtf8Str(100000);

    for (const type of ["aes", "dummy", "aesSync", "dummySync"] as const) {

        const encryptorDecryptor = (() => {
            switch (type) {
                case "aes": return lib.aes.encryptorDecryptorFactory(aesKey);
                case "dummy": return lib.dummy.encryptorDecryptorFactory();
                case "aesSync": return lib.aes.syncEncryptorDecryptorFactory(aesKey);
                case "dummySync": return lib.dummy.syncEncryptorDecryptorFactory();
            }
        })();

        const start = Date.now();

        for (let i = 1; i < 20; i++) {

            await encryptorDecryptor.decrypt(
                await encryptorDecryptor.encrypt(
                    Buffer.from(text, "utf8")
                )
            )

            await new Promise(resolve=> setTimeout(resolve,0));

        }

        console.log(`${type}: ${Date.now() - start}`);

    }

})();
