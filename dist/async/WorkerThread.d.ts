import { SyncEvent } from "ts-events-extended";
import { ThreadMessage } from "../sync/_worker_thread/ThreadMessage";
export declare type WorkerThread = {
    evtResponse: SyncEvent<ThreadMessage.Response>;
    send(action: ThreadMessage.Action, transfer?: ArrayBuffer[]): void;
    terminate(): void;
};
export declare namespace WorkerThread {
    function factory(source: string): () => WorkerThread;
}
