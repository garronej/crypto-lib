//TODO: Handle case when we are not running in a browser
/// <reference lib="dom"/>
/* /// <reference path="../../node_modules/@types/node/index.d.ts"/> */
import * as cryptoLib from "../index";
import * as environnement from "./environnement";
import { ThreadMessage } from "./ThreadMessage";

declare let __process_node: any;
//@ts-ignore
declare let __hook: typeof cryptoLib;

const isMainThead= environnement.isBrowser() ?
                (typeof document !== "undefined") :
                (typeof __process_node === "undefined")
    ;


if (isMainThead) {

    __hook = cryptoLib;

} else {

    const postMessage: ((response: ThreadMessage.Response, transfer?: Transferable[]) => void) =
        environnement.isBrowser() ?
            self.postMessage as any :
            response => __process_node.send(
                ThreadMessage.transfer.prepare(
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
                    ThreadMessage.transfer.restore(
                        message
                    )
                )
            )
        ;

    const map = new Map<number, cryptoLib.EncryptorDecryptor | cryptoLib.Decryptor | cryptoLib.Encryptor>();

    setActionListener((action: ThreadMessage.Action) => {

        switch (action.action) {
            case "GenerateRsaKeys":
                postMessage((() => {

                    const message: ThreadMessage.GenerateRsaKeys.Response = {
                        "actionId": action.actionId,
                        "outputs": cryptoLib.rsa.syncGenerateKeys.apply(
                            cryptoLib.rsa,
                            action.params
                        )
                    };

                    return message;

                })());
                break;
            case "DummyEncryptorDecryptorFactory":
                map.set(
                    action.instanceRef,
                    cryptoLib.dummy.syncEncryptorDecryptorFactory.apply(
                        cryptoLib.dummy
                    )
                );
                break;
            case "AesEncryptorDecryptorFactory":
                map.set(
                    action.instanceRef,
                    cryptoLib.aes.syncEncryptorDecryptorFactory.apply(
                        cryptoLib.aes,
                        action.params
                    )
                );
                break;
            case "RsaDecryptorFactory":
                map.set(
                    action.instanceRef,
                    cryptoLib.rsa.syncDecryptorFactory.apply(
                        cryptoLib.rsa,
                        action.params
                    )
                );
                break;
            case "RsaEncryptorFactory":
                map.set(
                    action.instanceRef,
                    cryptoLib.rsa.syncEncryptorFactory.apply(
                        cryptoLib.rsa,
                        action.params
                    )
                );
                break;
            case "EncryptOrDecrypt": {

                const output = map.get(action.instanceRef)![action.method](action.input);

                postMessage((() => {

                    const message: ThreadMessage.EncryptOrDecrypt.Response = {
                        "actionId": action.actionId,
                        output
                    };

                    return message;

                })(), [output.buffer]);

            } break;
        }


    });

}
