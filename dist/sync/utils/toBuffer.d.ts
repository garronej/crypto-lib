export declare type Encoding = "hex" | "base64" | "binary" | "utf8";
/**
 * The returned object is an instance of the global Buffer class.
 * ( toBuffer(data) instanceof Buffer === true )
 */
export declare function toBuffer(uint8Array: Uint8Array): {
    toString(encoding: Encoding): string;
};
