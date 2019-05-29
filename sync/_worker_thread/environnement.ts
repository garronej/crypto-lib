
declare const window: any;
declare const self: any;

export function isBrowser(): boolean {
        return (
                typeof window !== "undefined" ||
                (typeof self !== "undefined" && !!self.postMessage)
        );
}

