
import { environnement } from "./environnement";

declare const require: any;
declare const crypto: any;
declare const msCrypto: any;
declare const self: any;
declare const Buffer: any;
declare const setTimeout: any;

export function randomBytes(size: number): Uint8Array;
export function randomBytes(size: number, callback: (err: Error | null, buf: Uint8Array) => void): void;
export function randomBytes(size: number, callback?: (err: Error | null, buf: Uint8Array) => void): Uint8Array | void {

    const { MAX_UINT32, MAX_BYTES, getRandomValues, getNodeRandomBytes } = randomBytes;

    if (environnement.type === "NODE") {

        const nodeBufferInst = getNodeRandomBytes()(size);

        return Buffer.from(
            nodeBufferInst.buffer,
            nodeBufferInst.byteOffset,
            nodeBufferInst.length
        );

    }

    // phantomjs needs to throw
    if (size > MAX_UINT32) {
        throw new RangeError('requested too many random bytes')
    }

    const bytes = Buffer.allocUnsafe(size);

    if (size > 0) {  // getRandomValues fails on IE if size == 0
        if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
            // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
            for (var generated = 0; generated < size; generated += MAX_BYTES) {
                // buffer.slice automatically checks if the end is past the end of
                // the buffer so we don't have to here
                getRandomValues(bytes.slice(generated, generated + MAX_BYTES));
            }
        } else {
            getRandomValues(bytes);
        }
    }

    if (typeof callback === "function") {

        /*
        NOTE:If liquid core it will crash, it's ok
        liquid core is not supposed to do anything async
        */
        setTimeout(
            () => callback(null, bytes),
            0
        );

        return;

    }

    return bytes

}

export namespace randomBytes {

    // limit of Crypto.getRandomValues()
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    export const MAX_BYTES = 65536

    // Node supports requesting up to this number of bytes
    // https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
    export const MAX_UINT32 = 4294967295

    export type TypedArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array;
    export type GetRandomValues = (typedArray: TypedArray) => void;

    export const getRandomValues: GetRandomValues = (function () {

        //NOTE: Used when in edge in a service worker or with LiquidCore.
        const nonCryptographicGetRandomValue: GetRandomValues = abv => {

            let l = abv.length;
            while (l--) {
                abv[l] = Math.floor(Math.random() * 256);
            }
            return abv;

        };

        const browserGetRandomValues: GetRandomValues | undefined = (() => {

            if (typeof crypto === "object" && !!crypto.getRandomValues) {
                return crypto.getRandomValues.bind(crypto);
            } else if (typeof msCrypto === "object" && !!msCrypto.getRandomValues) {
                return msCrypto.getRandomValues.bind(msCrypto);
            } else if (typeof self === "object" && typeof self.crypto === "object" && !!self.crypto.getRandomValues) {
                return self.crypto.getRandomValues.bind(self.crypto);
            } else {
                return undefined;
            }

        })();

        return !!browserGetRandomValues ?
            browserGetRandomValues :
            nonCryptographicGetRandomValue
            ;

    })();

    export const getNodeRandomBytes: () => typeof randomBytes = (() => {

        let nodeRandomBytes: typeof randomBytes | undefined = undefined;

        return function () {

            if (nodeRandomBytes === undefined) {
                nodeRandomBytes = require("crypto" + "").randomBytes as typeof randomBytes;
            }

            return nodeRandomBytes;

        }

    })();


}