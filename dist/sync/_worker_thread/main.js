"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cryptoLib = require("../index");
var environnement = require("../environnement");
var ThreadMessage_1 = require("./ThreadMessage");
if ((function () {
    if (typeof __simulatedMainThreadApi !== "undefined") {
        return false;
    }
    var isMainThead = environnement.isBrowser() ?
        (typeof document !== "undefined") :
        (typeof __process_node === "undefined");
    return isMainThead;
})()) {
    __cryptoLib = cryptoLib;
}
else {
    var mainThreadApi_1 = typeof __simulatedMainThreadApi !== "undefined" ?
        __simulatedMainThreadApi :
        environnement.isBrowser() ?
            {
                "sendResponse": self.postMessage.bind(self),
                "setActionListener": function (actionListener) { return addEventListener("message", function (_a) {
                    var data = _a.data;
                    return actionListener(data);
                }); }
            } : {
            "sendResponse": function (response) { return __process_node.send(ThreadMessage_1.transfer.prepare(response)); },
            "setActionListener": function (actionListener) { return __process_node.on("message", function (message) { return actionListener(ThreadMessage_1.transfer.restore(message)); }); }
        };
    var cipherInstances_1 = new Map();
    mainThreadApi_1.setActionListener(function (action) {
        switch (action.action) {
            case "GenerateRsaKeys":
                mainThreadApi_1.sendResponse((function () {
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
                    mainThreadApi_1.sendResponse((function () {
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
