import * as lib from "../async";
declare const Buffer: any;


var log: any = (function () {

    var acc = "";

    var f: any = function (str) {
        acc += str + "\n";
        console.log(str);
    }

    f.alert = function () {

        alert(acc);

    }

    return f;

})();

log("Started");

const text = "<<secret>>";
const salt = "...salty?";

(async () => {

    const n = 4;

    log(n);

    const digest = await lib.scrypt.hash(text, salt);

    const equals = (a, b) => {

        const [s1, s2] = [a, b].map(o => Buffer.from(o).toString("hex"));

        if (s1 === s2) {
            return true;
        } else {
            console.log({ s1, s2 });
            return false;
        }

    }

    const workerThreadIds: lib.WorkerThreadId[]= [];

    for (let i = 0; i < n; i++) {

        const id= lib.WorkerThreadId.generate();

        lib.preSpawnWorkerThread(id);

        workerThreadIds.push(id);

    }

    let duration_multi!: number;

    await new Promise(resolve => setTimeout(resolve, 3000));

    {

        log("start multithreading");

        const start = Date.now();

        await Promise.all(
            (new Array(n))
                .fill("")
                .map((_, i) => lib.scrypt.hash(
                    text, salt, undefined, undefined, workerThreadIds[i]
                ).then(out => {

                    if (!equals(out, digest)) {
                        throw new Error("mismatch async");
                    }


                }))
        );

        duration_multi = Date.now() - start;

        log(`Duration with multithreading: ${duration_multi}`);

    }

    let duration_single!: number;

    {

        const start = Date.now();

        for (let i = 0; i < n; i++) {

            let out = lib.scrypt.syncHash(text, salt);

            if (!equals(out, digest)) {
                throw new Error("mismatch sync");
            }

        }

        duration_single = Date.now() - start;

        log(`Duration single thread: ${duration_single}`);

    }

    log(`ratio single/multi: ${(duration_single / duration_multi).toFixed(2)}`);

    lib.terminateWorkerThreads();

    log("DONE");

    if (typeof alert !== "undefined") {

        log.alert();

    }

})();






