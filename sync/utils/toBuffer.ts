
declare const Buffer: any;

export type Encoding = "hex" | "base64" | "binary" | "utf8";

/** 
 * The returned object is an instance of the global Buffer class.
 * ( toBuffer(data) instanceof Buffer === true )
 */
export function toBuffer(uint8Array: Uint8Array): { toString(encoding: Encoding): string; } {
    return Buffer.from(uint8Array.buffer, uint8Array.byteOffset, uint8Array.length);
}