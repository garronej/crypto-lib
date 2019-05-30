"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var WorkerThread_1 = require("./WorkerThread");
//NOTE: Path has to be static or it wont be bundled.
var bundle_source = (function () {
    var fs = require("fs");
    var path = require("path");
    return fs.readFileSync(path.join(__dirname, "..", "sync", "_worker_thread", "bundle.min.js")).toString("utf8");
})();
var __hook;
eval(bundle_source);
var _a = __hook, toBuffer = _a.toBuffer, serializer = _a.serializer, sync_scrypt = _a.scrypt, sync_aes = _a.aes, sync_rsa = _a.rsa, sync_plain = _a.plain;
exports.toBuffer = toBuffer;
exports.serializer = serializer;
__export(require("../sync/types"));
var _b = (function () {
    var spawn = WorkerThread_1.WorkerThread.factory(bundle_source);
    var record = {};
    return [
        function (workerThreadId) {
            var appWorker = record[workerThreadId];
            if (appWorker === undefined) {
                appWorker = spawn();
                record[workerThreadId] = appWorker;
            }
            return appWorker;
        },
        function (match) {
            return Object.keys(record)
                .filter(function (id) { return !!match ? match(id) : true; })
                .map(function (id) { return [record[id], id]; })
                .filter(function (_a) {
                var appWorker = _a[0];
                return appWorker !== undefined;
            })
                .forEach(function (_a) {
                var appWorker = _a[0], id = _a[1];
                appWorker.terminate();
                delete record[id];
            });
        }
    ];
})(), getWorkerThread = _b[0], terminateWorkerThreads = _b[1];
exports.terminateWorkerThreads = terminateWorkerThreads;
function preSpawnWorkerThread(workerThreadId) {
    getWorkerThread(workerThreadId);
}
exports.preSpawnWorkerThread = preSpawnWorkerThread;
var getCounter = (function () {
    var counter = 0;
    return function () { return counter++; };
})();
function encryptOrDecrypt(cipherInstanceRef, method, input, workerThreadId) {
    return __awaiter(this, void 0, void 0, function () {
        var actionId, appWorker, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    actionId = getCounter();
                    appWorker = getWorkerThread(workerThreadId);
                    appWorker.send((function () {
                        var action = {
                            "action": "EncryptOrDecrypt",
                            actionId: actionId,
                            cipherInstanceRef: cipherInstanceRef,
                            method: method,
                            input: input
                        };
                        return action;
                    })(), [input.buffer]);
                    return [4 /*yield*/, appWorker.evtResponse.waitFor(function (response) {
                            return response.actionId === actionId;
                        })];
                case 1:
                    output = (_a.sent()).output;
                    return [2 /*return*/, output];
            }
        });
    });
}
function cipherFactory(params, workerThreadId) {
    var cipherInstanceRef = getCounter();
    var appWorker = getWorkerThread(params.cipherName);
    appWorker.send((function () {
        var action = __assign({ "action": "CipherFactory", cipherInstanceRef: cipherInstanceRef }, params);
        return action;
    })());
    var cipher = (function () {
        var _a = ["encrypt", "decrypt"]
            .map(function (method) { return (function (data) { return encryptOrDecrypt(cipherInstanceRef, method, data, workerThreadId === undefined ? params.cipherName : workerThreadId); }); }), encrypt = _a[0], decrypt = _a[1];
        switch (params.components) {
            case "EncryptorDecryptor": return { encrypt: encrypt, decrypt: decrypt };
            case "Decryptor": return { decrypt: decrypt };
            case "Encryptor": return { encrypt: encrypt };
        }
    })();
    return cipher;
}
exports.plain = (function () {
    var encryptorDecryptorFactory = function (workerThreadId) {
        return cipherFactory({
            "cipherName": "plain",
            "components": "EncryptorDecryptor",
            "params": []
        }, workerThreadId);
    };
    return __assign({ encryptorDecryptorFactory: encryptorDecryptorFactory }, sync_plain);
})();
exports.aes = (function () {
    var encryptorDecryptorFactory = function (key, workerThreadId) {
        return cipherFactory({
            "cipherName": "aes",
            "components": "EncryptorDecryptor",
            "params": [key]
        }, workerThreadId);
    };
    return __assign({ encryptorDecryptorFactory: encryptorDecryptorFactory }, sync_aes);
})();
exports.rsa = (function () {
    var encryptorFactory = function (encryptKey, workerThreadId) {
        return cipherFactory({
            "cipherName": "rsa",
            "components": "Encryptor",
            "params": [encryptKey]
        }, workerThreadId);
    };
    var decryptorFactory = function (decryptKey, workerThreadId) {
        return cipherFactory({
            "cipherName": "rsa",
            "components": "Decryptor",
            "params": [decryptKey]
        }, workerThreadId);
    };
    function encryptorDecryptorFactory(encryptKey, decryptKey, workerThreadId) {
        return cipherFactory({
            "cipherName": "rsa",
            "components": "EncryptorDecryptor",
            "params": [encryptKey, decryptKey]
        }, workerThreadId);
    }
    var generateKeys = function (seed, workerThreadId) { return __awaiter(_this, void 0, void 0, function () {
        var actionId, appWorker, outputs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    actionId = getCounter();
                    appWorker = getWorkerThread(workerThreadId === undefined ? "rsa" : workerThreadId);
                    appWorker.send((function () {
                        var action = {
                            "action": "GenerateRsaKeys",
                            actionId: actionId,
                            "params": [seed]
                        };
                        return action;
                    })());
                    return [4 /*yield*/, appWorker.evtResponse.waitFor(function (response) {
                            return response.actionId === actionId;
                        })];
                case 1:
                    outputs = (_a.sent()).outputs;
                    return [2 /*return*/, outputs];
            }
        });
    }); };
    return __assign({ encryptorFactory: encryptorFactory,
        decryptorFactory: decryptorFactory,
        encryptorDecryptorFactory: encryptorDecryptorFactory,
        generateKeys: generateKeys }, sync_rsa);
})();
exports.scrypt = (function () {
    return __assign({}, sync_scrypt);
})();
