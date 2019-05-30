"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environnement = require("../environnement");
var toBuffer_1 = require("../toBuffer");
var transfer;
(function (transfer) {
    var SerializableUint8Array;
    (function (SerializableUint8Array) {
        function match(value) {
            return (value instanceof Object &&
                value.type === "Uint8Array" &&
                typeof value.data === "string");
        }
        SerializableUint8Array.match = match;
        function build(value) {
            return {
                "type": "Uint8Array",
                "data": toBuffer_1.toBuffer(value).toString("binary")
            };
        }
        SerializableUint8Array.build = build;
        function restore(value) {
            return Buffer.from(value.data, "binary");
        }
        SerializableUint8Array.restore = restore;
    })(SerializableUint8Array || (SerializableUint8Array = {}));
    function prepare(threadMessage) {
        if (environnement.isBrowser()) {
            throw new Error("only for node");
        }
        var message = (function () {
            if (threadMessage instanceof Uint8Array) {
                return SerializableUint8Array.build(threadMessage);
            }
            else if (threadMessage instanceof Array) {
                return threadMessage.map(function (entry) { return prepare(entry); });
            }
            else if (threadMessage instanceof Object) {
                var out = {};
                for (var key in threadMessage) {
                    out[key] = prepare(threadMessage[key]);
                }
                return out;
            }
            else {
                return threadMessage;
            }
        })();
        return message;
    }
    transfer.prepare = prepare;
    function restore(message) {
        if (environnement.isBrowser()) {
            throw new Error("only for node");
        }
        var threadMessage = (function () {
            if (SerializableUint8Array.match(message)) {
                return SerializableUint8Array.restore(message);
            }
            else if (message instanceof Array) {
                return message.map(function (entry) { return restore(entry); });
            }
            else if (message instanceof Object) {
                var out = {};
                for (var key in message) {
                    out[key] = restore(message[key]);
                }
                return out;
            }
            else {
                return message;
            }
        })();
        return threadMessage;
    }
    transfer.restore = restore;
})(transfer = exports.transfer || (exports.transfer = {}));
