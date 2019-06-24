
declare const window: any;
declare const self: any;
declare const setTimeout: any;


export type Environnement = {
        type: "BROWSER" | "LIQUID CORE" | "NODE";
        isMainThread: boolean | undefined;
}

export const environnement: Environnement = (() => {

        if (typeof window !== "undefined") {
                return {
                        "type": "BROWSER" as const,
                        "isMainThread": true
                };
        } else if (typeof self !== "undefined" && !!self.postMessage) {
                return {
                        "type": "BROWSER" as const,
                        "isMainThread": false
                };
        } else if (typeof setTimeout === "undefined") {
                return {
                        "type": "LIQUID CORE" as const,
                        "isMainThread": true
                };
        } else {

                //NOTE: We do not check process.send because browserify hide it.
                return {
                        "type": "NODE" as const,
                        "isMainThread": undefined
                };


        }


})();



