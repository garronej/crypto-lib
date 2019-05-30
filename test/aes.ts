import * as ttTesting from "transfer-tools/dist/lib/testing";
import * as lib from "../async";

declare const Buffer: any;

(async () => {

    console.log("Started");

    const aesKey = await lib.aes.generateTestKey();

    {

        let encrypt: lib.Encryptor["encrypt"] | undefined = undefined;
        let decrypt: lib.Decryptor["decrypt"] | undefined = undefined;

        const text = ttTesting.genUtf8Str(60,undefined, "seed");

        for (let i = 1; i < 100; i++) {

            if (i % 5 === 0) {
                encrypt = undefined;
            }

            if (i % 7 === 0) {
                decrypt = undefined;
            }

            if (encrypt === undefined) {

                encrypt = lib.aes.encryptorDecryptorFactory(aesKey).encrypt;

            }

            if (decrypt === undefined) {

                decrypt = lib.aes.encryptorDecryptorFactory(aesKey).decrypt;

            }

            if (
                lib.toBuffer(await decrypt(
                    await encrypt(
                        Buffer.from(text, "utf8")
                    )
                )).toString("utf8") !== text
            ) {

                throw new Error(`failed with ${JSON.stringify(text)}`);

            }

        }

        console.log("PASS 0");

    }

    {

        const encryptorDecryptor = lib.aes.encryptorDecryptorFactory(
            aesKey
        );

        for (const encoding of ["hex", "base64", "binary"] as const) {

            const start= Date.now();

            lib.serializer.stringifyThenEncryptFactory.stringRepresentationEncoding = encoding;

            const stringifyThenEncrypt = lib.serializer.stringifyThenEncryptFactory(encryptorDecryptor);
            const decryptThenParse = lib.serializer.decryptThenParseFactory(encryptorDecryptor);

            for (let i = 1; i < 500; i++) {

                const text = ttTesting.genUtf8Str(60, undefined, `${i}`);

                if (text !== await decryptThenParse<string>(await stringifyThenEncrypt<string>(text))) {

                    throw new Error(`failed with ${JSON.stringify(text)}`);

                }


            }

            console.log(`PASS ${encoding} in ${Date.now() - start}ms`);

        }

        console.log("PASS 1");

    }

    console.log("DONE");


})();
