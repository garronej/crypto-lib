declare const self: any;
declare const addEventListener: any;
declare const document: any;

import * as cryptoLib from "../index";
import * as environnement from "./environnement";
import { ThreadMessage, GenerateRsaKeys, CipherFactory, EncryptOrDecrypt, transfer } from "./ThreadMessage";

declare let __process_node: any;
//@ts-ignore
declare let __hook: typeof cryptoLib;

if ((() => {

    const isMainThead = environnement.isBrowser() ?
        (typeof document !== "undefined") :
        (typeof __process_node === "undefined")
        ;

    return isMainThead;

})()) {

    __hook = cryptoLib;

} else {

    const postMessage: ((response: ThreadMessage.Response, transfer?: ArrayBuffer[]) => void) =
        environnement.isBrowser() ?
            self.postMessage as any :
            response => __process_node.send(
                transfer.prepare(
                    response
                )
            )
        ;

    const setActionListener = (actionListener: (action: ThreadMessage.Action) => void) =>
        environnement.isBrowser() ?
            addEventListener(
                "message",
                ({ data }) => actionListener(data)
            ) :
            __process_node.on(
                "message",
                message => actionListener(
                    transfer.restore(
                        message
                    )
                )
            )
        ;

    const cipherInstances = new Map<number, cryptoLib.Cipher>();

    setActionListener((action: ThreadMessage.Action) => {

        switch (action.action) {
            case "GenerateRsaKeys":
                postMessage((() => {

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

                postMessage((() => {

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
