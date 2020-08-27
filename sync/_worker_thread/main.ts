
declare const self: any;
declare const addEventListener: any;

import "minimal-polyfills/ArrayBuffer.isView";
import { Polyfill as Map } from "minimal-polyfills/Map";
import * as cryptoLib from "../index";
import { environnement } from "../utils/environnement";
import { 
    ThreadMessage, GenerateRsaKeys, EncryptOrDecrypt, ScryptHash,
    transfer 
} from "./ThreadMessage";


declare const __process_node: { send: Function; on: Function } | undefined;

export type MainThreadApi = {
    sendResponse(response: ThreadMessage.Response, transfer?: ArrayBuffer[]): void;
    setActionListener(actionListener: (action: ThreadMessage.Action) => void): void;
};

declare const __simulatedMainThreadApi: MainThreadApi | undefined;

//@ts-ignore
declare let __cryptoLib: typeof cryptoLib;

if ((() => {

    if (typeof __simulatedMainThreadApi !== "undefined") {
        return false;
    }

    const isMainThead = environnement.isMainThread !== undefined ?
        environnement.isMainThread :
        typeof __process_node === "undefined";

    return isMainThead;

})()) {

    __cryptoLib = cryptoLib;

} else {

    const mainThreadApi: MainThreadApi = typeof __simulatedMainThreadApi !== "undefined" ?
        __simulatedMainThreadApi :
        typeof __process_node === "undefined" ?
            {
                "sendResponse": self.postMessage.bind(self),
                "setActionListener": actionListener => addEventListener(
                    "message",
                    ({ data }) => actionListener(data)
                )
            } : {
                "sendResponse": response => __process_node!.send(
                    transfer.prepare(response)
                ),
                "setActionListener": actionListener => __process_node!.on(
                    "message",
                    message => actionListener(
                        transfer.restore(message)
                    )
                )
            }
        ;


    const cipherInstances = new Map<number, cryptoLib.Cipher>();

    mainThreadApi.setActionListener((action: ThreadMessage.Action) => {

        switch (action.action) {
            case "GenerateRsaKeys":
                mainThreadApi.sendResponse((() => {

                    const response: GenerateRsaKeys.Response = {
                        "actionId": action.actionId,
                        "outputs": cryptoLib.rsa.syncGenerateKeys(...action.params)
                    };

                    return response;

                })());
                break;
            case "CipherFactory":
                cipherInstances.set(
                    action.cipherInstanceRef,
                    cryptoLib[action.cipherName][(() => {
                        switch (action.components) {
                            case "Decryptor": return "syncDecryptorFactory";
                            case "Encryptor": return "syncEncryptorFactory";
                            case "EncryptorDecryptor": return "syncEncryptorDecryptorFactory";
                        }
                    })()](...action.params)
                );
                break;
            case "EncryptOrDecrypt": {

                const output = cipherInstances.get(
                    action.cipherInstanceRef
                )![action.method](action.input);

                mainThreadApi.sendResponse((() => {

                    const response: EncryptOrDecrypt.Response = {
                        "actionId": action.actionId,
                        output
                    };

                    return response;

                })(), [output.buffer]);

            } break;
            case "ScryptHash": {

                const digest = cryptoLib.scrypt.syncHash(
                    ...([
                        ...action.params,
                        percent => mainThreadApi.sendResponse((() => {

                            const response: ScryptHash.Response.Progress = {
                                "actionId": action.actionId,
                                percent
                            }

                            return response;

                        })())
                    ] as Parameters<typeof cryptoLib.scrypt.syncHash>)
                );

                mainThreadApi.sendResponse((() => {

                    const response: ScryptHash.Response.Final = {
                        "actionId": action.actionId,
                        digest
                    }

                    return response;

                })(), [digest.buffer]);

            } break;
        }


    });

}
