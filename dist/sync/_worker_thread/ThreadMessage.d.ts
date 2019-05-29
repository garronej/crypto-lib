export declare type ThreadMessage = ThreadMessage.Action | ThreadMessage.Response;
export declare namespace ThreadMessage {
    type Action = GenerateRsaKeys.Action | DummyEncryptorDecryptorFactory.Action | AesEncryptorDecryptorFactory.Action | RsaDecryptorFactory.Action | RsaEncryptorFactory.Action | EncryptOrDecrypt.Action;
    type Response = GenerateRsaKeys.Response | EncryptOrDecrypt.Response;
    namespace GenerateRsaKeys {
        type Action = {
            action: "GenerateRsaKeys";
            actionId: number;
            params: Parameters<typeof import("../rsa").syncEncryptorFactory>;
        };
        type Response = {
            actionId: number;
            outputs: ReturnType<typeof import("../rsa").syncGenerateKeys>;
        };
    }
    namespace DummyEncryptorDecryptorFactory {
        type Action = {
            action: "DummyEncryptorDecryptorFactory";
            instanceRef: number;
        };
    }
    namespace AesEncryptorDecryptorFactory {
        type Action = {
            action: "AesEncryptorDecryptorFactory";
            instanceRef: number;
            params: Parameters<typeof import("../aes").syncEncryptorDecryptorFactory>;
        };
    }
    namespace RsaEncryptorFactory {
        type Action = {
            action: "RsaEncryptorFactory";
            instanceRef: number;
            params: Parameters<typeof import("../rsa").syncEncryptorFactory>;
        };
    }
    namespace RsaDecryptorFactory {
        type Action = {
            action: "RsaDecryptorFactory";
            instanceRef: number;
            params: Parameters<typeof import("../rsa").syncDecryptorFactory>;
        };
    }
    namespace EncryptOrDecrypt {
        type Action = {
            action: "EncryptOrDecrypt";
            actionId: number;
            instanceRef: number;
            method: keyof import("../types").EncryptorDecryptor;
            input: Uint8Array;
        };
        type Response = {
            actionId: number;
            output: Uint8Array;
        };
    }
    namespace transfer {
        function prepare<T extends ThreadMessage>(data: T): any;
        function restore<T extends ThreadMessage>(message: any): T;
    }
}
