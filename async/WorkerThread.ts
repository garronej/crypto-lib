
import {  Evt } from "evt";
import { ThreadMessage } from "../sync/_worker_thread/ThreadMessage";
import { environnement } from "../sync/utils/environnement";
import { spawn as spawnWeb } from "./WorkerThread/web";
import { spawn as spawnNode } from "./WorkerThread/node";
import { spawn as spawnSimulated } from "./WorkerThread/simulated";

export type WorkerThread = {
    evtResponse: Evt<ThreadMessage.Response>;
    send(action: ThreadMessage.Action, transfer?: ArrayBuffer[]): void;
    terminate(): void;
}

export namespace WorkerThread {

    export function factory(
        source: string,
        isMultithreadingEnabled: () => boolean
    ) {

        return () => {

            if (!isMultithreadingEnabled()) {

                return spawnSimulated(source);

            }

            if (environnement.type === "LIQUID CORE" || environnement.type === "REACT NATIVE") {
                throw new Error(`${environnement.type} cant fork`);
            }

            switch (environnement.type) {
                case "BROWSER": return spawnWeb(source);
                case "NODE": return spawnNode(source);
            }

        }

    }

}



