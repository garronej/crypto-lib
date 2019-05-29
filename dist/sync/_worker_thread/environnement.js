"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isBrowser() {
    return (typeof window !== "undefined" ||
        (typeof self !== "undefined" && !!self.postMessage));
}
exports.isBrowser = isBrowser;
