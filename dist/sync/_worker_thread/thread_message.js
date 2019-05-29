"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environnement = require("./environnement");
var SerializableUint8Array;
(function (SerializableUint8Array) {
    function match(value) {
        return (value instanceof Object &&
            value.type === "Uint8Array" &&
            value.data instanceof Array);
    }
    SerializableUint8Array.match = match;
    function build(value) {
        return {
            "type": "Uint8Array",
            "data": Array.from(value)
        };
    }
    SerializableUint8Array.build = build;
    function restore(value) {
        return Uint8Array.from(value.data);
    }
    SerializableUint8Array.restore = restore;
})(SerializableUint8Array || (SerializableUint8Array = {}));
function prepare(data) {
    if (environnement.isBrowser()) {
        throw new Error("only for node");
    }
    var message = {};
    var _loop_1 = function (key) {
        var value = data[key];
        message[key] = (function () {
            if (value instanceof Uint8Array) {
                return SerializableUint8Array.build(value);
            }
            else if (value instanceof Object) {
                return prepare(value);
            }
            else {
                return value;
            }
        })();
    };
    for (var key in data) {
        _loop_1(key);
    }
    return message;
}
exports.prepare = prepare;
function restore(message) {
    if (environnement.isBrowser()) {
        throw new Error("only for node");
    }
    var data = {};
    var _loop_2 = function (key) {
        var value = message[key];
        data[key] = (function () {
            if (SerializableUint8Array.match(value)) {
                return SerializableUint8Array.restore(value);
            }
            else if (value instanceof Object) {
                return restore(value);
            }
            else {
                return value;
            }
        })();
    };
    for (var key in message) {
        _loop_2(key);
    }
    return data;
}
exports.restore = restore;
