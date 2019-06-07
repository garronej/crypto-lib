
import * as scryptsy from "scryptsy";
import { ScryptParams } from "./types";

export const defaultParams: ScryptParams = {
    "n": 13,
    "r": 8,
    "p": 1,
    "digestLengthBytes": 254
};

export function syncHash(
    text: string,
    salt: string,
    params: Partial<ScryptParams> = {},
    progress?: (percent: number) => void
): Uint8Array {

    const { n, r, p, digestLengthBytes } = (() => {

        const out = { ...defaultParams };

        Object.keys(params)
            .filter(key => params[key] !== undefined)
            .forEach(key => out[key] = params[key]);

        return out;

    })();

    return scryptsy(
        text,
        salt,
        Math.pow(2, n),
        r,
        p,
        digestLengthBytes,
        progress !== undefined ?
            (({ percent }) => progress(percent)) :
            undefined
    );

}
