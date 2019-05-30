
import { SyncEvent } from "ts-events-extended";
import { ThreadMessage } from "../sync/_worker_thread/ThreadMessage";
import { isBrowser } from "../sync/environnement";
import { spawn as spawnWeb } from "./WorkerThread/web";
import { spawn as spawnNode } from "./WorkerThread/node";
import { spawn as spawnSimulated } from "./WorkerThread/simulated";

export type WorkerThread = {
    evtResponse: SyncEvent<ThreadMessage.Response>;
    send(action: ThreadMessage.Action, transfer?: ArrayBuffer[]): void;
    terminate(): void;
}

export namespace WorkerThread {

    export function factory(
        source: string,
        isMultithreadingEnabled: ()=> boolean
    ) {

        return () => isMultithreadingEnabled() ?
            isBrowser() ?
                spawnWeb(source) :
                spawnNode(source)
            :
            spawnSimulated(source)
            ;
    }

}



