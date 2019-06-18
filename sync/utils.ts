
export function concatUint8Array(...uint8Arrays: Uint8Array[]): Uint8Array {

    const out = new Uint8Array(
        uint8Arrays
            .map(({ length }) => length)
            .reduce((prev, curr) => prev + curr, 0)
    );

    let offset = 0;

    for (let i = 0; i < uint8Arrays.length; i++) {

        const uint8Array = uint8Arrays[i];

        out.set(uint8Array, offset);

        offset += uint8Array.length;

    }

    return out;


}

export function addPadding(position: "LEFT" | "RIGHT", uint8Array: Uint8Array, targetLengthBytes: number) {

    const paddingBytes = new Uint8Array(targetLengthBytes - uint8Array.length).fill(0);

    return concatUint8Array(...(() => {
        switch (position) {
            case "LEFT": return [paddingBytes, uint8Array];
            case "RIGHT": return [uint8Array, paddingBytes];
        }
    })());

}


export function numberToUint8Array(n: number): Uint8Array {

    const str = n.toString(16);

    let arr: number[] = [];

    let curr = "";

    for (let i = str.length - 1; i >= 0; i--) {

        curr = str[i] + curr;

        if (curr.length === 2 || i === 0) {

            arr = [parseInt(curr, 16), ...arr];

            curr = "";

        }

    }

    return new Uint8Array(arr);

}

export function uint8ArrayToNumber(uint8Array: Uint8Array) {

    let n = 0;

    let exp = 0;

    for (let i = uint8Array.length - 1; i >= 0; i--) {

        n += uint8Array[i] * Math.pow(256, exp++);

    }

    return n;

}

/** +1, in place ( array is updated ) */
export function leftShift(uint8Array: Uint8Array): Uint8Array{

    let c= true;

    for(let i= uint8Array.length - 1; c && i >= 0; i-- ){

        if( ++uint8Array[i] !== 256 ){
            c= false;
        }

    }

    return uint8Array;

}