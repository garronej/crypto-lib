
import { toBuffer } from "../sync/utils/toBuffer";

declare const Buffer: any;

const salt = Buffer.from((new Array(16)).fill("ff").join(""), "hex");

const password = "my super secure password";


var log: any = (function () {

    var acc = "";

    var f: any = function (str) {
        acc += str + "\n";
        console.log(str);
    }

    f.alert = function () {

        if( typeof alert === "function" ){

            alert(acc);

        }

        acc= "";

    }

    return f;

})();

(async () => {

    log(JSON.stringify({ password, "salt": toBuffer(salt).toString("hex") }));

    for (const iterations of [100000, 200000, 900000]) {

        log(`iteration: ${iterations}`);

        const start = Date.now();

        let result: Uint8Array;

        try {

            result = new Uint8Array(
                await window.crypto.subtle.deriveBits(
                    {
                        "name": "PBKDF2",
                        salt,
                        iterations,
                        "hash": "SHA-1"
                    },
                    await window.crypto.subtle.importKey(
                        "raw",
                        Buffer.from(password, "utf8"),
                        { "name": "PBKDF2" } as any,
                        false,
                        ["deriveBits"]
                    ),
                    256,
                )
            );

        } catch (error) {

            alert(error.message);

            throw error;

        }

        log(`Duration: ${Date.now() - start}`);

        log(toBuffer(result).toString("hex"));

        log.alert();

    }



})();





