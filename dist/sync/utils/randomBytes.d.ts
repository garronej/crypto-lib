export declare function randomBytes(size: number): Uint8Array;
export declare function randomBytes(size: number, callback: (err: Error | null, buf: Uint8Array) => void): void;
export declare namespace randomBytes {
    const MAX_BYTES = 65536;
    const MAX_UINT32 = 4294967295;
    type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
    type GetRandomValues = (typedArray: TypedArray) => void;
    const getRandomValues: GetRandomValues;
    const getNodeRandomBytes: () => typeof randomBytes;
}
