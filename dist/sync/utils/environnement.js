"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environnement = (function () {
    if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
        return {
            "type": "REACT NATIVE",
            "isMainThread": true
        };
    }
    if (typeof window !== "undefined") {
        return {
            "type": "BROWSER",
            "isMainThread": true
        };
    }
    if (typeof self !== "undefined" && !!self.postMessage) {
        return {
            "type": "BROWSER",
            "isMainThread": false
        };
    }
    var isNodeCryptoAvailable = (function () {
        try {
            require("crypto" + "");
        }
        catch (_a) {
            return false;
        }
        return true;
    })();
    if (isNodeCryptoAvailable) {
        //NOTE: We do not check process.send because browserify hide it.
        return {
            "type": "NODE",
            "isMainThread": undefined
        };
    }
    return {
        "type": "LIQUID CORE",
        "isMainThread": true
    };
})();
