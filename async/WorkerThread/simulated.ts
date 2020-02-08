
import { Evt } from "ts-evt";
import { ThreadMessage } from "../../sync/_worker_thread/ThreadMessage";
import runTask from "./simulated/runTask";

export function spawn(source: string): import("../WorkerThread").WorkerThread {

    const evtResponse = new Evt<ThreadMessage.Response>();

    let actionListener: (action: ThreadMessage.Action) => void;

    //@ts-ignore
    const __simulatedMainThreadApi: import("../../sync/_worker_thread/main").MainThreadApi = {
        "sendResponse": response => setTimeout(() => evtResponse.post(response), 0),
        "setActionListener": actionListener_ => actionListener = actionListener_
    };

    eval(source);

    return {
        evtResponse,
        "send": action => runTask(() => actionListener(action)),
        "terminate": () => { }
    };

}
