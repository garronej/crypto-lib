"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("minimal-polyfills/ArrayBuffer.isView");
var Map_1 = require("minimal-polyfills/Map");
var cryptoLib = require("../index");
var environnement_1 = require("../utils/environnement");
var ThreadMessage_1 = require("./ThreadMessage");
if ((function () {
    if (typeof __simulatedMainThreadApi !== "undefined") {
        return false;
    }
    var isMainThead = environnement_1.environnement.isMainThread !== undefined ?
        environnement_1.environnement.isMainThread :
        typeof __process_node === "undefined";
    return isMainThead;
})()) {
    __cryptoLib = cryptoLib;
}
else {
    var mainThreadApi_1 = typeof __simulatedMainThreadApi !== "undefined" ?
        __simulatedMainThreadApi :
        typeof __process_node === "undefined" ?
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
    var cipherInstances_1 = new Map_1.Polyfill();
    mainThreadApi_1.setActionListener(function (action) {
        var _a, _b;
        switch (action.action) {
            case "GenerateRsaKeys":
                mainThreadApi_1.sendResponse((function () {
                    var _a;
                    var response = {
                        "actionId": action.actionId,
                        "outputs": (_a = cryptoLib.rsa).syncGenerateKeys.apply(_a, action.params)
                    };
                    return response;
                })());
                break;
            case "CipherFactory":
                cipherInstances_1.set(action.cipherInstanceRef, (_a = cryptoLib[action.cipherName])[(function () {
                    switch (action.components) {
                        case "Decryptor": return "syncDecryptorFactory";
                        case "Encryptor": return "syncEncryptorFactory";
                        case "EncryptorDecryptor": return "syncEncryptorDecryptorFactory";
                    }
                })()].apply(_a, action.params));
                break;
            case "EncryptOrDecrypt":
                {
                    var output_1 = cipherInstances_1.get(action.cipherInstanceRef)[action.method](action.input);
                    mainThreadApi_1.sendResponse((function () {
                        var response = {
                            "actionId": action.actionId,
                            output: output_1
                        };
                        return response;
                    })(), [output_1.buffer]);
                }
                break;
            case "ScryptHash":
                {
                    var digest_1 = (_b = cryptoLib.scrypt).syncHash.apply(_b, __spreadArrays(action.params, [
                        function (percent) { return mainThreadApi_1.sendResponse((function () {
                            var response = {
                                "actionId": action.actionId,
                                percent: percent
                            };
                            return response;
                        })()); }
                    ]));
                    mainThreadApi_1.sendResponse((function () {
                        var response = {
                            "actionId": action.actionId,
                            digest: digest_1
                        };
                        return response;
                    })(), [digest_1.buffer]);
                }
                break;
        }
    });
}
