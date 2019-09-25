export declare type Environnement = {
    type: "BROWSER" | "LIQUID CORE" | "NODE" | "REACT NATIVE";
    isMainThread: boolean | undefined;
};
export declare const environnement: Environnement;
