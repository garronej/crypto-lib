
import * as async from "../async";
import * as randombytes from "randombytes";

declare const Buffer: any;

(async () => {

    const testEncryptorDecryptor = async (encryptorDecryptor: async.EncryptorDecryptor) => {

        const plainData = randombytes(150);

        //NOTE: After being passed to encrypt plainData is no longer usable.
        const plainDataAsHex = async.toBuffer(plainData).toString("hex");

        let start = Date.now();

        const encryptedData = await encryptorDecryptor.encrypt(plainData);

        console.log(`encrypt duration: ${Date.now() - start}ms`);

        start = Date.now();

        const restoredPlainData = await encryptorDecryptor.decrypt(encryptedData);

        console.log(`decrypt duration: ${Date.now() - start}ms`);

        if (
            async.toBuffer(restoredPlainData).toString("hex")
            !==
            plainDataAsHex
        ) {
            throw new Error("fail");
        }

    }


    for (const keyLengthBytes of [80, 128, 160, 255, 512]) {

        console.log({ keyLengthBytes }, `( ${keyLengthBytes * 8} bits )`);

        let start = Date.now();

        const rsaKeys = await async.rsa.generateKeys(Buffer.from("seed", "utf8"), keyLengthBytes);

        console.log(`Rsa key generation duration: ${Date.now() - start}`);

        console.log("encrypt with private key");

        await testEncryptorDecryptor(
            async.rsa.encryptorDecryptorFactory(rsaKeys.privateKey, rsaKeys.publicKey)
        );

        console.log("encrypt with public key");

        await testEncryptorDecryptor(
            async.rsa.encryptorDecryptorFactory(rsaKeys.publicKey, rsaKeys.privateKey)
        );

    }

    console.log("PASS");

})();

