"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The returned object is an instance of the global Buffer class.
 * ( toBuffer(data) instanceof Buffer === true )
 */
function toBuffer(uint8Array) {
    return Buffer.from(uint8Array.buffer, uint8Array.byteOffset, uint8Array.length);
}
exports.toBuffer = toBuffer;
