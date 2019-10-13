
import { SyncEvent } from "ts-events-extended";
import { ThreadMessage, transfer } from "../../sync/_worker_thread/ThreadMessage";

declare const require: any;
declare const Buffer: any;

const path = require("path");

export function spawn(source: string): import("../WorkerThread").WorkerThread {

    const child_process = require((()=>"child_process")());

    const fs = require((()=>"fs")());

    const random_file_path = (() => {

        const getRandom = (() => {

            const crypto = require((()=>"crypto")());

            const base_path = (() => {

                let out = path.join("/", "tmp");

                if (!fs.existsSync(out)) {
                    out = path.join(".");
                }

                return out;

            })();

            return () => path.join(
                base_path,
                ".tmp_crypto-lib_you_can_remove_me_" + crypto
                    .randomBytes(4)
                    .toString("hex") + ".js"
            );

        })();

        let out = getRandom();

        while (fs.existsSync(out)) {
            out = getRandom();
        }

        return out;

    })();

    fs.writeFileSync(
        random_file_path,
        Buffer.from(
            [
                `console.log("__LOADED__");`,
                `process.title = "crypto worker";`,
                `var __process_node= process;`,
                source
            ].join("\n"),
            "utf8"
        )
    );

    const childProcess = child_process.fork(
        random_file_path,
        [],
        { "silent": true }
    );

    childProcess.stdout.once(
        "data",
        () => fs.unlink(random_file_path, ()=>{})
    );

    const evtResponse = new SyncEvent<ThreadMessage.Response>();

    childProcess.on(
        "message",
        message => evtResponse.post(
            transfer.restore(
                message
            )
        )
    );

    return {
        evtResponse,
        "send": action => childProcess.send(transfer.prepare(action)),
        "terminate": () => childProcess.kill()
    };

}


