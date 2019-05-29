export declare type Action = Action.GenerateRsaKeys | Action.DummyEncryptorDecryptorFactory | Action.AesEncryptorDecryptorFactory | Action.RsaDecryptorFactory | Action.RsaEncryptorFactory | Action.EncryptOrDecrypt;
export declare type Response = Action.GenerateRsaKeys.Response | Action.EncryptOrDecrypt.Response;
export declare namespace Action {
    type GenerateRsaKeys = {
        action: "GenerateRsaKeys";
        actionId: number;
        params: Parameters<typeof import("../rsa").syncEncryptorFactory>;
    };
    namespace GenerateRsaKeys {
        type Response = {
            actionId: number;
            outputs: ReturnType<typeof import("../rsa").syncGenerateKeys>;
        };
    }
    type DummyEncryptorDecryptorFactory = {
        action: "DummyEncryptorDecryptorFactory";
        instanceRef: number;
    };
    type AesEncryptorDecryptorFactory = {
        action: "AesEncryptorDecryptorFactory";
        instanceRef: number;
        params: Parameters<typeof import("../aes").syncEncryptorDecryptorFactory>;
    };
    type RsaEncryptorFactory = {
        action: "RsaEncryptorFactory";
        instanceRef: number;
        params: Parameters<typeof import("../rsa").syncEncryptorFactory>;
    };
    type RsaDecryptorFactory = {
        action: "RsaDecryptorFactory";
        instanceRef: number;
        params: Parameters<typeof import("../rsa").syncDecryptorFactory>;
    };
    type EncryptOrDecrypt = {
        action: "EncryptOrDecrypt";
        actionId: number;
        instanceRef: number;
        method: keyof import("../types").EncryptorDecryptor;
        input: Uint8Array;
    };
    namespace EncryptOrDecrypt {
        type Response = {
            actionId: number;
            output: Uint8Array;
        };
    }
}
