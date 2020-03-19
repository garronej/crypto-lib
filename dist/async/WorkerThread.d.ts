import { Evt } from "evt";
import { ThreadMessage } from "../sync/_worker_thread/ThreadMessage";
export declare type WorkerThread = {
    evtResponse: Evt<ThreadMessage.Response>;
    send(action: ThreadMessage.Action, transfer?: ArrayBuffer[]): void;
    terminate(): void;
};
export declare namespace WorkerThread {
    function factory(source: string, isMultithreadingEnabled: () => boolean): () => WorkerThread;
}
