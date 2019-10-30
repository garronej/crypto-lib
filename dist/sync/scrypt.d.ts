import { ScryptParams } from "./types";
export declare const defaultParams: ScryptParams;
export declare function syncHash(text: string, salt: string, params?: Partial<ScryptParams>, progress?: (percent: number) => void): Uint8Array;
