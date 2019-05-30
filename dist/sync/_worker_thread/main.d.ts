import { ThreadMessage } from "./ThreadMessage";
export declare type MainThreadApi = {
    sendResponse(response: ThreadMessage.Response, transfer?: ArrayBuffer[]): void;
    setActionListener(actionListener: (action: ThreadMessage.Action) => void): void;
};
