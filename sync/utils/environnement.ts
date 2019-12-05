
declare const window: any;
declare const self: any;
declare const navigator: any;
declare const require: any;


export type Environnement = {
    type: "BROWSER" | "LIQUID CORE" | "NODE" | "REACT NATIVE";
    isMainThread: boolean | undefined;
}

export const environnement: Environnement = (() => {

    if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {

        return {
            "type": "REACT NATIVE" as const,
            "isMainThread": true
        };

    }

    if (typeof window !== "undefined") {
        return {
            "type": "BROWSER" as const,
            "isMainThread": true
        };
    } if (typeof self !== "undefined" && !!self.postMessage) {
        return {
            "type": "BROWSER" as const,
            "isMainThread": false
        };
    }

    const isNodeCryptoAvailable = (() => {

        try {

            require("crypto" + "");

        } catch{

            return false;

        }

        return true;

    })();

    if (isNodeCryptoAvailable) {

        //NOTE: We do not check process.send because browserify hide it.
        return {
            "type": "NODE" as const,
            "isMainThread": undefined
        };

    }

    return {
        "type": "LIQUID CORE" as const,
        "isMainThread": true
    };

})();
