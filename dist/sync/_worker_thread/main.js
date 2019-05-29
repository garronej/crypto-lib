"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//TODO: Handle case when we are not running in a browser
/// <reference lib="dom"/>
/* /// <reference path="../../node_modules/@types/node/index.d.ts"/> */
var cryptoLib = require("../index");
var environnement = require("./environnement");
var ThreadMessage_1 = require("./ThreadMessage");
var isMainThead = environnement.isBrowser() ?
    (typeof document !== "undefined") :
    (typeof __process_node === "undefined");
if (isMainThead) {
    __hook = cryptoLib;
}
else {
    var postMessage_1 = environnement.isBrowser() ?
        self.postMessage :
        function (response) { return __process_node.send(ThreadMessage_1.ThreadMessage.transfer.prepare(response)); };
    var setActionListener = function (actionListener) {
        return environnement.isBrowser() ?
            addEventListener("message", function (_a) {
                var data = _a.data;
                return actionListener(data);
            }) :
            __process_node.on("message", function (message) { return actionListener(ThreadMessage_1.ThreadMessage.transfer.restore(message)); });
    };
    var map_1 = new Map();
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
            case "DummyEncryptorDecryptorFactory":
                map_1.set(action.instanceRef, cryptoLib.dummy.syncEncryptorDecryptorFactory.apply(cryptoLib.dummy));
                break;
            case "AesEncryptorDecryptorFactory":
                map_1.set(action.instanceRef, cryptoLib.aes.syncEncryptorDecryptorFactory.apply(cryptoLib.aes, action.params));
                break;
            case "RsaDecryptorFactory":
                map_1.set(action.instanceRef, cryptoLib.rsa.syncDecryptorFactory.apply(cryptoLib.rsa, action.params));
                break;
            case "RsaEncryptorFactory":
                map_1.set(action.instanceRef, cryptoLib.rsa.syncEncryptorFactory.apply(cryptoLib.rsa, action.params));
                break;
            case "EncryptOrDecrypt":
                {
                    var output_1 = map_1.get(action.instanceRef)[action.method](action.input);
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
