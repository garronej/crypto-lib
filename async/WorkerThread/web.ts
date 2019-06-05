
import { SyncEvent } from "ts-events-extended";
import { ThreadMessage } from "../../sync/_worker_thread/ThreadMessage";

export function spawn(source: string): import("../WorkerThread").WorkerThread {

    const evtResponse = new SyncEvent<ThreadMessage.Response>();

    const worker = new Worker(
        URL.createObjectURL(
            new Blob(
                [source],
                { "type": 'text/javascript' }
            )

        )
    );

    worker.addEventListener(
        "message",
        ({data}) => evtResponse.post(data)
    );

    return {
        evtResponse,
        "send": (action, transfer) => {
            worker.postMessage(
                action, transfer || []
            );
        },
        "terminate": () => worker.terminate()
    };

}