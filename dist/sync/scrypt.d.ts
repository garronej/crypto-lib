export declare type ScryptParams = {
    /** 2^|n| of iterations. */
    n: number;
    /** Memory factor. */
    r: number;
    /** Parallelization factor. */
    p: number;
    digestLengthBytes: number;
};
export declare const defaultParams: ScryptParams;
export declare function syncHash(text: string, salt: string, params?: Partial<ScryptParams>, progress?: (percent: number) => void): Uint8Array;
