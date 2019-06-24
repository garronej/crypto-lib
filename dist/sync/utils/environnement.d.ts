export declare type Environnement = {
    type: "BROWSER" | "LIQUID CORE" | "NODE";
    isMainThread: boolean | undefined;
};
export declare const environnement: Environnement;
