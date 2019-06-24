"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** we treat LiquidCore as a browser considering that it does not have the crypto library */
function isBrowser() {
    return (typeof setTimeout === "undefined" || //LiquidCore
        typeof window !== "undefined" ||
        typeof self !== "undefined" && !!self.postMessage);
}
exports.isBrowser = isBrowser;
