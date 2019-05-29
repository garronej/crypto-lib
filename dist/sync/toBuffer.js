"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * NOTE: Does not guaranty that the returned object is an acutal
 * buffer instance, just that the to string method can be called
 * as on the Buffer prototype. ( even if the current implementation does)
 */
function toBuffer(uint8Array) {
    return (uint8Array instanceof Buffer || Object.getPrototypeOf(uint8Array).name === "Buffer") ?
        uint8Array :
        Buffer.from(uint8Array);
}
exports.toBuffer = toBuffer;
