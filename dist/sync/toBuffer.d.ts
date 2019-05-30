import { Encoding } from "./types";
/**
 * NOTE: Does not guaranty that the returned object is an acutal
 * buffer instance, just that the to string method can be called
 * as on the Buffer prototype. ( even if the current implementation does)
 */
export declare function toBuffer(uint8Array: Uint8Array): {
    toString(encoding: Encoding): string;
};
