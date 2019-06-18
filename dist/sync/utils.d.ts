export declare function concatUint8Array(...uint8Arrays: Uint8Array[]): Uint8Array;
export declare function addPadding(position: "LEFT" | "RIGHT", uint8Array: Uint8Array, targetLengthBytes: number): Uint8Array;
export declare function numberToUint8Array(n: number): Uint8Array;
export declare function uint8ArrayToNumber(uint8Array: Uint8Array): number;
/** +1, in place ( array is updated ) */
export declare function leftShift(uint8Array: Uint8Array): Uint8Array;
