import { RsaKey } from "../types";
export declare type ThreadMessage = ThreadMessage.Action | ThreadMessage.Response;
export declare namespace ThreadMessage {
    type Action = ScryptHash.Action | GenerateRsaKeys.Action | CipherFactory.Action | EncryptOrDecrypt.Action;
    type Response = ScryptHash.Response | GenerateRsaKeys.Response | EncryptOrDecrypt.Response;
}
export declare namespace GenerateRsaKeys {
    type Action = {
        action: "GenerateRsaKeys";
        actionId: number;
        params: Parameters<typeof import("../cipher/rsa").syncGenerateKeys>;
    };
    type Response = {
        actionId: number;
        outputs: ReturnType<typeof import("../cipher/rsa").syncGenerateKeys>;
    };
}
export declare namespace CipherFactory {
    type CipherName = "aes" | "rsa" | "plain";
    type Components = "Encryptor" | "Decryptor" | "EncryptorDecryptor";
    type ActionPoly<T extends CipherName, U extends Components> = {
        action: "CipherFactory";
        cipherName: T;
        components: U;
        cipherInstanceRef: number;
        params: T extends "aes" ? (Parameters<typeof import("../cipher/aes").syncEncryptorDecryptorFactory>) : T extends "rsa" ? (U extends "EncryptorDecryptor" ? [RsaKey.Private, RsaKey.Public] | [RsaKey.Public, RsaKey.Private] : Parameters<typeof import("../cipher/rsa").syncEncryptorFactory>) : ([]);
    };
    type Action = ActionPoly<CipherName, Components>;
}
export declare namespace EncryptOrDecrypt {
    type Action = {
        action: "EncryptOrDecrypt";
        actionId: number;
        cipherInstanceRef: number;
        method: keyof import("../types").EncryptorDecryptor;
        input: Uint8Array;
    };
    type Response = {
        actionId: number;
        output: Uint8Array;
    };
}
export declare namespace ScryptHash {
    type Action = {
        action: "ScryptHash";
        actionId: number;
        params: [string, string, Partial<import("../types").ScryptParams>];
    };
    type Response = Response.Progress | Response.Final;
    namespace Response {
        type Progress = {
            actionId: number;
            percent: number;
        };
        type Final = {
            actionId: number;
            digest: Uint8Array;
        };
    }
}
export declare namespace transfer {
    function prepare<T extends ThreadMessage>(threadMessage: T): any;
    function restore<T extends ThreadMessage>(message: any): T;
}
