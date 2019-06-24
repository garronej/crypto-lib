
declare const window: any;
declare const self: any;
declare const setTimeout: any;

/** we treat LiquidCore as a browser considering that it does not have the crypto library */
export function isBrowser(): boolean {
        return (
                typeof setTimeout === "undefined" || //LiquidCore
                typeof window !== "undefined" ||
                typeof self !== "undefined" && !!self.postMessage
        );
}

