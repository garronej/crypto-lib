declare const self: any;
declare const addEventListener: any;
declare const document: any;

import * as cryptoLib from "../index";
import * as environnement from "../environnement";
import { ThreadMessage, GenerateRsaKeys, CipherFactory, EncryptOrDecrypt, transfer } from "./ThreadMessage";


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

    const isMainThead = environnement.isBrowser() ?
        (typeof document !== "undefined") :
        (typeof __process_node === "undefined")
        ;

    return isMainThead;

})()) {

    __cryptoLib = cryptoLib;

} else {

    const mainThreadApi: MainThreadApi = typeof __simulatedMainThreadApi !== "undefined" ?
        __simulatedMainThreadApi :
        environnement.isBrowser() ?
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

                    const message: GenerateRsaKeys.Response = {
                        "actionId": action.actionId,
                        "outputs": cryptoLib.rsa.syncGenerateKeys.apply(
                            cryptoLib.rsa,
                            action.params
                        )
                    };

                    return message;

                })());
                break;
            case "CipherFactory": {

                const m = (components: CipherFactory.Components) => {
                    switch (components) {
                        case "Decryptor": return "syncDecryptorFactory";
                        case "Encryptor": return "syncEncryptorFactory";
                        case "EncryptorDecryptor": return "syncEncryptorDecryptorFactory";
                    }
                };

                cipherInstances.set(
                    action.cipherInstanceRef,
                    cryptoLib[action.cipherName][m(action.components)].apply(null, action.params)
                );

            } break;
            case "EncryptOrDecrypt": {

                const output = cipherInstances.get(
                    action.cipherInstanceRef
                )![action.method](action.input);

                mainThreadApi.sendResponse((() => {

                    const message: EncryptOrDecrypt.Response = {
                        "actionId": action.actionId,
                        output
                    };

                    return message;

                })(), [output.buffer]);

            } break;
        }


    });

}
