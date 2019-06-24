
import * as cryptoLib from "../async";
import { randomBytes } from "../sync/utils/randomBytes";

(async () => {

    const threadPoolId= cryptoLib.workerThreadPool.Id.generate();

    cryptoLib.workerThreadPool.preSpawn(threadPoolId, 1);

    await new Promise(resolve=> setTimeout(resolve, 9000));

    const testEncryptorDecryptor = async (encryptorDecryptor: cryptoLib.EncryptorDecryptor) => {

        let start = Date.now();

        const plainData = randomBytes(150);

        console.log(`randomBytes(150) duration: ${Date.now()-start}ms`);

        //NOTE: After being passed to encrypt plainData is no longer usable.
        const plainDataAsHex = cryptoLib.toBuffer(plainData).toString("hex");

        start = Date.now();

        const encryptedData = await encryptorDecryptor.encrypt(plainData);

        console.log(`encrypt duration: ${Date.now() - start}ms`);

        start = Date.now();

        const restoredPlainData = await encryptorDecryptor.decrypt(encryptedData);

        console.log(`decrypt duration: ${Date.now() - start}ms`);

        if (
            cryptoLib.toBuffer(restoredPlainData).toString("hex")
            !==
            plainDataAsHex
        ) {
            throw new Error("fail");
        }

    }


    for (const keyLengthBytes of [80, 128, 160, 255]) {

        console.log({ keyLengthBytes }, `( ${keyLengthBytes * 8} bits )`);

        let start = Date.now();

        const rsaKeys = await cryptoLib.rsa.generateKeys(
            null, 
            keyLengthBytes, 
            cryptoLib.workerThreadPool.listIds(threadPoolId)[0]
        );

        console.log(`Rsa key generation duration: ${Date.now() - start}`);

        console.log("encrypt with private key");

        await testEncryptorDecryptor(
            cryptoLib.rsa.encryptorDecryptorFactory(rsaKeys.privateKey, rsaKeys.publicKey, threadPoolId)
        );

        console.log("encrypt with public key");

        await testEncryptorDecryptor(
            cryptoLib.rsa.encryptorDecryptorFactory(rsaKeys.publicKey, rsaKeys.privateKey, threadPoolId)
        );

    }

    cryptoLib.workerThreadPool.terminate(threadPoolId);

    console.log("PASS");

})();

