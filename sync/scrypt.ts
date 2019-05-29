
import * as scryptsy from "scryptsy";

export function syncHash(
    text: string,
    salt: string,
    progress?: (percent: number) => void
): Uint8Array {

    //The 2^number of iterations. number (integer)
    const n = 13;
    //Memory factor. number (integer)
    const r = 8;
    //Parallelization factor. number (integer)
    const p = 1;
    //The number of bytes to return. number (integer)
    const keyLenBytes = 254;

    return scryptsy(
        text,
        salt,
        Math.pow(2, n),
        r,
        p,
        keyLenBytes,
        progress !== undefined ?
            (({ percent }) => progress(percent)) :
            undefined
    );

}
