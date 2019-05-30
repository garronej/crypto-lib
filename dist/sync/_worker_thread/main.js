"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cryptoLib = require("../index");
var environnement = require("../environnement");
var ThreadMessage_1 = require("./ThreadMessage");
if ((function () {
    var isMainThead = environnement.isBrowser() ?
        (typeof document !== "undefined") :
        (typeof __process_node === "undefined");
    return isMainThead;
})()) {
    __hook = cryptoLib;
}
else {
    var postMessage_1 = environnement.isBrowser() ?
        self.postMessage :
        function (response) { return __process_node.send(ThreadMessage_1.transfer.prepare(response)); };
    var setActionListener = function (actionListener) {
        return environnement.isBrowser() ?
            addEventListener("message", function (_a) {
                var data = _a.data;
                return actionListener(data);
            }) :
            __process_node.on("message", function (message) { return actionListener(ThreadMessage_1.transfer.restore(message)); });
    };
    var cipherInstances_1 = new Map();
    setActionListener(function (action) {
        switch (action.action) {
            case "GenerateRsaKeys":
                postMessage_1((function () {
                    var message = {
                        "actionId": action.actionId,
                        "outputs": cryptoLib.rsa.syncGenerateKeys.apply(cryptoLib.rsa, action.params)
                    };
                    return message;
                })());
                break;
            case "CipherFactory":
                {
                    var m = function (components) {
                        switch (components) {
                            case "Decryptor": return "syncDecryptorFactory";
                            case "Encryptor": return "syncEncryptorFactory";
                            case "EncryptorDecryptor": return "syncEncryptorDecryptorFactory";
                        }
                    };
                    cipherInstances_1.set(action.cipherInstanceRef, cryptoLib[action.cipherName][m(action.components)].apply(null, action.params));
                }
                break;
            case "EncryptOrDecrypt":
                {
                    var output_1 = cipherInstances_1.get(action.cipherInstanceRef)[action.method](action.input);
                    postMessage_1((function () {
                        var message = {
                            "actionId": action.actionId,
                            output: output_1
                        };
                        return message;
                    })(), [output_1.buffer]);
                }
                break;
        }
    });
}
