"use strict";
//TODO: Handle when not in the browser
/// <reference lib="dom"/> 
/// <reference path="../node_modules/@types/node/index.d.ts"/> 
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
Object.defineProperty(exports, "__esModule", { value: true });
var ts_events_extended_1 = require("ts-events-extended");
var requireNodeBuiltIn_1 = require("./requireNodeBuiltIn");
var fs = require("fs");
var path = require("path");
//declare const __dirname: any;
//NOTE: Path has to be static or it wont be bundled.
var bundle_source = fs.readFileSync(path.join(__dirname, "..", "sync", "_worker_thread", "bundle.js")).toString("utf8");
var __hook;
eval(bundle_source);
var _a = __hook, _worker_thread = _a._worker_thread, toBuffer = _a.toBuffer, serializer = _a.serializer, scryptSync = _a.scrypt, aesSync = _a.aes, rsaSync = _a.rsa, dummySync = _a.dummy;
exports.toBuffer = toBuffer;
exports.serializer = serializer;
var getCounter = (function () {
    var counter = 0;
    return function () { return counter++; };
})();
var evtWorkerMessage = new ts_events_extended_1.SyncEvent();
var getPostMessage = (function () {
    if (_worker_thread.isBrowser()) {
        var worker_1 = undefined;
        return function () {
            if (worker_1 === undefined) {
                worker_1 = new Worker(window.URL.createObjectURL(new Blob([bundle_source], { "type": 'text/javascript' })));
                worker_1.addEventListener("message", function (ev) { return evtWorkerMessage.post(ev.data); });
            }
            return function (action, transfer) {
                return worker_1.postMessage(action, transfer);
            };
        };
    }
    else {
        var child_process_1 = require("child_process" + "");
        var childProcess_1 = undefined;
        return function () {
            if (childProcess_1 === undefined) {
                var fs_1 = requireNodeBuiltIn_1.requireNodeBuiltIn("fs");
                var random_file_path = (function () {
                    var generateRandomFilePath = function () { return path.join(".", requireNodeBuiltIn_1.requireNodeBuiltIn("crypto")
                        .randomBytes(4)
                        .toString("hex")); };
                    var out = generateRandomFilePath();
                    while (fs_1.existsSync(out)) {
                        out = generateRandomFilePath();
                    }
                    return out;
                })();
                fs_1.writeFileSync(random_file_path, Buffer.from([
                    "console.log(\"LOADED\");",
                    "var __process_node= process;",
                    bundle_source
                ].join("\n"), "utf8"));
                childProcess_1 = child_process_1.fork(random_file_path, undefined, { "stdio": ["pipe", "pipe", "pipe", "ipc"] });
                childProcess_1.on("message", function (message) { return evtWorkerMessage.post(_worker_thread.ThreadMessage.transfer.restore(message)); });
                /*
                childProcess.stdout.once(
                    "data",
                    () => fs.unlinkSync(random_file_path)
                );
                */
                childProcess_1.stdout.on("data", function (data) {
                    console.log("ChildProcess => " + data.toString("utf8"));
                });
            }
            /*
            return (action: import("../sync/_worker_thread").ThreadMessage.Action) => childProcess!.send(
                _worker_thread.ThreadMessage.transfer.prepare(
                    action
                )
            );
            */
            return function (action) { return childProcess_1.send((function () {
                var message = _worker_thread.ThreadMessage.transfer.prepare(action);
                console.log("before send: " + require("util" + "").inspect(message));
                return message;
            })()); };
        };
    }
})();
function encryptOrDecrypt(instanceRef, method, input) {
    return __awaiter(this, void 0, void 0, function () {
        var actionId, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    actionId = getCounter();
                    getPostMessage()((function () {
                        var action = {
                            "action": "EncryptOrDecrypt",
                            actionId: actionId,
                            method: method,
                            instanceRef: instanceRef,
                            input: input
                        };
                        return action;
                    })(), [input.buffer]);
                    return [4 /*yield*/, evtWorkerMessage.waitFor(function (_a) {
                            var actionId_ = _a.actionId;
                            return actionId_ === actionId;
                        })];
                case 1:
                    output = (_a.sent()).output;
                    return [2 /*return*/, output];
            }
        });
    });
}
exports.dummy = __assign({ "encryptorDecryptorFactory": (function () {
        var factory = function () {
            var instanceRef = getCounter();
            getPostMessage()((function () {
                var action = {
                    "action": "DummyEncryptorDecryptorFactory",
                    instanceRef: instanceRef,
                };
                return action;
            })());
            return {
                "encrypt": function (plainData) { return encryptOrDecrypt(instanceRef, "encrypt", plainData); },
                "decrypt": function (encryptedData) { return encryptOrDecrypt(instanceRef, "decrypt", encryptedData); }
            };
        };
        return factory;
    })() }, dummySync);
exports.aes = __assign({ "encryptorDecryptorFactory": (function () {
        var factory = function (key) {
            console.log("" + require("util" + "").inspect({ key: key }));
            var instanceRef = getCounter();
            getPostMessage()((function () {
                var action = {
                    "action": "AesEncryptorDecryptorFactory",
                    instanceRef: instanceRef,
                    "params": [key]
                };
                return action;
            })());
            return {
                "encrypt": function (plainData) { return encryptOrDecrypt(instanceRef, "encrypt", plainData); },
                "decrypt": function (encryptedData) { return encryptOrDecrypt(instanceRef, "decrypt", encryptedData); }
            };
        };
        return factory;
    })() }, aesSync);
exports.rsa = __assign({}, rsaSync);
exports.scrypt = __assign({}, scryptSync);
