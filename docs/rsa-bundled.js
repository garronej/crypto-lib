(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerThread = void 0;
var environnement_1 = require("../sync/utils/environnement");
var web_1 = require("./WorkerThread/web");
var node_1 = require("./WorkerThread/node");
var simulated_1 = require("./WorkerThread/simulated");
var WorkerThread;
(function (WorkerThread) {
    function factory(source, isMultithreadingEnabled) {
        return function () {
            if (!isMultithreadingEnabled()) {
                return simulated_1.spawn(source);
            }
            if (environnement_1.environnement.type === "LIQUID CORE" || environnement_1.environnement.type === "REACT NATIVE") {
                throw new Error(environnement_1.environnement.type + " cant fork");
            }
            switch (environnement_1.environnement.type) {
                case "BROWSER": return web_1.spawn(source);
                case "NODE": return node_1.spawn(source);
            }
        };
    }
    WorkerThread.factory = factory;
})(WorkerThread = exports.WorkerThread || (exports.WorkerThread = {}));

},{"../sync/utils/environnement":10,"./WorkerThread/node":2,"./WorkerThread/simulated":3,"./WorkerThread/web":5}],2:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawn = void 0;
var evt_1 = require("evt");
var ThreadMessage_1 = require("../../sync/_worker_thread/ThreadMessage");
var path = require("path");
function spawn(source) {
    var child_process = require((function () { return "child_process"; })());
    var fs = require((function () { return "fs"; })());
    var random_file_path = (function () {
        var getRandom = (function () {
            var crypto = require((function () { return "crypto"; })());
            var base_path = (function () {
                var out = path.join("/", "tmp");
                if (!fs.existsSync(out)) {
                    out = path.join(".");
                }
                return out;
            })();
            return function () { return path.join(base_path, ".tmp_crypto-lib_you_can_remove_me_" + crypto
                .randomBytes(4)
                .toString("hex") + ".js"); };
        })();
        var out = getRandom();
        while (fs.existsSync(out)) {
            out = getRandom();
        }
        return out;
    })();
    fs.writeFileSync(random_file_path, Buffer.from([
        "console.log(\"__LOADED__\");",
        "process.title = \"crypto worker\";",
        "var __process_node= process;",
        source
    ].join("\n"), "utf8"));
    var childProcess = child_process.fork(random_file_path, [], { "silent": true });
    childProcess.stdout.once("data", function () { return fs.unlink(random_file_path, function () { }); });
    var evtResponse = new evt_1.Evt();
    childProcess.on("message", function (message) { return evtResponse.post(ThreadMessage_1.transfer.restore(message)); });
    return {
        evtResponse: evtResponse,
        "send": function (action) { return childProcess.send(ThreadMessage_1.transfer.prepare(action)); },
        "terminate": function () { return childProcess.kill(); }
    };
}
exports.spawn = spawn;

}).call(this,require("buffer").Buffer)
},{"../../sync/_worker_thread/ThreadMessage":8,"buffer":15,"evt":33,"path":70}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawn = void 0;
var evt_1 = require("evt");
var runTask_1 = require("./simulated/runTask");
function spawn(source) {
    var evtResponse = new evt_1.Evt();
    var actionListener;
    //@ts-ignore
    var __simulatedMainThreadApi = {
        "sendResponse": function (response) { return setTimeout(function () { return evtResponse.post(response); }, 0); },
        "setActionListener": function (actionListener_) { return actionListener = actionListener_; }
    };
    eval(source);
    return {
        evtResponse: evtResponse,
        "send": function (action) { return runTask_1.default(function () { return actionListener(action); }); },
        "terminate": function () { }
    };
}
exports.spawn = spawn;

},{"./simulated/runTask":4,"evt":33}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runTask = function (task) { return task(); };
exports.default = runTask;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawn = void 0;
var evt_1 = require("evt");
function spawn(source) {
    var evtResponse = new evt_1.Evt();
    var worker = new Worker(URL.createObjectURL(new Blob([source], { "type": 'text/javascript' })));
    worker.addEventListener("message", function (_a) {
        var data = _a.data;
        return evtResponse.post(data);
    });
    return {
        evtResponse: evtResponse,
        "send": function (action, transfer) {
            worker.postMessage(action, transfer || []);
        },
        "terminate": function () { return worker.terminate(); }
    };
}
exports.spawn = spawn;

},{"evt":33}],6:[function(require,module,exports){
(function (Buffer){
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
exports.scrypt = exports.rsa = exports.aes = exports.plain = exports.workerThreadPool = exports.preSpawnWorkerThread = exports.terminateWorkerThreads = exports.WorkerThreadId = exports.disableMultithreading = void 0;
var Map_1 = require("minimal-polyfills/Map");
var Set_1 = require("minimal-polyfills/Set");
require("minimal-polyfills/Array.from");
var runExclusive = require("run-exclusive");
var WorkerThread_1 = require("./WorkerThread");
var environnement_1 = require("../sync/utils/environnement");
var evt_1 = require("evt");
var bundle_source = (function () {
    
    var path = require("path");
    return Buffer("KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9ImZ1bmN0aW9uIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoIkNhbm5vdCBmaW5kIG1vZHVsZSAnIitpKyInIik7dGhyb3cgYS5jb2RlPSJNT0RVTEVfTk9UX0ZPVU5EIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9ImZ1bmN0aW9uIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oQnVmZmVyKXsidXNlIHN0cmljdCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIl9fZXNNb2R1bGUiLHt2YWx1ZTp0cnVlfSk7ZXhwb3J0cy50cmFuc2Zlcj12b2lkIDA7dmFyIGVudmlyb25uZW1lbnRfMT1yZXF1aXJlKCIuLi91dGlscy9lbnZpcm9ubmVtZW50Iik7dmFyIHRvQnVmZmVyXzE9cmVxdWlyZSgiLi4vdXRpbHMvdG9CdWZmZXIiKTt2YXIgdHJhbnNmZXI7KGZ1bmN0aW9uKHRyYW5zZmVyKXt2YXIgU2VyaWFsaXphYmxlVWludDhBcnJheTsoZnVuY3Rpb24oU2VyaWFsaXphYmxlVWludDhBcnJheSl7ZnVuY3Rpb24gbWF0Y2godmFsdWUpe3JldHVybiB2YWx1ZSBpbnN0YW5jZW9mIE9iamVjdCYmdmFsdWUudHlwZT09PSJVaW50OEFycmF5IiYmdHlwZW9mIHZhbHVlLmRhdGE9PT0ic3RyaW5nIn1TZXJpYWxpemFibGVVaW50OEFycmF5Lm1hdGNoPW1hdGNoO2Z1bmN0aW9uIGJ1aWxkKHZhbHVlKXtyZXR1cm57dHlwZToiVWludDhBcnJheSIsZGF0YTp0b0J1ZmZlcl8xLnRvQnVmZmVyKHZhbHVlKS50b1N0cmluZygiYmluYXJ5Iil9fVNlcmlhbGl6YWJsZVVpbnQ4QXJyYXkuYnVpbGQ9YnVpbGQ7ZnVuY3Rpb24gcmVzdG9yZSh2YWx1ZSl7cmV0dXJuIEJ1ZmZlci5mcm9tKHZhbHVlLmRhdGEsImJpbmFyeSIpfVNlcmlhbGl6YWJsZVVpbnQ4QXJyYXkucmVzdG9yZT1yZXN0b3JlfSkoU2VyaWFsaXphYmxlVWludDhBcnJheXx8KFNlcmlhbGl6YWJsZVVpbnQ4QXJyYXk9e30pKTtmdW5jdGlvbiBwcmVwYXJlKHRocmVhZE1lc3NhZ2Upe2lmKGVudmlyb25uZW1lbnRfMS5lbnZpcm9ubmVtZW50LnR5cGUhPT0iTk9ERSIpe3Rocm93IG5ldyBFcnJvcigib25seSBmb3Igbm9kZSIpfXZhciBtZXNzYWdlPWZ1bmN0aW9uKCl7aWYodGhyZWFkTWVzc2FnZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpe3JldHVybiBTZXJpYWxpemFibGVVaW50OEFycmF5LmJ1aWxkKHRocmVhZE1lc3NhZ2UpfWVsc2UgaWYodGhyZWFkTWVzc2FnZSBpbnN0YW5jZW9mIEFycmF5KXtyZXR1cm4gdGhyZWFkTWVzc2FnZS5tYXAoZnVuY3Rpb24oZW50cnkpe3JldHVybiBwcmVwYXJlKGVudHJ5KX0pfWVsc2UgaWYodGhyZWFkTWVzc2FnZSBpbnN0YW5jZW9mIE9iamVjdCl7dmFyIG91dD17fTtmb3IodmFyIGtleSBpbiB0aHJlYWRNZXNzYWdlKXtvdXRba2V5XT1wcmVwYXJlKHRocmVhZE1lc3NhZ2Vba2V5XSl9cmV0dXJuIG91dH1lbHNle3JldHVybiB0aHJlYWRNZXNzYWdlfX0oKTtyZXR1cm4gbWVzc2FnZX10cmFuc2Zlci5wcmVwYXJlPXByZXBhcmU7ZnVuY3Rpb24gcmVzdG9yZShtZXNzYWdlKXtpZihlbnZpcm9ubmVtZW50XzEuZW52aXJvbm5lbWVudC50eXBlIT09Ik5PREUiKXt0aHJvdyBuZXcgRXJyb3IoIm9ubHkgZm9yIG5vZGUiKX12YXIgdGhyZWFkTWVzc2FnZT1mdW5jdGlvbigpe2lmKFNlcmlhbGl6YWJsZVVpbnQ4QXJyYXkubWF0Y2gobWVzc2FnZSkpe3JldHVybiBTZXJpYWxpemFibGVVaW50OEFycmF5LnJlc3RvcmUobWVzc2FnZSl9ZWxzZSBpZihtZXNzYWdlIGluc3RhbmNlb2YgQXJyYXkpe3JldHVybiBtZXNzYWdlLm1hcChmdW5jdGlvbihlbnRyeSl7cmV0dXJuIHJlc3RvcmUoZW50cnkpfSl9ZWxzZSBpZihtZXNzYWdlIGluc3RhbmNlb2YgT2JqZWN0KXt2YXIgb3V0PXt9O2Zvcih2YXIga2V5IGluIG1lc3NhZ2Upe291dFtrZXldPXJlc3RvcmUobWVzc2FnZVtrZXldKX1yZXR1cm4gb3V0fWVsc2V7cmV0dXJuIG1lc3NhZ2V9fSgpO3JldHVybiB0aHJlYWRNZXNzYWdlfXRyYW5zZmVyLnJlc3RvcmU9cmVzdG9yZX0pKHRyYW5zZmVyPWV4cG9ydHMudHJhbnNmZXJ8fChleHBvcnRzLnRyYW5zZmVyPXt9KSl9KS5jYWxsKHRoaXMscmVxdWlyZSgiYnVmZmVyIikuQnVmZmVyKX0seyIuLi91dGlscy9lbnZpcm9ubmVtZW50IjoxMCwiLi4vdXRpbHMvdG9CdWZmZXIiOjEyLGJ1ZmZlcjoyN31dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyJ1c2Ugc3RyaWN0Ijt2YXIgX19zcHJlYWRBcnJheXM9dGhpcyYmdGhpcy5fX3NwcmVhZEFycmF5c3x8ZnVuY3Rpb24oKXtmb3IodmFyIHM9MCxpPTAsaWw9YXJndW1lbnRzLmxlbmd0aDtpPGlsO2krKylzKz1hcmd1bWVudHNbaV0ubGVuZ3RoO2Zvcih2YXIgcj1BcnJheShzKSxrPTAsaT0wO2k8aWw7aSsrKWZvcih2YXIgYT1hcmd1bWVudHNbaV0saj0wLGpsPWEubGVuZ3RoO2o8amw7aisrLGsrKylyW2tdPWFbal07cmV0dXJuIHJ9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCJfX2VzTW9kdWxlIix7dmFsdWU6dHJ1ZX0pO3JlcXVpcmUoIm1pbmltYWwtcG9seWZpbGxzL0FycmF5QnVmZmVyLmlzVmlldyIpO3ZhciBNYXBfMT1yZXF1aXJlKCJtaW5pbWFsLXBvbHlmaWxscy9NYXAiKTt2YXIgY3J5cHRvTGliPXJlcXVpcmUoIi4uL2luZGV4Iik7dmFyIGVudmlyb25uZW1lbnRfMT1yZXF1aXJlKCIuLi91dGlscy9lbnZpcm9ubmVtZW50Iik7dmFyIFRocmVhZE1lc3NhZ2VfMT1yZXF1aXJlKCIuL1RocmVhZE1lc3NhZ2UiKTtpZihmdW5jdGlvbigpe2lmKHR5cGVvZiBfX3NpbXVsYXRlZE1haW5UaHJlYWRBcGkhPT0idW5kZWZpbmVkIil7cmV0dXJuIGZhbHNlfXZhciBpc01haW5UaGVhZD1lbnZpcm9ubmVtZW50XzEuZW52aXJvbm5lbWVudC5pc01haW5UaHJlYWQhPT11bmRlZmluZWQ/ZW52aXJvbm5lbWVudF8xLmVudmlyb25uZW1lbnQuaXNNYWluVGhyZWFkOnR5cGVvZiBfX3Byb2Nlc3Nfbm9kZT09PSJ1bmRlZmluZWQiO3JldHVybiBpc01haW5UaGVhZH0oKSl7X19jcnlwdG9MaWI9Y3J5cHRvTGlifWVsc2V7dmFyIG1haW5UaHJlYWRBcGlfMT10eXBlb2YgX19zaW11bGF0ZWRNYWluVGhyZWFkQXBpIT09InVuZGVmaW5lZCI/X19zaW11bGF0ZWRNYWluVGhyZWFkQXBpOnR5cGVvZiBfX3Byb2Nlc3Nfbm9kZT09PSJ1bmRlZmluZWQiP3tzZW5kUmVzcG9uc2U6c2VsZi5wb3N0TWVzc2FnZS5iaW5kKHNlbGYpLHNldEFjdGlvbkxpc3RlbmVyOmZ1bmN0aW9uKGFjdGlvbkxpc3RlbmVyKXtyZXR1cm4gYWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsZnVuY3Rpb24oX2Epe3ZhciBkYXRhPV9hLmRhdGE7cmV0dXJuIGFjdGlvbkxpc3RlbmVyKGRhdGEpfSl9fTp7c2VuZFJlc3BvbnNlOmZ1bmN0aW9uKHJlc3BvbnNlKXtyZXR1cm4gX19wcm9jZXNzX25vZGUuc2VuZChUaHJlYWRNZXNzYWdlXzEudHJhbnNmZXIucHJlcGFyZShyZXNwb25zZSkpfSxzZXRBY3Rpb25MaXN0ZW5lcjpmdW5jdGlvbihhY3Rpb25MaXN0ZW5lcil7cmV0dXJuIF9fcHJvY2Vzc19ub2RlLm9uKCJtZXNzYWdlIixmdW5jdGlvbihtZXNzYWdlKXtyZXR1cm4gYWN0aW9uTGlzdGVuZXIoVGhyZWFkTWVzc2FnZV8xLnRyYW5zZmVyLnJlc3RvcmUobWVzc2FnZSkpfSl9fTt2YXIgY2lwaGVySW5zdGFuY2VzXzE9bmV3IE1hcF8xLlBvbHlmaWxsO21haW5UaHJlYWRBcGlfMS5zZXRBY3Rpb25MaXN0ZW5lcihmdW5jdGlvbihhY3Rpb24pe3ZhciBfYSxfYjtzd2l0Y2goYWN0aW9uLmFjdGlvbil7Y2FzZSJHZW5lcmF0ZVJzYUtleXMiOm1haW5UaHJlYWRBcGlfMS5zZW5kUmVzcG9uc2UoZnVuY3Rpb24oKXt2YXIgX2E7dmFyIHJlc3BvbnNlPXthY3Rpb25JZDphY3Rpb24uYWN0aW9uSWQsb3V0cHV0czooX2E9Y3J5cHRvTGliLnJzYSkuc3luY0dlbmVyYXRlS2V5cy5hcHBseShfYSxhY3Rpb24ucGFyYW1zKX07cmV0dXJuIHJlc3BvbnNlfSgpKTticmVhaztjYXNlIkNpcGhlckZhY3RvcnkiOmNpcGhlckluc3RhbmNlc18xLnNldChhY3Rpb24uY2lwaGVySW5zdGFuY2VSZWYsKF9hPWNyeXB0b0xpYlthY3Rpb24uY2lwaGVyTmFtZV0pW2Z1bmN0aW9uKCl7c3dpdGNoKGFjdGlvbi5jb21wb25lbnRzKXtjYXNlIkRlY3J5cHRvciI6cmV0dXJuInN5bmNEZWNyeXB0b3JGYWN0b3J5IjtjYXNlIkVuY3J5cHRvciI6cmV0dXJuInN5bmNFbmNyeXB0b3JGYWN0b3J5IjtjYXNlIkVuY3J5cHRvckRlY3J5cHRvciI6cmV0dXJuInN5bmNFbmNyeXB0b3JEZWNyeXB0b3JGYWN0b3J5In19KCldLmFwcGx5KF9hLGFjdGlvbi5wYXJhbXMpKTticmVhaztjYXNlIkVuY3J5cHRPckRlY3J5cHQiOnt2YXIgb3V0cHV0XzE9Y2lwaGVySW5zdGFuY2VzXzEuZ2V0KGFjdGlvbi5jaXBoZXJJbnN0YW5jZVJlZilbYWN0aW9uLm1ldGhvZF0oYWN0aW9uLmlucHV0KTttYWluVGhyZWFkQXBpXzEuc2VuZFJlc3BvbnNlKGZ1bmN0aW9uKCl7dmFyIHJlc3BvbnNlPXthY3Rpb25JZDphY3Rpb24uYWN0aW9uSWQsb3V0cHV0Om91dHB1dF8xfTtyZXR1cm4gcmVzcG9uc2V9KCksW291dHB1dF8xLmJ1ZmZlcl0pfWJyZWFrO2Nhc2UiU2NyeXB0SGFzaCI6e3ZhciBkaWdlc3RfMT0oX2I9Y3J5cHRvTGliLnNjcnlwdCkuc3luY0hhc2guYXBwbHkoX2IsX19zcHJlYWRBcnJheXMoYWN0aW9uLnBhcmFtcyxbZnVuY3Rpb24ocGVyY2VudCl7cmV0dXJuIG1haW5UaHJlYWRBcGlfMS5zZW5kUmVzcG9uc2UoZnVuY3Rpb24oKXt2YXIgcmVzcG9uc2U9e2FjdGlvbklkOmFjdGlvbi5hY3Rpb25JZCxwZXJjZW50OnBlcmNlbnR9O3JldHVybiByZXNwb25zZX0oKSl9XSkpO21haW5UaHJlYWRBcGlfMS5zZW5kUmVzcG9uc2UoZnVuY3Rpb24oKXt2YXIgcmVzcG9uc2U9e2FjdGlvbklkOmFjdGlvbi5hY3Rpb25JZCxkaWdlc3Q6ZGlnZXN0XzF9O3JldHVybiByZXNwb25zZX0oKSxbZGlnZXN0XzEuYnVmZmVyXSl9YnJlYWt9fSl9fSx7Ii4uL2luZGV4Ijo2LCIuLi91dGlscy9lbnZpcm9ubmVtZW50IjoxMCwiLi9UaHJlYWRNZXNzYWdlIjoxLCJtaW5pbWFsLXBvbHlmaWxscy9BcnJheUJ1ZmZlci5pc1ZpZXciOjQwLCJtaW5pbWFsLXBvbHlmaWxscy9NYXAiOjQxfV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCJfX2VzTW9kdWxlIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMuZ2V0VGVzdEtleT1leHBvcnRzLmdlbmVyYXRlS2V5PWV4cG9ydHMuc3luY0VuY3J5cHRvckRlY3J5cHRvckZhY3Rvcnk9dm9pZCAwO3ZhciBhZXNqcz1yZXF1aXJlKCJhZXMtanMiKTt2YXIgcmFuZG9tQnl0ZXNfMT1yZXF1aXJlKCIuLi91dGlscy9yYW5kb21CeXRlcyIpO3ZhciBiaW5hcnlEYXRhTWFuaXB1bGF0aW9uc18xPXJlcXVpcmUoIi4uL3V0aWxzL2JpbmFyeURhdGFNYW5pcHVsYXRpb25zIik7ZnVuY3Rpb24gc3luY0VuY3J5cHRvckRlY3J5cHRvckZhY3Rvcnkoa2V5KXtyZXR1cm57ZW5jcnlwdDpmdW5jdGlvbigpe3ZhciBnZXRJdj1mdW5jdGlvbigpe3ZhciBpdjA9cmFuZG9tQnl0ZXNfMS5yYW5kb21CeXRlcygxNik7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGJpbmFyeURhdGFNYW5pcHVsYXRpb25zXzEubGVmdFNoaWZ0KGl2MCl9fSgpO3JldHVybiBmdW5jdGlvbihwbGFpbkRhdGEpe3ZhciBpdj1nZXRJdigpO3ZhciBvcmlnaW5hbExlbmd0aEFzQnl0ZT1iaW5hcnlEYXRhTWFuaXB1bGF0aW9uc18xLmFkZFBhZGRpbmcoIkxFRlQiLGJpbmFyeURhdGFNYW5pcHVsYXRpb25zXzEubnVtYmVyVG9VaW50OEFycmF5KHBsYWluRGF0YS5sZW5ndGgpLDQpO3ZhciBwbGFpbkRhdGFNdWx0aXBsZU9mMTZCeXRlcz1iaW5hcnlEYXRhTWFuaXB1bGF0aW9uc18xLmFkZFBhZGRpbmcoIlJJR0hUIixwbGFpbkRhdGEscGxhaW5EYXRhLmxlbmd0aCsoMTYtcGxhaW5EYXRhLmxlbmd0aCUxNikpO3ZhciBlbmNyeXB0ZWREYXRhUGF5bG9hZD1uZXcgYWVzanMuTW9kZU9mT3BlcmF0aW9uLmNiYyhrZXksaXYpLmVuY3J5cHQocGxhaW5EYXRhTXVsdGlwbGVPZjE2Qnl0ZXMpO3JldHVybiBiaW5hcnlEYXRhTWFuaXB1bGF0aW9uc18xLmNvbmNhdFVpbnQ4QXJyYXkoaXYsb3JpZ2luYWxMZW5ndGhBc0J5dGUsZW5jcnlwdGVkRGF0YVBheWxvYWQpfX0oKSxkZWNyeXB0OmZ1bmN0aW9uKGVuY3J5cHRlZERhdGEpe3ZhciBpdj1lbmNyeXB0ZWREYXRhLnNsaWNlKDAsMTYpO3ZhciBvcmlnaW5hbExlbmd0aEFzQnl0ZT1lbmNyeXB0ZWREYXRhLnNsaWNlKDE2LDE2KzQpO3ZhciBvcmlnaW5hbExlbmd0aD1iaW5hcnlEYXRhTWFuaXB1bGF0aW9uc18xLnVpbnQ4QXJyYXlUb051bWJlcihvcmlnaW5hbExlbmd0aEFzQnl0ZSk7cmV0dXJuIG5ldyBhZXNqcy5Nb2RlT2ZPcGVyYXRpb24uY2JjKGtleSxpdikuZGVjcnlwdChlbmNyeXB0ZWREYXRhLnNsaWNlKDE2KzQpKS5zbGljZSgwLG9yaWdpbmFsTGVuZ3RoKX19fWV4cG9ydHMuc3luY0VuY3J5cHRvckRlY3J5cHRvckZhY3Rvcnk9c3luY0VuY3J5cHRvckRlY3J5cHRvckZhY3Rvcnk7ZnVuY3Rpb24gZ2VuZXJhdGVLZXkoKXtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSxyZWplY3Qpe3JldHVybiByYW5kb21CeXRlc18xLnJhbmRvbUJ5dGVzKDMyLGZ1bmN0aW9uKGVycixidWYpe2lmKCEhZXJyKXtyZWplY3QoZXJyKX1lbHNle3Jlc29sdmUoYnVmKX19KX0pfWV4cG9ydHMuZ2VuZXJhdGVLZXk9Z2VuZXJhdGVLZXk7ZnVuY3Rpb24gZ2V0VGVzdEtleSgpe3JldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFVpbnQ4QXJyYXkoWzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzFdKSl9ZXhwb3J0cy5nZXRUZXN0S2V5PWdldFRlc3RLZXl9LHsiLi4vdXRpbHMvYmluYXJ5RGF0YU1hbmlwdWxhdGlvbnMiOjksIi4uL3V0aWxzL3JhbmRvbUJ5dGVzIjoxMSwiYWVzLWpzIjoxM31dLDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyJ1c2Ugc3RyaWN0IjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywiX19lc01vZHVsZSIse3ZhbHVlOnRydWV9KTtleHBvcnRzLnN5bmNFbmNyeXB0b3JEZWNyeXB0b3JGYWN0b3J5PXZvaWQgMDtmdW5jdGlvbiBzeW5jRW5jcnlwdG9yRGVjcnlwdG9yRmFjdG9yeSgpe3JldHVybntlbmNyeXB0OmZ1bmN0aW9uKHBsYWluRGF0YSl7cmV0dXJuIHBsYWluRGF0YX0sZGVjcnlwdDpmdW5jdGlvbihlbmNyeXB0ZWREYXRhKXtyZXR1cm4gZW5jcnlwdGVkRGF0YX19fWV4cG9ydHMuc3luY0VuY3J5cHRvckRlY3J5cHRvckZhY3Rvcnk9c3luY0VuY3J5cHRvckRlY3J5cHRvckZhY3Rvcnl9LHt9XSw1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oQnVmZmVyKXsidXNlIHN0cmljdCI7dmFyIF9fYXNzaWduPXRoaXMmJnRoaXMuX19hc3NpZ258fGZ1bmN0aW9uKCl7X19hc3NpZ249T2JqZWN0LmFzc2lnbnx8ZnVuY3Rpb24odCl7Zm9yKHZhciBzLGk9MSxuPWFyZ3VtZW50cy5sZW5ndGg7aTxuO2krKyl7cz1hcmd1bWVudHNbaV07Zm9yKHZhciBwIGluIHMpaWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMscCkpdFtwXT1zW3BdfXJldHVybiB0fTtyZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcyxhcmd1bWVudHMpfTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywiX19lc01vZHVsZSIse3ZhbHVlOnRydWV9KTtleHBvcnRzLnN5bmNHZW5lcmF0ZUtleXM9ZXhwb3J0cy5zeW5jRW5jcnlwdG9yRGVjcnlwdG9yRmFjdG9yeT1leHBvcnRzLnN5bmNEZWNyeXB0b3JGYWN0b3J5PWV4cG9ydHMuc3luY0VuY3J5cHRvckZhY3Rvcnk9dm9pZCAwO3ZhciB0eXBlc18xPXJlcXVpcmUoIi4uL3R5cGVzIik7dmFyIE5vZGVSU0E9cmVxdWlyZSgibm9kZS1yc2EiKTt2YXIgZW52aXJvbm5lbWVudF8xPXJlcXVpcmUoIi4uL3V0aWxzL2Vudmlyb25uZW1lbnQiKTt2YXIgdG9CdWZmZXJfMT1yZXF1aXJlKCIuLi91dGlscy90b0J1ZmZlciIpO3ZhciB0YXJnZXRlZEVudmlyb25uZW1lbnQ9ZW52aXJvbm5lbWVudF8xLmVudmlyb25uZW1lbnQudHlwZT09PSJOT0RFIj8ibm9kZSI6ImJyb3dzZXIiO3ZhciBuZXdOb2RlUlNBPWZ1bmN0aW9uKGtleSl7cmV0dXJuIG5ldyBOb2RlUlNBKEJ1ZmZlci5mcm9tKGtleS5kYXRhKSxrZXkuZm9ybWF0LHtlbnZpcm9ubWVudDp0YXJnZXRlZEVudmlyb25uZW1lbnR9KX07ZnVuY3Rpb24gc3luY0VuY3J5cHRvckZhY3RvcnkoZW5jcnlwdEtleSl7cmV0dXJue2VuY3J5cHQ6ZnVuY3Rpb24oKXt2YXIgZW5jcnlwdE5vZGVSU0E9bmV3Tm9kZVJTQShlbmNyeXB0S2V5KTt2YXIgZW5jcnlwdE1ldGhvZD10eXBlc18xLlJzYUtleS5Qcml2YXRlLm1hdGNoKGVuY3J5cHRLZXkpPyJlbmNyeXB0UHJpdmF0ZSI6ImVuY3J5cHQiO3JldHVybiBmdW5jdGlvbihwbGFpbkRhdGEpe3JldHVybiBlbmNyeXB0Tm9kZVJTQVtlbmNyeXB0TWV0aG9kXSh0b0J1ZmZlcl8xLnRvQnVmZmVyKHBsYWluRGF0YSkpfX0oKX19ZXhwb3J0cy5zeW5jRW5jcnlwdG9yRmFjdG9yeT1zeW5jRW5jcnlwdG9yRmFjdG9yeTtmdW5jdGlvbiBzeW5jRGVjcnlwdG9yRmFjdG9yeShkZWNyeXB0S2V5KXtyZXR1cm57ZGVjcnlwdDpmdW5jdGlvbigpe3ZhciBkZWNyeXB0Tm9kZVJTQT1uZXdOb2RlUlNBKGRlY3J5cHRLZXkpO3ZhciBkZWNyeXB0TWV0aG9kPXR5cGVzXzEuUnNhS2V5LlB1YmxpYy5tYXRjaChkZWNyeXB0S2V5KT8iZGVjcnlwdFB1YmxpYyI6ImRlY3J5cHQiO3JldHVybiBmdW5jdGlvbihlbmNyeXB0ZWREYXRhKXtyZXR1cm4gZGVjcnlwdE5vZGVSU0FbZGVjcnlwdE1ldGhvZF0odG9CdWZmZXJfMS50b0J1ZmZlcihlbmNyeXB0ZWREYXRhKSl9fSgpfX1leHBvcnRzLnN5bmNEZWNyeXB0b3JGYWN0b3J5PXN5bmNEZWNyeXB0b3JGYWN0b3J5O2Z1bmN0aW9uIHN5bmNFbmNyeXB0b3JEZWNyeXB0b3JGYWN0b3J5KGVuY3J5cHRLZXksZGVjcnlwdEtleSl7cmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LHN5bmNFbmNyeXB0b3JGYWN0b3J5KGVuY3J5cHRLZXkpKSxzeW5jRGVjcnlwdG9yRmFjdG9yeShkZWNyeXB0S2V5KSl9ZXhwb3J0cy5zeW5jRW5jcnlwdG9yRGVjcnlwdG9yRmFjdG9yeT1zeW5jRW5jcnlwdG9yRGVjcnlwdG9yRmFjdG9yeTtmdW5jdGlvbiBzeW5jR2VuZXJhdGVLZXlzKHNlZWQsa2V5c0xlbmd0aEJ5dGVzKXtpZihrZXlzTGVuZ3RoQnl0ZXM9PT12b2lkIDApe2tleXNMZW5ndGhCeXRlcz04MH12YXIgbm9kZVJTQT1Ob2RlUlNBLmdlbmVyYXRlS2V5UGFpckZyb21TZWVkKHNlZWQsOCprZXlzTGVuZ3RoQnl0ZXMsdW5kZWZpbmVkLHRhcmdldGVkRW52aXJvbm5lbWVudCk7ZnVuY3Rpb24gYnVpbGRLZXkoZm9ybWF0KXtyZXR1cm57Zm9ybWF0OmZvcm1hdCxkYXRhOm5vZGVSU0EuZXhwb3J0S2V5KGZvcm1hdCl9fXJldHVybntwdWJsaWNLZXk6YnVpbGRLZXkoInBrY3MxLXB1YmxpYy1kZXIiKSxwcml2YXRlS2V5OmJ1aWxkS2V5KCJwa2NzMS1wcml2YXRlLWRlciIpfX1leHBvcnRzLnN5bmNHZW5lcmF0ZUtleXM9c3luY0dlbmVyYXRlS2V5c30pLmNhbGwodGhpcyxyZXF1aXJlKCJidWZmZXIiKS5CdWZmZXIpfSx7Ii4uL3R5cGVzIjo4LCIuLi91dGlscy9lbnZpcm9ubmVtZW50IjoxMCwiLi4vdXRpbHMvdG9CdWZmZXIiOjEyLGJ1ZmZlcjoyNywibm9kZS1yc2EiOjQyfV0sNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO3ZhciBfX2NyZWF0ZUJpbmRpbmc9dGhpcyYmdGhpcy5fX2NyZWF0ZUJpbmRpbmd8fChPYmplY3QuY3JlYXRlP2Z1bmN0aW9uKG8sbSxrLGsyKXtpZihrMj09PXVuZGVmaW5lZClrMj1rO09iamVjdC5kZWZpbmVQcm9wZXJ0eShvLGsyLHtlbnVtZXJhYmxlOnRydWUsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIG1ba119fSl9OmZ1bmN0aW9uKG8sbSxrLGsyKXtpZihrMj09PXVuZGVmaW5lZClrMj1rO29bazJdPW1ba119KTt2YXIgX19leHBvcnRTdGFyPXRoaXMmJnRoaXMuX19leHBvcnRTdGFyfHxmdW5jdGlvbihtLGV4cG9ydHMpe2Zvcih2YXIgcCBpbiBtKWlmKHAhPT0iZGVmYXVsdCImJiFleHBvcnRzLmhhc093blByb3BlcnR5KHApKV9fY3JlYXRlQmluZGluZyhleHBvcnRzLG0scCl9O09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCJfX2VzTW9kdWxlIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMucGxhaW49ZXhwb3J0cy5yc2E9ZXhwb3J0cy5hZXM9ZXhwb3J0cy5zY3J5cHQ9dm9pZCAwO19fZXhwb3J0U3RhcihyZXF1aXJlKCIuL3R5cGVzIiksZXhwb3J0cyk7dmFyIHNjcnlwdD1yZXF1aXJlKCIuL3NjcnlwdCIpO2V4cG9ydHMuc2NyeXB0PXNjcnlwdDt2YXIgYWVzPXJlcXVpcmUoIi4vY2lwaGVyL2FlcyIpO2V4cG9ydHMuYWVzPWFlczt2YXIgcnNhPXJlcXVpcmUoIi4vY2lwaGVyL3JzYSIpO2V4cG9ydHMucnNhPXJzYTt2YXIgcGxhaW49cmVxdWlyZSgiLi9jaXBoZXIvcGxhaW4iKTtleHBvcnRzLnBsYWluPXBsYWlufSx7Ii4vY2lwaGVyL2FlcyI6MywiLi9jaXBoZXIvcGxhaW4iOjQsIi4vY2lwaGVyL3JzYSI6NSwiLi9zY3J5cHQiOjcsIi4vdHlwZXMiOjh9XSw3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsidXNlIHN0cmljdCI7dmFyIF9fYXNzaWduPXRoaXMmJnRoaXMuX19hc3NpZ258fGZ1bmN0aW9uKCl7X19hc3NpZ249T2JqZWN0LmFzc2lnbnx8ZnVuY3Rpb24odCl7Zm9yKHZhciBzLGk9MSxuPWFyZ3VtZW50cy5sZW5ndGg7aTxuO2krKyl7cz1hcmd1bWVudHNbaV07Zm9yKHZhciBwIGluIHMpaWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMscCkpdFtwXT1zW3BdfXJldHVybiB0fTtyZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcyxhcmd1bWVudHMpfTtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywiX19lc01vZHVsZSIse3ZhbHVlOnRydWV9KTtleHBvcnRzLnN5bmNIYXNoPWV4cG9ydHMuZGVmYXVsdFBhcmFtcz12b2lkIDA7dmFyIHNjcnlwdHN5PXJlcXVpcmUoInNjcnlwdHN5Iik7ZXhwb3J0cy5kZWZhdWx0UGFyYW1zPXtuOjEzLHI6OCxwOjEsZGlnZXN0TGVuZ3RoQnl0ZXM6MjU0fTtmdW5jdGlvbiBzeW5jSGFzaCh0ZXh0LHNhbHQscGFyYW1zLHByb2dyZXNzKXtpZihwYXJhbXM9PT12b2lkIDApe3BhcmFtcz17fX12YXIgX2E9ZnVuY3Rpb24oKXt2YXIgb3V0PV9fYXNzaWduKHt9LGV4cG9ydHMuZGVmYXVsdFBhcmFtcyk7T2JqZWN0LmtleXMocGFyYW1zKS5maWx0ZXIoZnVuY3Rpb24oa2V5KXtyZXR1cm4gcGFyYW1zW2tleV0hPT11bmRlZmluZWR9KS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7cmV0dXJuIG91dFtrZXldPXBhcmFtc1trZXldfSk7cmV0dXJuIG91dH0oKSxuPV9hLm4scj1fYS5yLHA9X2EucCxkaWdlc3RMZW5ndGhCeXRlcz1fYS5kaWdlc3RMZW5ndGhCeXRlcztyZXR1cm4gc2NyeXB0c3kodGV4dCxzYWx0LE1hdGgucG93KDIsbikscixwLGRpZ2VzdExlbmd0aEJ5dGVzLHByb2dyZXNzIT09dW5kZWZpbmVkP2Z1bmN0aW9uKF9hKXt2YXIgcGVyY2VudD1fYS5wZXJjZW50O3JldHVybiBwcm9ncmVzcyhwZXJjZW50KX06dW5kZWZpbmVkKX1leHBvcnRzLnN5bmNIYXNoPXN5bmNIYXNofSx7c2NyeXB0c3k6ODV9XSw4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oQnVmZmVyKXsidXNlIHN0cmljdCI7T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIl9fZXNNb2R1bGUiLHt2YWx1ZTp0cnVlfSk7ZXhwb3J0cy5Sc2FLZXk9dm9pZCAwO3ZhciB0b0J1ZmZlcl8xPXJlcXVpcmUoIi4vdXRpbHMvdG9CdWZmZXIiKTt2YXIgUnNhS2V5OyhmdW5jdGlvbihSc2FLZXkpe2Z1bmN0aW9uIHN0cmluZ2lmeShyc2FLZXkpe3JldHVybiBKU09OLnN0cmluZ2lmeShbcnNhS2V5LmZvcm1hdCx0b0J1ZmZlcl8xLnRvQnVmZmVyKHJzYUtleS5kYXRhKS50b1N0cmluZygiYmFzZTY0IildKX1Sc2FLZXkuc3RyaW5naWZ5PXN0cmluZ2lmeTtmdW5jdGlvbiBwYXJzZShzdHJpbmdpZmllZFJzYUtleSl7dmFyIF9hPUpTT04ucGFyc2Uoc3RyaW5naWZpZWRSc2FLZXkpLGZvcm1hdD1fYVswXSxzdHJEYXRhPV9hWzFdO3JldHVybntmb3JtYXQ6Zm9ybWF0LGRhdGE6bmV3IFVpbnQ4QXJyYXkoQnVmZmVyLmZyb20oc3RyRGF0YSwiYmFzZTY0IikpfX1Sc2FLZXkucGFyc2U9cGFyc2U7dmFyIFB1YmxpYzsoZnVuY3Rpb24oUHVibGljKXtmdW5jdGlvbiBtYXRjaChyc2FLZXkpe3JldHVybiByc2FLZXkuZm9ybWF0PT09InBrY3MxLXB1YmxpYy1kZXIifVB1YmxpYy5tYXRjaD1tYXRjaH0pKFB1YmxpYz1Sc2FLZXkuUHVibGljfHwoUnNhS2V5LlB1YmxpYz17fSkpO3ZhciBQcml2YXRlOyhmdW5jdGlvbihQcml2YXRlKXtmdW5jdGlvbiBtYXRjaChyc2FLZXkpe3JldHVybiByc2FLZXkuZm9ybWF0PT09InBrY3MxLXByaXZhdGUtZGVyIn1Qcml2YXRlLm1hdGNoPW1hdGNofSkoUHJpdmF0ZT1Sc2FLZXkuUHJpdmF0ZXx8KFJzYUtleS5Qcml2YXRlPXt9KSl9KShSc2FLZXk9ZXhwb3J0cy5Sc2FLZXl8fChleHBvcnRzLlJzYUtleT17fSkpfSkuY2FsbCh0aGlzLHJlcXVpcmUoImJ1ZmZlciIpLkJ1ZmZlcil9LHsiLi91dGlscy90b0J1ZmZlciI6MTIsYnVmZmVyOjI3fV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO3ZhciBfX3NwcmVhZEFycmF5cz10aGlzJiZ0aGlzLl9fc3ByZWFkQXJyYXlzfHxmdW5jdGlvbigpe2Zvcih2YXIgcz0wLGk9MCxpbD1hcmd1bWVudHMubGVuZ3RoO2k8aWw7aSsrKXMrPWFyZ3VtZW50c1tpXS5sZW5ndGg7Zm9yKHZhciByPUFycmF5KHMpLGs9MCxpPTA7aTxpbDtpKyspZm9yKHZhciBhPWFyZ3VtZW50c1tpXSxqPTAsamw9YS5sZW5ndGg7ajxqbDtqKyssaysrKXJba109YVtqXTtyZXR1cm4gcn07T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIl9fZXNNb2R1bGUiLHt2YWx1ZTp0cnVlfSk7ZXhwb3J0cy5sZWZ0U2hpZnQ9ZXhwb3J0cy51aW50OEFycmF5VG9OdW1iZXI9ZXhwb3J0cy5udW1iZXJUb1VpbnQ4QXJyYXk9ZXhwb3J0cy5hZGRQYWRkaW5nPWV4cG9ydHMuY29uY2F0VWludDhBcnJheT12b2lkIDA7ZnVuY3Rpb24gY29uY2F0VWludDhBcnJheSgpe3ZhciB1aW50OEFycmF5cz1bXTtmb3IodmFyIF9pPTA7X2k8YXJndW1lbnRzLmxlbmd0aDtfaSsrKXt1aW50OEFycmF5c1tfaV09YXJndW1lbnRzW19pXX12YXIgb3V0PW5ldyBVaW50OEFycmF5KHVpbnQ4QXJyYXlzLm1hcChmdW5jdGlvbihfYSl7dmFyIGxlbmd0aD1fYS5sZW5ndGg7cmV0dXJuIGxlbmd0aH0pLnJlZHVjZShmdW5jdGlvbihwcmV2LGN1cnIpe3JldHVybiBwcmV2K2N1cnJ9LDApKTt2YXIgb2Zmc2V0PTA7Zm9yKHZhciBpPTA7aTx1aW50OEFycmF5cy5sZW5ndGg7aSsrKXt2YXIgdWludDhBcnJheT11aW50OEFycmF5c1tpXTtvdXQuc2V0KHVpbnQ4QXJyYXksb2Zmc2V0KTtvZmZzZXQrPXVpbnQ4QXJyYXkubGVuZ3RofXJldHVybiBvdXR9ZXhwb3J0cy5jb25jYXRVaW50OEFycmF5PWNvbmNhdFVpbnQ4QXJyYXk7ZnVuY3Rpb24gYWRkUGFkZGluZyhwb3NpdGlvbix1aW50OEFycmF5LHRhcmdldExlbmd0aEJ5dGVzKXt2YXIgcGFkZGluZ0J5dGVzPW5ldyBVaW50OEFycmF5KHRhcmdldExlbmd0aEJ5dGVzLXVpbnQ4QXJyYXkubGVuZ3RoKTtmb3IodmFyIGk9MDtpPHBhZGRpbmdCeXRlcy5sZW5ndGg7aSsrKXtwYWRkaW5nQnl0ZXNbaV09MH1yZXR1cm4gY29uY2F0VWludDhBcnJheS5hcHBseSh2b2lkIDAsZnVuY3Rpb24oKXtzd2l0Y2gocG9zaXRpb24pe2Nhc2UiTEVGVCI6cmV0dXJuW3BhZGRpbmdCeXRlcyx1aW50OEFycmF5XTtjYXNlIlJJR0hUIjpyZXR1cm5bdWludDhBcnJheSxwYWRkaW5nQnl0ZXNdfX0oKSl9ZXhwb3J0cy5hZGRQYWRkaW5nPWFkZFBhZGRpbmc7ZnVuY3Rpb24gbnVtYmVyVG9VaW50OEFycmF5KG4pe3ZhciBzdHI9bi50b1N0cmluZygxNik7dmFyIGFycj1bXTt2YXIgY3Vycj0iIjtmb3IodmFyIGk9c3RyLmxlbmd0aC0xO2k+PTA7aS0tKXtjdXJyPXN0cltpXStjdXJyO2lmKGN1cnIubGVuZ3RoPT09Mnx8aT09PTApe2Fycj1fX3NwcmVhZEFycmF5cyhbcGFyc2VJbnQoY3VyciwxNildLGFycik7Y3Vycj0iIn19cmV0dXJuIG5ldyBVaW50OEFycmF5KGFycil9ZXhwb3J0cy5udW1iZXJUb1VpbnQ4QXJyYXk9bnVtYmVyVG9VaW50OEFycmF5O2Z1bmN0aW9uIHVpbnQ4QXJyYXlUb051bWJlcih1aW50OEFycmF5KXt2YXIgbj0wO3ZhciBleHA9MDtmb3IodmFyIGk9dWludDhBcnJheS5sZW5ndGgtMTtpPj0wO2ktLSl7bis9dWludDhBcnJheVtpXSpNYXRoLnBvdygyNTYsZXhwKyspfXJldHVybiBufWV4cG9ydHMudWludDhBcnJheVRvTnVtYmVyPXVpbnQ4QXJyYXlUb051bWJlcjtmdW5jdGlvbiBsZWZ0U2hpZnQodWludDhBcnJheSl7dmFyIGM9dHJ1ZTtmb3IodmFyIGk9dWludDhBcnJheS5sZW5ndGgtMTtjJiZpPj0wO2ktLSl7aWYoKyt1aW50OEFycmF5W2ldIT09MjU2KXtjPWZhbHNlfX1yZXR1cm4gdWludDhBcnJheX1leHBvcnRzLmxlZnRTaGlmdD1sZWZ0U2hpZnR9LHt9XSwxMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCJfX2VzTW9kdWxlIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMuZW52aXJvbm5lbWVudD12b2lkIDA7ZXhwb3J0cy5lbnZpcm9ubmVtZW50PWZ1bmN0aW9uKCl7aWYodHlwZW9mIG5hdmlnYXRvciE9PSJ1bmRlZmluZWQiJiZuYXZpZ2F0b3IucHJvZHVjdD09PSJSZWFjdE5hdGl2ZSIpe3JldHVybnt0eXBlOiJSRUFDVCBOQVRJVkUiLGlzTWFpblRocmVhZDp0cnVlfX1pZih0eXBlb2Ygd2luZG93IT09InVuZGVmaW5lZCIpe3JldHVybnt0eXBlOiJCUk9XU0VSIixpc01haW5UaHJlYWQ6dHJ1ZX19aWYodHlwZW9mIHNlbGYhPT0idW5kZWZpbmVkIiYmISFzZWxmLnBvc3RNZXNzYWdlKXtyZXR1cm57dHlwZToiQlJPV1NFUiIsaXNNYWluVGhyZWFkOmZhbHNlfX12YXIgaXNOb2RlQ3J5cHRvQXZhaWxhYmxlPWZ1bmN0aW9uKCl7dHJ5e3JlcXVpcmUoImNyeXB0byIrIiIpfWNhdGNoKF9hKXtyZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9KCk7aWYoaXNOb2RlQ3J5cHRvQXZhaWxhYmxlKXtyZXR1cm57dHlwZToiTk9ERSIsaXNNYWluVGhyZWFkOnVuZGVmaW5lZH19cmV0dXJue3R5cGU6IkxJUVVJRCBDT1JFIixpc01haW5UaHJlYWQ6dHJ1ZX19KCl9LHt9XSwxMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKEJ1ZmZlcil7InVzZSBzdHJpY3QiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCJfX2VzTW9kdWxlIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMucmFuZG9tQnl0ZXM9dm9pZCAwO3ZhciBlbnZpcm9ubmVtZW50XzE9cmVxdWlyZSgiLi9lbnZpcm9ubmVtZW50Iik7ZnVuY3Rpb24gcmFuZG9tQnl0ZXMoc2l6ZSxjYWxsYmFjayl7dmFyIE1BWF9VSU5UMzI9cmFuZG9tQnl0ZXMuTUFYX1VJTlQzMixNQVhfQllURVM9cmFuZG9tQnl0ZXMuTUFYX0JZVEVTLGdldFJhbmRvbVZhbHVlcz1yYW5kb21CeXRlcy5nZXRSYW5kb21WYWx1ZXMsZ2V0Tm9kZVJhbmRvbUJ5dGVzPXJhbmRvbUJ5dGVzLmdldE5vZGVSYW5kb21CeXRlcztpZihlbnZpcm9ubmVtZW50XzEuZW52aXJvbm5lbWVudC50eXBlPT09Ik5PREUiKXt2YXIgdG9Mb2NhbEJ1ZmZlckltcGxlbWVudGF0aW9uXzE9ZnVuY3Rpb24obm9kZUJ1ZmZlckluc3Qpe3JldHVybiBCdWZmZXIuZnJvbShub2RlQnVmZmVySW5zdC5idWZmZXIsbm9kZUJ1ZmZlckluc3QuYnl0ZU9mZnNldCxub2RlQnVmZmVySW5zdC5sZW5ndGgpfTt2YXIgbm9kZVJhbmRvbUJ5dGVzPWdldE5vZGVSYW5kb21CeXRlcygpO2lmKGNhbGxiYWNrIT09dW5kZWZpbmVkKXtub2RlUmFuZG9tQnl0ZXMoc2l6ZSxmdW5jdGlvbihlcnIsYnVmKXtyZXR1cm4gY2FsbGJhY2soZXJyLCEhYnVmP3RvTG9jYWxCdWZmZXJJbXBsZW1lbnRhdGlvbl8xKGJ1Zik6YnVmKX0pO3JldHVybn12YXIgbm9kZUJ1ZmZlckluc3Q9bm9kZVJhbmRvbUJ5dGVzKHNpemUpO3JldHVybiB0b0xvY2FsQnVmZmVySW1wbGVtZW50YXRpb25fMShub2RlQnVmZmVySW5zdCl9aWYoc2l6ZT5NQVhfVUlOVDMyKXt0aHJvdyBuZXcgUmFuZ2VFcnJvcigicmVxdWVzdGVkIHRvbyBtYW55IHJhbmRvbSBieXRlcyIpfXZhciBieXRlcz1CdWZmZXIuYWxsb2NVbnNhZmUoc2l6ZSk7aWYoc2l6ZT4wKXtpZihzaXplPk1BWF9CWVRFUyl7Zm9yKHZhciBnZW5lcmF0ZWQ9MDtnZW5lcmF0ZWQ8c2l6ZTtnZW5lcmF0ZWQrPU1BWF9CWVRFUyl7Z2V0UmFuZG9tVmFsdWVzKGJ5dGVzLnNsaWNlKGdlbmVyYXRlZCxnZW5lcmF0ZWQrTUFYX0JZVEVTKSl9fWVsc2V7Z2V0UmFuZG9tVmFsdWVzKGJ5dGVzKX19aWYodHlwZW9mIGNhbGxiYWNrPT09ImZ1bmN0aW9uIil7c2V0VGltZW91dChmdW5jdGlvbigpe3JldHVybiBjYWxsYmFjayhudWxsLGJ5dGVzKX0sMCk7cmV0dXJufXJldHVybiBieXRlc31leHBvcnRzLnJhbmRvbUJ5dGVzPXJhbmRvbUJ5dGVzOyhmdW5jdGlvbihyYW5kb21CeXRlcyl7cmFuZG9tQnl0ZXMuTUFYX0JZVEVTPTY1NTM2O3JhbmRvbUJ5dGVzLk1BWF9VSU5UMzI9NDI5NDk2NzI5NTtyYW5kb21CeXRlcy5nZXRSYW5kb21WYWx1ZXM9ZnVuY3Rpb24oKXt2YXIgbm9uQ3J5cHRvZ3JhcGhpY0dldFJhbmRvbVZhbHVlPWZ1bmN0aW9uKGFidil7dmFyIGw9YWJ2Lmxlbmd0aDt3aGlsZShsLS0pe2FidltsXT1NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMjU2KX1yZXR1cm4gYWJ2fTt2YXIgYnJvd3NlckdldFJhbmRvbVZhbHVlcz1mdW5jdGlvbigpe2lmKHR5cGVvZiBjcnlwdG89PT0ib2JqZWN0IiYmISFjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKXtyZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0byl9ZWxzZSBpZih0eXBlb2YgbXNDcnlwdG89PT0ib2JqZWN0IiYmISFtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMpe3JldHVybiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChtc0NyeXB0byl9ZWxzZSBpZih0eXBlb2Ygc2VsZj09PSJvYmplY3QiJiZ0eXBlb2Ygc2VsZi5jcnlwdG89PT0ib2JqZWN0IiYmISFzZWxmLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMpe3JldHVybiBzZWxmLmNyeXB0by5nZXRSYW5kb21WYWx1ZXMuYmluZChzZWxmLmNyeXB0byl9ZWxzZXtyZXR1cm4gdW5kZWZpbmVkfX0oKTtyZXR1cm4hIWJyb3dzZXJHZXRSYW5kb21WYWx1ZXM/YnJvd3NlckdldFJhbmRvbVZhbHVlczpub25DcnlwdG9ncmFwaGljR2V0UmFuZG9tVmFsdWV9KCk7cmFuZG9tQnl0ZXMuZ2V0Tm9kZVJhbmRvbUJ5dGVzPWZ1bmN0aW9uKCl7dmFyIG5vZGVSYW5kb21CeXRlcz11bmRlZmluZWQ7cmV0dXJuIGZ1bmN0aW9uKCl7aWYobm9kZVJhbmRvbUJ5dGVzPT09dW5kZWZpbmVkKXtub2RlUmFuZG9tQnl0ZXM9cmVxdWlyZSgiY3J5cHRvIisiIikucmFuZG9tQnl0ZXN9cmV0dXJuIG5vZGVSYW5kb21CeXRlc319KCl9KShyYW5kb21CeXRlcz1leHBvcnRzLnJhbmRvbUJ5dGVzfHwoZXhwb3J0cy5yYW5kb21CeXRlcz17fSkpfSkuY2FsbCh0aGlzLHJlcXVpcmUoImJ1ZmZlciIpLkJ1ZmZlcil9LHsiLi9lbnZpcm9ubmVtZW50IjoxMCxidWZmZXI6Mjd9XSwxMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKEJ1ZmZlcil7InVzZSBzdHJpY3QiO09iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCJfX2VzTW9kdWxlIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMudG9CdWZmZXI9dm9pZCAwO2Z1bmN0aW9uIHRvQnVmZmVyKHVpbnQ4QXJyYXkpe3JldHVybiBCdWZmZXIuZnJvbSh1aW50OEFycmF5LmJ1ZmZlcix1aW50OEFycmF5LmJ5dGVPZmZzZXQsdWludDhBcnJheS5sZW5ndGgpfWV4cG9ydHMudG9CdWZmZXI9dG9CdWZmZXJ9KS5jYWxsKHRoaXMscmVxdWlyZSgiYnVmZmVyIikuQnVmZmVyKX0se2J1ZmZlcjoyN31dLDEzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24ocm9vdCl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIGNoZWNrSW50KHZhbHVlKXtyZXR1cm4gcGFyc2VJbnQodmFsdWUpPT09dmFsdWV9ZnVuY3Rpb24gY2hlY2tJbnRzKGFycmF5aXNoKXtpZighY2hlY2tJbnQoYXJyYXlpc2gubGVuZ3RoKSl7cmV0dXJuIGZhbHNlfWZvcih2YXIgaT0wO2k8YXJyYXlpc2gubGVuZ3RoO2krKyl7aWYoIWNoZWNrSW50KGFycmF5aXNoW2ldKXx8YXJyYXlpc2hbaV08MHx8YXJyYXlpc2hbaV0+MjU1KXtyZXR1cm4gZmFsc2V9fXJldHVybiB0cnVlfWZ1bmN0aW9uIGNvZXJjZUFycmF5KGFyZyxjb3B5KXtpZihhcmcuYnVmZmVyJiZhcmcubmFtZT09PSJVaW50OEFycmF5Iil7aWYoY29weSl7aWYoYXJnLnNsaWNlKXthcmc9YXJnLnNsaWNlKCl9ZWxzZXthcmc9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJnKX19cmV0dXJuIGFyZ31pZihBcnJheS5pc0FycmF5KGFyZykpe2lmKCFjaGVja0ludHMoYXJnKSl7dGhyb3cgbmV3IEVycm9yKCJBcnJheSBjb250YWlucyBpbnZhbGlkIHZhbHVlOiAiK2FyZyl9cmV0dXJuIG5ldyBVaW50OEFycmF5KGFyZyl9aWYoY2hlY2tJbnQoYXJnLmxlbmd0aCkmJmNoZWNrSW50cyhhcmcpKXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXJnKX10aHJvdyBuZXcgRXJyb3IoInVuc3VwcG9ydGVkIGFycmF5LWxpa2Ugb2JqZWN0Iil9ZnVuY3Rpb24gY3JlYXRlQXJyYXkobGVuZ3RoKXtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKX1mdW5jdGlvbiBjb3B5QXJyYXkoc291cmNlQXJyYXksdGFyZ2V0QXJyYXksdGFyZ2V0U3RhcnQsc291cmNlU3RhcnQsc291cmNlRW5kKXtpZihzb3VyY2VTdGFydCE9bnVsbHx8c291cmNlRW5kIT1udWxsKXtpZihzb3VyY2VBcnJheS5zbGljZSl7c291cmNlQXJyYXk9c291cmNlQXJyYXkuc2xpY2Uoc291cmNlU3RhcnQsc291cmNlRW5kKX1lbHNle3NvdXJjZUFycmF5PUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHNvdXJjZUFycmF5LHNvdXJjZVN0YXJ0LHNvdXJjZUVuZCl9fXRhcmdldEFycmF5LnNldChzb3VyY2VBcnJheSx0YXJnZXRTdGFydCl9dmFyIGNvbnZlcnRVdGY4PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdG9CeXRlcyh0ZXh0KXt2YXIgcmVzdWx0PVtdLGk9MDt0ZXh0PWVuY29kZVVSSSh0ZXh0KTt3aGlsZShpPHRleHQubGVuZ3RoKXt2YXIgYz10ZXh0LmNoYXJDb2RlQXQoaSsrKTtpZihjPT09Mzcpe3Jlc3VsdC5wdXNoKHBhcnNlSW50KHRleHQuc3Vic3RyKGksMiksMTYpKTtpKz0yfWVsc2V7cmVzdWx0LnB1c2goYyl9fXJldHVybiBjb2VyY2VBcnJheShyZXN1bHQpfWZ1bmN0aW9uIGZyb21CeXRlcyhieXRlcyl7dmFyIHJlc3VsdD1bXSxpPTA7d2hpbGUoaTxieXRlcy5sZW5ndGgpe3ZhciBjPWJ5dGVzW2ldO2lmKGM8MTI4KXtyZXN1bHQucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKGMpKTtpKyt9ZWxzZSBpZihjPjE5MSYmYzwyMjQpe3Jlc3VsdC5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUoKGMmMzEpPDw2fGJ5dGVzW2krMV0mNjMpKTtpKz0yfWVsc2V7cmVzdWx0LnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZSgoYyYxNSk8PDEyfChieXRlc1tpKzFdJjYzKTw8NnxieXRlc1tpKzJdJjYzKSk7aSs9M319cmV0dXJuIHJlc3VsdC5qb2luKCIiKX1yZXR1cm57dG9CeXRlczp0b0J5dGVzLGZyb21CeXRlczpmcm9tQnl0ZXN9fSgpO3ZhciBjb252ZXJ0SGV4PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdG9CeXRlcyh0ZXh0KXt2YXIgcmVzdWx0PVtdO2Zvcih2YXIgaT0wO2k8dGV4dC5sZW5ndGg7aSs9Mil7cmVzdWx0LnB1c2gocGFyc2VJbnQodGV4dC5zdWJzdHIoaSwyKSwxNikpfXJldHVybiByZXN1bHR9dmFyIEhleD0iMDEyMzQ1Njc4OWFiY2RlZiI7ZnVuY3Rpb24gZnJvbUJ5dGVzKGJ5dGVzKXt2YXIgcmVzdWx0PVtdO2Zvcih2YXIgaT0wO2k8Ynl0ZXMubGVuZ3RoO2krKyl7dmFyIHY9Ynl0ZXNbaV07cmVzdWx0LnB1c2goSGV4Wyh2JjI0MCk+PjRdK0hleFt2JjE1XSl9cmV0dXJuIHJlc3VsdC5qb2luKCIiKX1yZXR1cm57dG9CeXRlczp0b0J5dGVzLGZyb21CeXRlczpmcm9tQnl0ZXN9fSgpO3ZhciBudW1iZXJPZlJvdW5kcz17MTY6MTAsMjQ6MTIsMzI6MTR9O3ZhciByY29uPVsxLDIsNCw4LDE2LDMyLDY0LDEyOCwyNyw1NCwxMDgsMjE2LDE3MSw3NywxNTQsNDcsOTQsMTg4LDk5LDE5OCwxNTEsNTMsMTA2LDIxMiwxNzksMTI1LDI1MCwyMzksMTk3LDE0NV07dmFyIFM9Wzk5LDEyNCwxMTksMTIzLDI0MiwxMDcsMTExLDE5Nyw0OCwxLDEwMyw0MywyNTQsMjE1LDE3MSwxMTgsMjAyLDEzMCwyMDEsMTI1LDI1MCw4OSw3MSwyNDAsMTczLDIxMiwxNjIsMTc1LDE1NiwxNjQsMTE0LDE5MiwxODMsMjUzLDE0NywzOCw1NCw2MywyNDcsMjA0LDUyLDE2NSwyMjksMjQxLDExMywyMTYsNDksMjEsNCwxOTksMzUsMTk1LDI0LDE1MCw1LDE1NCw3LDE4LDEyOCwyMjYsMjM1LDM5LDE3OCwxMTcsOSwxMzEsNDQsMjYsMjcsMTEwLDkwLDE2MCw4Miw1OSwyMTQsMTc5LDQxLDIyNyw0NywxMzIsODMsMjA5LDAsMjM3LDMyLDI1MiwxNzcsOTEsMTA2LDIwMywxOTAsNTcsNzQsNzYsODgsMjA3LDIwOCwyMzksMTcwLDI1MSw2Nyw3Nyw1MSwxMzMsNjksMjQ5LDIsMTI3LDgwLDYwLDE1OSwxNjgsODEsMTYzLDY0LDE0MywxNDYsMTU3LDU2LDI0NSwxODgsMTgyLDIxOCwzMywxNiwyNTUsMjQzLDIxMCwyMDUsMTIsMTksMjM2LDk1LDE1MSw2OCwyMywxOTYsMTY3LDEyNiw2MSwxMDAsOTMsMjUsMTE1LDk2LDEyOSw3OSwyMjAsMzQsNDIsMTQ0LDEzNiw3MCwyMzgsMTg0LDIwLDIyMiw5NCwxMSwyMTksMjI0LDUwLDU4LDEwLDczLDYsMzYsOTIsMTk0LDIxMSwxNzIsOTgsMTQ1LDE0OSwyMjgsMTIxLDIzMSwyMDAsNTUsMTA5LDE0MSwyMTMsNzgsMTY5LDEwOCw4NiwyNDQsMjM0LDEwMSwxMjIsMTc0LDgsMTg2LDEyMCwzNyw0NiwyOCwxNjYsMTgwLDE5OCwyMzIsMjIxLDExNiwzMSw3NSwxODksMTM5LDEzOCwxMTIsNjIsMTgxLDEwMiw3MiwzLDI0NiwxNCw5Nyw1Myw4NywxODUsMTM0LDE5MywyOSwxNTgsMjI1LDI0OCwxNTIsMTcsMTA1LDIxNywxNDIsMTQ4LDE1NSwzMCwxMzUsMjMzLDIwNiw4NSw0MCwyMjMsMTQwLDE2MSwxMzcsMTMsMTkxLDIzMCw2NiwxMDQsNjUsMTUzLDQ1LDE1LDE3Niw4NCwxODcsMjJdO3ZhciBTaT1bODIsOSwxMDYsMjEzLDQ4LDU0LDE2NSw1NiwxOTEsNjQsMTYzLDE1OCwxMjksMjQzLDIxNSwyNTEsMTI0LDIyNyw1NywxMzAsMTU1LDQ3LDI1NSwxMzUsNTIsMTQyLDY3LDY4LDE5NiwyMjIsMjMzLDIwMyw4NCwxMjMsMTQ4LDUwLDE2NiwxOTQsMzUsNjEsMjM4LDc2LDE0OSwxMSw2NiwyNTAsMTk1LDc4LDgsNDYsMTYxLDEwMiw0MCwyMTcsMzYsMTc4LDExOCw5MSwxNjIsNzMsMTA5LDEzOSwyMDksMzcsMTE0LDI0OCwyNDYsMTAwLDEzNCwxMDQsMTUyLDIyLDIxMiwxNjQsOTIsMjA0LDkzLDEwMSwxODIsMTQ2LDEwOCwxMTIsNzIsODAsMjUzLDIzNywxODUsMjE4LDk0LDIxLDcwLDg3LDE2NywxNDEsMTU3LDEzMiwxNDQsMjE2LDE3MSwwLDE0MCwxODgsMjExLDEwLDI0NywyMjgsODgsNSwxODQsMTc5LDY5LDYsMjA4LDQ0LDMwLDE0MywyMDIsNjMsMTUsMiwxOTMsMTc1LDE4OSwzLDEsMTksMTM4LDEwNyw1OCwxNDUsMTcsNjUsNzksMTAzLDIyMCwyMzQsMTUxLDI0MiwyMDcsMjA2LDI0MCwxODAsMjMwLDExNSwxNTAsMTcyLDExNiwzNCwyMzEsMTczLDUzLDEzMywyMjYsMjQ5LDU1LDIzMiwyOCwxMTcsMjIzLDExMCw3MSwyNDEsMjYsMTEzLDI5LDQxLDE5NywxMzcsMTExLDE4Myw5OCwxNCwxNzAsMjQsMTkwLDI3LDI1Miw4Niw2Miw3NSwxOTgsMjEwLDEyMSwzMiwxNTQsMjE5LDE5MiwyNTQsMTIwLDIwNSw5MCwyNDQsMzEsMjIxLDE2OCw1MSwxMzYsNywxOTksNDksMTc3LDE4LDE2LDg5LDM5LDEyOCwyMzYsOTUsOTYsODEsMTI3LDE2OSwyNSwxODEsNzQsMTMsNDUsMjI5LDEyMiwxNTksMTQ3LDIwMSwxNTYsMjM5LDE2MCwyMjQsNTksNzcsMTc0LDQyLDI0NSwxNzYsMjAwLDIzNSwxODcsNjAsMTMxLDgzLDE1Myw5NywyMyw0Myw0LDEyNiwxODYsMTE5LDIxNCwzOCwyMjUsMTA1LDIwLDk5LDg1LDMzLDEyLDEyNV07dmFyIFQxPVszMzI4NDAyMzQxLDQxNjg5MDc5MDgsNDAwMDgwNjgwOSw0MTM1Mjg3NjkzLDQyOTQxMTE3NTcsMzU5NzM2NDE1NywzNzMxODQ1MDQxLDI0NDU2NTc0MjgsMTYxMzc3MDgzMiwzMzYyMDIyNywzNDYyODgzMjQxLDE0NDU2Njk3NTcsMzg5MjI0ODA4OSwzMDUwODIxNDc0LDEzMDMwOTYyOTQsMzk2NzE4NjU4NiwyNDEyNDMxOTQxLDUyODY0NjgxMywyMzExNzAyODQ4LDQyMDI1MjgxMzUsNDAyNjIwMjY0NSwyOTkyMjAwMTcxLDIzODcwMzYxMDUsNDIyNjg3MTMwNywxMTAxOTAxMjkyLDMwMTcwNjk2NzEsMTYwNDQ5NDA3NywxMTY5MTQxNzM4LDU5NzQ2NjMwMywxNDAzMjk5MDYzLDM4MzI3MDU2ODYsMjYxMzEwMDYzNSwxOTc0OTc0NDAyLDM3OTE1MTkwMDQsMTAzMzA4MTc3NCwxMjc3NTY4NjE4LDE4MTU0OTIxODYsMjExODA3NDE3Nyw0MTI2NjY4NTQ2LDIyMTEyMzY5NDMsMTc0ODI1MTc0MCwxMzY5ODEwNDIwLDM1MjE1MDQ1NjQsNDE5MzM4MjY2NCwzNzk5MDg1NDU5LDI4ODMxMTUxMjMsMTY0NzM5MTA1OSw3MDYwMjQ3NjcsMTM0NDgwOTA4LDI1MTI4OTc4NzQsMTE3NjcwNzk0MSwyNjQ2ODUyNDQ2LDgwNjg4NTQxNiw5MzI2MTU4NDEsMTY4MTAxMTM1LDc5ODY2MTMwMSwyMzUzNDE1NzcsNjA1MTY0MDg2LDQ2MTQwNjM2MywzNzU2MTg4MjIxLDM0NTQ3OTA0MzgsMTMxMTE4ODg0MSwyMTQyNDE3NjEzLDM5MzM1NjYzNjcsMzAyNTgyMDQzLDQ5NTE1ODE3NCwxNDc5Mjg5OTcyLDg3NDEyNTg3MCw5MDc3NDYwOTMsMzY5ODIyNDgxOCwzMDI1ODIwMzk4LDE1MzcyNTM2MjcsMjc1Njg1ODYxNCwxOTgzNTkzMjkzLDMwODQzMTAxMTMsMjEwODkyODk3NCwxMzc4NDI5MzA3LDM3MjI2OTk1ODIsMTU4MDE1MDY0MSwzMjc0NTE3OTksMjc5MDQ3ODgzNywzMTE3NTM1NTkyLDAsMzI1MzU5NTQzNiwxMDc1ODQ3MjY0LDM4MjUwMDc2NDcsMjA0MTY4ODUyMCwzMDU5NDQwNjIxLDM1NjM3NDM5MzQsMjM3ODk0MzMwMiwxNzQwNTUzOTQ1LDE5MTYzNTI4NDMsMjQ4Nzg5Njc5OCwyNTU1MTM3MjM2LDI5NTg1Nzk5NDQsMjI0NDk4ODc0NiwzMTUxMDI0MjM1LDMzMjA4MzU4ODIsMTMzNjU4NDkzMywzOTkyNzE0MDA2LDIyNTI1NTUyMDUsMjU4ODc1NzQ2MywxNzE0NjMxNTA5LDI5Mzk2MzE1NiwyMzE5Nzk1NjYzLDM5MjU0NzM1NTIsNjcyNDA0NTQsNDI2OTc2ODU3NywyNjg5NjE4MTYwLDIwMTcyMTM1MDgsNjMxMjE4MTA2LDEyNjkzNDQ0ODMsMjcyMzIzODM4NywxNTcxMDA1NDM4LDIxNTE2OTQ1MjgsOTMyOTQ0NzQsMTA2NjU3MDQxMyw1NjM5Nzc2NjAsMTg4MjczMjYxNiw0MDU5NDI4MTAwLDE2NzMzMTM1MDMsMjAwODQ2MzA0MSwyOTUwMzU1NTczLDExMDk0Njc0OTEsNTM3OTIzNjMyLDM4NTg3NTk0NTAsNDI2MDYyMzExOCwzMjE4MjY0Njg1LDIxNzc3NDgzMDAsNDAzNDQyNzA4LDYzODc4NDMwOSwzMjg3MDg0MDc5LDMxOTM5MjE1MDUsODk5MTI3MjAyLDIyODYxNzU0MzYsNzczMjY1MjA5LDI0NzkxNDYwNzEsMTQzNzA1MDg2Niw0MjM2MTQ4MzU0LDIwNTA4MzM3MzUsMzM2MjAyMjU3MiwzMTI2NjgxMDYzLDg0MDUwNTY0MywzODY2MzI1OTA5LDMyMjc1NDE2NjQsNDI3OTE3NzIwLDI2NTU5OTc5MDUsMjc0OTE2MDU3NSwxMTQzMDg3NzE4LDE0MTIwNDk1MzQsOTk5MzI5OTYzLDE5MzQ5NzIxOSwyMzUzNDE1ODgyLDMzNTQzMjQ1MjEsMTgwNzI2ODA1MSw2NzI0MDQ1NDAsMjgxNjQwMTAxNywzMTYwMzAxMjgyLDM2OTgyMjQ5MywyOTE2ODY2OTM0LDM2ODg5NDc3NzEsMTY4MTAxMTI4NiwxOTQ5OTczMDcwLDMzNjIwMjI3MCwyNDU0Mjc2NTcxLDIwMTcyMTM1NCwxMjEwMzI4MTcyLDMwOTMwNjA4MzYsMjY4MDM0MTA4NSwzMTg0Nzc2MDQ2LDExMzUzODk5MzUsMzI5NDc4MjExOCw5NjU4NDEzMjAsODMxODg2NzU2LDM1NTQ5OTMyMDcsNDA2ODA0NzI0MywzNTg4NzQ1MDEwLDIzNDUxOTE0OTEsMTg0OTExMjQwOSwzNjY0NjA0NTk5LDI2MDU0MDI4LDI5ODM1ODEwMjgsMjYyMjM3NzY4MiwxMjM1ODU1ODQwLDM2MzA5ODQzNzIsMjg5MTMzOTUxNCw0MDkyOTE2NzQzLDM0ODgyNzkwNzcsMzM5NTY0Mjc5OSw0MTAxNjY3NDcwLDEyMDI2MzAzNzcsMjY4OTYxODE2LDE4NzQ1MDg1MDEsNDAzNDQyNzAxNiwxMjQzOTQ4Mzk5LDE1NDY1MzA0MTgsOTQxMzY2MzA4LDE0NzA1Mzk1MDUsMTk0MTIyMjU5OSwyNTQ2Mzg2NTEzLDM0MjEwMzg2MjcsMjcxNTY3MTkzMiwzODk5OTQ2MTQwLDEwNDIyMjY5NzcsMjUyMTUxNzAyMSwxNjM5ODI0ODYwLDIyNzI0OTAzMCwyNjA3Mzc2NjksMzc2NTQ2NTIzMiwyMDg0NDUzOTU0LDE5MDc3MzM5NTYsMzQyOTI2MzAxOCwyNDIwNjU2MzQ0LDEwMDg2MDY3Nyw0MTYwMTU3MTg1LDQ3MDY4MzE1NCwzMjYxMTYxODkxLDE3ODE4NzE5NjcsMjkyNDk1OTczNywxNzczNzc5NDA4LDM5NDY5MjI0MSwyNTc5NjExOTkyLDk3NDk4NjUzNSw2NjQ3MDY3NDUsMzY1NTQ1OTEyOCwzOTU4OTYyMTk1LDczMTQyMDg1MSw1NzE1NDM4NTksMzUzMDEyMzcwNywyODQ5NjI2NDgwLDEyNjc4MzExMyw4NjUzNzUzOTksNzY1MTcyNjYyLDEwMDg2MDY3NTQsMzYxMjAzNjAyLDMzODc1NDk5ODQsMjI3ODQ3NzM4NSwyODU3NzE5Mjk1LDEzNDQ4MDkwODAsMjc4MjkxMjM3OCw1OTU0MjY3MSwxNTAzNzY0OTg0LDE2MDAwODU3Niw0MzcwNjI5MzUsMTcwNzA2NTMwNiwzNjIyMjMzNjQ5LDIyMTg5MzQ5ODIsMzQ5NjUwMzQ4MCwyMTg1MzE0NzU1LDY5NzkzMjIwOCwxNTEyOTEwMTk5LDUwNDMwMzM3NywyMDc1MTc3MTYzLDI4MjQwOTkwNjgsMTg0MTAxOTg2Miw3Mzk2NDQ5ODZdO3ZhciBUMj1bMjc4MTI0MjIxMSwyMjMwODc3MzA4LDI1ODI1NDIxOTksMjM4MTc0MDkyMywyMzQ4Nzc2ODIsMzE4NDk0NjAyNywyOTg0MTQ0NzUxLDE0MTg4Mzk0OTMsMTM0ODQ4MTA3Miw1MDQ2Mjk3NywyODQ4ODc2MzkxLDIxMDI3OTkxNDcsNDM0NjM0NDk0LDE2NTYwODQ0MzksMzg2Mzg0OTg5OSwyNTk5MTg4MDg2LDExNjcwNTE0NjYsMjYzNjA4NzkzOCwxMDgyNzcxOTEzLDIyODEzNDAyODUsMzY4MDQ4ODkwLDM5NTQzMzQwNDEsMzM4MTU0NDc3NSwyMDEwNjA1OTIsMzk2MzcyNzI3NywxNzM5ODM4Njc2LDQyNTA5MDMyMDIsMzkzMDQzNTUwMywzMjA2NzgyMTA4LDQxNDk0NTM5ODgsMjUzMTU1MzkwNiwxNTM2OTM0MDgwLDMyNjI0OTQ2NDcsNDg0NTcyNjY5LDI5MjMyNzEwNTksMTc4MzM3NTM5OCwxNTE3MDQxMjA2LDEwOTg3OTI3NjcsNDk2NzQyMzEsMTMzNDAzNzcwOCwxNTUwMzMyOTgwLDQwOTg5OTE1MjUsODg2MTcxMTA5LDE1MDU5ODEyOSwyNDgxMDkwOTI5LDE5NDA2NDIwMDgsMTM5ODk0NDA0OSwxMDU5NzIyNTE3LDIwMTg1MTkwOCwxMzg1NTQ3NzE5LDE2OTkwOTUzMzEsMTU4NzM5NzU3MSw2NzQyNDA1MzYsMjcwNDc3NDgwNiwyNTIzMTQ4ODUsMzAzOTc5NTg2NiwxNTE5MTQyNDcsOTA4MzMzNTg2LDI2MDIyNzA4NDgsMTAzODA4Mjc4Niw2NTEwMjk0ODMsMTc2NjcyOTUxMSwzNDQ3Njk4MDk4LDI2ODI5NDI4MzcsNDU0MTY2NzkzLDI2NTI3MzQzMzksMTk1MTkzNTUzMiw3NzUxNjY0OTAsNzU4NTIwNjAzLDMwMDA3OTA2MzgsNDAwNDc5NzAxOCw0MjE3MDg2MTEyLDQxMzc5NjQxMTQsMTI5OTU5NDA0MywxNjM5NDM4MDM4LDM0NjQzNDQ0OTksMjA2ODk4MjA1NywxMDU0NzI5MTg3LDE5MDE5OTc4NzEsMjUzNDYzODcyNCw0MTIxMzE4MjI3LDE3NTcwMDgzMzcsMCw3NTA5MDY4NjEsMTYxNDgxNTI2NCw1MzUwMzUxMzIsMzM2MzQxODU0NSwzOTg4MTUxMTMxLDMyMDE1OTE5MTQsMTE4MzY5Nzg2NywzNjQ3NDU0OTEwLDEyNjU3NzY5NTMsMzczNDI2MDI5OCwzNTY2NzUwNzk2LDM5MDM4NzEwNjQsMTI1MDI4MzQ3MSwxODA3NDcwODAwLDcxNzYxNTA4NywzODQ3MjAzNDk4LDM4NDY5NTI5MSwzMzEzOTEwNTk1LDM2MTcyMTM3NzMsMTQzMjc2MTEzOSwyNDg0MTc2MjYxLDM0ODE5NDU0MTMsMjgzNzY5MzM3LDEwMDkyNTk1NCwyMTgwOTM5NjQ3LDQwMzcwMzgxNjAsMTE0ODczMDQyOCwzMTIzMDI3ODcxLDM4MTMzODY0MDgsNDA4NzUwMTEzNyw0MjY3NTQ5NjAzLDMyMjk2MzA1MjgsMjMxNTYyMDIzOSwyOTA2NjI0NjU4LDMxNTYzMTk2NDUsMTIxNTMxMzk3Niw4Mjk2NjAwNSwzNzQ3ODU1NTQ4LDMyNDU4NDgyNDYsMTk3NDQ1OTA5OCwxNjY1Mjc4MjQxLDgwNzQwNzYzMiw0NTEyODA4OTUsMjUxNTI0MDgzLDE4NDEyODc4OTAsMTI4MzU3NTI0NSwzMzcxMjAyNjgsODkxNjg3Njk5LDgwMTM2OTMyNCwzNzg3MzQ5ODU1LDI3MjE0MjEyMDcsMzQzMTQ4MjQzNiw5NTkzMjE4NzksMTQ2OTMwMTk1Niw0MDY1Njk5NzUxLDIxOTc1ODU1MzQsMTE5OTE5MzQwNSwyODk4ODE0MDUyLDM4ODc3NTA0OTMsNzI0NzAzNTEzLDI1MTQ5MDgwMTksMjY5Njk2MjE0NCwyNTUxODA4Mzg1LDM1MTY4MTMxMzUsMjE0MTQ0NTM0MCwxNzE1NzQxMjE4LDIxMTk0NDUwMzQsMjg3MjgwNzU2OCwyMTk4NTcxMTQ0LDMzOTgxOTA2NjIsNzAwOTY4Njg2LDM1NDcwNTIyMTYsMTAwOTI1OTU0MCwyMDQxMDQ0NzAyLDM4MDM5OTU3NDIsNDg3OTgzODgzLDE5OTExMDU0OTksMTAwNDI2NTY5NiwxNDQ5NDA3MDI2LDEzMTYyMzk5MzAsNTA0NjI5NzcwLDM2ODM3OTczMjEsMTY4NTYwMTM0LDE4MTY2NjcxNzIsMzgzNzI4NzUxNiwxNTcwNzUxMTcwLDE4NTc5MzQyOTEsNDAxNDE4OTc0MCwyNzk3ODg4MDk4LDI4MjIzNDUxMDUsMjc1NDcxMjk4MSw5MzY2MzM1NzIsMjM0NzkyMzgzMyw4NTI4NzkzMzUsMTEzMzIzNDM3NiwxNTAwMzk1MzE5LDMwODQ1NDUzODksMjM0ODkxMjAxMywxNjg5Mzc2MjEzLDM1MzM0NTkwMjIsMzc2MjkyMzk0NSwzMDM0MDgyNDEyLDQyMDU1OTgyOTQsMTMzNDI4NDY4LDYzNDM4MzA4MiwyOTQ5Mjc3MDI5LDIzOTgzODY4MTAsMzkxMzc4OTEwMiw0MDM3MDM4MTYsMzU4MDg2OTMwNiwyMjk3NDYwODU2LDE4NjcxMzAxNDksMTkxODY0Mzc1OCw2MDc2NTY5ODgsNDA0OTA1MzM1MCwzMzQ2MjQ4ODg0LDEzNjg5MDEzMTgsNjAwNTY1OTkyLDIwOTA5ODI4NzcsMjYzMjQ3OTg2MCw1NTc3MTkzMjcsMzcxNzYxNDQxMSwzNjk3MzkzMDg1LDIyNDkwMzQ2MzUsMjIzMjM4ODIzNCwyNDMwNjI3OTUyLDExMTU0Mzg2NTQsMzI5NTc4NjQyMSwyODY1NTIyMjc4LDM2MzMzMzQzNDQsODQyODAwNjcsMzMwMjc4MzAsMzAzODI4NDk0LDI3NDc0MjUxMjEsMTYwMDc5NTk1Nyw0MTg4OTUyNDA3LDM0OTY1ODk3NTMsMjQzNDIzODA4NiwxNDg2NDcxNjE3LDY1ODExOTk2NSwzMTA2MzgxNDcwLDk1MzgwMzIzMywzMzQyMzE4MDAsMzAwNTk3ODc3Niw4NTc4NzA2MDksMzE1MTEyODkzNywxODkwMTc5NTQ1LDIyOTg5NzM4MzgsMjgwNTE3NTQ0NCwzMDU2NDQyMjY3LDU3NDM2NTIxNCwyNDUwODg0NDg3LDU1MDEwMzUyOSwxMjMzNjM3MDcwLDQyODkzNTMwNDUsMjAxODUxOTA4MCwyMDU3NjkxMTAzLDIzOTkzNzQ0NzYsNDE2NjYyMzY0OSwyMTQ4MTA4NjgxLDM4NzU4MzI0NSwzNjY0MTAxMzExLDgzNjIzMjkzNCwzMzMwNTU2NDgyLDMxMDA2NjU5NjAsMzI4MDA5MzUwNSwyOTU1NTE2MzEzLDIwMDIzOTg1MDksMjg3MTgyNjA3LDM0MTM4ODEwMDgsNDIzODg5MDA2OCwzNTk3NTE1NzA3LDk3NTk2Nzc2Nl07dmFyIFQzPVsxNjcxODA4NjExLDIwODkwODkxNDgsMjAwNjU3Njc1OSwyMDcyOTAxMjQzLDQwNjEwMDM3NjIsMTgwNzYwMzMwNywxODczOTI3NzkxLDMzMTA2NTM4OTMsODEwNTczODcyLDE2OTc0MzM3LDE3MzkxODE2NzEsNzI5NjM0MzQ3LDQyNjMxMTA2NTQsMzYxMzU3MDUxOSwyODgzOTk3MDk5LDE5ODk4NjQ1NjYsMzM5MzU1NjQyNiwyMTkxMzM1Mjk4LDMzNzY0NDk5OTMsMjEwNjA2MzQ4NSw0MTk1NzQxNjkwLDE1MDg2MTg4NDEsMTIwNDM5MTQ5NSw0MDI3MzE3MjMyLDI5MTc5NDE2NzcsMzU2MzU2NjAzNiwyNzM0NTE0MDgyLDI5NTEzNjYwNjMsMjYyOTc3MjE4OCwyNzY3NjcyMjI4LDE5MjI0OTE1MDYsMzIyNzIyOTEyMCwzMDgyOTc0NjQ3LDQyNDY1Mjg1MDksMjQ3NzY2OTc3OSw2NDQ1MDA1MTgsOTExODk1NjA2LDEwNjEyNTY3NjcsNDE0NDE2NjM5MSwzNDI3NzYzMTQ4LDg3ODQ3MTIyMCwyNzg0MjUyMzI1LDM4NDU0NDQwNjksNDA0Mzg5NzMyOSwxOTA1NTE3MTY5LDM2MzE0NTkyODgsODI3NTQ4MjA5LDM1NjQ2MTA3Nyw2Nzg5NzM0OCwzMzQ0MDc4Mjc5LDU5MzgzOTY1MSwzMjc3NzU3ODkxLDQwNTI4NjkzNiwyNTI3MTQ3OTI2LDg0ODcxNjg1LDI1OTU1NjU0NjYsMTE4MDMzOTI3LDMwNTUzODA2NiwyMTU3NjQ4NzY4LDM3OTU3MDU4MjYsMzk0NTE4ODg0Myw2NjEyMTI3MTEsMjk5OTgxMjAxOCwxOTczNDE0NTE3LDE1Mjc2OTAzMywyMjA4MTc3NTM5LDc0NTgyMjI1Miw0MzkyMzU2MTAsNDU1OTQ3ODAzLDE4NTcyMTU1OTgsMTUyNTU5MzE3OCwyNzAwODI3NTUyLDEzOTE4OTU2MzQsOTk0OTMyMjgzLDM1OTY3MjgyNzgsMzAxNjY1NDI1OSw2OTU5NDc4MTcsMzgxMjU0ODA2Nyw3OTU5NTg4MzEsMjIyNDQ5MzQ0NCwxNDA4NjA3ODI3LDM1MTMzMDE0NTcsMCwzOTc5MTMzNDIxLDU0MzE3ODc4NCw0MjI5OTQ4NDEyLDI5ODI3MDU1ODUsMTU0MjMwNTM3MSwxNzkwODkxMTE0LDM0MTAzOTg2NjcsMzIwMTkxODkxMCw5NjEyNDU3NTMsMTI1NjEwMDkzOCwxMjg5MDAxMDM2LDE0OTE2NDQ1MDQsMzQ3Nzc2NzYzMSwzNDk2NzIxMzYwLDQwMTI1NTc4MDcsMjg2NzE1NDg1OCw0MjEyNTgzOTMxLDExMzcwMTg0MzUsMTMwNTk3NTM3Myw4NjEyMzQ3MzksMjI0MTA3MzU0MSwxMTcxMjI5MjUzLDQxNzg2MzUyNTcsMzM5NDg2NzQsMjEzOTIyNTcyNywxMzU3OTQ2OTYwLDEwMTExMjAxODgsMjY3OTc3NjY3MSwyODMzNDY4MzI4LDEzNzQ5MjEyOTcsMjc1MTM1NjMyMywxMDg2MzU3NTY4LDI0MDgxODcyNzksMjQ2MDgyNzUzOCwyNjQ2MzUyMjg1LDk0NDI3MTQxNiw0MTEwNzQyMDA1LDMxNjg3NTY2NjgsMzA2NjEzMjQwNiwzNjY1MTQ1ODE4LDU2MDE1MzEyMSwyNzE1ODkzOTIsNDI3OTk1Mjg5NSw0MDc3ODQ2MDAzLDM1MzA0MDc4OTAsMzQ0NDM0MzI0NSwyMDI2NDM0NjgsMzIyMjUwMjU5LDM5NjI1NTMzMjQsMTYwODYyOTg1NSwyNTQzOTkwMTY3LDExNTQyNTQ5MTYsMzg5NjIzMzE5LDMyOTQwNzM3OTYsMjgxNzY3NjcxMSwyMTIyNTEzNTM0LDEwMjgwOTQ1MjUsMTY4OTA0NTA5MiwxNTc1NDY3NjEzLDQyMjI2MTI3MywxOTM5MjAzNjk5LDE2MjExNDc3NDQsMjE3NDIyODg2NSwxMzM5MTM3NjE1LDM2OTkzNTI1NDAsNTc3MTI3NDU4LDcxMjkyMjE1NCwyNDI3MTQxMDA4LDIyOTAyODk1NDQsMTE4NzY3OTMwMiwzOTk1NzE1NTY2LDMxMDA4NjM0MTYsMzM5NDg2NzQwLDM3MzI1MTQ3ODIsMTU5MTkxNzY2MiwxODY0NTU1NjMsMzY4MTk4ODA1OSwzNzYyMDE5Mjk2LDg0NDUyMjU0Niw5NzgyMjAwOTAsMTY5NzQzMzcwLDEyMzkxMjY2MDEsMTAxMzIxNzM0LDYxMTA3NjEzMiwxNTU4NDkzMjc2LDMyNjA5MTU2NTAsMzU0NzI1MDEzMSwyOTAxMzYxNTgwLDE2NTUwOTY0MTgsMjQ0MzcyMTEwNSwyNTEwNTY1NzgxLDM4Mjg4NjM5NzIsMjAzOTIxNDcxMywzODc4ODY4NDU1LDMzNTk4Njk4OTYsOTI4NjA3Nzk5LDE4NDA3NjU1NDksMjM3NDc2Mjg5MywzNTgwMTQ2MTMzLDEzMjI0MjU0MjIsMjg1MDA0ODQyNSwxODIzNzkxMjEyLDE0NTkyNjg2OTQsNDA5NDE2MTkwOCwzOTI4MzQ2NjAyLDE3MDYwMTk0MjksMjA1NjE4OTA1MCwyOTM0NTIzODIyLDEzNTc5NDY5NiwzMTM0NTQ5OTQ2LDIwMjIyNDAzNzYsNjI4MDUwNDY5LDc3OTI0NjYzOCw0NzIxMzU3MDgsMjgwMDgzNDQ3MCwzMDMyOTcwMTY0LDMzMjcyMzYwMzgsMzg5NDY2MDA3MiwzNzE1OTMyNjM3LDE5NTY0NDAxODAsNTIyMjcyMjg3LDEyNzI4MTMxMzEsMzE4NTMzNjc2NSwyMzQwODE4MzE1LDIzMjM5NzYwNzQsMTg4ODU0MjgzMiwxMDQ0NTQ0NTc0LDMwNDk1NTAyNjEsMTcyMjQ2OTQ3OCwxMjIyMTUyMjY0LDUwNjYwODY3LDQxMjczMjQxNTAsMjM2MDY3ODU0LDE2MzgxMjIwODEsODk1NDQ1NTU3LDE0NzU5ODA4ODcsMzExNzQ0MzUxMywyMjU3NjU1Njg2LDMyNDM4MDkyMTcsNDg5MTEwMDQ1LDI2NjI5MzQ0MzAsMzc3ODU5OTM5Myw0MTYyMDU1MTYwLDI1NjE4Nzg5MzYsMjg4NTYzNzI5LDE3NzM5MTY3NzcsMzY0ODAzOTM4NSwyMzkxMzQ1MDM4LDI0OTM5ODU2ODQsMjYxMjQwNzcwNyw1MDU1NjAwOTQsMjI3NDQ5NzkyNywzOTExMjQwMTY5LDM0NjA5MjUzOTAsMTQ0MjgxODY0NSw2Nzg5NzM0ODAsMzc0OTM1NzAyMywyMzU4MTgyNzk2LDI3MTc0MDc2NDksMjMwNjg2OTY0MSwyMTk2MTc4MDUsMzIxODc2MTE1MSwzODYyMDI2MjE0LDExMjAzMDYyNDIsMTc1Njk0MjQ0MCwxMTAzMzMxOTA1LDI1Nzg0NTkwMzMsNzYyNzk2NTg5LDI1Mjc4MDA0NywyOTY2MTI1NDg4LDE0MjU4NDQzMDgsMzE1MTM5MjE4NywzNzI5MTExMjZdO3ZhciBUND1bMTY2NzQ3NDg4NiwyMDg4NTM1Mjg4LDIwMDQzMjY4OTQsMjA3MTY5NDgzOCw0MDc1OTQ5NTY3LDE4MDIyMjMwNjIsMTg2OTU5MTAwNiwzMzE4MDQzNzkzLDgwODQ3MjY3MiwxNjg0MzUyMiwxNzM0ODQ2OTI2LDcyNDI3MDQyMiw0Mjc4MDY1NjM5LDM2MjEyMTY5NDksMjg4MDE2OTU0OSwxOTg3NDg0Mzk2LDM0MDIyNTM3MTEsMjE4OTU5Nzk4MywzMzg1NDA5NjczLDIxMDUzNzg4MTAsNDIxMDY5MzYxNSwxNDk5MDY1MjY2LDExOTU4ODY5OTAsNDA0MjI2MzU0NywyOTEzODU2NTc3LDM1NzA2ODk5NzEsMjcyODU5MDY4NywyOTQ3NTQxNTczLDI2Mjc1MTgyNDMsMjc2MjI3NDY0MywxOTIwMTEyMzU2LDMyMzM4MzE4MzUsMzA4MjI3MzM5Nyw0MjYxMjIzNjQ5LDI0NzU5MjkxNDksNjQwMDUxNzg4LDkwOTUzMTc1NiwxMDYxMTEwMTQyLDQxNjAxNjA1MDEsMzQzNTk0MTc2Myw4NzU4NDY3NjAsMjc3OTExNjYyNSwzODU3MDAzNzI5LDQwNTkxMDU1MjksMTkwMzI2ODgzNCwzNjM4MDY0MDQzLDgyNTMxNjE5NCwzNTM3MTM5NjIsNjczNzQwODgsMzM1MTcyODc4OSw1ODk1MjIyNDYsMzI4NDM2MDg2MSw0MDQyMzYzMzYsMjUyNjQ1NDA3MSw4NDIxNzYxMCwyNTkzODMwMTkxLDExNzkwMTU4MiwzMDMxODMzOTYsMjE1NTkxMTk2MywzODA2NDc3NzkxLDM5NTgwNTY2NTMsNjU2ODk0Mjg2LDI5OTgwNjI0NjMsMTk3MDY0MjkyMiwxNTE1OTE2OTgsMjIwNjQ0MDk4OSw3NDExMTA4NzIsNDM3OTIzMzgwLDQ1NDc2NTg3OCwxODUyNzQ4NTA4LDE1MTU5MDg3ODgsMjY5NDkwNDY2NywxMzgxMTY4ODA0LDk5Mzc0MjE5OCwzNjA0MzczOTQzLDMwMTQ5MDU0NjksNjkwNTg0NDAyLDM4MjMzMjA3OTcsNzkxNjM4MzY2LDIyMjMyODE5MzksMTM5ODAxMTMwMiwzNTIwMTYxOTc3LDAsMzk5MTc0MzY4MSw1Mzg5OTI3MDQsNDI0NDM4MTY2NywyOTgxMjE4NDI1LDE1MzI3NTEyODYsMTc4NTM4MDU2NCwzNDE5MDk2NzE3LDMyMDAxNzg1MzUsOTYwMDU2MTc4LDEyNDY0MjA2MjgsMTI4MDEwMzU3NiwxNDgyMjIxNzQ0LDM0ODY0Njg3NDEsMzUwMzMxOTk5NSw0MDI1NDI4Njc3LDI4NjMzMjY1NDMsNDIyNzUzNjYyMSwxMTI4NTE0OTUwLDEyOTY5NDcwOTgsODU5MDAyMjE0LDIyNDAxMjM5MjEsMTE2MjIwMzAxOCw0MTkzODQ5NTc3LDMzNjg3MDQ0LDIxMzkwNjI3ODIsMTM0NzQ4MTc2MCwxMDEwNTgyNjQ4LDI2NzgwNDUyMjEsMjgyOTY0MDUyMywxMzY0MzI1MjgyLDI3NDU0MzM2OTMsMTA3Nzk4NTQwOCwyNDA4NTQ4ODY5LDI0NTkwODYxNDMsMjY0NDM2MDIyNSw5NDMyMTI2NTYsNDEyNjQ3NTUwNSwzMTY2NDk0NTYzLDMwNjU0MzAzOTEsMzY3MTc1MDA2Myw1NTU4MzYyMjYsMjY5NDk2MzUyLDQyOTQ5MDg2NDUsNDA5Mjc5MjU3MywzNTM3MDA2MDE1LDM0NTI3ODM3NDUsMjAyMTE4MTY4LDMyMDAyNTg5NCwzOTc0OTAxNjk5LDE2MDAxMTkyMzAsMjU0MzI5NzA3NywxMTQ1MzU5NDk2LDM4NzM5NzkzNCwzMzAxMjAxODExLDI4MTI4MDE2MjEsMjEyMjIyMDI4NCwxMDI3NDI2MTcwLDE2ODQzMTk0MzIsMTU2NjQzNTI1OCw0MjEwNzk4NTgsMTkzNjk1NDg1NCwxNjE2OTQ1MzQ0LDIxNzI3NTM5NDUsMTMzMDYzMTA3MCwzNzA1NDM4MTE1LDU3MjY3OTc0OCw3MDc0Mjc5MjQsMjQyNTQwMDEyMywyMjkwNjQ3ODE5LDExNzkwNDQ0OTIsNDAwODU4NTY3MSwzMDk5MTIwNDkxLDMzNjg3MDQ0MCwzNzM5MTIyMDg3LDE1ODMyNzY3MzIsMTg1Mjc3NzE4LDM2ODg1OTMwNjksMzc3Mjc5MTc3MSw4NDIxNTk3MTYsOTc2ODk5NzAwLDE2ODQzNTIyMCwxMjI5NTc3MTA2LDEwMTA1OTA4NCw2MDYzNjY3OTIsMTU0OTU5MTczNiwzMjY3NTE3ODU1LDM1NTM4NDkwMjEsMjg5NzAxNDU5NSwxNjUwNjMyMzg4LDI0NDIyNDIxMDUsMjUwOTYxMjA4MSwzODQwMTYxNzQ3LDIwMzgwMDg4MTgsMzg5MDY4ODcyNSwzMzY4NTY3NjkxLDkyNjM3NDI1NCwxODM1OTA3MDM0LDIzNzQ4NjM4NzMsMzU4NzUzMTk1MywxMzEzNzg4NTcyLDI4NDY0ODI1MDUsMTgxOTA2MzUxMiwxNDQ4NTQwODQ0LDQxMDk2MzM1MjMsMzk0MTIxMzY0NywxNzAxMTYyOTU0LDIwNTQ4NTIzNDAsMjkzMDY5ODU2NywxMzQ3NDgxNzYsMzEzMjgwNjUxMSwyMDIxMTY1Mjk2LDYyMzIxMDMxNCw3NzQ3OTU4NjgsNDcxNjA2MzI4LDI3OTU5NTg2MTUsMzAzMTc0NjQxOSwzMzM0ODg1NzgzLDM5MDc1Mjc2MjcsMzcyMjI4MDA5NywxOTUzNzk5NDAwLDUyMjEzMzgyMiwxMjYzMjYzMTI2LDMxODMzMzY1NDUsMjM0MTE3Njg0NSwyMzI0MzMzODM5LDE4ODY0MjUzMTIsMTA0NDI2NzY0NCwzMDQ4NTg4NDAxLDE3MTgwMDQ0MjgsMTIxMjczMzU4NCw1MDUyOTU0Miw0MTQzMzE3NDk1LDIzNTgwMzE2NCwxNjMzNzg4ODY2LDg5MjY5MDI4MiwxNDY1MzgzMzQyLDMxMTU5NjI0NzMsMjI1Njk2NTkxMSwzMjUwNjczODE3LDQ4ODQ0OTg1MCwyNjYxMjAyMjE1LDM3ODk2MzM3NTMsNDE3NzAwNzU5NSwyNTYwMTQ0MTcxLDI4NjMzOTg3NCwxNzY4NTM3MDQyLDM2NTQ5MDYwMjUsMjM5MTcwNTg2MywyNDkyNzcwMDk5LDI2MTA2NzMxOTcsNTA1MjkxMzI0LDIyNzM4MDg5MTcsMzkyNDM2OTYwOSwzNDY5NjI1NzM1LDE0MzE2OTkzNzAsNjczNzQwODgwLDM3NTU5NjUwOTMsMjM1ODAyMTg5MSwyNzExNzQ2NjQ5LDIzMDc0ODk4MDEsMjE4OTYxNjkwLDMyMTcwMjE1NDEsMzg3Mzg0NTcxOSwxMTExNjcyNDUyLDE3NTE2OTM1MjAsMTA5NDgyODkzMCwyNTc2OTg2MTUzLDc1Nzk1NDM5NCwyNTI2NDU2NjIsMjk2NDM3NjQ0MywxNDE0ODU1ODQ4LDMxNDk2NDk1MTcsMzcwNTU1NDM2XTt2YXIgVDU9WzEzNzQ5ODgxMTIsMjExODIxNDk5NSw0Mzc3NTcxMjMsOTc1NjU4NjQ2LDEwMDEwODk5OTUsNTMwNDAwNzUzLDI5MDIwODc4NTEsMTI3MzE2ODc4Nyw1NDAwODA3MjUsMjkxMDIxOTc2NiwyMjk1MTAxMDczLDQxMTA1Njg0ODUsMTM0MDQ2MzEwMCwzMzA3OTE2MjQ3LDY0MTAyNTE1MiwzMDQzMTQwNDk1LDM3MzYxNjQ5MzcsNjMyOTUzNzAzLDExNzI5NjcwNjQsMTU3Njk3NjYwOSwzMjc0NjY3MjY2LDIxNjkzMDMwNTgsMjM3MDIxMzc5NSwxODA5MDU0MTUwLDU5NzI3ODQ3LDM2MTkyOTg3NywzMjExNjIzMTQ3LDI1MDUyMDIxMzgsMzU2OTI1NTIxMywxNDg0MDA1ODQzLDEyMzk0NDM3NTMsMjM5NTU4ODY3NiwxOTc1NjgzNDM0LDQxMDI5Nzc5MTIsMjU3MjY5NzE5NSw2NjY0NjQ3MzMsMzIwMjQzNzA0Niw0MDM1NDg5MDQ3LDMzNzQzNjE3MDIsMjExMDY2NzQ0NCwxNjc1NTc3ODgwLDM4NDM2OTkwNzQsMjUzODY4MTE4NCwxNjQ5NjM5MjM3LDI5NzYxNTE1MjAsMzE0NDM5NjQyMCw0MjY5OTA3OTk2LDQxNzgwNjIyMjgsMTg4Mzc5MzQ5NiwyNDAzNzI4NjY1LDI0OTc2MDQ3NDMsMTM4Mzg1NjMxMSwyODc2NDk0NjI3LDE5MTc1MTg1NjIsMzgxMDQ5NjM0MywxNzE2ODkwNDEwLDMwMDE3NTU2NTUsODAwNDQwODM1LDIyNjEwODkxNzgsMzU0MzU5OTI2OSw4MDc5NjI2MTAsNTk5NzYyMzU0LDMzNzc4MzYyLDM5Nzc2NzUzNTYsMjMyODgyODk3MSwyODA5NzcxMTU0LDQwNzczODQ0MzIsMTMxNTU2MjE0NSwxNzA4ODQ4MzMzLDEwMTAzOTgyOSwzNTA5ODcxMTM1LDMyOTkyNzg0NzQsODc1NDUxMjkzLDI3MzM4NTYxNjAsOTI5ODc2OTgsMjc2NzY0NTU1NywxOTMxOTUwNjUsMTA4MDA5NDYzNCwxNTg0NTA0NTgyLDMxNzgxMDY5NjEsMTA0MjM4NTY1NywyNTMxMDY3NDUzLDM3MTE4Mjk0MjIsMTMwNjk2NzM2NiwyNDM4MjM3NjIxLDE5MDg2OTQyNzcsNjc1NTY0NjMsMTYxNTg2MTI0Nyw0Mjk0NTYxNjQsMzYwMjc3MDMyNywyMzAyNjkwMjUyLDE3NDIzMTUxMjcsMjk2ODAxMTQ1MywxMjY0NTQ2NjQsMzg3NzE5ODY0OCwyMDQzMjExNDgzLDI3MDkyNjA4NzEsMjA4NDcwNDIzMyw0MTY5NDA4MjAxLDAsMTU5NDE3OTg3LDg0MTczOTU5Miw1MDQ0NTk0MzYsMTgxNzg2NjgzMCw0MjQ1NjE4NjgzLDI2MDM4ODk1MCwxMDM0ODY3OTk4LDkwODkzMzQxNSwxNjg4MTA4NTIsMTc1MDkwMjMwNSwyNjA2NDUzOTY5LDYwNzUzMDU1NCwyMDIwMDg0OTcsMjQ3MjAxMTUzNSwzMDM1NTM1MDU4LDQ2MzE4MDE5MCwyMTYwMTE3MDcxLDE2NDE4MTYyMjYsMTUxNzc2NzUyOSw0NzA5NDgzNzQsMzgwMTMzMjIzNCwzMjMxNzIyMjEzLDEwMDg5MTg1OTUsMzAzNzY1Mjc3LDIzNTQ3NDE4Nyw0MDY5MjQ2ODkzLDc2Njk0NTQ2NSwzMzc1NTM4NjQsMTQ3NTQxODUwMSwyOTQzNjgyMzgwLDQwMDMwNjExNzksMjc0MzAzNDEwOSw0MTQ0MDQ3Nzc1LDE1NTEwMzc4ODQsMTE0NzU1MDY2MSwxNTQzMjA4NTAwLDIzMzY0MzQ1NTAsMzQwODExOTUxNiwzMDY5MDQ5OTYwLDMxMDIwMTE3NDcsMzYxMDM2OTIyNiwxMTEzODE4Mzg0LDMyODY3MTgwOCwyMjI3NTczMDI0LDIyMzYyMjg3MzMsMzUzNTQ4NjQ1NiwyOTM1NTY2ODY1LDMzNDEzOTQyODUsNDk2OTA2MDU5LDM3MDI2NjU0NTksMjI2OTA2ODYwLDIwMDkxOTU0NzIsNzMzMTU2OTcyLDI4NDI3MzcwNDksMjk0OTMwNjgyLDEyMDY0Nzc4NTgsMjgzNTEyMzM5NiwyNzAwMDk5MzU0LDE0NTEwNDQwNTYsNTczODA0NzgzLDIyNjk3Mjg0NTUsMzY0NDM3OTU4NSwyMzYyMDkwMjM4LDI1NjQwMzMzMzQsMjgwMTEwNzQwNywyNzc2MjkyOTA0LDM2Njk0NjI1NjYsMTA2ODM1MTM5Niw3NDIwMzkwMTIsMTM1MDA3ODk4OSwxNzg0NjYzMTk1LDE0MTc1NjE2OTgsNDEzNjQ0MDc3MCwyNDMwMTIyMjE2LDc3NTU1MDgxNCwyMTkzODYyNjQ1LDI2NzM3MDUxNTAsMTc3NTI3NjkyNCwxODc2MjQxODMzLDM0NzUzMTMzMzEsMzM2Njc1NDYxOSwyNzAwNDA0ODcsMzkwMjU2MzE4MiwzNjc4MTI0OTIzLDM0NDE4NTAzNzcsMTg1MTMzMjg1MiwzOTY5NTYyMzY5LDIyMDMwMzIyMzIsMzg2ODU1MjgwNSwyODY4ODk3NDA2LDU2NjAyMTg5Niw0MDExMTkwNTAyLDMxMzU3NDA4ODksMTI0ODgwMjUxMCwzOTM2MjkxMjg0LDY5OTQzMjE1MCw4MzI4NzcyMzEsNzA4NzgwODQ5LDMzMzI3NDAxNDQsODk5ODM1NTg0LDE5NTEzMTcwNDcsNDIzNjQyOTk5MCwzNzY3NTg2OTkyLDg2NjYzNzg0NSw0MDQzNjEwMTg2LDExMDYwNDE1OTEsMjE0NDE2MTgwNiwzOTU0NDE3MTEsMTk4NDgxMjY4NSwxMTM5NzgxNzA5LDM0MzM3MTI5ODAsMzgzNTAzNjg5NSwyNjY0NTQzNzE1LDEyODIwNTAwNzUsMzI0MDg5NDM5MiwxMTgxMDQ1MTE5LDI2NDAyNDMyMDQsMjU5NjU5MTcsNDIwMzE4MTE3MSw0MjExODE4Nzk4LDMwMDk4NzkzODYsMjQ2Mzg3OTc2MiwzOTEwMTYxOTcxLDE4NDI3NTk0NDMsMjU5NzgwNjQ3Niw5MzMzMDEzNzAsMTUwOTQzMDQxNCwzOTQzOTA2NDQxLDM0NjcxOTIzMDIsMzA3NjYzOTAyOSwzNzc2NzY3NDY5LDIwNTE1MTg3ODAsMjYzMTA2NTQzMywxNDQxOTUyNTc1LDQwNDAxNjc2MSwxOTQyNDM1Nzc1LDE0MDg3NDkwMzQsMTYxMDQ1OTczOSwzNzQ1MzQ1MzAwLDIwMTc3Nzg1NjYsMzQwMDUyODc2OSwzMTEwNjUwOTQyLDk0MTg5Njc0OCwzMjY1NDc4NzUxLDM3MTA0OTMzMCwzMTY4OTM3MjI4LDY3NTAzOTYyNyw0Mjc5MDgwMjU3LDk2NzMxMTcyOSwxMzUwNTAyMDYsMzYzNTczMzY2MCwxNjgzNDA3MjQ4LDIwNzY5MzUyNjUsMzU3Njg3MDUxMiwxMjE1MDYxMTA4LDM1MDE3NDE4OTBdO3ZhciBUNj1bMTM0NzU0ODMyNywxNDAwNzgzMjA1LDMyNzMyNjcxMDgsMjUyMDM5MzU2NiwzNDA5Njg1MzU1LDQwNDUzODA5MzMsMjg4MDI0MDIxNiwyNDcxMjI0MDY3LDE0MjgxNzMwNTAsNDEzODU2MzE4MSwyNDQxNjYxNTU4LDYzNjgxMzkwMCw0MjMzMDk0NjE1LDM2MjAwMjI5ODcsMjE0OTk4NzY1MiwyNDExMDI5MTU1LDEyMzkzMzExNjIsMTczMDUyNTcyMywyNTU0NzE4NzM0LDM3ODEwMzM2NjQsNDYzNDYxMDEsMzEwNDYzNzI4LDI3NDM5NDQ4NTUsMzMyODk1NTM4NSwzODc1NzcwMjA3LDI1MDEyMTg5NzIsMzk1NTE5MTE2MiwzNjY3MjE5MDMzLDc2ODkxNzEyMywzNTQ1Nzg5NDczLDY5MjcwNzQzMywxMTUwMjA4NDU2LDE3ODYxMDI0MDksMjAyOTI5MzE3NywxODA1MjExNzEwLDM3MTAzNjgxMTMsMzA2NTk2MjgzMSw0MDE2Mzk1OTcsMTcyNDQ1NzEzMiwzMDI4MTQzNjc0LDQwOTE5ODQxMCwyMTk2MDUyNTI5LDE2MjA1Mjk0NTksMTE2NDA3MTgwNywzNzY5NzIxOTc1LDIyMjY4NzUzMTAsNDg2NDQxMzc2LDI0OTkzNDg1MjMsMTQ4Mzc1MzU3Niw0Mjg4MTk5NjUsMjI3NDY4MDQyOCwzMDc1NjM2MjE2LDU5ODQzODg2NywzNzk5MTQxMTIyLDE0NzQ1MDI1NDMsNzExMzQ5Njc1LDEyOTE2NjEyMCw1MzQ1ODM3MCwyNTkyNTIzNjQzLDI3ODIwODI4MjQsNDA2MzI0MjM3NSwyOTg4Njg3MjY5LDMxMjA2OTQxMjIsMTU1OTA0MTY2Niw3MzA1MTcyNzYsMjQ2MDQ0OTIwNCw0MDQyNDU5MTIyLDI3MDYyNzA2OTAsMzQ0NjAwNDQ2OCwzNTczOTQxNjk0LDUzMzgwNDEzMCwyMzI4MTQzNjE0LDI2Mzc0NDI2NDMsMjY5NTAzMzY4NSw4MzkyMjQwMzMsMTk3Mzc0NTM4Nyw5NTcwNTU5ODAsMjg1NjM0NTgzOSwxMDY4NTI3NjcsMTM3MTM2ODk3Niw0MTgxNTk4NjAyLDEwMzMyOTcxNTgsMjkzMzczNDkxNywxMTc5NTEwNDYxLDMwNDYyMDA0NjEsOTEzNDE5MTcsMTg2MjUzNDg2OCw0Mjg0NTAyMDM3LDYwNTY1NzMzOSwyNTQ3NDMyOTM3LDM0MzE1NDY5NDcsMjAwMzI5NDYyMiwzMTgyNDg3NjE4LDIyODIxOTUzMzksOTU0NjY5NDAzLDM2ODIxOTE1OTgsMTIwMTc2NTM4NiwzOTE3MjM0NzAzLDMzODg1MDcxNjYsMCwyMTk4NDM4MDIyLDEyMTEyNDc1OTcsMjg4NzY1MTY5NiwxMzE1NzIzODkwLDQyMjc2NjU2NjMsMTQ0Mzg1NzcyMCw1MDczNTg5MzMsNjU3ODYxOTQ1LDE2NzgzODEwMTcsNTYwNDg3NTkwLDM1MTY2MTk2MDQsOTc1NDUxNjk0LDI5NzAzNTYzMjcsMjYxMzE0NTM1LDM1MzUwNzI5MTgsMjY1MjYwOTQyNSwxMzMzODM4MDIxLDI3MjQzMjIzMzYsMTc2NzUzNjQ1OSwzNzA5MzgzOTQsMTgyNjIxMTE0LDM4NTQ2MDYzNzgsMTEyODAxNDU2MCw0ODc3MjU4NDcsMTg1NDY5MTk3LDI5MTgzNTM4NjMsMzEwNjc4MDg0MCwzMzU2NzYxNzY5LDIyMzcxMzMwODEsMTI4NjU2NzE3NSwzMTUyOTc2MzQ5LDQyNTUzNTA2MjQsMjY4Mzc2NTAzMCwzMTYwMTc1MzQ5LDMzMDk1OTQxNzEsODc4NDQzMzkwLDE5ODg4MzgxODUsMzcwNDMwMDQ4NiwxNzU2ODE4OTQwLDE2NzMwNjE2MTcsMzQwMzEwMDYzNiwyNzI3ODYzMDksMTA3NTAyNTY5OCw1NDU1NzIzNjksMjEwNTg4NzI2OCw0MTc0NTYwMDYxLDI5NjY3OTczMCwxODQxNzY4ODY1LDEyNjAyMzIyMzksNDA5MTMyNzAyNCwzOTYwMzA5MzMwLDM0OTc1MDkzNDcsMTgxNDgwMzIyMiwyNTc4MDE4NDg5LDQxOTU0NTYwNzIsNTc1MTM4MTQ4LDMyOTk0MDkwMzYsNDQ2NzU0ODc5LDM2Mjk1NDY3OTYsNDAxMTk5NjA0OCwzMzQ3NTMyMTEwLDMyNTIyMzg1NDUsNDI3MDYzOTc3OCw5MTU5ODU0MTksMzQ4MzgyNTUzNyw2ODE5MzM1MzQsNjUxODY4MDQ2LDI3NTU2MzY2NzEsMzgyODEwMzgzNywyMjMzNzc1NTQsMjYwNzQzOTgyMCwxNjQ5NzA0NTE4LDMyNzA5Mzc4NzUsMzkwMTgwNjc3NiwxNTgwMDg3Nzk5LDQxMTg5ODc2OTUsMzE5ODExNTIwMCwyMDg3MzA5NDU5LDI4NDI2Nzg1NzMsMzAxNjY5NzEwNiwxMDAzMDA3MTI5LDI4MDI4NDk5MTcsMTg2MDczODE0NywyMDc3OTY1MjQzLDE2NDQzOTY3Miw0MTAwODcyNDcyLDMyMjgzMzE5LDI4MjcxNzc4ODIsMTcwOTYxMDM1MCwyMTI1MTM1ODQ2LDEzNjQyODc1MSwzODc0NDI4MzkyLDM2NTI5MDQ4NTksMzQ2MDk4NDYzMCwzNTcyMTQ1OTI5LDM1OTMwNTYzODAsMjkzOTI2NjIyNiw4MjQ4NTIyNTksODE4MzI0ODg0LDMyMjQ3NDA0NTQsOTMwMzY5MjEyLDI4MDE1NjY0MTAsMjk2NzUwNzE1MiwzNTU3MDY4NDAsMTI1NzMwOTMzNiw0MTQ4MjkyODI2LDI0MzI1NjY1Niw3OTAwNzM4NDYsMjM3MzM0MDYzMCwxMjk2Mjk3OTA0LDE0MjI2OTkwODUsMzc1NjI5OTc4MCwzODE4ODM2NDA1LDQ1Nzk5Mjg0MCwzMDk5NjY3NDg3LDIxMzUzMTk4ODksNzc0MjIzMTQsMTU2MDM4MjUxNywxOTQ1Nzk4NTE2LDc4ODIwNDM1MywxNTIxNzA2NzgxLDEzODUzNTYyNDIsODcwOTEyMDg2LDMyNTk2NTM4MywyMzU4OTU3OTIxLDIwNTA0NjYwNjAsMjM4ODI2MDg4NCwyMzEzODg0NDc2LDQwMDY1MjExMjcsOTAxMjEwNTY5LDM5OTA5NTMxODksMTAxNDY0NjcwNSwxNTAzNDQ5ODIzLDEwNjI1OTcyMzUsMjAzMTYyMTMyNiwzMjEyMDM1ODk1LDM5MzEzNzE0NjksMTUzMzAxNzUxNCwzNTAxNzQ1NzUsMjI1NjAyODg5MSwyMTc3NTQ0MTc5LDEwNTIzMzgzNzIsNzQxODc2Nzg4LDE2MDY1OTEyOTYsMTkxNDA1MjAzNSwyMTM3MDUyNTMsMjMzNDY2OTg5NywxMTA3MjM0MTk3LDE4OTk2MDM5NjksMzcyNTA2OTQ5MSwyNjMxNDQ3NzgwLDI0MjI0OTQ5MTMsMTYzNTUwMjk4MCwxODkzMDIwMzQyLDE5NTA5MDMzODgsMTEyMDk3NDkzNV07dmFyIFQ3PVsyODA3MDU4OTMyLDE2OTk5NzA2MjUsMjc2NDI0OTYyMywxNTg2OTAzNTkxLDE4MDg0ODExOTUsMTE3MzQzMDE3MywxNDg3NjQ1OTQ2LDU5OTg0ODY3LDQxOTk4ODI4MDAsMTg0NDg4MjgwNiwxOTg5MjQ5MjI4LDEyNzc1NTU5NzAsMzYyMzYzNjk2NSwzNDE5OTE1NTYyLDExNDkyNDkwNzcsMjc0NDEwNDI5MCwxNTE0NzkwNTc3LDQ1OTc0NDY5OCwyNDQ4NjAzOTQsMzIzNTk5NTEzNCwxOTYzMTE1MzExLDQwMjc3NDQ1ODgsMjU0NDA3ODE1MCw0MTkwNTMwNTE1LDE2MDg5NzUyNDcsMjYyNzAxNjA4MiwyMDYyMjcwMzE3LDE1MDc0OTcyOTgsMjIwMDgxODg3OCw1Njc0OTg4NjgsMTc2NDMxMzU2OCwzMzU5OTM2MjAxLDIzMDU0NTU1NTQsMjAzNzk3MDA2MiwxMDQ3MjM5ZTMsMTkxMDMxOTAzMywxMzM3Mzc2NDgxLDI5MDQwMjcyNzIsMjg5MjQxNzMxMiw5ODQ5MDcyMTQsMTI0MzExMjQxNSw4MzA2NjE5MTQsODYxOTY4MjA5LDIxMzUyNTM1ODcsMjAxMTIxNDE4MCwyOTI3OTM0MzE1LDI2ODYyNTQ3MjEsNzMxMTgzMzY4LDE3NTA2MjYzNzYsNDI0NjMxMDcyNSwxODIwODI0Nzk4LDQxNzI3NjM3NzEsMzU0MjMzMDIyNyw0ODM5NDgyNywyNDA0OTAxNjYzLDI4NzE2ODI2NDUsNjcxNTkzMTk1LDMyNTQ5ODg3MjUsMjA3MzcyNDYxMywxNDUwODUyMzksMjI4MDc5NjIwMCwyNzc5OTE1MTk5LDE3OTA1NzUxMDcsMjE4NzEyODA4Niw0NzI2MTU2MzEsMzAyOTUxMDAwOSw0MDc1ODc3MTI3LDM4MDIyMjIxODUsNDEwNzEwMTY1OCwzMjAxNjMxNzQ5LDE2NDYyNTIzNDAsNDI3MDUwNzE3NCwxNDAyODExNDM4LDE0MzY1OTA4MzUsMzc3ODE1MTgxOCwzOTUwMzU1NzAyLDM5NjMxNjE0NzUsNDAyMDkxMjIyNCwyNjY3OTk0NzM3LDI3Mzc5MjM2NiwyMzMxNTkwMTc3LDEwNDY5OTYxMyw5NTM0NTk4MiwzMTc1NTAxMjg2LDIzNzc0ODY2NzYsMTU2MDYzNzg5MiwzNTY0MDQ1MzE4LDM2OTA1Nzg3Miw0MjEzNDQ3MDY0LDM5MTkwNDIyMzcsMTEzNzQ3Nzk1MiwyNjU4NjI1NDk3LDExMTk3Mjc4NDgsMjM0MDk0Nzg0OSwxNTMwNDU1ODMzLDQwMDczNjA5NjgsMTcyNDY2NTU2LDI2Njk1OTkzOCw1MTY1NTI4MzYsMCwyMjU2NzM0NTkyLDM5ODA5MzE2MjcsMTg5MDMyODA4MSwxOTE3NzQyMTcwLDQyOTQ3MDQzOTgsOTQ1MTY0MTY1LDM1NzU1Mjg4NzgsOTU4ODcxMDg1LDM2NDcyMTIwNDcsMjc4NzIwNzI2MCwxNDIzMDIyOTM5LDc3NTU2MjI5NCwxNzM5NjU2MjAyLDM4NzY1NTc2NTUsMjUzMDM5MTI3OCwyNDQzMDU4MDc1LDMzMTAzMjE4NTYsNTQ3NTEyNzk2LDEyNjUxOTU2MzksNDM3NjU2NTk0LDMxMjEyNzU1MzksNzE5NzAwMTI4LDM3NjI1MDI2OTAsMzg3NzgxMTQ3LDIxODgyODI5NywzMzUwMDY1ODAzLDI4MzA3MDgxNTAsMjg0ODQ2MTg1NCw0MjgxNjkyMDEsMTIyNDY2MTY1LDM3MjAwODEwNDksMTYyNzIzNTE5OSw2NDgwMTc2NjUsNDEyMjc2MjM1NCwxMDAyNzgzODQ2LDIxMTczNjA2MzUsNjk1NjM0NzU1LDMzMzYzNTg2OTEsNDIzNDcyMTAwNSw0MDQ5ODQ0NDUyLDM3MDQyODA4ODEsMjIzMjQzNTI5OSw1NzQ2MjQ2NjMsMjg3MzQzODE0LDYxMjIwNTg5OCwxMDM5NzE3MDUxLDg0MDAxOTcwNSwyNzA4MzI2MTg1LDc5MzQ1MTkzNCw4MjEyODgxMTQsMTM5MTIwMTY3MCwzODIyMDkwMTc3LDM3NjE4NzgyNywzMTEzODU1MzQ0LDEyMjQzNDgwNTIsMTY3OTk2ODIzMywyMzYxNjk4NTU2LDEwNTg3MDk3NDQsNzUyMzc1NDIxLDI0MzE1OTA5NjMsMTMyMTY5OTE0NSwzNTE5MTQyMjAwLDI3MzQ1OTExNzgsMTg4MTI3NDQ0LDIxNzc4Njk1NTcsMzcyNzIwNTc1NCwyMzg0OTExMDMxLDMyMTUyMTI0NjEsMjY0ODk3NjQ0MiwyNDUwMzQ2MTA0LDM0MzI3MzczNzUsMTE4MDg0OTI3OCwzMzE1NDQyMDUsMzEwMjI0OTE3Niw0MTUwMTQ0NTY5LDI5NTIxMDI1OTUsMjE1OTk3NjI4NSwyNDc0NDA0MzA0LDc2NjA3ODkzMywzMTM3NzM4NjEsMjU3MDgzMjA0NCwyMTA4MTAwNjMyLDE2NjgyMTI4OTIsMzE0NTQ1NjQ0MywyMDEzOTA4MjYyLDQxODY3MjIxNywzMDcwMzU2NjM0LDI1OTQ3MzQ5MjcsMTg1MjE3MTkyNSwzODY3MDYwOTkxLDM0NzM0MTY2MzYsMzkwNzQ0ODU5NywyNjE0NzM3NjM5LDkxOTQ4OTEzNSwxNjQ5NDg2MzksMjA5NDQxMDE2MCwyOTk3ODI1OTU2LDU5MDQyNDYzOSwyNDg2MjI0NTQ5LDE3MjM4NzI2NzQsMzE1Nzc1MDg2MiwzMzk5OTQxMjUwLDM1MDEyNTI3NTIsMzYyNTI2ODEzNSwyNTU1MDQ4MTk2LDM2NzM2MzczNTYsMTM0MzEyNzUwMSw0MTMwMjgxMzYxLDM1OTk1OTUwODUsMjk1Nzg1MzY3OSwxMjk3NDAzMDUwLDgxNzgxOTEwLDMwNTE1OTM0MjUsMjI4MzQ5MDQxMCw1MzIyMDE3NzIsMTM2NzI5NTU4OSwzOTI2MTcwOTc0LDg5NTI4NzY5MiwxOTUzNzU3ODMxLDEwOTM1OTc5NjMsNDkyNDgzNDMxLDM1Mjg2MjY5MDcsMTQ0NjI0MjU3NiwxMTkyNDU1NjM4LDE2MzY2MDQ2MzEsMjA5MzM2MjI1LDM0NDg3MzQ2NCwxMDE1NjcxNTcxLDY2OTk2MTg5NywzMzc1NzQwNzY5LDM4NTc1NzIxMjQsMjk3MzUzMDY5NSwzNzQ3MTkyMDE4LDE5MzM1MzA2MTAsMzQ2NDA0MjUxNiw5MzUyOTM4OTUsMzQ1NDY4NjE5OSwyODU4MTE1MDY5LDE4NjM2Mzg4NDUsMzY4MzAyMjkxNiw0MDg1MzY5NTE5LDMyOTI0NDUwMzIsODc1MzEzMTg4LDEwODAwMTc1NzEsMzI3OTAzMzg4NSw2MjE1OTE3NzgsMTIzMzg1NjU3MiwyNTA0MTMwMzE3LDI0MTk3NTQ0LDMwMTc2NzI3MTYsMzgzNTQ4NDM0MCwzMjQ3NDY1NTU4LDIyMjA5ODExOTUsMzA2MDg0NzkyMiwxNTUxMTI0NTg4LDE0NjM5OTY2MDBdO3ZhciBUOD1bNDEwNDYwNTc3NywxMDk3MTU5NTUwLDM5NjY3MzgxOCw2NjA1MTAyNjYsMjg3NTk2ODMxNSwyNjM4NjA2NjIzLDQyMDAxMTUxMTYsMzgwODY2MjM0Nyw4MjE3MTIxNjAsMTk4NjkxODA2MSwzNDMwMzIyNTY4LDM4NTQ0ODg1LDM4NTYxMzcyOTUsNzE4MDAyMTE3LDg5MzY4MTcwMiwxNjU0ODg2MzI1LDI5NzU0ODQzODIsMzEyMjM1ODA1MywzOTI2ODI1MDI5LDQyNzQwNTM0NjksNzk2MTk3NTcxLDEyOTA4MDE3OTMsMTE4NDM0MjkyNSwzNTU2MzYxODM1LDI0MDU0MjY5NDcsMjQ1OTczNTMxNywxODM2NzcyMjg3LDEzODE2MjAzNzMsMzE5NjI2Nzk4OCwxOTQ4MzczODQ4LDM3NjQ5ODgyMzMsMzM4NTM0NTE2NiwzMjYzNzg1NTg5LDIzOTAzMjU0OTIsMTQ4MDQ4NTc4NSwzMTExMjQ3MTQzLDM3ODAwOTc3MjYsMjI5MzA0NTIzMiw1NDgxNjk0MTcsMzQ1OTk1Mzc4OSwzNzQ2MTc1MDc1LDQzOTQ1MjM4OSwxMzYyMzIxNTU5LDE0MDA4NDk3NjIsMTY4NTU3NzkwNSwxODA2NTk5MzU1LDIxNzQ3NTQwNDYsMTM3MDczOTEzLDEyMTQ3OTc5MzYsMTE3NDIxNTA1NSwzNzMxNjU0NTQ4LDIwNzk4OTc0MjYsMTk0MzIxNzA2NywxMjU4NDgwMjQyLDUyOTQ4Nzg0MywxNDM3MjgwODcwLDM5NDUyNjkxNzAsMzA0OTM5MDg5NSwzMzEzMjEyMDM4LDkyMzMxMzYxOSw2Nzk5OThlMywzMjE1MzA3Mjk5LDU3MzI2MDgyLDM3NzY0MjIyMSwzNDc0NzI5ODY2LDIwNDE4NzcxNTksMTMzMzYxOTA3LDE3NzY0NjAxMTAsMzY3MzQ3NjQ1Myw5NjM5MjQ1NCw4Nzg4NDU5MDUsMjgwMTY5OTUyNCw3NzcyMzE2NjgsNDA4MjQ3NTE3MCwyMzMwMDE0MjEzLDQxNDI2MjYyMTIsMjIxMzI5NjM5NSwxNjI2MzE5NDI0LDE5MDYyNDcyNjIsMTg0NjU2MzI2MSw1NjI3NTU5MDIsMzcwODE3MzcxOCwxMDQwNTU5ODM3LDM4NzExNjM5ODEsMTQxODU3MzIwMSwzMjk0NDMwNTc3LDExNDU4NTM0OCwxMzQzNjE4OTEyLDI1NjY1OTU2MDksMzE4NjIwMjU4MiwxMDc4MTg1MDk3LDM2NTEwNDExMjcsMzg5NjY4ODA0OCwyMzA3NjIyOTE5LDQyNTQwODc0MywzMzcxMDk2OTUzLDIwODEwNDg0ODEsMTEwODMzOTA2OCwyMjE2NjEwMjk2LDAsMjE1NjI5OTAxNyw3MzY5NzA4MDIsMjkyNTk2NzY2LDE1MTc0NDA2MjAsMjUxNjU3MjEzLDIyMzUwNjE3NzUsMjkzMzIwMjQ5Myw3NTg3MjAzMTAsMjY1OTA1MTYyLDE1NTQzOTE0MDAsMTUzMjI4NTMzOSw5MDg5OTkyMDQsMTc0NTY3NjkyLDE0NzQ3NjA1OTUsNDAwMjg2MTc0OCwyNjEwMDExNjc1LDMyMzQxNTY0MTYsMzY5MzEyNjI0MSwyMDAxNDMwODc0LDMwMzY5OTQ4NCwyNDc4NDQzMjM0LDI2ODcxNjU4ODgsNTg1MTIyNjIwLDQ1NDQ5OTYwMiwxNTE4NDk3NDIsMjM0NTExOTIxOCwzMDY0NTEwNzY1LDUxNDQ0MzI4NCw0MDQ0OTgxNTkxLDE5NjM0MTI2NTUsMjU4MTQ0NTYxNCwyMTM3MDYyODE5LDE5MzA4NTM1LDE5Mjg3MDcxNjQsMTcxNTE5MzE1Niw0MjE5MzUyMTU1LDExMjY3OTA3OTUsNjAwMjM1MjExLDM5OTI3NDIwNzAsMzg0MTAyNDk1Miw4MzY1NTM0MzEsMTY2OTY2NDgzNCwyNTM1NjA0MjQzLDMzMjMwMTEyMDQsMTI0MzkwNTQxMywzMTQxNDAwNzg2LDQxODA4MDgxMTAsNjk4NDQ1MjU1LDI2NTM4OTk1NDksMjk4OTU1MjYwNCwyMjUzNTgxMzI1LDMyNTI5MzI3MjcsMzAwNDU5MTE0NywxODkxMjExNjg5LDI0ODc4MTA1NzcsMzkxNTY1MzcwMyw0MjM3MDgzODE2LDQwMzA2Njc0MjQsMjEwMDA5MDk2Niw4NjUxMzY0MTgsMTIyOTg5OTY1NSw5NTMyNzA3NDUsMzM5OTY3OTYyOCwzNTU3NTA0NjY0LDQxMTg5MjUyMjIsMjA2MTM3OTc0OSwzMDc5NTQ2NTg2LDI5MTUwMTc3OTEsOTgzNDI2MDkyLDIwMjI4Mzc1ODQsMTYwNzI0NDY1MCwyMTE4NTQxOTA4LDIzNjY4ODI1NTAsMzYzNTk5NjgxNiw5NzI1MTI4MTQsMzI4MzA4ODc3MCwxNTY4NzE4NDk1LDM0OTkzMjY1NjksMzU3NjUzOTUwMyw2MjE5ODI2NzEsMjg5NTcyMzQ2NCw0MTA4ODc5NTIsMjYyMzc2MjE1MiwxMDAyMTQyNjgzLDY0NTQwMTAzNywxNDk0ODA3NjYyLDI1OTU2ODQ4NDQsMTMzNTUzNTc0NywyNTA3MDQwMjMwLDQyOTMyOTU3ODYsMzE2NzY4NDY0MSwzNjc1ODUwMDcsMzg4NTc1MDcxNCwxODY1ODYyNzMwLDI2NjgyMjE2NzQsMjk2MDk3MTMwNSwyNzYzMTczNjgxLDEwNTkyNzA5NTQsMjc3Nzk1MjQ1NCwyNzI0NjQyODY5LDEzMjA5NTc4MTIsMjE5NDMxOTEwMCwyNDI5NTk1ODcyLDI4MTU5NTYyNzUsNzcwODk1MjEsMzk3Mzc3MzEyMSwzNDQ0NTc1ODcxLDI0NDg4MzAyMzEsMTMwNTkwNjU1MCw0MDIxMzA4NzM5LDI4NTcxOTQ3MDAsMjUxNjkwMTg2MCwzNTE4MzU4NDMwLDE3ODczMDQ3ODAsNzQwMjc2NDE3LDE2OTk4Mzk4MTQsMTU5MjM5NDkwOSwyMzUyMzA3NDU3LDIyNzI1NTYwMjYsMTg4ODIxMjQzLDE3Mjk5NzcwMTEsMzY4Nzk5NDAwMiwyNzQwODQ4NDEsMzU5NDk4MjI1MywzNjEzNDk0NDI2LDI3MDE5NDk0OTUsNDE2MjA5NjcyOSwzMjI3MzQ1NzEsMjgzNzk2NjU0MiwxNjQwNTc2NDM5LDQ4NDgzMDY4OSwxMjAyNzk3NjkwLDM1Mzc4NTI4MjgsNDA2NzYzOTEyNSwzNDkwNzU3MzYsMzM0MjMxOTQ3NSw0MTU3NDY3MjE5LDQyNTU4MDAxNTksMTAzMDY5MDAxNSwxMTU1MjM3NDk2LDI5NTE5NzEyNzQsMTc1NzY5MTU3Nyw2MDczOTg5NjgsMjczODkwNTAyNiw0OTkzNDc5OTAsMzc5NDA3ODkwOCwxMDExNDUyNzEyLDIyNzg4NTU2NywyODE4NjY2ODA5LDIxMzExNDM3NiwzMDM0ODgxMjQwLDE0NTU1MjU5ODgsMzQxNDQ1MDU1NSw4NTA4MTcyMzcsMTgxNzk5ODQwOCwzMDkyNzI2NDgwXTt2YXIgVTE9WzAsMjM1NDc0MTg3LDQ3MDk0ODM3NCwzMDM3NjUyNzcsOTQxODk2NzQ4LDkwODkzMzQxNSw2MDc1MzA1NTQsNzA4NzgwODQ5LDE4ODM3OTM0OTYsMjExODIxNDk5NSwxODE3ODY2ODMwLDE2NDk2MzkyMzcsMTIxNTA2MTEwOCwxMTgxMDQ1MTE5LDE0MTc1NjE2OTgsMTUxNzc2NzUyOSwzNzY3NTg2OTkyLDQwMDMwNjExNzksNDIzNjQyOTk5MCw0MDY5MjQ2ODkzLDM2MzU3MzM2NjAsMzYwMjc3MDMyNywzMjk5Mjc4NDc0LDM0MDA1Mjg3NjksMjQzMDEyMjIxNiwyNjY0NTQzNzE1LDIzNjIwOTAyMzgsMjE5Mzg2MjY0NSwyODM1MTIzMzk2LDI4MDExMDc0MDcsMzAzNTUzNTA1OCwzMTM1NzQwODg5LDM2NzgxMjQ5MjMsMzU3Njg3MDUxMiwzMzQxMzk0Mjg1LDMzNzQzNjE3MDIsMzgxMDQ5NjM0MywzOTc3Njc1MzU2LDQyNzkwODAyNTcsNDA0MzYxMDE4NiwyODc2NDk0NjI3LDI3NzYyOTI5MDQsMzA3NjYzOTAyOSwzMTEwNjUwOTQyLDI0NzIwMTE1MzUsMjY0MDI0MzIwNCwyNDAzNzI4NjY1LDIxNjkzMDMwNTgsMTAwMTA4OTk5NSw4OTk4MzU1ODQsNjY2NDY0NzMzLDY5OTQzMjE1MCw1OTcyNzg0NywyMjY5MDY4NjAsNTMwNDAwNzUzLDI5NDkzMDY4MiwxMjczMTY4Nzg3LDExNzI5NjcwNjQsMTQ3NTQxODUwMSwxNTA5NDMwNDE0LDE5NDI0MzU3NzUsMjExMDY2NzQ0NCwxODc2MjQxODMzLDE2NDE4MTYyMjYsMjkxMDIxOTc2NiwyNzQzMDM0MTA5LDI5NzYxNTE1MjAsMzIxMTYyMzE0NywyNTA1MjAyMTM4LDI2MDY0NTM5NjksMjMwMjY5MDI1MiwyMjY5NzI4NDU1LDM3MTE4Mjk0MjIsMzU0MzU5OTI2OSwzMjQwODk0MzkyLDM0NzUzMTMzMzEsMzg0MzY5OTA3NCwzOTQzOTA2NDQxLDQxNzgwNjIyMjgsNDE0NDA0Nzc3NSwxMzA2OTY3MzY2LDExMzk3ODE3MDksMTM3NDk4ODExMiwxNjEwNDU5NzM5LDE5NzU2ODM0MzQsMjA3NjkzNTI2NSwxNzc1Mjc2OTI0LDE3NDIzMTUxMjcsMTAzNDg2Nzk5OCw4NjY2Mzc4NDUsNTY2MDIxODk2LDgwMDQ0MDgzNSw5Mjk4NzY5OCwxOTMxOTUwNjUsNDI5NDU2MTY0LDM5NTQ0MTcxMSwxOTg0ODEyNjg1LDIwMTc3Nzg1NjYsMTc4NDY2MzE5NSwxNjgzNDA3MjQ4LDEzMTU1NjIxNDUsMTA4MDA5NDYzNCwxMzgzODU2MzExLDE1NTEwMzc4ODQsMTAxMDM5ODI5LDEzNTA1MDIwNiw0Mzc3NTcxMjMsMzM3NTUzODY0LDEwNDIzODU2NTcsODA3OTYyNjEwLDU3MzgwNDc4Myw3NDIwMzkwMTIsMjUzMTA2NzQ1MywyNTY0MDMzMzM0LDIzMjg4Mjg5NzEsMjIyNzU3MzAyNCwyOTM1NTY2ODY1LDI3MDAwOTkzNTQsMzAwMTc1NTY1NSwzMTY4OTM3MjI4LDM4Njg1NTI4MDUsMzkwMjU2MzE4Miw0MjAzMTgxMTcxLDQxMDI5Nzc5MTIsMzczNjE2NDkzNywzNTAxNzQxODkwLDMyNjU0Nzg3NTEsMzQzMzcxMjk4MCwxMTA2MDQxNTkxLDEzNDA0NjMxMDAsMTU3Njk3NjYwOSwxNDA4NzQ5MDM0LDIwNDMyMTE0ODMsMjAwOTE5NTQ3MiwxNzA4ODQ4MzMzLDE4MDkwNTQxNTAsODMyODc3MjMxLDEwNjgzNTEzOTYsNzY2OTQ1NDY1LDU5OTc2MjM1NCwxNTk0MTc5ODcsMTI2NDU0NjY0LDM2MTkyOTg3Nyw0NjMxODAxOTAsMjcwOTI2MDg3MSwyOTQzNjgyMzgwLDMxNzgxMDY5NjEsMzAwOTg3OTM4NiwyNTcyNjk3MTk1LDI1Mzg2ODExODQsMjIzNjIyODczMywyMzM2NDM0NTUwLDM1MDk4NzExMzUsMzc0NTM0NTMwMCwzNDQxODUwMzc3LDMyNzQ2NjcyNjYsMzkxMDE2MTk3MSwzODc3MTk4NjQ4LDQxMTA1Njg0ODUsNDIxMTgxODc5OCwyNTk3ODA2NDc2LDI0OTc2MDQ3NDMsMjI2MTA4OTE3OCwyMjk1MTAxMDczLDI3MzM4NTYxNjAsMjkwMjA4Nzg1MSwzMjAyNDM3MDQ2LDI5NjgwMTE0NTMsMzkzNjI5MTI4NCwzODM1MDM2ODk1LDQxMzY0NDA3NzAsNDE2OTQwODIwMSwzNTM1NDg2NDU2LDM3MDI2NjU0NTksMzQ2NzE5MjMwMiwzMjMxNzIyMjEzLDIwNTE1MTg3ODAsMTk1MTMxNzA0NywxNzE2ODkwNDEwLDE3NTA5MDIzMDUsMTExMzgxODM4NCwxMjgyMDUwMDc1LDE1ODQ1MDQ1ODIsMTM1MDA3ODk4OSwxNjg4MTA4NTIsNjc1NTY0NjMsMzcxMDQ5MzMwLDQwNDAxNjc2MSw4NDE3Mzk1OTIsMTAwODkxODU5NSw3NzU1NTA4MTQsNTQwMDgwNzI1LDM5Njk1NjIzNjksMzgwMTMzMjIzNCw0MDM1NDg5MDQ3LDQyNjk5MDc5OTYsMzU2OTI1NTIxMywzNjY5NDYyNTY2LDMzNjY3NTQ2MTksMzMzMjc0MDE0NCwyNjMxMDY1NDMzLDI0NjM4Nzk3NjIsMjE2MDExNzA3MSwyMzk1NTg4Njc2LDI3Njc2NDU1NTcsMjg2ODg5NzQwNiwzMTAyMDExNzQ3LDMwNjkwNDk5NjAsMjAyMDA4NDk3LDMzNzc4MzYyLDI3MDA0MDQ4Nyw1MDQ0NTk0MzYsODc1NDUxMjkzLDk3NTY1ODY0Niw2NzUwMzk2MjcsNjQxMDI1MTUyLDIwODQ3MDQyMzMsMTkxNzUxODU2MiwxNjE1ODYxMjQ3LDE4NTEzMzI4NTIsMTE0NzU1MDY2MSwxMjQ4ODAyNTEwLDE0ODQwMDU4NDMsMTQ1MTA0NDA1Niw5MzMzMDEzNzAsOTY3MzExNzI5LDczMzE1Njk3Miw2MzI5NTM3MDMsMjYwMzg4OTUwLDI1OTY1OTE3LDMyODY3MTgwOCw0OTY5MDYwNTksMTIwNjQ3Nzg1OCwxMjM5NDQzNzUzLDE1NDMyMDg1MDAsMTQ0MTk1MjU3NSwyMTQ0MTYxODA2LDE5MDg2OTQyNzcsMTY3NTU3Nzg4MCwxODQyNzU5NDQzLDM2MTAzNjkyMjYsMzY0NDM3OTU4NSwzNDA4MTE5NTE2LDMzMDc5MTYyNDcsNDAxMTE5MDUwMiwzNzc2NzY3NDY5LDQwNzczODQ0MzIsNDI0NTYxODY4MywyODA5NzcxMTU0LDI4NDI3MzcwNDksMzE0NDM5NjQyMCwzMDQzMTQwNDk1LDI2NzM3MDUxNTAsMjQzODIzNzYyMSwyMjAzMDMyMjMyLDIzNzAyMTM3OTVdO3ZhciBVMj1bMCwxODU0NjkxOTcsMzcwOTM4Mzk0LDQ4NzcyNTg0Nyw3NDE4NzY3ODgsNjU3ODYxOTQ1LDk3NTQ1MTY5NCw4MjQ4NTIyNTksMTQ4Mzc1MzU3NiwxNDAwNzgzMjA1LDEzMTU3MjM4OTAsMTE2NDA3MTgwNywxOTUwOTAzMzg4LDIxMzUzMTk4ODksMTY0OTcwNDUxOCwxNzY3NTM2NDU5LDI5Njc1MDcxNTIsMzE1Mjk3NjM0OSwyODAxNTY2NDEwLDI5MTgzNTM4NjMsMjYzMTQ0Nzc4MCwyNTQ3NDMyOTM3LDIzMjgxNDM2MTQsMjE3NzU0NDE3OSwzOTAxODA2Nzc2LDM4MTg4MzY0MDUsNDI3MDYzOTc3OCw0MTE4OTg3Njk1LDMyOTk0MDkwMzYsMzQ4MzgyNTUzNywzNTM1MDcyOTE4LDM2NTI5MDQ4NTksMjA3Nzk2NTI0MywxODkzMDIwMzQyLDE4NDE3Njg4NjUsMTcyNDQ1NzEzMiwxNDc0NTAyNTQzLDE1NTkwNDE2NjYsMTEwNzIzNDE5NywxMjU3MzA5MzM2LDU5ODQzODg2Nyw2ODE5MzM1MzQsOTAxMjEwNTY5LDEwNTIzMzgzNzIsMjYxMzE0NTM1LDc3NDIyMzE0LDQyODgxOTk2NSwzMTA0NjM3MjgsMzQwOTY4NTM1NSwzMjI0NzQwNDU0LDM3MTAzNjgxMTMsMzU5MzA1NjM4MCwzODc1NzcwMjA3LDM5NjAzMDkzMzAsNDA0NTM4MDkzMyw0MTk1NDU2MDcyLDI0NzEyMjQwNjcsMjU1NDcxODczNCwyMjM3MTMzMDgxLDIzODgyNjA4ODQsMzIxMjAzNTg5NSwzMDI4MTQzNjc0LDI4NDI2Nzg1NzMsMjcyNDMyMjMzNiw0MTM4NTYzMTgxLDQyNTUzNTA2MjQsMzc2OTcyMTk3NSwzOTU1MTkxMTYyLDM2NjcyMTkwMzMsMzUxNjYxOTYwNCwzNDMxNTQ2OTQ3LDMzNDc1MzIxMTAsMjkzMzczNDkxNywyNzgyMDgyODI0LDMwOTk2Njc0ODcsMzAxNjY5NzEwNiwyMTk2MDUyNTI5LDIzMTM4ODQ0NzYsMjQ5OTM0ODUyMywyNjgzNzY1MDMwLDExNzk1MTA0NjEsMTI5NjI5NzkwNCwxMzQ3NTQ4MzI3LDE1MzMwMTc1MTQsMTc4NjEwMjQwOSwxNjM1NTAyOTgwLDIwODczMDk0NTksMjAwMzI5NDYyMiw1MDczNTg5MzMsMzU1NzA2ODQwLDEzNjQyODc1MSw1MzQ1ODM3MCw4MzkyMjQwMzMsOTU3MDU1OTgwLDYwNTY1NzMzOSw3OTAwNzM4NDYsMjM3MzM0MDYzMCwyMjU2MDI4ODkxLDI2MDc0Mzk4MjAsMjQyMjQ5NDkxMywyNzA2MjcwNjkwLDI4NTYzNDU4MzksMzA3NTYzNjIxNiwzMTYwMTc1MzQ5LDM1NzM5NDE2OTQsMzcyNTA2OTQ5MSwzMjczMjY3MTA4LDMzNTY3NjE3NjksNDE4MTU5ODYwMiw0MDYzMjQyMzc1LDQwMTE5OTYwNDgsMzgyODEwMzgzNywxMDMzMjk3MTU4LDkxNTk4NTQxOSw3MzA1MTcyNzYsNTQ1NTcyMzY5LDI5NjY3OTczMCw0NDY3NTQ4NzksMTI5MTY2MTIwLDIxMzcwNTI1MywxNzA5NjEwMzUwLDE4NjA3MzgxNDcsMTk0NTc5ODUxNiwyMDI5MjkzMTc3LDEyMzkzMzExNjIsMTEyMDk3NDkzNSwxNjA2NTkxMjk2LDE0MjI2OTkwODUsNDE0ODI5MjgyNiw0MjMzMDk0NjE1LDM3ODEwMzM2NjQsMzkzMTM3MTQ2OSwzNjgyMTkxNTk4LDM0OTc1MDkzNDcsMzQ0NjAwNDQ2OCwzMzI4OTU1Mzg1LDI5MzkyNjYyMjYsMjc1NTYzNjY3MSwzMTA2NzgwODQwLDI5ODg2ODcyNjksMjE5ODQzODAyMiwyMjgyMTk1MzM5LDI1MDEyMTg5NzIsMjY1MjYwOTQyNSwxMjAxNzY1Mzg2LDEyODY1NjcxNzUsMTM3MTM2ODk3NiwxNTIxNzA2NzgxLDE4MDUyMTE3MTAsMTYyMDUyOTQ1OSwyMTA1ODg3MjY4LDE5ODg4MzgxODUsNTMzODA0MTMwLDM1MDE3NDU3NSwxNjQ0Mzk2NzIsNDYzNDYxMDEsODcwOTEyMDg2LDk1NDY2OTQwMyw2MzY4MTM5MDAsNzg4MjA0MzUzLDIzNTg5NTc5MjEsMjI3NDY4MDQyOCwyNTkyNTIzNjQzLDI0NDE2NjE1NTgsMjY5NTAzMzY4NSwyODgwMjQwMjE2LDMwNjU5NjI4MzEsMzE4MjQ4NzYxOCwzNTcyMTQ1OTI5LDM3NTYyOTk3ODAsMzI3MDkzNzg3NSwzMzg4NTA3MTY2LDQxNzQ1NjAwNjEsNDA5MTMyNzAyNCw0MDA2NTIxMTI3LDM4NTQ2MDYzNzgsMTAxNDY0NjcwNSw5MzAzNjkyMTIsNzExMzQ5Njc1LDU2MDQ4NzU5MCwyNzI3ODYzMDksNDU3OTkyODQwLDEwNjg1Mjc2NywyMjMzNzc1NTQsMTY3ODM4MTAxNywxODYyNTM0ODY4LDE5MTQwNTIwMzUsMjAzMTYyMTMyNiwxMjExMjQ3NTk3LDExMjgwMTQ1NjAsMTU4MDA4Nzc5OSwxNDI4MTczMDUwLDMyMjgzMzE5LDE4MjYyMTExNCw0MDE2Mzk1OTcsNDg2NDQxMzc2LDc2ODkxNzEyMyw2NTE4NjgwNDYsMTAwMzAwNzEyOSw4MTgzMjQ4ODQsMTUwMzQ0OTgyMywxMzg1MzU2MjQyLDEzMzM4MzgwMjEsMTE1MDIwODQ1NiwxOTczNzQ1Mzg3LDIxMjUxMzU4NDYsMTY3MzA2MTYxNywxNzU2ODE4OTQwLDI5NzAzNTYzMjcsMzEyMDY5NDEyMiwyODAyODQ5OTE3LDI4ODc2NTE2OTYsMjYzNzQ0MjY0MywyNTIwMzkzNTY2LDIzMzQ2Njk4OTcsMjE0OTk4NzY1MiwzOTE3MjM0NzAzLDM3OTkxNDExMjIsNDI4NDUwMjAzNyw0MTAwODcyNDcyLDMzMDk1OTQxNzEsMzQ2MDk4NDYzMCwzNTQ1Nzg5NDczLDM2Mjk1NDY3OTYsMjA1MDQ2NjA2MCwxODk5NjAzOTY5LDE4MTQ4MDMyMjIsMTczMDUyNTcyMywxNDQzODU3NzIwLDE1NjAzODI1MTcsMTA3NTAyNTY5OCwxMjYwMjMyMjM5LDU3NTEzODE0OCw2OTI3MDc0MzMsODc4NDQzMzkwLDEwNjI1OTcyMzUsMjQzMjU2NjU2LDkxMzQxOTE3LDQwOTE5ODQxMCwzMjU5NjUzODMsMzQwMzEwMDYzNiwzMjUyMjM4NTQ1LDM3MDQzMDA0ODYsMzYyMDAyMjk4NywzODc0NDI4MzkyLDM5OTA5NTMxODksNDA0MjQ1OTEyMiw0MjI3NjY1NjYzLDI0NjA0NDkyMDQsMjU3ODAxODQ4OSwyMjI2ODc1MzEwLDI0MTEwMjkxNTUsMzE5ODExNTIwMCwzMDQ2MjAwNDYxLDI4MjcxNzc4ODIsMjc0Mzk0NDg1NV07dmFyIFUzPVswLDIxODgyODI5Nyw0Mzc2NTY1OTQsMzg3NzgxMTQ3LDg3NTMxMzE4OCw5NTg4NzEwODUsNzc1NTYyMjk0LDU5MDQyNDYzOSwxNzUwNjI2Mzc2LDE2OTk5NzA2MjUsMTkxNzc0MjE3MCwyMTM1MjUzNTg3LDE1NTExMjQ1ODgsMTM2NzI5NTU4OSwxMTgwODQ5Mjc4LDEyNjUxOTU2MzksMzUwMTI1Mjc1MiwzNzIwMDgxMDQ5LDMzOTk5NDEyNTAsMzM1MDA2NTgwMywzODM1NDg0MzQwLDM5MTkwNDIyMzcsNDI3MDUwNzE3NCw0MDg1MzY5NTE5LDMxMDIyNDkxNzYsMzA1MTU5MzQyNSwyNzM0NTkxMTc4LDI5NTIxMDI1OTUsMjM2MTY5ODU1NiwyMTc3ODY5NTU3LDI1MzAzOTEyNzgsMjYxNDczNzYzOSwzMTQ1NDU2NDQzLDMwNjA4NDc5MjIsMjcwODMyNjE4NSwyODkyNDE3MzEyLDI0MDQ5MDE2NjMsMjE4NzEyODA4NiwyNTA0MTMwMzE3LDI1NTUwNDgxOTYsMzU0MjMzMDIyNywzNzI3MjA1NzU0LDMzNzU3NDA3NjksMzI5MjQ0NTAzMiwzODc2NTU3NjU1LDM5MjYxNzA5NzQsNDI0NjMxMDcyNSw0MDI3NzQ0NTg4LDE4MDg0ODExOTUsMTcyMzg3MjY3NCwxOTEwMzE5MDMzLDIwOTQ0MTAxNjAsMTYwODk3NTI0NywxMzkxMjAxNjcwLDExNzM0MzAxNzMsMTIyNDM0ODA1Miw1OTk4NDg2NywyNDQ4NjAzOTQsNDI4MTY5MjAxLDM0NDg3MzQ2NCw5MzUyOTM4OTUsOTg0OTA3MjE0LDc2NjA3ODkzMyw1NDc1MTI3OTYsMTg0NDg4MjgwNiwxNjI3MjM1MTk5LDIwMTEyMTQxODAsMjA2MjI3MDMxNywxNTA3NDk3Mjk4LDE0MjMwMjI5MzksMTEzNzQ3Nzk1MiwxMzIxNjk5MTQ1LDk1MzQ1OTgyLDE0NTA4NTIzOSw1MzIyMDE3NzIsMzEzNzczODYxLDgzMDY2MTkxNCwxMDE1NjcxNTcxLDczMTE4MzM2OCw2NDgwMTc2NjUsMzE3NTUwMTI4NiwyOTU3ODUzNjc5LDI4MDcwNTg5MzIsMjg1ODExNTA2OSwyMzA1NDU1NTU0LDIyMjA5ODExOTUsMjQ3NDQwNDMwNCwyNjU4NjI1NDk3LDM1NzU1Mjg4NzgsMzYyNTI2ODEzNSwzNDczNDE2NjM2LDMyNTQ5ODg3MjUsMzc3ODE1MTgxOCwzOTYzMTYxNDc1LDQyMTM0NDcwNjQsNDEzMDI4MTM2MSwzNTk5NTk1MDg1LDM2ODMwMjI5MTYsMzQzMjczNzM3NSwzMjQ3NDY1NTU4LDM4MDIyMjIxODUsNDAyMDkxMjIyNCw0MTcyNzYzNzcxLDQxMjI3NjIzNTQsMzIwMTYzMTc0OSwzMDE3NjcyNzE2LDI3NjQyNDk2MjMsMjg0ODQ2MTg1NCwyMzMxNTkwMTc3LDIyODA3OTYyMDAsMjQzMTU5MDk2MywyNjQ4OTc2NDQyLDEwNDY5OTYxMywxODgxMjc0NDQsNDcyNjE1NjMxLDI4NzM0MzgxNCw4NDAwMTk3MDUsMTA1ODcwOTc0NCw2NzE1OTMxOTUsNjIxNTkxNzc4LDE4NTIxNzE5MjUsMTY2ODIxMjg5MiwxOTUzNzU3ODMxLDIwMzc5NzAwNjIsMTUxNDc5MDU3NywxNDYzOTk2NjAwLDEwODAwMTc1NzEsMTI5NzQwMzA1MCwzNjczNjM3MzU2LDM2MjM2MzY5NjUsMzIzNTk5NTEzNCwzNDU0Njg2MTk5LDQwMDczNjA5NjgsMzgyMjA5MDE3Nyw0MTA3MTAxNjU4LDQxOTA1MzA1MTUsMjk5NzgyNTk1NiwzMjE1MjEyNDYxLDI4MzA3MDgxNTAsMjc3OTkxNTE5OSwyMjU2NzM0NTkyLDIzNDA5NDc4NDksMjYyNzAxNjA4MiwyNDQzMDU4MDc1LDE3MjQ2NjU1NiwxMjI0NjYxNjUsMjczNzkyMzY2LDQ5MjQ4MzQzMSwxMDQ3MjM5ZTMsODYxOTY4MjA5LDYxMjIwNTg5OCw2OTU2MzQ3NTUsMTY0NjI1MjM0MCwxODYzNjM4ODQ1LDIwMTM5MDgyNjIsMTk2MzExNTMxMSwxNDQ2MjQyNTc2LDE1MzA0NTU4MzMsMTI3NzU1NTk3MCwxMDkzNTk3OTYzLDE2MzY2MDQ2MzEsMTgyMDgyNDc5OCwyMDczNzI0NjEzLDE5ODkyNDkyMjgsMTQzNjU5MDgzNSwxNDg3NjQ1OTQ2LDEzMzczNzY0ODEsMTExOTcyNzg0OCwxNjQ5NDg2MzksODE3ODE5MTAsMzMxNTQ0MjA1LDUxNjU1MjgzNiwxMDM5NzE3MDUxLDgyMTI4ODExNCw2Njk5NjE4OTcsNzE5NzAwMTI4LDI5NzM1MzA2OTUsMzE1Nzc1MDg2MiwyODcxNjgyNjQ1LDI3ODcyMDcyNjAsMjIzMjQzNTI5OSwyMjgzNDkwNDEwLDI2Njc5OTQ3MzcsMjQ1MDM0NjEwNCwzNjQ3MjEyMDQ3LDM1NjQwNDUzMTgsMzI3OTAzMzg4NSwzNDY0MDQyNTE2LDM5ODA5MzE2MjcsMzc2MjUwMjY5MCw0MTUwMTQ0NTY5LDQxOTk4ODI4MDAsMzA3MDM1NjYzNCwzMTIxMjc1NTM5LDI5MDQwMjcyNzIsMjY4NjI1NDcyMSwyMjAwODE4ODc4LDIzODQ5MTEwMzEsMjU3MDgzMjA0NCwyNDg2MjI0NTQ5LDM3NDcxOTIwMTgsMzUyODYyNjkwNywzMzEwMzIxODU2LDMzNTk5MzYyMDEsMzk1MDM1NTcwMiwzODY3MDYwOTkxLDQwNDk4NDQ0NTIsNDIzNDcyMTAwNSwxNzM5NjU2MjAyLDE3OTA1NzUxMDcsMjEwODEwMDYzMiwxODkwMzI4MDgxLDE0MDI4MTE0MzgsMTU4NjkwMzU5MSwxMjMzODU2NTcyLDExNDkyNDkwNzcsMjY2OTU5OTM4LDQ4Mzk0ODI3LDM2OTA1Nzg3Miw0MTg2NzIyMTcsMTAwMjc4Mzg0Niw5MTk0ODkxMzUsNTY3NDk4ODY4LDc1MjM3NTQyMSwyMDkzMzYyMjUsMjQxOTc1NDQsMzc2MTg3ODI3LDQ1OTc0NDY5OCw5NDUxNjQxNjUsODk1Mjg3NjkyLDU3NDYyNDY2Myw3OTM0NTE5MzQsMTY3OTk2ODIzMywxNzY0MzEzNTY4LDIxMTczNjA2MzUsMTkzMzUzMDYxMCwxMzQzMTI3NTAxLDE1NjA2Mzc4OTIsMTI0MzExMjQxNSwxMTkyNDU1NjM4LDM3MDQyODA4ODEsMzUxOTE0MjIwMCwzMzM2MzU4NjkxLDM0MTk5MTU1NjIsMzkwNzQ0ODU5NywzODU3NTcyMTI0LDQwNzU4NzcxMjcsNDI5NDcwNDM5OCwzMDI5NTEwMDA5LDMxMTM4NTUzNDQsMjkyNzkzNDMxNSwyNzQ0MTA0MjkwLDIxNTk5NzYyODUsMjM3NzQ4NjY3NiwyNTk0NzM0OTI3LDI1NDQwNzgxNTBdO3ZhciBVND1bMCwxNTE4NDk3NDIsMzAzNjk5NDg0LDQ1NDQ5OTYwMiw2MDczOTg5NjgsNzU4NzIwMzEwLDkwODk5OTIwNCwxMDU5MjcwOTU0LDEyMTQ3OTc5MzYsMTA5NzE1OTU1MCwxNTE3NDQwNjIwLDE0MDA4NDk3NjIsMTgxNzk5ODQwOCwxNjk5ODM5ODE0LDIxMTg1NDE5MDgsMjAwMTQzMDg3NCwyNDI5NTk1ODcyLDI1ODE0NDU2MTQsMjE5NDMxOTEwMCwyMzQ1MTE5MjE4LDMwMzQ4ODEyNDAsMzE4NjIwMjU4MiwyODAxNjk5NTI0LDI5NTE5NzEyNzQsMzYzNTk5NjgxNiwzNTE4MzU4NDMwLDMzOTk2Nzk2MjgsMzI4MzA4ODc3MCw0MjM3MDgzODE2LDQxMTg5MjUyMjIsNDAwMjg2MTc0OCwzODg1NzUwNzE0LDEwMDIxNDI2ODMsODUwODE3MjM3LDY5ODQ0NTI1NSw1NDgxNjk0MTcsNTI5NDg3ODQzLDM3NzY0MjIyMSwyMjc4ODU1NjcsNzcwODk1MjEsMTk0MzIxNzA2NywyMDYxMzc5NzQ5LDE2NDA1NzY0MzksMTc1NzY5MTU3NywxNDc0NzYwNTk1LDE1OTIzOTQ5MDksMTE3NDIxNTA1NSwxMjkwODAxNzkzLDI4NzU5NjgzMTUsMjcyNDY0Mjg2OSwzMTExMjQ3MTQzLDI5NjA5NzEzMDUsMjQwNTQyNjk0NywyMjUzNTgxMzI1LDI2Mzg2MDY2MjMsMjQ4NzgxMDU3NywzODA4NjYyMzQ3LDM5MjY4MjUwMjksNDA0NDk4MTU5MSw0MTYyMDk2NzI5LDMzNDIzMTk0NzUsMzQ1OTk1Mzc4OSwzNTc2NTM5NTAzLDM2OTMxMjYyNDEsMTk4NjkxODA2MSwyMTM3MDYyODE5LDE2ODU1Nzc5MDUsMTgzNjc3MjI4NywxMzgxNjIwMzczLDE1MzIyODUzMzksMTA3ODE4NTA5NywxMjI5ODk5NjU1LDEwNDA1NTk4MzcsOTIzMzEzNjE5LDc0MDI3NjQxNyw2MjE5ODI2NzEsNDM5NDUyMzg5LDMyMjczNDU3MSwxMzcwNzM5MTMsMTkzMDg1MzUsMzg3MTE2Mzk4MSw0MDIxMzA4NzM5LDQxMDQ2MDU3NzcsNDI1NTgwMDE1OSwzMjYzNzg1NTg5LDM0MTQ0NTA1NTUsMzQ5OTMyNjU2OSwzNjUxMDQxMTI3LDI5MzMyMDI0OTMsMjgxNTk1NjI3NSwzMTY3Njg0NjQxLDMwNDkzOTA4OTUsMjMzMDAxNDIxMywyMjEzMjk2Mzk1LDI1NjY1OTU2MDksMjQ0ODgzMDIzMSwxMzA1OTA2NTUwLDExNTUyMzc0OTYsMTYwNzI0NDY1MCwxNDU1NTI1OTg4LDE3NzY0NjAxMTAsMTYyNjMxOTQyNCwyMDc5ODk3NDI2LDE5Mjg3MDcxNjQsOTYzOTI0NTQsMjEzMTE0Mzc2LDM5NjY3MzgxOCw1MTQ0NDMyODQsNTYyNzU1OTAyLDY3OTk5OGUzLDg2NTEzNjQxOCw5ODM0MjYwOTIsMzcwODE3MzcxOCwzNTU3NTA0NjY0LDM0NzQ3Mjk4NjYsMzMyMzAxMTIwNCw0MTgwODA4MTEwLDQwMzA2Njc0MjQsMzk0NTI2OTE3MCwzNzk0MDc4OTA4LDI1MDcwNDAyMzAsMjYyMzc2MjE1MiwyMjcyNTU2MDI2LDIzOTAzMjU0OTIsMjk3NTQ4NDM4MiwzMDkyNzI2NDgwLDI3Mzg5MDUwMjYsMjg1NzE5NDcwMCwzOTczNzczMTIxLDM4NTYxMzcyOTUsNDI3NDA1MzQ2OSw0MTU3NDY3MjE5LDMzNzEwOTY5NTMsMzI1MjkzMjcyNywzNjczNDc2NDUzLDM1NTYzNjE4MzUsMjc2MzE3MzY4MSwyOTE1MDE3NzkxLDMwNjQ1MTA3NjUsMzIxNTMwNzI5OSwyMTU2Mjk5MDE3LDIzMDc2MjI5MTksMjQ1OTczNTMxNywyNjEwMDExNjc1LDIwODEwNDg0ODEsMTk2MzQxMjY1NSwxODQ2NTYzMjYxLDE3Mjk5NzcwMTEsMTQ4MDQ4NTc4NSwxMzYyMzIxNTU5LDEyNDM5MDU0MTMsMTEyNjc5MDc5NSw4Nzg4NDU5MDUsMTAzMDY5MDAxNSw2NDU0MDEwMzcsNzk2MTk3NTcxLDI3NDA4NDg0MSw0MjU0MDg3NDMsMzg1NDQ4ODUsMTg4ODIxMjQzLDM2MTM0OTQ0MjYsMzczMTY1NDU0OCwzMzEzMjEyMDM4LDM0MzAzMjI1NjgsNDA4MjQ3NTE3MCw0MjAwMTE1MTE2LDM3ODAwOTc3MjYsMzg5NjY4ODA0OCwyNjY4MjIxNjc0LDI1MTY5MDE4NjAsMjM2Njg4MjU1MCwyMjE2NjEwMjk2LDMxNDE0MDA3ODYsMjk4OTU1MjYwNCwyODM3OTY2NTQyLDI2ODcxNjU4ODgsMTIwMjc5NzY5MCwxMzIwOTU3ODEyLDE0MzcyODA4NzAsMTU1NDM5MTQwMCwxNjY5NjY0ODM0LDE3ODczMDQ3ODAsMTkwNjI0NzI2MiwyMDIyODM3NTg0LDI2NTkwNTE2MiwxMTQ1ODUzNDgsNDk5MzQ3OTkwLDM0OTA3NTczNiw3MzY5NzA4MDIsNTg1MTIyNjIwLDk3MjUxMjgxNCw4MjE3MTIxNjAsMjU5NTY4NDg0NCwyNDc4NDQzMjM0LDIyOTMwNDUyMzIsMjE3NDc1NDA0NiwzMTk2MjY3OTg4LDMwNzk1NDY1ODYsMjg5NTcyMzQ2NCwyNzc3OTUyNDU0LDM1Mzc4NTI4MjgsMzY4Nzk5NDAwMiwzMjM0MTU2NDE2LDMzODUzNDUxNjYsNDE0MjYyNjIxMiw0MjkzMjk1Nzg2LDM4NDEwMjQ5NTIsMzk5Mjc0MjA3MCwxNzQ1Njc2OTIsNTczMjYwODIsNDEwODg3OTUyLDI5MjU5Njc2Niw3NzcyMzE2NjgsNjYwNTEwMjY2LDEwMTE0NTI3MTIsODkzNjgxNzAyLDExMDgzMzkwNjgsMTI1ODQ4MDI0MiwxMzQzNjE4OTEyLDE0OTQ4MDc2NjIsMTcxNTE5MzE1NiwxODY1ODYyNzMwLDE5NDgzNzM4NDgsMjEwMDA5MDk2NiwyNzAxOTQ5NDk1LDI4MTg2NjY4MDksMzAwNDU5MTE0NywzMTIyMzU4MDUzLDIyMzUwNjE3NzUsMjM1MjMwNzQ1NywyNTM1NjA0MjQzLDI2NTM4OTk1NDksMzkxNTY1MzcwMywzNzY0OTg4MjMzLDQyMTkzNTIxNTUsNDA2NzYzOTEyNSwzNDQ0NTc1ODcxLDMyOTQ0MzA1NzcsMzc0NjE3NTA3NSwzNTk0OTgyMjUzLDgzNjU1MzQzMSw5NTMyNzA3NDUsNjAwMjM1MjExLDcxODAwMjExNywzNjc1ODUwMDcsNDg0ODMwNjg5LDEzMzM2MTkwNywyNTE2NTcyMTMsMjA0MTg3NzE1OSwxODkxMjExNjg5LDE4MDY1OTkzNTUsMTY1NDg4NjMyNSwxNTY4NzE4NDk1LDE0MTg1NzMyMDEsMTMzNTUzNTc0NywxMTg0MzQyOTI1XTtmdW5jdGlvbiBjb252ZXJ0VG9JbnQzMihieXRlcyl7dmFyIHJlc3VsdD1bXTtmb3IodmFyIGk9MDtpPGJ5dGVzLmxlbmd0aDtpKz00KXtyZXN1bHQucHVzaChieXRlc1tpXTw8MjR8Ynl0ZXNbaSsxXTw8MTZ8Ynl0ZXNbaSsyXTw8OHxieXRlc1tpKzNdKX1yZXR1cm4gcmVzdWx0fXZhciBBRVM9ZnVuY3Rpb24oa2V5KXtpZighKHRoaXMgaW5zdGFuY2VvZiBBRVMpKXt0aHJvdyBFcnJvcigiQUVTIG11c3QgYmUgaW5zdGFuaXRhdGVkIHdpdGggYG5ld2AiKX1PYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywia2V5Iix7dmFsdWU6Y29lcmNlQXJyYXkoa2V5LHRydWUpfSk7dGhpcy5fcHJlcGFyZSgpfTtBRVMucHJvdG90eXBlLl9wcmVwYXJlPWZ1bmN0aW9uKCl7dmFyIHJvdW5kcz1udW1iZXJPZlJvdW5kc1t0aGlzLmtleS5sZW5ndGhdO2lmKHJvdW5kcz09bnVsbCl7dGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIGtleSBzaXplIChtdXN0IGJlIDE2LCAyNCBvciAzMiBieXRlcykiKX10aGlzLl9LZT1bXTt0aGlzLl9LZD1bXTtmb3IodmFyIGk9MDtpPD1yb3VuZHM7aSsrKXt0aGlzLl9LZS5wdXNoKFswLDAsMCwwXSk7dGhpcy5fS2QucHVzaChbMCwwLDAsMF0pfXZhciByb3VuZEtleUNvdW50PShyb3VuZHMrMSkqNDt2YXIgS0M9dGhpcy5rZXkubGVuZ3RoLzQ7dmFyIHRrPWNvbnZlcnRUb0ludDMyKHRoaXMua2V5KTt2YXIgaW5kZXg7Zm9yKHZhciBpPTA7aTxLQztpKyspe2luZGV4PWk+PjI7dGhpcy5fS2VbaW5kZXhdW2klNF09dGtbaV07dGhpcy5fS2Rbcm91bmRzLWluZGV4XVtpJTRdPXRrW2ldfXZhciByY29ucG9pbnRlcj0wO3ZhciB0PUtDLHR0O3doaWxlKHQ8cm91bmRLZXlDb3VudCl7dHQ9dGtbS0MtMV07dGtbMF1ePVNbdHQ+PjE2JjI1NV08PDI0XlNbdHQ+PjgmMjU1XTw8MTZeU1t0dCYyNTVdPDw4XlNbdHQ+PjI0JjI1NV1ecmNvbltyY29ucG9pbnRlcl08PDI0O3Jjb25wb2ludGVyKz0xO2lmKEtDIT04KXtmb3IodmFyIGk9MTtpPEtDO2krKyl7dGtbaV1ePXRrW2ktMV19fWVsc2V7Zm9yKHZhciBpPTE7aTxLQy8yO2krKyl7dGtbaV1ePXRrW2ktMV19dHQ9dGtbS0MvMi0xXTt0a1tLQy8yXV49U1t0dCYyNTVdXlNbdHQ+PjgmMjU1XTw8OF5TW3R0Pj4xNiYyNTVdPDwxNl5TW3R0Pj4yNCYyNTVdPDwyNDtmb3IodmFyIGk9S0MvMisxO2k8S0M7aSsrKXt0a1tpXV49dGtbaS0xXX19dmFyIGk9MCxyLGM7d2hpbGUoaTxLQyYmdDxyb3VuZEtleUNvdW50KXtyPXQ+PjI7Yz10JTQ7dGhpcy5fS2Vbcl1bY109dGtbaV07dGhpcy5fS2Rbcm91bmRzLXJdW2NdPXRrW2krK107dCsrfX1mb3IodmFyIHI9MTtyPHJvdW5kcztyKyspe2Zvcih2YXIgYz0wO2M8NDtjKyspe3R0PXRoaXMuX0tkW3JdW2NdO3RoaXMuX0tkW3JdW2NdPVUxW3R0Pj4yNCYyNTVdXlUyW3R0Pj4xNiYyNTVdXlUzW3R0Pj44JjI1NV1eVTRbdHQmMjU1XX19fTtBRVMucHJvdG90eXBlLmVuY3J5cHQ9ZnVuY3Rpb24ocGxhaW50ZXh0KXtpZihwbGFpbnRleHQubGVuZ3RoIT0xNil7dGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIHBsYWludGV4dCBzaXplIChtdXN0IGJlIDE2IGJ5dGVzKSIpfXZhciByb3VuZHM9dGhpcy5fS2UubGVuZ3RoLTE7dmFyIGE9WzAsMCwwLDBdO3ZhciB0PWNvbnZlcnRUb0ludDMyKHBsYWludGV4dCk7Zm9yKHZhciBpPTA7aTw0O2krKyl7dFtpXV49dGhpcy5fS2VbMF1baV19Zm9yKHZhciByPTE7cjxyb3VuZHM7cisrKXtmb3IodmFyIGk9MDtpPDQ7aSsrKXthW2ldPVQxW3RbaV0+PjI0JjI1NV1eVDJbdFsoaSsxKSU0XT4+MTYmMjU1XV5UM1t0WyhpKzIpJTRdPj44JjI1NV1eVDRbdFsoaSszKSU0XSYyNTVdXnRoaXMuX0tlW3JdW2ldfXQ9YS5zbGljZSgpfXZhciByZXN1bHQ9Y3JlYXRlQXJyYXkoMTYpLHR0O2Zvcih2YXIgaT0wO2k8NDtpKyspe3R0PXRoaXMuX0tlW3JvdW5kc11baV07cmVzdWx0WzQqaV09KFNbdFtpXT4+MjQmMjU1XV50dD4+MjQpJjI1NTtyZXN1bHRbNCppKzFdPShTW3RbKGkrMSklNF0+PjE2JjI1NV1edHQ+PjE2KSYyNTU7cmVzdWx0WzQqaSsyXT0oU1t0WyhpKzIpJTRdPj44JjI1NV1edHQ+PjgpJjI1NTtyZXN1bHRbNCppKzNdPShTW3RbKGkrMyklNF0mMjU1XV50dCkmMjU1fXJldHVybiByZXN1bHR9O0FFUy5wcm90b3R5cGUuZGVjcnlwdD1mdW5jdGlvbihjaXBoZXJ0ZXh0KXtpZihjaXBoZXJ0ZXh0Lmxlbmd0aCE9MTYpe3Rocm93IG5ldyBFcnJvcigiaW52YWxpZCBjaXBoZXJ0ZXh0IHNpemUgKG11c3QgYmUgMTYgYnl0ZXMpIil9dmFyIHJvdW5kcz10aGlzLl9LZC5sZW5ndGgtMTt2YXIgYT1bMCwwLDAsMF07dmFyIHQ9Y29udmVydFRvSW50MzIoY2lwaGVydGV4dCk7Zm9yKHZhciBpPTA7aTw0O2krKyl7dFtpXV49dGhpcy5fS2RbMF1baV19Zm9yKHZhciByPTE7cjxyb3VuZHM7cisrKXtmb3IodmFyIGk9MDtpPDQ7aSsrKXthW2ldPVQ1W3RbaV0+PjI0JjI1NV1eVDZbdFsoaSszKSU0XT4+MTYmMjU1XV5UN1t0WyhpKzIpJTRdPj44JjI1NV1eVDhbdFsoaSsxKSU0XSYyNTVdXnRoaXMuX0tkW3JdW2ldfXQ9YS5zbGljZSgpfXZhciByZXN1bHQ9Y3JlYXRlQXJyYXkoMTYpLHR0O2Zvcih2YXIgaT0wO2k8NDtpKyspe3R0PXRoaXMuX0tkW3JvdW5kc11baV07cmVzdWx0WzQqaV09KFNpW3RbaV0+PjI0JjI1NV1edHQ+PjI0KSYyNTU7cmVzdWx0WzQqaSsxXT0oU2lbdFsoaSszKSU0XT4+MTYmMjU1XV50dD4+MTYpJjI1NTtyZXN1bHRbNCppKzJdPShTaVt0WyhpKzIpJTRdPj44JjI1NV1edHQ+PjgpJjI1NTtyZXN1bHRbNCppKzNdPShTaVt0WyhpKzEpJTRdJjI1NV1edHQpJjI1NX1yZXR1cm4gcmVzdWx0fTt2YXIgTW9kZU9mT3BlcmF0aW9uRUNCPWZ1bmN0aW9uKGtleSl7aWYoISh0aGlzIGluc3RhbmNlb2YgTW9kZU9mT3BlcmF0aW9uRUNCKSl7dGhyb3cgRXJyb3IoIkFFUyBtdXN0IGJlIGluc3Rhbml0YXRlZCB3aXRoIGBuZXdgIil9dGhpcy5kZXNjcmlwdGlvbj0iRWxlY3Ryb25pYyBDb2RlIEJsb2NrIjt0aGlzLm5hbWU9ImVjYiI7dGhpcy5fYWVzPW5ldyBBRVMoa2V5KX07TW9kZU9mT3BlcmF0aW9uRUNCLnByb3RvdHlwZS5lbmNyeXB0PWZ1bmN0aW9uKHBsYWludGV4dCl7cGxhaW50ZXh0PWNvZXJjZUFycmF5KHBsYWludGV4dCk7aWYocGxhaW50ZXh0Lmxlbmd0aCUxNiE9PTApe3Rocm93IG5ldyBFcnJvcigiaW52YWxpZCBwbGFpbnRleHQgc2l6ZSAobXVzdCBiZSBtdWx0aXBsZSBvZiAxNiBieXRlcykiKX12YXIgY2lwaGVydGV4dD1jcmVhdGVBcnJheShwbGFpbnRleHQubGVuZ3RoKTt2YXIgYmxvY2s9Y3JlYXRlQXJyYXkoMTYpO2Zvcih2YXIgaT0wO2k8cGxhaW50ZXh0Lmxlbmd0aDtpKz0xNil7Y29weUFycmF5KHBsYWludGV4dCxibG9jaywwLGksaSsxNik7YmxvY2s9dGhpcy5fYWVzLmVuY3J5cHQoYmxvY2spO2NvcHlBcnJheShibG9jayxjaXBoZXJ0ZXh0LGkpfXJldHVybiBjaXBoZXJ0ZXh0fTtNb2RlT2ZPcGVyYXRpb25FQ0IucHJvdG90eXBlLmRlY3J5cHQ9ZnVuY3Rpb24oY2lwaGVydGV4dCl7Y2lwaGVydGV4dD1jb2VyY2VBcnJheShjaXBoZXJ0ZXh0KTtpZihjaXBoZXJ0ZXh0Lmxlbmd0aCUxNiE9PTApe3Rocm93IG5ldyBFcnJvcigiaW52YWxpZCBjaXBoZXJ0ZXh0IHNpemUgKG11c3QgYmUgbXVsdGlwbGUgb2YgMTYgYnl0ZXMpIil9dmFyIHBsYWludGV4dD1jcmVhdGVBcnJheShjaXBoZXJ0ZXh0Lmxlbmd0aCk7dmFyIGJsb2NrPWNyZWF0ZUFycmF5KDE2KTtmb3IodmFyIGk9MDtpPGNpcGhlcnRleHQubGVuZ3RoO2krPTE2KXtjb3B5QXJyYXkoY2lwaGVydGV4dCxibG9jaywwLGksaSsxNik7YmxvY2s9dGhpcy5fYWVzLmRlY3J5cHQoYmxvY2spO2NvcHlBcnJheShibG9jayxwbGFpbnRleHQsaSl9cmV0dXJuIHBsYWludGV4dH07dmFyIE1vZGVPZk9wZXJhdGlvbkNCQz1mdW5jdGlvbihrZXksaXYpe2lmKCEodGhpcyBpbnN0YW5jZW9mIE1vZGVPZk9wZXJhdGlvbkNCQykpe3Rocm93IEVycm9yKCJBRVMgbXVzdCBiZSBpbnN0YW5pdGF0ZWQgd2l0aCBgbmV3YCIpfXRoaXMuZGVzY3JpcHRpb249IkNpcGhlciBCbG9jayBDaGFpbmluZyI7dGhpcy5uYW1lPSJjYmMiO2lmKCFpdil7aXY9Y3JlYXRlQXJyYXkoMTYpfWVsc2UgaWYoaXYubGVuZ3RoIT0xNil7dGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIGluaXRpYWxhdGlvbiB2ZWN0b3Igc2l6ZSAobXVzdCBiZSAxNiBieXRlcykiKX10aGlzLl9sYXN0Q2lwaGVyYmxvY2s9Y29lcmNlQXJyYXkoaXYsdHJ1ZSk7dGhpcy5fYWVzPW5ldyBBRVMoa2V5KX07TW9kZU9mT3BlcmF0aW9uQ0JDLnByb3RvdHlwZS5lbmNyeXB0PWZ1bmN0aW9uKHBsYWludGV4dCl7cGxhaW50ZXh0PWNvZXJjZUFycmF5KHBsYWludGV4dCk7aWYocGxhaW50ZXh0Lmxlbmd0aCUxNiE9PTApe3Rocm93IG5ldyBFcnJvcigiaW52YWxpZCBwbGFpbnRleHQgc2l6ZSAobXVzdCBiZSBtdWx0aXBsZSBvZiAxNiBieXRlcykiKX12YXIgY2lwaGVydGV4dD1jcmVhdGVBcnJheShwbGFpbnRleHQubGVuZ3RoKTt2YXIgYmxvY2s9Y3JlYXRlQXJyYXkoMTYpO2Zvcih2YXIgaT0wO2k8cGxhaW50ZXh0Lmxlbmd0aDtpKz0xNil7Y29weUFycmF5KHBsYWludGV4dCxibG9jaywwLGksaSsxNik7Zm9yKHZhciBqPTA7ajwxNjtqKyspe2Jsb2NrW2pdXj10aGlzLl9sYXN0Q2lwaGVyYmxvY2tbal19dGhpcy5fbGFzdENpcGhlcmJsb2NrPXRoaXMuX2Flcy5lbmNyeXB0KGJsb2NrKTtjb3B5QXJyYXkodGhpcy5fbGFzdENpcGhlcmJsb2NrLGNpcGhlcnRleHQsaSl9cmV0dXJuIGNpcGhlcnRleHR9O01vZGVPZk9wZXJhdGlvbkNCQy5wcm90b3R5cGUuZGVjcnlwdD1mdW5jdGlvbihjaXBoZXJ0ZXh0KXtjaXBoZXJ0ZXh0PWNvZXJjZUFycmF5KGNpcGhlcnRleHQpO2lmKGNpcGhlcnRleHQubGVuZ3RoJTE2IT09MCl7dGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIGNpcGhlcnRleHQgc2l6ZSAobXVzdCBiZSBtdWx0aXBsZSBvZiAxNiBieXRlcykiKX12YXIgcGxhaW50ZXh0PWNyZWF0ZUFycmF5KGNpcGhlcnRleHQubGVuZ3RoKTt2YXIgYmxvY2s9Y3JlYXRlQXJyYXkoMTYpO2Zvcih2YXIgaT0wO2k8Y2lwaGVydGV4dC5sZW5ndGg7aSs9MTYpe2NvcHlBcnJheShjaXBoZXJ0ZXh0LGJsb2NrLDAsaSxpKzE2KTtibG9jaz10aGlzLl9hZXMuZGVjcnlwdChibG9jayk7Zm9yKHZhciBqPTA7ajwxNjtqKyspe3BsYWludGV4dFtpK2pdPWJsb2NrW2pdXnRoaXMuX2xhc3RDaXBoZXJibG9ja1tqXX1jb3B5QXJyYXkoY2lwaGVydGV4dCx0aGlzLl9sYXN0Q2lwaGVyYmxvY2ssMCxpLGkrMTYpfXJldHVybiBwbGFpbnRleHR9O3ZhciBNb2RlT2ZPcGVyYXRpb25DRkI9ZnVuY3Rpb24oa2V5LGl2LHNlZ21lbnRTaXplKXtpZighKHRoaXMgaW5zdGFuY2VvZiBNb2RlT2ZPcGVyYXRpb25DRkIpKXt0aHJvdyBFcnJvcigiQUVTIG11c3QgYmUgaW5zdGFuaXRhdGVkIHdpdGggYG5ld2AiKX10aGlzLmRlc2NyaXB0aW9uPSJDaXBoZXIgRmVlZGJhY2siO3RoaXMubmFtZT0iY2ZiIjtpZighaXYpe2l2PWNyZWF0ZUFycmF5KDE2KX1lbHNlIGlmKGl2Lmxlbmd0aCE9MTYpe3Rocm93IG5ldyBFcnJvcigiaW52YWxpZCBpbml0aWFsYXRpb24gdmVjdG9yIHNpemUgKG11c3QgYmUgMTYgc2l6ZSkiKX1pZighc2VnbWVudFNpemUpe3NlZ21lbnRTaXplPTF9dGhpcy5zZWdtZW50U2l6ZT1zZWdtZW50U2l6ZTt0aGlzLl9zaGlmdFJlZ2lzdGVyPWNvZXJjZUFycmF5KGl2LHRydWUpO3RoaXMuX2Flcz1uZXcgQUVTKGtleSl9O01vZGVPZk9wZXJhdGlvbkNGQi5wcm90b3R5cGUuZW5jcnlwdD1mdW5jdGlvbihwbGFpbnRleHQpe2lmKHBsYWludGV4dC5sZW5ndGgldGhpcy5zZWdtZW50U2l6ZSE9MCl7dGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIHBsYWludGV4dCBzaXplIChtdXN0IGJlIHNlZ21lbnRTaXplIGJ5dGVzKSIpfXZhciBlbmNyeXB0ZWQ9Y29lcmNlQXJyYXkocGxhaW50ZXh0LHRydWUpO3ZhciB4b3JTZWdtZW50O2Zvcih2YXIgaT0wO2k8ZW5jcnlwdGVkLmxlbmd0aDtpKz10aGlzLnNlZ21lbnRTaXplKXt4b3JTZWdtZW50PXRoaXMuX2Flcy5lbmNyeXB0KHRoaXMuX3NoaWZ0UmVnaXN0ZXIpO2Zvcih2YXIgaj0wO2o8dGhpcy5zZWdtZW50U2l6ZTtqKyspe2VuY3J5cHRlZFtpK2pdXj14b3JTZWdtZW50W2pdfWNvcHlBcnJheSh0aGlzLl9zaGlmdFJlZ2lzdGVyLHRoaXMuX3NoaWZ0UmVnaXN0ZXIsMCx0aGlzLnNlZ21lbnRTaXplKTtjb3B5QXJyYXkoZW5jcnlwdGVkLHRoaXMuX3NoaWZ0UmVnaXN0ZXIsMTYtdGhpcy5zZWdtZW50U2l6ZSxpLGkrdGhpcy5zZWdtZW50U2l6ZSl9cmV0dXJuIGVuY3J5cHRlZH07TW9kZU9mT3BlcmF0aW9uQ0ZCLnByb3RvdHlwZS5kZWNyeXB0PWZ1bmN0aW9uKGNpcGhlcnRleHQpe2lmKGNpcGhlcnRleHQubGVuZ3RoJXRoaXMuc2VnbWVudFNpemUhPTApe3Rocm93IG5ldyBFcnJvcigiaW52YWxpZCBjaXBoZXJ0ZXh0IHNpemUgKG11c3QgYmUgc2VnbWVudFNpemUgYnl0ZXMpIil9dmFyIHBsYWludGV4dD1jb2VyY2VBcnJheShjaXBoZXJ0ZXh0LHRydWUpO3ZhciB4b3JTZWdtZW50O2Zvcih2YXIgaT0wO2k8cGxhaW50ZXh0Lmxlbmd0aDtpKz10aGlzLnNlZ21lbnRTaXplKXt4b3JTZWdtZW50PXRoaXMuX2Flcy5lbmNyeXB0KHRoaXMuX3NoaWZ0UmVnaXN0ZXIpO2Zvcih2YXIgaj0wO2o8dGhpcy5zZWdtZW50U2l6ZTtqKyspe3BsYWludGV4dFtpK2pdXj14b3JTZWdtZW50W2pdfWNvcHlBcnJheSh0aGlzLl9zaGlmdFJlZ2lzdGVyLHRoaXMuX3NoaWZ0UmVnaXN0ZXIsMCx0aGlzLnNlZ21lbnRTaXplKTtjb3B5QXJyYXkoY2lwaGVydGV4dCx0aGlzLl9zaGlmdFJlZ2lzdGVyLDE2LXRoaXMuc2VnbWVudFNpemUsaSxpK3RoaXMuc2VnbWVudFNpemUpfXJldHVybiBwbGFpbnRleHR9O3ZhciBNb2RlT2ZPcGVyYXRpb25PRkI9ZnVuY3Rpb24oa2V5LGl2KXtpZighKHRoaXMgaW5zdGFuY2VvZiBNb2RlT2ZPcGVyYXRpb25PRkIpKXt0aHJvdyBFcnJvcigiQUVTIG11c3QgYmUgaW5zdGFuaXRhdGVkIHdpdGggYG5ld2AiKX10aGlzLmRlc2NyaXB0aW9uPSJPdXRwdXQgRmVlZGJhY2siO3RoaXMubmFtZT0ib2ZiIjtpZighaXYpe2l2PWNyZWF0ZUFycmF5KDE2KX1lbHNlIGlmKGl2Lmxlbmd0aCE9MTYpe3Rocm93IG5ldyBFcnJvcigiaW52YWxpZCBpbml0aWFsYXRpb24gdmVjdG9yIHNpemUgKG11c3QgYmUgMTYgYnl0ZXMpIil9dGhpcy5fbGFzdFByZWNpcGhlcj1jb2VyY2VBcnJheShpdix0cnVlKTt0aGlzLl9sYXN0UHJlY2lwaGVySW5kZXg9MTY7dGhpcy5fYWVzPW5ldyBBRVMoa2V5KX07TW9kZU9mT3BlcmF0aW9uT0ZCLnByb3RvdHlwZS5lbmNyeXB0PWZ1bmN0aW9uKHBsYWludGV4dCl7dmFyIGVuY3J5cHRlZD1jb2VyY2VBcnJheShwbGFpbnRleHQsdHJ1ZSk7Zm9yKHZhciBpPTA7aTxlbmNyeXB0ZWQubGVuZ3RoO2krKyl7aWYodGhpcy5fbGFzdFByZWNpcGhlckluZGV4PT09MTYpe3RoaXMuX2xhc3RQcmVjaXBoZXI9dGhpcy5fYWVzLmVuY3J5cHQodGhpcy5fbGFzdFByZWNpcGhlcik7dGhpcy5fbGFzdFByZWNpcGhlckluZGV4PTB9ZW5jcnlwdGVkW2ldXj10aGlzLl9sYXN0UHJlY2lwaGVyW3RoaXMuX2xhc3RQcmVjaXBoZXJJbmRleCsrXX1yZXR1cm4gZW5jcnlwdGVkfTtNb2RlT2ZPcGVyYXRpb25PRkIucHJvdG90eXBlLmRlY3J5cHQ9TW9kZU9mT3BlcmF0aW9uT0ZCLnByb3RvdHlwZS5lbmNyeXB0O3ZhciBDb3VudGVyPWZ1bmN0aW9uKGluaXRpYWxWYWx1ZSl7aWYoISh0aGlzIGluc3RhbmNlb2YgQ291bnRlcikpe3Rocm93IEVycm9yKCJDb3VudGVyIG11c3QgYmUgaW5zdGFuaXRhdGVkIHdpdGggYG5ld2AiKX1pZihpbml0aWFsVmFsdWUhPT0wJiYhaW5pdGlhbFZhbHVlKXtpbml0aWFsVmFsdWU9MX1pZih0eXBlb2YgaW5pdGlhbFZhbHVlPT09Im51bWJlciIpe3RoaXMuX2NvdW50ZXI9Y3JlYXRlQXJyYXkoMTYpO3RoaXMuc2V0VmFsdWUoaW5pdGlhbFZhbHVlKX1lbHNle3RoaXMuc2V0Qnl0ZXMoaW5pdGlhbFZhbHVlKX19O0NvdW50ZXIucHJvdG90eXBlLnNldFZhbHVlPWZ1bmN0aW9uKHZhbHVlKXtpZih0eXBlb2YgdmFsdWUhPT0ibnVtYmVyInx8cGFyc2VJbnQodmFsdWUpIT12YWx1ZSl7dGhyb3cgbmV3IEVycm9yKCJpbnZhbGlkIGNvdW50ZXIgdmFsdWUgKG11c3QgYmUgYW4gaW50ZWdlcikiKX1pZih2YWx1ZT5OdW1iZXIuTUFYX1NBRkVfSU5URUdFUil7dGhyb3cgbmV3IEVycm9yKCJpbnRlZ2VyIHZhbHVlIG91dCBvZiBzYWZlIHJhbmdlIil9Zm9yKHZhciBpbmRleD0xNTtpbmRleD49MDstLWluZGV4KXt0aGlzLl9jb3VudGVyW2luZGV4XT12YWx1ZSUyNTY7dmFsdWU9cGFyc2VJbnQodmFsdWUvMjU2KX19O0NvdW50ZXIucHJvdG90eXBlLnNldEJ5dGVzPWZ1bmN0aW9uKGJ5dGVzKXtieXRlcz1jb2VyY2VBcnJheShieXRlcyx0cnVlKTtpZihieXRlcy5sZW5ndGghPTE2KXt0aHJvdyBuZXcgRXJyb3IoImludmFsaWQgY291bnRlciBieXRlcyBzaXplIChtdXN0IGJlIDE2IGJ5dGVzKSIpfXRoaXMuX2NvdW50ZXI9Ynl0ZXN9O0NvdW50ZXIucHJvdG90eXBlLmluY3JlbWVudD1mdW5jdGlvbigpe2Zvcih2YXIgaT0xNTtpPj0wO2ktLSl7aWYodGhpcy5fY291bnRlcltpXT09PTI1NSl7dGhpcy5fY291bnRlcltpXT0wfWVsc2V7dGhpcy5fY291bnRlcltpXSsrO2JyZWFrfX19O3ZhciBNb2RlT2ZPcGVyYXRpb25DVFI9ZnVuY3Rpb24oa2V5LGNvdW50ZXIpe2lmKCEodGhpcyBpbnN0YW5jZW9mIE1vZGVPZk9wZXJhdGlvbkNUUikpe3Rocm93IEVycm9yKCJBRVMgbXVzdCBiZSBpbnN0YW5pdGF0ZWQgd2l0aCBgbmV3YCIpfXRoaXMuZGVzY3JpcHRpb249IkNvdW50ZXIiO3RoaXMubmFtZT0iY3RyIjtpZighKGNvdW50ZXIgaW5zdGFuY2VvZiBDb3VudGVyKSl7Y291bnRlcj1uZXcgQ291bnRlcihjb3VudGVyKX10aGlzLl9jb3VudGVyPWNvdW50ZXI7dGhpcy5fcmVtYWluaW5nQ291bnRlcj1udWxsO3RoaXMuX3JlbWFpbmluZ0NvdW50ZXJJbmRleD0xNjt0aGlzLl9hZXM9bmV3IEFFUyhrZXkpfTtNb2RlT2ZPcGVyYXRpb25DVFIucHJvdG90eXBlLmVuY3J5cHQ9ZnVuY3Rpb24ocGxhaW50ZXh0KXt2YXIgZW5jcnlwdGVkPWNvZXJjZUFycmF5KHBsYWludGV4dCx0cnVlKTtmb3IodmFyIGk9MDtpPGVuY3J5cHRlZC5sZW5ndGg7aSsrKXtpZih0aGlzLl9yZW1haW5pbmdDb3VudGVySW5kZXg9PT0xNil7dGhpcy5fcmVtYWluaW5nQ291bnRlcj10aGlzLl9hZXMuZW5jcnlwdCh0aGlzLl9jb3VudGVyLl9jb3VudGVyKTt0aGlzLl9yZW1haW5pbmdDb3VudGVySW5kZXg9MDt0aGlzLl9jb3VudGVyLmluY3JlbWVudCgpfWVuY3J5cHRlZFtpXV49dGhpcy5fcmVtYWluaW5nQ291bnRlclt0aGlzLl9yZW1haW5pbmdDb3VudGVySW5kZXgrK119cmV0dXJuIGVuY3J5cHRlZH07TW9kZU9mT3BlcmF0aW9uQ1RSLnByb3RvdHlwZS5kZWNyeXB0PU1vZGVPZk9wZXJhdGlvbkNUUi5wcm90b3R5cGUuZW5jcnlwdDtmdW5jdGlvbiBwa2NzN3BhZChkYXRhKXtkYXRhPWNvZXJjZUFycmF5KGRhdGEsdHJ1ZSk7dmFyIHBhZGRlcj0xNi1kYXRhLmxlbmd0aCUxNjt2YXIgcmVzdWx0PWNyZWF0ZUFycmF5KGRhdGEubGVuZ3RoK3BhZGRlcik7Y29weUFycmF5KGRhdGEscmVzdWx0KTtmb3IodmFyIGk9ZGF0YS5sZW5ndGg7aTxyZXN1bHQubGVuZ3RoO2krKyl7cmVzdWx0W2ldPXBhZGRlcn1yZXR1cm4gcmVzdWx0fWZ1bmN0aW9uIHBrY3M3c3RyaXAoZGF0YSl7ZGF0YT1jb2VyY2VBcnJheShkYXRhLHRydWUpO2lmKGRhdGEubGVuZ3RoPDE2KXt0aHJvdyBuZXcgRXJyb3IoIlBLQ1MjNyBpbnZhbGlkIGxlbmd0aCIpfXZhciBwYWRkZXI9ZGF0YVtkYXRhLmxlbmd0aC0xXTtpZihwYWRkZXI+MTYpe3Rocm93IG5ldyBFcnJvcigiUEtDUyM3IHBhZGRpbmcgYnl0ZSBvdXQgb2YgcmFuZ2UiKX12YXIgbGVuZ3RoPWRhdGEubGVuZ3RoLXBhZGRlcjtmb3IodmFyIGk9MDtpPHBhZGRlcjtpKyspe2lmKGRhdGFbbGVuZ3RoK2ldIT09cGFkZGVyKXt0aHJvdyBuZXcgRXJyb3IoIlBLQ1MjNyBpbnZhbGlkIHBhZGRpbmcgYnl0ZSIpfX12YXIgcmVzdWx0PWNyZWF0ZUFycmF5KGxlbmd0aCk7Y29weUFycmF5KGRhdGEscmVzdWx0LDAsMCxsZW5ndGgpO3JldHVybiByZXN1bHR9dmFyIGFlc2pzPXtBRVM6QUVTLENvdW50ZXI6Q291bnRlcixNb2RlT2ZPcGVyYXRpb246e2VjYjpNb2RlT2ZPcGVyYXRpb25FQ0IsY2JjOk1vZGVPZk9wZXJhdGlvbkNCQyxjZmI6TW9kZU9mT3BlcmF0aW9uQ0ZCLG9mYjpNb2RlT2ZPcGVyYXRpb25PRkIsY3RyOk1vZGVPZk9wZXJhdGlvbkNUUn0sdXRpbHM6e2hleDpjb252ZXJ0SGV4LHV0Zjg6Y29udmVydFV0Zjh9LHBhZGRpbmc6e3BrY3M3OntwYWQ6cGtjczdwYWQsc3RyaXA6cGtjczdzdHJpcH19LF9hcnJheVRlc3Q6e2NvZXJjZUFycmF5OmNvZXJjZUFycmF5LGNyZWF0ZUFycmF5OmNyZWF0ZUFycmF5LGNvcHlBcnJheTpjb3B5QXJyYXl9fTtpZih0eXBlb2YgZXhwb3J0cyE9PSJ1bmRlZmluZWQiKXttb2R1bGUuZXhwb3J0cz1hZXNqc31lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT0iZnVuY3Rpb24iJiZkZWZpbmUuYW1kKXtkZWZpbmUoW10sZnVuY3Rpb24oKXtyZXR1cm4gYWVzanN9KX1lbHNle2lmKHJvb3QuYWVzanMpe2Flc2pzLl9hZXNqcz1yb290LmFlc2pzfXJvb3QuYWVzanM9YWVzanN9fSkodGhpcyl9LHt9XSwxNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHM9e25ld0ludmFsaWRBc24xRXJyb3I6ZnVuY3Rpb24obXNnKXt2YXIgZT1uZXcgRXJyb3I7ZS5uYW1lPSJJbnZhbGlkQXNuMUVycm9yIjtlLm1lc3NhZ2U9bXNnfHwiIjtyZXR1cm4gZX19fSx7fV0sMTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe3ZhciBlcnJvcnM9cmVxdWlyZSgiLi9lcnJvcnMiKTt2YXIgdHlwZXM9cmVxdWlyZSgiLi90eXBlcyIpO3ZhciBSZWFkZXI9cmVxdWlyZSgiLi9yZWFkZXIiKTt2YXIgV3JpdGVyPXJlcXVpcmUoIi4vd3JpdGVyIik7bW9kdWxlLmV4cG9ydHM9e1JlYWRlcjpSZWFkZXIsV3JpdGVyOldyaXRlcn07Zm9yKHZhciB0IGluIHR5cGVzKXtpZih0eXBlcy5oYXNPd25Qcm9wZXJ0eSh0KSltb2R1bGUuZXhwb3J0c1t0XT10eXBlc1t0XX1mb3IodmFyIGUgaW4gZXJyb3JzKXtpZihlcnJvcnMuaGFzT3duUHJvcGVydHkoZSkpbW9kdWxlLmV4cG9ydHNbZV09ZXJyb3JzW2VdfX0seyIuL2Vycm9ycyI6MTQsIi4vcmVhZGVyIjoxNiwiLi90eXBlcyI6MTcsIi4vd3JpdGVyIjoxOH1dLDE2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXt2YXIgYXNzZXJ0PXJlcXVpcmUoImFzc2VydCIpO3ZhciBCdWZmZXI9cmVxdWlyZSgic2FmZXItYnVmZmVyIikuQnVmZmVyO3ZhciBBU04xPXJlcXVpcmUoIi4vdHlwZXMiKTt2YXIgZXJyb3JzPXJlcXVpcmUoIi4vZXJyb3JzIik7dmFyIG5ld0ludmFsaWRBc24xRXJyb3I9ZXJyb3JzLm5ld0ludmFsaWRBc24xRXJyb3I7ZnVuY3Rpb24gUmVhZGVyKGRhdGEpe2lmKCFkYXRhfHwhQnVmZmVyLmlzQnVmZmVyKGRhdGEpKXRocm93IG5ldyBUeXBlRXJyb3IoImRhdGEgbXVzdCBiZSBhIG5vZGUgQnVmZmVyIik7dGhpcy5fYnVmPWRhdGE7dGhpcy5fc2l6ZT1kYXRhLmxlbmd0aDt0aGlzLl9sZW49MDt0aGlzLl9vZmZzZXQ9MH1PYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGVyLnByb3RvdHlwZSwibGVuZ3RoIix7ZW51bWVyYWJsZTp0cnVlLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9sZW59fSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KFJlYWRlci5wcm90b3R5cGUsIm9mZnNldCIse2VudW1lcmFibGU6dHJ1ZSxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fb2Zmc2V0fX0pO09iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWFkZXIucHJvdG90eXBlLCJyZW1haW4iLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fc2l6ZS10aGlzLl9vZmZzZXR9fSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KFJlYWRlci5wcm90b3R5cGUsImJ1ZmZlciIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9idWYuc2xpY2UodGhpcy5fb2Zmc2V0KX19KTtSZWFkZXIucHJvdG90eXBlLnJlYWRCeXRlPWZ1bmN0aW9uKHBlZWspe2lmKHRoaXMuX3NpemUtdGhpcy5fb2Zmc2V0PDEpcmV0dXJuIG51bGw7dmFyIGI9dGhpcy5fYnVmW3RoaXMuX29mZnNldF0mMjU1O2lmKCFwZWVrKXRoaXMuX29mZnNldCs9MTtyZXR1cm4gYn07UmVhZGVyLnByb3RvdHlwZS5wZWVrPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucmVhZEJ5dGUodHJ1ZSl9O1JlYWRlci5wcm90b3R5cGUucmVhZExlbmd0aD1mdW5jdGlvbihvZmZzZXQpe2lmKG9mZnNldD09PXVuZGVmaW5lZClvZmZzZXQ9dGhpcy5fb2Zmc2V0O2lmKG9mZnNldD49dGhpcy5fc2l6ZSlyZXR1cm4gbnVsbDt2YXIgbGVuQj10aGlzLl9idWZbb2Zmc2V0KytdJjI1NTtpZihsZW5CPT09bnVsbClyZXR1cm4gbnVsbDtpZigobGVuQiYxMjgpPT09MTI4KXtsZW5CJj0xMjc7aWYobGVuQj09PTApdGhyb3cgbmV3SW52YWxpZEFzbjFFcnJvcigiSW5kZWZpbml0ZSBsZW5ndGggbm90IHN1cHBvcnRlZCIpO2lmKGxlbkI+NCl0aHJvdyBuZXdJbnZhbGlkQXNuMUVycm9yKCJlbmNvZGluZyB0b28gbG9uZyIpO2lmKHRoaXMuX3NpemUtb2Zmc2V0PGxlbkIpcmV0dXJuIG51bGw7dGhpcy5fbGVuPTA7Zm9yKHZhciBpPTA7aTxsZW5CO2krKyl0aGlzLl9sZW49KHRoaXMuX2xlbjw8OCkrKHRoaXMuX2J1ZltvZmZzZXQrK10mMjU1KX1lbHNle3RoaXMuX2xlbj1sZW5CfXJldHVybiBvZmZzZXR9O1JlYWRlci5wcm90b3R5cGUucmVhZFNlcXVlbmNlPWZ1bmN0aW9uKHRhZyl7dmFyIHNlcT10aGlzLnBlZWsoKTtpZihzZXE9PT1udWxsKXJldHVybiBudWxsO2lmKHRhZyE9PXVuZGVmaW5lZCYmdGFnIT09c2VxKXRocm93IG5ld0ludmFsaWRBc24xRXJyb3IoIkV4cGVjdGVkIDB4Iit0YWcudG9TdHJpbmcoMTYpKyI6IGdvdCAweCIrc2VxLnRvU3RyaW5nKDE2KSk7dmFyIG89dGhpcy5yZWFkTGVuZ3RoKHRoaXMuX29mZnNldCsxKTtpZihvPT09bnVsbClyZXR1cm4gbnVsbDt0aGlzLl9vZmZzZXQ9bztyZXR1cm4gc2VxfTtSZWFkZXIucHJvdG90eXBlLnJlYWRJbnQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcmVhZFRhZyhBU04xLkludGVnZXIpfTtSZWFkZXIucHJvdG90eXBlLnJlYWRCb29sZWFuPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3JlYWRUYWcoQVNOMS5Cb29sZWFuKT09PTA/ZmFsc2U6dHJ1ZX07UmVhZGVyLnByb3RvdHlwZS5yZWFkRW51bWVyYXRpb249ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcmVhZFRhZyhBU04xLkVudW1lcmF0aW9uKX07UmVhZGVyLnByb3RvdHlwZS5yZWFkU3RyaW5nPWZ1bmN0aW9uKHRhZyxyZXRidWYpe2lmKCF0YWcpdGFnPUFTTjEuT2N0ZXRTdHJpbmc7dmFyIGI9dGhpcy5wZWVrKCk7aWYoYj09PW51bGwpcmV0dXJuIG51bGw7aWYoYiE9PXRhZyl0aHJvdyBuZXdJbnZhbGlkQXNuMUVycm9yKCJFeHBlY3RlZCAweCIrdGFnLnRvU3RyaW5nKDE2KSsiOiBnb3QgMHgiK2IudG9TdHJpbmcoMTYpKTt2YXIgbz10aGlzLnJlYWRMZW5ndGgodGhpcy5fb2Zmc2V0KzEpO2lmKG89PT1udWxsKXJldHVybiBudWxsO2lmKHRoaXMubGVuZ3RoPnRoaXMuX3NpemUtbylyZXR1cm4gbnVsbDt0aGlzLl9vZmZzZXQ9bztpZih0aGlzLmxlbmd0aD09PTApcmV0dXJuIHJldGJ1Zj9CdWZmZXIuYWxsb2MoMCk6IiI7dmFyIHN0cj10aGlzLl9idWYuc2xpY2UodGhpcy5fb2Zmc2V0LHRoaXMuX29mZnNldCt0aGlzLmxlbmd0aCk7dGhpcy5fb2Zmc2V0Kz10aGlzLmxlbmd0aDtyZXR1cm4gcmV0YnVmP3N0cjpzdHIudG9TdHJpbmcoInV0ZjgiKX07UmVhZGVyLnByb3RvdHlwZS5yZWFkT0lEPWZ1bmN0aW9uKHRhZyl7aWYoIXRhZyl0YWc9QVNOMS5PSUQ7dmFyIGI9dGhpcy5yZWFkU3RyaW5nKHRhZyx0cnVlKTtpZihiPT09bnVsbClyZXR1cm4gbnVsbDt2YXIgdmFsdWVzPVtdO3ZhciB2YWx1ZT0wO2Zvcih2YXIgaT0wO2k8Yi5sZW5ndGg7aSsrKXt2YXIgYnl0ZT1iW2ldJjI1NTt2YWx1ZTw8PTc7dmFsdWUrPWJ5dGUmMTI3O2lmKChieXRlJjEyOCk9PT0wKXt2YWx1ZXMucHVzaCh2YWx1ZSk7dmFsdWU9MH19dmFsdWU9dmFsdWVzLnNoaWZ0KCk7dmFsdWVzLnVuc2hpZnQodmFsdWUlNDApO3ZhbHVlcy51bnNoaWZ0KHZhbHVlLzQwPj4wKTtyZXR1cm4gdmFsdWVzLmpvaW4oIi4iKX07UmVhZGVyLnByb3RvdHlwZS5fcmVhZFRhZz1mdW5jdGlvbih0YWcpe2Fzc2VydC5vayh0YWchPT11bmRlZmluZWQpO3ZhciBiPXRoaXMucGVlaygpO2lmKGI9PT1udWxsKXJldHVybiBudWxsO2lmKGIhPT10YWcpdGhyb3cgbmV3SW52YWxpZEFzbjFFcnJvcigiRXhwZWN0ZWQgMHgiK3RhZy50b1N0cmluZygxNikrIjogZ290IDB4IitiLnRvU3RyaW5nKDE2KSk7dmFyIG89dGhpcy5yZWFkTGVuZ3RoKHRoaXMuX29mZnNldCsxKTtpZihvPT09bnVsbClyZXR1cm4gbnVsbDtpZih0aGlzLmxlbmd0aD40KXRocm93IG5ld0ludmFsaWRBc24xRXJyb3IoIkludGVnZXIgdG9vIGxvbmc6ICIrdGhpcy5sZW5ndGgpO2lmKHRoaXMubGVuZ3RoPnRoaXMuX3NpemUtbylyZXR1cm4gbnVsbDt0aGlzLl9vZmZzZXQ9bzt2YXIgZmI9dGhpcy5fYnVmW3RoaXMuX29mZnNldF07dmFyIHZhbHVlPTA7Zm9yKHZhciBpPTA7aTx0aGlzLmxlbmd0aDtpKyspe3ZhbHVlPDw9ODt2YWx1ZXw9dGhpcy5fYnVmW3RoaXMuX29mZnNldCsrXSYyNTV9aWYoKGZiJjEyOCk9PT0xMjgmJmkhPT00KXZhbHVlLT0xPDxpKjg7cmV0dXJuIHZhbHVlPj4wfTttb2R1bGUuZXhwb3J0cz1SZWFkZXJ9LHsiLi9lcnJvcnMiOjE0LCIuL3R5cGVzIjoxNyxhc3NlcnQ6MjAsInNhZmVyLWJ1ZmZlciI6ODR9XSwxNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHM9e0VPQzowLEJvb2xlYW46MSxJbnRlZ2VyOjIsQml0U3RyaW5nOjMsT2N0ZXRTdHJpbmc6NCxOdWxsOjUsT0lEOjYsT2JqZWN0RGVzY3JpcHRvcjo3LEV4dGVybmFsOjgsUmVhbDo5LEVudW1lcmF0aW9uOjEwLFBEVjoxMSxVdGY4U3RyaW5nOjEyLFJlbGF0aXZlT0lEOjEzLFNlcXVlbmNlOjE2LFNldDoxNyxOdW1lcmljU3RyaW5nOjE4LFByaW50YWJsZVN0cmluZzoxOSxUNjFTdHJpbmc6MjAsVmlkZW90ZXhTdHJpbmc6MjEsSUE1U3RyaW5nOjIyLFVUQ1RpbWU6MjMsR2VuZXJhbGl6ZWRUaW1lOjI0LEdyYXBoaWNTdHJpbmc6MjUsVmlzaWJsZVN0cmluZzoyNixHZW5lcmFsU3RyaW5nOjI4LFVuaXZlcnNhbFN0cmluZzoyOSxDaGFyYWN0ZXJTdHJpbmc6MzAsQk1QU3RyaW5nOjMxLENvbnN0cnVjdG9yOjMyLENvbnRleHQ6MTI4fX0se31dLDE4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXt2YXIgYXNzZXJ0PXJlcXVpcmUoImFzc2VydCIpO3ZhciBCdWZmZXI9cmVxdWlyZSgic2FmZXItYnVmZmVyIikuQnVmZmVyO3ZhciBBU04xPXJlcXVpcmUoIi4vdHlwZXMiKTt2YXIgZXJyb3JzPXJlcXVpcmUoIi4vZXJyb3JzIik7dmFyIG5ld0ludmFsaWRBc24xRXJyb3I9ZXJyb3JzLm5ld0ludmFsaWRBc24xRXJyb3I7dmFyIERFRkFVTFRfT1BUUz17c2l6ZToxMDI0LGdyb3d0aEZhY3Rvcjo4fTtmdW5jdGlvbiBtZXJnZShmcm9tLHRvKXthc3NlcnQub2soZnJvbSk7YXNzZXJ0LmVxdWFsKHR5cGVvZiBmcm9tLCJvYmplY3QiKTthc3NlcnQub2sodG8pO2Fzc2VydC5lcXVhbCh0eXBlb2YgdG8sIm9iamVjdCIpO3ZhciBrZXlzPU9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGZyb20pO2tleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpe2lmKHRvW2tleV0pcmV0dXJuO3ZhciB2YWx1ZT1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sa2V5KTtPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sa2V5LHZhbHVlKX0pO3JldHVybiB0b31mdW5jdGlvbiBXcml0ZXIob3B0aW9ucyl7b3B0aW9ucz1tZXJnZShERUZBVUxUX09QVFMsb3B0aW9uc3x8e30pO3RoaXMuX2J1Zj1CdWZmZXIuYWxsb2Mob3B0aW9ucy5zaXplfHwxMDI0KTt0aGlzLl9zaXplPXRoaXMuX2J1Zi5sZW5ndGg7dGhpcy5fb2Zmc2V0PTA7dGhpcy5fb3B0aW9ucz1vcHRpb25zO3RoaXMuX3NlcT1bXX1PYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGVyLnByb3RvdHlwZSwiYnVmZmVyIix7Z2V0OmZ1bmN0aW9uKCl7aWYodGhpcy5fc2VxLmxlbmd0aCl0aHJvdyBuZXdJbnZhbGlkQXNuMUVycm9yKHRoaXMuX3NlcS5sZW5ndGgrIiB1bmVuZGVkIHNlcXVlbmNlKHMpIik7cmV0dXJuIHRoaXMuX2J1Zi5zbGljZSgwLHRoaXMuX29mZnNldCl9fSk7V3JpdGVyLnByb3RvdHlwZS53cml0ZUJ5dGU9ZnVuY3Rpb24oYil7aWYodHlwZW9mIGIhPT0ibnVtYmVyIil0aHJvdyBuZXcgVHlwZUVycm9yKCJhcmd1bWVudCBtdXN0IGJlIGEgTnVtYmVyIik7dGhpcy5fZW5zdXJlKDEpO3RoaXMuX2J1Zlt0aGlzLl9vZmZzZXQrK109Yn07V3JpdGVyLnByb3RvdHlwZS53cml0ZUludD1mdW5jdGlvbihpLHRhZyl7aWYodHlwZW9mIGkhPT0ibnVtYmVyIil0aHJvdyBuZXcgVHlwZUVycm9yKCJhcmd1bWVudCBtdXN0IGJlIGEgTnVtYmVyIik7aWYodHlwZW9mIHRhZyE9PSJudW1iZXIiKXRhZz1BU04xLkludGVnZXI7dmFyIHN6PTQ7d2hpbGUoKChpJjQyODY1Nzg2ODgpPT09MHx8KGkmNDI4NjU3ODY4OCk9PT00Mjg2NTc4Njg4Pj4wKSYmc3o+MSl7c3otLTtpPDw9OH1pZihzej40KXRocm93IG5ld0ludmFsaWRBc24xRXJyb3IoIkJFUiBpbnRzIGNhbm5vdCBiZSA+IDB4ZmZmZmZmZmYiKTt0aGlzLl9lbnN1cmUoMitzeik7dGhpcy5fYnVmW3RoaXMuX29mZnNldCsrXT10YWc7dGhpcy5fYnVmW3RoaXMuX29mZnNldCsrXT1zejt3aGlsZShzei0tID4wKXt0aGlzLl9idWZbdGhpcy5fb2Zmc2V0KytdPShpJjQyNzgxOTAwODApPj4+MjQ7aTw8PTh9fTtXcml0ZXIucHJvdG90eXBlLndyaXRlTnVsbD1mdW5jdGlvbigpe3RoaXMud3JpdGVCeXRlKEFTTjEuTnVsbCk7dGhpcy53cml0ZUJ5dGUoMCl9O1dyaXRlci5wcm90b3R5cGUud3JpdGVFbnVtZXJhdGlvbj1mdW5jdGlvbihpLHRhZyl7aWYodHlwZW9mIGkhPT0ibnVtYmVyIil0aHJvdyBuZXcgVHlwZUVycm9yKCJhcmd1bWVudCBtdXN0IGJlIGEgTnVtYmVyIik7aWYodHlwZW9mIHRhZyE9PSJudW1iZXIiKXRhZz1BU04xLkVudW1lcmF0aW9uO3JldHVybiB0aGlzLndyaXRlSW50KGksdGFnKX07V3JpdGVyLnByb3RvdHlwZS53cml0ZUJvb2xlYW49ZnVuY3Rpb24oYix0YWcpe2lmKHR5cGVvZiBiIT09ImJvb2xlYW4iKXRocm93IG5ldyBUeXBlRXJyb3IoImFyZ3VtZW50IG11c3QgYmUgYSBCb29sZWFuIik7aWYodHlwZW9mIHRhZyE9PSJudW1iZXIiKXRhZz1BU04xLkJvb2xlYW47dGhpcy5fZW5zdXJlKDMpO3RoaXMuX2J1Zlt0aGlzLl9vZmZzZXQrK109dGFnO3RoaXMuX2J1Zlt0aGlzLl9vZmZzZXQrK109MTt0aGlzLl9idWZbdGhpcy5fb2Zmc2V0KytdPWI/MjU1OjB9O1dyaXRlci5wcm90b3R5cGUud3JpdGVTdHJpbmc9ZnVuY3Rpb24ocyx0YWcpe2lmKHR5cGVvZiBzIT09InN0cmluZyIpdGhyb3cgbmV3IFR5cGVFcnJvcigiYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZyAod2FzOiAiK3R5cGVvZiBzKyIpIik7aWYodHlwZW9mIHRhZyE9PSJudW1iZXIiKXRhZz1BU04xLk9jdGV0U3RyaW5nO3ZhciBsZW49QnVmZmVyLmJ5dGVMZW5ndGgocyk7dGhpcy53cml0ZUJ5dGUodGFnKTt0aGlzLndyaXRlTGVuZ3RoKGxlbik7aWYobGVuKXt0aGlzLl9lbnN1cmUobGVuKTt0aGlzLl9idWYud3JpdGUocyx0aGlzLl9vZmZzZXQpO3RoaXMuX29mZnNldCs9bGVufX07V3JpdGVyLnByb3RvdHlwZS53cml0ZUJ1ZmZlcj1mdW5jdGlvbihidWYsdGFnKXtpZih0eXBlb2YgdGFnIT09Im51bWJlciIpdGhyb3cgbmV3IFR5cGVFcnJvcigidGFnIG11c3QgYmUgYSBudW1iZXIiKTtpZighQnVmZmVyLmlzQnVmZmVyKGJ1ZikpdGhyb3cgbmV3IFR5cGVFcnJvcigiYXJndW1lbnQgbXVzdCBiZSBhIGJ1ZmZlciIpO3RoaXMud3JpdGVCeXRlKHRhZyk7dGhpcy53cml0ZUxlbmd0aChidWYubGVuZ3RoKTt0aGlzLl9lbnN1cmUoYnVmLmxlbmd0aCk7YnVmLmNvcHkodGhpcy5fYnVmLHRoaXMuX29mZnNldCwwLGJ1Zi5sZW5ndGgpO3RoaXMuX29mZnNldCs9YnVmLmxlbmd0aH07V3JpdGVyLnByb3RvdHlwZS53cml0ZVN0cmluZ0FycmF5PWZ1bmN0aW9uKHN0cmluZ3Mpe2lmKCFzdHJpbmdzIGluc3RhbmNlb2YgQXJyYXkpdGhyb3cgbmV3IFR5cGVFcnJvcigiYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheVtTdHJpbmddIik7dmFyIHNlbGY9dGhpcztzdHJpbmdzLmZvckVhY2goZnVuY3Rpb24ocyl7c2VsZi53cml0ZVN0cmluZyhzKX0pfTtXcml0ZXIucHJvdG90eXBlLndyaXRlT0lEPWZ1bmN0aW9uKHMsdGFnKXtpZih0eXBlb2YgcyE9PSJzdHJpbmciKXRocm93IG5ldyBUeXBlRXJyb3IoImFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmciKTtpZih0eXBlb2YgdGFnIT09Im51bWJlciIpdGFnPUFTTjEuT0lEO2lmKCEvXihbMC05XStcLil7Myx9WzAtOV0rJC8udGVzdChzKSl0aHJvdyBuZXcgRXJyb3IoImFyZ3VtZW50IGlzIG5vdCBhIHZhbGlkIE9JRCBzdHJpbmciKTtmdW5jdGlvbiBlbmNvZGVPY3RldChieXRlcyxvY3RldCl7aWYob2N0ZXQ8MTI4KXtieXRlcy5wdXNoKG9jdGV0KX1lbHNlIGlmKG9jdGV0PDE2Mzg0KXtieXRlcy5wdXNoKG9jdGV0Pj4+N3wxMjgpO2J5dGVzLnB1c2gob2N0ZXQmMTI3KX1lbHNlIGlmKG9jdGV0PDIwOTcxNTIpe2J5dGVzLnB1c2gob2N0ZXQ+Pj4xNHwxMjgpO2J5dGVzLnB1c2goKG9jdGV0Pj4+N3wxMjgpJjI1NSk7Ynl0ZXMucHVzaChvY3RldCYxMjcpfWVsc2UgaWYob2N0ZXQ8MjY4NDM1NDU2KXtieXRlcy5wdXNoKG9jdGV0Pj4+MjF8MTI4KTtieXRlcy5wdXNoKChvY3RldD4+PjE0fDEyOCkmMjU1KTtieXRlcy5wdXNoKChvY3RldD4+Pjd8MTI4KSYyNTUpO2J5dGVzLnB1c2gob2N0ZXQmMTI3KX1lbHNle2J5dGVzLnB1c2goKG9jdGV0Pj4+Mjh8MTI4KSYyNTUpO2J5dGVzLnB1c2goKG9jdGV0Pj4+MjF8MTI4KSYyNTUpO2J5dGVzLnB1c2goKG9jdGV0Pj4+MTR8MTI4KSYyNTUpO2J5dGVzLnB1c2goKG9jdGV0Pj4+N3wxMjgpJjI1NSk7Ynl0ZXMucHVzaChvY3RldCYxMjcpfX12YXIgdG1wPXMuc3BsaXQoIi4iKTt2YXIgYnl0ZXM9W107Ynl0ZXMucHVzaChwYXJzZUludCh0bXBbMF0sMTApKjQwK3BhcnNlSW50KHRtcFsxXSwxMCkpO3RtcC5zbGljZSgyKS5mb3JFYWNoKGZ1bmN0aW9uKGIpe2VuY29kZU9jdGV0KGJ5dGVzLHBhcnNlSW50KGIsMTApKX0pO3ZhciBzZWxmPXRoaXM7dGhpcy5fZW5zdXJlKDIrYnl0ZXMubGVuZ3RoKTt0aGlzLndyaXRlQnl0ZSh0YWcpO3RoaXMud3JpdGVMZW5ndGgoYnl0ZXMubGVuZ3RoKTtieXRlcy5mb3JFYWNoKGZ1bmN0aW9uKGIpe3NlbGYud3JpdGVCeXRlKGIpfSl9O1dyaXRlci5wcm90b3R5cGUud3JpdGVMZW5ndGg9ZnVuY3Rpb24obGVuKXtpZih0eXBlb2YgbGVuIT09Im51bWJlciIpdGhyb3cgbmV3IFR5cGVFcnJvcigiYXJndW1lbnQgbXVzdCBiZSBhIE51bWJlciIpO3RoaXMuX2Vuc3VyZSg0KTtpZihsZW48PTEyNyl7dGhpcy5fYnVmW3RoaXMuX29mZnNldCsrXT1sZW59ZWxzZSBpZihsZW48PTI1NSl7dGhpcy5fYnVmW3RoaXMuX29mZnNldCsrXT0xMjk7dGhpcy5fYnVmW3RoaXMuX29mZnNldCsrXT1sZW59ZWxzZSBpZihsZW48PTY1NTM1KXt0aGlzLl9idWZbdGhpcy5fb2Zmc2V0KytdPTEzMDt0aGlzLl9idWZbdGhpcy5fb2Zmc2V0KytdPWxlbj4+ODt0aGlzLl9idWZbdGhpcy5fb2Zmc2V0KytdPWxlbn1lbHNlIGlmKGxlbjw9MTY3NzcyMTUpe3RoaXMuX2J1Zlt0aGlzLl9vZmZzZXQrK109MTMxO3RoaXMuX2J1Zlt0aGlzLl9vZmZzZXQrK109bGVuPj4xNjt0aGlzLl9idWZbdGhpcy5fb2Zmc2V0KytdPWxlbj4+ODt0aGlzLl9idWZbdGhpcy5fb2Zmc2V0KytdPWxlbn1lbHNle3Rocm93IG5ld0ludmFsaWRBc24xRXJyb3IoIkxlbmd0aCB0b28gbG9uZyAoPiA0IGJ5dGVzKSIpfX07V3JpdGVyLnByb3RvdHlwZS5zdGFydFNlcXVlbmNlPWZ1bmN0aW9uKHRhZyl7aWYodHlwZW9mIHRhZyE9PSJudW1iZXIiKXRhZz1BU04xLlNlcXVlbmNlfEFTTjEuQ29uc3RydWN0b3I7dGhpcy53cml0ZUJ5dGUodGFnKTt0aGlzLl9zZXEucHVzaCh0aGlzLl9vZmZzZXQpO3RoaXMuX2Vuc3VyZSgzKTt0aGlzLl9vZmZzZXQrPTN9O1dyaXRlci5wcm90b3R5cGUuZW5kU2VxdWVuY2U9ZnVuY3Rpb24oKXt2YXIgc2VxPXRoaXMuX3NlcS5wb3AoKTt2YXIgc3RhcnQ9c2VxKzM7dmFyIGxlbj10aGlzLl9vZmZzZXQtc3RhcnQ7aWYobGVuPD0xMjcpe3RoaXMuX3NoaWZ0KHN0YXJ0LGxlbiwtMik7dGhpcy5fYnVmW3NlcV09bGVufWVsc2UgaWYobGVuPD0yNTUpe3RoaXMuX3NoaWZ0KHN0YXJ0LGxlbiwtMSk7dGhpcy5fYnVmW3NlcV09MTI5O3RoaXMuX2J1ZltzZXErMV09bGVufWVsc2UgaWYobGVuPD02NTUzNSl7dGhpcy5fYnVmW3NlcV09MTMwO3RoaXMuX2J1ZltzZXErMV09bGVuPj44O3RoaXMuX2J1ZltzZXErMl09bGVufWVsc2UgaWYobGVuPD0xNjc3NzIxNSl7dGhpcy5fc2hpZnQoc3RhcnQsbGVuLDEpO3RoaXMuX2J1ZltzZXFdPTEzMTt0aGlzLl9idWZbc2VxKzFdPWxlbj4+MTY7dGhpcy5fYnVmW3NlcSsyXT1sZW4+Pjg7dGhpcy5fYnVmW3NlcSszXT1sZW59ZWxzZXt0aHJvdyBuZXdJbnZhbGlkQXNuMUVycm9yKCJTZXF1ZW5jZSB0b28gbG9uZyIpfX07V3JpdGVyLnByb3RvdHlwZS5fc2hpZnQ9ZnVuY3Rpb24oc3RhcnQsbGVuLHNoaWZ0KXthc3NlcnQub2soc3RhcnQhPT11bmRlZmluZWQpO2Fzc2VydC5vayhsZW4hPT11bmRlZmluZWQpO2Fzc2VydC5vayhzaGlmdCk7dGhpcy5fYnVmLmNvcHkodGhpcy5fYnVmLHN0YXJ0K3NoaWZ0LHN0YXJ0LHN0YXJ0K2xlbik7dGhpcy5fb2Zmc2V0Kz1zaGlmdH07V3JpdGVyLnByb3RvdHlwZS5fZW5zdXJlPWZ1bmN0aW9uKGxlbil7YXNzZXJ0Lm9rKGxlbik7aWYodGhpcy5fc2l6ZS10aGlzLl9vZmZzZXQ8bGVuKXt2YXIgc3o9dGhpcy5fc2l6ZSp0aGlzLl9vcHRpb25zLmdyb3d0aEZhY3RvcjtpZihzei10aGlzLl9vZmZzZXQ8bGVuKXN6Kz1sZW47dmFyIGJ1Zj1CdWZmZXIuYWxsb2Moc3opO3RoaXMuX2J1Zi5jb3B5KGJ1ZiwwLDAsdGhpcy5fb2Zmc2V0KTt0aGlzLl9idWY9YnVmO3RoaXMuX3NpemU9c3p9fTttb2R1bGUuZXhwb3J0cz1Xcml0ZXJ9LHsiLi9lcnJvcnMiOjE0LCIuL3R5cGVzIjoxNyxhc3NlcnQ6MjAsInNhZmVyLWJ1ZmZlciI6ODR9XSwxOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIEJlcj1yZXF1aXJlKCIuL2Jlci9pbmRleCIpO21vZHVsZS5leHBvcnRzPXtCZXI6QmVyLEJlclJlYWRlcjpCZXIuUmVhZGVyLEJlcldyaXRlcjpCZXIuV3JpdGVyfX0seyIuL2Jlci9pbmRleCI6MTV9XSwyMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCl7InVzZSBzdHJpY3QiO3ZhciBvYmplY3RBc3NpZ249cmVxdWlyZSgib2JqZWN0LWFzc2lnbiIpO2Z1bmN0aW9uIGNvbXBhcmUoYSxiKXtpZihhPT09Yil7cmV0dXJuIDB9dmFyIHg9YS5sZW5ndGg7dmFyIHk9Yi5sZW5ndGg7Zm9yKHZhciBpPTAsbGVuPU1hdGgubWluKHgseSk7aTxsZW47KytpKXtpZihhW2ldIT09YltpXSl7eD1hW2ldO3k9YltpXTticmVha319aWYoeDx5KXtyZXR1cm4tMX1pZih5PHgpe3JldHVybiAxfXJldHVybiAwfWZ1bmN0aW9uIGlzQnVmZmVyKGIpe2lmKGdsb2JhbC5CdWZmZXImJnR5cGVvZiBnbG9iYWwuQnVmZmVyLmlzQnVmZmVyPT09ImZ1bmN0aW9uIil7cmV0dXJuIGdsb2JhbC5CdWZmZXIuaXNCdWZmZXIoYil9cmV0dXJuISEoYiE9bnVsbCYmYi5faXNCdWZmZXIpfXZhciB1dGlsPXJlcXVpcmUoInV0aWwvIik7dmFyIGhhc093bj1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O3ZhciBwU2xpY2U9QXJyYXkucHJvdG90eXBlLnNsaWNlO3ZhciBmdW5jdGlvbnNIYXZlTmFtZXM9ZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24gZm9vKCl7fS5uYW1lPT09ImZvbyJ9KCk7ZnVuY3Rpb24gcFRvU3RyaW5nKG9iail7cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopfWZ1bmN0aW9uIGlzVmlldyhhcnJidWYpe2lmKGlzQnVmZmVyKGFycmJ1Zikpe3JldHVybiBmYWxzZX1pZih0eXBlb2YgZ2xvYmFsLkFycmF5QnVmZmVyIT09ImZ1bmN0aW9uIil7cmV0dXJuIGZhbHNlfWlmKHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXc9PT0iZnVuY3Rpb24iKXtyZXR1cm4gQXJyYXlCdWZmZXIuaXNWaWV3KGFycmJ1Zil9aWYoIWFycmJ1Zil7cmV0dXJuIGZhbHNlfWlmKGFycmJ1ZiBpbnN0YW5jZW9mIERhdGFWaWV3KXtyZXR1cm4gdHJ1ZX1pZihhcnJidWYuYnVmZmVyJiZhcnJidWYuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe3JldHVybiB0cnVlfXJldHVybiBmYWxzZX12YXIgYXNzZXJ0PW1vZHVsZS5leHBvcnRzPW9rO3ZhciByZWdleD0vXHMqZnVuY3Rpb25ccysoW15cKFxzXSopXHMqLztmdW5jdGlvbiBnZXROYW1lKGZ1bmMpe2lmKCF1dGlsLmlzRnVuY3Rpb24oZnVuYykpe3JldHVybn1pZihmdW5jdGlvbnNIYXZlTmFtZXMpe3JldHVybiBmdW5jLm5hbWV9dmFyIHN0cj1mdW5jLnRvU3RyaW5nKCk7dmFyIG1hdGNoPXN0ci5tYXRjaChyZWdleCk7cmV0dXJuIG1hdGNoJiZtYXRjaFsxXX1hc3NlcnQuQXNzZXJ0aW9uRXJyb3I9ZnVuY3Rpb24gQXNzZXJ0aW9uRXJyb3Iob3B0aW9ucyl7dGhpcy5uYW1lPSJBc3NlcnRpb25FcnJvciI7dGhpcy5hY3R1YWw9b3B0aW9ucy5hY3R1YWw7dGhpcy5leHBlY3RlZD1vcHRpb25zLmV4cGVjdGVkO3RoaXMub3BlcmF0b3I9b3B0aW9ucy5vcGVyYXRvcjtpZihvcHRpb25zLm1lc3NhZ2Upe3RoaXMubWVzc2FnZT1vcHRpb25zLm1lc3NhZ2U7dGhpcy5nZW5lcmF0ZWRNZXNzYWdlPWZhbHNlfWVsc2V7dGhpcy5tZXNzYWdlPWdldE1lc3NhZ2UodGhpcyk7dGhpcy5nZW5lcmF0ZWRNZXNzYWdlPXRydWV9dmFyIHN0YWNrU3RhcnRGdW5jdGlvbj1vcHRpb25zLnN0YWNrU3RhcnRGdW5jdGlvbnx8ZmFpbDtpZihFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSl7RXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcyxzdGFja1N0YXJ0RnVuY3Rpb24pfWVsc2V7dmFyIGVycj1uZXcgRXJyb3I7aWYoZXJyLnN0YWNrKXt2YXIgb3V0PWVyci5zdGFjazt2YXIgZm5fbmFtZT1nZXROYW1lKHN0YWNrU3RhcnRGdW5jdGlvbik7dmFyIGlkeD1vdXQuaW5kZXhPZigiXG4iK2ZuX25hbWUpO2lmKGlkeD49MCl7dmFyIG5leHRfbGluZT1vdXQuaW5kZXhPZigiXG4iLGlkeCsxKTtvdXQ9b3V0LnN1YnN0cmluZyhuZXh0X2xpbmUrMSl9dGhpcy5zdGFjaz1vdXR9fX07dXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsRXJyb3IpO2Z1bmN0aW9uIHRydW5jYXRlKHMsbil7aWYodHlwZW9mIHM9PT0ic3RyaW5nIil7cmV0dXJuIHMubGVuZ3RoPG4/czpzLnNsaWNlKDAsbil9ZWxzZXtyZXR1cm4gc319ZnVuY3Rpb24gaW5zcGVjdChzb21ldGhpbmcpe2lmKGZ1bmN0aW9uc0hhdmVOYW1lc3x8IXV0aWwuaXNGdW5jdGlvbihzb21ldGhpbmcpKXtyZXR1cm4gdXRpbC5pbnNwZWN0KHNvbWV0aGluZyl9dmFyIHJhd25hbWU9Z2V0TmFtZShzb21ldGhpbmcpO3ZhciBuYW1lPXJhd25hbWU/IjogIityYXduYW1lOiIiO3JldHVybiJbRnVuY3Rpb24iK25hbWUrIl0ifWZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZil7cmV0dXJuIHRydW5jYXRlKGluc3BlY3Qoc2VsZi5hY3R1YWwpLDEyOCkrIiAiK3NlbGYub3BlcmF0b3IrIiAiK3RydW5jYXRlKGluc3BlY3Qoc2VsZi5leHBlY3RlZCksMTI4KX1mdW5jdGlvbiBmYWlsKGFjdHVhbCxleHBlY3RlZCxtZXNzYWdlLG9wZXJhdG9yLHN0YWNrU3RhcnRGdW5jdGlvbil7dGhyb3cgbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7bWVzc2FnZTptZXNzYWdlLGFjdHVhbDphY3R1YWwsZXhwZWN0ZWQ6ZXhwZWN0ZWQsb3BlcmF0b3I6b3BlcmF0b3Isc3RhY2tTdGFydEZ1bmN0aW9uOnN0YWNrU3RhcnRGdW5jdGlvbn0pfWFzc2VydC5mYWlsPWZhaWw7ZnVuY3Rpb24gb2sodmFsdWUsbWVzc2FnZSl7aWYoIXZhbHVlKWZhaWwodmFsdWUsdHJ1ZSxtZXNzYWdlLCI9PSIsYXNzZXJ0Lm9rKX1hc3NlcnQub2s9b2s7YXNzZXJ0LmVxdWFsPWZ1bmN0aW9uIGVxdWFsKGFjdHVhbCxleHBlY3RlZCxtZXNzYWdlKXtpZihhY3R1YWwhPWV4cGVjdGVkKWZhaWwoYWN0dWFsLGV4cGVjdGVkLG1lc3NhZ2UsIj09Iixhc3NlcnQuZXF1YWwpfTthc3NlcnQubm90RXF1YWw9ZnVuY3Rpb24gbm90RXF1YWwoYWN0dWFsLGV4cGVjdGVkLG1lc3NhZ2Upe2lmKGFjdHVhbD09ZXhwZWN0ZWQpe2ZhaWwoYWN0dWFsLGV4cGVjdGVkLG1lc3NhZ2UsIiE9Iixhc3NlcnQubm90RXF1YWwpfX07YXNzZXJ0LmRlZXBFcXVhbD1mdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLGV4cGVjdGVkLG1lc3NhZ2Upe2lmKCFfZGVlcEVxdWFsKGFjdHVhbCxleHBlY3RlZCxmYWxzZSkpe2ZhaWwoYWN0dWFsLGV4cGVjdGVkLG1lc3NhZ2UsImRlZXBFcXVhbCIsYXNzZXJ0LmRlZXBFcXVhbCl9fTthc3NlcnQuZGVlcFN0cmljdEVxdWFsPWZ1bmN0aW9uIGRlZXBTdHJpY3RFcXVhbChhY3R1YWwsZXhwZWN0ZWQsbWVzc2FnZSl7aWYoIV9kZWVwRXF1YWwoYWN0dWFsLGV4cGVjdGVkLHRydWUpKXtmYWlsKGFjdHVhbCxleHBlY3RlZCxtZXNzYWdlLCJkZWVwU3RyaWN0RXF1YWwiLGFzc2VydC5kZWVwU3RyaWN0RXF1YWwpfX07ZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsZXhwZWN0ZWQsc3RyaWN0LG1lbW9zKXtpZihhY3R1YWw9PT1leHBlY3RlZCl7cmV0dXJuIHRydWV9ZWxzZSBpZihpc0J1ZmZlcihhY3R1YWwpJiZpc0J1ZmZlcihleHBlY3RlZCkpe3JldHVybiBjb21wYXJlKGFjdHVhbCxleHBlY3RlZCk9PT0wfWVsc2UgaWYodXRpbC5pc0RhdGUoYWN0dWFsKSYmdXRpbC5pc0RhdGUoZXhwZWN0ZWQpKXtyZXR1cm4gYWN0dWFsLmdldFRpbWUoKT09PWV4cGVjdGVkLmdldFRpbWUoKX1lbHNlIGlmKHV0aWwuaXNSZWdFeHAoYWN0dWFsKSYmdXRpbC5pc1JlZ0V4cChleHBlY3RlZCkpe3JldHVybiBhY3R1YWwuc291cmNlPT09ZXhwZWN0ZWQuc291cmNlJiZhY3R1YWwuZ2xvYmFsPT09ZXhwZWN0ZWQuZ2xvYmFsJiZhY3R1YWwubXVsdGlsaW5lPT09ZXhwZWN0ZWQubXVsdGlsaW5lJiZhY3R1YWwubGFzdEluZGV4PT09ZXhwZWN0ZWQubGFzdEluZGV4JiZhY3R1YWwuaWdub3JlQ2FzZT09PWV4cGVjdGVkLmlnbm9yZUNhc2V9ZWxzZSBpZigoYWN0dWFsPT09bnVsbHx8dHlwZW9mIGFjdHVhbCE9PSJvYmplY3QiKSYmKGV4cGVjdGVkPT09bnVsbHx8dHlwZW9mIGV4cGVjdGVkIT09Im9iamVjdCIpKXtyZXR1cm4gc3RyaWN0P2FjdHVhbD09PWV4cGVjdGVkOmFjdHVhbD09ZXhwZWN0ZWR9ZWxzZSBpZihpc1ZpZXcoYWN0dWFsKSYmaXNWaWV3KGV4cGVjdGVkKSYmcFRvU3RyaW5nKGFjdHVhbCk9PT1wVG9TdHJpbmcoZXhwZWN0ZWQpJiYhKGFjdHVhbCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheXx8YWN0dWFsIGluc3RhbmNlb2YgRmxvYXQ2NEFycmF5KSl7cmV0dXJuIGNvbXBhcmUobmV3IFVpbnQ4QXJyYXkoYWN0dWFsLmJ1ZmZlciksbmV3IFVpbnQ4QXJyYXkoZXhwZWN0ZWQuYnVmZmVyKSk9PT0wfWVsc2UgaWYoaXNCdWZmZXIoYWN0dWFsKSE9PWlzQnVmZmVyKGV4cGVjdGVkKSl7cmV0dXJuIGZhbHNlfWVsc2V7bWVtb3M9bWVtb3N8fHthY3R1YWw6W10sZXhwZWN0ZWQ6W119O3ZhciBhY3R1YWxJbmRleD1tZW1vcy5hY3R1YWwuaW5kZXhPZihhY3R1YWwpO2lmKGFjdHVhbEluZGV4IT09LTEpe2lmKGFjdHVhbEluZGV4PT09bWVtb3MuZXhwZWN0ZWQuaW5kZXhPZihleHBlY3RlZCkpe3JldHVybiB0cnVlfX1tZW1vcy5hY3R1YWwucHVzaChhY3R1YWwpO21lbW9zLmV4cGVjdGVkLnB1c2goZXhwZWN0ZWQpO3JldHVybiBvYmpFcXVpdihhY3R1YWwsZXhwZWN0ZWQsc3RyaWN0LG1lbW9zKX19ZnVuY3Rpb24gaXNBcmd1bWVudHMob2JqZWN0KXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCk9PSJbb2JqZWN0IEFyZ3VtZW50c10ifWZ1bmN0aW9uIG9iakVxdWl2KGEsYixzdHJpY3QsYWN0dWFsVmlzaXRlZE9iamVjdHMpe2lmKGE9PT1udWxsfHxhPT09dW5kZWZpbmVkfHxiPT09bnVsbHx8Yj09PXVuZGVmaW5lZClyZXR1cm4gZmFsc2U7aWYodXRpbC5pc1ByaW1pdGl2ZShhKXx8dXRpbC5pc1ByaW1pdGl2ZShiKSlyZXR1cm4gYT09PWI7aWYoc3RyaWN0JiZPYmplY3QuZ2V0UHJvdG90eXBlT2YoYSkhPT1PYmplY3QuZ2V0UHJvdG90eXBlT2YoYikpcmV0dXJuIGZhbHNlO3ZhciBhSXNBcmdzPWlzQXJndW1lbnRzKGEpO3ZhciBiSXNBcmdzPWlzQXJndW1lbnRzKGIpO2lmKGFJc0FyZ3MmJiFiSXNBcmdzfHwhYUlzQXJncyYmYklzQXJncylyZXR1cm4gZmFsc2U7aWYoYUlzQXJncyl7YT1wU2xpY2UuY2FsbChhKTtiPXBTbGljZS5jYWxsKGIpO3JldHVybiBfZGVlcEVxdWFsKGEsYixzdHJpY3QpfXZhciBrYT1vYmplY3RLZXlzKGEpO3ZhciBrYj1vYmplY3RLZXlzKGIpO3ZhciBrZXksaTtpZihrYS5sZW5ndGghPT1rYi5sZW5ndGgpcmV0dXJuIGZhbHNlO2thLnNvcnQoKTtrYi5zb3J0KCk7Zm9yKGk9a2EubGVuZ3RoLTE7aT49MDtpLS0pe2lmKGthW2ldIT09a2JbaV0pcmV0dXJuIGZhbHNlfWZvcihpPWthLmxlbmd0aC0xO2k+PTA7aS0tKXtrZXk9a2FbaV07aWYoIV9kZWVwRXF1YWwoYVtrZXldLGJba2V5XSxzdHJpY3QsYWN0dWFsVmlzaXRlZE9iamVjdHMpKXJldHVybiBmYWxzZX1yZXR1cm4gdHJ1ZX1hc3NlcnQubm90RGVlcEVxdWFsPWZ1bmN0aW9uIG5vdERlZXBFcXVhbChhY3R1YWwsZXhwZWN0ZWQsbWVzc2FnZSl7aWYoX2RlZXBFcXVhbChhY3R1YWwsZXhwZWN0ZWQsZmFsc2UpKXtmYWlsKGFjdHVhbCxleHBlY3RlZCxtZXNzYWdlLCJub3REZWVwRXF1YWwiLGFzc2VydC5ub3REZWVwRXF1YWwpfX07YXNzZXJ0Lm5vdERlZXBTdHJpY3RFcXVhbD1ub3REZWVwU3RyaWN0RXF1YWw7ZnVuY3Rpb24gbm90RGVlcFN0cmljdEVxdWFsKGFjdHVhbCxleHBlY3RlZCxtZXNzYWdlKXtpZihfZGVlcEVxdWFsKGFjdHVhbCxleHBlY3RlZCx0cnVlKSl7ZmFpbChhY3R1YWwsZXhwZWN0ZWQsbWVzc2FnZSwibm90RGVlcFN0cmljdEVxdWFsIixub3REZWVwU3RyaWN0RXF1YWwpfX1hc3NlcnQuc3RyaWN0RXF1YWw9ZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLGV4cGVjdGVkLG1lc3NhZ2Upe2lmKGFjdHVhbCE9PWV4cGVjdGVkKXtmYWlsKGFjdHVhbCxleHBlY3RlZCxtZXNzYWdlLCI9PT0iLGFzc2VydC5zdHJpY3RFcXVhbCl9fTthc3NlcnQubm90U3RyaWN0RXF1YWw9ZnVuY3Rpb24gbm90U3RyaWN0RXF1YWwoYWN0dWFsLGV4cGVjdGVkLG1lc3NhZ2Upe2lmKGFjdHVhbD09PWV4cGVjdGVkKXtmYWlsKGFjdHVhbCxleHBlY3RlZCxtZXNzYWdlLCIhPT0iLGFzc2VydC5ub3RTdHJpY3RFcXVhbCl9fTtmdW5jdGlvbiBleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsZXhwZWN0ZWQpe2lmKCFhY3R1YWx8fCFleHBlY3RlZCl7cmV0dXJuIGZhbHNlfWlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChleHBlY3RlZCk9PSJbb2JqZWN0IFJlZ0V4cF0iKXtyZXR1cm4gZXhwZWN0ZWQudGVzdChhY3R1YWwpfXRyeXtpZihhY3R1YWwgaW5zdGFuY2VvZiBleHBlY3RlZCl7cmV0dXJuIHRydWV9fWNhdGNoKGUpe31pZihFcnJvci5pc1Byb3RvdHlwZU9mKGV4cGVjdGVkKSl7cmV0dXJuIGZhbHNlfXJldHVybiBleHBlY3RlZC5jYWxsKHt9LGFjdHVhbCk9PT10cnVlfWZ1bmN0aW9uIF90cnlCbG9jayhibG9jayl7dmFyIGVycm9yO3RyeXtibG9jaygpfWNhdGNoKGUpe2Vycm9yPWV9cmV0dXJuIGVycm9yfWZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csYmxvY2ssZXhwZWN0ZWQsbWVzc2FnZSl7dmFyIGFjdHVhbDtpZih0eXBlb2YgYmxvY2shPT0iZnVuY3Rpb24iKXt0aHJvdyBuZXcgVHlwZUVycm9yKCciYmxvY2siIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpfWlmKHR5cGVvZiBleHBlY3RlZD09PSJzdHJpbmciKXttZXNzYWdlPWV4cGVjdGVkO2V4cGVjdGVkPW51bGx9YWN0dWFsPV90cnlCbG9jayhibG9jayk7bWVzc2FnZT0oZXhwZWN0ZWQmJmV4cGVjdGVkLm5hbWU/IiAoIitleHBlY3RlZC5uYW1lKyIpLiI6Ii4iKSsobWVzc2FnZT8iICIrbWVzc2FnZToiLiIpO2lmKHNob3VsZFRocm93JiYhYWN0dWFsKXtmYWlsKGFjdHVhbCxleHBlY3RlZCwiTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24iK21lc3NhZ2UpfXZhciB1c2VyUHJvdmlkZWRNZXNzYWdlPXR5cGVvZiBtZXNzYWdlPT09InN0cmluZyI7dmFyIGlzVW53YW50ZWRFeGNlcHRpb249IXNob3VsZFRocm93JiZ1dGlsLmlzRXJyb3IoYWN0dWFsKTt2YXIgaXNVbmV4cGVjdGVkRXhjZXB0aW9uPSFzaG91bGRUaHJvdyYmYWN0dWFsJiYhZXhwZWN0ZWQ7aWYoaXNVbndhbnRlZEV4Y2VwdGlvbiYmdXNlclByb3ZpZGVkTWVzc2FnZSYmZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLGV4cGVjdGVkKXx8aXNVbmV4cGVjdGVkRXhjZXB0aW9uKXtmYWlsKGFjdHVhbCxleHBlY3RlZCwiR290IHVud2FudGVkIGV4Y2VwdGlvbiIrbWVzc2FnZSl9aWYoc2hvdWxkVGhyb3cmJmFjdHVhbCYmZXhwZWN0ZWQmJiFleHBlY3RlZEV4Y2VwdGlvbihhY3R1YWwsZXhwZWN0ZWQpfHwhc2hvdWxkVGhyb3cmJmFjdHVhbCl7dGhyb3cgYWN0dWFsfX1hc3NlcnQudGhyb3dzPWZ1bmN0aW9uKGJsb2NrLGVycm9yLG1lc3NhZ2Upe190aHJvd3ModHJ1ZSxibG9jayxlcnJvcixtZXNzYWdlKX07YXNzZXJ0LmRvZXNOb3RUaHJvdz1mdW5jdGlvbihibG9jayxlcnJvcixtZXNzYWdlKXtfdGhyb3dzKGZhbHNlLGJsb2NrLGVycm9yLG1lc3NhZ2UpfTthc3NlcnQuaWZFcnJvcj1mdW5jdGlvbihlcnIpe2lmKGVycil0aHJvdyBlcnJ9O2Z1bmN0aW9uIHN0cmljdCh2YWx1ZSxtZXNzYWdlKXtpZighdmFsdWUpZmFpbCh2YWx1ZSx0cnVlLG1lc3NhZ2UsIj09IixzdHJpY3QpfWFzc2VydC5zdHJpY3Q9b2JqZWN0QXNzaWduKHN0cmljdCxhc3NlcnQse2VxdWFsOmFzc2VydC5zdHJpY3RFcXVhbCxkZWVwRXF1YWw6YXNzZXJ0LmRlZXBTdHJpY3RFcXVhbCxub3RFcXVhbDphc3NlcnQubm90U3RyaWN0RXF1YWwsbm90RGVlcEVxdWFsOmFzc2VydC5ub3REZWVwU3RyaWN0RXF1YWx9KTthc3NlcnQuc3RyaWN0LnN0cmljdD1hc3NlcnQuc3RyaWN0O3ZhciBvYmplY3RLZXlzPU9iamVjdC5rZXlzfHxmdW5jdGlvbihvYmope3ZhciBrZXlzPVtdO2Zvcih2YXIga2V5IGluIG9iail7aWYoaGFzT3duLmNhbGwob2JqLGtleSkpa2V5cy5wdXNoKGtleSl9cmV0dXJuIGtleXN9fSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwhPT0idW5kZWZpbmVkIj9nbG9iYWw6dHlwZW9mIHNlbGYhPT0idW5kZWZpbmVkIj9zZWxmOnR5cGVvZiB3aW5kb3chPT0idW5kZWZpbmVkIj93aW5kb3c6e30pfSx7Im9iamVjdC1hc3NpZ24iOjU5LCJ1dGlsLyI6MjN9XSwyMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7aWYodHlwZW9mIE9iamVjdC5jcmVhdGU9PT0iZnVuY3Rpb24iKXttb2R1bGUuZXhwb3J0cz1mdW5jdGlvbiBpbmhlcml0cyhjdG9yLHN1cGVyQ3Rvcil7Y3Rvci5zdXBlcl89c3VwZXJDdG9yO2N0b3IucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmN0b3IsZW51bWVyYWJsZTpmYWxzZSx3cml0YWJsZTp0cnVlLGNvbmZpZ3VyYWJsZTp0cnVlfX0pfX1lbHNle21vZHVsZS5leHBvcnRzPWZ1bmN0aW9uIGluaGVyaXRzKGN0b3Isc3VwZXJDdG9yKXtjdG9yLnN1cGVyXz1zdXBlckN0b3I7dmFyIFRlbXBDdG9yPWZ1bmN0aW9uKCl7fTtUZW1wQ3Rvci5wcm90b3R5cGU9c3VwZXJDdG9yLnByb3RvdHlwZTtjdG9yLnByb3RvdHlwZT1uZXcgVGVtcEN0b3I7Y3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3I9Y3Rvcn19fSx7fV0sMjI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe21vZHVsZS5leHBvcnRzPWZ1bmN0aW9uIGlzQnVmZmVyKGFyZyl7cmV0dXJuIGFyZyYmdHlwZW9mIGFyZz09PSJvYmplY3QiJiZ0eXBlb2YgYXJnLmNvcHk9PT0iZnVuY3Rpb24iJiZ0eXBlb2YgYXJnLmZpbGw9PT0iZnVuY3Rpb24iJiZ0eXBlb2YgYXJnLnJlYWRVSW50OD09PSJmdW5jdGlvbiJ9fSx7fV0sMjM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihwcm9jZXNzLGdsb2JhbCl7dmFyIGZvcm1hdFJlZ0V4cD0vJVtzZGolXS9nO2V4cG9ydHMuZm9ybWF0PWZ1bmN0aW9uKGYpe2lmKCFpc1N0cmluZyhmKSl7dmFyIG9iamVjdHM9W107Zm9yKHZhciBpPTA7aTxhcmd1bWVudHMubGVuZ3RoO2krKyl7b2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSl9cmV0dXJuIG9iamVjdHMuam9pbigiICIpfXZhciBpPTE7dmFyIGFyZ3M9YXJndW1lbnRzO3ZhciBsZW49YXJncy5sZW5ndGg7dmFyIHN0cj1TdHJpbmcoZikucmVwbGFjZShmb3JtYXRSZWdFeHAsZnVuY3Rpb24oeCl7aWYoeD09PSIlJSIpcmV0dXJuIiUiO2lmKGk+PWxlbilyZXR1cm4geDtzd2l0Y2goeCl7Y2FzZSIlcyI6cmV0dXJuIFN0cmluZyhhcmdzW2krK10pO2Nhc2UiJWQiOnJldHVybiBOdW1iZXIoYXJnc1tpKytdKTtjYXNlIiVqIjp0cnl7cmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSl9Y2F0Y2goXyl7cmV0dXJuIltDaXJjdWxhcl0ifWRlZmF1bHQ6cmV0dXJuIHh9fSk7Zm9yKHZhciB4PWFyZ3NbaV07aTxsZW47eD1hcmdzWysraV0pe2lmKGlzTnVsbCh4KXx8IWlzT2JqZWN0KHgpKXtzdHIrPSIgIit4fWVsc2V7c3RyKz0iICIraW5zcGVjdCh4KX19cmV0dXJuIHN0cn07ZXhwb3J0cy5kZXByZWNhdGU9ZnVuY3Rpb24oZm4sbXNnKXtpZihpc1VuZGVmaW5lZChnbG9iYWwucHJvY2Vzcykpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbixtc2cpLmFwcGx5KHRoaXMsYXJndW1lbnRzKX19aWYocHJvY2Vzcy5ub0RlcHJlY2F0aW9uPT09dHJ1ZSl7cmV0dXJuIGZufXZhciB3YXJuZWQ9ZmFsc2U7ZnVuY3Rpb24gZGVwcmVjYXRlZCgpe2lmKCF3YXJuZWQpe2lmKHByb2Nlc3MudGhyb3dEZXByZWNhdGlvbil7dGhyb3cgbmV3IEVycm9yKG1zZyl9ZWxzZSBpZihwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pe2NvbnNvbGUudHJhY2UobXNnKX1lbHNle2NvbnNvbGUuZXJyb3IobXNnKX13YXJuZWQ9dHJ1ZX1yZXR1cm4gZm4uYXBwbHkodGhpcyxhcmd1bWVudHMpfXJldHVybiBkZXByZWNhdGVkfTt2YXIgZGVidWdzPXt9O3ZhciBkZWJ1Z0Vudmlyb247ZXhwb3J0cy5kZWJ1Z2xvZz1mdW5jdGlvbihzZXQpe2lmKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpZGVidWdFbnZpcm9uPXByb2Nlc3MuZW52Lk5PREVfREVCVUd8fCIiO3NldD1zZXQudG9VcHBlckNhc2UoKTtpZighZGVidWdzW3NldF0pe2lmKG5ldyBSZWdFeHAoIlxcYiIrc2V0KyJcXGIiLCJpIikudGVzdChkZWJ1Z0Vudmlyb24pKXt2YXIgcGlkPXByb2Nlc3MucGlkO2RlYnVnc1tzZXRdPWZ1bmN0aW9uKCl7dmFyIG1zZz1leHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLGFyZ3VtZW50cyk7Y29uc29sZS5lcnJvcigiJXMgJWQ6ICVzIixzZXQscGlkLG1zZyl9fWVsc2V7ZGVidWdzW3NldF09ZnVuY3Rpb24oKXt9fX1yZXR1cm4gZGVidWdzW3NldF19O2Z1bmN0aW9uIGluc3BlY3Qob2JqLG9wdHMpe3ZhciBjdHg9e3NlZW46W10sc3R5bGl6ZTpzdHlsaXplTm9Db2xvcn07aWYoYXJndW1lbnRzLmxlbmd0aD49MyljdHguZGVwdGg9YXJndW1lbnRzWzJdO2lmKGFyZ3VtZW50cy5sZW5ndGg+PTQpY3R4LmNvbG9ycz1hcmd1bWVudHNbM107aWYoaXNCb29sZWFuKG9wdHMpKXtjdHguc2hvd0hpZGRlbj1vcHRzfWVsc2UgaWYob3B0cyl7ZXhwb3J0cy5fZXh0ZW5kKGN0eCxvcHRzKX1pZihpc1VuZGVmaW5lZChjdHguc2hvd0hpZGRlbikpY3R4LnNob3dIaWRkZW49ZmFsc2U7aWYoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSljdHguZGVwdGg9MjtpZihpc1VuZGVmaW5lZChjdHguY29sb3JzKSljdHguY29sb3JzPWZhbHNlO2lmKGlzVW5kZWZpbmVkKGN0eC5jdXN0b21JbnNwZWN0KSljdHguY3VzdG9tSW5zcGVjdD10cnVlO2lmKGN0eC5jb2xvcnMpY3R4LnN0eWxpemU9c3R5bGl6ZVdpdGhDb2xvcjtyZXR1cm4gZm9ybWF0VmFsdWUoY3R4LG9iaixjdHguZGVwdGgpfWV4cG9ydHMuaW5zcGVjdD1pbnNwZWN0O2luc3BlY3QuY29sb3JzPXtib2xkOlsxLDIyXSxpdGFsaWM6WzMsMjNdLHVuZGVybGluZTpbNCwyNF0saW52ZXJzZTpbNywyN10sd2hpdGU6WzM3LDM5XSxncmV5Ols5MCwzOV0sYmxhY2s6WzMwLDM5XSxibHVlOlszNCwzOV0sY3lhbjpbMzYsMzldLGdyZWVuOlszMiwzOV0sbWFnZW50YTpbMzUsMzldLHJlZDpbMzEsMzldLHllbGxvdzpbMzMsMzldfTtpbnNwZWN0LnN0eWxlcz17c3BlY2lhbDoiY3lhbiIsbnVtYmVyOiJ5ZWxsb3ciLGJvb2xlYW46InllbGxvdyIsdW5kZWZpbmVkOiJncmV5IixudWxsOiJib2xkIixzdHJpbmc6ImdyZWVuIixkYXRlOiJtYWdlbnRhIixyZWdleHA6InJlZCJ9O2Z1bmN0aW9uIHN0eWxpemVXaXRoQ29sb3Ioc3RyLHN0eWxlVHlwZSl7dmFyIHN0eWxlPWluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07aWYoc3R5bGUpe3JldHVybiIbWyIraW5zcGVjdC5jb2xvcnNbc3R5bGVdWzBdKyJtIitzdHIrIhtbIitpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMV0rIm0ifWVsc2V7cmV0dXJuIHN0cn19ZnVuY3Rpb24gc3R5bGl6ZU5vQ29sb3Ioc3RyLHN0eWxlVHlwZSl7cmV0dXJuIHN0cn1mdW5jdGlvbiBhcnJheVRvSGFzaChhcnJheSl7dmFyIGhhc2g9e307YXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsaWR4KXtoYXNoW3ZhbF09dHJ1ZX0pO3JldHVybiBoYXNofWZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCx2YWx1ZSxyZWN1cnNlVGltZXMpe2lmKGN0eC5jdXN0b21JbnNwZWN0JiZ2YWx1ZSYmaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSYmdmFsdWUuaW5zcGVjdCE9PWV4cG9ydHMuaW5zcGVjdCYmISh2YWx1ZS5jb25zdHJ1Y3RvciYmdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlPT09dmFsdWUpKXt2YXIgcmV0PXZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLGN0eCk7aWYoIWlzU3RyaW5nKHJldCkpe3JldD1mb3JtYXRWYWx1ZShjdHgscmV0LHJlY3Vyc2VUaW1lcyl9cmV0dXJuIHJldH12YXIgcHJpbWl0aXZlPWZvcm1hdFByaW1pdGl2ZShjdHgsdmFsdWUpO2lmKHByaW1pdGl2ZSl7cmV0dXJuIHByaW1pdGl2ZX12YXIga2V5cz1PYmplY3Qua2V5cyh2YWx1ZSk7dmFyIHZpc2libGVLZXlzPWFycmF5VG9IYXNoKGtleXMpO2lmKGN0eC5zaG93SGlkZGVuKXtrZXlzPU9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhbHVlKX1pZihpc0Vycm9yKHZhbHVlKSYmKGtleXMuaW5kZXhPZigibWVzc2FnZSIpPj0wfHxrZXlzLmluZGV4T2YoImRlc2NyaXB0aW9uIik+PTApKXtyZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpfWlmKGtleXMubGVuZ3RoPT09MCl7aWYoaXNGdW5jdGlvbih2YWx1ZSkpe3ZhciBuYW1lPXZhbHVlLm5hbWU/IjogIit2YWx1ZS5uYW1lOiIiO3JldHVybiBjdHguc3R5bGl6ZSgiW0Z1bmN0aW9uIituYW1lKyJdIiwic3BlY2lhbCIpfWlmKGlzUmVnRXhwKHZhbHVlKSl7cmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksInJlZ2V4cCIpfWlmKGlzRGF0ZSh2YWx1ZSkpe3JldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwiZGF0ZSIpfWlmKGlzRXJyb3IodmFsdWUpKXtyZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpfX12YXIgYmFzZT0iIixhcnJheT1mYWxzZSxicmFjZXM9WyJ7IiwifSJdO2lmKGlzQXJyYXkodmFsdWUpKXthcnJheT10cnVlO2JyYWNlcz1bIlsiLCJdIl19aWYoaXNGdW5jdGlvbih2YWx1ZSkpe3ZhciBuPXZhbHVlLm5hbWU/IjogIit2YWx1ZS5uYW1lOiIiO2Jhc2U9IiBbRnVuY3Rpb24iK24rIl0ifWlmKGlzUmVnRXhwKHZhbHVlKSl7YmFzZT0iICIrUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKX1pZihpc0RhdGUodmFsdWUpKXtiYXNlPSIgIitEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKX1pZihpc0Vycm9yKHZhbHVlKSl7YmFzZT0iICIrZm9ybWF0RXJyb3IodmFsdWUpfWlmKGtleXMubGVuZ3RoPT09MCYmKCFhcnJheXx8dmFsdWUubGVuZ3RoPT0wKSl7cmV0dXJuIGJyYWNlc1swXStiYXNlK2JyYWNlc1sxXX1pZihyZWN1cnNlVGltZXM8MCl7aWYoaXNSZWdFeHAodmFsdWUpKXtyZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwicmVnZXhwIil9ZWxzZXtyZXR1cm4gY3R4LnN0eWxpemUoIltPYmplY3RdIiwic3BlY2lhbCIpfX1jdHguc2Vlbi5wdXNoKHZhbHVlKTt2YXIgb3V0cHV0O2lmKGFycmF5KXtvdXRwdXQ9Zm9ybWF0QXJyYXkoY3R4LHZhbHVlLHJlY3Vyc2VUaW1lcyx2aXNpYmxlS2V5cyxrZXlzKX1lbHNle291dHB1dD1rZXlzLm1hcChmdW5jdGlvbihrZXkpe3JldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsdmFsdWUscmVjdXJzZVRpbWVzLHZpc2libGVLZXlzLGtleSxhcnJheSl9KX1jdHguc2Vlbi5wb3AoKTtyZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LGJhc2UsYnJhY2VzKX1mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LHZhbHVlKXtpZihpc1VuZGVmaW5lZCh2YWx1ZSkpcmV0dXJuIGN0eC5zdHlsaXplKCJ1bmRlZmluZWQiLCJ1bmRlZmluZWQiKTtpZihpc1N0cmluZyh2YWx1ZSkpe3ZhciBzaW1wbGU9IiciK0pTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eInwiJC9nLCIiKS5yZXBsYWNlKC8nL2csIlxcJyIpLnJlcGxhY2UoL1xcIi9nLCciJykrIiciO3JldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsInN0cmluZyIpfWlmKGlzTnVtYmVyKHZhbHVlKSlyZXR1cm4gY3R4LnN0eWxpemUoIiIrdmFsdWUsIm51bWJlciIpO2lmKGlzQm9vbGVhbih2YWx1ZSkpcmV0dXJuIGN0eC5zdHlsaXplKCIiK3ZhbHVlLCJib29sZWFuIik7aWYoaXNOdWxsKHZhbHVlKSlyZXR1cm4gY3R4LnN0eWxpemUoIm51bGwiLCJudWxsIil9ZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpe3JldHVybiJbIitFcnJvci5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkrIl0ifWZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCx2YWx1ZSxyZWN1cnNlVGltZXMsdmlzaWJsZUtleXMsa2V5cyl7dmFyIG91dHB1dD1bXTtmb3IodmFyIGk9MCxsPXZhbHVlLmxlbmd0aDtpPGw7KytpKXtpZihoYXNPd25Qcm9wZXJ0eSh2YWx1ZSxTdHJpbmcoaSkpKXtvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsdmFsdWUscmVjdXJzZVRpbWVzLHZpc2libGVLZXlzLFN0cmluZyhpKSx0cnVlKSl9ZWxzZXtvdXRwdXQucHVzaCgiIil9fWtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpe2lmKCFrZXkubWF0Y2goL15cZCskLykpe291dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCx2YWx1ZSxyZWN1cnNlVGltZXMsdmlzaWJsZUtleXMsa2V5LHRydWUpKX19KTtyZXR1cm4gb3V0cHV0fWZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCx2YWx1ZSxyZWN1cnNlVGltZXMsdmlzaWJsZUtleXMsa2V5LGFycmF5KXt2YXIgbmFtZSxzdHIsZGVzYztkZXNjPU9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsa2V5KXx8e3ZhbHVlOnZhbHVlW2tleV19O2lmKGRlc2MuZ2V0KXtpZihkZXNjLnNldCl7c3RyPWN0eC5zdHlsaXplKCJbR2V0dGVyL1NldHRlcl0iLCJzcGVjaWFsIil9ZWxzZXtzdHI9Y3R4LnN0eWxpemUoIltHZXR0ZXJdIiwic3BlY2lhbCIpfX1lbHNle2lmKGRlc2Muc2V0KXtzdHI9Y3R4LnN0eWxpemUoIltTZXR0ZXJdIiwic3BlY2lhbCIpfX1pZighaGFzT3duUHJvcGVydHkodmlzaWJsZUtleXMsa2V5KSl7bmFtZT0iWyIra2V5KyJdIn1pZighc3RyKXtpZihjdHguc2Vlbi5pbmRleE9mKGRlc2MudmFsdWUpPDApe2lmKGlzTnVsbChyZWN1cnNlVGltZXMpKXtzdHI9Zm9ybWF0VmFsdWUoY3R4LGRlc2MudmFsdWUsbnVsbCl9ZWxzZXtzdHI9Zm9ybWF0VmFsdWUoY3R4LGRlc2MudmFsdWUscmVjdXJzZVRpbWVzLTEpfWlmKHN0ci5pbmRleE9mKCJcbiIpPi0xKXtpZihhcnJheSl7c3RyPXN0ci5zcGxpdCgiXG4iKS5tYXAoZnVuY3Rpb24obGluZSl7cmV0dXJuIiAgIitsaW5lfSkuam9pbigiXG4iKS5zdWJzdHIoMil9ZWxzZXtzdHI9IlxuIitzdHIuc3BsaXQoIlxuIikubWFwKGZ1bmN0aW9uKGxpbmUpe3JldHVybiIgICAiK2xpbmV9KS5qb2luKCJcbiIpfX19ZWxzZXtzdHI9Y3R4LnN0eWxpemUoIltDaXJjdWxhcl0iLCJzcGVjaWFsIil9fWlmKGlzVW5kZWZpbmVkKG5hbWUpKXtpZihhcnJheSYma2V5Lm1hdGNoKC9eXGQrJC8pKXtyZXR1cm4gc3RyfW5hbWU9SlNPTi5zdHJpbmdpZnkoIiIra2V5KTtpZihuYW1lLm1hdGNoKC9eIihbYS16QS1aX11bYS16QS1aXzAtOV0qKSIkLykpe25hbWU9bmFtZS5zdWJzdHIoMSxuYW1lLmxlbmd0aC0yKTtuYW1lPWN0eC5zdHlsaXplKG5hbWUsIm5hbWUiKX1lbHNle25hbWU9bmFtZS5yZXBsYWNlKC8nL2csIlxcJyIpLnJlcGxhY2UoL1xcIi9nLCciJykucmVwbGFjZSgvKF4ifCIkKS9nLCInIik7bmFtZT1jdHguc3R5bGl6ZShuYW1lLCJzdHJpbmciKX19cmV0dXJuIG5hbWUrIjogIitzdHJ9ZnVuY3Rpb24gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LGJhc2UsYnJhY2VzKXt2YXIgbnVtTGluZXNFc3Q9MDt2YXIgbGVuZ3RoPW91dHB1dC5yZWR1Y2UoZnVuY3Rpb24ocHJldixjdXIpe251bUxpbmVzRXN0Kys7aWYoY3VyLmluZGV4T2YoIlxuIik+PTApbnVtTGluZXNFc3QrKztyZXR1cm4gcHJlditjdXIucmVwbGFjZSgvXHUwMDFiXFtcZFxkP20vZywiIikubGVuZ3RoKzF9LDApO2lmKGxlbmd0aD42MCl7cmV0dXJuIGJyYWNlc1swXSsoYmFzZT09PSIiPyIiOmJhc2UrIlxuICIpKyIgIitvdXRwdXQuam9pbigiLFxuICAiKSsiICIrYnJhY2VzWzFdfXJldHVybiBicmFjZXNbMF0rYmFzZSsiICIrb3V0cHV0LmpvaW4oIiwgIikrIiAiK2JyYWNlc1sxXX1mdW5jdGlvbiBpc0FycmF5KGFyKXtyZXR1cm4gQXJyYXkuaXNBcnJheShhcil9ZXhwb3J0cy5pc0FycmF5PWlzQXJyYXk7ZnVuY3Rpb24gaXNCb29sZWFuKGFyZyl7cmV0dXJuIHR5cGVvZiBhcmc9PT0iYm9vbGVhbiJ9ZXhwb3J0cy5pc0Jvb2xlYW49aXNCb29sZWFuO2Z1bmN0aW9uIGlzTnVsbChhcmcpe3JldHVybiBhcmc9PT1udWxsfWV4cG9ydHMuaXNOdWxsPWlzTnVsbDtmdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpe3JldHVybiBhcmc9PW51bGx9ZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZD1pc051bGxPclVuZGVmaW5lZDtmdW5jdGlvbiBpc051bWJlcihhcmcpe3JldHVybiB0eXBlb2YgYXJnPT09Im51bWJlciJ9ZXhwb3J0cy5pc051bWJlcj1pc051bWJlcjtmdW5jdGlvbiBpc1N0cmluZyhhcmcpe3JldHVybiB0eXBlb2YgYXJnPT09InN0cmluZyJ9ZXhwb3J0cy5pc1N0cmluZz1pc1N0cmluZztmdW5jdGlvbiBpc1N5bWJvbChhcmcpe3JldHVybiB0eXBlb2YgYXJnPT09InN5bWJvbCJ9ZXhwb3J0cy5pc1N5bWJvbD1pc1N5bWJvbDtmdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpe3JldHVybiBhcmc9PT12b2lkIDB9ZXhwb3J0cy5pc1VuZGVmaW5lZD1pc1VuZGVmaW5lZDtmdW5jdGlvbiBpc1JlZ0V4cChyZSl7cmV0dXJuIGlzT2JqZWN0KHJlKSYmb2JqZWN0VG9TdHJpbmcocmUpPT09IltvYmplY3QgUmVnRXhwXSJ9ZXhwb3J0cy5pc1JlZ0V4cD1pc1JlZ0V4cDtmdW5jdGlvbiBpc09iamVjdChhcmcpe3JldHVybiB0eXBlb2YgYXJnPT09Im9iamVjdCImJmFyZyE9PW51bGx9ZXhwb3J0cy5pc09iamVjdD1pc09iamVjdDtmdW5jdGlvbiBpc0RhdGUoZCl7cmV0dXJuIGlzT2JqZWN0KGQpJiZvYmplY3RUb1N0cmluZyhkKT09PSJbb2JqZWN0IERhdGVdIn1leHBvcnRzLmlzRGF0ZT1pc0RhdGU7ZnVuY3Rpb24gaXNFcnJvcihlKXtyZXR1cm4gaXNPYmplY3QoZSkmJihvYmplY3RUb1N0cmluZyhlKT09PSJbb2JqZWN0IEVycm9yXSJ8fGUgaW5zdGFuY2VvZiBFcnJvcil9ZXhwb3J0cy5pc0Vycm9yPWlzRXJyb3I7ZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpe3JldHVybiB0eXBlb2YgYXJnPT09ImZ1bmN0aW9uIn1leHBvcnRzLmlzRnVuY3Rpb249aXNGdW5jdGlvbjtmdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpe3JldHVybiBhcmc9PT1udWxsfHx0eXBlb2YgYXJnPT09ImJvb2xlYW4ifHx0eXBlb2YgYXJnPT09Im51bWJlciJ8fHR5cGVvZiBhcmc9PT0ic3RyaW5nInx8dHlwZW9mIGFyZz09PSJzeW1ib2wifHx0eXBlb2YgYXJnPT09InVuZGVmaW5lZCJ9ZXhwb3J0cy5pc1ByaW1pdGl2ZT1pc1ByaW1pdGl2ZTtleHBvcnRzLmlzQnVmZmVyPXJlcXVpcmUoIi4vc3VwcG9ydC9pc0J1ZmZlciIpO2Z1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pe3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyl9ZnVuY3Rpb24gcGFkKG4pe3JldHVybiBuPDEwPyIwIituLnRvU3RyaW5nKDEwKTpuLnRvU3RyaW5nKDEwKX12YXIgbW9udGhzPVsiSmFuIiwiRmViIiwiTWFyIiwiQXByIiwiTWF5IiwiSnVuIiwiSnVsIiwiQXVnIiwiU2VwIiwiT2N0IiwiTm92IiwiRGVjIl07ZnVuY3Rpb24gdGltZXN0YW1wKCl7dmFyIGQ9bmV3IERhdGU7dmFyIHRpbWU9W3BhZChkLmdldEhvdXJzKCkpLHBhZChkLmdldE1pbnV0ZXMoKSkscGFkKGQuZ2V0U2Vjb25kcygpKV0uam9pbigiOiIpO3JldHVybltkLmdldERhdGUoKSxtb250aHNbZC5nZXRNb250aCgpXSx0aW1lXS5qb2luKCIgIil9ZXhwb3J0cy5sb2c9ZnVuY3Rpb24oKXtjb25zb2xlLmxvZygiJXMgLSAlcyIsdGltZXN0YW1wKCksZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpKX07ZXhwb3J0cy5pbmhlcml0cz1yZXF1aXJlKCJpbmhlcml0cyIpO2V4cG9ydHMuX2V4dGVuZD1mdW5jdGlvbihvcmlnaW4sYWRkKXtpZighYWRkfHwhaXNPYmplY3QoYWRkKSlyZXR1cm4gb3JpZ2luO3ZhciBrZXlzPU9iamVjdC5rZXlzKGFkZCk7dmFyIGk9a2V5cy5sZW5ndGg7d2hpbGUoaS0tKXtvcmlnaW5ba2V5c1tpXV09YWRkW2tleXNbaV1dfXJldHVybiBvcmlnaW59O2Z1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaixwcm9wKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaixwcm9wKX19KS5jYWxsKHRoaXMscmVxdWlyZSgiX3Byb2Nlc3MiKSx0eXBlb2YgZ2xvYmFsIT09InVuZGVmaW5lZCI/Z2xvYmFsOnR5cGVvZiBzZWxmIT09InVuZGVmaW5lZCI/c2VsZjp0eXBlb2Ygd2luZG93IT09InVuZGVmaW5lZCI/d2luZG93Ont9KX0seyIuL3N1cHBvcnQvaXNCdWZmZXIiOjIyLF9wcm9jZXNzOjY2LGluaGVyaXRzOjIxfV0sMjQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyJ1c2Ugc3RyaWN0IjtleHBvcnRzLmJ5dGVMZW5ndGg9Ynl0ZUxlbmd0aDtleHBvcnRzLnRvQnl0ZUFycmF5PXRvQnl0ZUFycmF5O2V4cG9ydHMuZnJvbUJ5dGVBcnJheT1mcm9tQnl0ZUFycmF5O3ZhciBsb29rdXA9W107dmFyIHJldkxvb2t1cD1bXTt2YXIgQXJyPXR5cGVvZiBVaW50OEFycmF5IT09InVuZGVmaW5lZCI/VWludDhBcnJheTpBcnJheTt2YXIgY29kZT0iQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyI7Zm9yKHZhciBpPTAsbGVuPWNvZGUubGVuZ3RoO2k8bGVuOysraSl7bG9va3VwW2ldPWNvZGVbaV07cmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV09aX1yZXZMb29rdXBbIi0iLmNoYXJDb2RlQXQoMCldPTYyO3Jldkxvb2t1cFsiXyIuY2hhckNvZGVBdCgwKV09NjM7ZnVuY3Rpb24gZ2V0TGVucyhiNjQpe3ZhciBsZW49YjY0Lmxlbmd0aDtpZihsZW4lND4wKXt0aHJvdyBuZXcgRXJyb3IoIkludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQiKX12YXIgdmFsaWRMZW49YjY0LmluZGV4T2YoIj0iKTtpZih2YWxpZExlbj09PS0xKXZhbGlkTGVuPWxlbjt2YXIgcGxhY2VIb2xkZXJzTGVuPXZhbGlkTGVuPT09bGVuPzA6NC12YWxpZExlbiU0O3JldHVyblt2YWxpZExlbixwbGFjZUhvbGRlcnNMZW5dfWZ1bmN0aW9uIGJ5dGVMZW5ndGgoYjY0KXt2YXIgbGVucz1nZXRMZW5zKGI2NCk7dmFyIHZhbGlkTGVuPWxlbnNbMF07dmFyIHBsYWNlSG9sZGVyc0xlbj1sZW5zWzFdO3JldHVybih2YWxpZExlbitwbGFjZUhvbGRlcnNMZW4pKjMvNC1wbGFjZUhvbGRlcnNMZW59ZnVuY3Rpb24gX2J5dGVMZW5ndGgoYjY0LHZhbGlkTGVuLHBsYWNlSG9sZGVyc0xlbil7cmV0dXJuKHZhbGlkTGVuK3BsYWNlSG9sZGVyc0xlbikqMy80LXBsYWNlSG9sZGVyc0xlbn1mdW5jdGlvbiB0b0J5dGVBcnJheShiNjQpe3ZhciB0bXA7dmFyIGxlbnM9Z2V0TGVucyhiNjQpO3ZhciB2YWxpZExlbj1sZW5zWzBdO3ZhciBwbGFjZUhvbGRlcnNMZW49bGVuc1sxXTt2YXIgYXJyPW5ldyBBcnIoX2J5dGVMZW5ndGgoYjY0LHZhbGlkTGVuLHBsYWNlSG9sZGVyc0xlbikpO3ZhciBjdXJCeXRlPTA7dmFyIGxlbj1wbGFjZUhvbGRlcnNMZW4+MD92YWxpZExlbi00OnZhbGlkTGVuO3ZhciBpO2ZvcihpPTA7aTxsZW47aSs9NCl7dG1wPXJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV08PDE4fHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKzEpXTw8MTJ8cmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkrMildPDw2fHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKzMpXTthcnJbY3VyQnl0ZSsrXT10bXA+PjE2JjI1NTthcnJbY3VyQnl0ZSsrXT10bXA+PjgmMjU1O2FycltjdXJCeXRlKytdPXRtcCYyNTV9aWYocGxhY2VIb2xkZXJzTGVuPT09Mil7dG1wPXJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV08PDJ8cmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkrMSldPj40O2FycltjdXJCeXRlKytdPXRtcCYyNTV9aWYocGxhY2VIb2xkZXJzTGVuPT09MSl7dG1wPXJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV08PDEwfHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKzEpXTw8NHxyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSsyKV0+PjI7YXJyW2N1ckJ5dGUrK109dG1wPj44JjI1NTthcnJbY3VyQnl0ZSsrXT10bXAmMjU1fXJldHVybiBhcnJ9ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0KG51bSl7cmV0dXJuIGxvb2t1cFtudW0+PjE4JjYzXStsb29rdXBbbnVtPj4xMiY2M10rbG9va3VwW251bT4+NiY2M10rbG9va3VwW251bSY2M119ZnVuY3Rpb24gZW5jb2RlQ2h1bmsodWludDgsc3RhcnQsZW5kKXt2YXIgdG1wO3ZhciBvdXRwdXQ9W107Zm9yKHZhciBpPXN0YXJ0O2k8ZW5kO2krPTMpe3RtcD0odWludDhbaV08PDE2JjE2NzExNjgwKSsodWludDhbaSsxXTw8OCY2NTI4MCkrKHVpbnQ4W2krMl0mMjU1KTtvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSl9cmV0dXJuIG91dHB1dC5qb2luKCIiKX1mdW5jdGlvbiBmcm9tQnl0ZUFycmF5KHVpbnQ4KXt2YXIgdG1wO3ZhciBsZW49dWludDgubGVuZ3RoO3ZhciBleHRyYUJ5dGVzPWxlbiUzO3ZhciBwYXJ0cz1bXTt2YXIgbWF4Q2h1bmtMZW5ndGg9MTYzODM7Zm9yKHZhciBpPTAsbGVuMj1sZW4tZXh0cmFCeXRlcztpPGxlbjI7aSs9bWF4Q2h1bmtMZW5ndGgpe3BhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsaSxpK21heENodW5rTGVuZ3RoPmxlbjI/bGVuMjppK21heENodW5rTGVuZ3RoKSl9aWYoZXh0cmFCeXRlcz09PTEpe3RtcD11aW50OFtsZW4tMV07cGFydHMucHVzaChsb29rdXBbdG1wPj4yXStsb29rdXBbdG1wPDw0JjYzXSsiPT0iKX1lbHNlIGlmKGV4dHJhQnl0ZXM9PT0yKXt0bXA9KHVpbnQ4W2xlbi0yXTw8OCkrdWludDhbbGVuLTFdO3BhcnRzLnB1c2gobG9va3VwW3RtcD4+MTBdK2xvb2t1cFt0bXA+PjQmNjNdK2xvb2t1cFt0bXA8PDImNjNdKyI9Iil9cmV0dXJuIHBhcnRzLmpvaW4oIiIpfX0se31dLDI1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXt2YXIgYmlnSW50PWZ1bmN0aW9uKHVuZGVmaW5lZCl7InVzZSBzdHJpY3QiO3ZhciBCQVNFPTFlNyxMT0dfQkFTRT03LE1BWF9JTlQ9OTAwNzE5OTI1NDc0MDk5MixNQVhfSU5UX0FSUj1zbWFsbFRvQXJyYXkoTUFYX0lOVCksREVGQVVMVF9BTFBIQUJFVD0iMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Ijt2YXIgc3VwcG9ydHNOYXRpdmVCaWdJbnQ9dHlwZW9mIEJpZ0ludD09PSJmdW5jdGlvbiI7ZnVuY3Rpb24gSW50ZWdlcih2LHJhZGl4LGFscGhhYmV0LGNhc2VTZW5zaXRpdmUpe2lmKHR5cGVvZiB2PT09InVuZGVmaW5lZCIpcmV0dXJuIEludGVnZXJbMF07aWYodHlwZW9mIHJhZGl4IT09InVuZGVmaW5lZCIpcmV0dXJuK3JhZGl4PT09MTAmJiFhbHBoYWJldD9wYXJzZVZhbHVlKHYpOnBhcnNlQmFzZSh2LHJhZGl4LGFscGhhYmV0LGNhc2VTZW5zaXRpdmUpO3JldHVybiBwYXJzZVZhbHVlKHYpfWZ1bmN0aW9uIEJpZ0ludGVnZXIodmFsdWUsc2lnbil7dGhpcy52YWx1ZT12YWx1ZTt0aGlzLnNpZ249c2lnbjt0aGlzLmlzU21hbGw9ZmFsc2V9QmlnSW50ZWdlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gU21hbGxJbnRlZ2VyKHZhbHVlKXt0aGlzLnZhbHVlPXZhbHVlO3RoaXMuc2lnbj12YWx1ZTwwO3RoaXMuaXNTbWFsbD10cnVlfVNtYWxsSW50ZWdlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gTmF0aXZlQmlnSW50KHZhbHVlKXt0aGlzLnZhbHVlPXZhbHVlfU5hdGl2ZUJpZ0ludC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShJbnRlZ2VyLnByb3RvdHlwZSk7ZnVuY3Rpb24gaXNQcmVjaXNlKG4pe3JldHVybi1NQVhfSU5UPG4mJm48TUFYX0lOVH1mdW5jdGlvbiBzbWFsbFRvQXJyYXkobil7aWYobjwxZTcpcmV0dXJuW25dO2lmKG48MWUxNClyZXR1cm5bbiUxZTcsTWF0aC5mbG9vcihuLzFlNyldO3JldHVybltuJTFlNyxNYXRoLmZsb29yKG4vMWU3KSUxZTcsTWF0aC5mbG9vcihuLzFlMTQpXX1mdW5jdGlvbiBhcnJheVRvU21hbGwoYXJyKXt0cmltKGFycik7dmFyIGxlbmd0aD1hcnIubGVuZ3RoO2lmKGxlbmd0aDw0JiZjb21wYXJlQWJzKGFycixNQVhfSU5UX0FSUik8MCl7c3dpdGNoKGxlbmd0aCl7Y2FzZSAwOnJldHVybiAwO2Nhc2UgMTpyZXR1cm4gYXJyWzBdO2Nhc2UgMjpyZXR1cm4gYXJyWzBdK2FyclsxXSpCQVNFO2RlZmF1bHQ6cmV0dXJuIGFyclswXSsoYXJyWzFdK2FyclsyXSpCQVNFKSpCQVNFfX1yZXR1cm4gYXJyfWZ1bmN0aW9uIHRyaW0odil7dmFyIGk9di5sZW5ndGg7d2hpbGUodlstLWldPT09MCk7di5sZW5ndGg9aSsxfWZ1bmN0aW9uIGNyZWF0ZUFycmF5KGxlbmd0aCl7dmFyIHg9bmV3IEFycmF5KGxlbmd0aCk7dmFyIGk9LTE7d2hpbGUoKytpPGxlbmd0aCl7eFtpXT0wfXJldHVybiB4fWZ1bmN0aW9uIHRydW5jYXRlKG4pe2lmKG4+MClyZXR1cm4gTWF0aC5mbG9vcihuKTtyZXR1cm4gTWF0aC5jZWlsKG4pfWZ1bmN0aW9uIGFkZChhLGIpe3ZhciBsX2E9YS5sZW5ndGgsbF9iPWIubGVuZ3RoLHI9bmV3IEFycmF5KGxfYSksY2Fycnk9MCxiYXNlPUJBU0Usc3VtLGk7Zm9yKGk9MDtpPGxfYjtpKyspe3N1bT1hW2ldK2JbaV0rY2Fycnk7Y2Fycnk9c3VtPj1iYXNlPzE6MDtyW2ldPXN1bS1jYXJyeSpiYXNlfXdoaWxlKGk8bF9hKXtzdW09YVtpXStjYXJyeTtjYXJyeT1zdW09PT1iYXNlPzE6MDtyW2krK109c3VtLWNhcnJ5KmJhc2V9aWYoY2Fycnk+MClyLnB1c2goY2FycnkpO3JldHVybiByfWZ1bmN0aW9uIGFkZEFueShhLGIpe2lmKGEubGVuZ3RoPj1iLmxlbmd0aClyZXR1cm4gYWRkKGEsYik7cmV0dXJuIGFkZChiLGEpfWZ1bmN0aW9uIGFkZFNtYWxsKGEsY2Fycnkpe3ZhciBsPWEubGVuZ3RoLHI9bmV3IEFycmF5KGwpLGJhc2U9QkFTRSxzdW0saTtmb3IoaT0wO2k8bDtpKyspe3N1bT1hW2ldLWJhc2UrY2Fycnk7Y2Fycnk9TWF0aC5mbG9vcihzdW0vYmFzZSk7cltpXT1zdW0tY2FycnkqYmFzZTtjYXJyeSs9MX13aGlsZShjYXJyeT4wKXtyW2krK109Y2FycnklYmFzZTtjYXJyeT1NYXRoLmZsb29yKGNhcnJ5L2Jhc2UpfXJldHVybiByfUJpZ0ludGVnZXIucHJvdG90eXBlLmFkZD1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpO2lmKHRoaXMuc2lnbiE9PW4uc2lnbil7cmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSl9dmFyIGE9dGhpcy52YWx1ZSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkU21hbGwoYSxNYXRoLmFicyhiKSksdGhpcy5zaWduKX1yZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkQW55KGEsYiksdGhpcy5zaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUucGx1cz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTt2YXIgYT10aGlzLnZhbHVlO2lmKGE8MCE9PW4uc2lnbil7cmV0dXJuIHRoaXMuc3VidHJhY3Qobi5uZWdhdGUoKSl9dmFyIGI9bi52YWx1ZTtpZihuLmlzU21hbGwpe2lmKGlzUHJlY2lzZShhK2IpKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKGErYik7Yj1zbWFsbFRvQXJyYXkoTWF0aC5hYnMoYikpfXJldHVybiBuZXcgQmlnSW50ZWdlcihhZGRTbWFsbChiLE1hdGguYWJzKGEpKSxhPDApfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnBsdXM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5hZGQ7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5hZGQ9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZStwYXJzZVZhbHVlKHYpLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5wbHVzPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuYWRkO2Z1bmN0aW9uIHN1YnRyYWN0KGEsYil7dmFyIGFfbD1hLmxlbmd0aCxiX2w9Yi5sZW5ndGgscj1uZXcgQXJyYXkoYV9sKSxib3Jyb3c9MCxiYXNlPUJBU0UsaSxkaWZmZXJlbmNlO2ZvcihpPTA7aTxiX2w7aSsrKXtkaWZmZXJlbmNlPWFbaV0tYm9ycm93LWJbaV07aWYoZGlmZmVyZW5jZTwwKXtkaWZmZXJlbmNlKz1iYXNlO2JvcnJvdz0xfWVsc2UgYm9ycm93PTA7cltpXT1kaWZmZXJlbmNlfWZvcihpPWJfbDtpPGFfbDtpKyspe2RpZmZlcmVuY2U9YVtpXS1ib3Jyb3c7aWYoZGlmZmVyZW5jZTwwKWRpZmZlcmVuY2UrPWJhc2U7ZWxzZXtyW2krK109ZGlmZmVyZW5jZTticmVha31yW2ldPWRpZmZlcmVuY2V9Zm9yKDtpPGFfbDtpKyspe3JbaV09YVtpXX10cmltKHIpO3JldHVybiByfWZ1bmN0aW9uIHN1YnRyYWN0QW55KGEsYixzaWduKXt2YXIgdmFsdWU7aWYoY29tcGFyZUFicyhhLGIpPj0wKXt2YWx1ZT1zdWJ0cmFjdChhLGIpfWVsc2V7dmFsdWU9c3VidHJhY3QoYixhKTtzaWduPSFzaWdufXZhbHVlPWFycmF5VG9TbWFsbCh2YWx1ZSk7aWYodHlwZW9mIHZhbHVlPT09Im51bWJlciIpe2lmKHNpZ24pdmFsdWU9LXZhbHVlO3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKHZhbHVlKX1yZXR1cm4gbmV3IEJpZ0ludGVnZXIodmFsdWUsc2lnbil9ZnVuY3Rpb24gc3VidHJhY3RTbWFsbChhLGIsc2lnbil7dmFyIGw9YS5sZW5ndGgscj1uZXcgQXJyYXkobCksY2Fycnk9LWIsYmFzZT1CQVNFLGksZGlmZmVyZW5jZTtmb3IoaT0wO2k8bDtpKyspe2RpZmZlcmVuY2U9YVtpXStjYXJyeTtjYXJyeT1NYXRoLmZsb29yKGRpZmZlcmVuY2UvYmFzZSk7ZGlmZmVyZW5jZSU9YmFzZTtyW2ldPWRpZmZlcmVuY2U8MD9kaWZmZXJlbmNlK2Jhc2U6ZGlmZmVyZW5jZX1yPWFycmF5VG9TbWFsbChyKTtpZih0eXBlb2Ygcj09PSJudW1iZXIiKXtpZihzaWduKXI9LXI7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIocil9cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHIsc2lnbil9QmlnSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3Q9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KTtpZih0aGlzLnNpZ24hPT1uLnNpZ24pe3JldHVybiB0aGlzLmFkZChuLm5lZ2F0ZSgpKX12YXIgYT10aGlzLnZhbHVlLGI9bi52YWx1ZTtpZihuLmlzU21hbGwpcmV0dXJuIHN1YnRyYWN0U21hbGwoYSxNYXRoLmFicyhiKSx0aGlzLnNpZ24pO3JldHVybiBzdWJ0cmFjdEFueShhLGIsdGhpcy5zaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUubWludXM9QmlnSW50ZWdlci5wcm90b3R5cGUuc3VidHJhY3Q7U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zdWJ0cmFjdD1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpO3ZhciBhPXRoaXMudmFsdWU7aWYoYTwwIT09bi5zaWduKXtyZXR1cm4gdGhpcy5hZGQobi5uZWdhdGUoKSl9dmFyIGI9bi52YWx1ZTtpZihuLmlzU21hbGwpe3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKGEtYil9cmV0dXJuIHN1YnRyYWN0U21hbGwoYixNYXRoLmFicyhhKSxhPj0wKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5taW51cz1TbWFsbEludGVnZXIucHJvdG90eXBlLnN1YnRyYWN0O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuc3VidHJhY3Q9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZS1wYXJzZVZhbHVlKHYpLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5taW51cz1OYXRpdmVCaWdJbnQucHJvdG90eXBlLnN1YnRyYWN0O0JpZ0ludGVnZXIucHJvdG90eXBlLm5lZ2F0ZT1mdW5jdGlvbigpe3JldHVybiBuZXcgQmlnSW50ZWdlcih0aGlzLnZhbHVlLCF0aGlzLnNpZ24pfTtTbWFsbEludGVnZXIucHJvdG90eXBlLm5lZ2F0ZT1mdW5jdGlvbigpe3ZhciBzaWduPXRoaXMuc2lnbjt2YXIgc21hbGw9bmV3IFNtYWxsSW50ZWdlcigtdGhpcy52YWx1ZSk7c21hbGwuc2lnbj0hc2lnbjtyZXR1cm4gc21hbGx9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubmVnYXRlPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQoLXRoaXMudmFsdWUpfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5hYnM9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIodGhpcy52YWx1ZSxmYWxzZSl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuYWJzPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBTbWFsbEludGVnZXIoTWF0aC5hYnModGhpcy52YWx1ZSkpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmFicz1mdW5jdGlvbigpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWU+PTA/dGhpcy52YWx1ZTotdGhpcy52YWx1ZSl9O2Z1bmN0aW9uIG11bHRpcGx5TG9uZyhhLGIpe3ZhciBhX2w9YS5sZW5ndGgsYl9sPWIubGVuZ3RoLGw9YV9sK2JfbCxyPWNyZWF0ZUFycmF5KGwpLGJhc2U9QkFTRSxwcm9kdWN0LGNhcnJ5LGksYV9pLGJfajtmb3IoaT0wO2k8YV9sOysraSl7YV9pPWFbaV07Zm9yKHZhciBqPTA7ajxiX2w7KytqKXtiX2o9YltqXTtwcm9kdWN0PWFfaSpiX2orcltpK2pdO2NhcnJ5PU1hdGguZmxvb3IocHJvZHVjdC9iYXNlKTtyW2kral09cHJvZHVjdC1jYXJyeSpiYXNlO3JbaStqKzFdKz1jYXJyeX19dHJpbShyKTtyZXR1cm4gcn1mdW5jdGlvbiBtdWx0aXBseVNtYWxsKGEsYil7dmFyIGw9YS5sZW5ndGgscj1uZXcgQXJyYXkobCksYmFzZT1CQVNFLGNhcnJ5PTAscHJvZHVjdCxpO2ZvcihpPTA7aTxsO2krKyl7cHJvZHVjdD1hW2ldKmIrY2Fycnk7Y2Fycnk9TWF0aC5mbG9vcihwcm9kdWN0L2Jhc2UpO3JbaV09cHJvZHVjdC1jYXJyeSpiYXNlfXdoaWxlKGNhcnJ5PjApe3JbaSsrXT1jYXJyeSViYXNlO2NhcnJ5PU1hdGguZmxvb3IoY2FycnkvYmFzZSl9cmV0dXJuIHJ9ZnVuY3Rpb24gc2hpZnRMZWZ0KHgsbil7dmFyIHI9W107d2hpbGUobi0tID4wKXIucHVzaCgwKTtyZXR1cm4gci5jb25jYXQoeCl9ZnVuY3Rpb24gbXVsdGlwbHlLYXJhdHN1YmEoeCx5KXt2YXIgbj1NYXRoLm1heCh4Lmxlbmd0aCx5Lmxlbmd0aCk7aWYobjw9MzApcmV0dXJuIG11bHRpcGx5TG9uZyh4LHkpO249TWF0aC5jZWlsKG4vMik7dmFyIGI9eC5zbGljZShuKSxhPXguc2xpY2UoMCxuKSxkPXkuc2xpY2UobiksYz15LnNsaWNlKDAsbik7dmFyIGFjPW11bHRpcGx5S2FyYXRzdWJhKGEsYyksYmQ9bXVsdGlwbHlLYXJhdHN1YmEoYixkKSxhYmNkPW11bHRpcGx5S2FyYXRzdWJhKGFkZEFueShhLGIpLGFkZEFueShjLGQpKTt2YXIgcHJvZHVjdD1hZGRBbnkoYWRkQW55KGFjLHNoaWZ0TGVmdChzdWJ0cmFjdChzdWJ0cmFjdChhYmNkLGFjKSxiZCksbikpLHNoaWZ0TGVmdChiZCwyKm4pKTt0cmltKHByb2R1Y3QpO3JldHVybiBwcm9kdWN0fWZ1bmN0aW9uIHVzZUthcmF0c3ViYShsMSxsMil7cmV0dXJuLS4wMTIqbDEtLjAxMipsMisxNWUtNipsMSpsMj4wfUJpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5PWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodiksYT10aGlzLnZhbHVlLGI9bi52YWx1ZSxzaWduPXRoaXMuc2lnbiE9PW4uc2lnbixhYnM7aWYobi5pc1NtYWxsKXtpZihiPT09MClyZXR1cm4gSW50ZWdlclswXTtpZihiPT09MSlyZXR1cm4gdGhpcztpZihiPT09LTEpcmV0dXJuIHRoaXMubmVnYXRlKCk7YWJzPU1hdGguYWJzKGIpO2lmKGFiczxCQVNFKXtyZXR1cm4gbmV3IEJpZ0ludGVnZXIobXVsdGlwbHlTbWFsbChhLGFicyksc2lnbil9Yj1zbWFsbFRvQXJyYXkoYWJzKX1pZih1c2VLYXJhdHN1YmEoYS5sZW5ndGgsYi5sZW5ndGgpKXJldHVybiBuZXcgQmlnSW50ZWdlcihtdWx0aXBseUthcmF0c3ViYShhLGIpLHNpZ24pO3JldHVybiBuZXcgQmlnSW50ZWdlcihtdWx0aXBseUxvbmcoYSxiKSxzaWduKX07QmlnSW50ZWdlci5wcm90b3R5cGUudGltZXM9QmlnSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHk7ZnVuY3Rpb24gbXVsdGlwbHlTbWFsbEFuZEFycmF5KGEsYixzaWduKXtpZihhPEJBU0Upe3JldHVybiBuZXcgQmlnSW50ZWdlcihtdWx0aXBseVNtYWxsKGIsYSksc2lnbil9cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKG11bHRpcGx5TG9uZyhiLHNtYWxsVG9BcnJheShhKSksc2lnbil9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5fbXVsdGlwbHlCeVNtYWxsPWZ1bmN0aW9uKGEpe2lmKGlzUHJlY2lzZShhLnZhbHVlKnRoaXMudmFsdWUpKXtyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcihhLnZhbHVlKnRoaXMudmFsdWUpfXJldHVybiBtdWx0aXBseVNtYWxsQW5kQXJyYXkoTWF0aC5hYnMoYS52YWx1ZSksc21hbGxUb0FycmF5KE1hdGguYWJzKHRoaXMudmFsdWUpKSx0aGlzLnNpZ24hPT1hLnNpZ24pfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5fbXVsdGlwbHlCeVNtYWxsPWZ1bmN0aW9uKGEpe2lmKGEudmFsdWU9PT0wKXJldHVybiBJbnRlZ2VyWzBdO2lmKGEudmFsdWU9PT0xKXJldHVybiB0aGlzO2lmKGEudmFsdWU9PT0tMSlyZXR1cm4gdGhpcy5uZWdhdGUoKTtyZXR1cm4gbXVsdGlwbHlTbWFsbEFuZEFycmF5KE1hdGguYWJzKGEudmFsdWUpLHRoaXMudmFsdWUsdGhpcy5zaWduIT09YS5zaWduKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseT1mdW5jdGlvbih2KXtyZXR1cm4gcGFyc2VWYWx1ZSh2KS5fbXVsdGlwbHlCeVNtYWxsKHRoaXMpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnRpbWVzPVNtYWxsSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHk7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5tdWx0aXBseT1mdW5jdGlvbih2KXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlKnBhcnNlVmFsdWUodikudmFsdWUpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnRpbWVzPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubXVsdGlwbHk7ZnVuY3Rpb24gc3F1YXJlKGEpe3ZhciBsPWEubGVuZ3RoLHI9Y3JlYXRlQXJyYXkobCtsKSxiYXNlPUJBU0UscHJvZHVjdCxjYXJyeSxpLGFfaSxhX2o7Zm9yKGk9MDtpPGw7aSsrKXthX2k9YVtpXTtjYXJyeT0wLWFfaSphX2k7Zm9yKHZhciBqPWk7ajxsO2orKyl7YV9qPWFbal07cHJvZHVjdD0yKihhX2kqYV9qKStyW2kral0rY2Fycnk7Y2Fycnk9TWF0aC5mbG9vcihwcm9kdWN0L2Jhc2UpO3JbaStqXT1wcm9kdWN0LWNhcnJ5KmJhc2V9cltpK2xdPWNhcnJ5fXRyaW0ocik7cmV0dXJuIHJ9QmlnSW50ZWdlci5wcm90b3R5cGUuc3F1YXJlPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHNxdWFyZSh0aGlzLnZhbHVlKSxmYWxzZSl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuc3F1YXJlPWZ1bmN0aW9uKCl7dmFyIHZhbHVlPXRoaXMudmFsdWUqdGhpcy52YWx1ZTtpZihpc1ByZWNpc2UodmFsdWUpKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHZhbHVlKTtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoc3F1YXJlKHNtYWxsVG9BcnJheShNYXRoLmFicyh0aGlzLnZhbHVlKSkpLGZhbHNlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zcXVhcmU9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSp0aGlzLnZhbHVlKX07ZnVuY3Rpb24gZGl2TW9kMShhLGIpe3ZhciBhX2w9YS5sZW5ndGgsYl9sPWIubGVuZ3RoLGJhc2U9QkFTRSxyZXN1bHQ9Y3JlYXRlQXJyYXkoYi5sZW5ndGgpLGRpdmlzb3JNb3N0U2lnbmlmaWNhbnREaWdpdD1iW2JfbC0xXSxsYW1iZGE9TWF0aC5jZWlsKGJhc2UvKDIqZGl2aXNvck1vc3RTaWduaWZpY2FudERpZ2l0KSkscmVtYWluZGVyPW11bHRpcGx5U21hbGwoYSxsYW1iZGEpLGRpdmlzb3I9bXVsdGlwbHlTbWFsbChiLGxhbWJkYSkscXVvdGllbnREaWdpdCxzaGlmdCxjYXJyeSxib3Jyb3csaSxsLHE7aWYocmVtYWluZGVyLmxlbmd0aDw9YV9sKXJlbWFpbmRlci5wdXNoKDApO2Rpdmlzb3IucHVzaCgwKTtkaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQ9ZGl2aXNvcltiX2wtMV07Zm9yKHNoaWZ0PWFfbC1iX2w7c2hpZnQ+PTA7c2hpZnQtLSl7cXVvdGllbnREaWdpdD1iYXNlLTE7aWYocmVtYWluZGVyW3NoaWZ0K2JfbF0hPT1kaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQpe3F1b3RpZW50RGlnaXQ9TWF0aC5mbG9vcigocmVtYWluZGVyW3NoaWZ0K2JfbF0qYmFzZStyZW1haW5kZXJbc2hpZnQrYl9sLTFdKS9kaXZpc29yTW9zdFNpZ25pZmljYW50RGlnaXQpfWNhcnJ5PTA7Ym9ycm93PTA7bD1kaXZpc29yLmxlbmd0aDtmb3IoaT0wO2k8bDtpKyspe2NhcnJ5Kz1xdW90aWVudERpZ2l0KmRpdmlzb3JbaV07cT1NYXRoLmZsb29yKGNhcnJ5L2Jhc2UpO2JvcnJvdys9cmVtYWluZGVyW3NoaWZ0K2ldLShjYXJyeS1xKmJhc2UpO2NhcnJ5PXE7aWYoYm9ycm93PDApe3JlbWFpbmRlcltzaGlmdCtpXT1ib3Jyb3crYmFzZTtib3Jyb3c9LTF9ZWxzZXtyZW1haW5kZXJbc2hpZnQraV09Ym9ycm93O2JvcnJvdz0wfX13aGlsZShib3Jyb3chPT0wKXtxdW90aWVudERpZ2l0LT0xO2NhcnJ5PTA7Zm9yKGk9MDtpPGw7aSsrKXtjYXJyeSs9cmVtYWluZGVyW3NoaWZ0K2ldLWJhc2UrZGl2aXNvcltpXTtpZihjYXJyeTwwKXtyZW1haW5kZXJbc2hpZnQraV09Y2FycnkrYmFzZTtjYXJyeT0wfWVsc2V7cmVtYWluZGVyW3NoaWZ0K2ldPWNhcnJ5O2NhcnJ5PTF9fWJvcnJvdys9Y2Fycnl9cmVzdWx0W3NoaWZ0XT1xdW90aWVudERpZ2l0fXJlbWFpbmRlcj1kaXZNb2RTbWFsbChyZW1haW5kZXIsbGFtYmRhKVswXTtyZXR1cm5bYXJyYXlUb1NtYWxsKHJlc3VsdCksYXJyYXlUb1NtYWxsKHJlbWFpbmRlcildfWZ1bmN0aW9uIGRpdk1vZDIoYSxiKXt2YXIgYV9sPWEubGVuZ3RoLGJfbD1iLmxlbmd0aCxyZXN1bHQ9W10scGFydD1bXSxiYXNlPUJBU0UsZ3Vlc3MseGxlbixoaWdoeCxoaWdoeSxjaGVjazt3aGlsZShhX2wpe3BhcnQudW5zaGlmdChhWy0tYV9sXSk7dHJpbShwYXJ0KTtpZihjb21wYXJlQWJzKHBhcnQsYik8MCl7cmVzdWx0LnB1c2goMCk7Y29udGludWV9eGxlbj1wYXJ0Lmxlbmd0aDtoaWdoeD1wYXJ0W3hsZW4tMV0qYmFzZStwYXJ0W3hsZW4tMl07aGlnaHk9YltiX2wtMV0qYmFzZStiW2JfbC0yXTtpZih4bGVuPmJfbCl7aGlnaHg9KGhpZ2h4KzEpKmJhc2V9Z3Vlc3M9TWF0aC5jZWlsKGhpZ2h4L2hpZ2h5KTtkb3tjaGVjaz1tdWx0aXBseVNtYWxsKGIsZ3Vlc3MpO2lmKGNvbXBhcmVBYnMoY2hlY2sscGFydCk8PTApYnJlYWs7Z3Vlc3MtLX13aGlsZShndWVzcyk7cmVzdWx0LnB1c2goZ3Vlc3MpO3BhcnQ9c3VidHJhY3QocGFydCxjaGVjayl9cmVzdWx0LnJldmVyc2UoKTtyZXR1cm5bYXJyYXlUb1NtYWxsKHJlc3VsdCksYXJyYXlUb1NtYWxsKHBhcnQpXX1mdW5jdGlvbiBkaXZNb2RTbWFsbCh2YWx1ZSxsYW1iZGEpe3ZhciBsZW5ndGg9dmFsdWUubGVuZ3RoLHF1b3RpZW50PWNyZWF0ZUFycmF5KGxlbmd0aCksYmFzZT1CQVNFLGkscSxyZW1haW5kZXIsZGl2aXNvcjtyZW1haW5kZXI9MDtmb3IoaT1sZW5ndGgtMTtpPj0wOy0taSl7ZGl2aXNvcj1yZW1haW5kZXIqYmFzZSt2YWx1ZVtpXTtxPXRydW5jYXRlKGRpdmlzb3IvbGFtYmRhKTtyZW1haW5kZXI9ZGl2aXNvci1xKmxhbWJkYTtxdW90aWVudFtpXT1xfDB9cmV0dXJuW3F1b3RpZW50LHJlbWFpbmRlcnwwXX1mdW5jdGlvbiBkaXZNb2RBbnkoc2VsZix2KXt2YXIgdmFsdWUsbj1wYXJzZVZhbHVlKHYpO2lmKHN1cHBvcnRzTmF0aXZlQmlnSW50KXtyZXR1cm5bbmV3IE5hdGl2ZUJpZ0ludChzZWxmLnZhbHVlL24udmFsdWUpLG5ldyBOYXRpdmVCaWdJbnQoc2VsZi52YWx1ZSVuLnZhbHVlKV19dmFyIGE9c2VsZi52YWx1ZSxiPW4udmFsdWU7dmFyIHF1b3RpZW50O2lmKGI9PT0wKXRocm93IG5ldyBFcnJvcigiQ2Fubm90IGRpdmlkZSBieSB6ZXJvIik7aWYoc2VsZi5pc1NtYWxsKXtpZihuLmlzU21hbGwpe3JldHVybltuZXcgU21hbGxJbnRlZ2VyKHRydW5jYXRlKGEvYikpLG5ldyBTbWFsbEludGVnZXIoYSViKV19cmV0dXJuW0ludGVnZXJbMF0sc2VsZl19aWYobi5pc1NtYWxsKXtpZihiPT09MSlyZXR1cm5bc2VsZixJbnRlZ2VyWzBdXTtpZihiPT0tMSlyZXR1cm5bc2VsZi5uZWdhdGUoKSxJbnRlZ2VyWzBdXTt2YXIgYWJzPU1hdGguYWJzKGIpO2lmKGFiczxCQVNFKXt2YWx1ZT1kaXZNb2RTbWFsbChhLGFicyk7cXVvdGllbnQ9YXJyYXlUb1NtYWxsKHZhbHVlWzBdKTt2YXIgcmVtYWluZGVyPXZhbHVlWzFdO2lmKHNlbGYuc2lnbilyZW1haW5kZXI9LXJlbWFpbmRlcjtpZih0eXBlb2YgcXVvdGllbnQ9PT0ibnVtYmVyIil7aWYoc2VsZi5zaWduIT09bi5zaWduKXF1b3RpZW50PS1xdW90aWVudDtyZXR1cm5bbmV3IFNtYWxsSW50ZWdlcihxdW90aWVudCksbmV3IFNtYWxsSW50ZWdlcihyZW1haW5kZXIpXX1yZXR1cm5bbmV3IEJpZ0ludGVnZXIocXVvdGllbnQsc2VsZi5zaWduIT09bi5zaWduKSxuZXcgU21hbGxJbnRlZ2VyKHJlbWFpbmRlcildfWI9c21hbGxUb0FycmF5KGFicyl9dmFyIGNvbXBhcmlzb249Y29tcGFyZUFicyhhLGIpO2lmKGNvbXBhcmlzb249PT0tMSlyZXR1cm5bSW50ZWdlclswXSxzZWxmXTtpZihjb21wYXJpc29uPT09MClyZXR1cm5bSW50ZWdlcltzZWxmLnNpZ249PT1uLnNpZ24/MTotMV0sSW50ZWdlclswXV07aWYoYS5sZW5ndGgrYi5sZW5ndGg8PTIwMCl2YWx1ZT1kaXZNb2QxKGEsYik7ZWxzZSB2YWx1ZT1kaXZNb2QyKGEsYik7cXVvdGllbnQ9dmFsdWVbMF07dmFyIHFTaWduPXNlbGYuc2lnbiE9PW4uc2lnbixtb2Q9dmFsdWVbMV0sbVNpZ249c2VsZi5zaWduO2lmKHR5cGVvZiBxdW90aWVudD09PSJudW1iZXIiKXtpZihxU2lnbilxdW90aWVudD0tcXVvdGllbnQ7cXVvdGllbnQ9bmV3IFNtYWxsSW50ZWdlcihxdW90aWVudCl9ZWxzZSBxdW90aWVudD1uZXcgQmlnSW50ZWdlcihxdW90aWVudCxxU2lnbik7aWYodHlwZW9mIG1vZD09PSJudW1iZXIiKXtpZihtU2lnbiltb2Q9LW1vZDttb2Q9bmV3IFNtYWxsSW50ZWdlcihtb2QpfWVsc2UgbW9kPW5ldyBCaWdJbnRlZ2VyKG1vZCxtU2lnbik7cmV0dXJuW3F1b3RpZW50LG1vZF19QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kPWZ1bmN0aW9uKHYpe3ZhciByZXN1bHQ9ZGl2TW9kQW55KHRoaXMsdik7cmV0dXJue3F1b3RpZW50OnJlc3VsdFswXSxyZW1haW5kZXI6cmVzdWx0WzFdfX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5kaXZtb2Q9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZtb2Q9QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2bW9kO0JpZ0ludGVnZXIucHJvdG90eXBlLmRpdmlkZT1mdW5jdGlvbih2KXtyZXR1cm4gZGl2TW9kQW55KHRoaXMsdilbMF19O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUub3Zlcj1OYXRpdmVCaWdJbnQucHJvdG90eXBlLmRpdmlkZT1mdW5jdGlvbih2KXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh0aGlzLnZhbHVlL3BhcnNlVmFsdWUodikudmFsdWUpfTtTbWFsbEludGVnZXIucHJvdG90eXBlLm92ZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGU9QmlnSW50ZWdlci5wcm90b3R5cGUub3Zlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGU7QmlnSW50ZWdlci5wcm90b3R5cGUubW9kPWZ1bmN0aW9uKHYpe3JldHVybiBkaXZNb2RBbnkodGhpcyx2KVsxXX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5tb2Q9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5yZW1haW5kZXI9ZnVuY3Rpb24odil7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQodGhpcy52YWx1ZSVwYXJzZVZhbHVlKHYpLnZhbHVlKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5yZW1haW5kZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tb2Q9QmlnSW50ZWdlci5wcm90b3R5cGUucmVtYWluZGVyPUJpZ0ludGVnZXIucHJvdG90eXBlLm1vZDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5wb3c9ZnVuY3Rpb24odil7dmFyIG49cGFyc2VWYWx1ZSh2KSxhPXRoaXMudmFsdWUsYj1uLnZhbHVlLHZhbHVlLHgseTtpZihiPT09MClyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09MClyZXR1cm4gSW50ZWdlclswXTtpZihhPT09MSlyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09LTEpcmV0dXJuIG4uaXNFdmVuKCk/SW50ZWdlclsxXTpJbnRlZ2VyWy0xXTtpZihuLnNpZ24pe3JldHVybiBJbnRlZ2VyWzBdfWlmKCFuLmlzU21hbGwpdGhyb3cgbmV3IEVycm9yKCJUaGUgZXhwb25lbnQgIituLnRvU3RyaW5nKCkrIiBpcyB0b28gbGFyZ2UuIik7aWYodGhpcy5pc1NtYWxsKXtpZihpc1ByZWNpc2UodmFsdWU9TWF0aC5wb3coYSxiKSkpcmV0dXJuIG5ldyBTbWFsbEludGVnZXIodHJ1bmNhdGUodmFsdWUpKX14PXRoaXM7eT1JbnRlZ2VyWzFdO3doaWxlKHRydWUpe2lmKGImMT09PTEpe3k9eS50aW1lcyh4KTstLWJ9aWYoYj09PTApYnJlYWs7Yi89Mjt4PXguc3F1YXJlKCl9cmV0dXJuIHl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUucG93PUJpZ0ludGVnZXIucHJvdG90eXBlLnBvdztOYXRpdmVCaWdJbnQucHJvdG90eXBlLnBvdz1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpO3ZhciBhPXRoaXMudmFsdWUsYj1uLnZhbHVlO3ZhciBfMD1CaWdJbnQoMCksXzE9QmlnSW50KDEpLF8yPUJpZ0ludCgyKTtpZihiPT09XzApcmV0dXJuIEludGVnZXJbMV07aWYoYT09PV8wKXJldHVybiBJbnRlZ2VyWzBdO2lmKGE9PT1fMSlyZXR1cm4gSW50ZWdlclsxXTtpZihhPT09QmlnSW50KC0xKSlyZXR1cm4gbi5pc0V2ZW4oKT9JbnRlZ2VyWzFdOkludGVnZXJbLTFdO2lmKG4uaXNOZWdhdGl2ZSgpKXJldHVybiBuZXcgTmF0aXZlQmlnSW50KF8wKTt2YXIgeD10aGlzO3ZhciB5PUludGVnZXJbMV07d2hpbGUodHJ1ZSl7aWYoKGImXzEpPT09XzEpe3k9eS50aW1lcyh4KTstLWJ9aWYoYj09PV8wKWJyZWFrO2IvPV8yO3g9eC5zcXVhcmUoKX1yZXR1cm4geX07QmlnSW50ZWdlci5wcm90b3R5cGUubW9kUG93PWZ1bmN0aW9uKGV4cCxtb2Qpe2V4cD1wYXJzZVZhbHVlKGV4cCk7bW9kPXBhcnNlVmFsdWUobW9kKTtpZihtb2QuaXNaZXJvKCkpdGhyb3cgbmV3IEVycm9yKCJDYW5ub3QgdGFrZSBtb2RQb3cgd2l0aCBtb2R1bHVzIDAiKTt2YXIgcj1JbnRlZ2VyWzFdLGJhc2U9dGhpcy5tb2QobW9kKTtpZihleHAuaXNOZWdhdGl2ZSgpKXtleHA9ZXhwLm11bHRpcGx5KEludGVnZXJbLTFdKTtiYXNlPWJhc2UubW9kSW52KG1vZCl9d2hpbGUoZXhwLmlzUG9zaXRpdmUoKSl7aWYoYmFzZS5pc1plcm8oKSlyZXR1cm4gSW50ZWdlclswXTtpZihleHAuaXNPZGQoKSlyPXIubXVsdGlwbHkoYmFzZSkubW9kKG1vZCk7ZXhwPWV4cC5kaXZpZGUoMik7YmFzZT1iYXNlLnNxdWFyZSgpLm1vZChtb2QpfXJldHVybiByfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLm1vZFBvdz1TbWFsbEludGVnZXIucHJvdG90eXBlLm1vZFBvdz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5tb2RQb3c7ZnVuY3Rpb24gY29tcGFyZUFicyhhLGIpe2lmKGEubGVuZ3RoIT09Yi5sZW5ndGgpe3JldHVybiBhLmxlbmd0aD5iLmxlbmd0aD8xOi0xfWZvcih2YXIgaT1hLmxlbmd0aC0xO2k+PTA7aS0tKXtpZihhW2ldIT09YltpXSlyZXR1cm4gYVtpXT5iW2ldPzE6LTF9cmV0dXJuIDB9QmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZUFicz1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpLGE9dGhpcy52YWx1ZSxiPW4udmFsdWU7aWYobi5pc1NtYWxsKXJldHVybiAxO3JldHVybiBjb21wYXJlQWJzKGEsYil9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZUFicz1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpLGE9TWF0aC5hYnModGhpcy52YWx1ZSksYj1uLnZhbHVlO2lmKG4uaXNTbWFsbCl7Yj1NYXRoLmFicyhiKTtyZXR1cm4gYT09PWI/MDphPmI/MTotMX1yZXR1cm4tMX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5jb21wYXJlQWJzPWZ1bmN0aW9uKHYpe3ZhciBhPXRoaXMudmFsdWU7dmFyIGI9cGFyc2VWYWx1ZSh2KS52YWx1ZTthPWE+PTA/YTotYTtiPWI+PTA/YjotYjtyZXR1cm4gYT09PWI/MDphPmI/MTotMX07QmlnSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZT1mdW5jdGlvbih2KXtpZih2PT09SW5maW5pdHkpe3JldHVybi0xfWlmKHY9PT0tSW5maW5pdHkpe3JldHVybiAxfXZhciBuPXBhcnNlVmFsdWUodiksYT10aGlzLnZhbHVlLGI9bi52YWx1ZTtpZih0aGlzLnNpZ24hPT1uLnNpZ24pe3JldHVybiBuLnNpZ24/MTotMX1pZihuLmlzU21hbGwpe3JldHVybiB0aGlzLnNpZ24/LTE6MX1yZXR1cm4gY29tcGFyZUFicyhhLGIpKih0aGlzLnNpZ24/LTE6MSl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmNvbXBhcmVUbz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5jb21wYXJlO1NtYWxsSW50ZWdlci5wcm90b3R5cGUuY29tcGFyZT1mdW5jdGlvbih2KXtpZih2PT09SW5maW5pdHkpe3JldHVybi0xfWlmKHY9PT0tSW5maW5pdHkpe3JldHVybiAxfXZhciBuPXBhcnNlVmFsdWUodiksYT10aGlzLnZhbHVlLGI9bi52YWx1ZTtpZihuLmlzU21hbGwpe3JldHVybiBhPT1iPzA6YT5iPzE6LTF9aWYoYTwwIT09bi5zaWduKXtyZXR1cm4gYTwwPy0xOjF9cmV0dXJuIGE8MD8xOi0xfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmNvbXBhcmVUbz1TbWFsbEludGVnZXIucHJvdG90eXBlLmNvbXBhcmU7TmF0aXZlQmlnSW50LnByb3RvdHlwZS5jb21wYXJlPWZ1bmN0aW9uKHYpe2lmKHY9PT1JbmZpbml0eSl7cmV0dXJuLTF9aWYodj09PS1JbmZpbml0eSl7cmV0dXJuIDF9dmFyIGE9dGhpcy52YWx1ZTt2YXIgYj1wYXJzZVZhbHVlKHYpLnZhbHVlO3JldHVybiBhPT09Yj8wOmE+Yj8xOi0xfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmVUbz1OYXRpdmVCaWdJbnQucHJvdG90eXBlLmNvbXBhcmU7QmlnSW50ZWdlci5wcm90b3R5cGUuZXF1YWxzPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodik9PT0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmVxPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUuZXF1YWxzPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuZXE9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5lcXVhbHM9QmlnSW50ZWdlci5wcm90b3R5cGUuZXE9QmlnSW50ZWdlci5wcm90b3R5cGUuZXF1YWxzO0JpZ0ludGVnZXIucHJvdG90eXBlLm5vdEVxdWFscz1mdW5jdGlvbih2KXtyZXR1cm4gdGhpcy5jb21wYXJlKHYpIT09MH07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5uZXE9TmF0aXZlQmlnSW50LnByb3RvdHlwZS5ub3RFcXVhbHM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZXE9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ub3RFcXVhbHM9QmlnSW50ZWdlci5wcm90b3R5cGUubmVxPUJpZ0ludGVnZXIucHJvdG90eXBlLm5vdEVxdWFscztCaWdJbnRlZ2VyLnByb3RvdHlwZS5ncmVhdGVyPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodik+MH07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5ndD1OYXRpdmVCaWdJbnQucHJvdG90eXBlLmdyZWF0ZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ndD1TbWFsbEludGVnZXIucHJvdG90eXBlLmdyZWF0ZXI9QmlnSW50ZWdlci5wcm90b3R5cGUuZ3Q9QmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlcjtCaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXI9ZnVuY3Rpb24odil7cmV0dXJuIHRoaXMuY29tcGFyZSh2KTwwfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmx0PU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubGVzc2VyPVNtYWxsSW50ZWdlci5wcm90b3R5cGUubHQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXI9QmlnSW50ZWdlci5wcm90b3R5cGUubHQ9QmlnSW50ZWdlci5wcm90b3R5cGUubGVzc2VyO0JpZ0ludGVnZXIucHJvdG90eXBlLmdyZWF0ZXJPckVxdWFscz1mdW5jdGlvbih2KXtyZXR1cm4gdGhpcy5jb21wYXJlKHYpPj0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmdlcT1OYXRpdmVCaWdJbnQucHJvdG90eXBlLmdyZWF0ZXJPckVxdWFscz1TbWFsbEludGVnZXIucHJvdG90eXBlLmdlcT1TbWFsbEludGVnZXIucHJvdG90eXBlLmdyZWF0ZXJPckVxdWFscz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5nZXE9QmlnSW50ZWdlci5wcm90b3R5cGUuZ3JlYXRlck9yRXF1YWxzO0JpZ0ludGVnZXIucHJvdG90eXBlLmxlc3Nlck9yRXF1YWxzPWZ1bmN0aW9uKHYpe3JldHVybiB0aGlzLmNvbXBhcmUodik8PTB9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubGVxPU5hdGl2ZUJpZ0ludC5wcm90b3R5cGUubGVzc2VyT3JFcXVhbHM9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sZXE9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5sZXNzZXJPckVxdWFscz1CaWdJbnRlZ2VyLnByb3RvdHlwZS5sZXE9QmlnSW50ZWdlci5wcm90b3R5cGUubGVzc2VyT3JFcXVhbHM7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNFdmVuPWZ1bmN0aW9uKCl7cmV0dXJuKHRoaXMudmFsdWVbMF0mMSk9PT0wfTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzRXZlbj1mdW5jdGlvbigpe3JldHVybih0aGlzLnZhbHVlJjEpPT09MH07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc0V2ZW49ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy52YWx1ZSZCaWdJbnQoMSkpPT09QmlnSW50KDApfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc09kZD1mdW5jdGlvbigpe3JldHVybih0aGlzLnZhbHVlWzBdJjEpPT09MX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc09kZD1mdW5jdGlvbigpe3JldHVybih0aGlzLnZhbHVlJjEpPT09MX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc09kZD1mdW5jdGlvbigpe3JldHVybih0aGlzLnZhbHVlJkJpZ0ludCgxKSk9PT1CaWdJbnQoMSl9O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzUG9zaXRpdmU9ZnVuY3Rpb24oKXtyZXR1cm4hdGhpcy5zaWdufTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzUG9zaXRpdmU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52YWx1ZT4wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzUG9zaXRpdmU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1Bvc2l0aXZlO0JpZ0ludGVnZXIucHJvdG90eXBlLmlzTmVnYXRpdmU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zaWdufTtTbWFsbEludGVnZXIucHJvdG90eXBlLmlzTmVnYXRpdmU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy52YWx1ZTwwfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzTmVnYXRpdmU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc05lZ2F0aXZlO0JpZ0ludGVnZXIucHJvdG90eXBlLmlzVW5pdD1mdW5jdGlvbigpe3JldHVybiBmYWxzZX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1VuaXQ9ZnVuY3Rpb24oKXtyZXR1cm4gTWF0aC5hYnModGhpcy52YWx1ZSk9PT0xfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzVW5pdD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmFicygpLnZhbHVlPT09QmlnSW50KDEpfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1plcm89ZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNaZXJvPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudmFsdWU9PT0wfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmlzWmVybz1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlPT09QmlnSW50KDApfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5PWZ1bmN0aW9uKHYpe3ZhciBuPXBhcnNlVmFsdWUodik7aWYobi5pc1plcm8oKSlyZXR1cm4gZmFsc2U7aWYobi5pc1VuaXQoKSlyZXR1cm4gdHJ1ZTtpZihuLmNvbXBhcmVBYnMoMik9PT0wKXJldHVybiB0aGlzLmlzRXZlbigpO3JldHVybiB0aGlzLm1vZChuKS5pc1plcm8oKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5PVNtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNEaXZpc2libGVCeT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5pc0RpdmlzaWJsZUJ5O2Z1bmN0aW9uIGlzQmFzaWNQcmltZSh2KXt2YXIgbj12LmFicygpO2lmKG4uaXNVbml0KCkpcmV0dXJuIGZhbHNlO2lmKG4uZXF1YWxzKDIpfHxuLmVxdWFscygzKXx8bi5lcXVhbHMoNSkpcmV0dXJuIHRydWU7aWYobi5pc0V2ZW4oKXx8bi5pc0RpdmlzaWJsZUJ5KDMpfHxuLmlzRGl2aXNpYmxlQnkoNSkpcmV0dXJuIGZhbHNlO2lmKG4ubGVzc2VyKDQ5KSlyZXR1cm4gdHJ1ZX1mdW5jdGlvbiBtaWxsZXJSYWJpblRlc3QobixhKXt2YXIgblByZXY9bi5wcmV2KCksYj1uUHJldixyPTAsZCx0LGkseDt3aGlsZShiLmlzRXZlbigpKWI9Yi5kaXZpZGUoMikscisrO25leHQ6Zm9yKGk9MDtpPGEubGVuZ3RoO2krKyl7aWYobi5sZXNzZXIoYVtpXSkpY29udGludWU7eD1iaWdJbnQoYVtpXSkubW9kUG93KGIsbik7aWYoeC5pc1VuaXQoKXx8eC5lcXVhbHMoblByZXYpKWNvbnRpbnVlO2ZvcihkPXItMTtkIT0wO2QtLSl7eD14LnNxdWFyZSgpLm1vZChuKTtpZih4LmlzVW5pdCgpKXJldHVybiBmYWxzZTtpZih4LmVxdWFscyhuUHJldikpY29udGludWUgbmV4dH1yZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcmltZT1mdW5jdGlvbihzdHJpY3Qpe3ZhciBpc1ByaW1lPWlzQmFzaWNQcmltZSh0aGlzKTtpZihpc1ByaW1lIT09dW5kZWZpbmVkKXJldHVybiBpc1ByaW1lO3ZhciBuPXRoaXMuYWJzKCk7dmFyIGJpdHM9bi5iaXRMZW5ndGgoKTtpZihiaXRzPD02NClyZXR1cm4gbWlsbGVyUmFiaW5UZXN0KG4sWzIsMyw1LDcsMTEsMTMsMTcsMTksMjMsMjksMzEsMzddKTt2YXIgbG9nTj1NYXRoLmxvZygyKSpiaXRzLnRvSlNOdW1iZXIoKTt2YXIgdD1NYXRoLmNlaWwoc3RyaWN0PT09dHJ1ZT8yKk1hdGgucG93KGxvZ04sMik6bG9nTik7Zm9yKHZhciBhPVtdLGk9MDtpPHQ7aSsrKXthLnB1c2goYmlnSW50KGkrMikpfXJldHVybiBtaWxsZXJSYWJpblRlc3QobixhKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc1ByaW1lPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuaXNQcmltZT1CaWdJbnRlZ2VyLnByb3RvdHlwZS5pc1ByaW1lO0JpZ0ludGVnZXIucHJvdG90eXBlLmlzUHJvYmFibGVQcmltZT1mdW5jdGlvbihpdGVyYXRpb25zLHJuZyl7dmFyIGlzUHJpbWU9aXNCYXNpY1ByaW1lKHRoaXMpO2lmKGlzUHJpbWUhPT11bmRlZmluZWQpcmV0dXJuIGlzUHJpbWU7dmFyIG49dGhpcy5hYnMoKTt2YXIgdD1pdGVyYXRpb25zPT09dW5kZWZpbmVkPzU6aXRlcmF0aW9ucztmb3IodmFyIGE9W10saT0wO2k8dDtpKyspe2EucHVzaChiaWdJbnQucmFuZEJldHdlZW4oMixuLm1pbnVzKDIpLHJuZykpfXJldHVybiBtaWxsZXJSYWJpblRlc3QobixhKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5pc1Byb2JhYmxlUHJpbWU9QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lO0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludj1mdW5jdGlvbihuKXt2YXIgdD1iaWdJbnQuemVybyxuZXdUPWJpZ0ludC5vbmUscj1wYXJzZVZhbHVlKG4pLG5ld1I9dGhpcy5hYnMoKSxxLGxhc3RULGxhc3RSO3doaWxlKCFuZXdSLmlzWmVybygpKXtxPXIuZGl2aWRlKG5ld1IpO2xhc3RUPXQ7bGFzdFI9cjt0PW5ld1Q7cj1uZXdSO25ld1Q9bGFzdFQuc3VidHJhY3QocS5tdWx0aXBseShuZXdUKSk7bmV3Uj1sYXN0Ui5zdWJ0cmFjdChxLm11bHRpcGx5KG5ld1IpKX1pZighci5pc1VuaXQoKSl0aHJvdyBuZXcgRXJyb3IodGhpcy50b1N0cmluZygpKyIgYW5kICIrbi50b1N0cmluZygpKyIgYXJlIG5vdCBjby1wcmltZSIpO2lmKHQuY29tcGFyZSgwKT09PS0xKXt0PXQuYWRkKG4pfWlmKHRoaXMuaXNOZWdhdGl2ZSgpKXtyZXR1cm4gdC5uZWdhdGUoKX1yZXR1cm4gdH07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5tb2RJbnY9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5tb2RJbnY9QmlnSW50ZWdlci5wcm90b3R5cGUubW9kSW52O0JpZ0ludGVnZXIucHJvdG90eXBlLm5leHQ9ZnVuY3Rpb24oKXt2YXIgdmFsdWU9dGhpcy52YWx1ZTtpZih0aGlzLnNpZ24pe3JldHVybiBzdWJ0cmFjdFNtYWxsKHZhbHVlLDEsdGhpcy5zaWduKX1yZXR1cm4gbmV3IEJpZ0ludGVnZXIoYWRkU21hbGwodmFsdWUsMSksdGhpcy5zaWduKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5uZXh0PWZ1bmN0aW9uKCl7dmFyIHZhbHVlPXRoaXMudmFsdWU7aWYodmFsdWUrMTxNQVhfSU5UKXJldHVybiBuZXcgU21hbGxJbnRlZ2VyKHZhbHVlKzEpO3JldHVybiBuZXcgQmlnSW50ZWdlcihNQVhfSU5UX0FSUixmYWxzZSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUubmV4dD1mdW5jdGlvbigpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUrQmlnSW50KDEpKX07QmlnSW50ZWdlci5wcm90b3R5cGUucHJldj1mdW5jdGlvbigpe3ZhciB2YWx1ZT10aGlzLnZhbHVlO2lmKHRoaXMuc2lnbil7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKGFkZFNtYWxsKHZhbHVlLDEpLHRydWUpfXJldHVybiBzdWJ0cmFjdFNtYWxsKHZhbHVlLDEsdGhpcy5zaWduKX07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5wcmV2PWZ1bmN0aW9uKCl7dmFyIHZhbHVlPXRoaXMudmFsdWU7aWYodmFsdWUtMT4tTUFYX0lOVClyZXR1cm4gbmV3IFNtYWxsSW50ZWdlcih2YWx1ZS0xKTtyZXR1cm4gbmV3IEJpZ0ludGVnZXIoTUFYX0lOVF9BUlIsdHJ1ZSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUucHJldj1mdW5jdGlvbigpe3JldHVybiBuZXcgTmF0aXZlQmlnSW50KHRoaXMudmFsdWUtQmlnSW50KDEpKX07dmFyIHBvd2Vyc09mVHdvPVsxXTt3aGlsZSgyKnBvd2Vyc09mVHdvW3Bvd2Vyc09mVHdvLmxlbmd0aC0xXTw9QkFTRSlwb3dlcnNPZlR3by5wdXNoKDIqcG93ZXJzT2ZUd29bcG93ZXJzT2ZUd28ubGVuZ3RoLTFdKTt2YXIgcG93ZXJzMkxlbmd0aD1wb3dlcnNPZlR3by5sZW5ndGgsaGlnaGVzdFBvd2VyMj1wb3dlcnNPZlR3b1twb3dlcnMyTGVuZ3RoLTFdO2Z1bmN0aW9uIHNoaWZ0X2lzU21hbGwobil7cmV0dXJuIE1hdGguYWJzKG4pPD1CQVNFfUJpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0TGVmdD1mdW5jdGlvbih2KXt2YXIgbj1wYXJzZVZhbHVlKHYpLnRvSlNOdW1iZXIoKTtpZighc2hpZnRfaXNTbWFsbChuKSl7dGhyb3cgbmV3IEVycm9yKFN0cmluZyhuKSsiIGlzIHRvbyBsYXJnZSBmb3Igc2hpZnRpbmcuIil9aWYobjwwKXJldHVybiB0aGlzLnNoaWZ0UmlnaHQoLW4pO3ZhciByZXN1bHQ9dGhpcztpZihyZXN1bHQuaXNaZXJvKCkpcmV0dXJuIHJlc3VsdDt3aGlsZShuPj1wb3dlcnMyTGVuZ3RoKXtyZXN1bHQ9cmVzdWx0Lm11bHRpcGx5KGhpZ2hlc3RQb3dlcjIpO24tPXBvd2VyczJMZW5ndGgtMX1yZXR1cm4gcmVzdWx0Lm11bHRpcGx5KHBvd2Vyc09mVHdvW25dKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zaGlmdExlZnQ9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdExlZnQ9QmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0O0JpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQ9ZnVuY3Rpb24odil7dmFyIHJlbVF1bzt2YXIgbj1wYXJzZVZhbHVlKHYpLnRvSlNOdW1iZXIoKTtpZighc2hpZnRfaXNTbWFsbChuKSl7dGhyb3cgbmV3IEVycm9yKFN0cmluZyhuKSsiIGlzIHRvbyBsYXJnZSBmb3Igc2hpZnRpbmcuIil9aWYobjwwKXJldHVybiB0aGlzLnNoaWZ0TGVmdCgtbik7dmFyIHJlc3VsdD10aGlzO3doaWxlKG4+PXBvd2VyczJMZW5ndGgpe2lmKHJlc3VsdC5pc1plcm8oKXx8cmVzdWx0LmlzTmVnYXRpdmUoKSYmcmVzdWx0LmlzVW5pdCgpKXJldHVybiByZXN1bHQ7cmVtUXVvPWRpdk1vZEFueShyZXN1bHQsaGlnaGVzdFBvd2VyMik7cmVzdWx0PXJlbVF1b1sxXS5pc05lZ2F0aXZlKCk/cmVtUXVvWzBdLnByZXYoKTpyZW1RdW9bMF07bi09cG93ZXJzMkxlbmd0aC0xfXJlbVF1bz1kaXZNb2RBbnkocmVzdWx0LHBvd2Vyc09mVHdvW25dKTtyZXR1cm4gcmVtUXVvWzFdLmlzTmVnYXRpdmUoKT9yZW1RdW9bMF0ucHJldigpOnJlbVF1b1swXX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5zaGlmdFJpZ2h0PVNtYWxsSW50ZWdlci5wcm90b3R5cGUuc2hpZnRSaWdodD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5zaGlmdFJpZ2h0O2Z1bmN0aW9uIGJpdHdpc2UoeCx5LGZuKXt5PXBhcnNlVmFsdWUoeSk7dmFyIHhTaWduPXguaXNOZWdhdGl2ZSgpLHlTaWduPXkuaXNOZWdhdGl2ZSgpO3ZhciB4UmVtPXhTaWduP3gubm90KCk6eCx5UmVtPXlTaWduP3kubm90KCk6eTt2YXIgeERpZ2l0PTAseURpZ2l0PTA7dmFyIHhEaXZNb2Q9bnVsbCx5RGl2TW9kPW51bGw7dmFyIHJlc3VsdD1bXTt3aGlsZSgheFJlbS5pc1plcm8oKXx8IXlSZW0uaXNaZXJvKCkpe3hEaXZNb2Q9ZGl2TW9kQW55KHhSZW0saGlnaGVzdFBvd2VyMik7eERpZ2l0PXhEaXZNb2RbMV0udG9KU051bWJlcigpO2lmKHhTaWduKXt4RGlnaXQ9aGlnaGVzdFBvd2VyMi0xLXhEaWdpdH15RGl2TW9kPWRpdk1vZEFueSh5UmVtLGhpZ2hlc3RQb3dlcjIpO3lEaWdpdD15RGl2TW9kWzFdLnRvSlNOdW1iZXIoKTtpZih5U2lnbil7eURpZ2l0PWhpZ2hlc3RQb3dlcjItMS15RGlnaXR9eFJlbT14RGl2TW9kWzBdO3lSZW09eURpdk1vZFswXTtyZXN1bHQucHVzaChmbih4RGlnaXQseURpZ2l0KSl9dmFyIHN1bT1mbih4U2lnbj8xOjAseVNpZ24/MTowKSE9PTA/YmlnSW50KC0xKTpiaWdJbnQoMCk7Zm9yKHZhciBpPXJlc3VsdC5sZW5ndGgtMTtpPj0wO2ktPTEpe3N1bT1zdW0ubXVsdGlwbHkoaGlnaGVzdFBvd2VyMikuYWRkKGJpZ0ludChyZXN1bHRbaV0pKX1yZXR1cm4gc3VtfUJpZ0ludGVnZXIucHJvdG90eXBlLm5vdD1mdW5jdGlvbigpe3JldHVybiB0aGlzLm5lZ2F0ZSgpLnByZXYoKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS5ub3Q9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5ub3Q9QmlnSW50ZWdlci5wcm90b3R5cGUubm90O0JpZ0ludGVnZXIucHJvdG90eXBlLmFuZD1mdW5jdGlvbihuKXtyZXR1cm4gYml0d2lzZSh0aGlzLG4sZnVuY3Rpb24oYSxiKXtyZXR1cm4gYSZifSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUuYW5kPVNtYWxsSW50ZWdlci5wcm90b3R5cGUuYW5kPUJpZ0ludGVnZXIucHJvdG90eXBlLmFuZDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5vcj1mdW5jdGlvbihuKXtyZXR1cm4gYml0d2lzZSh0aGlzLG4sZnVuY3Rpb24oYSxiKXtyZXR1cm4gYXxifSl9O05hdGl2ZUJpZ0ludC5wcm90b3R5cGUub3I9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS5vcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS5vcjtCaWdJbnRlZ2VyLnByb3RvdHlwZS54b3I9ZnVuY3Rpb24obil7cmV0dXJuIGJpdHdpc2UodGhpcyxuLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGFeYn0pfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLnhvcj1TbWFsbEludGVnZXIucHJvdG90eXBlLnhvcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS54b3I7dmFyIExPQk1BU0tfST0xPDwzMCxMT0JNQVNLX0JJPShCQVNFJi1CQVNFKSooQkFTRSYtQkFTRSl8TE9CTUFTS19JO2Z1bmN0aW9uIHJvdWdoTE9CKG4pe3ZhciB2PW4udmFsdWUseD10eXBlb2Ygdj09PSJudW1iZXIiP3Z8TE9CTUFTS19JOnR5cGVvZiB2PT09ImJpZ2ludCI/dnxCaWdJbnQoTE9CTUFTS19JKTp2WzBdK3ZbMV0qQkFTRXxMT0JNQVNLX0JJO3JldHVybiB4Ji14fWZ1bmN0aW9uIGludGVnZXJMb2dhcml0aG0odmFsdWUsYmFzZSl7aWYoYmFzZS5jb21wYXJlVG8odmFsdWUpPD0wKXt2YXIgdG1wPWludGVnZXJMb2dhcml0aG0odmFsdWUsYmFzZS5zcXVhcmUoYmFzZSkpO3ZhciBwPXRtcC5wO3ZhciBlPXRtcC5lO3ZhciB0PXAubXVsdGlwbHkoYmFzZSk7cmV0dXJuIHQuY29tcGFyZVRvKHZhbHVlKTw9MD97cDp0LGU6ZSoyKzF9OntwOnAsZTplKjJ9fXJldHVybntwOmJpZ0ludCgxKSxlOjB9fUJpZ0ludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aD1mdW5jdGlvbigpe3ZhciBuPXRoaXM7aWYobi5jb21wYXJlVG8oYmlnSW50KDApKTwwKXtuPW4ubmVnYXRlKCkuc3VidHJhY3QoYmlnSW50KDEpKX1pZihuLmNvbXBhcmVUbyhiaWdJbnQoMCkpPT09MCl7cmV0dXJuIGJpZ0ludCgwKX1yZXR1cm4gYmlnSW50KGludGVnZXJMb2dhcml0aG0obixiaWdJbnQoMikpLmUpLmFkZChiaWdJbnQoMSkpfTtOYXRpdmVCaWdJbnQucHJvdG90eXBlLmJpdExlbmd0aD1TbWFsbEludGVnZXIucHJvdG90eXBlLmJpdExlbmd0aD1CaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRMZW5ndGg7ZnVuY3Rpb24gbWF4KGEsYil7YT1wYXJzZVZhbHVlKGEpO2I9cGFyc2VWYWx1ZShiKTtyZXR1cm4gYS5ncmVhdGVyKGIpP2E6Yn1mdW5jdGlvbiBtaW4oYSxiKXthPXBhcnNlVmFsdWUoYSk7Yj1wYXJzZVZhbHVlKGIpO3JldHVybiBhLmxlc3NlcihiKT9hOmJ9ZnVuY3Rpb24gZ2NkKGEsYil7YT1wYXJzZVZhbHVlKGEpLmFicygpO2I9cGFyc2VWYWx1ZShiKS5hYnMoKTtpZihhLmVxdWFscyhiKSlyZXR1cm4gYTtpZihhLmlzWmVybygpKXJldHVybiBiO2lmKGIuaXNaZXJvKCkpcmV0dXJuIGE7dmFyIGM9SW50ZWdlclsxXSxkLHQ7d2hpbGUoYS5pc0V2ZW4oKSYmYi5pc0V2ZW4oKSl7ZD1taW4ocm91Z2hMT0IoYSkscm91Z2hMT0IoYikpO2E9YS5kaXZpZGUoZCk7Yj1iLmRpdmlkZShkKTtjPWMubXVsdGlwbHkoZCl9d2hpbGUoYS5pc0V2ZW4oKSl7YT1hLmRpdmlkZShyb3VnaExPQihhKSl9ZG97d2hpbGUoYi5pc0V2ZW4oKSl7Yj1iLmRpdmlkZShyb3VnaExPQihiKSl9aWYoYS5ncmVhdGVyKGIpKXt0PWI7Yj1hO2E9dH1iPWIuc3VidHJhY3QoYSl9d2hpbGUoIWIuaXNaZXJvKCkpO3JldHVybiBjLmlzVW5pdCgpP2E6YS5tdWx0aXBseShjKX1mdW5jdGlvbiBsY20oYSxiKXthPXBhcnNlVmFsdWUoYSkuYWJzKCk7Yj1wYXJzZVZhbHVlKGIpLmFicygpO3JldHVybiBhLmRpdmlkZShnY2QoYSxiKSkubXVsdGlwbHkoYil9ZnVuY3Rpb24gcmFuZEJldHdlZW4oYSxiLHJuZyl7YT1wYXJzZVZhbHVlKGEpO2I9cGFyc2VWYWx1ZShiKTt2YXIgdXNlZFJORz1ybmd8fE1hdGgucmFuZG9tO3ZhciBsb3c9bWluKGEsYiksaGlnaD1tYXgoYSxiKTt2YXIgcmFuZ2U9aGlnaC5zdWJ0cmFjdChsb3cpLmFkZCgxKTtpZihyYW5nZS5pc1NtYWxsKXJldHVybiBsb3cuYWRkKE1hdGguZmxvb3IodXNlZFJORygpKnJhbmdlKSk7dmFyIGRpZ2l0cz10b0Jhc2UocmFuZ2UsQkFTRSkudmFsdWU7dmFyIHJlc3VsdD1bXSxyZXN0cmljdGVkPXRydWU7Zm9yKHZhciBpPTA7aTxkaWdpdHMubGVuZ3RoO2krKyl7dmFyIHRvcD1yZXN0cmljdGVkP2RpZ2l0c1tpXTpCQVNFO3ZhciBkaWdpdD10cnVuY2F0ZSh1c2VkUk5HKCkqdG9wKTtyZXN1bHQucHVzaChkaWdpdCk7aWYoZGlnaXQ8dG9wKXJlc3RyaWN0ZWQ9ZmFsc2V9cmV0dXJuIGxvdy5hZGQoSW50ZWdlci5mcm9tQXJyYXkocmVzdWx0LEJBU0UsZmFsc2UpKX12YXIgcGFyc2VCYXNlPWZ1bmN0aW9uKHRleHQsYmFzZSxhbHBoYWJldCxjYXNlU2Vuc2l0aXZlKXthbHBoYWJldD1hbHBoYWJldHx8REVGQVVMVF9BTFBIQUJFVDt0ZXh0PVN0cmluZyh0ZXh0KTtpZighY2FzZVNlbnNpdGl2ZSl7dGV4dD10ZXh0LnRvTG93ZXJDYXNlKCk7YWxwaGFiZXQ9YWxwaGFiZXQudG9Mb3dlckNhc2UoKX12YXIgbGVuZ3RoPXRleHQubGVuZ3RoO3ZhciBpO3ZhciBhYnNCYXNlPU1hdGguYWJzKGJhc2UpO3ZhciBhbHBoYWJldFZhbHVlcz17fTtmb3IoaT0wO2k8YWxwaGFiZXQubGVuZ3RoO2krKyl7YWxwaGFiZXRWYWx1ZXNbYWxwaGFiZXRbaV1dPWl9Zm9yKGk9MDtpPGxlbmd0aDtpKyspe3ZhciBjPXRleHRbaV07aWYoYz09PSItIiljb250aW51ZTtpZihjIGluIGFscGhhYmV0VmFsdWVzKXtpZihhbHBoYWJldFZhbHVlc1tjXT49YWJzQmFzZSl7aWYoYz09PSIxIiYmYWJzQmFzZT09PTEpY29udGludWU7dGhyb3cgbmV3IEVycm9yKGMrIiBpcyBub3QgYSB2YWxpZCBkaWdpdCBpbiBiYXNlICIrYmFzZSsiLiIpfX19YmFzZT1wYXJzZVZhbHVlKGJhc2UpO3ZhciBkaWdpdHM9W107dmFyIGlzTmVnYXRpdmU9dGV4dFswXT09PSItIjtmb3IoaT1pc05lZ2F0aXZlPzE6MDtpPHRleHQubGVuZ3RoO2krKyl7dmFyIGM9dGV4dFtpXTtpZihjIGluIGFscGhhYmV0VmFsdWVzKWRpZ2l0cy5wdXNoKHBhcnNlVmFsdWUoYWxwaGFiZXRWYWx1ZXNbY10pKTtlbHNlIGlmKGM9PT0iPCIpe3ZhciBzdGFydD1pO2Rve2krK313aGlsZSh0ZXh0W2ldIT09Ij4iJiZpPHRleHQubGVuZ3RoKTtkaWdpdHMucHVzaChwYXJzZVZhbHVlKHRleHQuc2xpY2Uoc3RhcnQrMSxpKSkpfWVsc2UgdGhyb3cgbmV3IEVycm9yKGMrIiBpcyBub3QgYSB2YWxpZCBjaGFyYWN0ZXIiKX1yZXR1cm4gcGFyc2VCYXNlRnJvbUFycmF5KGRpZ2l0cyxiYXNlLGlzTmVnYXRpdmUpfTtmdW5jdGlvbiBwYXJzZUJhc2VGcm9tQXJyYXkoZGlnaXRzLGJhc2UsaXNOZWdhdGl2ZSl7dmFyIHZhbD1JbnRlZ2VyWzBdLHBvdz1JbnRlZ2VyWzFdLGk7Zm9yKGk9ZGlnaXRzLmxlbmd0aC0xO2k+PTA7aS0tKXt2YWw9dmFsLmFkZChkaWdpdHNbaV0udGltZXMocG93KSk7cG93PXBvdy50aW1lcyhiYXNlKX1yZXR1cm4gaXNOZWdhdGl2ZT92YWwubmVnYXRlKCk6dmFsfWZ1bmN0aW9uIHN0cmluZ2lmeShkaWdpdCxhbHBoYWJldCl7YWxwaGFiZXQ9YWxwaGFiZXR8fERFRkFVTFRfQUxQSEFCRVQ7aWYoZGlnaXQ8YWxwaGFiZXQubGVuZ3RoKXtyZXR1cm4gYWxwaGFiZXRbZGlnaXRdfXJldHVybiI8IitkaWdpdCsiPiJ9ZnVuY3Rpb24gdG9CYXNlKG4sYmFzZSl7YmFzZT1iaWdJbnQoYmFzZSk7aWYoYmFzZS5pc1plcm8oKSl7aWYobi5pc1plcm8oKSlyZXR1cm57dmFsdWU6WzBdLGlzTmVnYXRpdmU6ZmFsc2V9O3Rocm93IG5ldyBFcnJvcigiQ2Fubm90IGNvbnZlcnQgbm9uemVybyBudW1iZXJzIHRvIGJhc2UgMC4iKX1pZihiYXNlLmVxdWFscygtMSkpe2lmKG4uaXNaZXJvKCkpcmV0dXJue3ZhbHVlOlswXSxpc05lZ2F0aXZlOmZhbHNlfTtpZihuLmlzTmVnYXRpdmUoKSlyZXR1cm57dmFsdWU6W10uY29uY2F0LmFwcGx5KFtdLEFycmF5LmFwcGx5KG51bGwsQXJyYXkoLW4udG9KU051bWJlcigpKSkubWFwKEFycmF5LnByb3RvdHlwZS52YWx1ZU9mLFsxLDBdKSksaXNOZWdhdGl2ZTpmYWxzZX07dmFyIGFycj1BcnJheS5hcHBseShudWxsLEFycmF5KG4udG9KU051bWJlcigpLTEpKS5tYXAoQXJyYXkucHJvdG90eXBlLnZhbHVlT2YsWzAsMV0pO2Fyci51bnNoaWZ0KFsxXSk7cmV0dXJue3ZhbHVlOltdLmNvbmNhdC5hcHBseShbXSxhcnIpLGlzTmVnYXRpdmU6ZmFsc2V9fXZhciBuZWc9ZmFsc2U7aWYobi5pc05lZ2F0aXZlKCkmJmJhc2UuaXNQb3NpdGl2ZSgpKXtuZWc9dHJ1ZTtuPW4uYWJzKCl9aWYoYmFzZS5pc1VuaXQoKSl7aWYobi5pc1plcm8oKSlyZXR1cm57dmFsdWU6WzBdLGlzTmVnYXRpdmU6ZmFsc2V9O3JldHVybnt2YWx1ZTpBcnJheS5hcHBseShudWxsLEFycmF5KG4udG9KU051bWJlcigpKSkubWFwKE51bWJlci5wcm90b3R5cGUudmFsdWVPZiwxKSxpc05lZ2F0aXZlOm5lZ319dmFyIG91dD1bXTt2YXIgbGVmdD1uLGRpdm1vZDt3aGlsZShsZWZ0LmlzTmVnYXRpdmUoKXx8bGVmdC5jb21wYXJlQWJzKGJhc2UpPj0wKXtkaXZtb2Q9bGVmdC5kaXZtb2QoYmFzZSk7bGVmdD1kaXZtb2QucXVvdGllbnQ7dmFyIGRpZ2l0PWRpdm1vZC5yZW1haW5kZXI7aWYoZGlnaXQuaXNOZWdhdGl2ZSgpKXtkaWdpdD1iYXNlLm1pbnVzKGRpZ2l0KS5hYnMoKTtsZWZ0PWxlZnQubmV4dCgpfW91dC5wdXNoKGRpZ2l0LnRvSlNOdW1iZXIoKSl9b3V0LnB1c2gobGVmdC50b0pTTnVtYmVyKCkpO3JldHVybnt2YWx1ZTpvdXQucmV2ZXJzZSgpLGlzTmVnYXRpdmU6bmVnfX1mdW5jdGlvbiB0b0Jhc2VTdHJpbmcobixiYXNlLGFscGhhYmV0KXt2YXIgYXJyPXRvQmFzZShuLGJhc2UpO3JldHVybihhcnIuaXNOZWdhdGl2ZT8iLSI6IiIpK2Fyci52YWx1ZS5tYXAoZnVuY3Rpb24oeCl7cmV0dXJuIHN0cmluZ2lmeSh4LGFscGhhYmV0KX0pLmpvaW4oIiIpfUJpZ0ludGVnZXIucHJvdG90eXBlLnRvQXJyYXk9ZnVuY3Rpb24ocmFkaXgpe3JldHVybiB0b0Jhc2UodGhpcyxyYWRpeCl9O1NtYWxsSW50ZWdlci5wcm90b3R5cGUudG9BcnJheT1mdW5jdGlvbihyYWRpeCl7cmV0dXJuIHRvQmFzZSh0aGlzLHJhZGl4KX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50b0FycmF5PWZ1bmN0aW9uKHJhZGl4KXtyZXR1cm4gdG9CYXNlKHRoaXMscmFkaXgpfTtCaWdJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbihyYWRpeCxhbHBoYWJldCl7aWYocmFkaXg9PT11bmRlZmluZWQpcmFkaXg9MTA7aWYocmFkaXghPT0xMClyZXR1cm4gdG9CYXNlU3RyaW5nKHRoaXMscmFkaXgsYWxwaGFiZXQpO3ZhciB2PXRoaXMudmFsdWUsbD12Lmxlbmd0aCxzdHI9U3RyaW5nKHZbLS1sXSksemVyb3M9IjAwMDAwMDAiLGRpZ2l0O3doaWxlKC0tbD49MCl7ZGlnaXQ9U3RyaW5nKHZbbF0pO3N0cis9emVyb3Muc2xpY2UoZGlnaXQubGVuZ3RoKStkaWdpdH12YXIgc2lnbj10aGlzLnNpZ24/Ii0iOiIiO3JldHVybiBzaWduK3N0cn07U21hbGxJbnRlZ2VyLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbihyYWRpeCxhbHBoYWJldCl7aWYocmFkaXg9PT11bmRlZmluZWQpcmFkaXg9MTA7aWYocmFkaXghPTEwKXJldHVybiB0b0Jhc2VTdHJpbmcodGhpcyxyYWRpeCxhbHBoYWJldCk7cmV0dXJuIFN0cmluZyh0aGlzLnZhbHVlKX07TmF0aXZlQmlnSW50LnByb3RvdHlwZS50b1N0cmluZz1TbWFsbEludGVnZXIucHJvdG90eXBlLnRvU3RyaW5nO05hdGl2ZUJpZ0ludC5wcm90b3R5cGUudG9KU09OPUJpZ0ludGVnZXIucHJvdG90eXBlLnRvSlNPTj1TbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNPTj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnRvU3RyaW5nKCl9O0JpZ0ludGVnZXIucHJvdG90eXBlLnZhbHVlT2Y9ZnVuY3Rpb24oKXtyZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLDEwKX07QmlnSW50ZWdlci5wcm90b3R5cGUudG9KU051bWJlcj1CaWdJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO1NtYWxsSW50ZWdlci5wcm90b3R5cGUudmFsdWVPZj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZhbHVlfTtTbWFsbEludGVnZXIucHJvdG90eXBlLnRvSlNOdW1iZXI9U21hbGxJbnRlZ2VyLnByb3RvdHlwZS52YWx1ZU9mO05hdGl2ZUJpZ0ludC5wcm90b3R5cGUudmFsdWVPZj1OYXRpdmVCaWdJbnQucHJvdG90eXBlLnRvSlNOdW1iZXI9ZnVuY3Rpb24oKXtyZXR1cm4gcGFyc2VJbnQodGhpcy50b1N0cmluZygpLDEwKX07ZnVuY3Rpb24gcGFyc2VTdHJpbmdWYWx1ZSh2KXtpZihpc1ByZWNpc2UoK3YpKXt2YXIgeD0rdjtpZih4PT09dHJ1bmNhdGUoeCkpcmV0dXJuIHN1cHBvcnRzTmF0aXZlQmlnSW50P25ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHgpKTpuZXcgU21hbGxJbnRlZ2VyKHgpO3Rocm93IG5ldyBFcnJvcigiSW52YWxpZCBpbnRlZ2VyOiAiK3YpfXZhciBzaWduPXZbMF09PT0iLSI7aWYoc2lnbil2PXYuc2xpY2UoMSk7dmFyIHNwbGl0PXYuc3BsaXQoL2UvaSk7aWYoc3BsaXQubGVuZ3RoPjIpdGhyb3cgbmV3IEVycm9yKCJJbnZhbGlkIGludGVnZXI6ICIrc3BsaXQuam9pbigiZSIpKTtpZihzcGxpdC5sZW5ndGg9PT0yKXt2YXIgZXhwPXNwbGl0WzFdO2lmKGV4cFswXT09PSIrIilleHA9ZXhwLnNsaWNlKDEpO2V4cD0rZXhwO2lmKGV4cCE9PXRydW5jYXRlKGV4cCl8fCFpc1ByZWNpc2UoZXhwKSl0aHJvdyBuZXcgRXJyb3IoIkludmFsaWQgaW50ZWdlcjogIitleHArIiBpcyBub3QgYSB2YWxpZCBleHBvbmVudC4iKTt2YXIgdGV4dD1zcGxpdFswXTt2YXIgZGVjaW1hbFBsYWNlPXRleHQuaW5kZXhPZigiLiIpO2lmKGRlY2ltYWxQbGFjZT49MCl7ZXhwLT10ZXh0Lmxlbmd0aC1kZWNpbWFsUGxhY2UtMTt0ZXh0PXRleHQuc2xpY2UoMCxkZWNpbWFsUGxhY2UpK3RleHQuc2xpY2UoZGVjaW1hbFBsYWNlKzEpfWlmKGV4cDwwKXRocm93IG5ldyBFcnJvcigiQ2Fubm90IGluY2x1ZGUgbmVnYXRpdmUgZXhwb25lbnQgcGFydCBmb3IgaW50ZWdlcnMiKTt0ZXh0Kz1uZXcgQXJyYXkoZXhwKzEpLmpvaW4oIjAiKTt2PXRleHR9dmFyIGlzVmFsaWQ9L14oWzAtOV1bMC05XSopJC8udGVzdCh2KTtpZighaXNWYWxpZCl0aHJvdyBuZXcgRXJyb3IoIkludmFsaWQgaW50ZWdlcjogIit2KTtpZihzdXBwb3J0c05hdGl2ZUJpZ0ludCl7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHNpZ24/Ii0iK3Y6dikpfXZhciByPVtdLG1heD12Lmxlbmd0aCxsPUxPR19CQVNFLG1pbj1tYXgtbDt3aGlsZShtYXg+MCl7ci5wdXNoKCt2LnNsaWNlKG1pbixtYXgpKTttaW4tPWw7aWYobWluPDApbWluPTA7bWF4LT1sfXRyaW0ocik7cmV0dXJuIG5ldyBCaWdJbnRlZ2VyKHIsc2lnbil9ZnVuY3Rpb24gcGFyc2VOdW1iZXJWYWx1ZSh2KXtpZihzdXBwb3J0c05hdGl2ZUJpZ0ludCl7cmV0dXJuIG5ldyBOYXRpdmVCaWdJbnQoQmlnSW50KHYpKX1pZihpc1ByZWNpc2Uodikpe2lmKHYhPT10cnVuY2F0ZSh2KSl0aHJvdyBuZXcgRXJyb3IodisiIGlzIG5vdCBhbiBpbnRlZ2VyLiIpO3JldHVybiBuZXcgU21hbGxJbnRlZ2VyKHYpfXJldHVybiBwYXJzZVN0cmluZ1ZhbHVlKHYudG9TdHJpbmcoKSl9ZnVuY3Rpb24gcGFyc2VWYWx1ZSh2KXtpZih0eXBlb2Ygdj09PSJudW1iZXIiKXtyZXR1cm4gcGFyc2VOdW1iZXJWYWx1ZSh2KX1pZih0eXBlb2Ygdj09PSJzdHJpbmciKXtyZXR1cm4gcGFyc2VTdHJpbmdWYWx1ZSh2KX1pZih0eXBlb2Ygdj09PSJiaWdpbnQiKXtyZXR1cm4gbmV3IE5hdGl2ZUJpZ0ludCh2KX1yZXR1cm4gdn1mb3IodmFyIGk9MDtpPDFlMztpKyspe0ludGVnZXJbaV09cGFyc2VWYWx1ZShpKTtpZihpPjApSW50ZWdlclstaV09cGFyc2VWYWx1ZSgtaSl9SW50ZWdlci5vbmU9SW50ZWdlclsxXTtJbnRlZ2VyLnplcm89SW50ZWdlclswXTtJbnRlZ2VyLm1pbnVzT25lPUludGVnZXJbLTFdO0ludGVnZXIubWF4PW1heDtJbnRlZ2VyLm1pbj1taW47SW50ZWdlci5nY2Q9Z2NkO0ludGVnZXIubGNtPWxjbTtJbnRlZ2VyLmlzSW5zdGFuY2U9ZnVuY3Rpb24oeCl7cmV0dXJuIHggaW5zdGFuY2VvZiBCaWdJbnRlZ2VyfHx4IGluc3RhbmNlb2YgU21hbGxJbnRlZ2VyfHx4IGluc3RhbmNlb2YgTmF0aXZlQmlnSW50fTtJbnRlZ2VyLnJhbmRCZXR3ZWVuPXJhbmRCZXR3ZWVuO0ludGVnZXIuZnJvbUFycmF5PWZ1bmN0aW9uKGRpZ2l0cyxiYXNlLGlzTmVnYXRpdmUpe3JldHVybiBwYXJzZUJhc2VGcm9tQXJyYXkoZGlnaXRzLm1hcChwYXJzZVZhbHVlKSxwYXJzZVZhbHVlKGJhc2V8fDEwKSxpc05lZ2F0aXZlKX07cmV0dXJuIEludGVnZXJ9KCk7aWYodHlwZW9mIG1vZHVsZSE9PSJ1bmRlZmluZWQiJiZtb2R1bGUuaGFzT3duUHJvcGVydHkoImV4cG9ydHMiKSl7bW9kdWxlLmV4cG9ydHM9YmlnSW50fWlmKHR5cGVvZiBkZWZpbmU9PT0iZnVuY3Rpb24iJiZkZWZpbmUuYW1kKXtkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gYmlnSW50fSl9fSx7fV0sMjY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe30se31dLDI3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oQnVmZmVyKXsidXNlIHN0cmljdCI7dmFyIGJhc2U2ND1yZXF1aXJlKCJiYXNlNjQtanMiKTt2YXIgaWVlZTc1ND1yZXF1aXJlKCJpZWVlNzU0Iik7ZXhwb3J0cy5CdWZmZXI9QnVmZmVyO2V4cG9ydHMuU2xvd0J1ZmZlcj1TbG93QnVmZmVyO2V4cG9ydHMuSU5TUEVDVF9NQVhfQllURVM9NTA7dmFyIEtfTUFYX0xFTkdUSD0yMTQ3NDgzNjQ3O2V4cG9ydHMua01heExlbmd0aD1LX01BWF9MRU5HVEg7QnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQ9dHlwZWRBcnJheVN1cHBvcnQoKTtpZighQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQmJnR5cGVvZiBjb25zb2xlIT09InVuZGVmaW5lZCImJnR5cGVvZiBjb25zb2xlLmVycm9yPT09ImZ1bmN0aW9uIil7Y29uc29sZS5lcnJvcigiVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICIrImBidWZmZXJgIHY1LnguIFVzZSBgYnVmZmVyYCB2NC54IGlmIHlvdSByZXF1aXJlIG9sZCBicm93c2VyIHN1cHBvcnQuIil9ZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQoKXt0cnl7dmFyIGFycj1uZXcgVWludDhBcnJheSgxKTthcnIuX19wcm90b19fPXtfX3Byb3RvX186VWludDhBcnJheS5wcm90b3R5cGUsZm9vOmZ1bmN0aW9uKCl7cmV0dXJuIDQyfX07cmV0dXJuIGFyci5mb28oKT09PTQyfWNhdGNoKGUpe3JldHVybiBmYWxzZX19T2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlci5wcm90b3R5cGUsInBhcmVudCIse2VudW1lcmFibGU6dHJ1ZSxnZXQ6ZnVuY3Rpb24oKXtpZighQnVmZmVyLmlzQnVmZmVyKHRoaXMpKXJldHVybiB1bmRlZmluZWQ7cmV0dXJuIHRoaXMuYnVmZmVyfX0pO09iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIucHJvdG90eXBlLCJvZmZzZXQiLHtlbnVtZXJhYmxlOnRydWUsZ2V0OmZ1bmN0aW9uKCl7aWYoIUJ1ZmZlci5pc0J1ZmZlcih0aGlzKSlyZXR1cm4gdW5kZWZpbmVkO3JldHVybiB0aGlzLmJ5dGVPZmZzZXR9fSk7ZnVuY3Rpb24gY3JlYXRlQnVmZmVyKGxlbmd0aCl7aWYobGVuZ3RoPktfTUFYX0xFTkdUSCl7dGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RoZSB2YWx1ZSAiJytsZW5ndGgrJyIgaXMgaW52YWxpZCBmb3Igb3B0aW9uICJzaXplIicpfXZhciBidWY9bmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtidWYuX19wcm90b19fPUJ1ZmZlci5wcm90b3R5cGU7cmV0dXJuIGJ1Zn1mdW5jdGlvbiBCdWZmZXIoYXJnLGVuY29kaW5nT3JPZmZzZXQsbGVuZ3RoKXtpZih0eXBlb2YgYXJnPT09Im51bWJlciIpe2lmKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0PT09InN0cmluZyIpe3Rocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSAic3RyaW5nIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgc3RyaW5nLiBSZWNlaXZlZCB0eXBlIG51bWJlcicpfXJldHVybiBhbGxvY1Vuc2FmZShhcmcpfXJldHVybiBmcm9tKGFyZyxlbmNvZGluZ09yT2Zmc2V0LGxlbmd0aCl9aWYodHlwZW9mIFN5bWJvbCE9PSJ1bmRlZmluZWQiJiZTeW1ib2wuc3BlY2llcyE9bnVsbCYmQnVmZmVyW1N5bWJvbC5zcGVjaWVzXT09PUJ1ZmZlcil7T2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlcixTeW1ib2wuc3BlY2llcyx7dmFsdWU6bnVsbCxjb25maWd1cmFibGU6dHJ1ZSxlbnVtZXJhYmxlOmZhbHNlLHdyaXRhYmxlOmZhbHNlfSl9QnVmZmVyLnBvb2xTaXplPTgxOTI7ZnVuY3Rpb24gZnJvbSh2YWx1ZSxlbmNvZGluZ09yT2Zmc2V0LGxlbmd0aCl7aWYodHlwZW9mIHZhbHVlPT09InN0cmluZyIpe3JldHVybiBmcm9tU3RyaW5nKHZhbHVlLGVuY29kaW5nT3JPZmZzZXQpfWlmKEFycmF5QnVmZmVyLmlzVmlldyh2YWx1ZSkpe3JldHVybiBmcm9tQXJyYXlMaWtlKHZhbHVlKX1pZih2YWx1ZT09bnVsbCl7dGhyb3cgVHlwZUVycm9yKCJUaGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCAiKyJvciBBcnJheS1saWtlIE9iamVjdC4gUmVjZWl2ZWQgdHlwZSAiK3R5cGVvZiB2YWx1ZSl9aWYoaXNJbnN0YW5jZSh2YWx1ZSxBcnJheUJ1ZmZlcil8fHZhbHVlJiZpc0luc3RhbmNlKHZhbHVlLmJ1ZmZlcixBcnJheUJ1ZmZlcikpe3JldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsZW5jb2RpbmdPck9mZnNldCxsZW5ndGgpfWlmKHR5cGVvZiB2YWx1ZT09PSJudW1iZXIiKXt0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgInZhbHVlIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSBudW1iZXInKX12YXIgdmFsdWVPZj12YWx1ZS52YWx1ZU9mJiZ2YWx1ZS52YWx1ZU9mKCk7aWYodmFsdWVPZiE9bnVsbCYmdmFsdWVPZiE9PXZhbHVlKXtyZXR1cm4gQnVmZmVyLmZyb20odmFsdWVPZixlbmNvZGluZ09yT2Zmc2V0LGxlbmd0aCl9dmFyIGI9ZnJvbU9iamVjdCh2YWx1ZSk7aWYoYilyZXR1cm4gYjtpZih0eXBlb2YgU3ltYm9sIT09InVuZGVmaW5lZCImJlN5bWJvbC50b1ByaW1pdGl2ZSE9bnVsbCYmdHlwZW9mIHZhbHVlW1N5bWJvbC50b1ByaW1pdGl2ZV09PT0iZnVuY3Rpb24iKXtyZXR1cm4gQnVmZmVyLmZyb20odmFsdWVbU3ltYm9sLnRvUHJpbWl0aXZlXSgic3RyaW5nIiksZW5jb2RpbmdPck9mZnNldCxsZW5ndGgpfXRocm93IG5ldyBUeXBlRXJyb3IoIlRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIG9uZSBvZiB0eXBlIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksICIrIm9yIEFycmF5LWxpa2UgT2JqZWN0LiBSZWNlaXZlZCB0eXBlICIrdHlwZW9mIHZhbHVlKX1CdWZmZXIuZnJvbT1mdW5jdGlvbih2YWx1ZSxlbmNvZGluZ09yT2Zmc2V0LGxlbmd0aCl7cmV0dXJuIGZyb20odmFsdWUsZW5jb2RpbmdPck9mZnNldCxsZW5ndGgpfTtCdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXz1VaW50OEFycmF5LnByb3RvdHlwZTtCdWZmZXIuX19wcm90b19fPVVpbnQ4QXJyYXk7ZnVuY3Rpb24gYXNzZXJ0U2l6ZShzaXplKXtpZih0eXBlb2Ygc2l6ZSE9PSJudW1iZXIiKXt0aHJvdyBuZXcgVHlwZUVycm9yKCcic2l6ZSIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIG51bWJlcicpfWVsc2UgaWYoc2l6ZTwwKXt0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlICInK3NpemUrJyIgaXMgaW52YWxpZCBmb3Igb3B0aW9uICJzaXplIicpfX1mdW5jdGlvbiBhbGxvYyhzaXplLGZpbGwsZW5jb2Rpbmcpe2Fzc2VydFNpemUoc2l6ZSk7aWYoc2l6ZTw9MCl7cmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplKX1pZihmaWxsIT09dW5kZWZpbmVkKXtyZXR1cm4gdHlwZW9mIGVuY29kaW5nPT09InN0cmluZyI/Y3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbCxlbmNvZGluZyk6Y3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbCl9cmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplKX1CdWZmZXIuYWxsb2M9ZnVuY3Rpb24oc2l6ZSxmaWxsLGVuY29kaW5nKXtyZXR1cm4gYWxsb2Moc2l6ZSxmaWxsLGVuY29kaW5nKX07ZnVuY3Rpb24gYWxsb2NVbnNhZmUoc2l6ZSl7YXNzZXJ0U2l6ZShzaXplKTtyZXR1cm4gY3JlYXRlQnVmZmVyKHNpemU8MD8wOmNoZWNrZWQoc2l6ZSl8MCl9QnVmZmVyLmFsbG9jVW5zYWZlPWZ1bmN0aW9uKHNpemUpe3JldHVybiBhbGxvY1Vuc2FmZShzaXplKX07QnVmZmVyLmFsbG9jVW5zYWZlU2xvdz1mdW5jdGlvbihzaXplKXtyZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSl9O2Z1bmN0aW9uIGZyb21TdHJpbmcoc3RyaW5nLGVuY29kaW5nKXtpZih0eXBlb2YgZW5jb2RpbmchPT0ic3RyaW5nInx8ZW5jb2Rpbmc9PT0iIil7ZW5jb2Rpbmc9InV0ZjgifWlmKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpe3Rocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gZW5jb2Rpbmc6ICIrZW5jb2RpbmcpfXZhciBsZW5ndGg9Ynl0ZUxlbmd0aChzdHJpbmcsZW5jb2RpbmcpfDA7dmFyIGJ1Zj1jcmVhdGVCdWZmZXIobGVuZ3RoKTt2YXIgYWN0dWFsPWJ1Zi53cml0ZShzdHJpbmcsZW5jb2RpbmcpO2lmKGFjdHVhbCE9PWxlbmd0aCl7YnVmPWJ1Zi5zbGljZSgwLGFjdHVhbCl9cmV0dXJuIGJ1Zn1mdW5jdGlvbiBmcm9tQXJyYXlMaWtlKGFycmF5KXt2YXIgbGVuZ3RoPWFycmF5Lmxlbmd0aDwwPzA6Y2hlY2tlZChhcnJheS5sZW5ndGgpfDA7dmFyIGJ1Zj1jcmVhdGVCdWZmZXIobGVuZ3RoKTtmb3IodmFyIGk9MDtpPGxlbmd0aDtpKz0xKXtidWZbaV09YXJyYXlbaV0mMjU1fXJldHVybiBidWZ9ZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyKGFycmF5LGJ5dGVPZmZzZXQsbGVuZ3RoKXtpZihieXRlT2Zmc2V0PDB8fGFycmF5LmJ5dGVMZW5ndGg8Ynl0ZU9mZnNldCl7dGhyb3cgbmV3IFJhbmdlRXJyb3IoJyJvZmZzZXQiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpfWlmKGFycmF5LmJ5dGVMZW5ndGg8Ynl0ZU9mZnNldCsobGVuZ3RofHwwKSl7dGhyb3cgbmV3IFJhbmdlRXJyb3IoJyJsZW5ndGgiIGlzIG91dHNpZGUgb2YgYnVmZmVyIGJvdW5kcycpfXZhciBidWY7aWYoYnl0ZU9mZnNldD09PXVuZGVmaW5lZCYmbGVuZ3RoPT09dW5kZWZpbmVkKXtidWY9bmV3IFVpbnQ4QXJyYXkoYXJyYXkpfWVsc2UgaWYobGVuZ3RoPT09dW5kZWZpbmVkKXtidWY9bmV3IFVpbnQ4QXJyYXkoYXJyYXksYnl0ZU9mZnNldCl9ZWxzZXtidWY9bmV3IFVpbnQ4QXJyYXkoYXJyYXksYnl0ZU9mZnNldCxsZW5ndGgpfWJ1Zi5fX3Byb3RvX189QnVmZmVyLnByb3RvdHlwZTtyZXR1cm4gYnVmfWZ1bmN0aW9uIGZyb21PYmplY3Qob2JqKXtpZihCdWZmZXIuaXNCdWZmZXIob2JqKSl7dmFyIGxlbj1jaGVja2VkKG9iai5sZW5ndGgpfDA7dmFyIGJ1Zj1jcmVhdGVCdWZmZXIobGVuKTtpZihidWYubGVuZ3RoPT09MCl7cmV0dXJuIGJ1Zn1vYmouY29weShidWYsMCwwLGxlbik7cmV0dXJuIGJ1Zn1pZihvYmoubGVuZ3RoIT09dW5kZWZpbmVkKXtpZih0eXBlb2Ygb2JqLmxlbmd0aCE9PSJudW1iZXIifHxudW1iZXJJc05hTihvYmoubGVuZ3RoKSl7cmV0dXJuIGNyZWF0ZUJ1ZmZlcigwKX1yZXR1cm4gZnJvbUFycmF5TGlrZShvYmopfWlmKG9iai50eXBlPT09IkJ1ZmZlciImJkFycmF5LmlzQXJyYXkob2JqLmRhdGEpKXtyZXR1cm4gZnJvbUFycmF5TGlrZShvYmouZGF0YSl9fWZ1bmN0aW9uIGNoZWNrZWQobGVuZ3RoKXtpZihsZW5ndGg+PUtfTUFYX0xFTkdUSCl7dGhyb3cgbmV3IFJhbmdlRXJyb3IoIkF0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gIisic2l6ZTogMHgiK0tfTUFYX0xFTkdUSC50b1N0cmluZygxNikrIiBieXRlcyIpfXJldHVybiBsZW5ndGh8MH1mdW5jdGlvbiBTbG93QnVmZmVyKGxlbmd0aCl7aWYoK2xlbmd0aCE9bGVuZ3RoKXtsZW5ndGg9MH1yZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpfUJ1ZmZlci5pc0J1ZmZlcj1mdW5jdGlvbiBpc0J1ZmZlcihiKXtyZXR1cm4gYiE9bnVsbCYmYi5faXNCdWZmZXI9PT10cnVlJiZiIT09QnVmZmVyLnByb3RvdHlwZX07QnVmZmVyLmNvbXBhcmU9ZnVuY3Rpb24gY29tcGFyZShhLGIpe2lmKGlzSW5zdGFuY2UoYSxVaW50OEFycmF5KSlhPUJ1ZmZlci5mcm9tKGEsYS5vZmZzZXQsYS5ieXRlTGVuZ3RoKTtpZihpc0luc3RhbmNlKGIsVWludDhBcnJheSkpYj1CdWZmZXIuZnJvbShiLGIub2Zmc2V0LGIuYnl0ZUxlbmd0aCk7aWYoIUJ1ZmZlci5pc0J1ZmZlcihhKXx8IUJ1ZmZlci5pc0J1ZmZlcihiKSl7dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlICJidWYxIiwgImJ1ZjIiIGFyZ3VtZW50cyBtdXN0IGJlIG9uZSBvZiB0eXBlIEJ1ZmZlciBvciBVaW50OEFycmF5Jyl9aWYoYT09PWIpcmV0dXJuIDA7dmFyIHg9YS5sZW5ndGg7dmFyIHk9Yi5sZW5ndGg7Zm9yKHZhciBpPTAsbGVuPU1hdGgubWluKHgseSk7aTxsZW47KytpKXtpZihhW2ldIT09YltpXSl7eD1hW2ldO3k9YltpXTticmVha319aWYoeDx5KXJldHVybi0xO2lmKHk8eClyZXR1cm4gMTtyZXR1cm4gMH07QnVmZmVyLmlzRW5jb2Rpbmc9ZnVuY3Rpb24gaXNFbmNvZGluZyhlbmNvZGluZyl7c3dpdGNoKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSl7Y2FzZSJoZXgiOmNhc2UidXRmOCI6Y2FzZSJ1dGYtOCI6Y2FzZSJhc2NpaSI6Y2FzZSJsYXRpbjEiOmNhc2UiYmluYXJ5IjpjYXNlImJhc2U2NCI6Y2FzZSJ1Y3MyIjpjYXNlInVjcy0yIjpjYXNlInV0ZjE2bGUiOmNhc2UidXRmLTE2bGUiOnJldHVybiB0cnVlO2RlZmF1bHQ6cmV0dXJuIGZhbHNlfX07QnVmZmVyLmNvbmNhdD1mdW5jdGlvbiBjb25jYXQobGlzdCxsZW5ndGgpe2lmKCFBcnJheS5pc0FycmF5KGxpc3QpKXt0aHJvdyBuZXcgVHlwZUVycm9yKCcibGlzdCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJyl9aWYobGlzdC5sZW5ndGg9PT0wKXtyZXR1cm4gQnVmZmVyLmFsbG9jKDApfXZhciBpO2lmKGxlbmd0aD09PXVuZGVmaW5lZCl7bGVuZ3RoPTA7Zm9yKGk9MDtpPGxpc3QubGVuZ3RoOysraSl7bGVuZ3RoKz1saXN0W2ldLmxlbmd0aH19dmFyIGJ1ZmZlcj1CdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKTt2YXIgcG9zPTA7Zm9yKGk9MDtpPGxpc3QubGVuZ3RoOysraSl7dmFyIGJ1Zj1saXN0W2ldO2lmKGlzSW5zdGFuY2UoYnVmLFVpbnQ4QXJyYXkpKXtidWY9QnVmZmVyLmZyb20oYnVmKX1pZighQnVmZmVyLmlzQnVmZmVyKGJ1Zikpe3Rocm93IG5ldyBUeXBlRXJyb3IoJyJsaXN0IiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKX1idWYuY29weShidWZmZXIscG9zKTtwb3MrPWJ1Zi5sZW5ndGh9cmV0dXJuIGJ1ZmZlcn07ZnVuY3Rpb24gYnl0ZUxlbmd0aChzdHJpbmcsZW5jb2Rpbmcpe2lmKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKXtyZXR1cm4gc3RyaW5nLmxlbmd0aH1pZihBcnJheUJ1ZmZlci5pc1ZpZXcoc3RyaW5nKXx8aXNJbnN0YW5jZShzdHJpbmcsQXJyYXlCdWZmZXIpKXtyZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGh9aWYodHlwZW9mIHN0cmluZyE9PSJzdHJpbmciKXt0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgInN0cmluZyIgYXJndW1lbnQgbXVzdCBiZSBvbmUgb2YgdHlwZSBzdHJpbmcsIEJ1ZmZlciwgb3IgQXJyYXlCdWZmZXIuICcrIlJlY2VpdmVkIHR5cGUgIit0eXBlb2Ygc3RyaW5nKX12YXIgbGVuPXN0cmluZy5sZW5ndGg7dmFyIG11c3RNYXRjaD1hcmd1bWVudHMubGVuZ3RoPjImJmFyZ3VtZW50c1syXT09PXRydWU7aWYoIW11c3RNYXRjaCYmbGVuPT09MClyZXR1cm4gMDt2YXIgbG93ZXJlZENhc2U9ZmFsc2U7Zm9yKDs7KXtzd2l0Y2goZW5jb2Rpbmcpe2Nhc2UiYXNjaWkiOmNhc2UibGF0aW4xIjpjYXNlImJpbmFyeSI6cmV0dXJuIGxlbjtjYXNlInV0ZjgiOmNhc2UidXRmLTgiOnJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aDtjYXNlInVjczIiOmNhc2UidWNzLTIiOmNhc2UidXRmMTZsZSI6Y2FzZSJ1dGYtMTZsZSI6cmV0dXJuIGxlbioyO2Nhc2UiaGV4IjpyZXR1cm4gbGVuPj4+MTtjYXNlImJhc2U2NCI6cmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGg7ZGVmYXVsdDppZihsb3dlcmVkQ2FzZSl7cmV0dXJuIG11c3RNYXRjaD8tMTp1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aH1lbmNvZGluZz0oIiIrZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCk7bG93ZXJlZENhc2U9dHJ1ZX19fUJ1ZmZlci5ieXRlTGVuZ3RoPWJ5dGVMZW5ndGg7ZnVuY3Rpb24gc2xvd1RvU3RyaW5nKGVuY29kaW5nLHN0YXJ0LGVuZCl7dmFyIGxvd2VyZWRDYXNlPWZhbHNlO2lmKHN0YXJ0PT09dW5kZWZpbmVkfHxzdGFydDwwKXtzdGFydD0wfWlmKHN0YXJ0PnRoaXMubGVuZ3RoKXtyZXR1cm4iIn1pZihlbmQ9PT11bmRlZmluZWR8fGVuZD50aGlzLmxlbmd0aCl7ZW5kPXRoaXMubGVuZ3RofWlmKGVuZDw9MCl7cmV0dXJuIiJ9ZW5kPj4+PTA7c3RhcnQ+Pj49MDtpZihlbmQ8PXN0YXJ0KXtyZXR1cm4iIn1pZighZW5jb2RpbmcpZW5jb2Rpbmc9InV0ZjgiO3doaWxlKHRydWUpe3N3aXRjaChlbmNvZGluZyl7Y2FzZSJoZXgiOnJldHVybiBoZXhTbGljZSh0aGlzLHN0YXJ0LGVuZCk7Y2FzZSJ1dGY4IjpjYXNlInV0Zi04IjpyZXR1cm4gdXRmOFNsaWNlKHRoaXMsc3RhcnQsZW5kKTtjYXNlImFzY2lpIjpyZXR1cm4gYXNjaWlTbGljZSh0aGlzLHN0YXJ0LGVuZCk7Y2FzZSJsYXRpbjEiOmNhc2UiYmluYXJ5IjpyZXR1cm4gbGF0aW4xU2xpY2UodGhpcyxzdGFydCxlbmQpO2Nhc2UiYmFzZTY0IjpyZXR1cm4gYmFzZTY0U2xpY2UodGhpcyxzdGFydCxlbmQpO2Nhc2UidWNzMiI6Y2FzZSJ1Y3MtMiI6Y2FzZSJ1dGYxNmxlIjpjYXNlInV0Zi0xNmxlIjpyZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsc3RhcnQsZW5kKTtkZWZhdWx0OmlmKGxvd2VyZWRDYXNlKXRocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gZW5jb2Rpbmc6ICIrZW5jb2RpbmcpO2VuY29kaW5nPShlbmNvZGluZysiIikudG9Mb3dlckNhc2UoKTtsb3dlcmVkQ2FzZT10cnVlfX19QnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXI9dHJ1ZTtmdW5jdGlvbiBzd2FwKGIsbixtKXt2YXIgaT1iW25dO2Jbbl09YlttXTtiW21dPWl9QnVmZmVyLnByb3RvdHlwZS5zd2FwMTY9ZnVuY3Rpb24gc3dhcDE2KCl7dmFyIGxlbj10aGlzLmxlbmd0aDtpZihsZW4lMiE9PTApe3Rocm93IG5ldyBSYW5nZUVycm9yKCJCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cyIpfWZvcih2YXIgaT0wO2k8bGVuO2krPTIpe3N3YXAodGhpcyxpLGkrMSl9cmV0dXJuIHRoaXN9O0J1ZmZlci5wcm90b3R5cGUuc3dhcDMyPWZ1bmN0aW9uIHN3YXAzMigpe3ZhciBsZW49dGhpcy5sZW5ndGg7aWYobGVuJTQhPT0wKXt0aHJvdyBuZXcgUmFuZ2VFcnJvcigiQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMiKX1mb3IodmFyIGk9MDtpPGxlbjtpKz00KXtzd2FwKHRoaXMsaSxpKzMpO3N3YXAodGhpcyxpKzEsaSsyKX1yZXR1cm4gdGhpc307QnVmZmVyLnByb3RvdHlwZS5zd2FwNjQ9ZnVuY3Rpb24gc3dhcDY0KCl7dmFyIGxlbj10aGlzLmxlbmd0aDtpZihsZW4lOCE9PTApe3Rocm93IG5ldyBSYW5nZUVycm9yKCJCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cyIpfWZvcih2YXIgaT0wO2k8bGVuO2krPTgpe3N3YXAodGhpcyxpLGkrNyk7c3dhcCh0aGlzLGkrMSxpKzYpO3N3YXAodGhpcyxpKzIsaSs1KTtzd2FwKHRoaXMsaSszLGkrNCl9cmV0dXJuIHRoaXN9O0J1ZmZlci5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24gdG9TdHJpbmcoKXt2YXIgbGVuZ3RoPXRoaXMubGVuZ3RoO2lmKGxlbmd0aD09PTApcmV0dXJuIiI7aWYoYXJndW1lbnRzLmxlbmd0aD09PTApcmV0dXJuIHV0ZjhTbGljZSh0aGlzLDAsbGVuZ3RoKTtyZXR1cm4gc2xvd1RvU3RyaW5nLmFwcGx5KHRoaXMsYXJndW1lbnRzKX07QnVmZmVyLnByb3RvdHlwZS50b0xvY2FsZVN0cmluZz1CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nO0J1ZmZlci5wcm90b3R5cGUuZXF1YWxzPWZ1bmN0aW9uIGVxdWFscyhiKXtpZighQnVmZmVyLmlzQnVmZmVyKGIpKXRocm93IG5ldyBUeXBlRXJyb3IoIkFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIiKTtpZih0aGlzPT09YilyZXR1cm4gdHJ1ZTtyZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcyxiKT09PTB9O0J1ZmZlci5wcm90b3R5cGUuaW5zcGVjdD1mdW5jdGlvbiBpbnNwZWN0KCl7dmFyIHN0cj0iIjt2YXIgbWF4PWV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVM7c3RyPXRoaXMudG9TdHJpbmcoImhleCIsMCxtYXgpLnJlcGxhY2UoLyguezJ9KS9nLCIkMSAiKS50cmltKCk7aWYodGhpcy5sZW5ndGg+bWF4KXN0cis9IiAuLi4gIjtyZXR1cm4iPEJ1ZmZlciAiK3N0cisiPiJ9O0J1ZmZlci5wcm90b3R5cGUuY29tcGFyZT1mdW5jdGlvbiBjb21wYXJlKHRhcmdldCxzdGFydCxlbmQsdGhpc1N0YXJ0LHRoaXNFbmQpe2lmKGlzSW5zdGFuY2UodGFyZ2V0LFVpbnQ4QXJyYXkpKXt0YXJnZXQ9QnVmZmVyLmZyb20odGFyZ2V0LHRhcmdldC5vZmZzZXQsdGFyZ2V0LmJ5dGVMZW5ndGgpfWlmKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSl7dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlICJ0YXJnZXQiIGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgQnVmZmVyIG9yIFVpbnQ4QXJyYXkuICcrIlJlY2VpdmVkIHR5cGUgIit0eXBlb2YgdGFyZ2V0KX1pZihzdGFydD09PXVuZGVmaW5lZCl7c3RhcnQ9MH1pZihlbmQ9PT11bmRlZmluZWQpe2VuZD10YXJnZXQ/dGFyZ2V0Lmxlbmd0aDowfWlmKHRoaXNTdGFydD09PXVuZGVmaW5lZCl7dGhpc1N0YXJ0PTB9aWYodGhpc0VuZD09PXVuZGVmaW5lZCl7dGhpc0VuZD10aGlzLmxlbmd0aH1pZihzdGFydDwwfHxlbmQ+dGFyZ2V0Lmxlbmd0aHx8dGhpc1N0YXJ0PDB8fHRoaXNFbmQ+dGhpcy5sZW5ndGgpe3Rocm93IG5ldyBSYW5nZUVycm9yKCJvdXQgb2YgcmFuZ2UgaW5kZXgiKX1pZih0aGlzU3RhcnQ+PXRoaXNFbmQmJnN0YXJ0Pj1lbmQpe3JldHVybiAwfWlmKHRoaXNTdGFydD49dGhpc0VuZCl7cmV0dXJuLTF9aWYoc3RhcnQ+PWVuZCl7cmV0dXJuIDF9c3RhcnQ+Pj49MDtlbmQ+Pj49MDt0aGlzU3RhcnQ+Pj49MDt0aGlzRW5kPj4+PTA7aWYodGhpcz09PXRhcmdldClyZXR1cm4gMDt2YXIgeD10aGlzRW5kLXRoaXNTdGFydDt2YXIgeT1lbmQtc3RhcnQ7dmFyIGxlbj1NYXRoLm1pbih4LHkpO3ZhciB0aGlzQ29weT10aGlzLnNsaWNlKHRoaXNTdGFydCx0aGlzRW5kKTt2YXIgdGFyZ2V0Q29weT10YXJnZXQuc2xpY2Uoc3RhcnQsZW5kKTtmb3IodmFyIGk9MDtpPGxlbjsrK2kpe2lmKHRoaXNDb3B5W2ldIT09dGFyZ2V0Q29weVtpXSl7eD10aGlzQ29weVtpXTt5PXRhcmdldENvcHlbaV07YnJlYWt9fWlmKHg8eSlyZXR1cm4tMTtpZih5PHgpcmV0dXJuIDE7cmV0dXJuIDB9O2Z1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mKGJ1ZmZlcix2YWwsYnl0ZU9mZnNldCxlbmNvZGluZyxkaXIpe2lmKGJ1ZmZlci5sZW5ndGg9PT0wKXJldHVybi0xO2lmKHR5cGVvZiBieXRlT2Zmc2V0PT09InN0cmluZyIpe2VuY29kaW5nPWJ5dGVPZmZzZXQ7Ynl0ZU9mZnNldD0wfWVsc2UgaWYoYnl0ZU9mZnNldD4yMTQ3NDgzNjQ3KXtieXRlT2Zmc2V0PTIxNDc0ODM2NDd9ZWxzZSBpZihieXRlT2Zmc2V0PC0yMTQ3NDgzNjQ4KXtieXRlT2Zmc2V0PS0yMTQ3NDgzNjQ4fWJ5dGVPZmZzZXQ9K2J5dGVPZmZzZXQ7aWYobnVtYmVySXNOYU4oYnl0ZU9mZnNldCkpe2J5dGVPZmZzZXQ9ZGlyPzA6YnVmZmVyLmxlbmd0aC0xfWlmKGJ5dGVPZmZzZXQ8MClieXRlT2Zmc2V0PWJ1ZmZlci5sZW5ndGgrYnl0ZU9mZnNldDtpZihieXRlT2Zmc2V0Pj1idWZmZXIubGVuZ3RoKXtpZihkaXIpcmV0dXJuLTE7ZWxzZSBieXRlT2Zmc2V0PWJ1ZmZlci5sZW5ndGgtMX1lbHNlIGlmKGJ5dGVPZmZzZXQ8MCl7aWYoZGlyKWJ5dGVPZmZzZXQ9MDtlbHNlIHJldHVybi0xfWlmKHR5cGVvZiB2YWw9PT0ic3RyaW5nIil7dmFsPUJ1ZmZlci5mcm9tKHZhbCxlbmNvZGluZyl9aWYoQnVmZmVyLmlzQnVmZmVyKHZhbCkpe2lmKHZhbC5sZW5ndGg9PT0wKXtyZXR1cm4tMX1yZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlcix2YWwsYnl0ZU9mZnNldCxlbmNvZGluZyxkaXIpfWVsc2UgaWYodHlwZW9mIHZhbD09PSJudW1iZXIiKXt2YWw9dmFsJjI1NTtpZih0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZj09PSJmdW5jdGlvbiIpe2lmKGRpcil7cmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsdmFsLGJ5dGVPZmZzZXQpfWVsc2V7cmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLHZhbCxieXRlT2Zmc2V0KX19cmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsW3ZhbF0sYnl0ZU9mZnNldCxlbmNvZGluZyxkaXIpfXRocm93IG5ldyBUeXBlRXJyb3IoInZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlciIpfWZ1bmN0aW9uIGFycmF5SW5kZXhPZihhcnIsdmFsLGJ5dGVPZmZzZXQsZW5jb2RpbmcsZGlyKXt2YXIgaW5kZXhTaXplPTE7dmFyIGFyckxlbmd0aD1hcnIubGVuZ3RoO3ZhciB2YWxMZW5ndGg9dmFsLmxlbmd0aDtpZihlbmNvZGluZyE9PXVuZGVmaW5lZCl7ZW5jb2Rpbmc9U3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpO2lmKGVuY29kaW5nPT09InVjczIifHxlbmNvZGluZz09PSJ1Y3MtMiJ8fGVuY29kaW5nPT09InV0ZjE2bGUifHxlbmNvZGluZz09PSJ1dGYtMTZsZSIpe2lmKGFyci5sZW5ndGg8Mnx8dmFsLmxlbmd0aDwyKXtyZXR1cm4tMX1pbmRleFNpemU9MjthcnJMZW5ndGgvPTI7dmFsTGVuZ3RoLz0yO2J5dGVPZmZzZXQvPTJ9fWZ1bmN0aW9uIHJlYWQoYnVmLGkpe2lmKGluZGV4U2l6ZT09PTEpe3JldHVybiBidWZbaV19ZWxzZXtyZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpKmluZGV4U2l6ZSl9fXZhciBpO2lmKGRpcil7dmFyIGZvdW5kSW5kZXg9LTE7Zm9yKGk9Ynl0ZU9mZnNldDtpPGFyckxlbmd0aDtpKyspe2lmKHJlYWQoYXJyLGkpPT09cmVhZCh2YWwsZm91bmRJbmRleD09PS0xPzA6aS1mb3VuZEluZGV4KSl7aWYoZm91bmRJbmRleD09PS0xKWZvdW5kSW5kZXg9aTtpZihpLWZvdW5kSW5kZXgrMT09PXZhbExlbmd0aClyZXR1cm4gZm91bmRJbmRleCppbmRleFNpemV9ZWxzZXtpZihmb3VuZEluZGV4IT09LTEpaS09aS1mb3VuZEluZGV4O2ZvdW5kSW5kZXg9LTF9fX1lbHNle2lmKGJ5dGVPZmZzZXQrdmFsTGVuZ3RoPmFyckxlbmd0aClieXRlT2Zmc2V0PWFyckxlbmd0aC12YWxMZW5ndGg7Zm9yKGk9Ynl0ZU9mZnNldDtpPj0wO2ktLSl7dmFyIGZvdW5kPXRydWU7Zm9yKHZhciBqPTA7ajx2YWxMZW5ndGg7aisrKXtpZihyZWFkKGFycixpK2opIT09cmVhZCh2YWwsaikpe2ZvdW5kPWZhbHNlO2JyZWFrfX1pZihmb3VuZClyZXR1cm4gaX19cmV0dXJuLTF9QnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcz1mdW5jdGlvbiBpbmNsdWRlcyh2YWwsYnl0ZU9mZnNldCxlbmNvZGluZyl7cmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsYnl0ZU9mZnNldCxlbmNvZGluZykhPT0tMX07QnVmZmVyLnByb3RvdHlwZS5pbmRleE9mPWZ1bmN0aW9uIGluZGV4T2YodmFsLGJ5dGVPZmZzZXQsZW5jb2Rpbmcpe3JldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLHZhbCxieXRlT2Zmc2V0LGVuY29kaW5nLHRydWUpfTtCdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mPWZ1bmN0aW9uIGxhc3RJbmRleE9mKHZhbCxieXRlT2Zmc2V0LGVuY29kaW5nKXtyZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcyx2YWwsYnl0ZU9mZnNldCxlbmNvZGluZyxmYWxzZSl9O2Z1bmN0aW9uIGhleFdyaXRlKGJ1ZixzdHJpbmcsb2Zmc2V0LGxlbmd0aCl7b2Zmc2V0PU51bWJlcihvZmZzZXQpfHwwO3ZhciByZW1haW5pbmc9YnVmLmxlbmd0aC1vZmZzZXQ7aWYoIWxlbmd0aCl7bGVuZ3RoPXJlbWFpbmluZ31lbHNle2xlbmd0aD1OdW1iZXIobGVuZ3RoKTtpZihsZW5ndGg+cmVtYWluaW5nKXtsZW5ndGg9cmVtYWluaW5nfX12YXIgc3RyTGVuPXN0cmluZy5sZW5ndGg7aWYobGVuZ3RoPnN0ckxlbi8yKXtsZW5ndGg9c3RyTGVuLzJ9Zm9yKHZhciBpPTA7aTxsZW5ndGg7KytpKXt2YXIgcGFyc2VkPXBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSoyLDIpLDE2KTtpZihudW1iZXJJc05hTihwYXJzZWQpKXJldHVybiBpO2J1ZltvZmZzZXQraV09cGFyc2VkfXJldHVybiBpfWZ1bmN0aW9uIHV0ZjhXcml0ZShidWYsc3RyaW5nLG9mZnNldCxsZW5ndGgpe3JldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyxidWYubGVuZ3RoLW9mZnNldCksYnVmLG9mZnNldCxsZW5ndGgpfWZ1bmN0aW9uIGFzY2lpV3JpdGUoYnVmLHN0cmluZyxvZmZzZXQsbGVuZ3RoKXtyZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSxidWYsb2Zmc2V0LGxlbmd0aCl9ZnVuY3Rpb24gbGF0aW4xV3JpdGUoYnVmLHN0cmluZyxvZmZzZXQsbGVuZ3RoKXtyZXR1cm4gYXNjaWlXcml0ZShidWYsc3RyaW5nLG9mZnNldCxsZW5ndGgpfWZ1bmN0aW9uIGJhc2U2NFdyaXRlKGJ1ZixzdHJpbmcsb2Zmc2V0LGxlbmd0aCl7cmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLGJ1ZixvZmZzZXQsbGVuZ3RoKX1mdW5jdGlvbiB1Y3MyV3JpdGUoYnVmLHN0cmluZyxvZmZzZXQsbGVuZ3RoKXtyZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsYnVmLmxlbmd0aC1vZmZzZXQpLGJ1ZixvZmZzZXQsbGVuZ3RoKX1CdWZmZXIucHJvdG90eXBlLndyaXRlPWZ1bmN0aW9uIHdyaXRlKHN0cmluZyxvZmZzZXQsbGVuZ3RoLGVuY29kaW5nKXtpZihvZmZzZXQ9PT11bmRlZmluZWQpe2VuY29kaW5nPSJ1dGY4IjtsZW5ndGg9dGhpcy5sZW5ndGg7b2Zmc2V0PTB9ZWxzZSBpZihsZW5ndGg9PT11bmRlZmluZWQmJnR5cGVvZiBvZmZzZXQ9PT0ic3RyaW5nIil7ZW5jb2Rpbmc9b2Zmc2V0O2xlbmd0aD10aGlzLmxlbmd0aDtvZmZzZXQ9MH1lbHNlIGlmKGlzRmluaXRlKG9mZnNldCkpe29mZnNldD1vZmZzZXQ+Pj4wO2lmKGlzRmluaXRlKGxlbmd0aCkpe2xlbmd0aD1sZW5ndGg+Pj4wO2lmKGVuY29kaW5nPT09dW5kZWZpbmVkKWVuY29kaW5nPSJ1dGY4In1lbHNle2VuY29kaW5nPWxlbmd0aDtsZW5ndGg9dW5kZWZpbmVkfX1lbHNle3Rocm93IG5ldyBFcnJvcigiQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQiKX12YXIgcmVtYWluaW5nPXRoaXMubGVuZ3RoLW9mZnNldDtpZihsZW5ndGg9PT11bmRlZmluZWR8fGxlbmd0aD5yZW1haW5pbmcpbGVuZ3RoPXJlbWFpbmluZztpZihzdHJpbmcubGVuZ3RoPjAmJihsZW5ndGg8MHx8b2Zmc2V0PDApfHxvZmZzZXQ+dGhpcy5sZW5ndGgpe3Rocm93IG5ldyBSYW5nZUVycm9yKCJBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcyIpfWlmKCFlbmNvZGluZyllbmNvZGluZz0idXRmOCI7dmFyIGxvd2VyZWRDYXNlPWZhbHNlO2Zvcig7Oyl7c3dpdGNoKGVuY29kaW5nKXtjYXNlImhleCI6cmV0dXJuIGhleFdyaXRlKHRoaXMsc3RyaW5nLG9mZnNldCxsZW5ndGgpO2Nhc2UidXRmOCI6Y2FzZSJ1dGYtOCI6cmV0dXJuIHV0ZjhXcml0ZSh0aGlzLHN0cmluZyxvZmZzZXQsbGVuZ3RoKTtjYXNlImFzY2lpIjpyZXR1cm4gYXNjaWlXcml0ZSh0aGlzLHN0cmluZyxvZmZzZXQsbGVuZ3RoKTtjYXNlImxhdGluMSI6Y2FzZSJiaW5hcnkiOnJldHVybiBsYXRpbjFXcml0ZSh0aGlzLHN0cmluZyxvZmZzZXQsbGVuZ3RoKTtjYXNlImJhc2U2NCI6cmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsc3RyaW5nLG9mZnNldCxsZW5ndGgpO2Nhc2UidWNzMiI6Y2FzZSJ1Y3MtMiI6Y2FzZSJ1dGYxNmxlIjpjYXNlInV0Zi0xNmxlIjpyZXR1cm4gdWNzMldyaXRlKHRoaXMsc3RyaW5nLG9mZnNldCxsZW5ndGgpO2RlZmF1bHQ6aWYobG93ZXJlZENhc2UpdGhyb3cgbmV3IFR5cGVFcnJvcigiVW5rbm93biBlbmNvZGluZzogIitlbmNvZGluZyk7ZW5jb2Rpbmc9KCIiK2VuY29kaW5nKS50b0xvd2VyQ2FzZSgpO2xvd2VyZWRDYXNlPXRydWV9fX07QnVmZmVyLnByb3RvdHlwZS50b0pTT049ZnVuY3Rpb24gdG9KU09OKCl7cmV0dXJue3R5cGU6IkJ1ZmZlciIsZGF0YTpBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnJ8fHRoaXMsMCl9fTtmdW5jdGlvbiBiYXNlNjRTbGljZShidWYsc3RhcnQsZW5kKXtpZihzdGFydD09PTAmJmVuZD09PWJ1Zi5sZW5ndGgpe3JldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpfWVsc2V7cmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCxlbmQpKX19ZnVuY3Rpb24gdXRmOFNsaWNlKGJ1ZixzdGFydCxlbmQpe2VuZD1NYXRoLm1pbihidWYubGVuZ3RoLGVuZCk7dmFyIHJlcz1bXTt2YXIgaT1zdGFydDt3aGlsZShpPGVuZCl7dmFyIGZpcnN0Qnl0ZT1idWZbaV07dmFyIGNvZGVQb2ludD1udWxsO3ZhciBieXRlc1BlclNlcXVlbmNlPWZpcnN0Qnl0ZT4yMzk/NDpmaXJzdEJ5dGU+MjIzPzM6Zmlyc3RCeXRlPjE5MT8yOjE7aWYoaStieXRlc1BlclNlcXVlbmNlPD1lbmQpe3ZhciBzZWNvbmRCeXRlLHRoaXJkQnl0ZSxmb3VydGhCeXRlLHRlbXBDb2RlUG9pbnQ7c3dpdGNoKGJ5dGVzUGVyU2VxdWVuY2Upe2Nhc2UgMTppZihmaXJzdEJ5dGU8MTI4KXtjb2RlUG9pbnQ9Zmlyc3RCeXRlfWJyZWFrO2Nhc2UgMjpzZWNvbmRCeXRlPWJ1ZltpKzFdO2lmKChzZWNvbmRCeXRlJjE5Mik9PT0xMjgpe3RlbXBDb2RlUG9pbnQ9KGZpcnN0Qnl0ZSYzMSk8PDZ8c2Vjb25kQnl0ZSY2MztpZih0ZW1wQ29kZVBvaW50PjEyNyl7Y29kZVBvaW50PXRlbXBDb2RlUG9pbnR9fWJyZWFrO2Nhc2UgMzpzZWNvbmRCeXRlPWJ1ZltpKzFdO3RoaXJkQnl0ZT1idWZbaSsyXTtpZigoc2Vjb25kQnl0ZSYxOTIpPT09MTI4JiYodGhpcmRCeXRlJjE5Mik9PT0xMjgpe3RlbXBDb2RlUG9pbnQ9KGZpcnN0Qnl0ZSYxNSk8PDEyfChzZWNvbmRCeXRlJjYzKTw8Nnx0aGlyZEJ5dGUmNjM7aWYodGVtcENvZGVQb2ludD4yMDQ3JiYodGVtcENvZGVQb2ludDw1NTI5Nnx8dGVtcENvZGVQb2ludD41NzM0Mykpe2NvZGVQb2ludD10ZW1wQ29kZVBvaW50fX1icmVhaztjYXNlIDQ6c2Vjb25kQnl0ZT1idWZbaSsxXTt0aGlyZEJ5dGU9YnVmW2krMl07Zm91cnRoQnl0ZT1idWZbaSszXTtpZigoc2Vjb25kQnl0ZSYxOTIpPT09MTI4JiYodGhpcmRCeXRlJjE5Mik9PT0xMjgmJihmb3VydGhCeXRlJjE5Mik9PT0xMjgpe3RlbXBDb2RlUG9pbnQ9KGZpcnN0Qnl0ZSYxNSk8PDE4fChzZWNvbmRCeXRlJjYzKTw8MTJ8KHRoaXJkQnl0ZSY2Myk8PDZ8Zm91cnRoQnl0ZSY2MztpZih0ZW1wQ29kZVBvaW50PjY1NTM1JiZ0ZW1wQ29kZVBvaW50PDExMTQxMTIpe2NvZGVQb2ludD10ZW1wQ29kZVBvaW50fX19fWlmKGNvZGVQb2ludD09PW51bGwpe2NvZGVQb2ludD02NTUzMztieXRlc1BlclNlcXVlbmNlPTF9ZWxzZSBpZihjb2RlUG9pbnQ+NjU1MzUpe2NvZGVQb2ludC09NjU1MzY7cmVzLnB1c2goY29kZVBvaW50Pj4+MTAmMTAyM3w1NTI5Nik7Y29kZVBvaW50PTU2MzIwfGNvZGVQb2ludCYxMDIzfXJlcy5wdXNoKGNvZGVQb2ludCk7aSs9Ynl0ZXNQZXJTZXF1ZW5jZX1yZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcyl9dmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIPTQwOTY7ZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5KGNvZGVQb2ludHMpe3ZhciBsZW49Y29kZVBvaW50cy5sZW5ndGg7aWYobGVuPD1NQVhfQVJHVU1FTlRTX0xFTkdUSCl7cmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLGNvZGVQb2ludHMpfXZhciByZXM9IiI7dmFyIGk9MDt3aGlsZShpPGxlbil7cmVzKz1TdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZyxjb2RlUG9pbnRzLnNsaWNlKGksaSs9TUFYX0FSR1VNRU5UU19MRU5HVEgpKX1yZXR1cm4gcmVzfWZ1bmN0aW9uIGFzY2lpU2xpY2UoYnVmLHN0YXJ0LGVuZCl7dmFyIHJldD0iIjtlbmQ9TWF0aC5taW4oYnVmLmxlbmd0aCxlbmQpO2Zvcih2YXIgaT1zdGFydDtpPGVuZDsrK2kpe3JldCs9U3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0mMTI3KX1yZXR1cm4gcmV0fWZ1bmN0aW9uIGxhdGluMVNsaWNlKGJ1ZixzdGFydCxlbmQpe3ZhciByZXQ9IiI7ZW5kPU1hdGgubWluKGJ1Zi5sZW5ndGgsZW5kKTtmb3IodmFyIGk9c3RhcnQ7aTxlbmQ7KytpKXtyZXQrPVN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKX1yZXR1cm4gcmV0fWZ1bmN0aW9uIGhleFNsaWNlKGJ1ZixzdGFydCxlbmQpe3ZhciBsZW49YnVmLmxlbmd0aDtpZighc3RhcnR8fHN0YXJ0PDApc3RhcnQ9MDtpZighZW5kfHxlbmQ8MHx8ZW5kPmxlbillbmQ9bGVuO3ZhciBvdXQ9IiI7Zm9yKHZhciBpPXN0YXJ0O2k8ZW5kOysraSl7b3V0Kz10b0hleChidWZbaV0pfXJldHVybiBvdXR9ZnVuY3Rpb24gdXRmMTZsZVNsaWNlKGJ1ZixzdGFydCxlbmQpe3ZhciBieXRlcz1idWYuc2xpY2Uoc3RhcnQsZW5kKTt2YXIgcmVzPSIiO2Zvcih2YXIgaT0wO2k8Ynl0ZXMubGVuZ3RoO2krPTIpe3Jlcys9U3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXStieXRlc1tpKzFdKjI1Nil9cmV0dXJuIHJlc31CdWZmZXIucHJvdG90eXBlLnNsaWNlPWZ1bmN0aW9uIHNsaWNlKHN0YXJ0LGVuZCl7dmFyIGxlbj10aGlzLmxlbmd0aDtzdGFydD1+fnN0YXJ0O2VuZD1lbmQ9PT11bmRlZmluZWQ/bGVuOn5+ZW5kO2lmKHN0YXJ0PDApe3N0YXJ0Kz1sZW47aWYoc3RhcnQ8MClzdGFydD0wfWVsc2UgaWYoc3RhcnQ+bGVuKXtzdGFydD1sZW59aWYoZW5kPDApe2VuZCs9bGVuO2lmKGVuZDwwKWVuZD0wfWVsc2UgaWYoZW5kPmxlbil7ZW5kPWxlbn1pZihlbmQ8c3RhcnQpZW5kPXN0YXJ0O3ZhciBuZXdCdWY9dGhpcy5zdWJhcnJheShzdGFydCxlbmQpO25ld0J1Zi5fX3Byb3RvX189QnVmZmVyLnByb3RvdHlwZTtyZXR1cm4gbmV3QnVmfTtmdW5jdGlvbiBjaGVja09mZnNldChvZmZzZXQsZXh0LGxlbmd0aCl7aWYob2Zmc2V0JTEhPT0wfHxvZmZzZXQ8MCl0aHJvdyBuZXcgUmFuZ2VFcnJvcigib2Zmc2V0IGlzIG5vdCB1aW50Iik7aWYob2Zmc2V0K2V4dD5sZW5ndGgpdGhyb3cgbmV3IFJhbmdlRXJyb3IoIlRyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgiKX1CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEU9ZnVuY3Rpb24gcmVhZFVJbnRMRShvZmZzZXQsYnl0ZUxlbmd0aCxub0Fzc2VydCl7b2Zmc2V0PW9mZnNldD4+PjA7Ynl0ZUxlbmd0aD1ieXRlTGVuZ3RoPj4+MDtpZighbm9Bc3NlcnQpY2hlY2tPZmZzZXQob2Zmc2V0LGJ5dGVMZW5ndGgsdGhpcy5sZW5ndGgpO3ZhciB2YWw9dGhpc1tvZmZzZXRdO3ZhciBtdWw9MTt2YXIgaT0wO3doaWxlKCsraTxieXRlTGVuZ3RoJiYobXVsKj0yNTYpKXt2YWwrPXRoaXNbb2Zmc2V0K2ldKm11bH1yZXR1cm4gdmFsfTtCdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkU9ZnVuY3Rpb24gcmVhZFVJbnRCRShvZmZzZXQsYnl0ZUxlbmd0aCxub0Fzc2VydCl7b2Zmc2V0PW9mZnNldD4+PjA7Ynl0ZUxlbmd0aD1ieXRlTGVuZ3RoPj4+MDtpZighbm9Bc3NlcnQpe2NoZWNrT2Zmc2V0KG9mZnNldCxieXRlTGVuZ3RoLHRoaXMubGVuZ3RoKX12YXIgdmFsPXRoaXNbb2Zmc2V0Ky0tYnl0ZUxlbmd0aF07dmFyIG11bD0xO3doaWxlKGJ5dGVMZW5ndGg+MCYmKG11bCo9MjU2KSl7dmFsKz10aGlzW29mZnNldCstLWJ5dGVMZW5ndGhdKm11bH1yZXR1cm4gdmFsfTtCdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OD1mdW5jdGlvbiByZWFkVUludDgob2Zmc2V0LG5vQXNzZXJ0KXtvZmZzZXQ9b2Zmc2V0Pj4+MDtpZighbm9Bc3NlcnQpY2hlY2tPZmZzZXQob2Zmc2V0LDEsdGhpcy5sZW5ndGgpO3JldHVybiB0aGlzW29mZnNldF19O0J1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFPWZ1bmN0aW9uIHJlYWRVSW50MTZMRShvZmZzZXQsbm9Bc3NlcnQpe29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCljaGVja09mZnNldChvZmZzZXQsMix0aGlzLmxlbmd0aCk7cmV0dXJuIHRoaXNbb2Zmc2V0XXx0aGlzW29mZnNldCsxXTw8OH07QnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkU9ZnVuY3Rpb24gcmVhZFVJbnQxNkJFKG9mZnNldCxub0Fzc2VydCl7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrT2Zmc2V0KG9mZnNldCwyLHRoaXMubGVuZ3RoKTtyZXR1cm4gdGhpc1tvZmZzZXRdPDw4fHRoaXNbb2Zmc2V0KzFdfTtCdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRT1mdW5jdGlvbiByZWFkVUludDMyTEUob2Zmc2V0LG5vQXNzZXJ0KXtvZmZzZXQ9b2Zmc2V0Pj4+MDtpZighbm9Bc3NlcnQpY2hlY2tPZmZzZXQob2Zmc2V0LDQsdGhpcy5sZW5ndGgpO3JldHVybih0aGlzW29mZnNldF18dGhpc1tvZmZzZXQrMV08PDh8dGhpc1tvZmZzZXQrMl08PDE2KSt0aGlzW29mZnNldCszXSoxNjc3NzIxNn07QnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkU9ZnVuY3Rpb24gcmVhZFVJbnQzMkJFKG9mZnNldCxub0Fzc2VydCl7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrT2Zmc2V0KG9mZnNldCw0LHRoaXMubGVuZ3RoKTtyZXR1cm4gdGhpc1tvZmZzZXRdKjE2Nzc3MjE2Kyh0aGlzW29mZnNldCsxXTw8MTZ8dGhpc1tvZmZzZXQrMl08PDh8dGhpc1tvZmZzZXQrM10pfTtCdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRT1mdW5jdGlvbiByZWFkSW50TEUob2Zmc2V0LGJ5dGVMZW5ndGgsbm9Bc3NlcnQpe29mZnNldD1vZmZzZXQ+Pj4wO2J5dGVMZW5ndGg9Ynl0ZUxlbmd0aD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrT2Zmc2V0KG9mZnNldCxieXRlTGVuZ3RoLHRoaXMubGVuZ3RoKTt2YXIgdmFsPXRoaXNbb2Zmc2V0XTt2YXIgbXVsPTE7dmFyIGk9MDt3aGlsZSgrK2k8Ynl0ZUxlbmd0aCYmKG11bCo9MjU2KSl7dmFsKz10aGlzW29mZnNldCtpXSptdWx9bXVsKj0xMjg7aWYodmFsPj1tdWwpdmFsLT1NYXRoLnBvdygyLDgqYnl0ZUxlbmd0aCk7cmV0dXJuIHZhbH07QnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkU9ZnVuY3Rpb24gcmVhZEludEJFKG9mZnNldCxieXRlTGVuZ3RoLG5vQXNzZXJ0KXtvZmZzZXQ9b2Zmc2V0Pj4+MDtieXRlTGVuZ3RoPWJ5dGVMZW5ndGg+Pj4wO2lmKCFub0Fzc2VydCljaGVja09mZnNldChvZmZzZXQsYnl0ZUxlbmd0aCx0aGlzLmxlbmd0aCk7dmFyIGk9Ynl0ZUxlbmd0aDt2YXIgbXVsPTE7dmFyIHZhbD10aGlzW29mZnNldCstLWldO3doaWxlKGk+MCYmKG11bCo9MjU2KSl7dmFsKz10aGlzW29mZnNldCstLWldKm11bH1tdWwqPTEyODtpZih2YWw+PW11bCl2YWwtPU1hdGgucG93KDIsOCpieXRlTGVuZ3RoKTtyZXR1cm4gdmFsfTtCdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4PWZ1bmN0aW9uIHJlYWRJbnQ4KG9mZnNldCxub0Fzc2VydCl7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrT2Zmc2V0KG9mZnNldCwxLHRoaXMubGVuZ3RoKTtpZighKHRoaXNbb2Zmc2V0XSYxMjgpKXJldHVybiB0aGlzW29mZnNldF07cmV0dXJuKDI1NS10aGlzW29mZnNldF0rMSkqLTF9O0J1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEU9ZnVuY3Rpb24gcmVhZEludDE2TEUob2Zmc2V0LG5vQXNzZXJ0KXtvZmZzZXQ9b2Zmc2V0Pj4+MDtpZighbm9Bc3NlcnQpY2hlY2tPZmZzZXQob2Zmc2V0LDIsdGhpcy5sZW5ndGgpO3ZhciB2YWw9dGhpc1tvZmZzZXRdfHRoaXNbb2Zmc2V0KzFdPDw4O3JldHVybiB2YWwmMzI3Njg/dmFsfDQyOTQ5MDE3NjA6dmFsfTtCdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFPWZ1bmN0aW9uIHJlYWRJbnQxNkJFKG9mZnNldCxub0Fzc2VydCl7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrT2Zmc2V0KG9mZnNldCwyLHRoaXMubGVuZ3RoKTt2YXIgdmFsPXRoaXNbb2Zmc2V0KzFdfHRoaXNbb2Zmc2V0XTw8ODtyZXR1cm4gdmFsJjMyNzY4P3ZhbHw0Mjk0OTAxNzYwOnZhbH07QnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRT1mdW5jdGlvbiByZWFkSW50MzJMRShvZmZzZXQsbm9Bc3NlcnQpe29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCljaGVja09mZnNldChvZmZzZXQsNCx0aGlzLmxlbmd0aCk7cmV0dXJuIHRoaXNbb2Zmc2V0XXx0aGlzW29mZnNldCsxXTw8OHx0aGlzW29mZnNldCsyXTw8MTZ8dGhpc1tvZmZzZXQrM108PDI0fTtCdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFPWZ1bmN0aW9uIHJlYWRJbnQzMkJFKG9mZnNldCxub0Fzc2VydCl7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrT2Zmc2V0KG9mZnNldCw0LHRoaXMubGVuZ3RoKTtyZXR1cm4gdGhpc1tvZmZzZXRdPDwyNHx0aGlzW29mZnNldCsxXTw8MTZ8dGhpc1tvZmZzZXQrMl08PDh8dGhpc1tvZmZzZXQrM119O0J1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEU9ZnVuY3Rpb24gcmVhZEZsb2F0TEUob2Zmc2V0LG5vQXNzZXJ0KXtvZmZzZXQ9b2Zmc2V0Pj4+MDtpZighbm9Bc3NlcnQpY2hlY2tPZmZzZXQob2Zmc2V0LDQsdGhpcy5sZW5ndGgpO3JldHVybiBpZWVlNzU0LnJlYWQodGhpcyxvZmZzZXQsdHJ1ZSwyMyw0KX07QnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRT1mdW5jdGlvbiByZWFkRmxvYXRCRShvZmZzZXQsbm9Bc3NlcnQpe29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCljaGVja09mZnNldChvZmZzZXQsNCx0aGlzLmxlbmd0aCk7cmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLG9mZnNldCxmYWxzZSwyMyw0KX07QnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEU9ZnVuY3Rpb24gcmVhZERvdWJsZUxFKG9mZnNldCxub0Fzc2VydCl7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrT2Zmc2V0KG9mZnNldCw4LHRoaXMubGVuZ3RoKTtyZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsb2Zmc2V0LHRydWUsNTIsOCl9O0J1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFPWZ1bmN0aW9uIHJlYWREb3VibGVCRShvZmZzZXQsbm9Bc3NlcnQpe29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCljaGVja09mZnNldChvZmZzZXQsOCx0aGlzLmxlbmd0aCk7cmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLG9mZnNldCxmYWxzZSw1Miw4KX07ZnVuY3Rpb24gY2hlY2tJbnQoYnVmLHZhbHVlLG9mZnNldCxleHQsbWF4LG1pbil7aWYoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKXRocm93IG5ldyBUeXBlRXJyb3IoJyJidWZmZXIiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKTtpZih2YWx1ZT5tYXh8fHZhbHVlPG1pbil0aHJvdyBuZXcgUmFuZ2VFcnJvcignInZhbHVlIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJyk7aWYob2Zmc2V0K2V4dD5idWYubGVuZ3RoKXRocm93IG5ldyBSYW5nZUVycm9yKCJJbmRleCBvdXQgb2YgcmFuZ2UiKX1CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFPWZ1bmN0aW9uIHdyaXRlVUludExFKHZhbHVlLG9mZnNldCxieXRlTGVuZ3RoLG5vQXNzZXJ0KXt2YWx1ZT0rdmFsdWU7b2Zmc2V0PW9mZnNldD4+PjA7Ynl0ZUxlbmd0aD1ieXRlTGVuZ3RoPj4+MDtpZighbm9Bc3NlcnQpe3ZhciBtYXhCeXRlcz1NYXRoLnBvdygyLDgqYnl0ZUxlbmd0aCktMTtjaGVja0ludCh0aGlzLHZhbHVlLG9mZnNldCxieXRlTGVuZ3RoLG1heEJ5dGVzLDApfXZhciBtdWw9MTt2YXIgaT0wO3RoaXNbb2Zmc2V0XT12YWx1ZSYyNTU7d2hpbGUoKytpPGJ5dGVMZW5ndGgmJihtdWwqPTI1Nikpe3RoaXNbb2Zmc2V0K2ldPXZhbHVlL211bCYyNTV9cmV0dXJuIG9mZnNldCtieXRlTGVuZ3RofTtCdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFPWZ1bmN0aW9uIHdyaXRlVUludEJFKHZhbHVlLG9mZnNldCxieXRlTGVuZ3RoLG5vQXNzZXJ0KXt2YWx1ZT0rdmFsdWU7b2Zmc2V0PW9mZnNldD4+PjA7Ynl0ZUxlbmd0aD1ieXRlTGVuZ3RoPj4+MDtpZighbm9Bc3NlcnQpe3ZhciBtYXhCeXRlcz1NYXRoLnBvdygyLDgqYnl0ZUxlbmd0aCktMTtjaGVja0ludCh0aGlzLHZhbHVlLG9mZnNldCxieXRlTGVuZ3RoLG1heEJ5dGVzLDApfXZhciBpPWJ5dGVMZW5ndGgtMTt2YXIgbXVsPTE7dGhpc1tvZmZzZXQraV09dmFsdWUmMjU1O3doaWxlKC0taT49MCYmKG11bCo9MjU2KSl7dGhpc1tvZmZzZXQraV09dmFsdWUvbXVsJjI1NX1yZXR1cm4gb2Zmc2V0K2J5dGVMZW5ndGh9O0J1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OD1mdW5jdGlvbiB3cml0ZVVJbnQ4KHZhbHVlLG9mZnNldCxub0Fzc2VydCl7dmFsdWU9K3ZhbHVlO29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCljaGVja0ludCh0aGlzLHZhbHVlLG9mZnNldCwxLDI1NSwwKTt0aGlzW29mZnNldF09dmFsdWUmMjU1O3JldHVybiBvZmZzZXQrMX07QnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFPWZ1bmN0aW9uIHdyaXRlVUludDE2TEUodmFsdWUsb2Zmc2V0LG5vQXNzZXJ0KXt2YWx1ZT0rdmFsdWU7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrSW50KHRoaXMsdmFsdWUsb2Zmc2V0LDIsNjU1MzUsMCk7dGhpc1tvZmZzZXRdPXZhbHVlJjI1NTt0aGlzW29mZnNldCsxXT12YWx1ZT4+Pjg7cmV0dXJuIG9mZnNldCsyfTtCdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkU9ZnVuY3Rpb24gd3JpdGVVSW50MTZCRSh2YWx1ZSxvZmZzZXQsbm9Bc3NlcnQpe3ZhbHVlPSt2YWx1ZTtvZmZzZXQ9b2Zmc2V0Pj4+MDtpZighbm9Bc3NlcnQpY2hlY2tJbnQodGhpcyx2YWx1ZSxvZmZzZXQsMiw2NTUzNSwwKTt0aGlzW29mZnNldF09dmFsdWU+Pj44O3RoaXNbb2Zmc2V0KzFdPXZhbHVlJjI1NTtyZXR1cm4gb2Zmc2V0KzJ9O0J1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRT1mdW5jdGlvbiB3cml0ZVVJbnQzMkxFKHZhbHVlLG9mZnNldCxub0Fzc2VydCl7dmFsdWU9K3ZhbHVlO29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCljaGVja0ludCh0aGlzLHZhbHVlLG9mZnNldCw0LDQyOTQ5NjcyOTUsMCk7dGhpc1tvZmZzZXQrM109dmFsdWU+Pj4yNDt0aGlzW29mZnNldCsyXT12YWx1ZT4+PjE2O3RoaXNbb2Zmc2V0KzFdPXZhbHVlPj4+ODt0aGlzW29mZnNldF09dmFsdWUmMjU1O3JldHVybiBvZmZzZXQrNH07QnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFPWZ1bmN0aW9uIHdyaXRlVUludDMyQkUodmFsdWUsb2Zmc2V0LG5vQXNzZXJ0KXt2YWx1ZT0rdmFsdWU7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrSW50KHRoaXMsdmFsdWUsb2Zmc2V0LDQsNDI5NDk2NzI5NSwwKTt0aGlzW29mZnNldF09dmFsdWU+Pj4yNDt0aGlzW29mZnNldCsxXT12YWx1ZT4+PjE2O3RoaXNbb2Zmc2V0KzJdPXZhbHVlPj4+ODt0aGlzW29mZnNldCszXT12YWx1ZSYyNTU7cmV0dXJuIG9mZnNldCs0fTtCdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEU9ZnVuY3Rpb24gd3JpdGVJbnRMRSh2YWx1ZSxvZmZzZXQsYnl0ZUxlbmd0aCxub0Fzc2VydCl7dmFsdWU9K3ZhbHVlO29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCl7dmFyIGxpbWl0PU1hdGgucG93KDIsOCpieXRlTGVuZ3RoLTEpO2NoZWNrSW50KHRoaXMsdmFsdWUsb2Zmc2V0LGJ5dGVMZW5ndGgsbGltaXQtMSwtbGltaXQpfXZhciBpPTA7dmFyIG11bD0xO3ZhciBzdWI9MDt0aGlzW29mZnNldF09dmFsdWUmMjU1O3doaWxlKCsraTxieXRlTGVuZ3RoJiYobXVsKj0yNTYpKXtpZih2YWx1ZTwwJiZzdWI9PT0wJiZ0aGlzW29mZnNldCtpLTFdIT09MCl7c3ViPTF9dGhpc1tvZmZzZXQraV09KHZhbHVlL211bD4+MCktc3ViJjI1NX1yZXR1cm4gb2Zmc2V0K2J5dGVMZW5ndGh9O0J1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRT1mdW5jdGlvbiB3cml0ZUludEJFKHZhbHVlLG9mZnNldCxieXRlTGVuZ3RoLG5vQXNzZXJ0KXt2YWx1ZT0rdmFsdWU7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KXt2YXIgbGltaXQ9TWF0aC5wb3coMiw4KmJ5dGVMZW5ndGgtMSk7Y2hlY2tJbnQodGhpcyx2YWx1ZSxvZmZzZXQsYnl0ZUxlbmd0aCxsaW1pdC0xLC1saW1pdCl9dmFyIGk9Ynl0ZUxlbmd0aC0xO3ZhciBtdWw9MTt2YXIgc3ViPTA7dGhpc1tvZmZzZXQraV09dmFsdWUmMjU1O3doaWxlKC0taT49MCYmKG11bCo9MjU2KSl7aWYodmFsdWU8MCYmc3ViPT09MCYmdGhpc1tvZmZzZXQraSsxXSE9PTApe3N1Yj0xfXRoaXNbb2Zmc2V0K2ldPSh2YWx1ZS9tdWw+PjApLXN1YiYyNTV9cmV0dXJuIG9mZnNldCtieXRlTGVuZ3RofTtCdWZmZXIucHJvdG90eXBlLndyaXRlSW50OD1mdW5jdGlvbiB3cml0ZUludDgodmFsdWUsb2Zmc2V0LG5vQXNzZXJ0KXt2YWx1ZT0rdmFsdWU7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrSW50KHRoaXMsdmFsdWUsb2Zmc2V0LDEsMTI3LC0xMjgpO2lmKHZhbHVlPDApdmFsdWU9MjU1K3ZhbHVlKzE7dGhpc1tvZmZzZXRdPXZhbHVlJjI1NTtyZXR1cm4gb2Zmc2V0KzF9O0J1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFPWZ1bmN0aW9uIHdyaXRlSW50MTZMRSh2YWx1ZSxvZmZzZXQsbm9Bc3NlcnQpe3ZhbHVlPSt2YWx1ZTtvZmZzZXQ9b2Zmc2V0Pj4+MDtpZighbm9Bc3NlcnQpY2hlY2tJbnQodGhpcyx2YWx1ZSxvZmZzZXQsMiwzMjc2NywtMzI3NjgpO3RoaXNbb2Zmc2V0XT12YWx1ZSYyNTU7dGhpc1tvZmZzZXQrMV09dmFsdWU+Pj44O3JldHVybiBvZmZzZXQrMn07QnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkU9ZnVuY3Rpb24gd3JpdGVJbnQxNkJFKHZhbHVlLG9mZnNldCxub0Fzc2VydCl7dmFsdWU9K3ZhbHVlO29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCljaGVja0ludCh0aGlzLHZhbHVlLG9mZnNldCwyLDMyNzY3LC0zMjc2OCk7dGhpc1tvZmZzZXRdPXZhbHVlPj4+ODt0aGlzW29mZnNldCsxXT12YWx1ZSYyNTU7cmV0dXJuIG9mZnNldCsyfTtCdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRT1mdW5jdGlvbiB3cml0ZUludDMyTEUodmFsdWUsb2Zmc2V0LG5vQXNzZXJ0KXt2YWx1ZT0rdmFsdWU7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KWNoZWNrSW50KHRoaXMsdmFsdWUsb2Zmc2V0LDQsMjE0NzQ4MzY0NywtMjE0NzQ4MzY0OCk7dGhpc1tvZmZzZXRdPXZhbHVlJjI1NTt0aGlzW29mZnNldCsxXT12YWx1ZT4+Pjg7dGhpc1tvZmZzZXQrMl09dmFsdWU+Pj4xNjt0aGlzW29mZnNldCszXT12YWx1ZT4+PjI0O3JldHVybiBvZmZzZXQrNH07QnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkU9ZnVuY3Rpb24gd3JpdGVJbnQzMkJFKHZhbHVlLG9mZnNldCxub0Fzc2VydCl7dmFsdWU9K3ZhbHVlO29mZnNldD1vZmZzZXQ+Pj4wO2lmKCFub0Fzc2VydCljaGVja0ludCh0aGlzLHZhbHVlLG9mZnNldCw0LDIxNDc0ODM2NDcsLTIxNDc0ODM2NDgpO2lmKHZhbHVlPDApdmFsdWU9NDI5NDk2NzI5NSt2YWx1ZSsxO3RoaXNbb2Zmc2V0XT12YWx1ZT4+PjI0O3RoaXNbb2Zmc2V0KzFdPXZhbHVlPj4+MTY7dGhpc1tvZmZzZXQrMl09dmFsdWU+Pj44O3RoaXNbb2Zmc2V0KzNdPXZhbHVlJjI1NTtyZXR1cm4gb2Zmc2V0KzR9O2Z1bmN0aW9uIGNoZWNrSUVFRTc1NChidWYsdmFsdWUsb2Zmc2V0LGV4dCxtYXgsbWluKXtpZihvZmZzZXQrZXh0PmJ1Zi5sZW5ndGgpdGhyb3cgbmV3IFJhbmdlRXJyb3IoIkluZGV4IG91dCBvZiByYW5nZSIpO2lmKG9mZnNldDwwKXRocm93IG5ldyBSYW5nZUVycm9yKCJJbmRleCBvdXQgb2YgcmFuZ2UiKX1mdW5jdGlvbiB3cml0ZUZsb2F0KGJ1Zix2YWx1ZSxvZmZzZXQsbGl0dGxlRW5kaWFuLG5vQXNzZXJ0KXt2YWx1ZT0rdmFsdWU7b2Zmc2V0PW9mZnNldD4+PjA7aWYoIW5vQXNzZXJ0KXtjaGVja0lFRUU3NTQoYnVmLHZhbHVlLG9mZnNldCw0LDM0MDI4MjM0NjYzODUyODg2ZTIyLC0zNDAyODIzNDY2Mzg1Mjg4NmUyMil9aWVlZTc1NC53cml0ZShidWYsdmFsdWUsb2Zmc2V0LGxpdHRsZUVuZGlhbiwyMyw0KTtyZXR1cm4gb2Zmc2V0KzR9QnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEU9ZnVuY3Rpb24gd3JpdGVGbG9hdExFKHZhbHVlLG9mZnNldCxub0Fzc2VydCl7cmV0dXJuIHdyaXRlRmxvYXQodGhpcyx2YWx1ZSxvZmZzZXQsdHJ1ZSxub0Fzc2VydCl9O0J1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFPWZ1bmN0aW9uIHdyaXRlRmxvYXRCRSh2YWx1ZSxvZmZzZXQsbm9Bc3NlcnQpe3JldHVybiB3cml0ZUZsb2F0KHRoaXMsdmFsdWUsb2Zmc2V0LGZhbHNlLG5vQXNzZXJ0KX07ZnVuY3Rpb24gd3JpdGVEb3VibGUoYnVmLHZhbHVlLG9mZnNldCxsaXR0bGVFbmRpYW4sbm9Bc3NlcnQpe3ZhbHVlPSt2YWx1ZTtvZmZzZXQ9b2Zmc2V0Pj4+MDtpZighbm9Bc3NlcnQpe2NoZWNrSUVFRTc1NChidWYsdmFsdWUsb2Zmc2V0LDgsMTc5NzY5MzEzNDg2MjMxNTdlMjkyLC0xNzk3NjkzMTM0ODYyMzE1N2UyOTIpfWllZWU3NTQud3JpdGUoYnVmLHZhbHVlLG9mZnNldCxsaXR0bGVFbmRpYW4sNTIsOCk7cmV0dXJuIG9mZnNldCs4fUJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRT1mdW5jdGlvbiB3cml0ZURvdWJsZUxFKHZhbHVlLG9mZnNldCxub0Fzc2VydCl7cmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsdmFsdWUsb2Zmc2V0LHRydWUsbm9Bc3NlcnQpfTtCdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkU9ZnVuY3Rpb24gd3JpdGVEb3VibGVCRSh2YWx1ZSxvZmZzZXQsbm9Bc3NlcnQpe3JldHVybiB3cml0ZURvdWJsZSh0aGlzLHZhbHVlLG9mZnNldCxmYWxzZSxub0Fzc2VydCl9O0J1ZmZlci5wcm90b3R5cGUuY29weT1mdW5jdGlvbiBjb3B5KHRhcmdldCx0YXJnZXRTdGFydCxzdGFydCxlbmQpe2lmKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSl0aHJvdyBuZXcgVHlwZUVycm9yKCJhcmd1bWVudCBzaG91bGQgYmUgYSBCdWZmZXIiKTtpZighc3RhcnQpc3RhcnQ9MDtpZighZW5kJiZlbmQhPT0wKWVuZD10aGlzLmxlbmd0aDtpZih0YXJnZXRTdGFydD49dGFyZ2V0Lmxlbmd0aCl0YXJnZXRTdGFydD10YXJnZXQubGVuZ3RoO2lmKCF0YXJnZXRTdGFydCl0YXJnZXRTdGFydD0wO2lmKGVuZD4wJiZlbmQ8c3RhcnQpZW5kPXN0YXJ0O2lmKGVuZD09PXN0YXJ0KXJldHVybiAwO2lmKHRhcmdldC5sZW5ndGg9PT0wfHx0aGlzLmxlbmd0aD09PTApcmV0dXJuIDA7aWYodGFyZ2V0U3RhcnQ8MCl7dGhyb3cgbmV3IFJhbmdlRXJyb3IoInRhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMiKX1pZihzdGFydDwwfHxzdGFydD49dGhpcy5sZW5ndGgpdGhyb3cgbmV3IFJhbmdlRXJyb3IoIkluZGV4IG91dCBvZiByYW5nZSIpO2lmKGVuZDwwKXRocm93IG5ldyBSYW5nZUVycm9yKCJzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcyIpO2lmKGVuZD50aGlzLmxlbmd0aCllbmQ9dGhpcy5sZW5ndGg7aWYodGFyZ2V0Lmxlbmd0aC10YXJnZXRTdGFydDxlbmQtc3RhcnQpe2VuZD10YXJnZXQubGVuZ3RoLXRhcmdldFN0YXJ0K3N0YXJ0fXZhciBsZW49ZW5kLXN0YXJ0O2lmKHRoaXM9PT10YXJnZXQmJnR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5jb3B5V2l0aGluPT09ImZ1bmN0aW9uIil7dGhpcy5jb3B5V2l0aGluKHRhcmdldFN0YXJ0LHN0YXJ0LGVuZCl9ZWxzZSBpZih0aGlzPT09dGFyZ2V0JiZzdGFydDx0YXJnZXRTdGFydCYmdGFyZ2V0U3RhcnQ8ZW5kKXtmb3IodmFyIGk9bGVuLTE7aT49MDstLWkpe3RhcmdldFtpK3RhcmdldFN0YXJ0XT10aGlzW2krc3RhcnRdfX1lbHNle1VpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKHRhcmdldCx0aGlzLnN1YmFycmF5KHN0YXJ0LGVuZCksdGFyZ2V0U3RhcnQpfXJldHVybiBsZW59O0J1ZmZlci5wcm90b3R5cGUuZmlsbD1mdW5jdGlvbiBmaWxsKHZhbCxzdGFydCxlbmQsZW5jb2Rpbmcpe2lmKHR5cGVvZiB2YWw9PT0ic3RyaW5nIil7aWYodHlwZW9mIHN0YXJ0PT09InN0cmluZyIpe2VuY29kaW5nPXN0YXJ0O3N0YXJ0PTA7ZW5kPXRoaXMubGVuZ3RofWVsc2UgaWYodHlwZW9mIGVuZD09PSJzdHJpbmciKXtlbmNvZGluZz1lbmQ7ZW5kPXRoaXMubGVuZ3RofWlmKGVuY29kaW5nIT09dW5kZWZpbmVkJiZ0eXBlb2YgZW5jb2RpbmchPT0ic3RyaW5nIil7dGhyb3cgbmV3IFR5cGVFcnJvcigiZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZyIpfWlmKHR5cGVvZiBlbmNvZGluZz09PSJzdHJpbmciJiYhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJVbmtub3duIGVuY29kaW5nOiAiK2VuY29kaW5nKX1pZih2YWwubGVuZ3RoPT09MSl7dmFyIGNvZGU9dmFsLmNoYXJDb2RlQXQoMCk7aWYoZW5jb2Rpbmc9PT0idXRmOCImJmNvZGU8MTI4fHxlbmNvZGluZz09PSJsYXRpbjEiKXt2YWw9Y29kZX19fWVsc2UgaWYodHlwZW9mIHZhbD09PSJudW1iZXIiKXt2YWw9dmFsJjI1NX1pZihzdGFydDwwfHx0aGlzLmxlbmd0aDxzdGFydHx8dGhpcy5sZW5ndGg8ZW5kKXt0aHJvdyBuZXcgUmFuZ2VFcnJvcigiT3V0IG9mIHJhbmdlIGluZGV4Iil9aWYoZW5kPD1zdGFydCl7cmV0dXJuIHRoaXN9c3RhcnQ9c3RhcnQ+Pj4wO2VuZD1lbmQ9PT11bmRlZmluZWQ/dGhpcy5sZW5ndGg6ZW5kPj4+MDtpZighdmFsKXZhbD0wO3ZhciBpO2lmKHR5cGVvZiB2YWw9PT0ibnVtYmVyIil7Zm9yKGk9c3RhcnQ7aTxlbmQ7KytpKXt0aGlzW2ldPXZhbH19ZWxzZXt2YXIgYnl0ZXM9QnVmZmVyLmlzQnVmZmVyKHZhbCk/dmFsOkJ1ZmZlci5mcm9tKHZhbCxlbmNvZGluZyk7dmFyIGxlbj1ieXRlcy5sZW5ndGg7aWYobGVuPT09MCl7dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlIHZhbHVlICInK3ZhbCsnIiBpcyBpbnZhbGlkIGZvciBhcmd1bWVudCAidmFsdWUiJyl9Zm9yKGk9MDtpPGVuZC1zdGFydDsrK2kpe3RoaXNbaStzdGFydF09Ynl0ZXNbaSVsZW5dfX1yZXR1cm4gdGhpc307dmFyIElOVkFMSURfQkFTRTY0X1JFPS9bXisvMC05QS1aYS16LV9dL2c7ZnVuY3Rpb24gYmFzZTY0Y2xlYW4oc3RyKXtzdHI9c3RyLnNwbGl0KCI9IilbMF07c3RyPXN0ci50cmltKCkucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwiIik7aWYoc3RyLmxlbmd0aDwyKXJldHVybiIiO3doaWxlKHN0ci5sZW5ndGglNCE9PTApe3N0cj1zdHIrIj0ifXJldHVybiBzdHJ9ZnVuY3Rpb24gdG9IZXgobil7aWYobjwxNilyZXR1cm4iMCIrbi50b1N0cmluZygxNik7cmV0dXJuIG4udG9TdHJpbmcoMTYpfWZ1bmN0aW9uIHV0ZjhUb0J5dGVzKHN0cmluZyx1bml0cyl7dW5pdHM9dW5pdHN8fEluZmluaXR5O3ZhciBjb2RlUG9pbnQ7dmFyIGxlbmd0aD1zdHJpbmcubGVuZ3RoO3ZhciBsZWFkU3Vycm9nYXRlPW51bGw7dmFyIGJ5dGVzPVtdO2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7Y29kZVBvaW50PXN0cmluZy5jaGFyQ29kZUF0KGkpO2lmKGNvZGVQb2ludD41NTI5NSYmY29kZVBvaW50PDU3MzQ0KXtpZighbGVhZFN1cnJvZ2F0ZSl7aWYoY29kZVBvaW50PjU2MzE5KXtpZigodW5pdHMtPTMpPi0xKWJ5dGVzLnB1c2goMjM5LDE5MSwxODkpO2NvbnRpbnVlfWVsc2UgaWYoaSsxPT09bGVuZ3RoKXtpZigodW5pdHMtPTMpPi0xKWJ5dGVzLnB1c2goMjM5LDE5MSwxODkpO2NvbnRpbnVlfWxlYWRTdXJyb2dhdGU9Y29kZVBvaW50O2NvbnRpbnVlfWlmKGNvZGVQb2ludDw1NjMyMCl7aWYoKHVuaXRzLT0zKT4tMSlieXRlcy5wdXNoKDIzOSwxOTEsMTg5KTtsZWFkU3Vycm9nYXRlPWNvZGVQb2ludDtjb250aW51ZX1jb2RlUG9pbnQ9KGxlYWRTdXJyb2dhdGUtNTUyOTY8PDEwfGNvZGVQb2ludC01NjMyMCkrNjU1MzZ9ZWxzZSBpZihsZWFkU3Vycm9nYXRlKXtpZigodW5pdHMtPTMpPi0xKWJ5dGVzLnB1c2goMjM5LDE5MSwxODkpfWxlYWRTdXJyb2dhdGU9bnVsbDtpZihjb2RlUG9pbnQ8MTI4KXtpZigodW5pdHMtPTEpPDApYnJlYWs7Ynl0ZXMucHVzaChjb2RlUG9pbnQpfWVsc2UgaWYoY29kZVBvaW50PDIwNDgpe2lmKCh1bml0cy09Mik8MClicmVhaztieXRlcy5wdXNoKGNvZGVQb2ludD4+NnwxOTIsY29kZVBvaW50JjYzfDEyOCl9ZWxzZSBpZihjb2RlUG9pbnQ8NjU1MzYpe2lmKCh1bml0cy09Myk8MClicmVhaztieXRlcy5wdXNoKGNvZGVQb2ludD4+MTJ8MjI0LGNvZGVQb2ludD4+NiY2M3wxMjgsY29kZVBvaW50JjYzfDEyOCl9ZWxzZSBpZihjb2RlUG9pbnQ8MTExNDExMil7aWYoKHVuaXRzLT00KTwwKWJyZWFrO2J5dGVzLnB1c2goY29kZVBvaW50Pj4xOHwyNDAsY29kZVBvaW50Pj4xMiY2M3wxMjgsY29kZVBvaW50Pj42JjYzfDEyOCxjb2RlUG9pbnQmNjN8MTI4KX1lbHNle3Rocm93IG5ldyBFcnJvcigiSW52YWxpZCBjb2RlIHBvaW50Iil9fXJldHVybiBieXRlc31mdW5jdGlvbiBhc2NpaVRvQnl0ZXMoc3RyKXt2YXIgYnl0ZUFycmF5PVtdO2Zvcih2YXIgaT0wO2k8c3RyLmxlbmd0aDsrK2kpe2J5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpJjI1NSl9cmV0dXJuIGJ5dGVBcnJheX1mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyhzdHIsdW5pdHMpe3ZhciBjLGhpLGxvO3ZhciBieXRlQXJyYXk9W107Zm9yKHZhciBpPTA7aTxzdHIubGVuZ3RoOysraSl7aWYoKHVuaXRzLT0yKTwwKWJyZWFrO2M9c3RyLmNoYXJDb2RlQXQoaSk7aGk9Yz4+ODtsbz1jJTI1NjtieXRlQXJyYXkucHVzaChsbyk7Ynl0ZUFycmF5LnB1c2goaGkpfXJldHVybiBieXRlQXJyYXl9ZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyhzdHIpe3JldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSl9ZnVuY3Rpb24gYmxpdEJ1ZmZlcihzcmMsZHN0LG9mZnNldCxsZW5ndGgpe2Zvcih2YXIgaT0wO2k8bGVuZ3RoOysraSl7aWYoaStvZmZzZXQ+PWRzdC5sZW5ndGh8fGk+PXNyYy5sZW5ndGgpYnJlYWs7ZHN0W2krb2Zmc2V0XT1zcmNbaV19cmV0dXJuIGl9ZnVuY3Rpb24gaXNJbnN0YW5jZShvYmosdHlwZSl7cmV0dXJuIG9iaiBpbnN0YW5jZW9mIHR5cGV8fG9iaiE9bnVsbCYmb2JqLmNvbnN0cnVjdG9yIT1udWxsJiZvYmouY29uc3RydWN0b3IubmFtZSE9bnVsbCYmb2JqLmNvbnN0cnVjdG9yLm5hbWU9PT10eXBlLm5hbWV9ZnVuY3Rpb24gbnVtYmVySXNOYU4ob2JqKXtyZXR1cm4gb2JqIT09b2JqfX0pLmNhbGwodGhpcyxyZXF1aXJlKCJidWZmZXIiKS5CdWZmZXIpfSx7ImJhc2U2NC1qcyI6MjQsYnVmZmVyOjI3LGllZWU3NTQ6MzV9XSwyODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgVHJhbnNmb3JtPXJlcXVpcmUoInN0cmVhbSIpLlRyYW5zZm9ybTt2YXIgU3RyaW5nRGVjb2Rlcj1yZXF1aXJlKCJzdHJpbmdfZGVjb2RlciIpLlN0cmluZ0RlY29kZXI7dmFyIGluaGVyaXRzPXJlcXVpcmUoImluaGVyaXRzIik7ZnVuY3Rpb24gQ2lwaGVyQmFzZShoYXNoTW9kZSl7VHJhbnNmb3JtLmNhbGwodGhpcyk7dGhpcy5oYXNoTW9kZT10eXBlb2YgaGFzaE1vZGU9PT0ic3RyaW5nIjtpZih0aGlzLmhhc2hNb2RlKXt0aGlzW2hhc2hNb2RlXT10aGlzLl9maW5hbE9yRGlnZXN0fWVsc2V7dGhpcy5maW5hbD10aGlzLl9maW5hbE9yRGlnZXN0fWlmKHRoaXMuX2ZpbmFsKXt0aGlzLl9fZmluYWw9dGhpcy5fZmluYWw7dGhpcy5fZmluYWw9bnVsbH10aGlzLl9kZWNvZGVyPW51bGw7dGhpcy5fZW5jb2Rpbmc9bnVsbH1pbmhlcml0cyhDaXBoZXJCYXNlLFRyYW5zZm9ybSk7Q2lwaGVyQmFzZS5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGRhdGEsaW5wdXRFbmMsb3V0cHV0RW5jKXtpZih0eXBlb2YgZGF0YT09PSJzdHJpbmciKXtkYXRhPUJ1ZmZlci5mcm9tKGRhdGEsaW5wdXRFbmMpfXZhciBvdXREYXRhPXRoaXMuX3VwZGF0ZShkYXRhKTtpZih0aGlzLmhhc2hNb2RlKXJldHVybiB0aGlzO2lmKG91dHB1dEVuYyl7b3V0RGF0YT10aGlzLl90b1N0cmluZyhvdXREYXRhLG91dHB1dEVuYyl9cmV0dXJuIG91dERhdGF9O0NpcGhlckJhc2UucHJvdG90eXBlLnNldEF1dG9QYWRkaW5nPWZ1bmN0aW9uKCl7fTtDaXBoZXJCYXNlLnByb3RvdHlwZS5nZXRBdXRoVGFnPWZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKCJ0cnlpbmcgdG8gZ2V0IGF1dGggdGFnIGluIHVuc3VwcG9ydGVkIHN0YXRlIil9O0NpcGhlckJhc2UucHJvdG90eXBlLnNldEF1dGhUYWc9ZnVuY3Rpb24oKXt0aHJvdyBuZXcgRXJyb3IoInRyeWluZyB0byBzZXQgYXV0aCB0YWcgaW4gdW5zdXBwb3J0ZWQgc3RhdGUiKX07Q2lwaGVyQmFzZS5wcm90b3R5cGUuc2V0QUFEPWZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKCJ0cnlpbmcgdG8gc2V0IGFhZCBpbiB1bnN1cHBvcnRlZCBzdGF0ZSIpfTtDaXBoZXJCYXNlLnByb3RvdHlwZS5fdHJhbnNmb3JtPWZ1bmN0aW9uKGRhdGEsXyxuZXh0KXt2YXIgZXJyO3RyeXtpZih0aGlzLmhhc2hNb2RlKXt0aGlzLl91cGRhdGUoZGF0YSl9ZWxzZXt0aGlzLnB1c2godGhpcy5fdXBkYXRlKGRhdGEpKX19Y2F0Y2goZSl7ZXJyPWV9ZmluYWxseXtuZXh0KGVycil9fTtDaXBoZXJCYXNlLnByb3RvdHlwZS5fZmx1c2g9ZnVuY3Rpb24oZG9uZSl7dmFyIGVycjt0cnl7dGhpcy5wdXNoKHRoaXMuX19maW5hbCgpKX1jYXRjaChlKXtlcnI9ZX1kb25lKGVycil9O0NpcGhlckJhc2UucHJvdG90eXBlLl9maW5hbE9yRGlnZXN0PWZ1bmN0aW9uKG91dHB1dEVuYyl7dmFyIG91dERhdGE9dGhpcy5fX2ZpbmFsKCl8fEJ1ZmZlci5hbGxvYygwKTtpZihvdXRwdXRFbmMpe291dERhdGE9dGhpcy5fdG9TdHJpbmcob3V0RGF0YSxvdXRwdXRFbmMsdHJ1ZSl9cmV0dXJuIG91dERhdGF9O0NpcGhlckJhc2UucHJvdG90eXBlLl90b1N0cmluZz1mdW5jdGlvbih2YWx1ZSxlbmMsZmluKXtpZighdGhpcy5fZGVjb2Rlcil7dGhpcy5fZGVjb2Rlcj1uZXcgU3RyaW5nRGVjb2RlcihlbmMpO3RoaXMuX2VuY29kaW5nPWVuY31pZih0aGlzLl9lbmNvZGluZyE9PWVuYyl0aHJvdyBuZXcgRXJyb3IoImNhbid0IHN3aXRjaCBlbmNvZGluZ3MiKTt2YXIgb3V0PXRoaXMuX2RlY29kZXIud3JpdGUodmFsdWUpO2lmKGZpbil7b3V0Kz10aGlzLl9kZWNvZGVyLmVuZCgpfXJldHVybiBvdXR9O21vZHVsZS5leHBvcnRzPUNpcGhlckJhc2V9LHtpbmhlcml0czozNiwic2FmZS1idWZmZXIiOjgzLHN0cmVhbToxMDIsc3RyaW5nX2RlY29kZXI6MTE4fV0sMjk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe21vZHVsZS5leHBvcnRzPXtPX1JET05MWTowLE9fV1JPTkxZOjEsT19SRFdSOjIsU19JRk1UOjYxNDQwLFNfSUZSRUc6MzI3NjgsU19JRkRJUjoxNjM4NCxTX0lGQ0hSOjgxOTIsU19JRkJMSzoyNDU3NixTX0lGSUZPOjQwOTYsU19JRkxOSzo0MDk2MCxTX0lGU09DSzo0OTE1MixPX0NSRUFUOjUxMixPX0VYQ0w6MjA0OCxPX05PQ1RUWToxMzEwNzIsT19UUlVOQzoxMDI0LE9fQVBQRU5EOjgsT19ESVJFQ1RPUlk6MTA0ODU3NixPX05PRk9MTE9XOjI1NixPX1NZTkM6MTI4LE9fU1lNTElOSzoyMDk3MTUyLE9fTk9OQkxPQ0s6NCxTX0lSV1hVOjQ0OCxTX0lSVVNSOjI1NixTX0lXVVNSOjEyOCxTX0lYVVNSOjY0LFNfSVJXWEc6NTYsU19JUkdSUDozMixTX0lXR1JQOjE2LFNfSVhHUlA6OCxTX0lSV1hPOjcsU19JUk9USDo0LFNfSVdPVEg6MixTX0lYT1RIOjEsRTJCSUc6NyxFQUNDRVM6MTMsRUFERFJJTlVTRTo0OCxFQUREUk5PVEFWQUlMOjQ5LEVBRk5PU1VQUE9SVDo0NyxFQUdBSU46MzUsRUFMUkVBRFk6MzcsRUJBREY6OSxFQkFETVNHOjk0LEVCVVNZOjE2LEVDQU5DRUxFRDo4OSxFQ0hJTEQ6MTAsRUNPTk5BQk9SVEVEOjUzLEVDT05OUkVGVVNFRDo2MSxFQ09OTlJFU0VUOjU0LEVERUFETEs6MTEsRURFU1RBRERSUkVROjM5LEVET006MzMsRURRVU9UOjY5LEVFWElTVDoxNyxFRkFVTFQ6MTQsRUZCSUc6MjcsRUhPU1RVTlJFQUNIOjY1LEVJRFJNOjkwLEVJTFNFUTo5MixFSU5QUk9HUkVTUzozNixFSU5UUjo0LEVJTlZBTDoyMixFSU86NSxFSVNDT05OOjU2LEVJU0RJUjoyMSxFTE9PUDo2MixFTUZJTEU6MjQsRU1MSU5LOjMxLEVNU0dTSVpFOjQwLEVNVUxUSUhPUDo5NSxFTkFNRVRPT0xPTkc6NjMsRU5FVERPV046NTAsRU5FVFJFU0VUOjUyLEVORVRVTlJFQUNIOjUxLEVORklMRToyMyxFTk9CVUZTOjU1LEVOT0RBVEE6OTYsRU5PREVWOjE5LEVOT0VOVDoyLEVOT0VYRUM6OCxFTk9MQ0s6NzcsRU5PTElOSzo5NyxFTk9NRU06MTIsRU5PTVNHOjkxLEVOT1BST1RPT1BUOjQyLEVOT1NQQzoyOCxFTk9TUjo5OCxFTk9TVFI6OTksRU5PU1lTOjc4LEVOT1RDT05OOjU3LEVOT1RESVI6MjAsRU5PVEVNUFRZOjY2LEVOT1RTT0NLOjM4LEVOT1RTVVA6NDUsRU5PVFRZOjI1LEVOWElPOjYsRU9QTk9UU1VQUDoxMDIsRU9WRVJGTE9XOjg0LEVQRVJNOjEsRVBJUEU6MzIsRVBST1RPOjEwMCxFUFJPVE9OT1NVUFBPUlQ6NDMsRVBST1RPVFlQRTo0MSxFUkFOR0U6MzQsRVJPRlM6MzAsRVNQSVBFOjI5LEVTUkNIOjMsRVNUQUxFOjcwLEVUSU1FOjEwMSxFVElNRURPVVQ6NjAsRVRYVEJTWToyNixFV09VTERCTE9DSzozNSxFWERFVjoxOCxTSUdIVVA6MSxTSUdJTlQ6MixTSUdRVUlUOjMsU0lHSUxMOjQsU0lHVFJBUDo1LFNJR0FCUlQ6NixTSUdJT1Q6NixTSUdCVVM6MTAsU0lHRlBFOjgsU0lHS0lMTDo5LFNJR1VTUjE6MzAsU0lHU0VHVjoxMSxTSUdVU1IyOjMxLFNJR1BJUEU6MTMsU0lHQUxSTToxNCxTSUdURVJNOjE1LFNJR0NITEQ6MjAsU0lHQ09OVDoxOSxTSUdTVE9QOjE3LFNJR1RTVFA6MTgsU0lHVFRJTjoyMSxTSUdUVE9VOjIyLFNJR1VSRzoxNixTSUdYQ1BVOjI0LFNJR1hGU1o6MjUsU0lHVlRBTFJNOjI2LFNJR1BST0Y6MjcsU0lHV0lOQ0g6MjgsU0lHSU86MjMsU0lHU1lTOjEyLFNTTF9PUF9BTEw6MjE0NzQ4NjcxOSxTU0xfT1BfQUxMT1dfVU5TQUZFX0xFR0FDWV9SRU5FR09USUFUSU9OOjI2MjE0NCxTU0xfT1BfQ0lQSEVSX1NFUlZFUl9QUkVGRVJFTkNFOjQxOTQzMDQsU1NMX09QX0NJU0NPX0FOWUNPTk5FQ1Q6MzI3NjgsU1NMX09QX0NPT0tJRV9FWENIQU5HRTo4MTkyLFNTTF9PUF9DUllQVE9QUk9fVExTRVhUX0JVRzoyMTQ3NDgzNjQ4LFNTTF9PUF9ET05UX0lOU0VSVF9FTVBUWV9GUkFHTUVOVFM6MjA0OCxTU0xfT1BfRVBIRU1FUkFMX1JTQTowLFNTTF9PUF9MRUdBQ1lfU0VSVkVSX0NPTk5FQ1Q6NCxTU0xfT1BfTUlDUk9TT0ZUX0JJR19TU0xWM19CVUZGRVI6MzIsU1NMX09QX01JQ1JPU09GVF9TRVNTX0lEX0JVRzoxLFNTTF9PUF9NU0lFX1NTTFYyX1JTQV9QQURESU5HOjAsU1NMX09QX05FVFNDQVBFX0NBX0ROX0JVRzo1MzY4NzA5MTIsU1NMX09QX05FVFNDQVBFX0NIQUxMRU5HRV9CVUc6MixTU0xfT1BfTkVUU0NBUEVfREVNT19DSVBIRVJfQ0hBTkdFX0JVRzoxMDczNzQxODI0LFNTTF9PUF9ORVRTQ0FQRV9SRVVTRV9DSVBIRVJfQ0hBTkdFX0JVRzo4LFNTTF9PUF9OT19DT01QUkVTU0lPTjoxMzEwNzIsU1NMX09QX05PX1FVRVJZX01UVTo0MDk2LFNTTF9PUF9OT19TRVNTSU9OX1JFU1VNUFRJT05fT05fUkVORUdPVElBVElPTjo2NTUzNixTU0xfT1BfTk9fU1NMdjI6MTY3NzcyMTYsU1NMX09QX05PX1NTTHYzOjMzNTU0NDMyLFNTTF9PUF9OT19USUNLRVQ6MTYzODQsU1NMX09QX05PX1RMU3YxOjY3MTA4ODY0LFNTTF9PUF9OT19UTFN2MV8xOjI2ODQzNTQ1NixTU0xfT1BfTk9fVExTdjFfMjoxMzQyMTc3MjgsU1NMX09QX1BLQ1MxX0NIRUNLXzE6MCxTU0xfT1BfUEtDUzFfQ0hFQ0tfMjowLFNTTF9PUF9TSU5HTEVfREhfVVNFOjEwNDg1NzYsU1NMX09QX1NJTkdMRV9FQ0RIX1VTRTo1MjQyODgsU1NMX09QX1NTTEVBWV8wODBfQ0xJRU5UX0RIX0JVRzoxMjgsU1NMX09QX1NTTFJFRjJfUkVVU0VfQ0VSVF9UWVBFX0JVRzowLFNTTF9PUF9UTFNfQkxPQ0tfUEFERElOR19CVUc6NTEyLFNTTF9PUF9UTFNfRDVfQlVHOjI1NixTU0xfT1BfVExTX1JPTExCQUNLX0JVRzo4Mzg4NjA4LEVOR0lORV9NRVRIT0RfRFNBOjIsRU5HSU5FX01FVEhPRF9ESDo0LEVOR0lORV9NRVRIT0RfUkFORDo4LEVOR0lORV9NRVRIT0RfRUNESDoxNixFTkdJTkVfTUVUSE9EX0VDRFNBOjMyLEVOR0lORV9NRVRIT0RfQ0lQSEVSUzo2NCxFTkdJTkVfTUVUSE9EX0RJR0VTVFM6MTI4LEVOR0lORV9NRVRIT0RfU1RPUkU6MjU2LEVOR0lORV9NRVRIT0RfUEtFWV9NRVRIUzo1MTIsRU5HSU5FX01FVEhPRF9QS0VZX0FTTjFfTUVUSFM6MTAyNCxFTkdJTkVfTUVUSE9EX0FMTDo2NTUzNSxFTkdJTkVfTUVUSE9EX05PTkU6MCxESF9DSEVDS19QX05PVF9TQUZFX1BSSU1FOjIsREhfQ0hFQ0tfUF9OT1RfUFJJTUU6MSxESF9VTkFCTEVfVE9fQ0hFQ0tfR0VORVJBVE9SOjQsREhfTk9UX1NVSVRBQkxFX0dFTkVSQVRPUjo4LE5QTl9FTkFCTEVEOjEsUlNBX1BLQ1MxX1BBRERJTkc6MSxSU0FfU1NMVjIzX1BBRERJTkc6MixSU0FfTk9fUEFERElORzozLFJTQV9QS0NTMV9PQUVQX1BBRERJTkc6NCxSU0FfWDkzMV9QQURESU5HOjUsUlNBX1BLQ1MxX1BTU19QQURESU5HOjYsUE9JTlRfQ09OVkVSU0lPTl9DT01QUkVTU0VEOjIsUE9JTlRfQ09OVkVSU0lPTl9VTkNPTVBSRVNTRUQ6NCxQT0lOVF9DT05WRVJTSU9OX0hZQlJJRDo2LEZfT0s6MCxSX09LOjQsV19PSzoyLFhfT0s6MSxVVl9VRFBfUkVVU0VBRERSOjR9fSx7fV0sMzA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihCdWZmZXIpe2Z1bmN0aW9uIGlzQXJyYXkoYXJnKXtpZihBcnJheS5pc0FycmF5KXtyZXR1cm4gQXJyYXkuaXNBcnJheShhcmcpfXJldHVybiBvYmplY3RUb1N0cmluZyhhcmcpPT09IltvYmplY3QgQXJyYXldIn1leHBvcnRzLmlzQXJyYXk9aXNBcnJheTtmdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKXtyZXR1cm4gdHlwZW9mIGFyZz09PSJib29sZWFuIn1leHBvcnRzLmlzQm9vbGVhbj1pc0Jvb2xlYW47ZnVuY3Rpb24gaXNOdWxsKGFyZyl7cmV0dXJuIGFyZz09PW51bGx9ZXhwb3J0cy5pc051bGw9aXNOdWxsO2Z1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZyl7cmV0dXJuIGFyZz09bnVsbH1leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkPWlzTnVsbE9yVW5kZWZpbmVkO2Z1bmN0aW9uIGlzTnVtYmVyKGFyZyl7cmV0dXJuIHR5cGVvZiBhcmc9PT0ibnVtYmVyIn1leHBvcnRzLmlzTnVtYmVyPWlzTnVtYmVyO2Z1bmN0aW9uIGlzU3RyaW5nKGFyZyl7cmV0dXJuIHR5cGVvZiBhcmc9PT0ic3RyaW5nIn1leHBvcnRzLmlzU3RyaW5nPWlzU3RyaW5nO2Z1bmN0aW9uIGlzU3ltYm9sKGFyZyl7cmV0dXJuIHR5cGVvZiBhcmc9PT0ic3ltYm9sIn1leHBvcnRzLmlzU3ltYm9sPWlzU3ltYm9sO2Z1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZyl7cmV0dXJuIGFyZz09PXZvaWQgMH1leHBvcnRzLmlzVW5kZWZpbmVkPWlzVW5kZWZpbmVkO2Z1bmN0aW9uIGlzUmVnRXhwKHJlKXtyZXR1cm4gb2JqZWN0VG9TdHJpbmcocmUpPT09IltvYmplY3QgUmVnRXhwXSJ9ZXhwb3J0cy5pc1JlZ0V4cD1pc1JlZ0V4cDtmdW5jdGlvbiBpc09iamVjdChhcmcpe3JldHVybiB0eXBlb2YgYXJnPT09Im9iamVjdCImJmFyZyE9PW51bGx9ZXhwb3J0cy5pc09iamVjdD1pc09iamVjdDtmdW5jdGlvbiBpc0RhdGUoZCl7cmV0dXJuIG9iamVjdFRvU3RyaW5nKGQpPT09IltvYmplY3QgRGF0ZV0ifWV4cG9ydHMuaXNEYXRlPWlzRGF0ZTtmdW5jdGlvbiBpc0Vycm9yKGUpe3JldHVybiBvYmplY3RUb1N0cmluZyhlKT09PSJbb2JqZWN0IEVycm9yXSJ8fGUgaW5zdGFuY2VvZiBFcnJvcn1leHBvcnRzLmlzRXJyb3I9aXNFcnJvcjtmdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZyl7cmV0dXJuIHR5cGVvZiBhcmc9PT0iZnVuY3Rpb24ifWV4cG9ydHMuaXNGdW5jdGlvbj1pc0Z1bmN0aW9uO2Z1bmN0aW9uIGlzUHJpbWl0aXZlKGFyZyl7cmV0dXJuIGFyZz09PW51bGx8fHR5cGVvZiBhcmc9PT0iYm9vbGVhbiJ8fHR5cGVvZiBhcmc9PT0ibnVtYmVyInx8dHlwZW9mIGFyZz09PSJzdHJpbmcifHx0eXBlb2YgYXJnPT09InN5bWJvbCJ8fHR5cGVvZiBhcmc9PT0idW5kZWZpbmVkIn1leHBvcnRzLmlzUHJpbWl0aXZlPWlzUHJpbWl0aXZlO2V4cG9ydHMuaXNCdWZmZXI9QnVmZmVyLmlzQnVmZmVyO2Z1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pe3JldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyl9fSkuY2FsbCh0aGlzLHtpc0J1ZmZlcjpyZXF1aXJlKCIuLi8uLi9pcy1idWZmZXIvaW5kZXguanMiKX0pfSx7Ii4uLy4uL2lzLWJ1ZmZlci9pbmRleC5qcyI6Mzd9XSwzMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO3ZhciBpbmhlcml0cz1yZXF1aXJlKCJpbmhlcml0cyIpO3ZhciBNRDU9cmVxdWlyZSgibWQ1LmpzIik7dmFyIFJJUEVNRDE2MD1yZXF1aXJlKCJyaXBlbWQxNjAiKTt2YXIgc2hhPXJlcXVpcmUoInNoYS5qcyIpO3ZhciBCYXNlPXJlcXVpcmUoImNpcGhlci1iYXNlIik7ZnVuY3Rpb24gSGFzaChoYXNoKXtCYXNlLmNhbGwodGhpcywiZGlnZXN0Iik7dGhpcy5faGFzaD1oYXNofWluaGVyaXRzKEhhc2gsQmFzZSk7SGFzaC5wcm90b3R5cGUuX3VwZGF0ZT1mdW5jdGlvbihkYXRhKXt0aGlzLl9oYXNoLnVwZGF0ZShkYXRhKX07SGFzaC5wcm90b3R5cGUuX2ZpbmFsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2hhc2guZGlnZXN0KCl9O21vZHVsZS5leHBvcnRzPWZ1bmN0aW9uIGNyZWF0ZUhhc2goYWxnKXthbGc9YWxnLnRvTG93ZXJDYXNlKCk7aWYoYWxnPT09Im1kNSIpcmV0dXJuIG5ldyBNRDU7aWYoYWxnPT09InJtZDE2MCJ8fGFsZz09PSJyaXBlbWQxNjAiKXJldHVybiBuZXcgUklQRU1EMTYwO3JldHVybiBuZXcgSGFzaChzaGEoYWxnKSl9fSx7ImNpcGhlci1iYXNlIjoyOCxpbmhlcml0czozNiwibWQ1LmpzIjozOSxyaXBlbWQxNjA6ODIsInNoYS5qcyI6OTV9XSwzMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIE1ENT1yZXF1aXJlKCJtZDUuanMiKTttb2R1bGUuZXhwb3J0cz1mdW5jdGlvbihidWZmZXIpe3JldHVybihuZXcgTUQ1KS51cGRhdGUoYnVmZmVyKS5kaWdlc3QoKX19LHsibWQ1LmpzIjozOX1dLDMzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXt2YXIgb2JqZWN0Q3JlYXRlPU9iamVjdC5jcmVhdGV8fG9iamVjdENyZWF0ZVBvbHlmaWxsO3ZhciBvYmplY3RLZXlzPU9iamVjdC5rZXlzfHxvYmplY3RLZXlzUG9seWZpbGw7dmFyIGJpbmQ9RnVuY3Rpb24ucHJvdG90eXBlLmJpbmR8fGZ1bmN0aW9uQmluZFBvbHlmaWxsO2Z1bmN0aW9uIEV2ZW50RW1pdHRlcigpe2lmKCF0aGlzLl9ldmVudHN8fCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywiX2V2ZW50cyIpKXt0aGlzLl9ldmVudHM9b2JqZWN0Q3JlYXRlKG51bGwpO3RoaXMuX2V2ZW50c0NvdW50PTB9dGhpcy5fbWF4TGlzdGVuZXJzPXRoaXMuX21heExpc3RlbmVyc3x8dW5kZWZpbmVkfW1vZHVsZS5leHBvcnRzPUV2ZW50RW1pdHRlcjtFdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyPUV2ZW50RW1pdHRlcjtFdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHM9dW5kZWZpbmVkO0V2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycz11bmRlZmluZWQ7dmFyIGRlZmF1bHRNYXhMaXN0ZW5lcnM9MTA7dmFyIGhhc0RlZmluZVByb3BlcnR5O3RyeXt2YXIgbz17fTtpZihPYmplY3QuZGVmaW5lUHJvcGVydHkpT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIngiLHt2YWx1ZTowfSk7aGFzRGVmaW5lUHJvcGVydHk9by54PT09MH1jYXRjaChlcnIpe2hhc0RlZmluZVByb3BlcnR5PWZhbHNlfWlmKGhhc0RlZmluZVByb3BlcnR5KXtPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCJkZWZhdWx0TWF4TGlzdGVuZXJzIix7ZW51bWVyYWJsZTp0cnVlLGdldDpmdW5jdGlvbigpe3JldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzfSxzZXQ6ZnVuY3Rpb24oYXJnKXtpZih0eXBlb2YgYXJnIT09Im51bWJlciJ8fGFyZzwwfHxhcmchPT1hcmcpdGhyb3cgbmV3IFR5cGVFcnJvcignImRlZmF1bHRNYXhMaXN0ZW5lcnMiIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtkZWZhdWx0TWF4TGlzdGVuZXJzPWFyZ319KX1lbHNle0V2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzPWRlZmF1bHRNYXhMaXN0ZW5lcnN9RXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnM9ZnVuY3Rpb24gc2V0TWF4TGlzdGVuZXJzKG4pe2lmKHR5cGVvZiBuIT09Im51bWJlciJ8fG48MHx8aXNOYU4obikpdGhyb3cgbmV3IFR5cGVFcnJvcignIm4iIGFyZ3VtZW50IG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTt0aGlzLl9tYXhMaXN0ZW5lcnM9bjtyZXR1cm4gdGhpc307ZnVuY3Rpb24gJGdldE1heExpc3RlbmVycyh0aGF0KXtpZih0aGF0Ll9tYXhMaXN0ZW5lcnM9PT11bmRlZmluZWQpcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO3JldHVybiB0aGF0Ll9tYXhMaXN0ZW5lcnN9RXZlbnRFbWl0dGVyLnByb3RvdHlwZS5nZXRNYXhMaXN0ZW5lcnM9ZnVuY3Rpb24gZ2V0TWF4TGlzdGVuZXJzKCl7cmV0dXJuICRnZXRNYXhMaXN0ZW5lcnModGhpcyl9O2Z1bmN0aW9uIGVtaXROb25lKGhhbmRsZXIsaXNGbixzZWxmKXtpZihpc0ZuKWhhbmRsZXIuY2FsbChzZWxmKTtlbHNle3ZhciBsZW49aGFuZGxlci5sZW5ndGg7dmFyIGxpc3RlbmVycz1hcnJheUNsb25lKGhhbmRsZXIsbGVuKTtmb3IodmFyIGk9MDtpPGxlbjsrK2kpbGlzdGVuZXJzW2ldLmNhbGwoc2VsZil9fWZ1bmN0aW9uIGVtaXRPbmUoaGFuZGxlcixpc0ZuLHNlbGYsYXJnMSl7aWYoaXNGbiloYW5kbGVyLmNhbGwoc2VsZixhcmcxKTtlbHNle3ZhciBsZW49aGFuZGxlci5sZW5ndGg7dmFyIGxpc3RlbmVycz1hcnJheUNsb25lKGhhbmRsZXIsbGVuKTtmb3IodmFyIGk9MDtpPGxlbjsrK2kpbGlzdGVuZXJzW2ldLmNhbGwoc2VsZixhcmcxKX19ZnVuY3Rpb24gZW1pdFR3byhoYW5kbGVyLGlzRm4sc2VsZixhcmcxLGFyZzIpe2lmKGlzRm4paGFuZGxlci5jYWxsKHNlbGYsYXJnMSxhcmcyKTtlbHNle3ZhciBsZW49aGFuZGxlci5sZW5ndGg7dmFyIGxpc3RlbmVycz1hcnJheUNsb25lKGhhbmRsZXIsbGVuKTtmb3IodmFyIGk9MDtpPGxlbjsrK2kpbGlzdGVuZXJzW2ldLmNhbGwoc2VsZixhcmcxLGFyZzIpfX1mdW5jdGlvbiBlbWl0VGhyZWUoaGFuZGxlcixpc0ZuLHNlbGYsYXJnMSxhcmcyLGFyZzMpe2lmKGlzRm4paGFuZGxlci5jYWxsKHNlbGYsYXJnMSxhcmcyLGFyZzMpO2Vsc2V7dmFyIGxlbj1oYW5kbGVyLmxlbmd0aDt2YXIgbGlzdGVuZXJzPWFycmF5Q2xvbmUoaGFuZGxlcixsZW4pO2Zvcih2YXIgaT0wO2k8bGVuOysraSlsaXN0ZW5lcnNbaV0uY2FsbChzZWxmLGFyZzEsYXJnMixhcmczKX19ZnVuY3Rpb24gZW1pdE1hbnkoaGFuZGxlcixpc0ZuLHNlbGYsYXJncyl7aWYoaXNGbiloYW5kbGVyLmFwcGx5KHNlbGYsYXJncyk7ZWxzZXt2YXIgbGVuPWhhbmRsZXIubGVuZ3RoO3ZhciBsaXN0ZW5lcnM9YXJyYXlDbG9uZShoYW5kbGVyLGxlbik7Zm9yKHZhciBpPTA7aTxsZW47KytpKWxpc3RlbmVyc1tpXS5hcHBseShzZWxmLGFyZ3MpfX1FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQ9ZnVuY3Rpb24gZW1pdCh0eXBlKXt2YXIgZXIsaGFuZGxlcixsZW4sYXJncyxpLGV2ZW50czt2YXIgZG9FcnJvcj10eXBlPT09ImVycm9yIjtldmVudHM9dGhpcy5fZXZlbnRzO2lmKGV2ZW50cylkb0Vycm9yPWRvRXJyb3ImJmV2ZW50cy5lcnJvcj09bnVsbDtlbHNlIGlmKCFkb0Vycm9yKXJldHVybiBmYWxzZTtpZihkb0Vycm9yKXtpZihhcmd1bWVudHMubGVuZ3RoPjEpZXI9YXJndW1lbnRzWzFdO2lmKGVyIGluc3RhbmNlb2YgRXJyb3Ipe3Rocm93IGVyfWVsc2V7dmFyIGVycj1uZXcgRXJyb3IoJ1VuaGFuZGxlZCAiZXJyb3IiIGV2ZW50LiAoJytlcisiKSIpO2Vyci5jb250ZXh0PWVyO3Rocm93IGVycn1yZXR1cm4gZmFsc2V9aGFuZGxlcj1ldmVudHNbdHlwZV07aWYoIWhhbmRsZXIpcmV0dXJuIGZhbHNlO3ZhciBpc0ZuPXR5cGVvZiBoYW5kbGVyPT09ImZ1bmN0aW9uIjtsZW49YXJndW1lbnRzLmxlbmd0aDtzd2l0Y2gobGVuKXtjYXNlIDE6ZW1pdE5vbmUoaGFuZGxlcixpc0ZuLHRoaXMpO2JyZWFrO2Nhc2UgMjplbWl0T25lKGhhbmRsZXIsaXNGbix0aGlzLGFyZ3VtZW50c1sxXSk7YnJlYWs7Y2FzZSAzOmVtaXRUd28oaGFuZGxlcixpc0ZuLHRoaXMsYXJndW1lbnRzWzFdLGFyZ3VtZW50c1syXSk7YnJlYWs7Y2FzZSA0OmVtaXRUaHJlZShoYW5kbGVyLGlzRm4sdGhpcyxhcmd1bWVudHNbMV0sYXJndW1lbnRzWzJdLGFyZ3VtZW50c1szXSk7YnJlYWs7ZGVmYXVsdDphcmdzPW5ldyBBcnJheShsZW4tMSk7Zm9yKGk9MTtpPGxlbjtpKyspYXJnc1tpLTFdPWFyZ3VtZW50c1tpXTtlbWl0TWFueShoYW5kbGVyLGlzRm4sdGhpcyxhcmdzKX1yZXR1cm4gdHJ1ZX07ZnVuY3Rpb24gX2FkZExpc3RlbmVyKHRhcmdldCx0eXBlLGxpc3RlbmVyLHByZXBlbmQpe3ZhciBtO3ZhciBldmVudHM7dmFyIGV4aXN0aW5nO2lmKHR5cGVvZiBsaXN0ZW5lciE9PSJmdW5jdGlvbiIpdGhyb3cgbmV3IFR5cGVFcnJvcignImxpc3RlbmVyIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtldmVudHM9dGFyZ2V0Ll9ldmVudHM7aWYoIWV2ZW50cyl7ZXZlbnRzPXRhcmdldC5fZXZlbnRzPW9iamVjdENyZWF0ZShudWxsKTt0YXJnZXQuX2V2ZW50c0NvdW50PTB9ZWxzZXtpZihldmVudHMubmV3TGlzdGVuZXIpe3RhcmdldC5lbWl0KCJuZXdMaXN0ZW5lciIsdHlwZSxsaXN0ZW5lci5saXN0ZW5lcj9saXN0ZW5lci5saXN0ZW5lcjpsaXN0ZW5lcik7ZXZlbnRzPXRhcmdldC5fZXZlbnRzfWV4aXN0aW5nPWV2ZW50c1t0eXBlXX1pZighZXhpc3Rpbmcpe2V4aXN0aW5nPWV2ZW50c1t0eXBlXT1saXN0ZW5lcjsrK3RhcmdldC5fZXZlbnRzQ291bnR9ZWxzZXtpZih0eXBlb2YgZXhpc3Rpbmc9PT0iZnVuY3Rpb24iKXtleGlzdGluZz1ldmVudHNbdHlwZV09cHJlcGVuZD9bbGlzdGVuZXIsZXhpc3RpbmddOltleGlzdGluZyxsaXN0ZW5lcl19ZWxzZXtpZihwcmVwZW5kKXtleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKX1lbHNle2V4aXN0aW5nLnB1c2gobGlzdGVuZXIpfX1pZighZXhpc3Rpbmcud2FybmVkKXttPSRnZXRNYXhMaXN0ZW5lcnModGFyZ2V0KTtpZihtJiZtPjAmJmV4aXN0aW5nLmxlbmd0aD5tKXtleGlzdGluZy53YXJuZWQ9dHJ1ZTt2YXIgdz1uZXcgRXJyb3IoIlBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgbGVhayBkZXRlY3RlZC4gIitleGlzdGluZy5sZW5ndGgrJyAiJytTdHJpbmcodHlwZSkrJyIgbGlzdGVuZXJzICcrImFkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAiKyJpbmNyZWFzZSBsaW1pdC4iKTt3Lm5hbWU9Ik1heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyI7dy5lbWl0dGVyPXRhcmdldDt3LnR5cGU9dHlwZTt3LmNvdW50PWV4aXN0aW5nLmxlbmd0aDtpZih0eXBlb2YgY29uc29sZT09PSJvYmplY3QiJiZjb25zb2xlLndhcm4pe2NvbnNvbGUud2FybigiJXM6ICVzIix3Lm5hbWUsdy5tZXNzYWdlKX19fX1yZXR1cm4gdGFyZ2V0fUV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI9ZnVuY3Rpb24gYWRkTGlzdGVuZXIodHlwZSxsaXN0ZW5lcil7cmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLHR5cGUsbGlzdGVuZXIsZmFsc2UpfTtFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uPUV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7RXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXI9ZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKHR5cGUsbGlzdGVuZXIpe3JldHVybiBfYWRkTGlzdGVuZXIodGhpcyx0eXBlLGxpc3RlbmVyLHRydWUpfTtmdW5jdGlvbiBvbmNlV3JhcHBlcigpe2lmKCF0aGlzLmZpcmVkKXt0aGlzLnRhcmdldC5yZW1vdmVMaXN0ZW5lcih0aGlzLnR5cGUsdGhpcy53cmFwRm4pO3RoaXMuZmlyZWQ9dHJ1ZTtzd2l0Y2goYXJndW1lbnRzLmxlbmd0aCl7Y2FzZSAwOnJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQpO2Nhc2UgMTpyZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LGFyZ3VtZW50c1swXSk7Y2FzZSAyOnJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSk7Y2FzZSAzOnJldHVybiB0aGlzLmxpc3RlbmVyLmNhbGwodGhpcy50YXJnZXQsYXJndW1lbnRzWzBdLGFyZ3VtZW50c1sxXSxhcmd1bWVudHNbMl0pO2RlZmF1bHQ6dmFyIGFyZ3M9bmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgpO2Zvcih2YXIgaT0wO2k8YXJncy5sZW5ndGg7KytpKWFyZ3NbaV09YXJndW1lbnRzW2ldO3RoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsYXJncyl9fX1mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LHR5cGUsbGlzdGVuZXIpe3ZhciBzdGF0ZT17ZmlyZWQ6ZmFsc2Usd3JhcEZuOnVuZGVmaW5lZCx0YXJnZXQ6dGFyZ2V0LHR5cGU6dHlwZSxsaXN0ZW5lcjpsaXN0ZW5lcn07dmFyIHdyYXBwZWQ9YmluZC5jYWxsKG9uY2VXcmFwcGVyLHN0YXRlKTt3cmFwcGVkLmxpc3RlbmVyPWxpc3RlbmVyO3N0YXRlLndyYXBGbj13cmFwcGVkO3JldHVybiB3cmFwcGVkfUV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZT1mdW5jdGlvbiBvbmNlKHR5cGUsbGlzdGVuZXIpe2lmKHR5cGVvZiBsaXN0ZW5lciE9PSJmdW5jdGlvbiIpdGhyb3cgbmV3IFR5cGVFcnJvcignImxpc3RlbmVyIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTt0aGlzLm9uKHR5cGUsX29uY2VXcmFwKHRoaXMsdHlwZSxsaXN0ZW5lcikpO3JldHVybiB0aGlzfTtFdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXI9ZnVuY3Rpb24gcHJlcGVuZE9uY2VMaXN0ZW5lcih0eXBlLGxpc3RlbmVyKXtpZih0eXBlb2YgbGlzdGVuZXIhPT0iZnVuY3Rpb24iKXRocm93IG5ldyBUeXBlRXJyb3IoJyJsaXN0ZW5lciIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7dGhpcy5wcmVwZW5kTGlzdGVuZXIodHlwZSxfb25jZVdyYXAodGhpcyx0eXBlLGxpc3RlbmVyKSk7cmV0dXJuIHRoaXN9O0V2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXI9ZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIodHlwZSxsaXN0ZW5lcil7dmFyIGxpc3QsZXZlbnRzLHBvc2l0aW9uLGksb3JpZ2luYWxMaXN0ZW5lcjtpZih0eXBlb2YgbGlzdGVuZXIhPT0iZnVuY3Rpb24iKXRocm93IG5ldyBUeXBlRXJyb3IoJyJsaXN0ZW5lciIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7ZXZlbnRzPXRoaXMuX2V2ZW50cztpZighZXZlbnRzKXJldHVybiB0aGlzO2xpc3Q9ZXZlbnRzW3R5cGVdO2lmKCFsaXN0KXJldHVybiB0aGlzO2lmKGxpc3Q9PT1saXN0ZW5lcnx8bGlzdC5saXN0ZW5lcj09PWxpc3RlbmVyKXtpZigtLXRoaXMuX2V2ZW50c0NvdW50PT09MCl0aGlzLl9ldmVudHM9b2JqZWN0Q3JlYXRlKG51bGwpO2Vsc2V7ZGVsZXRlIGV2ZW50c1t0eXBlXTtpZihldmVudHMucmVtb3ZlTGlzdGVuZXIpdGhpcy5lbWl0KCJyZW1vdmVMaXN0ZW5lciIsdHlwZSxsaXN0Lmxpc3RlbmVyfHxsaXN0ZW5lcil9fWVsc2UgaWYodHlwZW9mIGxpc3QhPT0iZnVuY3Rpb24iKXtwb3NpdGlvbj0tMTtmb3IoaT1saXN0Lmxlbmd0aC0xO2k+PTA7aS0tKXtpZihsaXN0W2ldPT09bGlzdGVuZXJ8fGxpc3RbaV0ubGlzdGVuZXI9PT1saXN0ZW5lcil7b3JpZ2luYWxMaXN0ZW5lcj1saXN0W2ldLmxpc3RlbmVyO3Bvc2l0aW9uPWk7YnJlYWt9fWlmKHBvc2l0aW9uPDApcmV0dXJuIHRoaXM7aWYocG9zaXRpb249PT0wKWxpc3Quc2hpZnQoKTtlbHNlIHNwbGljZU9uZShsaXN0LHBvc2l0aW9uKTtpZihsaXN0Lmxlbmd0aD09PTEpZXZlbnRzW3R5cGVdPWxpc3RbMF07aWYoZXZlbnRzLnJlbW92ZUxpc3RlbmVyKXRoaXMuZW1pdCgicmVtb3ZlTGlzdGVuZXIiLHR5cGUsb3JpZ2luYWxMaXN0ZW5lcnx8bGlzdGVuZXIpfXJldHVybiB0aGlzfTtFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycz1mdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSl7dmFyIGxpc3RlbmVycyxldmVudHMsaTtldmVudHM9dGhpcy5fZXZlbnRzO2lmKCFldmVudHMpcmV0dXJuIHRoaXM7aWYoIWV2ZW50cy5yZW1vdmVMaXN0ZW5lcil7aWYoYXJndW1lbnRzLmxlbmd0aD09PTApe3RoaXMuX2V2ZW50cz1vYmplY3RDcmVhdGUobnVsbCk7dGhpcy5fZXZlbnRzQ291bnQ9MH1lbHNlIGlmKGV2ZW50c1t0eXBlXSl7aWYoLS10aGlzLl9ldmVudHNDb3VudD09PTApdGhpcy5fZXZlbnRzPW9iamVjdENyZWF0ZShudWxsKTtlbHNlIGRlbGV0ZSBldmVudHNbdHlwZV19cmV0dXJuIHRoaXN9aWYoYXJndW1lbnRzLmxlbmd0aD09PTApe3ZhciBrZXlzPW9iamVjdEtleXMoZXZlbnRzKTt2YXIga2V5O2ZvcihpPTA7aTxrZXlzLmxlbmd0aDsrK2kpe2tleT1rZXlzW2ldO2lmKGtleT09PSJyZW1vdmVMaXN0ZW5lciIpY29udGludWU7dGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KX10aGlzLnJlbW92ZUFsbExpc3RlbmVycygicmVtb3ZlTGlzdGVuZXIiKTt0aGlzLl9ldmVudHM9b2JqZWN0Q3JlYXRlKG51bGwpO3RoaXMuX2V2ZW50c0NvdW50PTA7cmV0dXJuIHRoaXN9bGlzdGVuZXJzPWV2ZW50c1t0eXBlXTtpZih0eXBlb2YgbGlzdGVuZXJzPT09ImZ1bmN0aW9uIil7dGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLGxpc3RlbmVycyl9ZWxzZSBpZihsaXN0ZW5lcnMpe2ZvcihpPWxpc3RlbmVycy5sZW5ndGgtMTtpPj0wO2ktLSl7dGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLGxpc3RlbmVyc1tpXSl9fXJldHVybiB0aGlzfTtmdW5jdGlvbiBfbGlzdGVuZXJzKHRhcmdldCx0eXBlLHVud3JhcCl7dmFyIGV2ZW50cz10YXJnZXQuX2V2ZW50cztpZighZXZlbnRzKXJldHVybltdO3ZhciBldmxpc3RlbmVyPWV2ZW50c1t0eXBlXTtpZighZXZsaXN0ZW5lcilyZXR1cm5bXTtpZih0eXBlb2YgZXZsaXN0ZW5lcj09PSJmdW5jdGlvbiIpcmV0dXJuIHVud3JhcD9bZXZsaXN0ZW5lci5saXN0ZW5lcnx8ZXZsaXN0ZW5lcl06W2V2bGlzdGVuZXJdO3JldHVybiB1bndyYXA/dW53cmFwTGlzdGVuZXJzKGV2bGlzdGVuZXIpOmFycmF5Q2xvbmUoZXZsaXN0ZW5lcixldmxpc3RlbmVyLmxlbmd0aCl9RXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnM9ZnVuY3Rpb24gbGlzdGVuZXJzKHR5cGUpe3JldHVybiBfbGlzdGVuZXJzKHRoaXMsdHlwZSx0cnVlKX07RXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yYXdMaXN0ZW5lcnM9ZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpe3JldHVybiBfbGlzdGVuZXJzKHRoaXMsdHlwZSxmYWxzZSl9O0V2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50PWZ1bmN0aW9uKGVtaXR0ZXIsdHlwZSl7aWYodHlwZW9mIGVtaXR0ZXIubGlzdGVuZXJDb3VudD09PSJmdW5jdGlvbiIpe3JldHVybiBlbWl0dGVyLmxpc3RlbmVyQ291bnQodHlwZSl9ZWxzZXtyZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsdHlwZSl9fTtFdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQ9bGlzdGVuZXJDb3VudDtmdW5jdGlvbiBsaXN0ZW5lckNvdW50KHR5cGUpe3ZhciBldmVudHM9dGhpcy5fZXZlbnRzO2lmKGV2ZW50cyl7dmFyIGV2bGlzdGVuZXI9ZXZlbnRzW3R5cGVdO2lmKHR5cGVvZiBldmxpc3RlbmVyPT09ImZ1bmN0aW9uIil7cmV0dXJuIDF9ZWxzZSBpZihldmxpc3RlbmVyKXtyZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGh9fXJldHVybiAwfUV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcz1mdW5jdGlvbiBldmVudE5hbWVzKCl7cmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50PjA/UmVmbGVjdC5vd25LZXlzKHRoaXMuX2V2ZW50cyk6W119O2Z1bmN0aW9uIHNwbGljZU9uZShsaXN0LGluZGV4KXtmb3IodmFyIGk9aW5kZXgsaz1pKzEsbj1saXN0Lmxlbmd0aDtrPG47aSs9MSxrKz0xKWxpc3RbaV09bGlzdFtrXTtsaXN0LnBvcCgpfWZ1bmN0aW9uIGFycmF5Q2xvbmUoYXJyLG4pe3ZhciBjb3B5PW5ldyBBcnJheShuKTtmb3IodmFyIGk9MDtpPG47KytpKWNvcHlbaV09YXJyW2ldO3JldHVybiBjb3B5fWZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpe3ZhciByZXQ9bmV3IEFycmF5KGFyci5sZW5ndGgpO2Zvcih2YXIgaT0wO2k8cmV0Lmxlbmd0aDsrK2kpe3JldFtpXT1hcnJbaV0ubGlzdGVuZXJ8fGFycltpXX1yZXR1cm4gcmV0fWZ1bmN0aW9uIG9iamVjdENyZWF0ZVBvbHlmaWxsKHByb3RvKXt2YXIgRj1mdW5jdGlvbigpe307Ri5wcm90b3R5cGU9cHJvdG87cmV0dXJuIG5ldyBGfWZ1bmN0aW9uIG9iamVjdEtleXNQb2x5ZmlsbChvYmope3ZhciBrZXlzPVtdO2Zvcih2YXIgayBpbiBvYmopaWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaixrKSl7a2V5cy5wdXNoKGspfXJldHVybiBrfWZ1bmN0aW9uIGZ1bmN0aW9uQmluZFBvbHlmaWxsKGNvbnRleHQpe3ZhciBmbj10aGlzO3JldHVybiBmdW5jdGlvbigpe3JldHVybiBmbi5hcHBseShjb250ZXh0LGFyZ3VtZW50cyl9fX0se31dLDM0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsidXNlIHN0cmljdCI7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgVHJhbnNmb3JtPXJlcXVpcmUoInJlYWRhYmxlLXN0cmVhbSIpLlRyYW5zZm9ybTt2YXIgaW5oZXJpdHM9cmVxdWlyZSgiaW5oZXJpdHMiKTtmdW5jdGlvbiB0aHJvd0lmTm90U3RyaW5nT3JCdWZmZXIodmFsLHByZWZpeCl7aWYoIUJ1ZmZlci5pc0J1ZmZlcih2YWwpJiZ0eXBlb2YgdmFsIT09InN0cmluZyIpe3Rocm93IG5ldyBUeXBlRXJyb3IocHJlZml4KyIgbXVzdCBiZSBhIHN0cmluZyBvciBhIGJ1ZmZlciIpfX1mdW5jdGlvbiBIYXNoQmFzZShibG9ja1NpemUpe1RyYW5zZm9ybS5jYWxsKHRoaXMpO3RoaXMuX2Jsb2NrPUJ1ZmZlci5hbGxvY1Vuc2FmZShibG9ja1NpemUpO3RoaXMuX2Jsb2NrU2l6ZT1ibG9ja1NpemU7dGhpcy5fYmxvY2tPZmZzZXQ9MDt0aGlzLl9sZW5ndGg9WzAsMCwwLDBdO3RoaXMuX2ZpbmFsaXplZD1mYWxzZX1pbmhlcml0cyhIYXNoQmFzZSxUcmFuc2Zvcm0pO0hhc2hCYXNlLnByb3RvdHlwZS5fdHJhbnNmb3JtPWZ1bmN0aW9uKGNodW5rLGVuY29kaW5nLGNhbGxiYWNrKXt2YXIgZXJyb3I9bnVsbDt0cnl7dGhpcy51cGRhdGUoY2h1bmssZW5jb2RpbmcpfWNhdGNoKGVycil7ZXJyb3I9ZXJyfWNhbGxiYWNrKGVycm9yKX07SGFzaEJhc2UucHJvdG90eXBlLl9mbHVzaD1mdW5jdGlvbihjYWxsYmFjayl7dmFyIGVycm9yPW51bGw7dHJ5e3RoaXMucHVzaCh0aGlzLmRpZ2VzdCgpKX1jYXRjaChlcnIpe2Vycm9yPWVycn1jYWxsYmFjayhlcnJvcil9O0hhc2hCYXNlLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oZGF0YSxlbmNvZGluZyl7dGhyb3dJZk5vdFN0cmluZ09yQnVmZmVyKGRhdGEsIkRhdGEiKTtpZih0aGlzLl9maW5hbGl6ZWQpdGhyb3cgbmV3IEVycm9yKCJEaWdlc3QgYWxyZWFkeSBjYWxsZWQiKTtpZighQnVmZmVyLmlzQnVmZmVyKGRhdGEpKWRhdGE9QnVmZmVyLmZyb20oZGF0YSxlbmNvZGluZyk7dmFyIGJsb2NrPXRoaXMuX2Jsb2NrO3ZhciBvZmZzZXQ9MDt3aGlsZSh0aGlzLl9ibG9ja09mZnNldCtkYXRhLmxlbmd0aC1vZmZzZXQ+PXRoaXMuX2Jsb2NrU2l6ZSl7Zm9yKHZhciBpPXRoaXMuX2Jsb2NrT2Zmc2V0O2k8dGhpcy5fYmxvY2tTaXplOylibG9ja1tpKytdPWRhdGFbb2Zmc2V0KytdO3RoaXMuX3VwZGF0ZSgpO3RoaXMuX2Jsb2NrT2Zmc2V0PTB9d2hpbGUob2Zmc2V0PGRhdGEubGVuZ3RoKWJsb2NrW3RoaXMuX2Jsb2NrT2Zmc2V0KytdPWRhdGFbb2Zmc2V0KytdO2Zvcih2YXIgaj0wLGNhcnJ5PWRhdGEubGVuZ3RoKjg7Y2Fycnk+MDsrK2ope3RoaXMuX2xlbmd0aFtqXSs9Y2Fycnk7Y2Fycnk9dGhpcy5fbGVuZ3RoW2pdLzQyOTQ5NjcyOTZ8MDtpZihjYXJyeT4wKXRoaXMuX2xlbmd0aFtqXS09NDI5NDk2NzI5NipjYXJyeX1yZXR1cm4gdGhpc307SGFzaEJhc2UucHJvdG90eXBlLl91cGRhdGU9ZnVuY3Rpb24oKXt0aHJvdyBuZXcgRXJyb3IoIl91cGRhdGUgaXMgbm90IGltcGxlbWVudGVkIil9O0hhc2hCYXNlLnByb3RvdHlwZS5kaWdlc3Q9ZnVuY3Rpb24oZW5jb2Rpbmcpe2lmKHRoaXMuX2ZpbmFsaXplZCl0aHJvdyBuZXcgRXJyb3IoIkRpZ2VzdCBhbHJlYWR5IGNhbGxlZCIpO3RoaXMuX2ZpbmFsaXplZD10cnVlO3ZhciBkaWdlc3Q9dGhpcy5fZGlnZXN0KCk7aWYoZW5jb2RpbmchPT11bmRlZmluZWQpZGlnZXN0PWRpZ2VzdC50b1N0cmluZyhlbmNvZGluZyk7dGhpcy5fYmxvY2suZmlsbCgwKTt0aGlzLl9ibG9ja09mZnNldD0wO2Zvcih2YXIgaT0wO2k8NDsrK2kpdGhpcy5fbGVuZ3RoW2ldPTA7cmV0dXJuIGRpZ2VzdH07SGFzaEJhc2UucHJvdG90eXBlLl9kaWdlc3Q9ZnVuY3Rpb24oKXt0aHJvdyBuZXcgRXJyb3IoIl9kaWdlc3QgaXMgbm90IGltcGxlbWVudGVkIil9O21vZHVsZS5leHBvcnRzPUhhc2hCYXNlfSx7aW5oZXJpdHM6MzYsInJlYWRhYmxlLXN0cmVhbSI6ODEsInNhZmUtYnVmZmVyIjo4M31dLDM1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtleHBvcnRzLnJlYWQ9ZnVuY3Rpb24oYnVmZmVyLG9mZnNldCxpc0xFLG1MZW4sbkJ5dGVzKXt2YXIgZSxtO3ZhciBlTGVuPW5CeXRlcyo4LW1MZW4tMTt2YXIgZU1heD0oMTw8ZUxlbiktMTt2YXIgZUJpYXM9ZU1heD4+MTt2YXIgbkJpdHM9LTc7dmFyIGk9aXNMRT9uQnl0ZXMtMTowO3ZhciBkPWlzTEU/LTE6MTt2YXIgcz1idWZmZXJbb2Zmc2V0K2ldO2krPWQ7ZT1zJigxPDwtbkJpdHMpLTE7cz4+PS1uQml0cztuQml0cys9ZUxlbjtmb3IoO25CaXRzPjA7ZT1lKjI1NitidWZmZXJbb2Zmc2V0K2ldLGkrPWQsbkJpdHMtPTgpe31tPWUmKDE8PC1uQml0cyktMTtlPj49LW5CaXRzO25CaXRzKz1tTGVuO2Zvcig7bkJpdHM+MDttPW0qMjU2K2J1ZmZlcltvZmZzZXQraV0saSs9ZCxuQml0cy09OCl7fWlmKGU9PT0wKXtlPTEtZUJpYXN9ZWxzZSBpZihlPT09ZU1heCl7cmV0dXJuIG0/TmFOOihzPy0xOjEpKkluZmluaXR5fWVsc2V7bT1tK01hdGgucG93KDIsbUxlbik7ZT1lLWVCaWFzfXJldHVybihzPy0xOjEpKm0qTWF0aC5wb3coMixlLW1MZW4pfTtleHBvcnRzLndyaXRlPWZ1bmN0aW9uKGJ1ZmZlcix2YWx1ZSxvZmZzZXQsaXNMRSxtTGVuLG5CeXRlcyl7dmFyIGUsbSxjO3ZhciBlTGVuPW5CeXRlcyo4LW1MZW4tMTt2YXIgZU1heD0oMTw8ZUxlbiktMTt2YXIgZUJpYXM9ZU1heD4+MTt2YXIgcnQ9bUxlbj09PTIzP01hdGgucG93KDIsLTI0KS1NYXRoLnBvdygyLC03Nyk6MDt2YXIgaT1pc0xFPzA6bkJ5dGVzLTE7dmFyIGQ9aXNMRT8xOi0xO3ZhciBzPXZhbHVlPDB8fHZhbHVlPT09MCYmMS92YWx1ZTwwPzE6MDt2YWx1ZT1NYXRoLmFicyh2YWx1ZSk7aWYoaXNOYU4odmFsdWUpfHx2YWx1ZT09PUluZmluaXR5KXttPWlzTmFOKHZhbHVlKT8xOjA7ZT1lTWF4fWVsc2V7ZT1NYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKS9NYXRoLkxOMik7aWYodmFsdWUqKGM9TWF0aC5wb3coMiwtZSkpPDEpe2UtLTtjKj0yfWlmKGUrZUJpYXM+PTEpe3ZhbHVlKz1ydC9jfWVsc2V7dmFsdWUrPXJ0Kk1hdGgucG93KDIsMS1lQmlhcyl9aWYodmFsdWUqYz49Mil7ZSsrO2MvPTJ9aWYoZStlQmlhcz49ZU1heCl7bT0wO2U9ZU1heH1lbHNlIGlmKGUrZUJpYXM+PTEpe209KHZhbHVlKmMtMSkqTWF0aC5wb3coMixtTGVuKTtlPWUrZUJpYXN9ZWxzZXttPXZhbHVlKk1hdGgucG93KDIsZUJpYXMtMSkqTWF0aC5wb3coMixtTGVuKTtlPTB9fWZvcig7bUxlbj49ODtidWZmZXJbb2Zmc2V0K2ldPW0mMjU1LGkrPWQsbS89MjU2LG1MZW4tPTgpe31lPWU8PG1MZW58bTtlTGVuKz1tTGVuO2Zvcig7ZUxlbj4wO2J1ZmZlcltvZmZzZXQraV09ZSYyNTUsaSs9ZCxlLz0yNTYsZUxlbi09OCl7fWJ1ZmZlcltvZmZzZXQraS1kXXw9cyoxMjh9fSx7fV0sMzY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe2lmKHR5cGVvZiBPYmplY3QuY3JlYXRlPT09ImZ1bmN0aW9uIil7bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24gaW5oZXJpdHMoY3RvcixzdXBlckN0b3Ipe2lmKHN1cGVyQ3Rvcil7Y3Rvci5zdXBlcl89c3VwZXJDdG9yO2N0b3IucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSx7Y29uc3RydWN0b3I6e3ZhbHVlOmN0b3IsZW51bWVyYWJsZTpmYWxzZSx3cml0YWJsZTp0cnVlLGNvbmZpZ3VyYWJsZTp0cnVlfX0pfX19ZWxzZXttb2R1bGUuZXhwb3J0cz1mdW5jdGlvbiBpbmhlcml0cyhjdG9yLHN1cGVyQ3Rvcil7aWYoc3VwZXJDdG9yKXtjdG9yLnN1cGVyXz1zdXBlckN0b3I7dmFyIFRlbXBDdG9yPWZ1bmN0aW9uKCl7fTtUZW1wQ3Rvci5wcm90b3R5cGU9c3VwZXJDdG9yLnByb3RvdHlwZTtjdG9yLnByb3RvdHlwZT1uZXcgVGVtcEN0b3I7Y3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3I9Y3Rvcn19fX0se31dLDM3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cz1mdW5jdGlvbihvYmope3JldHVybiBvYmohPW51bGwmJihpc0J1ZmZlcihvYmopfHxpc1Nsb3dCdWZmZXIob2JqKXx8ISFvYmouX2lzQnVmZmVyKX07ZnVuY3Rpb24gaXNCdWZmZXIob2JqKXtyZXR1cm4hIW9iai5jb25zdHJ1Y3RvciYmdHlwZW9mIG9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcj09PSJmdW5jdGlvbiImJm9iai5jb25zdHJ1Y3Rvci5pc0J1ZmZlcihvYmopfWZ1bmN0aW9uIGlzU2xvd0J1ZmZlcihvYmope3JldHVybiB0eXBlb2Ygb2JqLnJlYWRGbG9hdExFPT09ImZ1bmN0aW9uIiYmdHlwZW9mIG9iai5zbGljZT09PSJmdW5jdGlvbiImJmlzQnVmZmVyKG9iai5zbGljZSgwLDApKX19LHt9XSwzODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIHRvU3RyaW5nPXt9LnRvU3RyaW5nO21vZHVsZS5leHBvcnRzPUFycmF5LmlzQXJyYXl8fGZ1bmN0aW9uKGFycil7cmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKT09IltvYmplY3QgQXJyYXldIn19LHt9XSwzOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO3ZhciBpbmhlcml0cz1yZXF1aXJlKCJpbmhlcml0cyIpO3ZhciBIYXNoQmFzZT1yZXF1aXJlKCJoYXNoLWJhc2UiKTt2YXIgQnVmZmVyPXJlcXVpcmUoInNhZmUtYnVmZmVyIikuQnVmZmVyO3ZhciBBUlJBWTE2PW5ldyBBcnJheSgxNik7ZnVuY3Rpb24gTUQ1KCl7SGFzaEJhc2UuY2FsbCh0aGlzLDY0KTt0aGlzLl9hPTE3MzI1ODQxOTM7dGhpcy5fYj00MDIzMjMzNDE3O3RoaXMuX2M9MjU2MjM4MzEwMjt0aGlzLl9kPTI3MTczMzg3OH1pbmhlcml0cyhNRDUsSGFzaEJhc2UpO01ENS5wcm90b3R5cGUuX3VwZGF0ZT1mdW5jdGlvbigpe3ZhciBNPUFSUkFZMTY7Zm9yKHZhciBpPTA7aTwxNjsrK2kpTVtpXT10aGlzLl9ibG9jay5yZWFkSW50MzJMRShpKjQpO3ZhciBhPXRoaXMuX2E7dmFyIGI9dGhpcy5fYjt2YXIgYz10aGlzLl9jO3ZhciBkPXRoaXMuX2Q7YT1mbkYoYSxiLGMsZCxNWzBdLDM2MTQwOTAzNjAsNyk7ZD1mbkYoZCxhLGIsYyxNWzFdLDM5MDU0MDI3MTAsMTIpO2M9Zm5GKGMsZCxhLGIsTVsyXSw2MDYxMDU4MTksMTcpO2I9Zm5GKGIsYyxkLGEsTVszXSwzMjUwNDQxOTY2LDIyKTthPWZuRihhLGIsYyxkLE1bNF0sNDExODU0ODM5OSw3KTtkPWZuRihkLGEsYixjLE1bNV0sMTIwMDA4MDQyNiwxMik7Yz1mbkYoYyxkLGEsYixNWzZdLDI4MjE3MzU5NTUsMTcpO2I9Zm5GKGIsYyxkLGEsTVs3XSw0MjQ5MjYxMzEzLDIyKTthPWZuRihhLGIsYyxkLE1bOF0sMTc3MDAzNTQxNiw3KTtkPWZuRihkLGEsYixjLE1bOV0sMjMzNjU1Mjg3OSwxMik7Yz1mbkYoYyxkLGEsYixNWzEwXSw0Mjk0OTI1MjMzLDE3KTtiPWZuRihiLGMsZCxhLE1bMTFdLDIzMDQ1NjMxMzQsMjIpO2E9Zm5GKGEsYixjLGQsTVsxMl0sMTgwNDYwMzY4Miw3KTtkPWZuRihkLGEsYixjLE1bMTNdLDQyNTQ2MjYxOTUsMTIpO2M9Zm5GKGMsZCxhLGIsTVsxNF0sMjc5Mjk2NTAwNiwxNyk7Yj1mbkYoYixjLGQsYSxNWzE1XSwxMjM2NTM1MzI5LDIyKTthPWZuRyhhLGIsYyxkLE1bMV0sNDEyOTE3MDc4Niw1KTtkPWZuRyhkLGEsYixjLE1bNl0sMzIyNTQ2NTY2NCw5KTtjPWZuRyhjLGQsYSxiLE1bMTFdLDY0MzcxNzcxMywxNCk7Yj1mbkcoYixjLGQsYSxNWzBdLDM5MjEwNjk5OTQsMjApO2E9Zm5HKGEsYixjLGQsTVs1XSwzNTkzNDA4NjA1LDUpO2Q9Zm5HKGQsYSxiLGMsTVsxMF0sMzgwMTYwODMsOSk7Yz1mbkcoYyxkLGEsYixNWzE1XSwzNjM0NDg4OTYxLDE0KTtiPWZuRyhiLGMsZCxhLE1bNF0sMzg4OTQyOTQ0OCwyMCk7YT1mbkcoYSxiLGMsZCxNWzldLDU2ODQ0NjQzOCw1KTtkPWZuRyhkLGEsYixjLE1bMTRdLDMyNzUxNjM2MDYsOSk7Yz1mbkcoYyxkLGEsYixNWzNdLDQxMDc2MDMzMzUsMTQpO2I9Zm5HKGIsYyxkLGEsTVs4XSwxMTYzNTMxNTAxLDIwKTthPWZuRyhhLGIsYyxkLE1bMTNdLDI4NTAyODU4MjksNSk7ZD1mbkcoZCxhLGIsYyxNWzJdLDQyNDM1NjM1MTIsOSk7Yz1mbkcoYyxkLGEsYixNWzddLDE3MzUzMjg0NzMsMTQpO2I9Zm5HKGIsYyxkLGEsTVsxMl0sMjM2ODM1OTU2MiwyMCk7YT1mbkgoYSxiLGMsZCxNWzVdLDQyOTQ1ODg3MzgsNCk7ZD1mbkgoZCxhLGIsYyxNWzhdLDIyNzIzOTI4MzMsMTEpO2M9Zm5IKGMsZCxhLGIsTVsxMV0sMTgzOTAzMDU2MiwxNik7Yj1mbkgoYixjLGQsYSxNWzE0XSw0MjU5NjU3NzQwLDIzKTthPWZuSChhLGIsYyxkLE1bMV0sMjc2Mzk3NTIzNiw0KTtkPWZuSChkLGEsYixjLE1bNF0sMTI3Mjg5MzM1MywxMSk7Yz1mbkgoYyxkLGEsYixNWzddLDQxMzk0Njk2NjQsMTYpO2I9Zm5IKGIsYyxkLGEsTVsxMF0sMzIwMDIzNjY1NiwyMyk7YT1mbkgoYSxiLGMsZCxNWzEzXSw2ODEyNzkxNzQsNCk7ZD1mbkgoZCxhLGIsYyxNWzBdLDM5MzY0MzAwNzQsMTEpO2M9Zm5IKGMsZCxhLGIsTVszXSwzNTcyNDQ1MzE3LDE2KTtiPWZuSChiLGMsZCxhLE1bNl0sNzYwMjkxODksMjMpO2E9Zm5IKGEsYixjLGQsTVs5XSwzNjU0NjAyODA5LDQpO2Q9Zm5IKGQsYSxiLGMsTVsxMl0sMzg3MzE1MTQ2MSwxMSk7Yz1mbkgoYyxkLGEsYixNWzE1XSw1MzA3NDI1MjAsMTYpO2I9Zm5IKGIsYyxkLGEsTVsyXSwzMjk5NjI4NjQ1LDIzKTthPWZuSShhLGIsYyxkLE1bMF0sNDA5NjMzNjQ1Miw2KTtkPWZuSShkLGEsYixjLE1bN10sMTEyNjg5MTQxNSwxMCk7Yz1mbkkoYyxkLGEsYixNWzE0XSwyODc4NjEyMzkxLDE1KTtiPWZuSShiLGMsZCxhLE1bNV0sNDIzNzUzMzI0MSwyMSk7YT1mbkkoYSxiLGMsZCxNWzEyXSwxNzAwNDg1NTcxLDYpO2Q9Zm5JKGQsYSxiLGMsTVszXSwyMzk5OTgwNjkwLDEwKTtjPWZuSShjLGQsYSxiLE1bMTBdLDQyOTM5MTU3NzMsMTUpO2I9Zm5JKGIsYyxkLGEsTVsxXSwyMjQwMDQ0NDk3LDIxKTthPWZuSShhLGIsYyxkLE1bOF0sMTg3MzMxMzM1OSw2KTtkPWZuSShkLGEsYixjLE1bMTVdLDQyNjQzNTU1NTIsMTApO2M9Zm5JKGMsZCxhLGIsTVs2XSwyNzM0NzY4OTE2LDE1KTtiPWZuSShiLGMsZCxhLE1bMTNdLDEzMDkxNTE2NDksMjEpO2E9Zm5JKGEsYixjLGQsTVs0XSw0MTQ5NDQ0MjI2LDYpO2Q9Zm5JKGQsYSxiLGMsTVsxMV0sMzE3NDc1NjkxNywxMCk7Yz1mbkkoYyxkLGEsYixNWzJdLDcxODc4NzI1OSwxNSk7Yj1mbkkoYixjLGQsYSxNWzldLDM5NTE0ODE3NDUsMjEpO3RoaXMuX2E9dGhpcy5fYSthfDA7dGhpcy5fYj10aGlzLl9iK2J8MDt0aGlzLl9jPXRoaXMuX2MrY3wwO3RoaXMuX2Q9dGhpcy5fZCtkfDB9O01ENS5wcm90b3R5cGUuX2RpZ2VzdD1mdW5jdGlvbigpe3RoaXMuX2Jsb2NrW3RoaXMuX2Jsb2NrT2Zmc2V0KytdPTEyODtpZih0aGlzLl9ibG9ja09mZnNldD41Nil7dGhpcy5fYmxvY2suZmlsbCgwLHRoaXMuX2Jsb2NrT2Zmc2V0LDY0KTt0aGlzLl91cGRhdGUoKTt0aGlzLl9ibG9ja09mZnNldD0wfXRoaXMuX2Jsb2NrLmZpbGwoMCx0aGlzLl9ibG9ja09mZnNldCw1Nik7dGhpcy5fYmxvY2sud3JpdGVVSW50MzJMRSh0aGlzLl9sZW5ndGhbMF0sNTYpO3RoaXMuX2Jsb2NrLndyaXRlVUludDMyTEUodGhpcy5fbGVuZ3RoWzFdLDYwKTt0aGlzLl91cGRhdGUoKTt2YXIgYnVmZmVyPUJ1ZmZlci5hbGxvY1Vuc2FmZSgxNik7YnVmZmVyLndyaXRlSW50MzJMRSh0aGlzLl9hLDApO2J1ZmZlci53cml0ZUludDMyTEUodGhpcy5fYiw0KTtidWZmZXIud3JpdGVJbnQzMkxFKHRoaXMuX2MsOCk7YnVmZmVyLndyaXRlSW50MzJMRSh0aGlzLl9kLDEyKTtyZXR1cm4gYnVmZmVyfTtmdW5jdGlvbiByb3RsKHgsbil7cmV0dXJuIHg8PG58eD4+PjMyLW59ZnVuY3Rpb24gZm5GKGEsYixjLGQsbSxrLHMpe3JldHVybiByb3RsKGErKGImY3x+YiZkKSttK2t8MCxzKStifDB9ZnVuY3Rpb24gZm5HKGEsYixjLGQsbSxrLHMpe3JldHVybiByb3RsKGErKGImZHxjJn5kKSttK2t8MCxzKStifDB9ZnVuY3Rpb24gZm5IKGEsYixjLGQsbSxrLHMpe3JldHVybiByb3RsKGErKGJeY15kKSttK2t8MCxzKStifDB9ZnVuY3Rpb24gZm5JKGEsYixjLGQsbSxrLHMpe3JldHVybiByb3RsKGErKGNeKGJ8fmQpKSttK2t8MCxzKStifDB9bW9kdWxlLmV4cG9ydHM9TUQ1fSx7Imhhc2gtYmFzZSI6MzQsaW5oZXJpdHM6MzYsInNhZmUtYnVmZmVyIjo4M31dLDQwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsidXNlIHN0cmljdCI7ZXhwb3J0cy5fX2VzTW9kdWxlPXRydWU7aWYoIUFycmF5QnVmZmVyWyJpc1ZpZXciXSl7QXJyYXlCdWZmZXIuaXNWaWV3PWZ1bmN0aW9uIGlzVmlldyhhKXtyZXR1cm4gYSE9PW51bGwmJnR5cGVvZiBhPT09Im9iamVjdCImJmFbImJ1ZmZlciJdaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcn19fSx7fV0sNDE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyJ1c2Ugc3RyaWN0IjtleHBvcnRzLl9fZXNNb2R1bGU9dHJ1ZTtleHBvcnRzLlBvbHlmaWxsPWV4cG9ydHMuTGlnaHRNYXBJbXBsPXZvaWQgMDt2YXIgTGlnaHRNYXBJbXBsPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gTGlnaHRNYXBJbXBsKCl7dGhpcy5yZWNvcmQ9W119TGlnaHRNYXBJbXBsLnByb3RvdHlwZS5oYXM9ZnVuY3Rpb24oa2V5KXtyZXR1cm4gdGhpcy5yZWNvcmQubWFwKGZ1bmN0aW9uKF9hKXt2YXIgX2tleT1fYVswXTtyZXR1cm4gX2tleX0pLmluZGV4T2Yoa2V5KT49MH07TGlnaHRNYXBJbXBsLnByb3RvdHlwZS5nZXQ9ZnVuY3Rpb24oa2V5KXt2YXIgZW50cnk9dGhpcy5yZWNvcmQuZmlsdGVyKGZ1bmN0aW9uKF9hKXt2YXIgX2tleT1fYVswXTtyZXR1cm4gX2tleT09PWtleX0pWzBdO2lmKGVudHJ5PT09dW5kZWZpbmVkKXtyZXR1cm4gdW5kZWZpbmVkfXJldHVybiBlbnRyeVsxXX07TGlnaHRNYXBJbXBsLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oa2V5LHZhbHVlKXt2YXIgZW50cnk9dGhpcy5yZWNvcmQuZmlsdGVyKGZ1bmN0aW9uKF9hKXt2YXIgX2tleT1fYVswXTtyZXR1cm4gX2tleT09PWtleX0pWzBdO2lmKGVudHJ5PT09dW5kZWZpbmVkKXt0aGlzLnJlY29yZC5wdXNoKFtrZXksdmFsdWVdKX1lbHNle2VudHJ5WzFdPXZhbHVlfXJldHVybiB0aGlzfTtMaWdodE1hcEltcGwucHJvdG90eXBlWyJkZWxldGUiXT1mdW5jdGlvbihrZXkpe3ZhciBpbmRleD10aGlzLnJlY29yZC5tYXAoZnVuY3Rpb24oX2Epe3ZhciBrZXk9X2FbMF07cmV0dXJuIGtleX0pLmluZGV4T2Yoa2V5KTtpZihpbmRleDwwKXtyZXR1cm4gZmFsc2V9dGhpcy5yZWNvcmQuc3BsaWNlKGluZGV4LDEpO3JldHVybiB0cnVlfTtMaWdodE1hcEltcGwucHJvdG90eXBlLmtleXM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5yZWNvcmQubWFwKGZ1bmN0aW9uKF9hKXt2YXIga2V5PV9hWzBdO3JldHVybiBrZXl9KX07cmV0dXJuIExpZ2h0TWFwSW1wbH0oKTtleHBvcnRzLkxpZ2h0TWFwSW1wbD1MaWdodE1hcEltcGw7ZXhwb3J0cy5Qb2x5ZmlsbD10eXBlb2YgTWFwIT09InVuZGVmaW5lZCI/TWFwOkxpZ2h0TWFwSW1wbH0se31dLDQyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oQnVmZmVyKXt2YXIgY29uc3RhbnRzPXJlcXVpcmUoImNvbnN0YW50cyIpO3ZhciByc2E9cmVxdWlyZSgiLi9saWJzL3JzYS5qcyIpO3ZhciBfPXJlcXVpcmUoIi4vdXRpbHMiKS5fO3ZhciB1dGlscz1yZXF1aXJlKCIuL3V0aWxzIik7dmFyIHNjaGVtZXM9cmVxdWlyZSgiLi9zY2hlbWVzL3NjaGVtZXMuanMiKTt2YXIgZm9ybWF0cz1yZXF1aXJlKCIuL2Zvcm1hdHMvZm9ybWF0cy5qcyIpO3ZhciBzZWVkcmFuZG9tPXJlcXVpcmUoInNlZWRyYW5kb20iKTtpZih0eXBlb2YgY29uc3RhbnRzLlJTQV9OT19QQURESU5HPT09InVuZGVmaW5lZCIpe2NvbnN0YW50cy5SU0FfTk9fUEFERElORz0zfW1vZHVsZS5leHBvcnRzPWZ1bmN0aW9uKCl7dmFyIFNVUFBPUlRFRF9IQVNIX0FMR09SSVRITVM9e25vZGUxMDpbIm1kNCIsIm1kNSIsInJpcGVtZDE2MCIsInNoYTEiLCJzaGEyMjQiLCJzaGEyNTYiLCJzaGEzODQiLCJzaGE1MTIiXSxub2RlOlsibWQ0IiwibWQ1IiwicmlwZW1kMTYwIiwic2hhMSIsInNoYTIyNCIsInNoYTI1NiIsInNoYTM4NCIsInNoYTUxMiJdLGlvanM6WyJtZDQiLCJtZDUiLCJyaXBlbWQxNjAiLCJzaGExIiwic2hhMjI0Iiwic2hhMjU2Iiwic2hhMzg0Iiwic2hhNTEyIl0sYnJvd3NlcjpbIm1kNSIsInJpcGVtZDE2MCIsInNoYTEiLCJzaGEyNTYiLCJzaGE1MTIiXX07dmFyIERFRkFVTFRfRU5DUllQVElPTl9TQ0hFTUU9InBrY3MxX29hZXAiO3ZhciBERUZBVUxUX1NJR05JTkdfU0NIRU1FPSJwa2NzMSI7dmFyIERFRkFVTFRfRVhQT1JUX0ZPUk1BVD0icHJpdmF0ZSI7dmFyIEVYUE9SVF9GT1JNQVRfQUxJQVNFUz17cHJpdmF0ZToicGtjczEtcHJpdmF0ZS1wZW0iLCJwcml2YXRlLWRlciI6InBrY3MxLXByaXZhdGUtZGVyIixwdWJsaWM6InBrY3M4LXB1YmxpYy1wZW0iLCJwdWJsaWMtZGVyIjoicGtjczgtcHVibGljLWRlciJ9O2Z1bmN0aW9uIE5vZGVSU0Eoa2V5LGZvcm1hdCxvcHRpb25zKXtpZighKHRoaXMgaW5zdGFuY2VvZiBOb2RlUlNBKSl7cmV0dXJuIG5ldyBOb2RlUlNBKGtleSxmb3JtYXQsb3B0aW9ucyl9aWYoXy5pc09iamVjdChmb3JtYXQpKXtvcHRpb25zPWZvcm1hdDtmb3JtYXQ9dW5kZWZpbmVkfXRoaXMuJG9wdGlvbnM9e3NpZ25pbmdTY2hlbWU6REVGQVVMVF9TSUdOSU5HX1NDSEVNRSxzaWduaW5nU2NoZW1lT3B0aW9uczp7aGFzaDoic2hhMjU2IixzYWx0TGVuZ3RoOm51bGx9LGVuY3J5cHRpb25TY2hlbWU6REVGQVVMVF9FTkNSWVBUSU9OX1NDSEVNRSxlbmNyeXB0aW9uU2NoZW1lT3B0aW9uczp7aGFzaDoic2hhMSIsbGFiZWw6bnVsbH0sZW52aXJvbm1lbnQ6dXRpbHMuZGV0ZWN0RW52aXJvbm1lbnQoKSxyc2FVdGlsczp0aGlzfTt0aGlzLmtleVBhaXI9bmV3IHJzYS5LZXk7dGhpcy4kY2FjaGU9e307aWYoQnVmZmVyLmlzQnVmZmVyKGtleSl8fF8uaXNTdHJpbmcoa2V5KSl7dGhpcy5pbXBvcnRLZXkoa2V5LGZvcm1hdCl9ZWxzZSBpZihfLmlzT2JqZWN0KGtleSkpe3RoaXMuZ2VuZXJhdGVLZXlQYWlyKGtleS5iLGtleS5lKX10aGlzLnNldE9wdGlvbnMob3B0aW9ucyl9Tm9kZVJTQS5nZW5lcmF0ZUtleVBhaXJGcm9tU2VlZD1mdW5jdGlvbiBnZW5lcmF0ZUtleVBhaXJGcm9tU2VlZChzZWVkLGJpdHMsZXhwLGVudmlyb25tZW50KXt2YXIgcmFuZG9tQmFja3VwPU1hdGgucmFuZG9tO2lmKHNlZWQhPT1udWxsKXtNYXRoLnJhbmRvbT1mdW5jdGlvbigpe3ZhciBwcmV2PXVuZGVmaW5lZDtmdW5jdGlvbiByYW5kb20oKXtwcmV2PXNlZWRyYW5kb20ocHJldj09PXVuZGVmaW5lZD9CdWZmZXIuZnJvbShzZWVkLmJ1ZmZlcixzZWVkLmJ5dGVPZmZzZXQsc2VlZC5sZW5ndGgpLnRvU3RyaW5nKCJoZXgiKTpwcmV2LnRvRml4ZWQoMTIpLHtnbG9iYWw6ZmFsc2V9KS5xdWljaygpO3JldHVybiBwcmV2fXJhbmRvbS5pc1NlZWRlZD10cnVlO3JldHVybiByYW5kb219KCl9dmFyIG9wdGlvbnM9dW5kZWZpbmVkO2lmKGVudmlyb25tZW50IT09dW5kZWZpbmVkKXtvcHRpb25zPXtlbnZpcm9ubWVudDplbnZpcm9ubWVudH19dmFyIG5vZGVSU0E9bmV3IE5vZGVSU0EodW5kZWZpbmVkLHVuZGVmaW5lZCxvcHRpb25zKTtub2RlUlNBLmdlbmVyYXRlS2V5UGFpcihiaXRzLGV4cCk7TWF0aC5yYW5kb209cmFuZG9tQmFja3VwO3JldHVybiBub2RlUlNBfTtOb2RlUlNBLnByb3RvdHlwZS5zZXRPcHRpb25zPWZ1bmN0aW9uKG9wdGlvbnMpe29wdGlvbnM9b3B0aW9uc3x8e307aWYob3B0aW9ucy5lbnZpcm9ubWVudCl7dGhpcy4kb3B0aW9ucy5lbnZpcm9ubWVudD1vcHRpb25zLmVudmlyb25tZW50fWlmKG9wdGlvbnMuc2lnbmluZ1NjaGVtZSl7aWYoXy5pc1N0cmluZyhvcHRpb25zLnNpZ25pbmdTY2hlbWUpKXt2YXIgc2lnbmluZ1NjaGVtZT1vcHRpb25zLnNpZ25pbmdTY2hlbWUudG9Mb3dlckNhc2UoKS5zcGxpdCgiLSIpO2lmKHNpZ25pbmdTY2hlbWUubGVuZ3RoPT0xKXtpZihTVVBQT1JURURfSEFTSF9BTEdPUklUSE1TLm5vZGUuaW5kZXhPZihzaWduaW5nU2NoZW1lWzBdKT4tMSl7dGhpcy4kb3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucz17aGFzaDpzaWduaW5nU2NoZW1lWzBdfTt0aGlzLiRvcHRpb25zLnNpZ25pbmdTY2hlbWU9REVGQVVMVF9TSUdOSU5HX1NDSEVNRX1lbHNle3RoaXMuJG9wdGlvbnMuc2lnbmluZ1NjaGVtZT1zaWduaW5nU2NoZW1lWzBdO3RoaXMuJG9wdGlvbnMuc2lnbmluZ1NjaGVtZU9wdGlvbnM9e2hhc2g6bnVsbH19fWVsc2V7dGhpcy4kb3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucz17aGFzaDpzaWduaW5nU2NoZW1lWzFdfTt0aGlzLiRvcHRpb25zLnNpZ25pbmdTY2hlbWU9c2lnbmluZ1NjaGVtZVswXX19ZWxzZSBpZihfLmlzT2JqZWN0KG9wdGlvbnMuc2lnbmluZ1NjaGVtZSkpe3RoaXMuJG9wdGlvbnMuc2lnbmluZ1NjaGVtZT1vcHRpb25zLnNpZ25pbmdTY2hlbWUuc2NoZW1lfHxERUZBVUxUX1NJR05JTkdfU0NIRU1FO3RoaXMuJG9wdGlvbnMuc2lnbmluZ1NjaGVtZU9wdGlvbnM9Xy5vbWl0KG9wdGlvbnMuc2lnbmluZ1NjaGVtZSwic2NoZW1lIil9aWYoIXNjaGVtZXMuaXNTaWduYXR1cmUodGhpcy4kb3B0aW9ucy5zaWduaW5nU2NoZW1lKSl7dGhyb3cgRXJyb3IoIlVuc3VwcG9ydGVkIHNpZ25pbmcgc2NoZW1lIil9aWYodGhpcy4kb3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucy5oYXNoJiZTVVBQT1JURURfSEFTSF9BTEdPUklUSE1TW3RoaXMuJG9wdGlvbnMuZW52aXJvbm1lbnRdLmluZGV4T2YodGhpcy4kb3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucy5oYXNoKT09PS0xKXt0aHJvdyBFcnJvcigiVW5zdXBwb3J0ZWQgaGFzaGluZyBhbGdvcml0aG0gZm9yICIrdGhpcy4kb3B0aW9ucy5lbnZpcm9ubWVudCsiIGVudmlyb25tZW50Iil9fWlmKG9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZSl7aWYoXy5pc1N0cmluZyhvcHRpb25zLmVuY3J5cHRpb25TY2hlbWUpKXt0aGlzLiRvcHRpb25zLmVuY3J5cHRpb25TY2hlbWU9b3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lLnRvTG93ZXJDYXNlKCk7dGhpcy4kb3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucz17fX1lbHNlIGlmKF8uaXNPYmplY3Qob3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lKSl7dGhpcy4kb3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lPW9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZS5zY2hlbWV8fERFRkFVTFRfRU5DUllQVElPTl9TQ0hFTUU7dGhpcy4kb3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucz1fLm9taXQob3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lLCJzY2hlbWUiKX1pZighc2NoZW1lcy5pc0VuY3J5cHRpb24odGhpcy4kb3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lKSl7dGhyb3cgRXJyb3IoIlVuc3VwcG9ydGVkIGVuY3J5cHRpb24gc2NoZW1lIil9aWYodGhpcy4kb3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucy5oYXNoJiZTVVBQT1JURURfSEFTSF9BTEdPUklUSE1TW3RoaXMuJG9wdGlvbnMuZW52aXJvbm1lbnRdLmluZGV4T2YodGhpcy4kb3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucy5oYXNoKT09PS0xKXt0aHJvdyBFcnJvcigiVW5zdXBwb3J0ZWQgaGFzaGluZyBhbGdvcml0aG0gZm9yICIrdGhpcy4kb3B0aW9ucy5lbnZpcm9ubWVudCsiIGVudmlyb25tZW50Iil9fXRoaXMua2V5UGFpci5zZXRPcHRpb25zKHRoaXMuJG9wdGlvbnMpfTtOb2RlUlNBLnByb3RvdHlwZS5nZW5lcmF0ZUtleVBhaXI9ZnVuY3Rpb24oYml0cyxleHApe2JpdHM9Yml0c3x8MjA0ODtleHA9ZXhwfHw2NTUzNztpZihiaXRzJTghPT0wKXt0aHJvdyBFcnJvcigiS2V5IHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDguIil9dGhpcy5rZXlQYWlyLmdlbmVyYXRlKGJpdHMsZXhwLnRvU3RyaW5nKDE2KSk7dGhpcy4kY2FjaGU9e307cmV0dXJuIHRoaXN9O05vZGVSU0EucHJvdG90eXBlLmltcG9ydEtleT1mdW5jdGlvbihrZXlEYXRhLGZvcm1hdCl7aWYoIWtleURhdGEpe3Rocm93IEVycm9yKCJFbXB0eSBrZXkgZ2l2ZW4iKX1pZihmb3JtYXQpe2Zvcm1hdD1FWFBPUlRfRk9STUFUX0FMSUFTRVNbZm9ybWF0XXx8Zm9ybWF0fWlmKCFmb3JtYXRzLmRldGVjdEFuZEltcG9ydCh0aGlzLmtleVBhaXIsa2V5RGF0YSxmb3JtYXQpJiZmb3JtYXQ9PT11bmRlZmluZWQpe3Rocm93IEVycm9yKCJLZXkgZm9ybWF0IG11c3QgYmUgc3BlY2lmaWVkIil9dGhpcy4kY2FjaGU9e307cmV0dXJuIHRoaXN9O05vZGVSU0EucHJvdG90eXBlLmV4cG9ydEtleT1mdW5jdGlvbihmb3JtYXQpe2Zvcm1hdD1mb3JtYXR8fERFRkFVTFRfRVhQT1JUX0ZPUk1BVDtmb3JtYXQ9RVhQT1JUX0ZPUk1BVF9BTElBU0VTW2Zvcm1hdF18fGZvcm1hdDtpZighdGhpcy4kY2FjaGVbZm9ybWF0XSl7dGhpcy4kY2FjaGVbZm9ybWF0XT1mb3JtYXRzLmRldGVjdEFuZEV4cG9ydCh0aGlzLmtleVBhaXIsZm9ybWF0KX1yZXR1cm4gdGhpcy4kY2FjaGVbZm9ybWF0XX07Tm9kZVJTQS5wcm90b3R5cGUuaXNQcml2YXRlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMua2V5UGFpci5pc1ByaXZhdGUoKX07Tm9kZVJTQS5wcm90b3R5cGUuaXNQdWJsaWM9ZnVuY3Rpb24oc3RyaWN0KXtyZXR1cm4gdGhpcy5rZXlQYWlyLmlzUHVibGljKHN0cmljdCl9O05vZGVSU0EucHJvdG90eXBlLmlzRW1wdHk9ZnVuY3Rpb24oc3RyaWN0KXtyZXR1cm4hKHRoaXMua2V5UGFpci5ufHx0aGlzLmtleVBhaXIuZXx8dGhpcy5rZXlQYWlyLmQpfTtOb2RlUlNBLnByb3RvdHlwZS5lbmNyeXB0PWZ1bmN0aW9uKGJ1ZmZlcixlbmNvZGluZyxzb3VyY2VfZW5jb2Rpbmcpe3JldHVybiB0aGlzLiQkZW5jcnlwdEtleShmYWxzZSxidWZmZXIsZW5jb2Rpbmcsc291cmNlX2VuY29kaW5nKX07Tm9kZVJTQS5wcm90b3R5cGUuZGVjcnlwdD1mdW5jdGlvbihidWZmZXIsZW5jb2Rpbmcpe3JldHVybiB0aGlzLiQkZGVjcnlwdEtleShmYWxzZSxidWZmZXIsZW5jb2RpbmcpfTtOb2RlUlNBLnByb3RvdHlwZS5lbmNyeXB0UHJpdmF0ZT1mdW5jdGlvbihidWZmZXIsZW5jb2Rpbmcsc291cmNlX2VuY29kaW5nKXtyZXR1cm4gdGhpcy4kJGVuY3J5cHRLZXkodHJ1ZSxidWZmZXIsZW5jb2Rpbmcsc291cmNlX2VuY29kaW5nKX07Tm9kZVJTQS5wcm90b3R5cGUuZGVjcnlwdFB1YmxpYz1mdW5jdGlvbihidWZmZXIsZW5jb2Rpbmcpe3JldHVybiB0aGlzLiQkZGVjcnlwdEtleSh0cnVlLGJ1ZmZlcixlbmNvZGluZyl9O05vZGVSU0EucHJvdG90eXBlLiQkZW5jcnlwdEtleT1mdW5jdGlvbih1c2VQcml2YXRlLGJ1ZmZlcixlbmNvZGluZyxzb3VyY2VfZW5jb2Rpbmcpe3RyeXt2YXIgcmVzPXRoaXMua2V5UGFpci5lbmNyeXB0KHRoaXMuJGdldERhdGFGb3JFbmNyeXB0KGJ1ZmZlcixzb3VyY2VfZW5jb2RpbmcpLHVzZVByaXZhdGUpO2lmKGVuY29kaW5nPT0iYnVmZmVyInx8IWVuY29kaW5nKXtyZXR1cm4gcmVzfWVsc2V7cmV0dXJuIHJlcy50b1N0cmluZyhlbmNvZGluZyl9fWNhdGNoKGUpe3Rocm93IEVycm9yKCJFcnJvciBkdXJpbmcgZW5jcnlwdGlvbi4gT3JpZ2luYWwgZXJyb3I6ICIrZS5zdGFjayl9fTtOb2RlUlNBLnByb3RvdHlwZS4kJGRlY3J5cHRLZXk9ZnVuY3Rpb24odXNlUHVibGljLGJ1ZmZlcixlbmNvZGluZyl7dHJ5e2J1ZmZlcj1fLmlzU3RyaW5nKGJ1ZmZlcik/QnVmZmVyLmZyb20oYnVmZmVyLCJiYXNlNjQiKTpidWZmZXI7dmFyIHJlcz10aGlzLmtleVBhaXIuZGVjcnlwdChidWZmZXIsdXNlUHVibGljKTtpZihyZXM9PT1udWxsKXt0aHJvdyBFcnJvcigiS2V5IGRlY3J5cHQgbWV0aG9kIHJldHVybnMgbnVsbC4iKX1yZXR1cm4gdGhpcy4kZ2V0RGVjcnlwdGVkRGF0YShyZXMsZW5jb2RpbmcpfWNhdGNoKGUpe3Rocm93IEVycm9yKCJFcnJvciBkdXJpbmcgZGVjcnlwdGlvbiAocHJvYmFibHkgaW5jb3JyZWN0IGtleSkuIE9yaWdpbmFsIGVycm9yOiAiK2Uuc3RhY2spfX07Tm9kZVJTQS5wcm90b3R5cGUuc2lnbj1mdW5jdGlvbihidWZmZXIsZW5jb2Rpbmcsc291cmNlX2VuY29kaW5nKXtpZighdGhpcy5pc1ByaXZhdGUoKSl7dGhyb3cgRXJyb3IoIlRoaXMgaXMgbm90IHByaXZhdGUga2V5Iil9dmFyIHJlcz10aGlzLmtleVBhaXIuc2lnbih0aGlzLiRnZXREYXRhRm9yRW5jcnlwdChidWZmZXIsc291cmNlX2VuY29kaW5nKSk7aWYoZW5jb2RpbmcmJmVuY29kaW5nIT0iYnVmZmVyIil7cmVzPXJlcy50b1N0cmluZyhlbmNvZGluZyl9cmV0dXJuIHJlc307Tm9kZVJTQS5wcm90b3R5cGUudmVyaWZ5PWZ1bmN0aW9uKGJ1ZmZlcixzaWduYXR1cmUsc291cmNlX2VuY29kaW5nLHNpZ25hdHVyZV9lbmNvZGluZyl7aWYoIXRoaXMuaXNQdWJsaWMoKSl7dGhyb3cgRXJyb3IoIlRoaXMgaXMgbm90IHB1YmxpYyBrZXkiKX1zaWduYXR1cmVfZW5jb2Rpbmc9IXNpZ25hdHVyZV9lbmNvZGluZ3x8c2lnbmF0dXJlX2VuY29kaW5nPT0iYnVmZmVyIj9udWxsOnNpZ25hdHVyZV9lbmNvZGluZztyZXR1cm4gdGhpcy5rZXlQYWlyLnZlcmlmeSh0aGlzLiRnZXREYXRhRm9yRW5jcnlwdChidWZmZXIsc291cmNlX2VuY29kaW5nKSxzaWduYXR1cmUsc2lnbmF0dXJlX2VuY29kaW5nKX07Tm9kZVJTQS5wcm90b3R5cGUuZ2V0S2V5U2l6ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmtleVBhaXIua2V5U2l6ZX07Tm9kZVJTQS5wcm90b3R5cGUuZ2V0TWF4TWVzc2FnZVNpemU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5rZXlQYWlyLm1heE1lc3NhZ2VMZW5ndGh9O05vZGVSU0EucHJvdG90eXBlLiRnZXREYXRhRm9yRW5jcnlwdD1mdW5jdGlvbihidWZmZXIsZW5jb2Rpbmcpe2lmKF8uaXNTdHJpbmcoYnVmZmVyKXx8Xy5pc051bWJlcihidWZmZXIpKXtyZXR1cm4gQnVmZmVyLmZyb20oIiIrYnVmZmVyLGVuY29kaW5nfHwidXRmOCIpfWVsc2UgaWYoQnVmZmVyLmlzQnVmZmVyKGJ1ZmZlcikpe3JldHVybiBidWZmZXJ9ZWxzZSBpZihfLmlzT2JqZWN0KGJ1ZmZlcikpe3JldHVybiBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShidWZmZXIpKX1lbHNle3Rocm93IEVycm9yKCJVbmV4cGVjdGVkIGRhdGEgdHlwZSIpfX07Tm9kZVJTQS5wcm90b3R5cGUuJGdldERlY3J5cHRlZERhdGE9ZnVuY3Rpb24oYnVmZmVyLGVuY29kaW5nKXtlbmNvZGluZz1lbmNvZGluZ3x8ImJ1ZmZlciI7aWYoZW5jb2Rpbmc9PSJidWZmZXIiKXtyZXR1cm4gYnVmZmVyfWVsc2UgaWYoZW5jb2Rpbmc9PSJqc29uIil7cmV0dXJuIEpTT04ucGFyc2UoYnVmZmVyLnRvU3RyaW5nKCkpfWVsc2V7cmV0dXJuIGJ1ZmZlci50b1N0cmluZyhlbmNvZGluZyl9fTtyZXR1cm4gTm9kZVJTQX0oKX0pLmNhbGwodGhpcyxyZXF1aXJlKCJidWZmZXIiKS5CdWZmZXIpfSx7Ii4vZm9ybWF0cy9mb3JtYXRzLmpzIjo0OSwiLi9saWJzL3JzYS5qcyI6NTMsIi4vc2NoZW1lcy9zY2hlbWVzLmpzIjo1NywiLi91dGlscyI6NTgsYnVmZmVyOjI3LGNvbnN0YW50czoyOSxzZWVkcmFuZG9tOjg2fV0sNDM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihCdWZmZXIpeyJ1c2Ugc3RyaWN0Ijt2YXIgdXRpbHM9cmVxdWlyZSgiLi91dGlscyIpO3ZhciBzdGFuZGFsb25lQ3JlYXRlSGFzaD1yZXF1aXJlKCJjcmVhdGUtaGFzaCIpO3ZhciBnZXROb2RlQ3J5cHRvPWZ1bmN0aW9uKCl7dmFyIG5vZGVDcnlwdG89dW5kZWZpbmVkO3JldHVybiBmdW5jdGlvbigpe2lmKG5vZGVDcnlwdG89PT11bmRlZmluZWQpe25vZGVDcnlwdG89cmVxdWlyZSgiY3J5cHRvIisiIil9cmV0dXJuIG5vZGVDcnlwdG99fSgpO21vZHVsZS5leHBvcnRzPXt9O21vZHVsZS5leHBvcnRzLmNyZWF0ZUhhc2g9ZnVuY3Rpb24oKXtpZih1dGlscy5kZXRlY3RFbnZpcm9ubWVudCgpPT09Im5vZGUiKXt0cnl7dmFyIG5vZGVDcnlwdG89Z2V0Tm9kZUNyeXB0bygpO3JldHVybiBub2RlQ3J5cHRvLmNyZWF0ZUhhc2guYmluZChub2RlQ3J5cHRvKX1jYXRjaChlcnJvcil7fX1yZXR1cm4gc3RhbmRhbG9uZUNyZWF0ZUhhc2h9KCk7WyJjcmVhdGVTaWduIiwiY3JlYXRlVmVyaWZ5Il0uZm9yRWFjaChmdW5jdGlvbihmbk5hbWUpe21vZHVsZS5leHBvcnRzW2ZuTmFtZV09ZnVuY3Rpb24oKXt2YXIgbm9kZUNyeXB0bz1nZXROb2RlQ3J5cHRvKCk7bm9kZUNyeXB0b1tmbk5hbWVdLmFwcGx5KG5vZGVDcnlwdG8sYXJndW1lbnRzKX19KTttb2R1bGUuZXhwb3J0cy5yYW5kb21CeXRlcz1mdW5jdGlvbigpe3ZhciBicm93c2VyR2V0UmFuZG9tVmFsdWVzPWZ1bmN0aW9uKCl7aWYodHlwZW9mIGNyeXB0bz09PSJvYmplY3QiJiYhIWNyeXB0by5nZXRSYW5kb21WYWx1ZXMpe3JldHVybiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLmJpbmQoY3J5cHRvKX1lbHNlIGlmKHR5cGVvZiBtc0NyeXB0bz09PSJvYmplY3QiJiYhIW1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcyl7cmV0dXJuIG1zQ3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKG1zQ3J5cHRvKX1lbHNlIGlmKHR5cGVvZiBzZWxmPT09Im9iamVjdCImJnR5cGVvZiBzZWxmLmNyeXB0bz09PSJvYmplY3QiJiYhIXNlbGYuY3J5cHRvLmdldFJhbmRvbVZhbHVlcyl7cmV0dXJuIHNlbGYuY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKHNlbGYuY3J5cHRvKX1lbHNle3JldHVybiB1bmRlZmluZWR9fSgpO3ZhciBnZXRSYW5kb21WYWx1ZXM9ZnVuY3Rpb24oKXt2YXIgbm9uQ3J5cHRvZ3JhcGhpY0dldFJhbmRvbVZhbHVlPWZ1bmN0aW9uKGFidil7dmFyIGw9YWJ2Lmxlbmd0aDt3aGlsZShsLS0pe2FidltsXT1NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMjU2KX1yZXR1cm4gYWJ2fTtyZXR1cm4gZnVuY3Rpb24oYWJ2KXtpZihNYXRoLnJhbmRvbS5pc1NlZWRlZCl7cmV0dXJuIG5vbkNyeXB0b2dyYXBoaWNHZXRSYW5kb21WYWx1ZShhYnYpfWVsc2V7aWYoISFicm93c2VyR2V0UmFuZG9tVmFsdWVzKXtyZXR1cm4gYnJvd3NlckdldFJhbmRvbVZhbHVlcyhhYnYpfWVsc2V7cmV0dXJuIG5vbkNyeXB0b2dyYXBoaWNHZXRSYW5kb21WYWx1ZShhYnYpfX19fSgpO3ZhciBNQVhfQllURVM9NjU1MzY7dmFyIE1BWF9VSU5UMzI9NDI5NDk2NzI5NTtyZXR1cm4gZnVuY3Rpb24gcmFuZG9tQnl0ZXMoc2l6ZSl7aWYoIU1hdGgucmFuZG9tLmlzU2VlZGVkJiYhYnJvd3NlckdldFJhbmRvbVZhbHVlcyl7dHJ5e3ZhciBub2RlQnVmZmVySW5zdD1nZXROb2RlQ3J5cHRvKCkucmFuZG9tQnl0ZXMoc2l6ZSk7cmV0dXJuIEJ1ZmZlci5mcm9tKG5vZGVCdWZmZXJJbnN0LmJ1ZmZlcixub2RlQnVmZmVySW5zdC5ieXRlT2Zmc2V0LG5vZGVCdWZmZXJJbnN0Lmxlbmd0aCl9Y2F0Y2goZXJyb3Ipe319aWYoc2l6ZT5NQVhfVUlOVDMyKXRocm93IG5ldyBSYW5nZUVycm9yKCJyZXF1ZXN0ZWQgdG9vIG1hbnkgcmFuZG9tIGJ5dGVzIik7dmFyIGJ5dGVzPUJ1ZmZlci5hbGxvY1Vuc2FmZShzaXplKTtpZihzaXplPjApe2lmKHNpemU+TUFYX0JZVEVTKXtmb3IodmFyIGdlbmVyYXRlZD0wO2dlbmVyYXRlZDxzaXplO2dlbmVyYXRlZCs9TUFYX0JZVEVTKXtnZXRSYW5kb21WYWx1ZXMoYnl0ZXMuc2xpY2UoZ2VuZXJhdGVkLGdlbmVyYXRlZCtNQVhfQllURVMpKX19ZWxzZXtnZXRSYW5kb21WYWx1ZXMoYnl0ZXMpfX1yZXR1cm4gYnl0ZXN9fSgpfSkuY2FsbCh0aGlzLHJlcXVpcmUoImJ1ZmZlciIpLkJ1ZmZlcil9LHsiLi91dGlscyI6NTgsYnVmZmVyOjI3LCJjcmVhdGUtaGFzaCI6MzF9XSw0NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHM9e2dldEVuZ2luZTpmdW5jdGlvbihrZXlQYWlyLG9wdGlvbnMpe3ZhciBlbmdpbmU9cmVxdWlyZSgiLi9qcy5qcyIpO2lmKG9wdGlvbnMuZW52aXJvbm1lbnQ9PT0ibm9kZSIpe3ZhciBjcnlwdD1yZXF1aXJlKCJjcnlwdG8iKyIiKTtpZih0eXBlb2YgY3J5cHQucHVibGljRW5jcnlwdD09PSJmdW5jdGlvbiImJnR5cGVvZiBjcnlwdC5wcml2YXRlRGVjcnlwdD09PSJmdW5jdGlvbiIpe2lmKHR5cGVvZiBjcnlwdC5wcml2YXRlRW5jcnlwdD09PSJmdW5jdGlvbiImJnR5cGVvZiBjcnlwdC5wdWJsaWNEZWNyeXB0PT09ImZ1bmN0aW9uIil7ZW5naW5lPXJlcXVpcmUoIi4vaW8uanMiKX1lbHNle2VuZ2luZT1yZXF1aXJlKCIuL25vZGUxMi5qcyIpfX19cmV0dXJuIGVuZ2luZShrZXlQYWlyLG9wdGlvbnMpfX19LHsiLi9pby5qcyI6NDUsIi4vanMuanMiOjQ2LCIuL25vZGUxMi5qcyI6NDd9XSw0NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIGNyeXB0bz1yZXF1aXJlKCJjcnlwdG8iKyIiKTt2YXIgY29uc3RhbnRzPXJlcXVpcmUoImNvbnN0YW50cyIpO3ZhciBzY2hlbWVzPXJlcXVpcmUoIi4uL3NjaGVtZXMvc2NoZW1lcy5qcyIpO21vZHVsZS5leHBvcnRzPWZ1bmN0aW9uKGtleVBhaXIsb3B0aW9ucyl7dmFyIHBrY3MxU2NoZW1lPXNjaGVtZXMucGtjczEubWFrZVNjaGVtZShrZXlQYWlyLG9wdGlvbnMpO3JldHVybntlbmNyeXB0OmZ1bmN0aW9uKGJ1ZmZlcix1c2VQcml2YXRlKXt2YXIgcGFkZGluZztpZih1c2VQcml2YXRlKXtwYWRkaW5nPWNvbnN0YW50cy5SU0FfUEtDUzFfUEFERElORztpZihvcHRpb25zLmVuY3J5cHRpb25TY2hlbWVPcHRpb25zJiZvcHRpb25zLmVuY3J5cHRpb25TY2hlbWVPcHRpb25zLnBhZGRpbmcpe3BhZGRpbmc9b3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucy5wYWRkaW5nfXJldHVybiBjcnlwdG8ucHJpdmF0ZUVuY3J5cHQoe2tleTpvcHRpb25zLnJzYVV0aWxzLmV4cG9ydEtleSgicHJpdmF0ZSIpLHBhZGRpbmc6cGFkZGluZ30sYnVmZmVyKX1lbHNle3BhZGRpbmc9Y29uc3RhbnRzLlJTQV9QS0NTMV9PQUVQX1BBRERJTkc7aWYob3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lPT09InBrY3MxIil7cGFkZGluZz1jb25zdGFudHMuUlNBX1BLQ1MxX1BBRERJTkd9aWYob3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucyYmb3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucy5wYWRkaW5nKXtwYWRkaW5nPW9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMucGFkZGluZ312YXIgZGF0YT1idWZmZXI7aWYocGFkZGluZz09PWNvbnN0YW50cy5SU0FfTk9fUEFERElORyl7ZGF0YT1wa2NzMVNjaGVtZS5wa2NzMHBhZChidWZmZXIpfXJldHVybiBjcnlwdG8ucHVibGljRW5jcnlwdCh7a2V5Om9wdGlvbnMucnNhVXRpbHMuZXhwb3J0S2V5KCJwdWJsaWMiKSxwYWRkaW5nOnBhZGRpbmd9LGRhdGEpfX0sZGVjcnlwdDpmdW5jdGlvbihidWZmZXIsdXNlUHVibGljKXt2YXIgcGFkZGluZztpZih1c2VQdWJsaWMpe3BhZGRpbmc9Y29uc3RhbnRzLlJTQV9QS0NTMV9QQURESU5HO2lmKG9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMmJm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMucGFkZGluZyl7cGFkZGluZz1vcHRpb25zLmVuY3J5cHRpb25TY2hlbWVPcHRpb25zLnBhZGRpbmd9cmV0dXJuIGNyeXB0by5wdWJsaWNEZWNyeXB0KHtrZXk6b3B0aW9ucy5yc2FVdGlscy5leHBvcnRLZXkoInB1YmxpYyIpLHBhZGRpbmc6cGFkZGluZ30sYnVmZmVyKX1lbHNle3BhZGRpbmc9Y29uc3RhbnRzLlJTQV9QS0NTMV9PQUVQX1BBRERJTkc7aWYob3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lPT09InBrY3MxIil7cGFkZGluZz1jb25zdGFudHMuUlNBX1BLQ1MxX1BBRERJTkd9aWYob3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucyYmb3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucy5wYWRkaW5nKXtwYWRkaW5nPW9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMucGFkZGluZ312YXIgcmVzPWNyeXB0by5wcml2YXRlRGVjcnlwdCh7a2V5Om9wdGlvbnMucnNhVXRpbHMuZXhwb3J0S2V5KCJwcml2YXRlIikscGFkZGluZzpwYWRkaW5nfSxidWZmZXIpO2lmKHBhZGRpbmc9PT1jb25zdGFudHMuUlNBX05PX1BBRERJTkcpe3JldHVybiBwa2NzMVNjaGVtZS5wa2NzMHVucGFkKHJlcyl9cmV0dXJuIHJlc319fX19LHsiLi4vc2NoZW1lcy9zY2hlbWVzLmpzIjo1Nyxjb25zdGFudHM6Mjl9XSw0NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIEJpZ0ludGVnZXI9cmVxdWlyZSgiLi4vbGlicy9qc2JuLmpzIik7dmFyIHNjaGVtZXM9cmVxdWlyZSgiLi4vc2NoZW1lcy9zY2hlbWVzLmpzIik7bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oa2V5UGFpcixvcHRpb25zKXt2YXIgcGtjczFTY2hlbWU9c2NoZW1lcy5wa2NzMS5tYWtlU2NoZW1lKGtleVBhaXIsb3B0aW9ucyk7cmV0dXJue2VuY3J5cHQ6ZnVuY3Rpb24oYnVmZmVyLHVzZVByaXZhdGUpe3ZhciBtLGM7aWYodXNlUHJpdmF0ZSl7bT1uZXcgQmlnSW50ZWdlcihwa2NzMVNjaGVtZS5lbmNQYWQoYnVmZmVyLHt0eXBlOjF9KSk7Yz1rZXlQYWlyLiRkb1ByaXZhdGUobSl9ZWxzZXttPW5ldyBCaWdJbnRlZ2VyKGtleVBhaXIuZW5jcnlwdGlvblNjaGVtZS5lbmNQYWQoYnVmZmVyKSk7Yz1rZXlQYWlyLiRkb1B1YmxpYyhtKX1yZXR1cm4gYy50b0J1ZmZlcihrZXlQYWlyLmVuY3J5cHRlZERhdGFMZW5ndGgpfSxkZWNyeXB0OmZ1bmN0aW9uKGJ1ZmZlcix1c2VQdWJsaWMpe3ZhciBtLGM9bmV3IEJpZ0ludGVnZXIoYnVmZmVyKTtpZih1c2VQdWJsaWMpe209a2V5UGFpci4kZG9QdWJsaWMoYyk7cmV0dXJuIHBrY3MxU2NoZW1lLmVuY1VuUGFkKG0udG9CdWZmZXIoa2V5UGFpci5lbmNyeXB0ZWREYXRhTGVuZ3RoKSx7dHlwZToxfSl9ZWxzZXttPWtleVBhaXIuJGRvUHJpdmF0ZShjKTtyZXR1cm4ga2V5UGFpci5lbmNyeXB0aW9uU2NoZW1lLmVuY1VuUGFkKG0udG9CdWZmZXIoa2V5UGFpci5lbmNyeXB0ZWREYXRhTGVuZ3RoKSl9fX19fSx7Ii4uL2xpYnMvanNibi5qcyI6NTIsIi4uL3NjaGVtZXMvc2NoZW1lcy5qcyI6NTd9XSw0NzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIGNyeXB0bz1yZXF1aXJlKCJjcnlwdG8iKyIiKTt2YXIgY29uc3RhbnRzPXJlcXVpcmUoImNvbnN0YW50cyIpO3ZhciBzY2hlbWVzPXJlcXVpcmUoIi4uL3NjaGVtZXMvc2NoZW1lcy5qcyIpO21vZHVsZS5leHBvcnRzPWZ1bmN0aW9uKGtleVBhaXIsb3B0aW9ucyl7dmFyIGpzRW5naW5lPXJlcXVpcmUoIi4vanMuanMiKShrZXlQYWlyLG9wdGlvbnMpO3ZhciBwa2NzMVNjaGVtZT1zY2hlbWVzLnBrY3MxLm1ha2VTY2hlbWUoa2V5UGFpcixvcHRpb25zKTtyZXR1cm57ZW5jcnlwdDpmdW5jdGlvbihidWZmZXIsdXNlUHJpdmF0ZSl7aWYodXNlUHJpdmF0ZSl7cmV0dXJuIGpzRW5naW5lLmVuY3J5cHQoYnVmZmVyLHVzZVByaXZhdGUpfXZhciBwYWRkaW5nPWNvbnN0YW50cy5SU0FfUEtDUzFfT0FFUF9QQURESU5HO2lmKG9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZT09PSJwa2NzMSIpe3BhZGRpbmc9Y29uc3RhbnRzLlJTQV9QS0NTMV9QQURESU5HfWlmKG9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMmJm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMucGFkZGluZyl7cGFkZGluZz1vcHRpb25zLmVuY3J5cHRpb25TY2hlbWVPcHRpb25zLnBhZGRpbmd9dmFyIGRhdGE9YnVmZmVyO2lmKHBhZGRpbmc9PT1jb25zdGFudHMuUlNBX05PX1BBRERJTkcpe2RhdGE9cGtjczFTY2hlbWUucGtjczBwYWQoYnVmZmVyKX1yZXR1cm4gY3J5cHRvLnB1YmxpY0VuY3J5cHQoe2tleTpvcHRpb25zLnJzYVV0aWxzLmV4cG9ydEtleSgicHVibGljIikscGFkZGluZzpwYWRkaW5nfSxkYXRhKX0sZGVjcnlwdDpmdW5jdGlvbihidWZmZXIsdXNlUHVibGljKXtpZih1c2VQdWJsaWMpe3JldHVybiBqc0VuZ2luZS5kZWNyeXB0KGJ1ZmZlcix1c2VQdWJsaWMpfXZhciBwYWRkaW5nPWNvbnN0YW50cy5SU0FfUEtDUzFfT0FFUF9QQURESU5HO2lmKG9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZT09PSJwa2NzMSIpe3BhZGRpbmc9Y29uc3RhbnRzLlJTQV9QS0NTMV9QQURESU5HfWlmKG9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMmJm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMucGFkZGluZyl7cGFkZGluZz1vcHRpb25zLmVuY3J5cHRpb25TY2hlbWVPcHRpb25zLnBhZGRpbmd9dmFyIHJlcz1jcnlwdG8ucHJpdmF0ZURlY3J5cHQoe2tleTpvcHRpb25zLnJzYVV0aWxzLmV4cG9ydEtleSgicHJpdmF0ZSIpLHBhZGRpbmc6cGFkZGluZ30sYnVmZmVyKTtpZihwYWRkaW5nPT09Y29uc3RhbnRzLlJTQV9OT19QQURESU5HKXtyZXR1cm4gcGtjczFTY2hlbWUucGtjczB1bnBhZChyZXMpfXJldHVybiByZXN9fX19LHsiLi4vc2NoZW1lcy9zY2hlbWVzLmpzIjo1NywiLi9qcy5qcyI6NDYsY29uc3RhbnRzOjI5fV0sNDg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe3ZhciBfPXJlcXVpcmUoIi4uL3V0aWxzIikuXzttb2R1bGUuZXhwb3J0cz17cHJpdmF0ZUV4cG9ydDpmdW5jdGlvbihrZXksb3B0aW9ucyl7cmV0dXJue246a2V5Lm4udG9CdWZmZXIoKSxlOmtleS5lLGQ6a2V5LmQudG9CdWZmZXIoKSxwOmtleS5wLnRvQnVmZmVyKCkscTprZXkucS50b0J1ZmZlcigpLGRtcDE6a2V5LmRtcDEudG9CdWZmZXIoKSxkbXExOmtleS5kbXExLnRvQnVmZmVyKCksY29lZmY6a2V5LmNvZWZmLnRvQnVmZmVyKCl9fSxwcml2YXRlSW1wb3J0OmZ1bmN0aW9uKGtleSxkYXRhLG9wdGlvbnMpe2lmKGRhdGEubiYmZGF0YS5lJiZkYXRhLmQmJmRhdGEucCYmZGF0YS5xJiZkYXRhLmRtcDEmJmRhdGEuZG1xMSYmZGF0YS5jb2VmZil7a2V5LnNldFByaXZhdGUoZGF0YS5uLGRhdGEuZSxkYXRhLmQsZGF0YS5wLGRhdGEucSxkYXRhLmRtcDEsZGF0YS5kbXExLGRhdGEuY29lZmYpfWVsc2V7dGhyb3cgRXJyb3IoIkludmFsaWQga2V5IGRhdGEiKX19LHB1YmxpY0V4cG9ydDpmdW5jdGlvbihrZXksb3B0aW9ucyl7cmV0dXJue246a2V5Lm4udG9CdWZmZXIoKSxlOmtleS5lfX0scHVibGljSW1wb3J0OmZ1bmN0aW9uKGtleSxkYXRhLG9wdGlvbnMpe2lmKGRhdGEubiYmZGF0YS5lKXtrZXkuc2V0UHVibGljKGRhdGEubixkYXRhLmUpfWVsc2V7dGhyb3cgRXJyb3IoIkludmFsaWQga2V5IGRhdGEiKX19LGF1dG9JbXBvcnQ6ZnVuY3Rpb24oa2V5LGRhdGEpe2lmKGRhdGEubiYmZGF0YS5lKXtpZihkYXRhLmQmJmRhdGEucCYmZGF0YS5xJiZkYXRhLmRtcDEmJmRhdGEuZG1xMSYmZGF0YS5jb2VmZil7bW9kdWxlLmV4cG9ydHMucHJpdmF0ZUltcG9ydChrZXksZGF0YSk7cmV0dXJuIHRydWV9ZWxzZXttb2R1bGUuZXhwb3J0cy5wdWJsaWNJbXBvcnQoa2V5LGRhdGEpO3JldHVybiB0cnVlfX1yZXR1cm4gZmFsc2V9fX0seyIuLi91dGlscyI6NTh9XSw0OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7ZnVuY3Rpb24gZm9ybWF0UGFyc2UoZm9ybWF0KXtmb3JtYXQ9Zm9ybWF0LnNwbGl0KCItIik7dmFyIGtleVR5cGU9InByaXZhdGUiO3ZhciBrZXlPcHQ9e3R5cGU6ImRlZmF1bHQifTtmb3IodmFyIGk9MTtpPGZvcm1hdC5sZW5ndGg7aSsrKXtpZihmb3JtYXRbaV0pe3N3aXRjaChmb3JtYXRbaV0pe2Nhc2UicHVibGljIjprZXlUeXBlPWZvcm1hdFtpXTticmVhaztjYXNlInByaXZhdGUiOmtleVR5cGU9Zm9ybWF0W2ldO2JyZWFrO2Nhc2UicGVtIjprZXlPcHQudHlwZT1mb3JtYXRbaV07YnJlYWs7Y2FzZSJkZXIiOmtleU9wdC50eXBlPWZvcm1hdFtpXTticmVha319fXJldHVybntzY2hlbWU6Zm9ybWF0WzBdLGtleVR5cGU6a2V5VHlwZSxrZXlPcHQ6a2V5T3B0fX1tb2R1bGUuZXhwb3J0cz17cGtjczE6cmVxdWlyZSgiLi9wa2NzMSIpLHBrY3M4OnJlcXVpcmUoIi4vcGtjczgiKSxjb21wb25lbnRzOnJlcXVpcmUoIi4vY29tcG9uZW50cyIpLGlzUHJpdmF0ZUV4cG9ydDpmdW5jdGlvbihmb3JtYXQpe3JldHVybiBtb2R1bGUuZXhwb3J0c1tmb3JtYXRdJiZ0eXBlb2YgbW9kdWxlLmV4cG9ydHNbZm9ybWF0XS5wcml2YXRlRXhwb3J0PT09ImZ1bmN0aW9uIn0saXNQcml2YXRlSW1wb3J0OmZ1bmN0aW9uKGZvcm1hdCl7cmV0dXJuIG1vZHVsZS5leHBvcnRzW2Zvcm1hdF0mJnR5cGVvZiBtb2R1bGUuZXhwb3J0c1tmb3JtYXRdLnByaXZhdGVJbXBvcnQ9PT0iZnVuY3Rpb24ifSxpc1B1YmxpY0V4cG9ydDpmdW5jdGlvbihmb3JtYXQpe3JldHVybiBtb2R1bGUuZXhwb3J0c1tmb3JtYXRdJiZ0eXBlb2YgbW9kdWxlLmV4cG9ydHNbZm9ybWF0XS5wdWJsaWNFeHBvcnQ9PT0iZnVuY3Rpb24ifSxpc1B1YmxpY0ltcG9ydDpmdW5jdGlvbihmb3JtYXQpe3JldHVybiBtb2R1bGUuZXhwb3J0c1tmb3JtYXRdJiZ0eXBlb2YgbW9kdWxlLmV4cG9ydHNbZm9ybWF0XS5wdWJsaWNJbXBvcnQ9PT0iZnVuY3Rpb24ifSxkZXRlY3RBbmRJbXBvcnQ6ZnVuY3Rpb24oa2V5LGRhdGEsZm9ybWF0KXtpZihmb3JtYXQ9PT11bmRlZmluZWQpe2Zvcih2YXIgc2NoZW1lIGluIG1vZHVsZS5leHBvcnRzKXtpZih0eXBlb2YgbW9kdWxlLmV4cG9ydHNbc2NoZW1lXS5hdXRvSW1wb3J0PT09ImZ1bmN0aW9uIiYmbW9kdWxlLmV4cG9ydHNbc2NoZW1lXS5hdXRvSW1wb3J0KGtleSxkYXRhKSl7cmV0dXJuIHRydWV9fX1lbHNlIGlmKGZvcm1hdCl7dmFyIGZtdD1mb3JtYXRQYXJzZShmb3JtYXQpO2lmKG1vZHVsZS5leHBvcnRzW2ZtdC5zY2hlbWVdKXtpZihmbXQua2V5VHlwZT09PSJwcml2YXRlIil7bW9kdWxlLmV4cG9ydHNbZm10LnNjaGVtZV0ucHJpdmF0ZUltcG9ydChrZXksZGF0YSxmbXQua2V5T3B0KX1lbHNle21vZHVsZS5leHBvcnRzW2ZtdC5zY2hlbWVdLnB1YmxpY0ltcG9ydChrZXksZGF0YSxmbXQua2V5T3B0KX19ZWxzZXt0aHJvdyBFcnJvcigiVW5zdXBwb3J0ZWQga2V5IGZvcm1hdCIpfX1yZXR1cm4gZmFsc2V9LGRldGVjdEFuZEV4cG9ydDpmdW5jdGlvbihrZXksZm9ybWF0KXtpZihmb3JtYXQpe3ZhciBmbXQ9Zm9ybWF0UGFyc2UoZm9ybWF0KTtpZihtb2R1bGUuZXhwb3J0c1tmbXQuc2NoZW1lXSl7aWYoZm10LmtleVR5cGU9PT0icHJpdmF0ZSIpe2lmKCFrZXkuaXNQcml2YXRlKCkpe3Rocm93IEVycm9yKCJUaGlzIGlzIG5vdCBwcml2YXRlIGtleSIpfXJldHVybiBtb2R1bGUuZXhwb3J0c1tmbXQuc2NoZW1lXS5wcml2YXRlRXhwb3J0KGtleSxmbXQua2V5T3B0KX1lbHNle2lmKCFrZXkuaXNQdWJsaWMoKSl7dGhyb3cgRXJyb3IoIlRoaXMgaXMgbm90IHB1YmxpYyBrZXkiKX1yZXR1cm4gbW9kdWxlLmV4cG9ydHNbZm10LnNjaGVtZV0ucHVibGljRXhwb3J0KGtleSxmbXQua2V5T3B0KX19ZWxzZXt0aHJvdyBFcnJvcigiVW5zdXBwb3J0ZWQga2V5IGZvcm1hdCIpfX19fX0seyIuL2NvbXBvbmVudHMiOjQ4LCIuL3BrY3MxIjo1MCwiLi9wa2NzOCI6NTF9XSw1MDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKEJ1ZmZlcil7dmFyIGJlcj1yZXF1aXJlKCJhc24xIikuQmVyO3ZhciBfPXJlcXVpcmUoIi4uL3V0aWxzIikuXzt2YXIgdXRpbHM9cmVxdWlyZSgiLi4vdXRpbHMiKTt2YXIgUFJJVkFURV9PUEVOSU5HX0JPVU5EQVJZPSItLS0tLUJFR0lOIFJTQSBQUklWQVRFIEtFWS0tLS0tIjt2YXIgUFJJVkFURV9DTE9TSU5HX0JPVU5EQVJZPSItLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLSI7dmFyIFBVQkxJQ19PUEVOSU5HX0JPVU5EQVJZPSItLS0tLUJFR0lOIFJTQSBQVUJMSUMgS0VZLS0tLS0iO3ZhciBQVUJMSUNfQ0xPU0lOR19CT1VOREFSWT0iLS0tLS1FTkQgUlNBIFBVQkxJQyBLRVktLS0tLSI7bW9kdWxlLmV4cG9ydHM9e3ByaXZhdGVFeHBvcnQ6ZnVuY3Rpb24oa2V5LG9wdGlvbnMpe29wdGlvbnM9b3B0aW9uc3x8e307dmFyIG49a2V5Lm4udG9CdWZmZXIoKTt2YXIgZD1rZXkuZC50b0J1ZmZlcigpO3ZhciBwPWtleS5wLnRvQnVmZmVyKCk7dmFyIHE9a2V5LnEudG9CdWZmZXIoKTt2YXIgZG1wMT1rZXkuZG1wMS50b0J1ZmZlcigpO3ZhciBkbXExPWtleS5kbXExLnRvQnVmZmVyKCk7dmFyIGNvZWZmPWtleS5jb2VmZi50b0J1ZmZlcigpO3ZhciBsZW5ndGg9bi5sZW5ndGgrZC5sZW5ndGgrcC5sZW5ndGgrcS5sZW5ndGgrZG1wMS5sZW5ndGgrZG1xMS5sZW5ndGgrY29lZmYubGVuZ3RoKzUxMjt2YXIgd3JpdGVyPW5ldyBiZXIuV3JpdGVyKHtzaXplOmxlbmd0aH0pO3dyaXRlci5zdGFydFNlcXVlbmNlKCk7d3JpdGVyLndyaXRlSW50KDApO3dyaXRlci53cml0ZUJ1ZmZlcihuLDIpO3dyaXRlci53cml0ZUludChrZXkuZSk7d3JpdGVyLndyaXRlQnVmZmVyKGQsMik7d3JpdGVyLndyaXRlQnVmZmVyKHAsMik7d3JpdGVyLndyaXRlQnVmZmVyKHEsMik7d3JpdGVyLndyaXRlQnVmZmVyKGRtcDEsMik7d3JpdGVyLndyaXRlQnVmZmVyKGRtcTEsMik7d3JpdGVyLndyaXRlQnVmZmVyKGNvZWZmLDIpO3dyaXRlci5lbmRTZXF1ZW5jZSgpO2lmKG9wdGlvbnMudHlwZT09PSJkZXIiKXtyZXR1cm4gd3JpdGVyLmJ1ZmZlcn1lbHNle3JldHVybiBQUklWQVRFX09QRU5JTkdfQk9VTkRBUlkrIlxuIit1dGlscy5saW5lYnJrKHdyaXRlci5idWZmZXIudG9TdHJpbmcoImJhc2U2NCIpLDY0KSsiXG4iK1BSSVZBVEVfQ0xPU0lOR19CT1VOREFSWX19LHByaXZhdGVJbXBvcnQ6ZnVuY3Rpb24oa2V5LGRhdGEsb3B0aW9ucyl7b3B0aW9ucz1vcHRpb25zfHx7fTt2YXIgYnVmZmVyO2lmKG9wdGlvbnMudHlwZSE9PSJkZXIiKXtpZihCdWZmZXIuaXNCdWZmZXIoZGF0YSkpe2RhdGE9ZGF0YS50b1N0cmluZygidXRmOCIpfWlmKF8uaXNTdHJpbmcoZGF0YSkpe3ZhciBwZW09dXRpbHMudHJpbVN1cnJvdW5kaW5nVGV4dChkYXRhLFBSSVZBVEVfT1BFTklOR19CT1VOREFSWSxQUklWQVRFX0NMT1NJTkdfQk9VTkRBUlkpLnJlcGxhY2UoL1xzK3xcblxyfFxufFxyJC9nbSwiIik7YnVmZmVyPUJ1ZmZlci5mcm9tKHBlbSwiYmFzZTY0Iil9ZWxzZXt0aHJvdyBFcnJvcigiVW5zdXBwb3J0ZWQga2V5IGZvcm1hdCIpfX1lbHNlIGlmKEJ1ZmZlci5pc0J1ZmZlcihkYXRhKSl7YnVmZmVyPWRhdGF9ZWxzZXt0aHJvdyBFcnJvcigiVW5zdXBwb3J0ZWQga2V5IGZvcm1hdCIpfXZhciByZWFkZXI9bmV3IGJlci5SZWFkZXIoYnVmZmVyKTtyZWFkZXIucmVhZFNlcXVlbmNlKCk7cmVhZGVyLnJlYWRTdHJpbmcoMix0cnVlKTtrZXkuc2V0UHJpdmF0ZShyZWFkZXIucmVhZFN0cmluZygyLHRydWUpLHJlYWRlci5yZWFkU3RyaW5nKDIsdHJ1ZSkscmVhZGVyLnJlYWRTdHJpbmcoMix0cnVlKSxyZWFkZXIucmVhZFN0cmluZygyLHRydWUpLHJlYWRlci5yZWFkU3RyaW5nKDIsdHJ1ZSkscmVhZGVyLnJlYWRTdHJpbmcoMix0cnVlKSxyZWFkZXIucmVhZFN0cmluZygyLHRydWUpLHJlYWRlci5yZWFkU3RyaW5nKDIsdHJ1ZSkpfSxwdWJsaWNFeHBvcnQ6ZnVuY3Rpb24oa2V5LG9wdGlvbnMpe29wdGlvbnM9b3B0aW9uc3x8e307dmFyIG49a2V5Lm4udG9CdWZmZXIoKTt2YXIgbGVuZ3RoPW4ubGVuZ3RoKzUxMjt2YXIgYm9keVdyaXRlcj1uZXcgYmVyLldyaXRlcih7c2l6ZTpsZW5ndGh9KTtib2R5V3JpdGVyLnN0YXJ0U2VxdWVuY2UoKTtib2R5V3JpdGVyLndyaXRlQnVmZmVyKG4sMik7Ym9keVdyaXRlci53cml0ZUludChrZXkuZSk7Ym9keVdyaXRlci5lbmRTZXF1ZW5jZSgpO2lmKG9wdGlvbnMudHlwZT09PSJkZXIiKXtyZXR1cm4gYm9keVdyaXRlci5idWZmZXJ9ZWxzZXtyZXR1cm4gUFVCTElDX09QRU5JTkdfQk9VTkRBUlkrIlxuIit1dGlscy5saW5lYnJrKGJvZHlXcml0ZXIuYnVmZmVyLnRvU3RyaW5nKCJiYXNlNjQiKSw2NCkrIlxuIitQVUJMSUNfQ0xPU0lOR19CT1VOREFSWX19LHB1YmxpY0ltcG9ydDpmdW5jdGlvbihrZXksZGF0YSxvcHRpb25zKXtvcHRpb25zPW9wdGlvbnN8fHt9O3ZhciBidWZmZXI7aWYob3B0aW9ucy50eXBlIT09ImRlciIpe2lmKEJ1ZmZlci5pc0J1ZmZlcihkYXRhKSl7ZGF0YT1kYXRhLnRvU3RyaW5nKCJ1dGY4Iil9aWYoXy5pc1N0cmluZyhkYXRhKSl7dmFyIHBlbT11dGlscy50cmltU3Vycm91bmRpbmdUZXh0KGRhdGEsUFVCTElDX09QRU5JTkdfQk9VTkRBUlksUFVCTElDX0NMT1NJTkdfQk9VTkRBUlkpLnJlcGxhY2UoL1xzK3xcblxyfFxufFxyJC9nbSwiIik7YnVmZmVyPUJ1ZmZlci5mcm9tKHBlbSwiYmFzZTY0Iil9fWVsc2UgaWYoQnVmZmVyLmlzQnVmZmVyKGRhdGEpKXtidWZmZXI9ZGF0YX1lbHNle3Rocm93IEVycm9yKCJVbnN1cHBvcnRlZCBrZXkgZm9ybWF0Iil9dmFyIGJvZHk9bmV3IGJlci5SZWFkZXIoYnVmZmVyKTtib2R5LnJlYWRTZXF1ZW5jZSgpO2tleS5zZXRQdWJsaWMoYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSksYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSkpfSxhdXRvSW1wb3J0OmZ1bmN0aW9uKGtleSxkYXRhKXtpZigvXltcU1xzXSotLS0tLUJFR0lOIFJTQSBQUklWQVRFIEtFWS0tLS0tXHMqKD89KChbQS1aYS16MC05Ky89XStccyopKykpXDEtLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLVtcU1xzXSokL2cudGVzdChkYXRhKSl7bW9kdWxlLmV4cG9ydHMucHJpdmF0ZUltcG9ydChrZXksZGF0YSk7cmV0dXJuIHRydWV9aWYoL15bXFNcc10qLS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tXHMqKD89KChbQS1aYS16MC05Ky89XStccyopKykpXDEtLS0tLUVORCBSU0EgUFVCTElDIEtFWS0tLS0tW1xTXHNdKiQvZy50ZXN0KGRhdGEpKXttb2R1bGUuZXhwb3J0cy5wdWJsaWNJbXBvcnQoa2V5LGRhdGEpO3JldHVybiB0cnVlfXJldHVybiBmYWxzZX19fSkuY2FsbCh0aGlzLHJlcXVpcmUoImJ1ZmZlciIpLkJ1ZmZlcil9LHsiLi4vdXRpbHMiOjU4LGFzbjE6MTksYnVmZmVyOjI3fV0sNTE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihCdWZmZXIpe3ZhciBiZXI9cmVxdWlyZSgiYXNuMSIpLkJlcjt2YXIgXz1yZXF1aXJlKCIuLi91dGlscyIpLl87dmFyIFBVQkxJQ19SU0FfT0lEPSIxLjIuODQwLjExMzU0OS4xLjEuMSI7dmFyIHV0aWxzPXJlcXVpcmUoIi4uL3V0aWxzIik7dmFyIFBSSVZBVEVfT1BFTklOR19CT1VOREFSWT0iLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tIjt2YXIgUFJJVkFURV9DTE9TSU5HX0JPVU5EQVJZPSItLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tIjt2YXIgUFVCTElDX09QRU5JTkdfQk9VTkRBUlk9Ii0tLS0tQkVHSU4gUFVCTElDIEtFWS0tLS0tIjt2YXIgUFVCTElDX0NMT1NJTkdfQk9VTkRBUlk9Ii0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLSI7bW9kdWxlLmV4cG9ydHM9e3ByaXZhdGVFeHBvcnQ6ZnVuY3Rpb24oa2V5LG9wdGlvbnMpe29wdGlvbnM9b3B0aW9uc3x8e307dmFyIG49a2V5Lm4udG9CdWZmZXIoKTt2YXIgZD1rZXkuZC50b0J1ZmZlcigpO3ZhciBwPWtleS5wLnRvQnVmZmVyKCk7dmFyIHE9a2V5LnEudG9CdWZmZXIoKTt2YXIgZG1wMT1rZXkuZG1wMS50b0J1ZmZlcigpO3ZhciBkbXExPWtleS5kbXExLnRvQnVmZmVyKCk7dmFyIGNvZWZmPWtleS5jb2VmZi50b0J1ZmZlcigpO3ZhciBsZW5ndGg9bi5sZW5ndGgrZC5sZW5ndGgrcC5sZW5ndGgrcS5sZW5ndGgrZG1wMS5sZW5ndGgrZG1xMS5sZW5ndGgrY29lZmYubGVuZ3RoKzUxMjt2YXIgYm9keVdyaXRlcj1uZXcgYmVyLldyaXRlcih7c2l6ZTpsZW5ndGh9KTtib2R5V3JpdGVyLnN0YXJ0U2VxdWVuY2UoKTtib2R5V3JpdGVyLndyaXRlSW50KDApO2JvZHlXcml0ZXIud3JpdGVCdWZmZXIobiwyKTtib2R5V3JpdGVyLndyaXRlSW50KGtleS5lKTtib2R5V3JpdGVyLndyaXRlQnVmZmVyKGQsMik7Ym9keVdyaXRlci53cml0ZUJ1ZmZlcihwLDIpO2JvZHlXcml0ZXIud3JpdGVCdWZmZXIocSwyKTtib2R5V3JpdGVyLndyaXRlQnVmZmVyKGRtcDEsMik7Ym9keVdyaXRlci53cml0ZUJ1ZmZlcihkbXExLDIpO2JvZHlXcml0ZXIud3JpdGVCdWZmZXIoY29lZmYsMik7Ym9keVdyaXRlci5lbmRTZXF1ZW5jZSgpO3ZhciB3cml0ZXI9bmV3IGJlci5Xcml0ZXIoe3NpemU6bGVuZ3RofSk7d3JpdGVyLnN0YXJ0U2VxdWVuY2UoKTt3cml0ZXIud3JpdGVJbnQoMCk7d3JpdGVyLnN0YXJ0U2VxdWVuY2UoKTt3cml0ZXIud3JpdGVPSUQoUFVCTElDX1JTQV9PSUQpO3dyaXRlci53cml0ZU51bGwoKTt3cml0ZXIuZW5kU2VxdWVuY2UoKTt3cml0ZXIud3JpdGVCdWZmZXIoYm9keVdyaXRlci5idWZmZXIsNCk7d3JpdGVyLmVuZFNlcXVlbmNlKCk7aWYob3B0aW9ucy50eXBlPT09ImRlciIpe3JldHVybiB3cml0ZXIuYnVmZmVyfWVsc2V7cmV0dXJuIFBSSVZBVEVfT1BFTklOR19CT1VOREFSWSsiXG4iK3V0aWxzLmxpbmVicmsod3JpdGVyLmJ1ZmZlci50b1N0cmluZygiYmFzZTY0IiksNjQpKyJcbiIrUFJJVkFURV9DTE9TSU5HX0JPVU5EQVJZfX0scHJpdmF0ZUltcG9ydDpmdW5jdGlvbihrZXksZGF0YSxvcHRpb25zKXtvcHRpb25zPW9wdGlvbnN8fHt9O3ZhciBidWZmZXI7aWYob3B0aW9ucy50eXBlIT09ImRlciIpe2lmKEJ1ZmZlci5pc0J1ZmZlcihkYXRhKSl7ZGF0YT1kYXRhLnRvU3RyaW5nKCJ1dGY4Iil9aWYoXy5pc1N0cmluZyhkYXRhKSl7dmFyIHBlbT11dGlscy50cmltU3Vycm91bmRpbmdUZXh0KGRhdGEsUFJJVkFURV9PUEVOSU5HX0JPVU5EQVJZLFBSSVZBVEVfQ0xPU0lOR19CT1VOREFSWSkucmVwbGFjZSgiLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLSIsIiIpLnJlcGxhY2UoL1xzK3xcblxyfFxufFxyJC9nbSwiIik7YnVmZmVyPUJ1ZmZlci5mcm9tKHBlbSwiYmFzZTY0Iil9ZWxzZXt0aHJvdyBFcnJvcigiVW5zdXBwb3J0ZWQga2V5IGZvcm1hdCIpfX1lbHNlIGlmKEJ1ZmZlci5pc0J1ZmZlcihkYXRhKSl7YnVmZmVyPWRhdGF9ZWxzZXt0aHJvdyBFcnJvcigiVW5zdXBwb3J0ZWQga2V5IGZvcm1hdCIpfXZhciByZWFkZXI9bmV3IGJlci5SZWFkZXIoYnVmZmVyKTtyZWFkZXIucmVhZFNlcXVlbmNlKCk7cmVhZGVyLnJlYWRJbnQoMCk7dmFyIGhlYWRlcj1uZXcgYmVyLlJlYWRlcihyZWFkZXIucmVhZFN0cmluZyg0OCx0cnVlKSk7aWYoaGVhZGVyLnJlYWRPSUQoNix0cnVlKSE9PVBVQkxJQ19SU0FfT0lEKXt0aHJvdyBFcnJvcigiSW52YWxpZCBQdWJsaWMga2V5IGZvcm1hdCIpfXZhciBib2R5PW5ldyBiZXIuUmVhZGVyKHJlYWRlci5yZWFkU3RyaW5nKDQsdHJ1ZSkpO2JvZHkucmVhZFNlcXVlbmNlKCk7Ym9keS5yZWFkU3RyaW5nKDIsdHJ1ZSk7a2V5LnNldFByaXZhdGUoYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSksYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSksYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSksYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSksYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSksYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSksYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSksYm9keS5yZWFkU3RyaW5nKDIsdHJ1ZSkpfSxwdWJsaWNFeHBvcnQ6ZnVuY3Rpb24oa2V5LG9wdGlvbnMpe29wdGlvbnM9b3B0aW9uc3x8e307dmFyIG49a2V5Lm4udG9CdWZmZXIoKTt2YXIgbGVuZ3RoPW4ubGVuZ3RoKzUxMjt2YXIgYm9keVdyaXRlcj1uZXcgYmVyLldyaXRlcih7c2l6ZTpsZW5ndGh9KTtib2R5V3JpdGVyLndyaXRlQnl0ZSgwKTtib2R5V3JpdGVyLnN0YXJ0U2VxdWVuY2UoKTtib2R5V3JpdGVyLndyaXRlQnVmZmVyKG4sMik7Ym9keVdyaXRlci53cml0ZUludChrZXkuZSk7Ym9keVdyaXRlci5lbmRTZXF1ZW5jZSgpO3ZhciB3cml0ZXI9bmV3IGJlci5Xcml0ZXIoe3NpemU6bGVuZ3RofSk7d3JpdGVyLnN0YXJ0U2VxdWVuY2UoKTt3cml0ZXIuc3RhcnRTZXF1ZW5jZSgpO3dyaXRlci53cml0ZU9JRChQVUJMSUNfUlNBX09JRCk7d3JpdGVyLndyaXRlTnVsbCgpO3dyaXRlci5lbmRTZXF1ZW5jZSgpO3dyaXRlci53cml0ZUJ1ZmZlcihib2R5V3JpdGVyLmJ1ZmZlciwzKTt3cml0ZXIuZW5kU2VxdWVuY2UoKTtpZihvcHRpb25zLnR5cGU9PT0iZGVyIil7cmV0dXJuIHdyaXRlci5idWZmZXJ9ZWxzZXtyZXR1cm4gUFVCTElDX09QRU5JTkdfQk9VTkRBUlkrIlxuIit1dGlscy5saW5lYnJrKHdyaXRlci5idWZmZXIudG9TdHJpbmcoImJhc2U2NCIpLDY0KSsiXG4iK1BVQkxJQ19DTE9TSU5HX0JPVU5EQVJZfX0scHVibGljSW1wb3J0OmZ1bmN0aW9uKGtleSxkYXRhLG9wdGlvbnMpe29wdGlvbnM9b3B0aW9uc3x8e307dmFyIGJ1ZmZlcjtpZihvcHRpb25zLnR5cGUhPT0iZGVyIil7aWYoQnVmZmVyLmlzQnVmZmVyKGRhdGEpKXtkYXRhPWRhdGEudG9TdHJpbmcoInV0ZjgiKX1pZihfLmlzU3RyaW5nKGRhdGEpKXt2YXIgcGVtPXV0aWxzLnRyaW1TdXJyb3VuZGluZ1RleHQoZGF0YSxQVUJMSUNfT1BFTklOR19CT1VOREFSWSxQVUJMSUNfQ0xPU0lOR19CT1VOREFSWSkucmVwbGFjZSgvXHMrfFxuXHJ8XG58XHIkL2dtLCIiKTtidWZmZXI9QnVmZmVyLmZyb20ocGVtLCJiYXNlNjQiKX19ZWxzZSBpZihCdWZmZXIuaXNCdWZmZXIoZGF0YSkpe2J1ZmZlcj1kYXRhfWVsc2V7dGhyb3cgRXJyb3IoIlVuc3VwcG9ydGVkIGtleSBmb3JtYXQiKX12YXIgcmVhZGVyPW5ldyBiZXIuUmVhZGVyKGJ1ZmZlcik7cmVhZGVyLnJlYWRTZXF1ZW5jZSgpO3ZhciBoZWFkZXI9bmV3IGJlci5SZWFkZXIocmVhZGVyLnJlYWRTdHJpbmcoNDgsdHJ1ZSkpO2lmKGhlYWRlci5yZWFkT0lEKDYsdHJ1ZSkhPT1QVUJMSUNfUlNBX09JRCl7dGhyb3cgRXJyb3IoIkludmFsaWQgUHVibGljIGtleSBmb3JtYXQiKX12YXIgYm9keT1uZXcgYmVyLlJlYWRlcihyZWFkZXIucmVhZFN0cmluZygzLHRydWUpKTtib2R5LnJlYWRCeXRlKCk7Ym9keS5yZWFkU2VxdWVuY2UoKTtrZXkuc2V0UHVibGljKGJvZHkucmVhZFN0cmluZygyLHRydWUpLGJvZHkucmVhZFN0cmluZygyLHRydWUpKX0sYXV0b0ltcG9ydDpmdW5jdGlvbihrZXksZGF0YSl7aWYoL15bXFNcc10qLS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tXHMqKD89KChbQS1aYS16MC05Ky89XStccyopKykpXDEtLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tW1xTXHNdKiQvZy50ZXN0KGRhdGEpKXttb2R1bGUuZXhwb3J0cy5wcml2YXRlSW1wb3J0KGtleSxkYXRhKTtyZXR1cm4gdHJ1ZX1pZigvXltcU1xzXSotLS0tLUJFR0lOIFBVQkxJQyBLRVktLS0tLVxzKig/PSgoW0EtWmEtejAtOSsvPV0rXHMqKSspKVwxLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tW1xTXHNdKiQvZy50ZXN0KGRhdGEpKXttb2R1bGUuZXhwb3J0cy5wdWJsaWNJbXBvcnQoa2V5LGRhdGEpO3JldHVybiB0cnVlfXJldHVybiBmYWxzZX19fSkuY2FsbCh0aGlzLHJlcXVpcmUoImJ1ZmZlciIpLkJ1ZmZlcil9LHsiLi4vdXRpbHMiOjU4LGFzbjE6MTksYnVmZmVyOjI3fV0sNTI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihCdWZmZXIpe3ZhciBjcnlwdD1yZXF1aXJlKCIuLi9jcnlwdG8iKTt2YXIgXz1yZXF1aXJlKCIuLi91dGlscyIpLl87dmFyIHBldGVyT2xzb25fQmlnSW50ZWdlclN0YXRpYz1yZXF1aXJlKCJiaWctaW50ZWdlciIpO3ZhciBkYml0czt2YXIgY2FuYXJ5PTB4ZGVhZGJlZWZjYWZlO3ZhciBqX2xtPShjYW5hcnkmMTY3NzcyMTUpPT0xNTcxNTA3MDtmdW5jdGlvbiBCaWdJbnRlZ2VyKGEsYil7aWYoYSE9bnVsbCl7aWYoIm51bWJlciI9PXR5cGVvZiBhKXt0aGlzLmZyb21OdW1iZXIoYSxiKX1lbHNlIGlmKEJ1ZmZlci5pc0J1ZmZlcihhKSl7dGhpcy5mcm9tQnVmZmVyKGEpfWVsc2UgaWYoYj09bnVsbCYmInN0cmluZyIhPXR5cGVvZiBhKXt0aGlzLmZyb21CeXRlQXJyYXkoYSl9ZWxzZXt0aGlzLmZyb21TdHJpbmcoYSxiKX19fWZ1bmN0aW9uIG5iaSgpe3JldHVybiBuZXcgQmlnSW50ZWdlcihudWxsKX1mdW5jdGlvbiBhbTEoaSx4LHcsaixjLG4pe3doaWxlKC0tbj49MCl7dmFyIHY9eCp0aGlzW2krK10rd1tqXStjO2M9TWF0aC5mbG9vcih2LzY3MTA4ODY0KTt3W2orK109diY2NzEwODg2M31yZXR1cm4gY31mdW5jdGlvbiBhbTIoaSx4LHcsaixjLG4pe3ZhciB4bD14JjMyNzY3LHhoPXg+PjE1O3doaWxlKC0tbj49MCl7dmFyIGw9dGhpc1tpXSYzMjc2Nzt2YXIgaD10aGlzW2krK10+PjE1O3ZhciBtPXhoKmwraCp4bDtsPXhsKmwrKChtJjMyNzY3KTw8MTUpK3dbal0rKGMmMTA3Mzc0MTgyMyk7Yz0obD4+PjMwKSsobT4+PjE1KSt4aCpoKyhjPj4+MzApO3dbaisrXT1sJjEwNzM3NDE4MjN9cmV0dXJuIGN9ZnVuY3Rpb24gYW0zKGkseCx3LGosYyxuKXt2YXIgeGw9eCYxNjM4Myx4aD14Pj4xNDt3aGlsZSgtLW4+PTApe3ZhciBsPXRoaXNbaV0mMTYzODM7dmFyIGg9dGhpc1tpKytdPj4xNDt2YXIgbT14aCpsK2gqeGw7bD14bCpsKygobSYxNjM4Myk8PDE0KSt3W2pdK2M7Yz0obD4+MjgpKyhtPj4xNCkreGgqaDt3W2orK109bCYyNjg0MzU0NTV9cmV0dXJuIGN9QmlnSW50ZWdlci5wcm90b3R5cGUuYW09YW0zO2RiaXRzPTI4O0JpZ0ludGVnZXIucHJvdG90eXBlLkRCPWRiaXRzO0JpZ0ludGVnZXIucHJvdG90eXBlLkRNPSgxPDxkYml0cyktMTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5EVj0xPDxkYml0czt2YXIgQklfRlA9NTI7QmlnSW50ZWdlci5wcm90b3R5cGUuRlY9TWF0aC5wb3coMixCSV9GUCk7QmlnSW50ZWdlci5wcm90b3R5cGUuRjE9QklfRlAtZGJpdHM7QmlnSW50ZWdlci5wcm90b3R5cGUuRjI9MipkYml0cy1CSV9GUDt2YXIgQklfUk09IjAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eiI7dmFyIEJJX1JDPW5ldyBBcnJheTt2YXIgcnIsdnY7cnI9IjAiLmNoYXJDb2RlQXQoMCk7Zm9yKHZ2PTA7dnY8PTk7Kyt2dilCSV9SQ1tycisrXT12djtycj0iYSIuY2hhckNvZGVBdCgwKTtmb3IodnY9MTA7dnY8MzY7Kyt2dilCSV9SQ1tycisrXT12djtycj0iQSIuY2hhckNvZGVBdCgwKTtmb3IodnY9MTA7dnY8MzY7Kyt2dilCSV9SQ1tycisrXT12djtmdW5jdGlvbiBpbnQyY2hhcihuKXtyZXR1cm4gQklfUk0uY2hhckF0KG4pfWZ1bmN0aW9uIGludEF0KHMsaSl7dmFyIGM9QklfUkNbcy5jaGFyQ29kZUF0KGkpXTtyZXR1cm4gYz09bnVsbD8tMTpjfWZ1bmN0aW9uIGJucENvcHlUbyhyKXtmb3IodmFyIGk9dGhpcy50LTE7aT49MDstLWkpcltpXT10aGlzW2ldO3IudD10aGlzLnQ7ci5zPXRoaXMuc31mdW5jdGlvbiBibnBGcm9tSW50KHgpe3RoaXMudD0xO3RoaXMucz14PDA/LTE6MDtpZih4PjApdGhpc1swXT14O2Vsc2UgaWYoeDwtMSl0aGlzWzBdPXgrRFY7ZWxzZSB0aGlzLnQ9MH1mdW5jdGlvbiBuYnYoaSl7dmFyIHI9bmJpKCk7ci5mcm9tSW50KGkpO3JldHVybiByfWZ1bmN0aW9uIGJucEZyb21TdHJpbmcoZGF0YSxyYWRpeCx1bnNpZ25lZCl7dmFyIGs7c3dpdGNoKHJhZGl4KXtjYXNlIDI6az0xO2JyZWFrO2Nhc2UgNDprPTI7YnJlYWs7Y2FzZSA4Oms9MzticmVhaztjYXNlIDE2Oms9NDticmVhaztjYXNlIDMyOms9NTticmVhaztjYXNlIDI1NjprPTg7YnJlYWs7ZGVmYXVsdDp0aGlzLmZyb21SYWRpeChkYXRhLHJhZGl4KTtyZXR1cm59dGhpcy50PTA7dGhpcy5zPTA7dmFyIGk9ZGF0YS5sZW5ndGg7dmFyIG1pPWZhbHNlO3ZhciBzaD0wO3doaWxlKC0taT49MCl7dmFyIHg9az09OD9kYXRhW2ldJjI1NTppbnRBdChkYXRhLGkpO2lmKHg8MCl7aWYoZGF0YS5jaGFyQXQoaSk9PSItIiltaT10cnVlO2NvbnRpbnVlfW1pPWZhbHNlO2lmKHNoPT09MCl0aGlzW3RoaXMudCsrXT14O2Vsc2UgaWYoc2graz50aGlzLkRCKXt0aGlzW3RoaXMudC0xXXw9KHgmKDE8PHRoaXMuREItc2gpLTEpPDxzaDt0aGlzW3RoaXMudCsrXT14Pj50aGlzLkRCLXNofWVsc2UgdGhpc1t0aGlzLnQtMV18PXg8PHNoO3NoKz1rO2lmKHNoPj10aGlzLkRCKXNoLT10aGlzLkRCfWlmKCF1bnNpZ25lZCYmaz09OCYmKGRhdGFbMF0mMTI4KSE9MCl7dGhpcy5zPS0xO2lmKHNoPjApdGhpc1t0aGlzLnQtMV18PSgxPDx0aGlzLkRCLXNoKS0xPDxzaH10aGlzLmNsYW1wKCk7aWYobWkpQmlnSW50ZWdlci5aRVJPLnN1YlRvKHRoaXMsdGhpcyl9ZnVuY3Rpb24gYm5wRnJvbUJ5dGVBcnJheShhLHVuc2lnbmVkKXt0aGlzLmZyb21TdHJpbmcoYSwyNTYsdW5zaWduZWQpfWZ1bmN0aW9uIGJucEZyb21CdWZmZXIoYSl7dGhpcy5mcm9tU3RyaW5nKGEsMjU2LHRydWUpfWZ1bmN0aW9uIGJucENsYW1wKCl7dmFyIGM9dGhpcy5zJnRoaXMuRE07d2hpbGUodGhpcy50PjAmJnRoaXNbdGhpcy50LTFdPT1jKS0tdGhpcy50fWZ1bmN0aW9uIGJuVG9TdHJpbmcoYil7aWYodGhpcy5zPDApcmV0dXJuIi0iK3RoaXMubmVnYXRlKCkudG9TdHJpbmcoYik7dmFyIGs7aWYoYj09MTYpaz00O2Vsc2UgaWYoYj09OClrPTM7ZWxzZSBpZihiPT0yKWs9MTtlbHNlIGlmKGI9PTMyKWs9NTtlbHNlIGlmKGI9PTQpaz0yO2Vsc2UgcmV0dXJuIHRoaXMudG9SYWRpeChiKTt2YXIga209KDE8PGspLTEsZCxtPWZhbHNlLHI9IiIsaT10aGlzLnQ7dmFyIHA9dGhpcy5EQi1pKnRoaXMuREIlaztpZihpLS0gPjApe2lmKHA8dGhpcy5EQiYmKGQ9dGhpc1tpXT4+cCk+MCl7bT10cnVlO3I9aW50MmNoYXIoZCl9d2hpbGUoaT49MCl7aWYocDxrKXtkPSh0aGlzW2ldJigxPDxwKS0xKTw8ay1wO2R8PXRoaXNbLS1pXT4+KHArPXRoaXMuREItayl9ZWxzZXtkPXRoaXNbaV0+PihwLT1rKSZrbTtpZihwPD0wKXtwKz10aGlzLkRCOy0taX19aWYoZD4wKW09dHJ1ZTtpZihtKXIrPWludDJjaGFyKGQpfX1yZXR1cm4gbT9yOiIwIn1mdW5jdGlvbiBibk5lZ2F0ZSgpe3ZhciByPW5iaSgpO0JpZ0ludGVnZXIuWkVSTy5zdWJUbyh0aGlzLHIpO3JldHVybiByfWZ1bmN0aW9uIGJuQWJzKCl7cmV0dXJuIHRoaXMuczwwP3RoaXMubmVnYXRlKCk6dGhpc31mdW5jdGlvbiBibkNvbXBhcmVUbyhhKXt2YXIgcj10aGlzLnMtYS5zO2lmKHIhPTApcmV0dXJuIHI7dmFyIGk9dGhpcy50O3I9aS1hLnQ7aWYociE9MClyZXR1cm4gdGhpcy5zPDA/LXI6cjt3aGlsZSgtLWk+PTApaWYoKHI9dGhpc1tpXS1hW2ldKSE9MClyZXR1cm4gcjtyZXR1cm4gMH1mdW5jdGlvbiBuYml0cyh4KXt2YXIgcj0xLHQ7aWYoKHQ9eD4+PjE2KSE9MCl7eD10O3IrPTE2fWlmKCh0PXg+PjgpIT0wKXt4PXQ7cis9OH1pZigodD14Pj40KSE9MCl7eD10O3IrPTR9aWYoKHQ9eD4+MikhPTApe3g9dDtyKz0yfWlmKCh0PXg+PjEpIT0wKXt4PXQ7cis9MX1yZXR1cm4gcn1mdW5jdGlvbiBibkJpdExlbmd0aCgpe2lmKHRoaXMudDw9MClyZXR1cm4gMDtyZXR1cm4gdGhpcy5EQioodGhpcy50LTEpK25iaXRzKHRoaXNbdGhpcy50LTFdXnRoaXMucyZ0aGlzLkRNKX1mdW5jdGlvbiBibnBETFNoaWZ0VG8obixyKXt2YXIgaTtmb3IoaT10aGlzLnQtMTtpPj0wOy0taSlyW2krbl09dGhpc1tpXTtmb3IoaT1uLTE7aT49MDstLWkpcltpXT0wO3IudD10aGlzLnQrbjtyLnM9dGhpcy5zfWZ1bmN0aW9uIGJucERSU2hpZnRUbyhuLHIpe2Zvcih2YXIgaT1uO2k8dGhpcy50OysraSlyW2ktbl09dGhpc1tpXTtyLnQ9TWF0aC5tYXgodGhpcy50LW4sMCk7ci5zPXRoaXMuc31mdW5jdGlvbiBibnBMU2hpZnRUbyhuLHIpe3ZhciBicz1uJXRoaXMuREI7dmFyIGNicz10aGlzLkRCLWJzO3ZhciBibT0oMTw8Y2JzKS0xO3ZhciBkcz1NYXRoLmZsb29yKG4vdGhpcy5EQiksYz10aGlzLnM8PGJzJnRoaXMuRE0saTtmb3IoaT10aGlzLnQtMTtpPj0wOy0taSl7cltpK2RzKzFdPXRoaXNbaV0+PmNic3xjO2M9KHRoaXNbaV0mYm0pPDxic31mb3IoaT1kcy0xO2k+PTA7LS1pKXJbaV09MDtyW2RzXT1jO3IudD10aGlzLnQrZHMrMTtyLnM9dGhpcy5zO3IuY2xhbXAoKX1mdW5jdGlvbiBibnBSU2hpZnRUbyhuLHIpe3Iucz10aGlzLnM7dmFyIGRzPU1hdGguZmxvb3Iobi90aGlzLkRCKTtpZihkcz49dGhpcy50KXtyLnQ9MDtyZXR1cm59dmFyIGJzPW4ldGhpcy5EQjt2YXIgY2JzPXRoaXMuREItYnM7dmFyIGJtPSgxPDxicyktMTtyWzBdPXRoaXNbZHNdPj5icztmb3IodmFyIGk9ZHMrMTtpPHRoaXMudDsrK2kpe3JbaS1kcy0xXXw9KHRoaXNbaV0mYm0pPDxjYnM7cltpLWRzXT10aGlzW2ldPj5ic31pZihicz4wKXJbdGhpcy50LWRzLTFdfD0odGhpcy5zJmJtKTw8Y2JzO3IudD10aGlzLnQtZHM7ci5jbGFtcCgpfWZ1bmN0aW9uIGJucFN1YlRvKGEscil7dmFyIGk9MCxjPTAsbT1NYXRoLm1pbihhLnQsdGhpcy50KTt3aGlsZShpPG0pe2MrPXRoaXNbaV0tYVtpXTtyW2krK109YyZ0aGlzLkRNO2M+Pj10aGlzLkRCfWlmKGEudDx0aGlzLnQpe2MtPWEuczt3aGlsZShpPHRoaXMudCl7Yys9dGhpc1tpXTtyW2krK109YyZ0aGlzLkRNO2M+Pj10aGlzLkRCfWMrPXRoaXMuc31lbHNle2MrPXRoaXMuczt3aGlsZShpPGEudCl7Yy09YVtpXTtyW2krK109YyZ0aGlzLkRNO2M+Pj10aGlzLkRCfWMtPWEuc31yLnM9YzwwPy0xOjA7aWYoYzwtMSlyW2krK109dGhpcy5EVitjO2Vsc2UgaWYoYz4wKXJbaSsrXT1jO3IudD1pO3IuY2xhbXAoKX1mdW5jdGlvbiBibnBNdWx0aXBseVRvKGEscil7dmFyIHg9dGhpcy5hYnMoKSx5PWEuYWJzKCk7dmFyIGk9eC50O3IudD1pK3kudDt3aGlsZSgtLWk+PTApcltpXT0wO2ZvcihpPTA7aTx5LnQ7KytpKXJbaSt4LnRdPXguYW0oMCx5W2ldLHIsaSwwLHgudCk7ci5zPTA7ci5jbGFtcCgpO2lmKHRoaXMucyE9YS5zKUJpZ0ludGVnZXIuWkVSTy5zdWJUbyhyLHIpfWZ1bmN0aW9uIGJucFNxdWFyZVRvKHIpe3ZhciB4PXRoaXMuYWJzKCk7dmFyIGk9ci50PTIqeC50O3doaWxlKC0taT49MClyW2ldPTA7Zm9yKGk9MDtpPHgudC0xOysraSl7dmFyIGM9eC5hbShpLHhbaV0sciwyKmksMCwxKTtpZigocltpK3gudF0rPXguYW0oaSsxLDIqeFtpXSxyLDIqaSsxLGMseC50LWktMSkpPj14LkRWKXtyW2kreC50XS09eC5EVjtyW2kreC50KzFdPTF9fWlmKHIudD4wKXJbci50LTFdKz14LmFtKGkseFtpXSxyLDIqaSwwLDEpO3Iucz0wO3IuY2xhbXAoKX1mdW5jdGlvbiBibnBEaXZSZW1UbyhtLHEscil7dmFyIHBtPW0uYWJzKCk7aWYocG0udDw9MClyZXR1cm47dmFyIHB0PXRoaXMuYWJzKCk7aWYocHQudDxwbS50KXtpZihxIT1udWxsKXEuZnJvbUludCgwKTtpZihyIT1udWxsKXRoaXMuY29weVRvKHIpO3JldHVybn1pZihyPT1udWxsKXI9bmJpKCk7dmFyIHk9bmJpKCksdHM9dGhpcy5zLG1zPW0uczt2YXIgbnNoPXRoaXMuREItbmJpdHMocG1bcG0udC0xXSk7aWYobnNoPjApe3BtLmxTaGlmdFRvKG5zaCx5KTtwdC5sU2hpZnRUbyhuc2gscil9ZWxzZXtwbS5jb3B5VG8oeSk7cHQuY29weVRvKHIpfXZhciB5cz15LnQ7dmFyIHkwPXlbeXMtMV07aWYoeTA9PT0wKXJldHVybjt2YXIgeXQ9eTAqKDE8PHRoaXMuRjEpKyh5cz4xP3lbeXMtMl0+PnRoaXMuRjI6MCk7dmFyIGQxPXRoaXMuRlYveXQsZDI9KDE8PHRoaXMuRjEpL3l0LGU9MTw8dGhpcy5GMjt2YXIgaT1yLnQsaj1pLXlzLHQ9cT09bnVsbD9uYmkoKTpxO3kuZGxTaGlmdFRvKGosdCk7aWYoci5jb21wYXJlVG8odCk+PTApe3Jbci50KytdPTE7ci5zdWJUbyh0LHIpfUJpZ0ludGVnZXIuT05FLmRsU2hpZnRUbyh5cyx0KTt0LnN1YlRvKHkseSk7d2hpbGUoeS50PHlzKXlbeS50KytdPTA7d2hpbGUoLS1qPj0wKXt2YXIgcWQ9clstLWldPT15MD90aGlzLkRNOk1hdGguZmxvb3IocltpXSpkMSsocltpLTFdK2UpKmQyKTtpZigocltpXSs9eS5hbSgwLHFkLHIsaiwwLHlzKSk8cWQpe3kuZGxTaGlmdFRvKGosdCk7ci5zdWJUbyh0LHIpO3doaWxlKHJbaV08LS1xZClyLnN1YlRvKHQscil9fWlmKHEhPW51bGwpe3IuZHJTaGlmdFRvKHlzLHEpO2lmKHRzIT1tcylCaWdJbnRlZ2VyLlpFUk8uc3ViVG8ocSxxKX1yLnQ9eXM7ci5jbGFtcCgpO2lmKG5zaD4wKXIuclNoaWZ0VG8obnNoLHIpO2lmKHRzPDApQmlnSW50ZWdlci5aRVJPLnN1YlRvKHIscil9ZnVuY3Rpb24gYm5Nb2QoYSl7dmFyIHI9bmJpKCk7dGhpcy5hYnMoKS5kaXZSZW1UbyhhLG51bGwscik7aWYodGhpcy5zPDAmJnIuY29tcGFyZVRvKEJpZ0ludGVnZXIuWkVSTyk+MClhLnN1YlRvKHIscik7cmV0dXJuIHJ9ZnVuY3Rpb24gQ2xhc3NpYyhtKXt0aGlzLm09bX1mdW5jdGlvbiBjQ29udmVydCh4KXtpZih4LnM8MHx8eC5jb21wYXJlVG8odGhpcy5tKT49MClyZXR1cm4geC5tb2QodGhpcy5tKTtlbHNlIHJldHVybiB4fWZ1bmN0aW9uIGNSZXZlcnQoeCl7cmV0dXJuIHh9ZnVuY3Rpb24gY1JlZHVjZSh4KXt4LmRpdlJlbVRvKHRoaXMubSxudWxsLHgpfWZ1bmN0aW9uIGNNdWxUbyh4LHkscil7eC5tdWx0aXBseVRvKHkscik7dGhpcy5yZWR1Y2Uocil9ZnVuY3Rpb24gY1NxclRvKHgscil7eC5zcXVhcmVUbyhyKTt0aGlzLnJlZHVjZShyKX1DbGFzc2ljLnByb3RvdHlwZS5jb252ZXJ0PWNDb252ZXJ0O0NsYXNzaWMucHJvdG90eXBlLnJldmVydD1jUmV2ZXJ0O0NsYXNzaWMucHJvdG90eXBlLnJlZHVjZT1jUmVkdWNlO0NsYXNzaWMucHJvdG90eXBlLm11bFRvPWNNdWxUbztDbGFzc2ljLnByb3RvdHlwZS5zcXJUbz1jU3FyVG87ZnVuY3Rpb24gYm5wSW52RGlnaXQoKXtpZih0aGlzLnQ8MSlyZXR1cm4gMDt2YXIgeD10aGlzWzBdO2lmKCh4JjEpPT09MClyZXR1cm4gMDt2YXIgeT14JjM7eT15KigyLSh4JjE1KSp5KSYxNTt5PXkqKDItKHgmMjU1KSp5KSYyNTU7eT15KigyLSgoeCY2NTUzNSkqeSY2NTUzNSkpJjY1NTM1O3k9eSooMi14KnkldGhpcy5EVikldGhpcy5EVjtyZXR1cm4geT4wP3RoaXMuRFYteToteX1mdW5jdGlvbiBNb250Z29tZXJ5KG0pe3RoaXMubT1tO3RoaXMubXA9bS5pbnZEaWdpdCgpO3RoaXMubXBsPXRoaXMubXAmMzI3Njc7dGhpcy5tcGg9dGhpcy5tcD4+MTU7dGhpcy51bT0oMTw8bS5EQi0xNSktMTt0aGlzLm10Mj0yKm0udH1mdW5jdGlvbiBtb250Q29udmVydCh4KXt2YXIgcj1uYmkoKTt4LmFicygpLmRsU2hpZnRUbyh0aGlzLm0udCxyKTtyLmRpdlJlbVRvKHRoaXMubSxudWxsLHIpO2lmKHguczwwJiZyLmNvbXBhcmVUbyhCaWdJbnRlZ2VyLlpFUk8pPjApdGhpcy5tLnN1YlRvKHIscik7cmV0dXJuIHJ9ZnVuY3Rpb24gbW9udFJldmVydCh4KXt2YXIgcj1uYmkoKTt4LmNvcHlUbyhyKTt0aGlzLnJlZHVjZShyKTtyZXR1cm4gcn1mdW5jdGlvbiBtb250UmVkdWNlKHgpe3doaWxlKHgudDw9dGhpcy5tdDIpeFt4LnQrK109MDtmb3IodmFyIGk9MDtpPHRoaXMubS50OysraSl7dmFyIGo9eFtpXSYzMjc2Nzt2YXIgdTA9aip0aGlzLm1wbCsoKGoqdGhpcy5tcGgrKHhbaV0+PjE1KSp0aGlzLm1wbCZ0aGlzLnVtKTw8MTUpJnguRE07aj1pK3RoaXMubS50O3hbal0rPXRoaXMubS5hbSgwLHUwLHgsaSwwLHRoaXMubS50KTt3aGlsZSh4W2pdPj14LkRWKXt4W2pdLT14LkRWO3hbKytqXSsrfX14LmNsYW1wKCk7eC5kclNoaWZ0VG8odGhpcy5tLnQseCk7aWYoeC5jb21wYXJlVG8odGhpcy5tKT49MCl4LnN1YlRvKHRoaXMubSx4KX1mdW5jdGlvbiBtb250U3FyVG8oeCxyKXt4LnNxdWFyZVRvKHIpO3RoaXMucmVkdWNlKHIpfWZ1bmN0aW9uIG1vbnRNdWxUbyh4LHkscil7eC5tdWx0aXBseVRvKHkscik7dGhpcy5yZWR1Y2Uocil9TW9udGdvbWVyeS5wcm90b3R5cGUuY29udmVydD1tb250Q29udmVydDtNb250Z29tZXJ5LnByb3RvdHlwZS5yZXZlcnQ9bW9udFJldmVydDtNb250Z29tZXJ5LnByb3RvdHlwZS5yZWR1Y2U9bW9udFJlZHVjZTtNb250Z29tZXJ5LnByb3RvdHlwZS5tdWxUbz1tb250TXVsVG87TW9udGdvbWVyeS5wcm90b3R5cGUuc3FyVG89bW9udFNxclRvO2Z1bmN0aW9uIGJucElzRXZlbigpe3JldHVybih0aGlzLnQ+MD90aGlzWzBdJjE6dGhpcy5zKT09PTB9ZnVuY3Rpb24gYm5wRXhwKGUseil7aWYoZT40Mjk0OTY3Mjk1fHxlPDEpcmV0dXJuIEJpZ0ludGVnZXIuT05FO3ZhciByPW5iaSgpLHIyPW5iaSgpLGc9ei5jb252ZXJ0KHRoaXMpLGk9bmJpdHMoZSktMTtnLmNvcHlUbyhyKTt3aGlsZSgtLWk+PTApe3ouc3FyVG8ocixyMik7aWYoKGUmMTw8aSk+MCl6Lm11bFRvKHIyLGcscik7ZWxzZXt2YXIgdD1yO3I9cjI7cjI9dH19cmV0dXJuIHoucmV2ZXJ0KHIpfWZ1bmN0aW9uIGJuTW9kUG93SW50KGUsbSl7dmFyIHo7aWYoZTwyNTZ8fG0uaXNFdmVuKCkpej1uZXcgQ2xhc3NpYyhtKTtlbHNlIHo9bmV3IE1vbnRnb21lcnkobSk7cmV0dXJuIHRoaXMuZXhwKGUseil9ZnVuY3Rpb24gYm5DbG9uZSgpe3ZhciByPW5iaSgpO3RoaXMuY29weVRvKHIpO3JldHVybiByfWZ1bmN0aW9uIGJuSW50VmFsdWUoKXtpZih0aGlzLnM8MCl7aWYodGhpcy50PT0xKXJldHVybiB0aGlzWzBdLXRoaXMuRFY7ZWxzZSBpZih0aGlzLnQ9PT0wKXJldHVybi0xfWVsc2UgaWYodGhpcy50PT0xKXJldHVybiB0aGlzWzBdO2Vsc2UgaWYodGhpcy50PT09MClyZXR1cm4gMDtyZXR1cm4odGhpc1sxXSYoMTw8MzItdGhpcy5EQiktMSk8PHRoaXMuREJ8dGhpc1swXX1mdW5jdGlvbiBibkJ5dGVWYWx1ZSgpe3JldHVybiB0aGlzLnQ9PTA/dGhpcy5zOnRoaXNbMF08PDI0Pj4yNH1mdW5jdGlvbiBiblNob3J0VmFsdWUoKXtyZXR1cm4gdGhpcy50PT0wP3RoaXMuczp0aGlzWzBdPDwxNj4+MTZ9ZnVuY3Rpb24gYm5wQ2h1bmtTaXplKHIpe3JldHVybiBNYXRoLmZsb29yKE1hdGguTE4yKnRoaXMuREIvTWF0aC5sb2cocikpfWZ1bmN0aW9uIGJuU2lnTnVtKCl7aWYodGhpcy5zPDApcmV0dXJuLTE7ZWxzZSBpZih0aGlzLnQ8PTB8fHRoaXMudD09MSYmdGhpc1swXTw9MClyZXR1cm4gMDtlbHNlIHJldHVybiAxfWZ1bmN0aW9uIGJucFRvUmFkaXgoYil7aWYoYj09bnVsbCliPTEwO2lmKHRoaXMuc2lnbnVtKCk9PT0wfHxiPDJ8fGI+MzYpcmV0dXJuIjAiO3ZhciBjcz10aGlzLmNodW5rU2l6ZShiKTt2YXIgYT1NYXRoLnBvdyhiLGNzKTt2YXIgZD1uYnYoYSkseT1uYmkoKSx6PW5iaSgpLHI9IiI7dGhpcy5kaXZSZW1UbyhkLHkseik7d2hpbGUoeS5zaWdudW0oKT4wKXtyPShhK3ouaW50VmFsdWUoKSkudG9TdHJpbmcoYikuc3Vic3RyKDEpK3I7eS5kaXZSZW1UbyhkLHkseil9cmV0dXJuIHouaW50VmFsdWUoKS50b1N0cmluZyhiKStyfWZ1bmN0aW9uIGJucEZyb21SYWRpeChzLGIpe3RoaXMuZnJvbUludCgwKTtpZihiPT1udWxsKWI9MTA7dmFyIGNzPXRoaXMuY2h1bmtTaXplKGIpO3ZhciBkPU1hdGgucG93KGIsY3MpLG1pPWZhbHNlLGo9MCx3PTA7Zm9yKHZhciBpPTA7aTxzLmxlbmd0aDsrK2kpe3ZhciB4PWludEF0KHMsaSk7aWYoeDwwKXtpZihzLmNoYXJBdChpKT09Ii0iJiZ0aGlzLnNpZ251bSgpPT09MCltaT10cnVlO2NvbnRpbnVlfXc9Yip3K3g7aWYoKytqPj1jcyl7dGhpcy5kTXVsdGlwbHkoZCk7dGhpcy5kQWRkT2Zmc2V0KHcsMCk7aj0wO3c9MH19aWYoaj4wKXt0aGlzLmRNdWx0aXBseShNYXRoLnBvdyhiLGopKTt0aGlzLmRBZGRPZmZzZXQodywwKX1pZihtaSlCaWdJbnRlZ2VyLlpFUk8uc3ViVG8odGhpcyx0aGlzKX1mdW5jdGlvbiBibnBGcm9tTnVtYmVyKGEsYil7aWYoIm51bWJlciI9PXR5cGVvZiBiKXtpZihhPDIpdGhpcy5mcm9tSW50KDEpO2Vsc2V7dGhpcy5mcm9tTnVtYmVyKGEpO2lmKCF0aGlzLnRlc3RCaXQoYS0xKSl0aGlzLmJpdHdpc2VUbyhCaWdJbnRlZ2VyLk9ORS5zaGlmdExlZnQoYS0xKSxvcF9vcix0aGlzKTtpZih0aGlzLmlzRXZlbigpKXRoaXMuZEFkZE9mZnNldCgxLDApO3doaWxlKCF0aGlzLmlzUHJvYmFibGVQcmltZShiKSl7dGhpcy5kQWRkT2Zmc2V0KDIsMCk7aWYodGhpcy5iaXRMZW5ndGgoKT5hKXRoaXMuc3ViVG8oQmlnSW50ZWdlci5PTkUuc2hpZnRMZWZ0KGEtMSksdGhpcyl9fX1lbHNle3ZhciB4PWNyeXB0LnJhbmRvbUJ5dGVzKChhPj4zKSsxKTt2YXIgdD1hJjc7aWYodD4wKXhbMF0mPSgxPDx0KS0xO2Vsc2UgeFswXT0wO3RoaXMuZnJvbUJ5dGVBcnJheSh4KX19ZnVuY3Rpb24gYm5Ub0J5dGVBcnJheSgpe3ZhciBpPXRoaXMudCxyPW5ldyBBcnJheTtyWzBdPXRoaXMuczt2YXIgcD10aGlzLkRCLWkqdGhpcy5EQiU4LGQsaz0wO2lmKGktLSA+MCl7aWYocDx0aGlzLkRCJiYoZD10aGlzW2ldPj5wKSE9KHRoaXMucyZ0aGlzLkRNKT4+cClyW2srK109ZHx0aGlzLnM8PHRoaXMuREItcDt3aGlsZShpPj0wKXtpZihwPDgpe2Q9KHRoaXNbaV0mKDE8PHApLTEpPDw4LXA7ZHw9dGhpc1stLWldPj4ocCs9dGhpcy5EQi04KX1lbHNle2Q9dGhpc1tpXT4+KHAtPTgpJjI1NTtpZihwPD0wKXtwKz10aGlzLkRCOy0taX19aWYoKGQmMTI4KSE9MClkfD0tMjU2O2lmKGs9PT0wJiYodGhpcy5zJjEyOCkhPShkJjEyOCkpKytrO2lmKGs+MHx8ZCE9dGhpcy5zKXJbaysrXT1kfX1yZXR1cm4gcn1mdW5jdGlvbiBiblRvQnVmZmVyKHRyaW1PclNpemUpe3ZhciByZXM9QnVmZmVyLmZyb20odGhpcy50b0J5dGVBcnJheSgpKTtpZih0cmltT3JTaXplPT09dHJ1ZSYmcmVzWzBdPT09MCl7cmVzPXJlcy5zbGljZSgxKX1lbHNlIGlmKF8uaXNOdW1iZXIodHJpbU9yU2l6ZSkpe2lmKHJlcy5sZW5ndGg+dHJpbU9yU2l6ZSl7Zm9yKHZhciBpPTA7aTxyZXMubGVuZ3RoLXRyaW1PclNpemU7aSsrKXtpZihyZXNbaV0hPT0wKXtyZXR1cm4gbnVsbH19cmV0dXJuIHJlcy5zbGljZShyZXMubGVuZ3RoLXRyaW1PclNpemUpfWVsc2UgaWYocmVzLmxlbmd0aDx0cmltT3JTaXplKXt2YXIgcGFkZGVkPUJ1ZmZlci5hbGxvYyh0cmltT3JTaXplKTtwYWRkZWQuZmlsbCgwLDAsdHJpbU9yU2l6ZS1yZXMubGVuZ3RoKTtyZXMuY29weShwYWRkZWQsdHJpbU9yU2l6ZS1yZXMubGVuZ3RoKTtyZXR1cm4gcGFkZGVkfX1yZXR1cm4gcmVzfWZ1bmN0aW9uIGJuRXF1YWxzKGEpe3JldHVybiB0aGlzLmNvbXBhcmVUbyhhKT09MH1mdW5jdGlvbiBibk1pbihhKXtyZXR1cm4gdGhpcy5jb21wYXJlVG8oYSk8MD90aGlzOmF9ZnVuY3Rpb24gYm5NYXgoYSl7cmV0dXJuIHRoaXMuY29tcGFyZVRvKGEpPjA/dGhpczphfWZ1bmN0aW9uIGJucEJpdHdpc2VUbyhhLG9wLHIpe3ZhciBpLGYsbT1NYXRoLm1pbihhLnQsdGhpcy50KTtmb3IoaT0wO2k8bTsrK2kpcltpXT1vcCh0aGlzW2ldLGFbaV0pO2lmKGEudDx0aGlzLnQpe2Y9YS5zJnRoaXMuRE07Zm9yKGk9bTtpPHRoaXMudDsrK2kpcltpXT1vcCh0aGlzW2ldLGYpO3IudD10aGlzLnR9ZWxzZXtmPXRoaXMucyZ0aGlzLkRNO2ZvcihpPW07aTxhLnQ7KytpKXJbaV09b3AoZixhW2ldKTtyLnQ9YS50fXIucz1vcCh0aGlzLnMsYS5zKTtyLmNsYW1wKCl9ZnVuY3Rpb24gb3BfYW5kKHgseSl7cmV0dXJuIHgmeX1mdW5jdGlvbiBibkFuZChhKXt2YXIgcj1uYmkoKTt0aGlzLmJpdHdpc2VUbyhhLG9wX2FuZCxyKTtyZXR1cm4gcn1mdW5jdGlvbiBvcF9vcih4LHkpe3JldHVybiB4fHl9ZnVuY3Rpb24gYm5PcihhKXt2YXIgcj1uYmkoKTt0aGlzLmJpdHdpc2VUbyhhLG9wX29yLHIpO3JldHVybiByfWZ1bmN0aW9uIG9wX3hvcih4LHkpe3JldHVybiB4Xnl9ZnVuY3Rpb24gYm5Yb3IoYSl7dmFyIHI9bmJpKCk7dGhpcy5iaXR3aXNlVG8oYSxvcF94b3Iscik7cmV0dXJuIHJ9ZnVuY3Rpb24gb3BfYW5kbm90KHgseSl7cmV0dXJuIHgmfnl9ZnVuY3Rpb24gYm5BbmROb3QoYSl7dmFyIHI9bmJpKCk7dGhpcy5iaXR3aXNlVG8oYSxvcF9hbmRub3Qscik7cmV0dXJuIHJ9ZnVuY3Rpb24gYm5Ob3QoKXt2YXIgcj1uYmkoKTtmb3IodmFyIGk9MDtpPHRoaXMudDsrK2kpcltpXT10aGlzLkRNJn50aGlzW2ldO3IudD10aGlzLnQ7ci5zPX50aGlzLnM7cmV0dXJuIHJ9ZnVuY3Rpb24gYm5TaGlmdExlZnQobil7dmFyIHI9bmJpKCk7aWYobjwwKXRoaXMuclNoaWZ0VG8oLW4scik7ZWxzZSB0aGlzLmxTaGlmdFRvKG4scik7cmV0dXJuIHJ9ZnVuY3Rpb24gYm5TaGlmdFJpZ2h0KG4pe3ZhciByPW5iaSgpO2lmKG48MCl0aGlzLmxTaGlmdFRvKC1uLHIpO2Vsc2UgdGhpcy5yU2hpZnRUbyhuLHIpO3JldHVybiByfWZ1bmN0aW9uIGxiaXQoeCl7aWYoeD09PTApcmV0dXJuLTE7dmFyIHI9MDtpZigoeCY2NTUzNSk9PT0wKXt4Pj49MTY7cis9MTZ9aWYoKHgmMjU1KT09PTApe3g+Pj04O3IrPTh9aWYoKHgmMTUpPT09MCl7eD4+PTQ7cis9NH1pZigoeCYzKT09PTApe3g+Pj0yO3IrPTJ9aWYoKHgmMSk9PT0wKSsrcjtyZXR1cm4gcn1mdW5jdGlvbiBibkdldExvd2VzdFNldEJpdCgpe2Zvcih2YXIgaT0wO2k8dGhpcy50OysraSlpZih0aGlzW2ldIT0wKXJldHVybiBpKnRoaXMuREIrbGJpdCh0aGlzW2ldKTtpZih0aGlzLnM8MClyZXR1cm4gdGhpcy50KnRoaXMuREI7cmV0dXJuLTF9ZnVuY3Rpb24gY2JpdCh4KXt2YXIgcj0wO3doaWxlKHghPTApe3gmPXgtMTsrK3J9cmV0dXJuIHJ9ZnVuY3Rpb24gYm5CaXRDb3VudCgpe3ZhciByPTAseD10aGlzLnMmdGhpcy5ETTtmb3IodmFyIGk9MDtpPHRoaXMudDsrK2kpcis9Y2JpdCh0aGlzW2ldXngpO3JldHVybiByfWZ1bmN0aW9uIGJuVGVzdEJpdChuKXt2YXIgaj1NYXRoLmZsb29yKG4vdGhpcy5EQik7aWYoaj49dGhpcy50KXJldHVybiB0aGlzLnMhPTA7cmV0dXJuKHRoaXNbal0mMTw8biV0aGlzLkRCKSE9MH1mdW5jdGlvbiBibnBDaGFuZ2VCaXQobixvcCl7dmFyIHI9QmlnSW50ZWdlci5PTkUuc2hpZnRMZWZ0KG4pO3RoaXMuYml0d2lzZVRvKHIsb3Ascik7cmV0dXJuIHJ9ZnVuY3Rpb24gYm5TZXRCaXQobil7cmV0dXJuIHRoaXMuY2hhbmdlQml0KG4sb3Bfb3IpfWZ1bmN0aW9uIGJuQ2xlYXJCaXQobil7cmV0dXJuIHRoaXMuY2hhbmdlQml0KG4sb3BfYW5kbm90KX1mdW5jdGlvbiBibkZsaXBCaXQobil7cmV0dXJuIHRoaXMuY2hhbmdlQml0KG4sb3BfeG9yKX1mdW5jdGlvbiBibnBBZGRUbyhhLHIpe3ZhciBpPTAsYz0wLG09TWF0aC5taW4oYS50LHRoaXMudCk7d2hpbGUoaTxtKXtjKz10aGlzW2ldK2FbaV07cltpKytdPWMmdGhpcy5ETTtjPj49dGhpcy5EQn1pZihhLnQ8dGhpcy50KXtjKz1hLnM7d2hpbGUoaTx0aGlzLnQpe2MrPXRoaXNbaV07cltpKytdPWMmdGhpcy5ETTtjPj49dGhpcy5EQn1jKz10aGlzLnN9ZWxzZXtjKz10aGlzLnM7d2hpbGUoaTxhLnQpe2MrPWFbaV07cltpKytdPWMmdGhpcy5ETTtjPj49dGhpcy5EQn1jKz1hLnN9ci5zPWM8MD8tMTowO2lmKGM+MClyW2krK109YztlbHNlIGlmKGM8LTEpcltpKytdPXRoaXMuRFYrYztyLnQ9aTtyLmNsYW1wKCl9ZnVuY3Rpb24gYm5BZGQoYSl7dmFyIHI9bmJpKCk7dGhpcy5hZGRUbyhhLHIpO3JldHVybiByfWZ1bmN0aW9uIGJuU3VidHJhY3QoYSl7dmFyIHI9bmJpKCk7dGhpcy5zdWJUbyhhLHIpO3JldHVybiByfWZ1bmN0aW9uIGJuTXVsdGlwbHkoYSl7dmFyIHI9bmJpKCk7dGhpcy5tdWx0aXBseVRvKGEscik7cmV0dXJuIHJ9ZnVuY3Rpb24gYm5TcXVhcmUoKXt2YXIgcj1uYmkoKTt0aGlzLnNxdWFyZVRvKHIpO3JldHVybiByfWZ1bmN0aW9uIGJuRGl2aWRlKGEpe3ZhciByPW5iaSgpO3RoaXMuZGl2UmVtVG8oYSxyLG51bGwpO3JldHVybiByfWZ1bmN0aW9uIGJuUmVtYWluZGVyKGEpe3ZhciByPW5iaSgpO3RoaXMuZGl2UmVtVG8oYSxudWxsLHIpO3JldHVybiByfWZ1bmN0aW9uIGJuRGl2aWRlQW5kUmVtYWluZGVyKGEpe3ZhciBxPW5iaSgpLHI9bmJpKCk7dGhpcy5kaXZSZW1UbyhhLHEscik7cmV0dXJuIG5ldyBBcnJheShxLHIpfWZ1bmN0aW9uIGJucERNdWx0aXBseShuKXt0aGlzW3RoaXMudF09dGhpcy5hbSgwLG4tMSx0aGlzLDAsMCx0aGlzLnQpOysrdGhpcy50O3RoaXMuY2xhbXAoKX1mdW5jdGlvbiBibnBEQWRkT2Zmc2V0KG4sdyl7aWYobj09PTApcmV0dXJuO3doaWxlKHRoaXMudDw9dyl0aGlzW3RoaXMudCsrXT0wO3RoaXNbd10rPW47d2hpbGUodGhpc1t3XT49dGhpcy5EVil7dGhpc1t3XS09dGhpcy5EVjtpZigrK3c+PXRoaXMudCl0aGlzW3RoaXMudCsrXT0wOysrdGhpc1t3XX19ZnVuY3Rpb24gTnVsbEV4cCgpe31mdW5jdGlvbiBuTm9wKHgpe3JldHVybiB4fWZ1bmN0aW9uIG5NdWxUbyh4LHkscil7eC5tdWx0aXBseVRvKHkscil9ZnVuY3Rpb24gblNxclRvKHgscil7eC5zcXVhcmVUbyhyKX1OdWxsRXhwLnByb3RvdHlwZS5jb252ZXJ0PW5Ob3A7TnVsbEV4cC5wcm90b3R5cGUucmV2ZXJ0PW5Ob3A7TnVsbEV4cC5wcm90b3R5cGUubXVsVG89bk11bFRvO051bGxFeHAucHJvdG90eXBlLnNxclRvPW5TcXJUbztmdW5jdGlvbiBiblBvdyhlKXtyZXR1cm4gdGhpcy5leHAoZSxuZXcgTnVsbEV4cCl9ZnVuY3Rpb24gYm5wTXVsdGlwbHlMb3dlclRvKGEsbixyKXt2YXIgaT1NYXRoLm1pbih0aGlzLnQrYS50LG4pO3Iucz0wO3IudD1pO3doaWxlKGk+MClyWy0taV09MDt2YXIgajtmb3Ioaj1yLnQtdGhpcy50O2k8ajsrK2kpcltpK3RoaXMudF09dGhpcy5hbSgwLGFbaV0scixpLDAsdGhpcy50KTtmb3Ioaj1NYXRoLm1pbihhLnQsbik7aTxqOysraSl0aGlzLmFtKDAsYVtpXSxyLGksMCxuLWkpO3IuY2xhbXAoKX1mdW5jdGlvbiBibnBNdWx0aXBseVVwcGVyVG8oYSxuLHIpey0tbjt2YXIgaT1yLnQ9dGhpcy50K2EudC1uO3Iucz0wO3doaWxlKC0taT49MClyW2ldPTA7Zm9yKGk9TWF0aC5tYXgobi10aGlzLnQsMCk7aTxhLnQ7KytpKXJbdGhpcy50K2ktbl09dGhpcy5hbShuLWksYVtpXSxyLDAsMCx0aGlzLnQraS1uKTtyLmNsYW1wKCk7ci5kclNoaWZ0VG8oMSxyKX1mdW5jdGlvbiBCYXJyZXR0KG0pe3RoaXMucjI9bmJpKCk7dGhpcy5xMz1uYmkoKTtCaWdJbnRlZ2VyLk9ORS5kbFNoaWZ0VG8oMiptLnQsdGhpcy5yMik7dGhpcy5tdT10aGlzLnIyLmRpdmlkZShtKTt0aGlzLm09bX1mdW5jdGlvbiBiYXJyZXR0Q29udmVydCh4KXtpZih4LnM8MHx8eC50PjIqdGhpcy5tLnQpcmV0dXJuIHgubW9kKHRoaXMubSk7ZWxzZSBpZih4LmNvbXBhcmVUbyh0aGlzLm0pPDApcmV0dXJuIHg7ZWxzZXt2YXIgcj1uYmkoKTt4LmNvcHlUbyhyKTt0aGlzLnJlZHVjZShyKTtyZXR1cm4gcn19ZnVuY3Rpb24gYmFycmV0dFJldmVydCh4KXtyZXR1cm4geH1mdW5jdGlvbiBiYXJyZXR0UmVkdWNlKHgpe3guZHJTaGlmdFRvKHRoaXMubS50LTEsdGhpcy5yMik7aWYoeC50PnRoaXMubS50KzEpe3gudD10aGlzLm0udCsxO3guY2xhbXAoKX10aGlzLm11Lm11bHRpcGx5VXBwZXJUbyh0aGlzLnIyLHRoaXMubS50KzEsdGhpcy5xMyk7dGhpcy5tLm11bHRpcGx5TG93ZXJUbyh0aGlzLnEzLHRoaXMubS50KzEsdGhpcy5yMik7d2hpbGUoeC5jb21wYXJlVG8odGhpcy5yMik8MCl4LmRBZGRPZmZzZXQoMSx0aGlzLm0udCsxKTt4LnN1YlRvKHRoaXMucjIseCk7d2hpbGUoeC5jb21wYXJlVG8odGhpcy5tKT49MCl4LnN1YlRvKHRoaXMubSx4KX1mdW5jdGlvbiBiYXJyZXR0U3FyVG8oeCxyKXt4LnNxdWFyZVRvKHIpO3RoaXMucmVkdWNlKHIpfWZ1bmN0aW9uIGJhcnJldHRNdWxUbyh4LHkscil7eC5tdWx0aXBseVRvKHkscik7dGhpcy5yZWR1Y2Uocil9QmFycmV0dC5wcm90b3R5cGUuY29udmVydD1iYXJyZXR0Q29udmVydDtCYXJyZXR0LnByb3RvdHlwZS5yZXZlcnQ9YmFycmV0dFJldmVydDtCYXJyZXR0LnByb3RvdHlwZS5yZWR1Y2U9YmFycmV0dFJlZHVjZTtCYXJyZXR0LnByb3RvdHlwZS5tdWxUbz1iYXJyZXR0TXVsVG87QmFycmV0dC5wcm90b3R5cGUuc3FyVG89YmFycmV0dFNxclRvO2Z1bmN0aW9uIGJuTW9kUG93KGUsbSl7cmV0dXJuIGdldE9wdGltYWxJbXBsKCkuYXBwbHkodGhpcyxbZSxtXSl9QmlnSW50ZWdlci5tb2RQb3dJbXBsPXVuZGVmaW5lZDtCaWdJbnRlZ2VyLnNldE1vZFBvd0ltcGw9ZnVuY3Rpb24oYXV0aG9yTmFtZSl7QmlnSW50ZWdlci5tb2RQb3dJbXBsPWZ1bmN0aW9uKCl7c3dpdGNoKGF1dGhvck5hbWUpe2Nhc2UiUGV0ZXIgT2xzb24iOnJldHVybiBibk1vZFBvd19wZXRlck9sc29uO2Nhc2UiVG9tIFd1IjpyZXR1cm4gYm5Nb2RQb3dfdG9tV3V9fSgpfTt2YXIgZ2V0T3B0aW1hbEltcGw9ZnVuY3Rpb24oKXt7dmFyIHJlc3VsdD1CaWdJbnRlZ2VyLm1vZFBvd0ltcGw7aWYocmVzdWx0IT09dW5kZWZpbmVkKXtyZXR1cm4gcmVzdWx0fX12YXIgeD1uZXcgQmlnSW50ZWdlcigiNDMzMzM3MDc5MjMwMDgzOTIxNDg4MDc4MzY0NzU2MCIsMTApO3ZhciBlPW5ldyBCaWdJbnRlZ2VyKCIzNzA3OTIzMDA4MzkyMTQ4ODA3ODM2NDc1NjA5NDE5IiwxMCk7dmFyIG09bmV3IEJpZ0ludGVnZXIoIjE0ODMxNjkyMDMzNTY4NTk1MjMxMzQ1OTAyNDM3NjAiLDEwKTt2YXIgc3RhcnQ9RGF0ZS5ub3coKTtibk1vZFBvd19wZXRlck9sc29uLmFwcGx5KHgsW2UsbV0pO3ZhciBkdXJhdGlvblBldGVyT2xzb249RGF0ZS5ub3coKS1zdGFydDtzdGFydD1EYXRlLm5vdygpO2JuTW9kUG93X3RvbVd1LmFwcGx5KHgsW2UsbV0pO3ZhciBkdXJhdGlvblRvbVd1PURhdGUubm93KCktc3RhcnQ7QmlnSW50ZWdlci5tb2RQb3dJbXBsPWR1cmF0aW9uUGV0ZXJPbHNvbjxkdXJhdGlvblRvbVd1P2JuTW9kUG93X3BldGVyT2xzb246Ym5Nb2RQb3dfdG9tV3U7cmV0dXJuIGdldE9wdGltYWxJbXBsKCl9O2Z1bmN0aW9uIGJuTW9kUG93X3BldGVyT2xzb24oZSxtKXt2YXIgcG9UaGlzPXBldGVyT2xzb25fQmlnSW50ZWdlclN0YXRpYyh0aGlzLnRvU3RyaW5nKDEwKSwxMCk7dmFyIHBvRT1wZXRlck9sc29uX0JpZ0ludGVnZXJTdGF0aWMoZS50b1N0cmluZygxMCksMTApO3ZhciBwb009cGV0ZXJPbHNvbl9CaWdJbnRlZ2VyU3RhdGljKG0udG9TdHJpbmcoMTApLDEwKTt2YXIgcG9PdXQ9cG9UaGlzLm1vZFBvdyhwb0UscG9NKTt2YXIgb3V0PW5ldyBCaWdJbnRlZ2VyKHBvT3V0LnRvU3RyaW5nKDEwKSwxMCk7cmV0dXJuIG91dH1mdW5jdGlvbiBibk1vZFBvd190b21XdShlLG0pe3ZhciBpPWUuYml0TGVuZ3RoKCksayxyPW5idigxKSx6O2lmKGk8PTApcmV0dXJuIHI7ZWxzZSBpZihpPDE4KWs9MTtlbHNlIGlmKGk8NDgpaz0zO2Vsc2UgaWYoaTwxNDQpaz00O2Vsc2UgaWYoaTw3Njgpaz01O2Vsc2Ugaz02O2lmKGk8OCl6PW5ldyBDbGFzc2ljKG0pO2Vsc2UgaWYobS5pc0V2ZW4oKSl6PW5ldyBCYXJyZXR0KG0pO2Vsc2Ugej1uZXcgTW9udGdvbWVyeShtKTt2YXIgZz1uZXcgQXJyYXksbj0zLGsxPWstMSxrbT0oMTw8ayktMTtnWzFdPXouY29udmVydCh0aGlzKTtpZihrPjEpe3ZhciBnMj1uYmkoKTt6LnNxclRvKGdbMV0sZzIpO3doaWxlKG48PWttKXtnW25dPW5iaSgpO3oubXVsVG8oZzIsZ1tuLTJdLGdbbl0pO24rPTJ9fXZhciBqPWUudC0xLHcsaXMxPXRydWUscjI9bmJpKCksdDtpPW5iaXRzKGVbal0pLTE7d2hpbGUoaj49MCl7aWYoaT49azEpdz1lW2pdPj5pLWsxJmttO2Vsc2V7dz0oZVtqXSYoMTw8aSsxKS0xKTw8azEtaTtpZihqPjApd3w9ZVtqLTFdPj50aGlzLkRCK2ktazF9bj1rO3doaWxlKCh3JjEpPT09MCl7dz4+PTE7LS1ufWlmKChpLT1uKTwwKXtpKz10aGlzLkRCOy0tan1pZihpczEpe2dbd10uY29weVRvKHIpO2lzMT1mYWxzZX1lbHNle3doaWxlKG4+MSl7ei5zcXJUbyhyLHIyKTt6LnNxclRvKHIyLHIpO24tPTJ9aWYobj4wKXouc3FyVG8ocixyMik7ZWxzZXt0PXI7cj1yMjtyMj10fXoubXVsVG8ocjIsZ1t3XSxyKX13aGlsZShqPj0wJiYoZVtqXSYxPDxpKT09PTApe3ouc3FyVG8ocixyMik7dD1yO3I9cjI7cjI9dDtpZigtLWk8MCl7aT10aGlzLkRCLTE7LS1qfX19cmV0dXJuIHoucmV2ZXJ0KHIpfWZ1bmN0aW9uIGJuR0NEKGEpe3ZhciB4PXRoaXMuczwwP3RoaXMubmVnYXRlKCk6dGhpcy5jbG9uZSgpO3ZhciB5PWEuczwwP2EubmVnYXRlKCk6YS5jbG9uZSgpO2lmKHguY29tcGFyZVRvKHkpPDApe3ZhciB0PXg7eD15O3k9dH12YXIgaT14LmdldExvd2VzdFNldEJpdCgpLGc9eS5nZXRMb3dlc3RTZXRCaXQoKTtpZihnPDApcmV0dXJuIHg7aWYoaTxnKWc9aTtpZihnPjApe3guclNoaWZ0VG8oZyx4KTt5LnJTaGlmdFRvKGcseSl9d2hpbGUoeC5zaWdudW0oKT4wKXtpZigoaT14LmdldExvd2VzdFNldEJpdCgpKT4wKXguclNoaWZ0VG8oaSx4KTtpZigoaT15LmdldExvd2VzdFNldEJpdCgpKT4wKXkuclNoaWZ0VG8oaSx5KTtpZih4LmNvbXBhcmVUbyh5KT49MCl7eC5zdWJUbyh5LHgpO3guclNoaWZ0VG8oMSx4KX1lbHNle3kuc3ViVG8oeCx5KTt5LnJTaGlmdFRvKDEseSl9fWlmKGc+MCl5LmxTaGlmdFRvKGcseSk7cmV0dXJuIHl9ZnVuY3Rpb24gYm5wTW9kSW50KG4pe2lmKG48PTApcmV0dXJuIDA7dmFyIGQ9dGhpcy5EViVuLHI9dGhpcy5zPDA/bi0xOjA7aWYodGhpcy50PjApaWYoZD09PTApcj10aGlzWzBdJW47ZWxzZSBmb3IodmFyIGk9dGhpcy50LTE7aT49MDstLWkpcj0oZCpyK3RoaXNbaV0pJW47cmV0dXJuIHJ9ZnVuY3Rpb24gYm5Nb2RJbnZlcnNlKG0pe3ZhciBhYz1tLmlzRXZlbigpO2lmKHRoaXMuaXNFdmVuKCkmJmFjfHxtLnNpZ251bSgpPT09MClyZXR1cm4gQmlnSW50ZWdlci5aRVJPO3ZhciB1PW0uY2xvbmUoKSx2PXRoaXMuY2xvbmUoKTt2YXIgYT1uYnYoMSksYj1uYnYoMCksYz1uYnYoMCksZD1uYnYoMSk7d2hpbGUodS5zaWdudW0oKSE9MCl7d2hpbGUodS5pc0V2ZW4oKSl7dS5yU2hpZnRUbygxLHUpO2lmKGFjKXtpZighYS5pc0V2ZW4oKXx8IWIuaXNFdmVuKCkpe2EuYWRkVG8odGhpcyxhKTtiLnN1YlRvKG0sYil9YS5yU2hpZnRUbygxLGEpfWVsc2UgaWYoIWIuaXNFdmVuKCkpYi5zdWJUbyhtLGIpO2IuclNoaWZ0VG8oMSxiKX13aGlsZSh2LmlzRXZlbigpKXt2LnJTaGlmdFRvKDEsdik7aWYoYWMpe2lmKCFjLmlzRXZlbigpfHwhZC5pc0V2ZW4oKSl7Yy5hZGRUbyh0aGlzLGMpO2Quc3ViVG8obSxkKX1jLnJTaGlmdFRvKDEsYyl9ZWxzZSBpZighZC5pc0V2ZW4oKSlkLnN1YlRvKG0sZCk7ZC5yU2hpZnRUbygxLGQpfWlmKHUuY29tcGFyZVRvKHYpPj0wKXt1LnN1YlRvKHYsdSk7aWYoYWMpYS5zdWJUbyhjLGEpO2Iuc3ViVG8oZCxiKX1lbHNle3Yuc3ViVG8odSx2KTtpZihhYyljLnN1YlRvKGEsYyk7ZC5zdWJUbyhiLGQpfX1pZih2LmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSkhPTApcmV0dXJuIEJpZ0ludGVnZXIuWkVSTztpZihkLmNvbXBhcmVUbyhtKT49MClyZXR1cm4gZC5zdWJ0cmFjdChtKTtpZihkLnNpZ251bSgpPDApZC5hZGRUbyhtLGQpO2Vsc2UgcmV0dXJuIGQ7aWYoZC5zaWdudW0oKTwwKXJldHVybiBkLmFkZChtKTtlbHNlIHJldHVybiBkfXZhciBsb3dwcmltZXM9WzIsMyw1LDcsMTEsMTMsMTcsMTksMjMsMjksMzEsMzcsNDEsNDMsNDcsNTMsNTksNjEsNjcsNzEsNzMsNzksODMsODksOTcsMTAxLDEwMywxMDcsMTA5LDExMywxMjcsMTMxLDEzNywxMzksMTQ5LDE1MSwxNTcsMTYzLDE2NywxNzMsMTc5LDE4MSwxOTEsMTkzLDE5NywxOTksMjExLDIyMywyMjcsMjI5LDIzMywyMzksMjQxLDI1MSwyNTcsMjYzLDI2OSwyNzEsMjc3LDI4MSwyODMsMjkzLDMwNywzMTEsMzEzLDMxNywzMzEsMzM3LDM0NywzNDksMzUzLDM1OSwzNjcsMzczLDM3OSwzODMsMzg5LDM5Nyw0MDEsNDA5LDQxOSw0MjEsNDMxLDQzMyw0MzksNDQzLDQ0OSw0NTcsNDYxLDQ2Myw0NjcsNDc5LDQ4Nyw0OTEsNDk5LDUwMyw1MDksNTIxLDUyMyw1NDEsNTQ3LDU1Nyw1NjMsNTY5LDU3MSw1NzcsNTg3LDU5Myw1OTksNjAxLDYwNyw2MTMsNjE3LDYxOSw2MzEsNjQxLDY0Myw2NDcsNjUzLDY1OSw2NjEsNjczLDY3Nyw2ODMsNjkxLDcwMSw3MDksNzE5LDcyNyw3MzMsNzM5LDc0Myw3NTEsNzU3LDc2MSw3NjksNzczLDc4Nyw3OTcsODA5LDgxMSw4MjEsODIzLDgyNyw4MjksODM5LDg1Myw4NTcsODU5LDg2Myw4NzcsODgxLDg4Myw4ODcsOTA3LDkxMSw5MTksOTI5LDkzNyw5NDEsOTQ3LDk1Myw5NjcsOTcxLDk3Nyw5ODMsOTkxLDk5N107dmFyIGxwbGltPSgxPDwyNikvbG93cHJpbWVzW2xvd3ByaW1lcy5sZW5ndGgtMV07ZnVuY3Rpb24gYm5Jc1Byb2JhYmxlUHJpbWUodCl7dmFyIGkseD10aGlzLmFicygpO2lmKHgudD09MSYmeFswXTw9bG93cHJpbWVzW2xvd3ByaW1lcy5sZW5ndGgtMV0pe2ZvcihpPTA7aTxsb3dwcmltZXMubGVuZ3RoOysraSlpZih4WzBdPT1sb3dwcmltZXNbaV0pcmV0dXJuIHRydWU7cmV0dXJuIGZhbHNlfWlmKHguaXNFdmVuKCkpcmV0dXJuIGZhbHNlO2k9MTt3aGlsZShpPGxvd3ByaW1lcy5sZW5ndGgpe3ZhciBtPWxvd3ByaW1lc1tpXSxqPWkrMTt3aGlsZShqPGxvd3ByaW1lcy5sZW5ndGgmJm08bHBsaW0pbSo9bG93cHJpbWVzW2orK107bT14Lm1vZEludChtKTt3aGlsZShpPGopaWYobSVsb3dwcmltZXNbaSsrXT09PTApcmV0dXJuIGZhbHNlfXJldHVybiB4Lm1pbGxlclJhYmluKHQpfWZ1bmN0aW9uIGJucE1pbGxlclJhYmluKHQpe3ZhciBuMT10aGlzLnN1YnRyYWN0KEJpZ0ludGVnZXIuT05FKTt2YXIgaz1uMS5nZXRMb3dlc3RTZXRCaXQoKTtpZihrPD0wKXJldHVybiBmYWxzZTt2YXIgcj1uMS5zaGlmdFJpZ2h0KGspO3Q9dCsxPj4xO2lmKHQ+bG93cHJpbWVzLmxlbmd0aCl0PWxvd3ByaW1lcy5sZW5ndGg7dmFyIGE9bmJpKCk7Zm9yKHZhciBpPTA7aTx0OysraSl7YS5mcm9tSW50KGxvd3ByaW1lc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqbG93cHJpbWVzLmxlbmd0aCldKTt2YXIgeT1hLm1vZFBvdyhyLHRoaXMpO2lmKHkuY29tcGFyZVRvKEJpZ0ludGVnZXIuT05FKSE9MCYmeS5jb21wYXJlVG8objEpIT0wKXt2YXIgaj0xO3doaWxlKGorKzxrJiZ5LmNvbXBhcmVUbyhuMSkhPTApe3k9eS5tb2RQb3dJbnQoMix0aGlzKTtpZih5LmNvbXBhcmVUbyhCaWdJbnRlZ2VyLk9ORSk9PT0wKXJldHVybiBmYWxzZX1pZih5LmNvbXBhcmVUbyhuMSkhPTApcmV0dXJuIGZhbHNlfX1yZXR1cm4gdHJ1ZX1CaWdJbnRlZ2VyLnByb3RvdHlwZS5jb3B5VG89Ym5wQ29weVRvO0JpZ0ludGVnZXIucHJvdG90eXBlLmZyb21JbnQ9Ym5wRnJvbUludDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5mcm9tU3RyaW5nPWJucEZyb21TdHJpbmc7QmlnSW50ZWdlci5wcm90b3R5cGUuZnJvbUJ5dGVBcnJheT1ibnBGcm9tQnl0ZUFycmF5O0JpZ0ludGVnZXIucHJvdG90eXBlLmZyb21CdWZmZXI9Ym5wRnJvbUJ1ZmZlcjtCaWdJbnRlZ2VyLnByb3RvdHlwZS5jbGFtcD1ibnBDbGFtcDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5kbFNoaWZ0VG89Ym5wRExTaGlmdFRvO0JpZ0ludGVnZXIucHJvdG90eXBlLmRyU2hpZnRUbz1ibnBEUlNoaWZ0VG87QmlnSW50ZWdlci5wcm90b3R5cGUubFNoaWZ0VG89Ym5wTFNoaWZ0VG87QmlnSW50ZWdlci5wcm90b3R5cGUuclNoaWZ0VG89Ym5wUlNoaWZ0VG87QmlnSW50ZWdlci5wcm90b3R5cGUuc3ViVG89Ym5wU3ViVG87QmlnSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHlUbz1ibnBNdWx0aXBseVRvO0JpZ0ludGVnZXIucHJvdG90eXBlLnNxdWFyZVRvPWJucFNxdWFyZVRvO0JpZ0ludGVnZXIucHJvdG90eXBlLmRpdlJlbVRvPWJucERpdlJlbVRvO0JpZ0ludGVnZXIucHJvdG90eXBlLmludkRpZ2l0PWJucEludkRpZ2l0O0JpZ0ludGVnZXIucHJvdG90eXBlLmlzRXZlbj1ibnBJc0V2ZW47QmlnSW50ZWdlci5wcm90b3R5cGUuZXhwPWJucEV4cDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5jaHVua1NpemU9Ym5wQ2h1bmtTaXplO0JpZ0ludGVnZXIucHJvdG90eXBlLnRvUmFkaXg9Ym5wVG9SYWRpeDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5mcm9tUmFkaXg9Ym5wRnJvbVJhZGl4O0JpZ0ludGVnZXIucHJvdG90eXBlLmZyb21OdW1iZXI9Ym5wRnJvbU51bWJlcjtCaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXR3aXNlVG89Ym5wQml0d2lzZVRvO0JpZ0ludGVnZXIucHJvdG90eXBlLmNoYW5nZUJpdD1ibnBDaGFuZ2VCaXQ7QmlnSW50ZWdlci5wcm90b3R5cGUuYWRkVG89Ym5wQWRkVG87QmlnSW50ZWdlci5wcm90b3R5cGUuZE11bHRpcGx5PWJucERNdWx0aXBseTtCaWdJbnRlZ2VyLnByb3RvdHlwZS5kQWRkT2Zmc2V0PWJucERBZGRPZmZzZXQ7QmlnSW50ZWdlci5wcm90b3R5cGUubXVsdGlwbHlMb3dlclRvPWJucE11bHRpcGx5TG93ZXJUbztCaWdJbnRlZ2VyLnByb3RvdHlwZS5tdWx0aXBseVVwcGVyVG89Ym5wTXVsdGlwbHlVcHBlclRvO0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludD1ibnBNb2RJbnQ7QmlnSW50ZWdlci5wcm90b3R5cGUubWlsbGVyUmFiaW49Ym5wTWlsbGVyUmFiaW47QmlnSW50ZWdlci5wcm90b3R5cGUudG9TdHJpbmc9Ym5Ub1N0cmluZztCaWdJbnRlZ2VyLnByb3RvdHlwZS5uZWdhdGU9Ym5OZWdhdGU7QmlnSW50ZWdlci5wcm90b3R5cGUuYWJzPWJuQWJzO0JpZ0ludGVnZXIucHJvdG90eXBlLmNvbXBhcmVUbz1ibkNvbXBhcmVUbztCaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRMZW5ndGg9Ym5CaXRMZW5ndGg7QmlnSW50ZWdlci5wcm90b3R5cGUubW9kPWJuTW9kO0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZFBvd0ludD1ibk1vZFBvd0ludDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5jbG9uZT1ibkNsb25lO0JpZ0ludGVnZXIucHJvdG90eXBlLmludFZhbHVlPWJuSW50VmFsdWU7QmlnSW50ZWdlci5wcm90b3R5cGUuYnl0ZVZhbHVlPWJuQnl0ZVZhbHVlO0JpZ0ludGVnZXIucHJvdG90eXBlLnNob3J0VmFsdWU9Ym5TaG9ydFZhbHVlO0JpZ0ludGVnZXIucHJvdG90eXBlLnNpZ251bT1iblNpZ051bTtCaWdJbnRlZ2VyLnByb3RvdHlwZS50b0J5dGVBcnJheT1iblRvQnl0ZUFycmF5O0JpZ0ludGVnZXIucHJvdG90eXBlLnRvQnVmZmVyPWJuVG9CdWZmZXI7QmlnSW50ZWdlci5wcm90b3R5cGUuZXF1YWxzPWJuRXF1YWxzO0JpZ0ludGVnZXIucHJvdG90eXBlLm1pbj1ibk1pbjtCaWdJbnRlZ2VyLnByb3RvdHlwZS5tYXg9Ym5NYXg7QmlnSW50ZWdlci5wcm90b3R5cGUuYW5kPWJuQW5kO0JpZ0ludGVnZXIucHJvdG90eXBlLm9yPWJuT3I7QmlnSW50ZWdlci5wcm90b3R5cGUueG9yPWJuWG9yO0JpZ0ludGVnZXIucHJvdG90eXBlLmFuZE5vdD1ibkFuZE5vdDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5ub3Q9Ym5Ob3Q7QmlnSW50ZWdlci5wcm90b3R5cGUuc2hpZnRMZWZ0PWJuU2hpZnRMZWZ0O0JpZ0ludGVnZXIucHJvdG90eXBlLnNoaWZ0UmlnaHQ9Ym5TaGlmdFJpZ2h0O0JpZ0ludGVnZXIucHJvdG90eXBlLmdldExvd2VzdFNldEJpdD1ibkdldExvd2VzdFNldEJpdDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5iaXRDb3VudD1ibkJpdENvdW50O0JpZ0ludGVnZXIucHJvdG90eXBlLnRlc3RCaXQ9Ym5UZXN0Qml0O0JpZ0ludGVnZXIucHJvdG90eXBlLnNldEJpdD1iblNldEJpdDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5jbGVhckJpdD1ibkNsZWFyQml0O0JpZ0ludGVnZXIucHJvdG90eXBlLmZsaXBCaXQ9Ym5GbGlwQml0O0JpZ0ludGVnZXIucHJvdG90eXBlLmFkZD1ibkFkZDtCaWdJbnRlZ2VyLnByb3RvdHlwZS5zdWJ0cmFjdD1iblN1YnRyYWN0O0JpZ0ludGVnZXIucHJvdG90eXBlLm11bHRpcGx5PWJuTXVsdGlwbHk7QmlnSW50ZWdlci5wcm90b3R5cGUuZGl2aWRlPWJuRGl2aWRlO0JpZ0ludGVnZXIucHJvdG90eXBlLnJlbWFpbmRlcj1iblJlbWFpbmRlcjtCaWdJbnRlZ2VyLnByb3RvdHlwZS5kaXZpZGVBbmRSZW1haW5kZXI9Ym5EaXZpZGVBbmRSZW1haW5kZXI7QmlnSW50ZWdlci5wcm90b3R5cGUubW9kUG93PWJuTW9kUG93O0JpZ0ludGVnZXIucHJvdG90eXBlLm1vZEludmVyc2U9Ym5Nb2RJbnZlcnNlO0JpZ0ludGVnZXIucHJvdG90eXBlLnBvdz1iblBvdztCaWdJbnRlZ2VyLnByb3RvdHlwZS5nY2Q9Ym5HQ0Q7QmlnSW50ZWdlci5wcm90b3R5cGUuaXNQcm9iYWJsZVByaW1lPWJuSXNQcm9iYWJsZVByaW1lO0JpZ0ludGVnZXIuaW50MmNoYXI9aW50MmNoYXI7QmlnSW50ZWdlci5aRVJPPW5idigwKTtCaWdJbnRlZ2VyLk9ORT1uYnYoMSk7QmlnSW50ZWdlci5wcm90b3R5cGUuc3F1YXJlPWJuU3F1YXJlO21vZHVsZS5leHBvcnRzPUJpZ0ludGVnZXJ9KS5jYWxsKHRoaXMscmVxdWlyZSgiYnVmZmVyIikuQnVmZmVyKX0seyIuLi9jcnlwdG8iOjQzLCIuLi91dGlscyI6NTgsImJpZy1pbnRlZ2VyIjoyNSxidWZmZXI6Mjd9XSw1MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKEJ1ZmZlcil7dmFyIF89cmVxdWlyZSgiLi4vdXRpbHMiKS5fO3ZhciBCaWdJbnRlZ2VyPXJlcXVpcmUoIi4vanNibi5qcyIpO3ZhciB1dGlscz1yZXF1aXJlKCIuLi91dGlscy5qcyIpO3ZhciBzY2hlbWVzPXJlcXVpcmUoIi4uL3NjaGVtZXMvc2NoZW1lcy5qcyIpO3ZhciBlbmNyeXB0RW5naW5lcz1yZXF1aXJlKCIuLi9lbmNyeXB0RW5naW5lcy9lbmNyeXB0RW5naW5lcy5qcyIpO2V4cG9ydHMuQmlnSW50ZWdlcj1CaWdJbnRlZ2VyO21vZHVsZS5leHBvcnRzLktleT1mdW5jdGlvbigpe2Z1bmN0aW9uIFJTQUtleSgpe3RoaXMubj1udWxsO3RoaXMuZT0wO3RoaXMuZD1udWxsO3RoaXMucD1udWxsO3RoaXMucT1udWxsO3RoaXMuZG1wMT1udWxsO3RoaXMuZG1xMT1udWxsO3RoaXMuY29lZmY9bnVsbH1SU0FLZXkucHJvdG90eXBlLnNldE9wdGlvbnM9ZnVuY3Rpb24ob3B0aW9ucyl7dmFyIHNpZ25pbmdTY2hlbWVQcm92aWRlcj1zY2hlbWVzW29wdGlvbnMuc2lnbmluZ1NjaGVtZV07dmFyIGVuY3J5cHRpb25TY2hlbWVQcm92aWRlcj1zY2hlbWVzW29wdGlvbnMuZW5jcnlwdGlvblNjaGVtZV07aWYoc2lnbmluZ1NjaGVtZVByb3ZpZGVyPT09ZW5jcnlwdGlvblNjaGVtZVByb3ZpZGVyKXt0aGlzLnNpZ25pbmdTY2hlbWU9dGhpcy5lbmNyeXB0aW9uU2NoZW1lPWVuY3J5cHRpb25TY2hlbWVQcm92aWRlci5tYWtlU2NoZW1lKHRoaXMsb3B0aW9ucyl9ZWxzZXt0aGlzLmVuY3J5cHRpb25TY2hlbWU9ZW5jcnlwdGlvblNjaGVtZVByb3ZpZGVyLm1ha2VTY2hlbWUodGhpcyxvcHRpb25zKTt0aGlzLnNpZ25pbmdTY2hlbWU9c2lnbmluZ1NjaGVtZVByb3ZpZGVyLm1ha2VTY2hlbWUodGhpcyxvcHRpb25zKX10aGlzLmVuY3J5cHRFbmdpbmU9ZW5jcnlwdEVuZ2luZXMuZ2V0RW5naW5lKHRoaXMsb3B0aW9ucyl9O1JTQUtleS5wcm90b3R5cGUuZ2VuZXJhdGU9ZnVuY3Rpb24oQixFKXt2YXIgcXM9Qj4+MTt0aGlzLmU9cGFyc2VJbnQoRSwxNik7dmFyIGVlPW5ldyBCaWdJbnRlZ2VyKEUsMTYpO3doaWxlKHRydWUpe3doaWxlKHRydWUpe3RoaXMucD1uZXcgQmlnSW50ZWdlcihCLXFzLDEpO2lmKHRoaXMucC5zdWJ0cmFjdChCaWdJbnRlZ2VyLk9ORSkuZ2NkKGVlKS5jb21wYXJlVG8oQmlnSW50ZWdlci5PTkUpPT09MCYmdGhpcy5wLmlzUHJvYmFibGVQcmltZSgxMCkpYnJlYWt9d2hpbGUodHJ1ZSl7dGhpcy5xPW5ldyBCaWdJbnRlZ2VyKHFzLDEpO2lmKHRoaXMucS5zdWJ0cmFjdChCaWdJbnRlZ2VyLk9ORSkuZ2NkKGVlKS5jb21wYXJlVG8oQmlnSW50ZWdlci5PTkUpPT09MCYmdGhpcy5xLmlzUHJvYmFibGVQcmltZSgxMCkpYnJlYWt9aWYodGhpcy5wLmNvbXBhcmVUbyh0aGlzLnEpPD0wKXt2YXIgdD10aGlzLnA7dGhpcy5wPXRoaXMucTt0aGlzLnE9dH12YXIgcDE9dGhpcy5wLnN1YnRyYWN0KEJpZ0ludGVnZXIuT05FKTt2YXIgcTE9dGhpcy5xLnN1YnRyYWN0KEJpZ0ludGVnZXIuT05FKTt2YXIgcGhpPXAxLm11bHRpcGx5KHExKTtpZihwaGkuZ2NkKGVlKS5jb21wYXJlVG8oQmlnSW50ZWdlci5PTkUpPT09MCl7dGhpcy5uPXRoaXMucC5tdWx0aXBseSh0aGlzLnEpO2lmKHRoaXMubi5iaXRMZW5ndGgoKTxCKXtjb250aW51ZX10aGlzLmQ9ZWUubW9kSW52ZXJzZShwaGkpO3RoaXMuZG1wMT10aGlzLmQubW9kKHAxKTt0aGlzLmRtcTE9dGhpcy5kLm1vZChxMSk7dGhpcy5jb2VmZj10aGlzLnEubW9kSW52ZXJzZSh0aGlzLnApO2JyZWFrfX10aGlzLiQkcmVjYWxjdWxhdGVDYWNoZSgpfTtSU0FLZXkucHJvdG90eXBlLnNldFByaXZhdGU9ZnVuY3Rpb24oTixFLEQsUCxRLERQLERRLEMpe2lmKE4mJkUmJkQmJk4ubGVuZ3RoPjAmJihfLmlzTnVtYmVyKEUpfHxFLmxlbmd0aD4wKSYmRC5sZW5ndGg+MCl7dGhpcy5uPW5ldyBCaWdJbnRlZ2VyKE4pO3RoaXMuZT1fLmlzTnVtYmVyKEUpP0U6dXRpbHMuZ2V0MzJJbnRGcm9tQnVmZmVyKEUsMCk7dGhpcy5kPW5ldyBCaWdJbnRlZ2VyKEQpO2lmKFAmJlEmJkRQJiZEUSYmQyl7dGhpcy5wPW5ldyBCaWdJbnRlZ2VyKFApO3RoaXMucT1uZXcgQmlnSW50ZWdlcihRKTt0aGlzLmRtcDE9bmV3IEJpZ0ludGVnZXIoRFApO3RoaXMuZG1xMT1uZXcgQmlnSW50ZWdlcihEUSk7dGhpcy5jb2VmZj1uZXcgQmlnSW50ZWdlcihDKX1lbHNle310aGlzLiQkcmVjYWxjdWxhdGVDYWNoZSgpfWVsc2V7dGhyb3cgRXJyb3IoIkludmFsaWQgUlNBIHByaXZhdGUga2V5Iil9fTtSU0FLZXkucHJvdG90eXBlLnNldFB1YmxpYz1mdW5jdGlvbihOLEUpe2lmKE4mJkUmJk4ubGVuZ3RoPjAmJihfLmlzTnVtYmVyKEUpfHxFLmxlbmd0aD4wKSl7dGhpcy5uPW5ldyBCaWdJbnRlZ2VyKE4pO3RoaXMuZT1fLmlzTnVtYmVyKEUpP0U6dXRpbHMuZ2V0MzJJbnRGcm9tQnVmZmVyKEUsMCk7dGhpcy4kJHJlY2FsY3VsYXRlQ2FjaGUoKX1lbHNle3Rocm93IEVycm9yKCJJbnZhbGlkIFJTQSBwdWJsaWMga2V5Iil9fTtSU0FLZXkucHJvdG90eXBlLiRkb1ByaXZhdGU9ZnVuY3Rpb24oeCl7aWYodGhpcy5wfHx0aGlzLnEpe3JldHVybiB4Lm1vZFBvdyh0aGlzLmQsdGhpcy5uKX12YXIgeHA9eC5tb2QodGhpcy5wKS5tb2RQb3codGhpcy5kbXAxLHRoaXMucCk7dmFyIHhxPXgubW9kKHRoaXMucSkubW9kUG93KHRoaXMuZG1xMSx0aGlzLnEpO3doaWxlKHhwLmNvbXBhcmVUbyh4cSk8MCl7eHA9eHAuYWRkKHRoaXMucCl9cmV0dXJuIHhwLnN1YnRyYWN0KHhxKS5tdWx0aXBseSh0aGlzLmNvZWZmKS5tb2QodGhpcy5wKS5tdWx0aXBseSh0aGlzLnEpLmFkZCh4cSl9O1JTQUtleS5wcm90b3R5cGUuJGRvUHVibGljPWZ1bmN0aW9uKHgpe3JldHVybiB4Lm1vZFBvd0ludCh0aGlzLmUsdGhpcy5uKX07UlNBS2V5LnByb3RvdHlwZS5lbmNyeXB0PWZ1bmN0aW9uKGJ1ZmZlcix1c2VQcml2YXRlKXt2YXIgYnVmZmVycz1bXTt2YXIgcmVzdWx0cz1bXTt2YXIgYnVmZmVyU2l6ZT1idWZmZXIubGVuZ3RoO3ZhciBidWZmZXJzQ291bnQ9TWF0aC5jZWlsKGJ1ZmZlclNpemUvdGhpcy5tYXhNZXNzYWdlTGVuZ3RoKXx8MTt2YXIgZGl2aWRlZFNpemU9TWF0aC5jZWlsKGJ1ZmZlclNpemUvYnVmZmVyc0NvdW50fHwxKTtpZihidWZmZXJzQ291bnQ9PTEpe2J1ZmZlcnMucHVzaChidWZmZXIpfWVsc2V7Zm9yKHZhciBidWZOdW09MDtidWZOdW08YnVmZmVyc0NvdW50O2J1Zk51bSsrKXtidWZmZXJzLnB1c2goYnVmZmVyLnNsaWNlKGJ1Zk51bSpkaXZpZGVkU2l6ZSwoYnVmTnVtKzEpKmRpdmlkZWRTaXplKSl9fWZvcih2YXIgaT0wO2k8YnVmZmVycy5sZW5ndGg7aSsrKXtyZXN1bHRzLnB1c2godGhpcy5lbmNyeXB0RW5naW5lLmVuY3J5cHQoYnVmZmVyc1tpXSx1c2VQcml2YXRlKSl9cmV0dXJuIEJ1ZmZlci5jb25jYXQocmVzdWx0cyl9O1JTQUtleS5wcm90b3R5cGUuZGVjcnlwdD1mdW5jdGlvbihidWZmZXIsdXNlUHVibGljKXtpZihidWZmZXIubGVuZ3RoJXRoaXMuZW5jcnlwdGVkRGF0YUxlbmd0aD4wKXt0aHJvdyBFcnJvcigiSW5jb3JyZWN0IGRhdGEgb3Iga2V5Iil9dmFyIHJlc3VsdD1bXTt2YXIgb2Zmc2V0PTA7dmFyIGxlbmd0aD0wO3ZhciBidWZmZXJzQ291bnQ9YnVmZmVyLmxlbmd0aC90aGlzLmVuY3J5cHRlZERhdGFMZW5ndGg7Zm9yKHZhciBpPTA7aTxidWZmZXJzQ291bnQ7aSsrKXtvZmZzZXQ9aSp0aGlzLmVuY3J5cHRlZERhdGFMZW5ndGg7bGVuZ3RoPW9mZnNldCt0aGlzLmVuY3J5cHRlZERhdGFMZW5ndGg7cmVzdWx0LnB1c2godGhpcy5lbmNyeXB0RW5naW5lLmRlY3J5cHQoYnVmZmVyLnNsaWNlKG9mZnNldCxNYXRoLm1pbihsZW5ndGgsYnVmZmVyLmxlbmd0aCkpLHVzZVB1YmxpYykpfXJldHVybiBCdWZmZXIuY29uY2F0KHJlc3VsdCl9O1JTQUtleS5wcm90b3R5cGUuc2lnbj1mdW5jdGlvbihidWZmZXIpe3JldHVybiB0aGlzLnNpZ25pbmdTY2hlbWUuc2lnbi5hcHBseSh0aGlzLnNpZ25pbmdTY2hlbWUsYXJndW1lbnRzKX07UlNBS2V5LnByb3RvdHlwZS52ZXJpZnk9ZnVuY3Rpb24oYnVmZmVyLHNpZ25hdHVyZSxzaWduYXR1cmVfZW5jb2Rpbmcpe3JldHVybiB0aGlzLnNpZ25pbmdTY2hlbWUudmVyaWZ5LmFwcGx5KHRoaXMuc2lnbmluZ1NjaGVtZSxhcmd1bWVudHMpfTtSU0FLZXkucHJvdG90eXBlLmlzUHJpdmF0ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLm4mJnRoaXMuZSYmdGhpcy5kfHxmYWxzZX07UlNBS2V5LnByb3RvdHlwZS5pc1B1YmxpYz1mdW5jdGlvbihzdHJpY3Qpe3JldHVybiB0aGlzLm4mJnRoaXMuZSYmIShzdHJpY3QmJnRoaXMuZCl8fGZhbHNlfTtPYmplY3QuZGVmaW5lUHJvcGVydHkoUlNBS2V5LnByb3RvdHlwZSwia2V5U2l6ZSIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNhY2hlLmtleUJpdExlbmd0aH19KTtPYmplY3QuZGVmaW5lUHJvcGVydHkoUlNBS2V5LnByb3RvdHlwZSwiZW5jcnlwdGVkRGF0YUxlbmd0aCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmNhY2hlLmtleUJ5dGVMZW5ndGh9fSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KFJTQUtleS5wcm90b3R5cGUsIm1heE1lc3NhZ2VMZW5ndGgiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lbmNyeXB0aW9uU2NoZW1lLm1heE1lc3NhZ2VMZW5ndGgoKX19KTtSU0FLZXkucHJvdG90eXBlLiQkcmVjYWxjdWxhdGVDYWNoZT1mdW5jdGlvbigpe3RoaXMuY2FjaGU9dGhpcy5jYWNoZXx8e307dGhpcy5jYWNoZS5rZXlCaXRMZW5ndGg9dGhpcy5uLmJpdExlbmd0aCgpO3RoaXMuY2FjaGUua2V5Qnl0ZUxlbmd0aD10aGlzLmNhY2hlLmtleUJpdExlbmd0aCs2Pj4zfTtyZXR1cm4gUlNBS2V5fSgpfSkuY2FsbCh0aGlzLHJlcXVpcmUoImJ1ZmZlciIpLkJ1ZmZlcil9LHsiLi4vZW5jcnlwdEVuZ2luZXMvZW5jcnlwdEVuZ2luZXMuanMiOjQ0LCIuLi9zY2hlbWVzL3NjaGVtZXMuanMiOjU3LCIuLi91dGlscyI6NTgsIi4uL3V0aWxzLmpzIjo1OCwiLi9qc2JuLmpzIjo1MixidWZmZXI6Mjd9XSw1NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKEJ1ZmZlcil7dmFyIGNyeXB0PXJlcXVpcmUoIi4uL2NyeXB0byIpO21vZHVsZS5leHBvcnRzPXtpc0VuY3J5cHRpb246dHJ1ZSxpc1NpZ25hdHVyZTpmYWxzZX07bW9kdWxlLmV4cG9ydHMuZGlnZXN0TGVuZ3RoPXttZDQ6MTYsbWQ1OjE2LHJpcGVtZDE2MDoyMCxybWQxNjA6MjAsc2hhMToyMCxzaGEyMjQ6Mjgsc2hhMjU2OjMyLHNoYTM4NDo0OCxzaGE1MTI6NjR9O3ZhciBERUZBVUxUX0hBU0hfRlVOQ1RJT049InNoYTEiO21vZHVsZS5leHBvcnRzLmVtZV9vYWVwX21nZjE9ZnVuY3Rpb24oc2VlZCxtYXNrTGVuZ3RoLGhhc2hGdW5jdGlvbil7aGFzaEZ1bmN0aW9uPWhhc2hGdW5jdGlvbnx8REVGQVVMVF9IQVNIX0ZVTkNUSU9OO3ZhciBoTGVuPW1vZHVsZS5leHBvcnRzLmRpZ2VzdExlbmd0aFtoYXNoRnVuY3Rpb25dO3ZhciBjb3VudD1NYXRoLmNlaWwobWFza0xlbmd0aC9oTGVuKTt2YXIgVD1CdWZmZXIuYWxsb2MoaExlbipjb3VudCk7dmFyIGM9QnVmZmVyLmFsbG9jKDQpO2Zvcih2YXIgaT0wO2k8Y291bnQ7KytpKXt2YXIgaGFzaD1jcnlwdC5jcmVhdGVIYXNoKGhhc2hGdW5jdGlvbik7aGFzaC51cGRhdGUoc2VlZCk7Yy53cml0ZVVJbnQzMkJFKGksMCk7aGFzaC51cGRhdGUoYyk7aGFzaC5kaWdlc3QoKS5jb3B5KFQsaSpoTGVuKX1yZXR1cm4gVC5zbGljZSgwLG1hc2tMZW5ndGgpfTttb2R1bGUuZXhwb3J0cy5tYWtlU2NoZW1lPWZ1bmN0aW9uKGtleSxvcHRpb25zKXtmdW5jdGlvbiBTY2hlbWUoa2V5LG9wdGlvbnMpe3RoaXMua2V5PWtleTt0aGlzLm9wdGlvbnM9b3B0aW9uc31TY2hlbWUucHJvdG90eXBlLm1heE1lc3NhZ2VMZW5ndGg9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5rZXkuZW5jcnlwdGVkRGF0YUxlbmd0aC0yKm1vZHVsZS5leHBvcnRzLmRpZ2VzdExlbmd0aFt0aGlzLm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMuaGFzaHx8REVGQVVMVF9IQVNIX0ZVTkNUSU9OXS0yfTtTY2hlbWUucHJvdG90eXBlLmVuY1BhZD1mdW5jdGlvbihidWZmZXIpe3ZhciBoYXNoPXRoaXMub3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucy5oYXNofHxERUZBVUxUX0hBU0hfRlVOQ1RJT047dmFyIG1nZj10aGlzLm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMubWdmfHxtb2R1bGUuZXhwb3J0cy5lbWVfb2FlcF9tZ2YxO3ZhciBsYWJlbD10aGlzLm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMubGFiZWx8fEJ1ZmZlci5hbGxvYygwKTt2YXIgZW1MZW49dGhpcy5rZXkuZW5jcnlwdGVkRGF0YUxlbmd0aDt2YXIgaExlbj1tb2R1bGUuZXhwb3J0cy5kaWdlc3RMZW5ndGhbaGFzaF07aWYoYnVmZmVyLmxlbmd0aD5lbUxlbi0yKmhMZW4tMil7dGhyb3cgbmV3IEVycm9yKCJNZXNzYWdlIGlzIHRvbyBsb25nIHRvIGVuY29kZSBpbnRvIGFuIGVuY29kZWQgbWVzc2FnZSB3aXRoIGEgbGVuZ3RoIG9mICIrZW1MZW4rIiBieXRlcywgaW5jcmVhc2UiKyJlbUxlbiB0byBmaXggdGhpcyBlcnJvciAobWluaW11bSB2YWx1ZSBmb3IgZ2l2ZW4gcGFyYW1ldGVycyBhbmQgb3B0aW9uczogIisoZW1MZW4tMipoTGVuLTIpKyIpIil9dmFyIGxIYXNoPWNyeXB0LmNyZWF0ZUhhc2goaGFzaCk7bEhhc2gudXBkYXRlKGxhYmVsKTtsSGFzaD1sSGFzaC5kaWdlc3QoKTt2YXIgUFM9QnVmZmVyLmFsbG9jKGVtTGVuLWJ1ZmZlci5sZW5ndGgtMipoTGVuLTEpO1BTLmZpbGwoMCk7UFNbUFMubGVuZ3RoLTFdPTE7dmFyIERCPUJ1ZmZlci5jb25jYXQoW2xIYXNoLFBTLGJ1ZmZlcl0pO3ZhciBzZWVkPWNyeXB0LnJhbmRvbUJ5dGVzKGhMZW4pO3ZhciBtYXNrPW1nZihzZWVkLERCLmxlbmd0aCxoYXNoKTtmb3IodmFyIGk9MDtpPERCLmxlbmd0aDtpKyspe0RCW2ldXj1tYXNrW2ldfW1hc2s9bWdmKERCLGhMZW4saGFzaCk7Zm9yKGk9MDtpPHNlZWQubGVuZ3RoO2krKyl7c2VlZFtpXV49bWFza1tpXX12YXIgZW09QnVmZmVyLmFsbG9jKDErc2VlZC5sZW5ndGgrREIubGVuZ3RoKTtlbVswXT0wO3NlZWQuY29weShlbSwxKTtEQi5jb3B5KGVtLDErc2VlZC5sZW5ndGgpO3JldHVybiBlbX07U2NoZW1lLnByb3RvdHlwZS5lbmNVblBhZD1mdW5jdGlvbihidWZmZXIpe3ZhciBoYXNoPXRoaXMub3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucy5oYXNofHxERUZBVUxUX0hBU0hfRlVOQ1RJT047dmFyIG1nZj10aGlzLm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMubWdmfHxtb2R1bGUuZXhwb3J0cy5lbWVfb2FlcF9tZ2YxO3ZhciBsYWJlbD10aGlzLm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMubGFiZWx8fEJ1ZmZlci5hbGxvYygwKTt2YXIgaExlbj1tb2R1bGUuZXhwb3J0cy5kaWdlc3RMZW5ndGhbaGFzaF07aWYoYnVmZmVyLmxlbmd0aDwyKmhMZW4rMil7dGhyb3cgbmV3IEVycm9yKCJFcnJvciBkZWNvZGluZyBtZXNzYWdlLCB0aGUgc3VwcGxpZWQgbWVzc2FnZSBpcyBub3QgbG9uZyBlbm91Z2ggdG8gYmUgYSB2YWxpZCBPQUVQIGVuY29kZWQgbWVzc2FnZSIpfXZhciBzZWVkPWJ1ZmZlci5zbGljZSgxLGhMZW4rMSk7dmFyIERCPWJ1ZmZlci5zbGljZSgxK2hMZW4pO3ZhciBtYXNrPW1nZihEQixoTGVuLGhhc2gpO2Zvcih2YXIgaT0wO2k8c2VlZC5sZW5ndGg7aSsrKXtzZWVkW2ldXj1tYXNrW2ldfW1hc2s9bWdmKHNlZWQsREIubGVuZ3RoLGhhc2gpO2ZvcihpPTA7aTxEQi5sZW5ndGg7aSsrKXtEQltpXV49bWFza1tpXX12YXIgbEhhc2g9Y3J5cHQuY3JlYXRlSGFzaChoYXNoKTtsSGFzaC51cGRhdGUobGFiZWwpO2xIYXNoPWxIYXNoLmRpZ2VzdCgpO3ZhciBsSGFzaEVNPURCLnNsaWNlKDAsaExlbik7aWYobEhhc2hFTS50b1N0cmluZygiaGV4IikhPWxIYXNoLnRvU3RyaW5nKCJoZXgiKSl7dGhyb3cgbmV3IEVycm9yKCJFcnJvciBkZWNvZGluZyBtZXNzYWdlLCB0aGUgbEhhc2ggY2FsY3VsYXRlZCBmcm9tIHRoZSBsYWJlbCBwcm92aWRlZCBhbmQgdGhlIGxIYXNoIGluIHRoZSBlbmNyeXB0ZWQgZGF0YSBkbyBub3QgbWF0Y2guIil9aT1oTGVuO3doaWxlKERCW2krK109PT0wJiZpPERCLmxlbmd0aCk7aWYoREJbaS0xXSE9MSl7dGhyb3cgbmV3IEVycm9yKCJFcnJvciBkZWNvZGluZyBtZXNzYWdlLCB0aGVyZSBpcyBubyBwYWRkaW5nIG1lc3NhZ2Ugc2VwYXJhdG9yIGJ5dGUiKX1yZXR1cm4gREIuc2xpY2UoaSl9O3JldHVybiBuZXcgU2NoZW1lKGtleSxvcHRpb25zKX19KS5jYWxsKHRoaXMscmVxdWlyZSgiYnVmZmVyIikuQnVmZmVyKX0seyIuLi9jcnlwdG8iOjQzLGJ1ZmZlcjoyN31dLDU1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oQnVmZmVyKXt2YXIgQmlnSW50ZWdlcj1yZXF1aXJlKCIuLi9saWJzL2pzYm4iKTt2YXIgY3J5cHQ9cmVxdWlyZSgiLi4vY3J5cHRvIik7dmFyIGNvbnN0YW50cz1yZXF1aXJlKCJjb25zdGFudHMiKTt2YXIgU0lHTl9JTkZPX0hFQUQ9e21kMjpCdWZmZXIuZnJvbSgiMzAyMDMwMGMwNjA4MmE4NjQ4ODZmNzBkMDIwMjA1MDAwNDEwIiwiaGV4IiksbWQ1OkJ1ZmZlci5mcm9tKCIzMDIwMzAwYzA2MDgyYTg2NDg4NmY3MGQwMjA1MDUwMDA0MTAiLCJoZXgiKSxzaGExOkJ1ZmZlci5mcm9tKCIzMDIxMzAwOTA2MDUyYjBlMDMwMjFhMDUwMDA0MTQiLCJoZXgiKSxzaGEyMjQ6QnVmZmVyLmZyb20oIjMwMmQzMDBkMDYwOTYwODY0ODAxNjUwMzA0MDIwNDA1MDAwNDFjIiwiaGV4Iiksc2hhMjU2OkJ1ZmZlci5mcm9tKCIzMDMxMzAwZDA2MDk2MDg2NDgwMTY1MDMwNDAyMDEwNTAwMDQyMCIsImhleCIpLHNoYTM4NDpCdWZmZXIuZnJvbSgiMzA0MTMwMGQwNjA5NjA4NjQ4MDE2NTAzMDQwMjAyMDUwMDA0MzAiLCJoZXgiKSxzaGE1MTI6QnVmZmVyLmZyb20oIjMwNTEzMDBkMDYwOTYwODY0ODAxNjUwMzA0MDIwMzA1MDAwNDQwIiwiaGV4IikscmlwZW1kMTYwOkJ1ZmZlci5mcm9tKCIzMDIxMzAwOTA2MDUyYjI0MDMwMjAxMDUwMDA0MTQiLCJoZXgiKSxybWQxNjA6QnVmZmVyLmZyb20oIjMwMjEzMDA5MDYwNTJiMjQwMzAyMDEwNTAwMDQxNCIsImhleCIpfTt2YXIgU0lHTl9BTEdfVE9fSEFTSF9BTElBU0VTPXtyaXBlbWQxNjA6InJtZDE2MCJ9O3ZhciBERUZBVUxUX0hBU0hfRlVOQ1RJT049InNoYTI1NiI7bW9kdWxlLmV4cG9ydHM9e2lzRW5jcnlwdGlvbjp0cnVlLGlzU2lnbmF0dXJlOnRydWV9O21vZHVsZS5leHBvcnRzLm1ha2VTY2hlbWU9ZnVuY3Rpb24oa2V5LG9wdGlvbnMpe2Z1bmN0aW9uIFNjaGVtZShrZXksb3B0aW9ucyl7dGhpcy5rZXk9a2V5O3RoaXMub3B0aW9ucz1vcHRpb25zfVNjaGVtZS5wcm90b3R5cGUubWF4TWVzc2FnZUxlbmd0aD1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucyYmdGhpcy5vcHRpb25zLmVuY3J5cHRpb25TY2hlbWVPcHRpb25zLnBhZGRpbmc9PWNvbnN0YW50cy5SU0FfTk9fUEFERElORyl7cmV0dXJuIHRoaXMua2V5LmVuY3J5cHRlZERhdGFMZW5ndGh9cmV0dXJuIHRoaXMua2V5LmVuY3J5cHRlZERhdGFMZW5ndGgtMTF9O1NjaGVtZS5wcm90b3R5cGUuZW5jUGFkPWZ1bmN0aW9uKGJ1ZmZlcixvcHRpb25zKXtvcHRpb25zPW9wdGlvbnN8fHt9O3ZhciBmaWxsZWQ7aWYoYnVmZmVyLmxlbmd0aD50aGlzLmtleS5tYXhNZXNzYWdlTGVuZ3RoKXt0aHJvdyBuZXcgRXJyb3IoIk1lc3NhZ2UgdG9vIGxvbmcgZm9yIFJTQSAobj0iK3RoaXMua2V5LmVuY3J5cHRlZERhdGFMZW5ndGgrIiwgbD0iK2J1ZmZlci5sZW5ndGgrIikiKX1pZih0aGlzLm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMmJnRoaXMub3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucy5wYWRkaW5nPT1jb25zdGFudHMuUlNBX05PX1BBRERJTkcpe2ZpbGxlZD1CdWZmZXIuYWxsb2ModGhpcy5rZXkubWF4TWVzc2FnZUxlbmd0aC1idWZmZXIubGVuZ3RoKTtmaWxsZWQuZmlsbCgwKTtyZXR1cm4gQnVmZmVyLmNvbmNhdChbZmlsbGVkLGJ1ZmZlcl0pfWlmKG9wdGlvbnMudHlwZT09PTEpe2ZpbGxlZD1CdWZmZXIuYWxsb2ModGhpcy5rZXkuZW5jcnlwdGVkRGF0YUxlbmd0aC1idWZmZXIubGVuZ3RoLTEpO2ZpbGxlZC5maWxsKDI1NSwwLGZpbGxlZC5sZW5ndGgtMSk7ZmlsbGVkWzBdPTE7ZmlsbGVkW2ZpbGxlZC5sZW5ndGgtMV09MDtyZXR1cm4gQnVmZmVyLmNvbmNhdChbZmlsbGVkLGJ1ZmZlcl0pfWVsc2V7ZmlsbGVkPUJ1ZmZlci5hbGxvYyh0aGlzLmtleS5lbmNyeXB0ZWREYXRhTGVuZ3RoLWJ1ZmZlci5sZW5ndGgpO2ZpbGxlZFswXT0wO2ZpbGxlZFsxXT0yO3ZhciByYW5kPWNyeXB0LnJhbmRvbUJ5dGVzKGZpbGxlZC5sZW5ndGgtMyk7Zm9yKHZhciBpPTA7aTxyYW5kLmxlbmd0aDtpKyspe3ZhciByPXJhbmRbaV07d2hpbGUocj09PTApe3I9Y3J5cHQucmFuZG9tQnl0ZXMoMSlbMF19ZmlsbGVkW2krMl09cn1maWxsZWRbZmlsbGVkLmxlbmd0aC0xXT0wO3JldHVybiBCdWZmZXIuY29uY2F0KFtmaWxsZWQsYnVmZmVyXSl9fTtTY2hlbWUucHJvdG90eXBlLmVuY1VuUGFkPWZ1bmN0aW9uKGJ1ZmZlcixvcHRpb25zKXtvcHRpb25zPW9wdGlvbnN8fHt9O3ZhciBpPTA7aWYodGhpcy5vcHRpb25zLmVuY3J5cHRpb25TY2hlbWVPcHRpb25zJiZ0aGlzLm9wdGlvbnMuZW5jcnlwdGlvblNjaGVtZU9wdGlvbnMucGFkZGluZz09Y29uc3RhbnRzLlJTQV9OT19QQURESU5HKXt2YXIgdW5QYWQ7aWYodHlwZW9mIGJ1ZmZlci5sYXN0SW5kZXhPZj09ImZ1bmN0aW9uIil7dW5QYWQ9YnVmZmVyLnNsaWNlKGJ1ZmZlci5sYXN0SW5kZXhPZigiXDAiKSsxLGJ1ZmZlci5sZW5ndGgpfWVsc2V7dW5QYWQ9YnVmZmVyLnNsaWNlKFN0cmluZy5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIlwwIikrMSxidWZmZXIubGVuZ3RoKX1yZXR1cm4gdW5QYWR9aWYoYnVmZmVyLmxlbmd0aDw0KXtyZXR1cm4gbnVsbH1pZihvcHRpb25zLnR5cGU9PT0xKXtpZihidWZmZXJbMF0hPT0wJiZidWZmZXJbMV0hPT0xKXtyZXR1cm4gbnVsbH1pPTM7d2hpbGUoYnVmZmVyW2ldIT09MCl7aWYoYnVmZmVyW2ldIT0yNTV8fCsraT49YnVmZmVyLmxlbmd0aCl7cmV0dXJuIG51bGx9fX1lbHNle2lmKGJ1ZmZlclswXSE9PTAmJmJ1ZmZlclsxXSE9PTIpe3JldHVybiBudWxsfWk9Mzt3aGlsZShidWZmZXJbaV0hPT0wKXtpZigrK2k+PWJ1ZmZlci5sZW5ndGgpe3JldHVybiBudWxsfX19cmV0dXJuIGJ1ZmZlci5zbGljZShpKzEsYnVmZmVyLmxlbmd0aCl9O1NjaGVtZS5wcm90b3R5cGUuc2lnbj1mdW5jdGlvbihidWZmZXIpe3ZhciBoYXNoQWxnb3JpdGhtPXRoaXMub3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucy5oYXNofHxERUZBVUxUX0hBU0hfRlVOQ1RJT047aWYodGhpcy5vcHRpb25zLmVudmlyb25tZW50PT09ImJyb3dzZXIiKXtoYXNoQWxnb3JpdGhtPVNJR05fQUxHX1RPX0hBU0hfQUxJQVNFU1toYXNoQWxnb3JpdGhtXXx8aGFzaEFsZ29yaXRobTt2YXIgaGFzaGVyPWNyeXB0LmNyZWF0ZUhhc2goaGFzaEFsZ29yaXRobSk7aGFzaGVyLnVwZGF0ZShidWZmZXIpO3ZhciBoYXNoPXRoaXMucGtjczFwYWQoaGFzaGVyLmRpZ2VzdCgpLGhhc2hBbGdvcml0aG0pO3ZhciByZXM9dGhpcy5rZXkuJGRvUHJpdmF0ZShuZXcgQmlnSW50ZWdlcihoYXNoKSkudG9CdWZmZXIodGhpcy5rZXkuZW5jcnlwdGVkRGF0YUxlbmd0aCk7cmV0dXJuIHJlc31lbHNle3ZhciBzaWduZXI9Y3J5cHQuY3JlYXRlU2lnbigiUlNBLSIraGFzaEFsZ29yaXRobS50b1VwcGVyQ2FzZSgpKTtzaWduZXIudXBkYXRlKGJ1ZmZlcik7cmV0dXJuIHNpZ25lci5zaWduKHRoaXMub3B0aW9ucy5yc2FVdGlscy5leHBvcnRLZXkoInByaXZhdGUiKSl9fTtTY2hlbWUucHJvdG90eXBlLnZlcmlmeT1mdW5jdGlvbihidWZmZXIsc2lnbmF0dXJlLHNpZ25hdHVyZV9lbmNvZGluZyl7Y29uc29sZS5sb2coInZlcmlmeSIpO2lmKHRoaXMub3B0aW9ucy5lbmNyeXB0aW9uU2NoZW1lT3B0aW9ucyYmdGhpcy5vcHRpb25zLmVuY3J5cHRpb25TY2hlbWVPcHRpb25zLnBhZGRpbmc9PWNvbnN0YW50cy5SU0FfTk9fUEFERElORyl7cmV0dXJuIGZhbHNlfXZhciBoYXNoQWxnb3JpdGhtPXRoaXMub3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucy5oYXNofHxERUZBVUxUX0hBU0hfRlVOQ1RJT047aWYodGhpcy5vcHRpb25zLmVudmlyb25tZW50PT09ImJyb3dzZXIiKXtoYXNoQWxnb3JpdGhtPVNJR05fQUxHX1RPX0hBU0hfQUxJQVNFU1toYXNoQWxnb3JpdGhtXXx8aGFzaEFsZ29yaXRobTtpZihzaWduYXR1cmVfZW5jb2Rpbmcpe3NpZ25hdHVyZT1CdWZmZXIuZnJvbShzaWduYXR1cmUsc2lnbmF0dXJlX2VuY29kaW5nKX12YXIgaGFzaGVyPWNyeXB0LmNyZWF0ZUhhc2goaGFzaEFsZ29yaXRobSk7aGFzaGVyLnVwZGF0ZShidWZmZXIpO3ZhciBoYXNoPXRoaXMucGtjczFwYWQoaGFzaGVyLmRpZ2VzdCgpLGhhc2hBbGdvcml0aG0pO3ZhciBtPXRoaXMua2V5LiRkb1B1YmxpYyhuZXcgQmlnSW50ZWdlcihzaWduYXR1cmUpKTtyZXR1cm4gbS50b0J1ZmZlcigpLnRvU3RyaW5nKCJoZXgiKT09aGFzaC50b1N0cmluZygiaGV4Iil9ZWxzZXt2YXIgdmVyaWZpZXI9Y3J5cHQuY3JlYXRlVmVyaWZ5KCJSU0EtIitoYXNoQWxnb3JpdGhtLnRvVXBwZXJDYXNlKCkpO3ZlcmlmaWVyLnVwZGF0ZShidWZmZXIpO3JldHVybiB2ZXJpZmllci52ZXJpZnkodGhpcy5vcHRpb25zLnJzYVV0aWxzLmV4cG9ydEtleSgicHVibGljIiksc2lnbmF0dXJlLHNpZ25hdHVyZV9lbmNvZGluZyl9fTtTY2hlbWUucHJvdG90eXBlLnBrY3MwcGFkPWZ1bmN0aW9uKGJ1ZmZlcil7dmFyIGZpbGxlZD1CdWZmZXIuYWxsb2ModGhpcy5rZXkubWF4TWVzc2FnZUxlbmd0aC1idWZmZXIubGVuZ3RoKTtmaWxsZWQuZmlsbCgwKTtyZXR1cm4gQnVmZmVyLmNvbmNhdChbZmlsbGVkLGJ1ZmZlcl0pfTtTY2hlbWUucHJvdG90eXBlLnBrY3MwdW5wYWQ9ZnVuY3Rpb24oYnVmZmVyKXt2YXIgdW5QYWQ7aWYodHlwZW9mIGJ1ZmZlci5sYXN0SW5kZXhPZj09ImZ1bmN0aW9uIil7dW5QYWQ9YnVmZmVyLnNsaWNlKGJ1ZmZlci5sYXN0SW5kZXhPZigiXDAiKSsxLGJ1ZmZlci5sZW5ndGgpfWVsc2V7dW5QYWQ9YnVmZmVyLnNsaWNlKFN0cmluZy5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIlwwIikrMSxidWZmZXIubGVuZ3RoKX1yZXR1cm4gdW5QYWR9O1NjaGVtZS5wcm90b3R5cGUucGtjczFwYWQ9ZnVuY3Rpb24oaGFzaEJ1ZixoYXNoQWxnb3JpdGhtKXt2YXIgZGlnZXN0PVNJR05fSU5GT19IRUFEW2hhc2hBbGdvcml0aG1dO2lmKCFkaWdlc3Qpe3Rocm93IEVycm9yKCJVbnN1cHBvcnRlZCBoYXNoIGFsZ29yaXRobSIpfXZhciBkYXRhPUJ1ZmZlci5jb25jYXQoW2RpZ2VzdCxoYXNoQnVmXSk7aWYoZGF0YS5sZW5ndGgrMTA+dGhpcy5rZXkuZW5jcnlwdGVkRGF0YUxlbmd0aCl7dGhyb3cgRXJyb3IoIktleSBpcyB0b28gc2hvcnQgZm9yIHNpZ25pbmcgYWxnb3JpdGhtICgiK2hhc2hBbGdvcml0aG0rIikiKX12YXIgZmlsbGVkPUJ1ZmZlci5hbGxvYyh0aGlzLmtleS5lbmNyeXB0ZWREYXRhTGVuZ3RoLWRhdGEubGVuZ3RoLTEpO2ZpbGxlZC5maWxsKDI1NSwwLGZpbGxlZC5sZW5ndGgtMSk7ZmlsbGVkWzBdPTE7ZmlsbGVkW2ZpbGxlZC5sZW5ndGgtMV09MDt2YXIgcmVzPUJ1ZmZlci5jb25jYXQoW2ZpbGxlZCxkYXRhXSk7cmV0dXJuIHJlc307cmV0dXJuIG5ldyBTY2hlbWUoa2V5LG9wdGlvbnMpfX0pLmNhbGwodGhpcyxyZXF1aXJlKCJidWZmZXIiKS5CdWZmZXIpfSx7Ii4uL2NyeXB0byI6NDMsIi4uL2xpYnMvanNibiI6NTIsYnVmZmVyOjI3LGNvbnN0YW50czoyOX1dLDU2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oQnVmZmVyKXt2YXIgQmlnSW50ZWdlcj1yZXF1aXJlKCIuLi9saWJzL2pzYm4iKTt2YXIgY3J5cHQ9cmVxdWlyZSgiLi4vY3J5cHRvIik7bW9kdWxlLmV4cG9ydHM9e2lzRW5jcnlwdGlvbjpmYWxzZSxpc1NpZ25hdHVyZTp0cnVlfTt2YXIgREVGQVVMVF9IQVNIX0ZVTkNUSU9OPSJzaGExIjt2YXIgREVGQVVMVF9TQUxUX0xFTkdUSD0yMDttb2R1bGUuZXhwb3J0cy5tYWtlU2NoZW1lPWZ1bmN0aW9uKGtleSxvcHRpb25zKXt2YXIgT0FFUD1yZXF1aXJlKCIuL3NjaGVtZXMiKS5wa2NzMV9vYWVwO2Z1bmN0aW9uIFNjaGVtZShrZXksb3B0aW9ucyl7dGhpcy5rZXk9a2V5O3RoaXMub3B0aW9ucz1vcHRpb25zfVNjaGVtZS5wcm90b3R5cGUuc2lnbj1mdW5jdGlvbihidWZmZXIpe3ZhciBtSGFzaD1jcnlwdC5jcmVhdGVIYXNoKHRoaXMub3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucy5oYXNofHxERUZBVUxUX0hBU0hfRlVOQ1RJT04pO21IYXNoLnVwZGF0ZShidWZmZXIpO3ZhciBlbmNvZGVkPXRoaXMuZW1zYV9wc3NfZW5jb2RlKG1IYXNoLmRpZ2VzdCgpLHRoaXMua2V5LmtleVNpemUtMSk7cmV0dXJuIHRoaXMua2V5LiRkb1ByaXZhdGUobmV3IEJpZ0ludGVnZXIoZW5jb2RlZCkpLnRvQnVmZmVyKHRoaXMua2V5LmVuY3J5cHRlZERhdGFMZW5ndGgpfTtTY2hlbWUucHJvdG90eXBlLnZlcmlmeT1mdW5jdGlvbihidWZmZXIsc2lnbmF0dXJlLHNpZ25hdHVyZV9lbmNvZGluZyl7aWYoc2lnbmF0dXJlX2VuY29kaW5nKXtzaWduYXR1cmU9QnVmZmVyLmZyb20oc2lnbmF0dXJlLHNpZ25hdHVyZV9lbmNvZGluZyl9c2lnbmF0dXJlPW5ldyBCaWdJbnRlZ2VyKHNpZ25hdHVyZSk7dmFyIGVtTGVuPU1hdGguY2VpbCgodGhpcy5rZXkua2V5U2l6ZS0xKS84KTt2YXIgbT10aGlzLmtleS4kZG9QdWJsaWMoc2lnbmF0dXJlKS50b0J1ZmZlcihlbUxlbik7dmFyIG1IYXNoPWNyeXB0LmNyZWF0ZUhhc2godGhpcy5vcHRpb25zLnNpZ25pbmdTY2hlbWVPcHRpb25zLmhhc2h8fERFRkFVTFRfSEFTSF9GVU5DVElPTik7bUhhc2gudXBkYXRlKGJ1ZmZlcik7cmV0dXJuIHRoaXMuZW1zYV9wc3NfdmVyaWZ5KG1IYXNoLmRpZ2VzdCgpLG0sdGhpcy5rZXkua2V5U2l6ZS0xKX07U2NoZW1lLnByb3RvdHlwZS5lbXNhX3Bzc19lbmNvZGU9ZnVuY3Rpb24obUhhc2gsZW1CaXRzKXt2YXIgaGFzaD10aGlzLm9wdGlvbnMuc2lnbmluZ1NjaGVtZU9wdGlvbnMuaGFzaHx8REVGQVVMVF9IQVNIX0ZVTkNUSU9OO3ZhciBtZ2Y9dGhpcy5vcHRpb25zLnNpZ25pbmdTY2hlbWVPcHRpb25zLm1nZnx8T0FFUC5lbWVfb2FlcF9tZ2YxO3ZhciBzTGVuPXRoaXMub3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucy5zYWx0TGVuZ3RofHxERUZBVUxUX1NBTFRfTEVOR1RIO3ZhciBoTGVuPU9BRVAuZGlnZXN0TGVuZ3RoW2hhc2hdO3ZhciBlbUxlbj1NYXRoLmNlaWwoZW1CaXRzLzgpO2lmKGVtTGVuPGhMZW4rc0xlbisyKXt0aHJvdyBuZXcgRXJyb3IoIk91dHB1dCBsZW5ndGggcGFzc2VkIHRvIGVtQml0cygiK2VtQml0cysiKSBpcyB0b28gc21hbGwgZm9yIHRoZSBvcHRpb25zICIrInNwZWNpZmllZCgiK2hhc2grIiwgIitzTGVuKyIpLiBUbyBmaXggdGhpcyBpc3N1ZSBpbmNyZWFzZSB0aGUgdmFsdWUgb2YgZW1CaXRzLiAobWluaW11bSBzaXplOiAiKyg4KmhMZW4rOCpzTGVuKzkpKyIpIil9dmFyIHNhbHQ9Y3J5cHQucmFuZG9tQnl0ZXMoc0xlbik7dmFyIE1hcG9zdHJvcGhlPUJ1ZmZlci5hbGxvYyg4K2hMZW4rc0xlbik7TWFwb3N0cm9waGUuZmlsbCgwLDAsOCk7bUhhc2guY29weShNYXBvc3Ryb3BoZSw4KTtzYWx0LmNvcHkoTWFwb3N0cm9waGUsOCttSGFzaC5sZW5ndGgpO3ZhciBIPWNyeXB0LmNyZWF0ZUhhc2goaGFzaCk7SC51cGRhdGUoTWFwb3N0cm9waGUpO0g9SC5kaWdlc3QoKTt2YXIgUFM9QnVmZmVyLmFsbG9jKGVtTGVuLXNhbHQubGVuZ3RoLWhMZW4tMik7UFMuZmlsbCgwKTt2YXIgREI9QnVmZmVyLmFsbG9jKFBTLmxlbmd0aCsxK3NhbHQubGVuZ3RoKTtQUy5jb3B5KERCKTtEQltQUy5sZW5ndGhdPTE7c2FsdC5jb3B5KERCLFBTLmxlbmd0aCsxKTt2YXIgZGJNYXNrPW1nZihILERCLmxlbmd0aCxoYXNoKTt2YXIgbWFza2VkREI9QnVmZmVyLmFsbG9jKERCLmxlbmd0aCk7Zm9yKHZhciBpPTA7aTxkYk1hc2subGVuZ3RoO2krKyl7bWFza2VkREJbaV09REJbaV1eZGJNYXNrW2ldfXZhciBiaXRzPTgqZW1MZW4tZW1CaXRzO3ZhciBtYXNrPTI1NV4yNTU+PjgtYml0czw8OC1iaXRzO21hc2tlZERCWzBdPW1hc2tlZERCWzBdJm1hc2s7dmFyIEVNPUJ1ZmZlci5hbGxvYyhtYXNrZWREQi5sZW5ndGgrSC5sZW5ndGgrMSk7bWFza2VkREIuY29weShFTSwwKTtILmNvcHkoRU0sbWFza2VkREIubGVuZ3RoKTtFTVtFTS5sZW5ndGgtMV09MTg4O3JldHVybiBFTX07U2NoZW1lLnByb3RvdHlwZS5lbXNhX3Bzc192ZXJpZnk9ZnVuY3Rpb24obUhhc2gsRU0sZW1CaXRzKXt2YXIgaGFzaD10aGlzLm9wdGlvbnMuc2lnbmluZ1NjaGVtZU9wdGlvbnMuaGFzaHx8REVGQVVMVF9IQVNIX0ZVTkNUSU9OO3ZhciBtZ2Y9dGhpcy5vcHRpb25zLnNpZ25pbmdTY2hlbWVPcHRpb25zLm1nZnx8T0FFUC5lbWVfb2FlcF9tZ2YxO3ZhciBzTGVuPXRoaXMub3B0aW9ucy5zaWduaW5nU2NoZW1lT3B0aW9ucy5zYWx0TGVuZ3RofHxERUZBVUxUX1NBTFRfTEVOR1RIO3ZhciBoTGVuPU9BRVAuZGlnZXN0TGVuZ3RoW2hhc2hdO3ZhciBlbUxlbj1NYXRoLmNlaWwoZW1CaXRzLzgpO2lmKGVtTGVuPGhMZW4rc0xlbisyfHxFTVtFTS5sZW5ndGgtMV0hPTE4OCl7cmV0dXJuIGZhbHNlfXZhciBEQj1CdWZmZXIuYWxsb2MoZW1MZW4taExlbi0xKTtFTS5jb3B5KERCLDAsMCxlbUxlbi1oTGVuLTEpO3ZhciBtYXNrPTA7Zm9yKHZhciBpPTAsYml0cz04KmVtTGVuLWVtQml0cztpPGJpdHM7aSsrKXttYXNrfD0xPDw3LWl9aWYoKERCWzBdJm1hc2spIT09MCl7cmV0dXJuIGZhbHNlfXZhciBIPUVNLnNsaWNlKGVtTGVuLWhMZW4tMSxlbUxlbi0xKTt2YXIgZGJNYXNrPW1nZihILERCLmxlbmd0aCxoYXNoKTtmb3IoaT0wO2k8REIubGVuZ3RoO2krKyl7REJbaV1ePWRiTWFza1tpXX1iaXRzPTgqZW1MZW4tZW1CaXRzO21hc2s9MjU1XjI1NT4+OC1iaXRzPDw4LWJpdHM7REJbMF09REJbMF0mbWFzaztmb3IoaT0wO0RCW2ldPT09MCYmaTxEQi5sZW5ndGg7aSsrKTtpZihEQltpXSE9MSl7cmV0dXJuIGZhbHNlfXZhciBzYWx0PURCLnNsaWNlKERCLmxlbmd0aC1zTGVuKTt2YXIgTWFwb3N0cm9waGU9QnVmZmVyLmFsbG9jKDgraExlbitzTGVuKTtNYXBvc3Ryb3BoZS5maWxsKDAsMCw4KTttSGFzaC5jb3B5KE1hcG9zdHJvcGhlLDgpO3NhbHQuY29weShNYXBvc3Ryb3BoZSw4K21IYXNoLmxlbmd0aCk7dmFyIEhhcG9zdHJvcGhlPWNyeXB0LmNyZWF0ZUhhc2goaGFzaCk7SGFwb3N0cm9waGUudXBkYXRlKE1hcG9zdHJvcGhlKTtIYXBvc3Ryb3BoZT1IYXBvc3Ryb3BoZS5kaWdlc3QoKTtyZXR1cm4gSC50b1N0cmluZygiaGV4Iik9PT1IYXBvc3Ryb3BoZS50b1N0cmluZygiaGV4Iil9O3JldHVybiBuZXcgU2NoZW1lKGtleSxvcHRpb25zKX19KS5jYWxsKHRoaXMscmVxdWlyZSgiYnVmZmVyIikuQnVmZmVyKX0seyIuLi9jcnlwdG8iOjQzLCIuLi9saWJzL2pzYm4iOjUyLCIuL3NjaGVtZXMiOjU3LGJ1ZmZlcjoyN31dLDU3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cz17cGtjczE6cmVxdWlyZSgiLi9wa2NzMSIpLHBrY3MxX29hZXA6cmVxdWlyZSgiLi9vYWVwIikscHNzOnJlcXVpcmUoIi4vcHNzIiksaXNFbmNyeXB0aW9uOmZ1bmN0aW9uKHNjaGVtZSl7cmV0dXJuIG1vZHVsZS5leHBvcnRzW3NjaGVtZV0mJm1vZHVsZS5leHBvcnRzW3NjaGVtZV0uaXNFbmNyeXB0aW9ufSxpc1NpZ25hdHVyZTpmdW5jdGlvbihzY2hlbWUpe3JldHVybiBtb2R1bGUuZXhwb3J0c1tzY2hlbWVdJiZtb2R1bGUuZXhwb3J0c1tzY2hlbWVdLmlzU2lnbmF0dXJlfX19LHsiLi9vYWVwIjo1NCwiLi9wa2NzMSI6NTUsIi4vcHNzIjo1Nn1dLDU4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cy5saW5lYnJrPWZ1bmN0aW9uKHN0cixtYXhMZW4pe3ZhciByZXM9IiI7dmFyIGk9MDt3aGlsZShpK21heExlbjxzdHIubGVuZ3RoKXtyZXMrPXN0ci5zdWJzdHJpbmcoaSxpK21heExlbikrIlxuIjtpKz1tYXhMZW59cmV0dXJuIHJlcytzdHIuc3Vic3RyaW5nKGksc3RyLmxlbmd0aCl9O21vZHVsZS5leHBvcnRzLmRldGVjdEVudmlyb25tZW50PWZ1bmN0aW9uKCl7cmV0dXJuIHR5cGVvZiB3aW5kb3chPT0idW5kZWZpbmVkInx8dHlwZW9mIHNlbGYhPT0idW5kZWZpbmVkIiYmISFzZWxmLnBvc3RNZXNzYWdlPyJicm93c2VyIjoibm9kZSJ9O21vZHVsZS5leHBvcnRzLmdldDMySW50RnJvbUJ1ZmZlcj1mdW5jdGlvbihidWZmZXIsb2Zmc2V0KXtvZmZzZXQ9b2Zmc2V0fHwwO3ZhciBzaXplPTA7aWYoKHNpemU9YnVmZmVyLmxlbmd0aC1vZmZzZXQpPjApe2lmKHNpemU+PTQpe3JldHVybiBidWZmZXIucmVhZFVJbnQzMkJFKG9mZnNldCl9ZWxzZXt2YXIgcmVzPTA7Zm9yKHZhciBpPW9mZnNldCtzaXplLGQ9MDtpPm9mZnNldDtpLS0sZCs9Mil7cmVzKz1idWZmZXJbaS0xXSpNYXRoLnBvdygxNixkKX1yZXR1cm4gcmVzfX1lbHNle3JldHVybiBOYU59fTttb2R1bGUuZXhwb3J0cy5fPXtpc09iamVjdDpmdW5jdGlvbih2YWx1ZSl7dmFyIHR5cGU9dHlwZW9mIHZhbHVlO3JldHVybiEhdmFsdWUmJih0eXBlPT0ib2JqZWN0Inx8dHlwZT09ImZ1bmN0aW9uIil9LGlzU3RyaW5nOmZ1bmN0aW9uKHZhbHVlKXtyZXR1cm4gdHlwZW9mIHZhbHVlPT0ic3RyaW5nInx8dmFsdWUgaW5zdGFuY2VvZiBTdHJpbmd9LGlzTnVtYmVyOmZ1bmN0aW9uKHZhbHVlKXtyZXR1cm4gdHlwZW9mIHZhbHVlPT0ibnVtYmVyInx8IWlzTmFOKHBhcnNlRmxvYXQodmFsdWUpKSYmaXNGaW5pdGUodmFsdWUpfSxvbWl0OmZ1bmN0aW9uKG9iaixyZW1vdmVQcm9wKXt2YXIgbmV3T2JqPXt9O2Zvcih2YXIgcHJvcCBpbiBvYmope2lmKCFvYmouaGFzT3duUHJvcGVydHkocHJvcCl8fHByb3A9PT1yZW1vdmVQcm9wKXtjb250aW51ZX1uZXdPYmpbcHJvcF09b2JqW3Byb3BdfXJldHVybiBuZXdPYmp9fTttb2R1bGUuZXhwb3J0cy50cmltU3Vycm91bmRpbmdUZXh0PWZ1bmN0aW9uKGRhdGEsb3BlbmluZyxjbG9zaW5nKXt2YXIgdHJpbVN0YXJ0SW5kZXg9MDt2YXIgdHJpbUVuZEluZGV4PWRhdGEubGVuZ3RoO3ZhciBvcGVuaW5nQm91bmRhcnlJbmRleD1kYXRhLmluZGV4T2Yob3BlbmluZyk7aWYob3BlbmluZ0JvdW5kYXJ5SW5kZXg+PTApe3RyaW1TdGFydEluZGV4PW9wZW5pbmdCb3VuZGFyeUluZGV4K29wZW5pbmcubGVuZ3RofXZhciBjbG9zaW5nQm91bmRhcnlJbmRleD1kYXRhLmluZGV4T2YoY2xvc2luZyxvcGVuaW5nQm91bmRhcnlJbmRleCk7aWYoY2xvc2luZ0JvdW5kYXJ5SW5kZXg+PTApe3RyaW1FbmRJbmRleD1jbG9zaW5nQm91bmRhcnlJbmRleH1yZXR1cm4gZGF0YS5zdWJzdHJpbmcodHJpbVN0YXJ0SW5kZXgsdHJpbUVuZEluZGV4KX19LHt9XSw1OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO3ZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM9T2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9sczt2YXIgaGFzT3duUHJvcGVydHk9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTt2YXIgcHJvcElzRW51bWVyYWJsZT1PYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO2Z1bmN0aW9uIHRvT2JqZWN0KHZhbCl7aWYodmFsPT09bnVsbHx8dmFsPT09dW5kZWZpbmVkKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCIpfXJldHVybiBPYmplY3QodmFsKX1mdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKXt0cnl7aWYoIU9iamVjdC5hc3NpZ24pe3JldHVybiBmYWxzZX12YXIgdGVzdDE9bmV3IFN0cmluZygiYWJjIik7dGVzdDFbNV09ImRlIjtpZihPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MSlbMF09PT0iNSIpe3JldHVybiBmYWxzZX12YXIgdGVzdDI9e307Zm9yKHZhciBpPTA7aTwxMDtpKyspe3Rlc3QyWyJfIitTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXT1pfXZhciBvcmRlcjI9T2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbihuKXtyZXR1cm4gdGVzdDJbbl19KTtpZihvcmRlcjIuam9pbigiIikhPT0iMDEyMzQ1Njc4OSIpe3JldHVybiBmYWxzZX12YXIgdGVzdDM9e307ImFiY2RlZmdoaWprbG1ub3BxcnN0Ii5zcGxpdCgiIikuZm9yRWFjaChmdW5jdGlvbihsZXR0ZXIpe3Rlc3QzW2xldHRlcl09bGV0dGVyfSk7aWYoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSx0ZXN0MykpLmpvaW4oIiIpIT09ImFiY2RlZmdoaWprbG1ub3BxcnN0Iil7cmV0dXJuIGZhbHNlfXJldHVybiB0cnVlfWNhdGNoKGVycil7cmV0dXJuIGZhbHNlfX1tb2R1bGUuZXhwb3J0cz1zaG91bGRVc2VOYXRpdmUoKT9PYmplY3QuYXNzaWduOmZ1bmN0aW9uKHRhcmdldCxzb3VyY2Upe3ZhciBmcm9tO3ZhciB0bz10b09iamVjdCh0YXJnZXQpO3ZhciBzeW1ib2xzO2Zvcih2YXIgcz0xO3M8YXJndW1lbnRzLmxlbmd0aDtzKyspe2Zyb209T2JqZWN0KGFyZ3VtZW50c1tzXSk7Zm9yKHZhciBrZXkgaW4gZnJvbSl7aWYoaGFzT3duUHJvcGVydHkuY2FsbChmcm9tLGtleSkpe3RvW2tleV09ZnJvbVtrZXldfX1pZihnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpe3N5bWJvbHM9Z2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO2Zvcih2YXIgaT0wO2k8c3ltYm9scy5sZW5ndGg7aSsrKXtpZihwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSxzeW1ib2xzW2ldKSl7dG9bc3ltYm9sc1tpXV09ZnJvbVtzeW1ib2xzW2ldXX19fX1yZXR1cm4gdG99fSx7fV0sNjA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe2V4cG9ydHMucGJrZGYyPXJlcXVpcmUoIi4vbGliL2FzeW5jIik7ZXhwb3J0cy5wYmtkZjJTeW5jPXJlcXVpcmUoIi4vbGliL3N5bmMiKX0seyIuL2xpYi9hc3luYyI6NjEsIi4vbGliL3N5bmMiOjY0fV0sNjE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihwcm9jZXNzLGdsb2JhbCl7dmFyIGNoZWNrUGFyYW1ldGVycz1yZXF1aXJlKCIuL3ByZWNvbmRpdGlvbiIpO3ZhciBkZWZhdWx0RW5jb2Rpbmc9cmVxdWlyZSgiLi9kZWZhdWx0LWVuY29kaW5nIik7dmFyIHN5bmM9cmVxdWlyZSgiLi9zeW5jIik7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgWkVST19CVUY7dmFyIHN1YnRsZT1nbG9iYWwuY3J5cHRvJiZnbG9iYWwuY3J5cHRvLnN1YnRsZTt2YXIgdG9Ccm93c2VyPXtzaGE6IlNIQS0xIiwic2hhLTEiOiJTSEEtMSIsc2hhMToiU0hBLTEiLHNoYTI1NjoiU0hBLTI1NiIsInNoYS0yNTYiOiJTSEEtMjU2IixzaGEzODQ6IlNIQS0zODQiLCJzaGEtMzg0IjoiU0hBLTM4NCIsInNoYS01MTIiOiJTSEEtNTEyIixzaGE1MTI6IlNIQS01MTIifTt2YXIgY2hlY2tzPVtdO2Z1bmN0aW9uIGNoZWNrTmF0aXZlKGFsZ28pe2lmKGdsb2JhbC5wcm9jZXNzJiYhZ2xvYmFsLnByb2Nlc3MuYnJvd3Nlcil7cmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSl9aWYoIXN1YnRsZXx8IXN1YnRsZS5pbXBvcnRLZXl8fCFzdWJ0bGUuZGVyaXZlQml0cyl7cmV0dXJuIFByb21pc2UucmVzb2x2ZShmYWxzZSl9aWYoY2hlY2tzW2FsZ29dIT09dW5kZWZpbmVkKXtyZXR1cm4gY2hlY2tzW2FsZ29dfVpFUk9fQlVGPVpFUk9fQlVGfHxCdWZmZXIuYWxsb2MoOCk7dmFyIHByb209YnJvd3NlclBia2RmMihaRVJPX0JVRixaRVJPX0JVRiwxMCwxMjgsYWxnbykudGhlbihmdW5jdGlvbigpe3JldHVybiB0cnVlfSkuY2F0Y2goZnVuY3Rpb24oKXtyZXR1cm4gZmFsc2V9KTtjaGVja3NbYWxnb109cHJvbTtyZXR1cm4gcHJvbX1mdW5jdGlvbiBicm93c2VyUGJrZGYyKHBhc3N3b3JkLHNhbHQsaXRlcmF0aW9ucyxsZW5ndGgsYWxnbyl7cmV0dXJuIHN1YnRsZS5pbXBvcnRLZXkoInJhdyIscGFzc3dvcmQse25hbWU6IlBCS0RGMiJ9LGZhbHNlLFsiZGVyaXZlQml0cyJdKS50aGVuKGZ1bmN0aW9uKGtleSl7cmV0dXJuIHN1YnRsZS5kZXJpdmVCaXRzKHtuYW1lOiJQQktERjIiLHNhbHQ6c2FsdCxpdGVyYXRpb25zOml0ZXJhdGlvbnMsaGFzaDp7bmFtZTphbGdvfX0sa2V5LGxlbmd0aDw8Myl9KS50aGVuKGZ1bmN0aW9uKHJlcyl7cmV0dXJuIEJ1ZmZlci5mcm9tKHJlcyl9KX1mdW5jdGlvbiByZXNvbHZlUHJvbWlzZShwcm9taXNlLGNhbGxiYWNrKXtwcm9taXNlLnRoZW4oZnVuY3Rpb24ob3V0KXtwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uKCl7Y2FsbGJhY2sobnVsbCxvdXQpfSl9LGZ1bmN0aW9uKGUpe3Byb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKXtjYWxsYmFjayhlKX0pfSl9bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24ocGFzc3dvcmQsc2FsdCxpdGVyYXRpb25zLGtleWxlbixkaWdlc3QsY2FsbGJhY2spe2lmKHR5cGVvZiBkaWdlc3Q9PT0iZnVuY3Rpb24iKXtjYWxsYmFjaz1kaWdlc3Q7ZGlnZXN0PXVuZGVmaW5lZH1kaWdlc3Q9ZGlnZXN0fHwic2hhMSI7dmFyIGFsZ289dG9Ccm93c2VyW2RpZ2VzdC50b0xvd2VyQ2FzZSgpXTtpZighYWxnb3x8dHlwZW9mIGdsb2JhbC5Qcm9taXNlIT09ImZ1bmN0aW9uIil7cmV0dXJuIHByb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKXt2YXIgb3V0O3RyeXtvdXQ9c3luYyhwYXNzd29yZCxzYWx0LGl0ZXJhdGlvbnMsa2V5bGVuLGRpZ2VzdCl9Y2F0Y2goZSl7cmV0dXJuIGNhbGxiYWNrKGUpfWNhbGxiYWNrKG51bGwsb3V0KX0pfWNoZWNrUGFyYW1ldGVycyhwYXNzd29yZCxzYWx0LGl0ZXJhdGlvbnMsa2V5bGVuKTtpZih0eXBlb2YgY2FsbGJhY2shPT0iZnVuY3Rpb24iKXRocm93IG5ldyBFcnJvcigiTm8gY2FsbGJhY2sgcHJvdmlkZWQgdG8gcGJrZGYyIik7aWYoIUJ1ZmZlci5pc0J1ZmZlcihwYXNzd29yZCkpcGFzc3dvcmQ9QnVmZmVyLmZyb20ocGFzc3dvcmQsZGVmYXVsdEVuY29kaW5nKTtpZighQnVmZmVyLmlzQnVmZmVyKHNhbHQpKXNhbHQ9QnVmZmVyLmZyb20oc2FsdCxkZWZhdWx0RW5jb2RpbmcpO3Jlc29sdmVQcm9taXNlKGNoZWNrTmF0aXZlKGFsZ28pLnRoZW4oZnVuY3Rpb24ocmVzcCl7aWYocmVzcClyZXR1cm4gYnJvd3NlclBia2RmMihwYXNzd29yZCxzYWx0LGl0ZXJhdGlvbnMsa2V5bGVuLGFsZ28pO3JldHVybiBzeW5jKHBhc3N3b3JkLHNhbHQsaXRlcmF0aW9ucyxrZXlsZW4sZGlnZXN0KX0pLGNhbGxiYWNrKX19KS5jYWxsKHRoaXMscmVxdWlyZSgiX3Byb2Nlc3MiKSx0eXBlb2YgZ2xvYmFsIT09InVuZGVmaW5lZCI/Z2xvYmFsOnR5cGVvZiBzZWxmIT09InVuZGVmaW5lZCI/c2VsZjp0eXBlb2Ygd2luZG93IT09InVuZGVmaW5lZCI/d2luZG93Ont9KX0seyIuL2RlZmF1bHQtZW5jb2RpbmciOjYyLCIuL3ByZWNvbmRpdGlvbiI6NjMsIi4vc3luYyI6NjQsX3Byb2Nlc3M6NjYsInNhZmUtYnVmZmVyIjo4M31dLDYyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24ocHJvY2Vzcyl7dmFyIGRlZmF1bHRFbmNvZGluZztpZihwcm9jZXNzLmJyb3dzZXIpe2RlZmF1bHRFbmNvZGluZz0idXRmLTgifWVsc2V7dmFyIHBWZXJzaW9uTWFqb3I9cGFyc2VJbnQocHJvY2Vzcy52ZXJzaW9uLnNwbGl0KCIuIilbMF0uc2xpY2UoMSksMTApO2RlZmF1bHRFbmNvZGluZz1wVmVyc2lvbk1ham9yPj02PyJ1dGYtOCI6ImJpbmFyeSJ9bW9kdWxlLmV4cG9ydHM9ZGVmYXVsdEVuY29kaW5nfSkuY2FsbCh0aGlzLHJlcXVpcmUoIl9wcm9jZXNzIikpfSx7X3Byb2Nlc3M6NjZ9XSw2MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKEJ1ZmZlcil7dmFyIE1BWF9BTExPQz1NYXRoLnBvdygyLDMwKS0xO2Z1bmN0aW9uIGNoZWNrQnVmZmVyKGJ1ZixuYW1lKXtpZih0eXBlb2YgYnVmIT09InN0cmluZyImJiFCdWZmZXIuaXNCdWZmZXIoYnVmKSl7dGhyb3cgbmV3IFR5cGVFcnJvcihuYW1lKyIgbXVzdCBiZSBhIGJ1ZmZlciBvciBzdHJpbmciKX19bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24ocGFzc3dvcmQsc2FsdCxpdGVyYXRpb25zLGtleWxlbil7Y2hlY2tCdWZmZXIocGFzc3dvcmQsIlBhc3N3b3JkIik7Y2hlY2tCdWZmZXIoc2FsdCwiU2FsdCIpO2lmKHR5cGVvZiBpdGVyYXRpb25zIT09Im51bWJlciIpe3Rocm93IG5ldyBUeXBlRXJyb3IoIkl0ZXJhdGlvbnMgbm90IGEgbnVtYmVyIil9aWYoaXRlcmF0aW9uczwwKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJCYWQgaXRlcmF0aW9ucyIpfWlmKHR5cGVvZiBrZXlsZW4hPT0ibnVtYmVyIil7dGhyb3cgbmV3IFR5cGVFcnJvcigiS2V5IGxlbmd0aCBub3QgYSBudW1iZXIiKX1pZihrZXlsZW48MHx8a2V5bGVuPk1BWF9BTExPQ3x8a2V5bGVuIT09a2V5bGVuKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJCYWQga2V5IGxlbmd0aCIpfX19KS5jYWxsKHRoaXMse2lzQnVmZmVyOnJlcXVpcmUoIi4uLy4uL2lzLWJ1ZmZlci9pbmRleC5qcyIpfSl9LHsiLi4vLi4vaXMtYnVmZmVyL2luZGV4LmpzIjozN31dLDY0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXt2YXIgbWQ1PXJlcXVpcmUoImNyZWF0ZS1oYXNoL21kNSIpO3ZhciBSSVBFTUQxNjA9cmVxdWlyZSgicmlwZW1kMTYwIik7dmFyIHNoYT1yZXF1aXJlKCJzaGEuanMiKTt2YXIgY2hlY2tQYXJhbWV0ZXJzPXJlcXVpcmUoIi4vcHJlY29uZGl0aW9uIik7dmFyIGRlZmF1bHRFbmNvZGluZz1yZXF1aXJlKCIuL2RlZmF1bHQtZW5jb2RpbmciKTt2YXIgQnVmZmVyPXJlcXVpcmUoInNhZmUtYnVmZmVyIikuQnVmZmVyO3ZhciBaRVJPUz1CdWZmZXIuYWxsb2MoMTI4KTt2YXIgc2l6ZXM9e21kNToxNixzaGExOjIwLHNoYTIyNDoyOCxzaGEyNTY6MzIsc2hhMzg0OjQ4LHNoYTUxMjo2NCxybWQxNjA6MjAscmlwZW1kMTYwOjIwfTtmdW5jdGlvbiBIbWFjKGFsZyxrZXksc2FsdExlbil7dmFyIGhhc2g9Z2V0RGlnZXN0KGFsZyk7dmFyIGJsb2Nrc2l6ZT1hbGc9PT0ic2hhNTEyInx8YWxnPT09InNoYTM4NCI/MTI4OjY0O2lmKGtleS5sZW5ndGg+YmxvY2tzaXplKXtrZXk9aGFzaChrZXkpfWVsc2UgaWYoa2V5Lmxlbmd0aDxibG9ja3NpemUpe2tleT1CdWZmZXIuY29uY2F0KFtrZXksWkVST1NdLGJsb2Nrc2l6ZSl9dmFyIGlwYWQ9QnVmZmVyLmFsbG9jVW5zYWZlKGJsb2Nrc2l6ZStzaXplc1thbGddKTt2YXIgb3BhZD1CdWZmZXIuYWxsb2NVbnNhZmUoYmxvY2tzaXplK3NpemVzW2FsZ10pO2Zvcih2YXIgaT0wO2k8YmxvY2tzaXplO2krKyl7aXBhZFtpXT1rZXlbaV1eNTQ7b3BhZFtpXT1rZXlbaV1eOTJ9dmFyIGlwYWQxPUJ1ZmZlci5hbGxvY1Vuc2FmZShibG9ja3NpemUrc2FsdExlbis0KTtpcGFkLmNvcHkoaXBhZDEsMCwwLGJsb2Nrc2l6ZSk7dGhpcy5pcGFkMT1pcGFkMTt0aGlzLmlwYWQyPWlwYWQ7dGhpcy5vcGFkPW9wYWQ7dGhpcy5hbGc9YWxnO3RoaXMuYmxvY2tzaXplPWJsb2Nrc2l6ZTt0aGlzLmhhc2g9aGFzaDt0aGlzLnNpemU9c2l6ZXNbYWxnXX1IbWFjLnByb3RvdHlwZS5ydW49ZnVuY3Rpb24oZGF0YSxpcGFkKXtkYXRhLmNvcHkoaXBhZCx0aGlzLmJsb2Nrc2l6ZSk7dmFyIGg9dGhpcy5oYXNoKGlwYWQpO2guY29weSh0aGlzLm9wYWQsdGhpcy5ibG9ja3NpemUpO3JldHVybiB0aGlzLmhhc2godGhpcy5vcGFkKX07ZnVuY3Rpb24gZ2V0RGlnZXN0KGFsZyl7ZnVuY3Rpb24gc2hhRnVuYyhkYXRhKXtyZXR1cm4gc2hhKGFsZykudXBkYXRlKGRhdGEpLmRpZ2VzdCgpfWZ1bmN0aW9uIHJtZDE2MEZ1bmMoZGF0YSl7cmV0dXJuKG5ldyBSSVBFTUQxNjApLnVwZGF0ZShkYXRhKS5kaWdlc3QoKX1pZihhbGc9PT0icm1kMTYwInx8YWxnPT09InJpcGVtZDE2MCIpcmV0dXJuIHJtZDE2MEZ1bmM7aWYoYWxnPT09Im1kNSIpcmV0dXJuIG1kNTtyZXR1cm4gc2hhRnVuY31mdW5jdGlvbiBwYmtkZjIocGFzc3dvcmQsc2FsdCxpdGVyYXRpb25zLGtleWxlbixkaWdlc3Qpe2NoZWNrUGFyYW1ldGVycyhwYXNzd29yZCxzYWx0LGl0ZXJhdGlvbnMsa2V5bGVuKTtpZighQnVmZmVyLmlzQnVmZmVyKHBhc3N3b3JkKSlwYXNzd29yZD1CdWZmZXIuZnJvbShwYXNzd29yZCxkZWZhdWx0RW5jb2RpbmcpO2lmKCFCdWZmZXIuaXNCdWZmZXIoc2FsdCkpc2FsdD1CdWZmZXIuZnJvbShzYWx0LGRlZmF1bHRFbmNvZGluZyk7ZGlnZXN0PWRpZ2VzdHx8InNoYTEiO3ZhciBobWFjPW5ldyBIbWFjKGRpZ2VzdCxwYXNzd29yZCxzYWx0Lmxlbmd0aCk7dmFyIERLPUJ1ZmZlci5hbGxvY1Vuc2FmZShrZXlsZW4pO3ZhciBibG9jazE9QnVmZmVyLmFsbG9jVW5zYWZlKHNhbHQubGVuZ3RoKzQpO3NhbHQuY29weShibG9jazEsMCwwLHNhbHQubGVuZ3RoKTt2YXIgZGVzdFBvcz0wO3ZhciBoTGVuPXNpemVzW2RpZ2VzdF07dmFyIGw9TWF0aC5jZWlsKGtleWxlbi9oTGVuKTtmb3IodmFyIGk9MTtpPD1sO2krKyl7YmxvY2sxLndyaXRlVUludDMyQkUoaSxzYWx0Lmxlbmd0aCk7dmFyIFQ9aG1hYy5ydW4oYmxvY2sxLGhtYWMuaXBhZDEpO3ZhciBVPVQ7Zm9yKHZhciBqPTE7ajxpdGVyYXRpb25zO2orKyl7VT1obWFjLnJ1bihVLGhtYWMuaXBhZDIpO2Zvcih2YXIgaz0wO2s8aExlbjtrKyspVFtrXV49VVtrXX1ULmNvcHkoREssZGVzdFBvcyk7ZGVzdFBvcys9aExlbn1yZXR1cm4gREt9bW9kdWxlLmV4cG9ydHM9cGJrZGYyfSx7Ii4vZGVmYXVsdC1lbmNvZGluZyI6NjIsIi4vcHJlY29uZGl0aW9uIjo2MywiY3JlYXRlLWhhc2gvbWQ1IjozMixyaXBlbWQxNjA6ODIsInNhZmUtYnVmZmVyIjo4Mywic2hhLmpzIjo5NX1dLDY1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24ocHJvY2Vzcyl7InVzZSBzdHJpY3QiO2lmKHR5cGVvZiBwcm9jZXNzPT09InVuZGVmaW5lZCJ8fCFwcm9jZXNzLnZlcnNpb258fHByb2Nlc3MudmVyc2lvbi5pbmRleE9mKCJ2MC4iKT09PTB8fHByb2Nlc3MudmVyc2lvbi5pbmRleE9mKCJ2MS4iKT09PTAmJnByb2Nlc3MudmVyc2lvbi5pbmRleE9mKCJ2MS44LiIpIT09MCl7bW9kdWxlLmV4cG9ydHM9e25leHRUaWNrOm5leHRUaWNrfX1lbHNle21vZHVsZS5leHBvcnRzPXByb2Nlc3N9ZnVuY3Rpb24gbmV4dFRpY2soZm4sYXJnMSxhcmcyLGFyZzMpe2lmKHR5cGVvZiBmbiE9PSJmdW5jdGlvbiIpe3Rocm93IG5ldyBUeXBlRXJyb3IoJyJjYWxsYmFjayIgYXJndW1lbnQgbXVzdCBiZSBhIGZ1bmN0aW9uJyl9dmFyIGxlbj1hcmd1bWVudHMubGVuZ3RoO3ZhciBhcmdzLGk7c3dpdGNoKGxlbil7Y2FzZSAwOmNhc2UgMTpyZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmbik7Y2FzZSAyOnJldHVybiBwcm9jZXNzLm5leHRUaWNrKGZ1bmN0aW9uIGFmdGVyVGlja09uZSgpe2ZuLmNhbGwobnVsbCxhcmcxKX0pO2Nhc2UgMzpyZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiBhZnRlclRpY2tUd28oKXtmbi5jYWxsKG51bGwsYXJnMSxhcmcyKX0pO2Nhc2UgNDpyZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiBhZnRlclRpY2tUaHJlZSgpe2ZuLmNhbGwobnVsbCxhcmcxLGFyZzIsYXJnMyl9KTtkZWZhdWx0OmFyZ3M9bmV3IEFycmF5KGxlbi0xKTtpPTA7d2hpbGUoaTxhcmdzLmxlbmd0aCl7YXJnc1tpKytdPWFyZ3VtZW50c1tpXX1yZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiBhZnRlclRpY2soKXtmbi5hcHBseShudWxsLGFyZ3MpfSl9fX0pLmNhbGwodGhpcyxyZXF1aXJlKCJfcHJvY2VzcyIpKX0se19wcm9jZXNzOjY2fV0sNjY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe3ZhciBwcm9jZXNzPW1vZHVsZS5leHBvcnRzPXt9O3ZhciBjYWNoZWRTZXRUaW1lb3V0O3ZhciBjYWNoZWRDbGVhclRpbWVvdXQ7ZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpe3Rocm93IG5ldyBFcnJvcigic2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCIpfWZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQoKXt0aHJvdyBuZXcgRXJyb3IoImNsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCIpfShmdW5jdGlvbigpe3RyeXtpZih0eXBlb2Ygc2V0VGltZW91dD09PSJmdW5jdGlvbiIpe2NhY2hlZFNldFRpbWVvdXQ9c2V0VGltZW91dH1lbHNle2NhY2hlZFNldFRpbWVvdXQ9ZGVmYXVsdFNldFRpbW91dH19Y2F0Y2goZSl7Y2FjaGVkU2V0VGltZW91dD1kZWZhdWx0U2V0VGltb3V0fXRyeXtpZih0eXBlb2YgY2xlYXJUaW1lb3V0PT09ImZ1bmN0aW9uIil7Y2FjaGVkQ2xlYXJUaW1lb3V0PWNsZWFyVGltZW91dH1lbHNle2NhY2hlZENsZWFyVGltZW91dD1kZWZhdWx0Q2xlYXJUaW1lb3V0fX1jYXRjaChlKXtjYWNoZWRDbGVhclRpbWVvdXQ9ZGVmYXVsdENsZWFyVGltZW91dH19KSgpO2Z1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKXtpZihjYWNoZWRTZXRUaW1lb3V0PT09c2V0VGltZW91dCl7cmV0dXJuIHNldFRpbWVvdXQoZnVuLDApfWlmKChjYWNoZWRTZXRUaW1lb3V0PT09ZGVmYXVsdFNldFRpbW91dHx8IWNhY2hlZFNldFRpbWVvdXQpJiZzZXRUaW1lb3V0KXtjYWNoZWRTZXRUaW1lb3V0PXNldFRpbWVvdXQ7cmV0dXJuIHNldFRpbWVvdXQoZnVuLDApfXRyeXtyZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sMCl9Y2F0Y2goZSl7dHJ5e3JldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCxmdW4sMCl9Y2F0Y2goZSl7cmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLGZ1biwwKX19fWZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpe2lmKGNhY2hlZENsZWFyVGltZW91dD09PWNsZWFyVGltZW91dCl7cmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpfWlmKChjYWNoZWRDbGVhclRpbWVvdXQ9PT1kZWZhdWx0Q2xlYXJUaW1lb3V0fHwhY2FjaGVkQ2xlYXJUaW1lb3V0KSYmY2xlYXJUaW1lb3V0KXtjYWNoZWRDbGVhclRpbWVvdXQ9Y2xlYXJUaW1lb3V0O3JldHVybiBjbGVhclRpbWVvdXQobWFya2VyKX10cnl7cmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpfWNhdGNoKGUpe3RyeXtyZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCxtYXJrZXIpfWNhdGNoKGUpe3JldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLG1hcmtlcil9fX12YXIgcXVldWU9W107dmFyIGRyYWluaW5nPWZhbHNlO3ZhciBjdXJyZW50UXVldWU7dmFyIHF1ZXVlSW5kZXg9LTE7ZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCl7aWYoIWRyYWluaW5nfHwhY3VycmVudFF1ZXVlKXtyZXR1cm59ZHJhaW5pbmc9ZmFsc2U7aWYoY3VycmVudFF1ZXVlLmxlbmd0aCl7cXVldWU9Y3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSl9ZWxzZXtxdWV1ZUluZGV4PS0xfWlmKHF1ZXVlLmxlbmd0aCl7ZHJhaW5RdWV1ZSgpfX1mdW5jdGlvbiBkcmFpblF1ZXVlKCl7aWYoZHJhaW5pbmcpe3JldHVybn12YXIgdGltZW91dD1ydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7ZHJhaW5pbmc9dHJ1ZTt2YXIgbGVuPXF1ZXVlLmxlbmd0aDt3aGlsZShsZW4pe2N1cnJlbnRRdWV1ZT1xdWV1ZTtxdWV1ZT1bXTt3aGlsZSgrK3F1ZXVlSW5kZXg8bGVuKXtpZihjdXJyZW50UXVldWUpe2N1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKX19cXVldWVJbmRleD0tMTtsZW49cXVldWUubGVuZ3RofWN1cnJlbnRRdWV1ZT1udWxsO2RyYWluaW5nPWZhbHNlO3J1bkNsZWFyVGltZW91dCh0aW1lb3V0KX1wcm9jZXNzLm5leHRUaWNrPWZ1bmN0aW9uKGZ1bil7dmFyIGFyZ3M9bmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGgtMSk7aWYoYXJndW1lbnRzLmxlbmd0aD4xKXtmb3IodmFyIGk9MTtpPGFyZ3VtZW50cy5sZW5ndGg7aSsrKXthcmdzW2ktMV09YXJndW1lbnRzW2ldfX1xdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1bixhcmdzKSk7aWYocXVldWUubGVuZ3RoPT09MSYmIWRyYWluaW5nKXtydW5UaW1lb3V0KGRyYWluUXVldWUpfX07ZnVuY3Rpb24gSXRlbShmdW4sYXJyYXkpe3RoaXMuZnVuPWZ1bjt0aGlzLmFycmF5PWFycmF5fUl0ZW0ucHJvdG90eXBlLnJ1bj1mdW5jdGlvbigpe3RoaXMuZnVuLmFwcGx5KG51bGwsdGhpcy5hcnJheSl9O3Byb2Nlc3MudGl0bGU9ImJyb3dzZXIiO3Byb2Nlc3MuYnJvd3Nlcj10cnVlO3Byb2Nlc3MuZW52PXt9O3Byb2Nlc3MuYXJndj1bXTtwcm9jZXNzLnZlcnNpb249IiI7cHJvY2Vzcy52ZXJzaW9ucz17fTtmdW5jdGlvbiBub29wKCl7fXByb2Nlc3Mub249bm9vcDtwcm9jZXNzLmFkZExpc3RlbmVyPW5vb3A7cHJvY2Vzcy5vbmNlPW5vb3A7cHJvY2Vzcy5vZmY9bm9vcDtwcm9jZXNzLnJlbW92ZUxpc3RlbmVyPW5vb3A7cHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnM9bm9vcDtwcm9jZXNzLmVtaXQ9bm9vcDtwcm9jZXNzLnByZXBlbmRMaXN0ZW5lcj1ub29wO3Byb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lcj1ub29wO3Byb2Nlc3MubGlzdGVuZXJzPWZ1bmN0aW9uKG5hbWUpe3JldHVybltdfTtwcm9jZXNzLmJpbmRpbmc9ZnVuY3Rpb24obmFtZSl7dGhyb3cgbmV3IEVycm9yKCJwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCIpfTtwcm9jZXNzLmN3ZD1mdW5jdGlvbigpe3JldHVybiIvIn07cHJvY2Vzcy5jaGRpcj1mdW5jdGlvbihkaXIpe3Rocm93IG5ldyBFcnJvcigicHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkIil9O3Byb2Nlc3MudW1hc2s9ZnVuY3Rpb24oKXtyZXR1cm4gMH19LHt9XSw2NzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIF9pbmhlcml0c0xvb3NlKHN1YkNsYXNzLHN1cGVyQ2xhc3Mpe3N1YkNsYXNzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MucHJvdG90eXBlKTtzdWJDbGFzcy5wcm90b3R5cGUuY29uc3RydWN0b3I9c3ViQ2xhc3M7c3ViQ2xhc3MuX19wcm90b19fPXN1cGVyQ2xhc3N9dmFyIGNvZGVzPXt9O2Z1bmN0aW9uIGNyZWF0ZUVycm9yVHlwZShjb2RlLG1lc3NhZ2UsQmFzZSl7aWYoIUJhc2Upe0Jhc2U9RXJyb3J9ZnVuY3Rpb24gZ2V0TWVzc2FnZShhcmcxLGFyZzIsYXJnMyl7aWYodHlwZW9mIG1lc3NhZ2U9PT0ic3RyaW5nIil7cmV0dXJuIG1lc3NhZ2V9ZWxzZXtyZXR1cm4gbWVzc2FnZShhcmcxLGFyZzIsYXJnMyl9fXZhciBOb2RlRXJyb3I9ZnVuY3Rpb24oX0Jhc2Upe19pbmhlcml0c0xvb3NlKE5vZGVFcnJvcixfQmFzZSk7ZnVuY3Rpb24gTm9kZUVycm9yKGFyZzEsYXJnMixhcmczKXtyZXR1cm4gX0Jhc2UuY2FsbCh0aGlzLGdldE1lc3NhZ2UoYXJnMSxhcmcyLGFyZzMpKXx8dGhpc31yZXR1cm4gTm9kZUVycm9yfShCYXNlKTtOb2RlRXJyb3IucHJvdG90eXBlLm5hbWU9QmFzZS5uYW1lO05vZGVFcnJvci5wcm90b3R5cGUuY29kZT1jb2RlO2NvZGVzW2NvZGVdPU5vZGVFcnJvcn1mdW5jdGlvbiBvbmVPZihleHBlY3RlZCx0aGluZyl7aWYoQXJyYXkuaXNBcnJheShleHBlY3RlZCkpe3ZhciBsZW49ZXhwZWN0ZWQubGVuZ3RoO2V4cGVjdGVkPWV4cGVjdGVkLm1hcChmdW5jdGlvbihpKXtyZXR1cm4gU3RyaW5nKGkpfSk7aWYobGVuPjIpe3JldHVybiJvbmUgb2YgIi5jb25jYXQodGhpbmcsIiAiKS5jb25jYXQoZXhwZWN0ZWQuc2xpY2UoMCxsZW4tMSkuam9pbigiLCAiKSwiLCBvciAiKStleHBlY3RlZFtsZW4tMV19ZWxzZSBpZihsZW49PT0yKXtyZXR1cm4ib25lIG9mICIuY29uY2F0KHRoaW5nLCIgIikuY29uY2F0KGV4cGVjdGVkWzBdLCIgb3IgIikuY29uY2F0KGV4cGVjdGVkWzFdKX1lbHNle3JldHVybiJvZiAiLmNvbmNhdCh0aGluZywiICIpLmNvbmNhdChleHBlY3RlZFswXSl9fWVsc2V7cmV0dXJuIm9mICIuY29uY2F0KHRoaW5nLCIgIikuY29uY2F0KFN0cmluZyhleHBlY3RlZCkpfX1mdW5jdGlvbiBzdGFydHNXaXRoKHN0cixzZWFyY2gscG9zKXtyZXR1cm4gc3RyLnN1YnN0cighcG9zfHxwb3M8MD8wOitwb3Msc2VhcmNoLmxlbmd0aCk9PT1zZWFyY2h9ZnVuY3Rpb24gZW5kc1dpdGgoc3RyLHNlYXJjaCx0aGlzX2xlbil7aWYodGhpc19sZW49PT11bmRlZmluZWR8fHRoaXNfbGVuPnN0ci5sZW5ndGgpe3RoaXNfbGVuPXN0ci5sZW5ndGh9cmV0dXJuIHN0ci5zdWJzdHJpbmcodGhpc19sZW4tc2VhcmNoLmxlbmd0aCx0aGlzX2xlbik9PT1zZWFyY2h9ZnVuY3Rpb24gaW5jbHVkZXMoc3RyLHNlYXJjaCxzdGFydCl7aWYodHlwZW9mIHN0YXJ0IT09Im51bWJlciIpe3N0YXJ0PTB9aWYoc3RhcnQrc2VhcmNoLmxlbmd0aD5zdHIubGVuZ3RoKXtyZXR1cm4gZmFsc2V9ZWxzZXtyZXR1cm4gc3RyLmluZGV4T2Yoc2VhcmNoLHN0YXJ0KSE9PS0xfX1jcmVhdGVFcnJvclR5cGUoIkVSUl9JTlZBTElEX09QVF9WQUxVRSIsZnVuY3Rpb24obmFtZSx2YWx1ZSl7cmV0dXJuJ1RoZSB2YWx1ZSAiJyt2YWx1ZSsnIiBpcyBpbnZhbGlkIGZvciBvcHRpb24gIicrbmFtZSsnIid9LFR5cGVFcnJvcik7Y3JlYXRlRXJyb3JUeXBlKCJFUlJfSU5WQUxJRF9BUkdfVFlQRSIsZnVuY3Rpb24obmFtZSxleHBlY3RlZCxhY3R1YWwpe3ZhciBkZXRlcm1pbmVyO2lmKHR5cGVvZiBleHBlY3RlZD09PSJzdHJpbmciJiZzdGFydHNXaXRoKGV4cGVjdGVkLCJub3QgIikpe2RldGVybWluZXI9Im11c3Qgbm90IGJlIjtleHBlY3RlZD1leHBlY3RlZC5yZXBsYWNlKC9ebm90IC8sIiIpfWVsc2V7ZGV0ZXJtaW5lcj0ibXVzdCBiZSJ9dmFyIG1zZztpZihlbmRzV2l0aChuYW1lLCIgYXJndW1lbnQiKSl7bXNnPSJUaGUgIi5jb25jYXQobmFtZSwiICIpLmNvbmNhdChkZXRlcm1pbmVyLCIgIikuY29uY2F0KG9uZU9mKGV4cGVjdGVkLCJ0eXBlIikpfWVsc2V7dmFyIHR5cGU9aW5jbHVkZXMobmFtZSwiLiIpPyJwcm9wZXJ0eSI6ImFyZ3VtZW50Ijttc2c9J1RoZSAiJy5jb25jYXQobmFtZSwnIiAnKS5jb25jYXQodHlwZSwiICIpLmNvbmNhdChkZXRlcm1pbmVyLCIgIikuY29uY2F0KG9uZU9mKGV4cGVjdGVkLCJ0eXBlIikpfW1zZys9Ii4gUmVjZWl2ZWQgdHlwZSAiLmNvbmNhdCh0eXBlb2YgYWN0dWFsKTtyZXR1cm4gbXNnfSxUeXBlRXJyb3IpO2NyZWF0ZUVycm9yVHlwZSgiRVJSX1NUUkVBTV9QVVNIX0FGVEVSX0VPRiIsInN0cmVhbS5wdXNoKCkgYWZ0ZXIgRU9GIik7Y3JlYXRlRXJyb3JUeXBlKCJFUlJfTUVUSE9EX05PVF9JTVBMRU1FTlRFRCIsZnVuY3Rpb24obmFtZSl7cmV0dXJuIlRoZSAiK25hbWUrIiBtZXRob2QgaXMgbm90IGltcGxlbWVudGVkIn0pO2NyZWF0ZUVycm9yVHlwZSgiRVJSX1NUUkVBTV9QUkVNQVRVUkVfQ0xPU0UiLCJQcmVtYXR1cmUgY2xvc2UiKTtjcmVhdGVFcnJvclR5cGUoIkVSUl9TVFJFQU1fREVTVFJPWUVEIixmdW5jdGlvbihuYW1lKXtyZXR1cm4iQ2Fubm90IGNhbGwgIituYW1lKyIgYWZ0ZXIgYSBzdHJlYW0gd2FzIGRlc3Ryb3llZCJ9KTtjcmVhdGVFcnJvclR5cGUoIkVSUl9NVUxUSVBMRV9DQUxMQkFDSyIsIkNhbGxiYWNrIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyIpO2NyZWF0ZUVycm9yVHlwZSgiRVJSX1NUUkVBTV9DQU5OT1RfUElQRSIsIkNhbm5vdCBwaXBlLCBub3QgcmVhZGFibGUiKTtjcmVhdGVFcnJvclR5cGUoIkVSUl9TVFJFQU1fV1JJVEVfQUZURVJfRU5EIiwid3JpdGUgYWZ0ZXIgZW5kIik7Y3JlYXRlRXJyb3JUeXBlKCJFUlJfU1RSRUFNX05VTExfVkFMVUVTIiwiTWF5IG5vdCB3cml0ZSBudWxsIHZhbHVlcyB0byBzdHJlYW0iLFR5cGVFcnJvcik7Y3JlYXRlRXJyb3JUeXBlKCJFUlJfVU5LTk9XTl9FTkNPRElORyIsZnVuY3Rpb24oYXJnKXtyZXR1cm4iVW5rbm93biBlbmNvZGluZzogIithcmd9LFR5cGVFcnJvcik7Y3JlYXRlRXJyb3JUeXBlKCJFUlJfU1RSRUFNX1VOU0hJRlRfQUZURVJfRU5EX0VWRU5UIiwic3RyZWFtLnVuc2hpZnQoKSBhZnRlciBlbmQgZXZlbnQiKTttb2R1bGUuZXhwb3J0cy5jb2Rlcz1jb2Rlc30se31dLDY4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24ocHJvY2Vzcyl7InVzZSBzdHJpY3QiO3ZhciBvYmplY3RLZXlzPU9iamVjdC5rZXlzfHxmdW5jdGlvbihvYmope3ZhciBrZXlzPVtdO2Zvcih2YXIga2V5IGluIG9iail7a2V5cy5wdXNoKGtleSl9cmV0dXJuIGtleXN9O21vZHVsZS5leHBvcnRzPUR1cGxleDt2YXIgUmVhZGFibGU9cmVxdWlyZSgiLi9fc3RyZWFtX3JlYWRhYmxlIik7dmFyIFdyaXRhYmxlPXJlcXVpcmUoIi4vX3N0cmVhbV93cml0YWJsZSIpO3JlcXVpcmUoImluaGVyaXRzIikoRHVwbGV4LFJlYWRhYmxlKTt7dmFyIGtleXM9b2JqZWN0S2V5cyhXcml0YWJsZS5wcm90b3R5cGUpO2Zvcih2YXIgdj0wO3Y8a2V5cy5sZW5ndGg7disrKXt2YXIgbWV0aG9kPWtleXNbdl07aWYoIUR1cGxleC5wcm90b3R5cGVbbWV0aG9kXSlEdXBsZXgucHJvdG90eXBlW21ldGhvZF09V3JpdGFibGUucHJvdG90eXBlW21ldGhvZF19fWZ1bmN0aW9uIER1cGxleChvcHRpb25zKXtpZighKHRoaXMgaW5zdGFuY2VvZiBEdXBsZXgpKXJldHVybiBuZXcgRHVwbGV4KG9wdGlvbnMpO1JlYWRhYmxlLmNhbGwodGhpcyxvcHRpb25zKTtXcml0YWJsZS5jYWxsKHRoaXMsb3B0aW9ucyk7dGhpcy5hbGxvd0hhbGZPcGVuPXRydWU7aWYob3B0aW9ucyl7aWYob3B0aW9ucy5yZWFkYWJsZT09PWZhbHNlKXRoaXMucmVhZGFibGU9ZmFsc2U7aWYob3B0aW9ucy53cml0YWJsZT09PWZhbHNlKXRoaXMud3JpdGFibGU9ZmFsc2U7aWYob3B0aW9ucy5hbGxvd0hhbGZPcGVuPT09ZmFsc2Upe3RoaXMuYWxsb3dIYWxmT3Blbj1mYWxzZTt0aGlzLm9uY2UoImVuZCIsb25lbmQpfX19T2JqZWN0LmRlZmluZVByb3BlcnR5KER1cGxleC5wcm90b3R5cGUsIndyaXRhYmxlSGlnaFdhdGVyTWFyayIse2VudW1lcmFibGU6ZmFsc2UsZ2V0OmZ1bmN0aW9uIGdldCgpe3JldHVybiB0aGlzLl93cml0YWJsZVN0YXRlLmhpZ2hXYXRlck1hcmt9fSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KER1cGxleC5wcm90b3R5cGUsIndyaXRhYmxlQnVmZmVyIix7ZW51bWVyYWJsZTpmYWxzZSxnZXQ6ZnVuY3Rpb24gZ2V0KCl7cmV0dXJuIHRoaXMuX3dyaXRhYmxlU3RhdGUmJnRoaXMuX3dyaXRhYmxlU3RhdGUuZ2V0QnVmZmVyKCl9fSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KER1cGxleC5wcm90b3R5cGUsIndyaXRhYmxlTGVuZ3RoIix7ZW51bWVyYWJsZTpmYWxzZSxnZXQ6ZnVuY3Rpb24gZ2V0KCl7cmV0dXJuIHRoaXMuX3dyaXRhYmxlU3RhdGUubGVuZ3RofX0pO2Z1bmN0aW9uIG9uZW5kKCl7aWYodGhpcy5fd3JpdGFibGVTdGF0ZS5lbmRlZClyZXR1cm47cHJvY2Vzcy5uZXh0VGljayhvbkVuZE5ULHRoaXMpfWZ1bmN0aW9uIG9uRW5kTlQoc2VsZil7c2VsZi5lbmQoKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoRHVwbGV4LnByb3RvdHlwZSwiZGVzdHJveWVkIix7ZW51bWVyYWJsZTpmYWxzZSxnZXQ6ZnVuY3Rpb24gZ2V0KCl7aWYodGhpcy5fcmVhZGFibGVTdGF0ZT09PXVuZGVmaW5lZHx8dGhpcy5fd3JpdGFibGVTdGF0ZT09PXVuZGVmaW5lZCl7cmV0dXJuIGZhbHNlfXJldHVybiB0aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZCYmdGhpcy5fd3JpdGFibGVTdGF0ZS5kZXN0cm95ZWR9LHNldDpmdW5jdGlvbiBzZXQodmFsdWUpe2lmKHRoaXMuX3JlYWRhYmxlU3RhdGU9PT11bmRlZmluZWR8fHRoaXMuX3dyaXRhYmxlU3RhdGU9PT11bmRlZmluZWQpe3JldHVybn10aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZD12YWx1ZTt0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZD12YWx1ZX19KX0pLmNhbGwodGhpcyxyZXF1aXJlKCJfcHJvY2VzcyIpKX0seyIuL19zdHJlYW1fcmVhZGFibGUiOjcwLCIuL19zdHJlYW1fd3JpdGFibGUiOjcyLF9wcm9jZXNzOjY2LGluaGVyaXRzOjM2fV0sNjk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyJ1c2Ugc3RyaWN0Ijttb2R1bGUuZXhwb3J0cz1QYXNzVGhyb3VnaDt2YXIgVHJhbnNmb3JtPXJlcXVpcmUoIi4vX3N0cmVhbV90cmFuc2Zvcm0iKTtyZXF1aXJlKCJpbmhlcml0cyIpKFBhc3NUaHJvdWdoLFRyYW5zZm9ybSk7ZnVuY3Rpb24gUGFzc1Rocm91Z2gob3B0aW9ucyl7aWYoISh0aGlzIGluc3RhbmNlb2YgUGFzc1Rocm91Z2gpKXJldHVybiBuZXcgUGFzc1Rocm91Z2gob3B0aW9ucyk7VHJhbnNmb3JtLmNhbGwodGhpcyxvcHRpb25zKX1QYXNzVGhyb3VnaC5wcm90b3R5cGUuX3RyYW5zZm9ybT1mdW5jdGlvbihjaHVuayxlbmNvZGluZyxjYil7Y2IobnVsbCxjaHVuayl9fSx7Ii4vX3N0cmVhbV90cmFuc2Zvcm0iOjcxLGluaGVyaXRzOjM2fV0sNzA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihwcm9jZXNzLGdsb2JhbCl7InVzZSBzdHJpY3QiO21vZHVsZS5leHBvcnRzPVJlYWRhYmxlO3ZhciBEdXBsZXg7UmVhZGFibGUuUmVhZGFibGVTdGF0ZT1SZWFkYWJsZVN0YXRlO3ZhciBFRT1yZXF1aXJlKCJldmVudHMiKS5FdmVudEVtaXR0ZXI7dmFyIEVFbGlzdGVuZXJDb3VudD1mdW5jdGlvbiBFRWxpc3RlbmVyQ291bnQoZW1pdHRlcix0eXBlKXtyZXR1cm4gZW1pdHRlci5saXN0ZW5lcnModHlwZSkubGVuZ3RofTt2YXIgU3RyZWFtPXJlcXVpcmUoIi4vaW50ZXJuYWwvc3RyZWFtcy9zdHJlYW0iKTt2YXIgQnVmZmVyPXJlcXVpcmUoImJ1ZmZlciIpLkJ1ZmZlcjt2YXIgT3VyVWludDhBcnJheT1nbG9iYWwuVWludDhBcnJheXx8ZnVuY3Rpb24oKXt9O2Z1bmN0aW9uIF91aW50OEFycmF5VG9CdWZmZXIoY2h1bmspe3JldHVybiBCdWZmZXIuZnJvbShjaHVuayl9ZnVuY3Rpb24gX2lzVWludDhBcnJheShvYmope3JldHVybiBCdWZmZXIuaXNCdWZmZXIob2JqKXx8b2JqIGluc3RhbmNlb2YgT3VyVWludDhBcnJheX12YXIgZGVidWdVdGlsPXJlcXVpcmUoInV0aWwiKTt2YXIgZGVidWc7aWYoZGVidWdVdGlsJiZkZWJ1Z1V0aWwuZGVidWdsb2cpe2RlYnVnPWRlYnVnVXRpbC5kZWJ1Z2xvZygic3RyZWFtIil9ZWxzZXtkZWJ1Zz1mdW5jdGlvbiBkZWJ1Zygpe319dmFyIEJ1ZmZlckxpc3Q9cmVxdWlyZSgiLi9pbnRlcm5hbC9zdHJlYW1zL2J1ZmZlcl9saXN0Iik7dmFyIGRlc3Ryb3lJbXBsPXJlcXVpcmUoIi4vaW50ZXJuYWwvc3RyZWFtcy9kZXN0cm95Iik7dmFyIF9yZXF1aXJlPXJlcXVpcmUoIi4vaW50ZXJuYWwvc3RyZWFtcy9zdGF0ZSIpLGdldEhpZ2hXYXRlck1hcms9X3JlcXVpcmUuZ2V0SGlnaFdhdGVyTWFyazt2YXIgX3JlcXVpcmUkY29kZXM9cmVxdWlyZSgiLi4vZXJyb3JzIikuY29kZXMsRVJSX0lOVkFMSURfQVJHX1RZUEU9X3JlcXVpcmUkY29kZXMuRVJSX0lOVkFMSURfQVJHX1RZUEUsRVJSX1NUUkVBTV9QVVNIX0FGVEVSX0VPRj1fcmVxdWlyZSRjb2Rlcy5FUlJfU1RSRUFNX1BVU0hfQUZURVJfRU9GLEVSUl9NRVRIT0RfTk9UX0lNUExFTUVOVEVEPV9yZXF1aXJlJGNvZGVzLkVSUl9NRVRIT0RfTk9UX0lNUExFTUVOVEVELEVSUl9TVFJFQU1fVU5TSElGVF9BRlRFUl9FTkRfRVZFTlQ9X3JlcXVpcmUkY29kZXMuRVJSX1NUUkVBTV9VTlNISUZUX0FGVEVSX0VORF9FVkVOVDt2YXIgU3RyaW5nRGVjb2Rlcjt2YXIgY3JlYXRlUmVhZGFibGVTdHJlYW1Bc3luY0l0ZXJhdG9yO3ZhciBmcm9tO3JlcXVpcmUoImluaGVyaXRzIikoUmVhZGFibGUsU3RyZWFtKTt2YXIgZXJyb3JPckRlc3Ryb3k9ZGVzdHJveUltcGwuZXJyb3JPckRlc3Ryb3k7dmFyIGtQcm94eUV2ZW50cz1bImVycm9yIiwiY2xvc2UiLCJkZXN0cm95IiwicGF1c2UiLCJyZXN1bWUiXTtmdW5jdGlvbiBwcmVwZW5kTGlzdGVuZXIoZW1pdHRlcixldmVudCxmbil7aWYodHlwZW9mIGVtaXR0ZXIucHJlcGVuZExpc3RlbmVyPT09ImZ1bmN0aW9uIilyZXR1cm4gZW1pdHRlci5wcmVwZW5kTGlzdGVuZXIoZXZlbnQsZm4pO2lmKCFlbWl0dGVyLl9ldmVudHN8fCFlbWl0dGVyLl9ldmVudHNbZXZlbnRdKWVtaXR0ZXIub24oZXZlbnQsZm4pO2Vsc2UgaWYoQXJyYXkuaXNBcnJheShlbWl0dGVyLl9ldmVudHNbZXZlbnRdKSllbWl0dGVyLl9ldmVudHNbZXZlbnRdLnVuc2hpZnQoZm4pO2Vsc2UgZW1pdHRlci5fZXZlbnRzW2V2ZW50XT1bZm4sZW1pdHRlci5fZXZlbnRzW2V2ZW50XV19ZnVuY3Rpb24gUmVhZGFibGVTdGF0ZShvcHRpb25zLHN0cmVhbSxpc0R1cGxleCl7RHVwbGV4PUR1cGxleHx8cmVxdWlyZSgiLi9fc3RyZWFtX2R1cGxleCIpO29wdGlvbnM9b3B0aW9uc3x8e307aWYodHlwZW9mIGlzRHVwbGV4IT09ImJvb2xlYW4iKWlzRHVwbGV4PXN0cmVhbSBpbnN0YW5jZW9mIER1cGxleDt0aGlzLm9iamVjdE1vZGU9ISFvcHRpb25zLm9iamVjdE1vZGU7aWYoaXNEdXBsZXgpdGhpcy5vYmplY3RNb2RlPXRoaXMub2JqZWN0TW9kZXx8ISFvcHRpb25zLnJlYWRhYmxlT2JqZWN0TW9kZTt0aGlzLmhpZ2hXYXRlck1hcms9Z2V0SGlnaFdhdGVyTWFyayh0aGlzLG9wdGlvbnMsInJlYWRhYmxlSGlnaFdhdGVyTWFyayIsaXNEdXBsZXgpO3RoaXMuYnVmZmVyPW5ldyBCdWZmZXJMaXN0O3RoaXMubGVuZ3RoPTA7dGhpcy5waXBlcz1udWxsO3RoaXMucGlwZXNDb3VudD0wO3RoaXMuZmxvd2luZz1udWxsO3RoaXMuZW5kZWQ9ZmFsc2U7dGhpcy5lbmRFbWl0dGVkPWZhbHNlO3RoaXMucmVhZGluZz1mYWxzZTt0aGlzLnN5bmM9dHJ1ZTt0aGlzLm5lZWRSZWFkYWJsZT1mYWxzZTt0aGlzLmVtaXR0ZWRSZWFkYWJsZT1mYWxzZTt0aGlzLnJlYWRhYmxlTGlzdGVuaW5nPWZhbHNlO3RoaXMucmVzdW1lU2NoZWR1bGVkPWZhbHNlO3RoaXMucGF1c2VkPXRydWU7dGhpcy5lbWl0Q2xvc2U9b3B0aW9ucy5lbWl0Q2xvc2UhPT1mYWxzZTt0aGlzLmF1dG9EZXN0cm95PSEhb3B0aW9ucy5hdXRvRGVzdHJveTt0aGlzLmRlc3Ryb3llZD1mYWxzZTt0aGlzLmRlZmF1bHRFbmNvZGluZz1vcHRpb25zLmRlZmF1bHRFbmNvZGluZ3x8InV0ZjgiO3RoaXMuYXdhaXREcmFpbj0wO3RoaXMucmVhZGluZ01vcmU9ZmFsc2U7dGhpcy5kZWNvZGVyPW51bGw7dGhpcy5lbmNvZGluZz1udWxsO2lmKG9wdGlvbnMuZW5jb2Rpbmcpe2lmKCFTdHJpbmdEZWNvZGVyKVN0cmluZ0RlY29kZXI9cmVxdWlyZSgic3RyaW5nX2RlY29kZXIvIikuU3RyaW5nRGVjb2Rlcjt0aGlzLmRlY29kZXI9bmV3IFN0cmluZ0RlY29kZXIob3B0aW9ucy5lbmNvZGluZyk7dGhpcy5lbmNvZGluZz1vcHRpb25zLmVuY29kaW5nfX1mdW5jdGlvbiBSZWFkYWJsZShvcHRpb25zKXtEdXBsZXg9RHVwbGV4fHxyZXF1aXJlKCIuL19zdHJlYW1fZHVwbGV4Iik7aWYoISh0aGlzIGluc3RhbmNlb2YgUmVhZGFibGUpKXJldHVybiBuZXcgUmVhZGFibGUob3B0aW9ucyk7dmFyIGlzRHVwbGV4PXRoaXMgaW5zdGFuY2VvZiBEdXBsZXg7dGhpcy5fcmVhZGFibGVTdGF0ZT1uZXcgUmVhZGFibGVTdGF0ZShvcHRpb25zLHRoaXMsaXNEdXBsZXgpO3RoaXMucmVhZGFibGU9dHJ1ZTtpZihvcHRpb25zKXtpZih0eXBlb2Ygb3B0aW9ucy5yZWFkPT09ImZ1bmN0aW9uIil0aGlzLl9yZWFkPW9wdGlvbnMucmVhZDtpZih0eXBlb2Ygb3B0aW9ucy5kZXN0cm95PT09ImZ1bmN0aW9uIil0aGlzLl9kZXN0cm95PW9wdGlvbnMuZGVzdHJveX1TdHJlYW0uY2FsbCh0aGlzKX1PYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGUucHJvdG90eXBlLCJkZXN0cm95ZWQiLHtlbnVtZXJhYmxlOmZhbHNlLGdldDpmdW5jdGlvbiBnZXQoKXtpZih0aGlzLl9yZWFkYWJsZVN0YXRlPT09dW5kZWZpbmVkKXtyZXR1cm4gZmFsc2V9cmV0dXJuIHRoaXMuX3JlYWRhYmxlU3RhdGUuZGVzdHJveWVkfSxzZXQ6ZnVuY3Rpb24gc2V0KHZhbHVlKXtpZighdGhpcy5fcmVhZGFibGVTdGF0ZSl7cmV0dXJufXRoaXMuX3JlYWRhYmxlU3RhdGUuZGVzdHJveWVkPXZhbHVlfX0pO1JlYWRhYmxlLnByb3RvdHlwZS5kZXN0cm95PWRlc3Ryb3lJbXBsLmRlc3Ryb3k7UmVhZGFibGUucHJvdG90eXBlLl91bmRlc3Ryb3k9ZGVzdHJveUltcGwudW5kZXN0cm95O1JlYWRhYmxlLnByb3RvdHlwZS5fZGVzdHJveT1mdW5jdGlvbihlcnIsY2Ipe2NiKGVycil9O1JlYWRhYmxlLnByb3RvdHlwZS5wdXNoPWZ1bmN0aW9uKGNodW5rLGVuY29kaW5nKXt2YXIgc3RhdGU9dGhpcy5fcmVhZGFibGVTdGF0ZTt2YXIgc2tpcENodW5rQ2hlY2s7aWYoIXN0YXRlLm9iamVjdE1vZGUpe2lmKHR5cGVvZiBjaHVuaz09PSJzdHJpbmciKXtlbmNvZGluZz1lbmNvZGluZ3x8c3RhdGUuZGVmYXVsdEVuY29kaW5nO2lmKGVuY29kaW5nIT09c3RhdGUuZW5jb2Rpbmcpe2NodW5rPUJ1ZmZlci5mcm9tKGNodW5rLGVuY29kaW5nKTtlbmNvZGluZz0iIn1za2lwQ2h1bmtDaGVjaz10cnVlfX1lbHNle3NraXBDaHVua0NoZWNrPXRydWV9cmV0dXJuIHJlYWRhYmxlQWRkQ2h1bmsodGhpcyxjaHVuayxlbmNvZGluZyxmYWxzZSxza2lwQ2h1bmtDaGVjayl9O1JlYWRhYmxlLnByb3RvdHlwZS51bnNoaWZ0PWZ1bmN0aW9uKGNodW5rKXtyZXR1cm4gcmVhZGFibGVBZGRDaHVuayh0aGlzLGNodW5rLG51bGwsdHJ1ZSxmYWxzZSl9O2Z1bmN0aW9uIHJlYWRhYmxlQWRkQ2h1bmsoc3RyZWFtLGNodW5rLGVuY29kaW5nLGFkZFRvRnJvbnQsc2tpcENodW5rQ2hlY2spe2RlYnVnKCJyZWFkYWJsZUFkZENodW5rIixjaHVuayk7dmFyIHN0YXRlPXN0cmVhbS5fcmVhZGFibGVTdGF0ZTtpZihjaHVuaz09PW51bGwpe3N0YXRlLnJlYWRpbmc9ZmFsc2U7b25Fb2ZDaHVuayhzdHJlYW0sc3RhdGUpfWVsc2V7dmFyIGVyO2lmKCFza2lwQ2h1bmtDaGVjayllcj1jaHVua0ludmFsaWQoc3RhdGUsY2h1bmspO2lmKGVyKXtlcnJvck9yRGVzdHJveShzdHJlYW0sZXIpfWVsc2UgaWYoc3RhdGUub2JqZWN0TW9kZXx8Y2h1bmsmJmNodW5rLmxlbmd0aD4wKXtpZih0eXBlb2YgY2h1bmshPT0ic3RyaW5nIiYmIXN0YXRlLm9iamVjdE1vZGUmJk9iamVjdC5nZXRQcm90b3R5cGVPZihjaHVuaykhPT1CdWZmZXIucHJvdG90eXBlKXtjaHVuaz1fdWludDhBcnJheVRvQnVmZmVyKGNodW5rKX1pZihhZGRUb0Zyb250KXtpZihzdGF0ZS5lbmRFbWl0dGVkKWVycm9yT3JEZXN0cm95KHN0cmVhbSxuZXcgRVJSX1NUUkVBTV9VTlNISUZUX0FGVEVSX0VORF9FVkVOVCk7ZWxzZSBhZGRDaHVuayhzdHJlYW0sc3RhdGUsY2h1bmssdHJ1ZSl9ZWxzZSBpZihzdGF0ZS5lbmRlZCl7ZXJyb3JPckRlc3Ryb3koc3RyZWFtLG5ldyBFUlJfU1RSRUFNX1BVU0hfQUZURVJfRU9GKX1lbHNlIGlmKHN0YXRlLmRlc3Ryb3llZCl7cmV0dXJuIGZhbHNlfWVsc2V7c3RhdGUucmVhZGluZz1mYWxzZTtpZihzdGF0ZS5kZWNvZGVyJiYhZW5jb2Rpbmcpe2NodW5rPXN0YXRlLmRlY29kZXIud3JpdGUoY2h1bmspO2lmKHN0YXRlLm9iamVjdE1vZGV8fGNodW5rLmxlbmd0aCE9PTApYWRkQ2h1bmsoc3RyZWFtLHN0YXRlLGNodW5rLGZhbHNlKTtlbHNlIG1heWJlUmVhZE1vcmUoc3RyZWFtLHN0YXRlKX1lbHNle2FkZENodW5rKHN0cmVhbSxzdGF0ZSxjaHVuayxmYWxzZSl9fX1lbHNlIGlmKCFhZGRUb0Zyb250KXtzdGF0ZS5yZWFkaW5nPWZhbHNlO21heWJlUmVhZE1vcmUoc3RyZWFtLHN0YXRlKX19cmV0dXJuIXN0YXRlLmVuZGVkJiYoc3RhdGUubGVuZ3RoPHN0YXRlLmhpZ2hXYXRlck1hcmt8fHN0YXRlLmxlbmd0aD09PTApfWZ1bmN0aW9uIGFkZENodW5rKHN0cmVhbSxzdGF0ZSxjaHVuayxhZGRUb0Zyb250KXtpZihzdGF0ZS5mbG93aW5nJiZzdGF0ZS5sZW5ndGg9PT0wJiYhc3RhdGUuc3luYyl7c3RhdGUuYXdhaXREcmFpbj0wO3N0cmVhbS5lbWl0KCJkYXRhIixjaHVuayl9ZWxzZXtzdGF0ZS5sZW5ndGgrPXN0YXRlLm9iamVjdE1vZGU/MTpjaHVuay5sZW5ndGg7aWYoYWRkVG9Gcm9udClzdGF0ZS5idWZmZXIudW5zaGlmdChjaHVuayk7ZWxzZSBzdGF0ZS5idWZmZXIucHVzaChjaHVuayk7aWYoc3RhdGUubmVlZFJlYWRhYmxlKWVtaXRSZWFkYWJsZShzdHJlYW0pfW1heWJlUmVhZE1vcmUoc3RyZWFtLHN0YXRlKX1mdW5jdGlvbiBjaHVua0ludmFsaWQoc3RhdGUsY2h1bmspe3ZhciBlcjtpZighX2lzVWludDhBcnJheShjaHVuaykmJnR5cGVvZiBjaHVuayE9PSJzdHJpbmciJiZjaHVuayE9PXVuZGVmaW5lZCYmIXN0YXRlLm9iamVjdE1vZGUpe2VyPW5ldyBFUlJfSU5WQUxJRF9BUkdfVFlQRSgiY2h1bmsiLFsic3RyaW5nIiwiQnVmZmVyIiwiVWludDhBcnJheSJdLGNodW5rKX1yZXR1cm4gZXJ9UmVhZGFibGUucHJvdG90eXBlLmlzUGF1c2VkPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZz09PWZhbHNlfTtSZWFkYWJsZS5wcm90b3R5cGUuc2V0RW5jb2Rpbmc9ZnVuY3Rpb24oZW5jKXtpZighU3RyaW5nRGVjb2RlcilTdHJpbmdEZWNvZGVyPXJlcXVpcmUoInN0cmluZ19kZWNvZGVyLyIpLlN0cmluZ0RlY29kZXI7dmFyIGRlY29kZXI9bmV3IFN0cmluZ0RlY29kZXIoZW5jKTt0aGlzLl9yZWFkYWJsZVN0YXRlLmRlY29kZXI9ZGVjb2Rlcjt0aGlzLl9yZWFkYWJsZVN0YXRlLmVuY29kaW5nPXRoaXMuX3JlYWRhYmxlU3RhdGUuZGVjb2Rlci5lbmNvZGluZzt2YXIgcD10aGlzLl9yZWFkYWJsZVN0YXRlLmJ1ZmZlci5oZWFkO3ZhciBjb250ZW50PSIiO3doaWxlKHAhPT1udWxsKXtjb250ZW50Kz1kZWNvZGVyLndyaXRlKHAuZGF0YSk7cD1wLm5leHR9dGhpcy5fcmVhZGFibGVTdGF0ZS5idWZmZXIuY2xlYXIoKTtpZihjb250ZW50IT09IiIpdGhpcy5fcmVhZGFibGVTdGF0ZS5idWZmZXIucHVzaChjb250ZW50KTt0aGlzLl9yZWFkYWJsZVN0YXRlLmxlbmd0aD1jb250ZW50Lmxlbmd0aDtyZXR1cm4gdGhpc307dmFyIE1BWF9IV009MTA3Mzc0MTgyNDtmdW5jdGlvbiBjb21wdXRlTmV3SGlnaFdhdGVyTWFyayhuKXtpZihuPj1NQVhfSFdNKXtuPU1BWF9IV019ZWxzZXtuLS07bnw9bj4+PjE7bnw9bj4+PjI7bnw9bj4+PjQ7bnw9bj4+Pjg7bnw9bj4+PjE2O24rK31yZXR1cm4gbn1mdW5jdGlvbiBob3dNdWNoVG9SZWFkKG4sc3RhdGUpe2lmKG48PTB8fHN0YXRlLmxlbmd0aD09PTAmJnN0YXRlLmVuZGVkKXJldHVybiAwO2lmKHN0YXRlLm9iamVjdE1vZGUpcmV0dXJuIDE7aWYobiE9PW4pe2lmKHN0YXRlLmZsb3dpbmcmJnN0YXRlLmxlbmd0aClyZXR1cm4gc3RhdGUuYnVmZmVyLmhlYWQuZGF0YS5sZW5ndGg7ZWxzZSByZXR1cm4gc3RhdGUubGVuZ3RofWlmKG4+c3RhdGUuaGlnaFdhdGVyTWFyaylzdGF0ZS5oaWdoV2F0ZXJNYXJrPWNvbXB1dGVOZXdIaWdoV2F0ZXJNYXJrKG4pO2lmKG48PXN0YXRlLmxlbmd0aClyZXR1cm4gbjtpZighc3RhdGUuZW5kZWQpe3N0YXRlLm5lZWRSZWFkYWJsZT10cnVlO3JldHVybiAwfXJldHVybiBzdGF0ZS5sZW5ndGh9UmVhZGFibGUucHJvdG90eXBlLnJlYWQ9ZnVuY3Rpb24obil7ZGVidWcoInJlYWQiLG4pO249cGFyc2VJbnQobiwxMCk7dmFyIHN0YXRlPXRoaXMuX3JlYWRhYmxlU3RhdGU7dmFyIG5PcmlnPW47aWYobiE9PTApc3RhdGUuZW1pdHRlZFJlYWRhYmxlPWZhbHNlO2lmKG49PT0wJiZzdGF0ZS5uZWVkUmVhZGFibGUmJigoc3RhdGUuaGlnaFdhdGVyTWFyayE9PTA/c3RhdGUubGVuZ3RoPj1zdGF0ZS5oaWdoV2F0ZXJNYXJrOnN0YXRlLmxlbmd0aD4wKXx8c3RhdGUuZW5kZWQpKXtkZWJ1ZygicmVhZDogZW1pdFJlYWRhYmxlIixzdGF0ZS5sZW5ndGgsc3RhdGUuZW5kZWQpO2lmKHN0YXRlLmxlbmd0aD09PTAmJnN0YXRlLmVuZGVkKWVuZFJlYWRhYmxlKHRoaXMpO2Vsc2UgZW1pdFJlYWRhYmxlKHRoaXMpO3JldHVybiBudWxsfW49aG93TXVjaFRvUmVhZChuLHN0YXRlKTtpZihuPT09MCYmc3RhdGUuZW5kZWQpe2lmKHN0YXRlLmxlbmd0aD09PTApZW5kUmVhZGFibGUodGhpcyk7cmV0dXJuIG51bGx9dmFyIGRvUmVhZD1zdGF0ZS5uZWVkUmVhZGFibGU7ZGVidWcoIm5lZWQgcmVhZGFibGUiLGRvUmVhZCk7aWYoc3RhdGUubGVuZ3RoPT09MHx8c3RhdGUubGVuZ3RoLW48c3RhdGUuaGlnaFdhdGVyTWFyayl7ZG9SZWFkPXRydWU7ZGVidWcoImxlbmd0aCBsZXNzIHRoYW4gd2F0ZXJtYXJrIixkb1JlYWQpfWlmKHN0YXRlLmVuZGVkfHxzdGF0ZS5yZWFkaW5nKXtkb1JlYWQ9ZmFsc2U7ZGVidWcoInJlYWRpbmcgb3IgZW5kZWQiLGRvUmVhZCl9ZWxzZSBpZihkb1JlYWQpe2RlYnVnKCJkbyByZWFkIik7c3RhdGUucmVhZGluZz10cnVlO3N0YXRlLnN5bmM9dHJ1ZTtpZihzdGF0ZS5sZW5ndGg9PT0wKXN0YXRlLm5lZWRSZWFkYWJsZT10cnVlO3RoaXMuX3JlYWQoc3RhdGUuaGlnaFdhdGVyTWFyayk7c3RhdGUuc3luYz1mYWxzZTtpZighc3RhdGUucmVhZGluZyluPWhvd011Y2hUb1JlYWQobk9yaWcsc3RhdGUpfXZhciByZXQ7aWYobj4wKXJldD1mcm9tTGlzdChuLHN0YXRlKTtlbHNlIHJldD1udWxsO2lmKHJldD09PW51bGwpe3N0YXRlLm5lZWRSZWFkYWJsZT1zdGF0ZS5sZW5ndGg8PXN0YXRlLmhpZ2hXYXRlck1hcms7bj0wfWVsc2V7c3RhdGUubGVuZ3RoLT1uO3N0YXRlLmF3YWl0RHJhaW49MH1pZihzdGF0ZS5sZW5ndGg9PT0wKXtpZighc3RhdGUuZW5kZWQpc3RhdGUubmVlZFJlYWRhYmxlPXRydWU7aWYobk9yaWchPT1uJiZzdGF0ZS5lbmRlZCllbmRSZWFkYWJsZSh0aGlzKX1pZihyZXQhPT1udWxsKXRoaXMuZW1pdCgiZGF0YSIscmV0KTtyZXR1cm4gcmV0fTtmdW5jdGlvbiBvbkVvZkNodW5rKHN0cmVhbSxzdGF0ZSl7ZGVidWcoIm9uRW9mQ2h1bmsiKTtpZihzdGF0ZS5lbmRlZClyZXR1cm47aWYoc3RhdGUuZGVjb2Rlcil7dmFyIGNodW5rPXN0YXRlLmRlY29kZXIuZW5kKCk7aWYoY2h1bmsmJmNodW5rLmxlbmd0aCl7c3RhdGUuYnVmZmVyLnB1c2goY2h1bmspO3N0YXRlLmxlbmd0aCs9c3RhdGUub2JqZWN0TW9kZT8xOmNodW5rLmxlbmd0aH19c3RhdGUuZW5kZWQ9dHJ1ZTtpZihzdGF0ZS5zeW5jKXtlbWl0UmVhZGFibGUoc3RyZWFtKX1lbHNle3N0YXRlLm5lZWRSZWFkYWJsZT1mYWxzZTtpZighc3RhdGUuZW1pdHRlZFJlYWRhYmxlKXtzdGF0ZS5lbWl0dGVkUmVhZGFibGU9dHJ1ZTtlbWl0UmVhZGFibGVfKHN0cmVhbSl9fX1mdW5jdGlvbiBlbWl0UmVhZGFibGUoc3RyZWFtKXt2YXIgc3RhdGU9c3RyZWFtLl9yZWFkYWJsZVN0YXRlO2RlYnVnKCJlbWl0UmVhZGFibGUiLHN0YXRlLm5lZWRSZWFkYWJsZSxzdGF0ZS5lbWl0dGVkUmVhZGFibGUpO3N0YXRlLm5lZWRSZWFkYWJsZT1mYWxzZTtpZighc3RhdGUuZW1pdHRlZFJlYWRhYmxlKXtkZWJ1ZygiZW1pdFJlYWRhYmxlIixzdGF0ZS5mbG93aW5nKTtzdGF0ZS5lbWl0dGVkUmVhZGFibGU9dHJ1ZTtwcm9jZXNzLm5leHRUaWNrKGVtaXRSZWFkYWJsZV8sc3RyZWFtKX19ZnVuY3Rpb24gZW1pdFJlYWRhYmxlXyhzdHJlYW0pe3ZhciBzdGF0ZT1zdHJlYW0uX3JlYWRhYmxlU3RhdGU7ZGVidWcoImVtaXRSZWFkYWJsZV8iLHN0YXRlLmRlc3Ryb3llZCxzdGF0ZS5sZW5ndGgsc3RhdGUuZW5kZWQpO2lmKCFzdGF0ZS5kZXN0cm95ZWQmJihzdGF0ZS5sZW5ndGh8fHN0YXRlLmVuZGVkKSl7c3RyZWFtLmVtaXQoInJlYWRhYmxlIik7c3RhdGUuZW1pdHRlZFJlYWRhYmxlPWZhbHNlfXN0YXRlLm5lZWRSZWFkYWJsZT0hc3RhdGUuZmxvd2luZyYmIXN0YXRlLmVuZGVkJiZzdGF0ZS5sZW5ndGg8PXN0YXRlLmhpZ2hXYXRlck1hcms7ZmxvdyhzdHJlYW0pfWZ1bmN0aW9uIG1heWJlUmVhZE1vcmUoc3RyZWFtLHN0YXRlKXtpZighc3RhdGUucmVhZGluZ01vcmUpe3N0YXRlLnJlYWRpbmdNb3JlPXRydWU7cHJvY2Vzcy5uZXh0VGljayhtYXliZVJlYWRNb3JlXyxzdHJlYW0sc3RhdGUpfX1mdW5jdGlvbiBtYXliZVJlYWRNb3JlXyhzdHJlYW0sc3RhdGUpe3doaWxlKCFzdGF0ZS5yZWFkaW5nJiYhc3RhdGUuZW5kZWQmJihzdGF0ZS5sZW5ndGg8c3RhdGUuaGlnaFdhdGVyTWFya3x8c3RhdGUuZmxvd2luZyYmc3RhdGUubGVuZ3RoPT09MCkpe3ZhciBsZW49c3RhdGUubGVuZ3RoO2RlYnVnKCJtYXliZVJlYWRNb3JlIHJlYWQgMCIpO3N0cmVhbS5yZWFkKDApO2lmKGxlbj09PXN0YXRlLmxlbmd0aClicmVha31zdGF0ZS5yZWFkaW5nTW9yZT1mYWxzZX1SZWFkYWJsZS5wcm90b3R5cGUuX3JlYWQ9ZnVuY3Rpb24obil7ZXJyb3JPckRlc3Ryb3kodGhpcyxuZXcgRVJSX01FVEhPRF9OT1RfSU1QTEVNRU5URUQoIl9yZWFkKCkiKSl9O1JlYWRhYmxlLnByb3RvdHlwZS5waXBlPWZ1bmN0aW9uKGRlc3QscGlwZU9wdHMpe3ZhciBzcmM9dGhpczt2YXIgc3RhdGU9dGhpcy5fcmVhZGFibGVTdGF0ZTtzd2l0Y2goc3RhdGUucGlwZXNDb3VudCl7Y2FzZSAwOnN0YXRlLnBpcGVzPWRlc3Q7YnJlYWs7Y2FzZSAxOnN0YXRlLnBpcGVzPVtzdGF0ZS5waXBlcyxkZXN0XTticmVhaztkZWZhdWx0OnN0YXRlLnBpcGVzLnB1c2goZGVzdCk7YnJlYWt9c3RhdGUucGlwZXNDb3VudCs9MTtkZWJ1ZygicGlwZSBjb3VudD0lZCBvcHRzPSVqIixzdGF0ZS5waXBlc0NvdW50LHBpcGVPcHRzKTt2YXIgZG9FbmQ9KCFwaXBlT3B0c3x8cGlwZU9wdHMuZW5kIT09ZmFsc2UpJiZkZXN0IT09cHJvY2Vzcy5zdGRvdXQmJmRlc3QhPT1wcm9jZXNzLnN0ZGVycjt2YXIgZW5kRm49ZG9FbmQ/b25lbmQ6dW5waXBlO2lmKHN0YXRlLmVuZEVtaXR0ZWQpcHJvY2Vzcy5uZXh0VGljayhlbmRGbik7ZWxzZSBzcmMub25jZSgiZW5kIixlbmRGbik7ZGVzdC5vbigidW5waXBlIixvbnVucGlwZSk7ZnVuY3Rpb24gb251bnBpcGUocmVhZGFibGUsdW5waXBlSW5mbyl7ZGVidWcoIm9udW5waXBlIik7aWYocmVhZGFibGU9PT1zcmMpe2lmKHVucGlwZUluZm8mJnVucGlwZUluZm8uaGFzVW5waXBlZD09PWZhbHNlKXt1bnBpcGVJbmZvLmhhc1VucGlwZWQ9dHJ1ZTtjbGVhbnVwKCl9fX1mdW5jdGlvbiBvbmVuZCgpe2RlYnVnKCJvbmVuZCIpO2Rlc3QuZW5kKCl9dmFyIG9uZHJhaW49cGlwZU9uRHJhaW4oc3JjKTtkZXN0Lm9uKCJkcmFpbiIsb25kcmFpbik7dmFyIGNsZWFuZWRVcD1mYWxzZTtmdW5jdGlvbiBjbGVhbnVwKCl7ZGVidWcoImNsZWFudXAiKTtkZXN0LnJlbW92ZUxpc3RlbmVyKCJjbG9zZSIsb25jbG9zZSk7ZGVzdC5yZW1vdmVMaXN0ZW5lcigiZmluaXNoIixvbmZpbmlzaCk7ZGVzdC5yZW1vdmVMaXN0ZW5lcigiZHJhaW4iLG9uZHJhaW4pO2Rlc3QucmVtb3ZlTGlzdGVuZXIoImVycm9yIixvbmVycm9yKTtkZXN0LnJlbW92ZUxpc3RlbmVyKCJ1bnBpcGUiLG9udW5waXBlKTtzcmMucmVtb3ZlTGlzdGVuZXIoImVuZCIsb25lbmQpO3NyYy5yZW1vdmVMaXN0ZW5lcigiZW5kIix1bnBpcGUpO3NyYy5yZW1vdmVMaXN0ZW5lcigiZGF0YSIsb25kYXRhKTtjbGVhbmVkVXA9dHJ1ZTtpZihzdGF0ZS5hd2FpdERyYWluJiYoIWRlc3QuX3dyaXRhYmxlU3RhdGV8fGRlc3QuX3dyaXRhYmxlU3RhdGUubmVlZERyYWluKSlvbmRyYWluKCl9c3JjLm9uKCJkYXRhIixvbmRhdGEpO2Z1bmN0aW9uIG9uZGF0YShjaHVuayl7ZGVidWcoIm9uZGF0YSIpO3ZhciByZXQ9ZGVzdC53cml0ZShjaHVuayk7ZGVidWcoImRlc3Qud3JpdGUiLHJldCk7aWYocmV0PT09ZmFsc2Upe2lmKChzdGF0ZS5waXBlc0NvdW50PT09MSYmc3RhdGUucGlwZXM9PT1kZXN0fHxzdGF0ZS5waXBlc0NvdW50PjEmJmluZGV4T2Yoc3RhdGUucGlwZXMsZGVzdCkhPT0tMSkmJiFjbGVhbmVkVXApe2RlYnVnKCJmYWxzZSB3cml0ZSByZXNwb25zZSwgcGF1c2UiLHN0YXRlLmF3YWl0RHJhaW4pO3N0YXRlLmF3YWl0RHJhaW4rK31zcmMucGF1c2UoKX19ZnVuY3Rpb24gb25lcnJvcihlcil7ZGVidWcoIm9uZXJyb3IiLGVyKTt1bnBpcGUoKTtkZXN0LnJlbW92ZUxpc3RlbmVyKCJlcnJvciIsb25lcnJvcik7aWYoRUVsaXN0ZW5lckNvdW50KGRlc3QsImVycm9yIik9PT0wKWVycm9yT3JEZXN0cm95KGRlc3QsZXIpfXByZXBlbmRMaXN0ZW5lcihkZXN0LCJlcnJvciIsb25lcnJvcik7ZnVuY3Rpb24gb25jbG9zZSgpe2Rlc3QucmVtb3ZlTGlzdGVuZXIoImZpbmlzaCIsb25maW5pc2gpO3VucGlwZSgpfWRlc3Qub25jZSgiY2xvc2UiLG9uY2xvc2UpO2Z1bmN0aW9uIG9uZmluaXNoKCl7ZGVidWcoIm9uZmluaXNoIik7ZGVzdC5yZW1vdmVMaXN0ZW5lcigiY2xvc2UiLG9uY2xvc2UpO3VucGlwZSgpfWRlc3Qub25jZSgiZmluaXNoIixvbmZpbmlzaCk7ZnVuY3Rpb24gdW5waXBlKCl7ZGVidWcoInVucGlwZSIpO3NyYy51bnBpcGUoZGVzdCl9ZGVzdC5lbWl0KCJwaXBlIixzcmMpO2lmKCFzdGF0ZS5mbG93aW5nKXtkZWJ1ZygicGlwZSByZXN1bWUiKTtzcmMucmVzdW1lKCl9cmV0dXJuIGRlc3R9O2Z1bmN0aW9uIHBpcGVPbkRyYWluKHNyYyl7cmV0dXJuIGZ1bmN0aW9uIHBpcGVPbkRyYWluRnVuY3Rpb25SZXN1bHQoKXt2YXIgc3RhdGU9c3JjLl9yZWFkYWJsZVN0YXRlO2RlYnVnKCJwaXBlT25EcmFpbiIsc3RhdGUuYXdhaXREcmFpbik7aWYoc3RhdGUuYXdhaXREcmFpbilzdGF0ZS5hd2FpdERyYWluLS07aWYoc3RhdGUuYXdhaXREcmFpbj09PTAmJkVFbGlzdGVuZXJDb3VudChzcmMsImRhdGEiKSl7c3RhdGUuZmxvd2luZz10cnVlO2Zsb3coc3JjKX19fVJlYWRhYmxlLnByb3RvdHlwZS51bnBpcGU9ZnVuY3Rpb24oZGVzdCl7dmFyIHN0YXRlPXRoaXMuX3JlYWRhYmxlU3RhdGU7dmFyIHVucGlwZUluZm89e2hhc1VucGlwZWQ6ZmFsc2V9O2lmKHN0YXRlLnBpcGVzQ291bnQ9PT0wKXJldHVybiB0aGlzO2lmKHN0YXRlLnBpcGVzQ291bnQ9PT0xKXtpZihkZXN0JiZkZXN0IT09c3RhdGUucGlwZXMpcmV0dXJuIHRoaXM7aWYoIWRlc3QpZGVzdD1zdGF0ZS5waXBlcztzdGF0ZS5waXBlcz1udWxsO3N0YXRlLnBpcGVzQ291bnQ9MDtzdGF0ZS5mbG93aW5nPWZhbHNlO2lmKGRlc3QpZGVzdC5lbWl0KCJ1bnBpcGUiLHRoaXMsdW5waXBlSW5mbyk7cmV0dXJuIHRoaXN9aWYoIWRlc3Qpe3ZhciBkZXN0cz1zdGF0ZS5waXBlczt2YXIgbGVuPXN0YXRlLnBpcGVzQ291bnQ7c3RhdGUucGlwZXM9bnVsbDtzdGF0ZS5waXBlc0NvdW50PTA7c3RhdGUuZmxvd2luZz1mYWxzZTtmb3IodmFyIGk9MDtpPGxlbjtpKyspe2Rlc3RzW2ldLmVtaXQoInVucGlwZSIsdGhpcyx7aGFzVW5waXBlZDpmYWxzZX0pfXJldHVybiB0aGlzfXZhciBpbmRleD1pbmRleE9mKHN0YXRlLnBpcGVzLGRlc3QpO2lmKGluZGV4PT09LTEpcmV0dXJuIHRoaXM7c3RhdGUucGlwZXMuc3BsaWNlKGluZGV4LDEpO3N0YXRlLnBpcGVzQ291bnQtPTE7aWYoc3RhdGUucGlwZXNDb3VudD09PTEpc3RhdGUucGlwZXM9c3RhdGUucGlwZXNbMF07ZGVzdC5lbWl0KCJ1bnBpcGUiLHRoaXMsdW5waXBlSW5mbyk7cmV0dXJuIHRoaXN9O1JlYWRhYmxlLnByb3RvdHlwZS5vbj1mdW5jdGlvbihldixmbil7dmFyIHJlcz1TdHJlYW0ucHJvdG90eXBlLm9uLmNhbGwodGhpcyxldixmbik7dmFyIHN0YXRlPXRoaXMuX3JlYWRhYmxlU3RhdGU7aWYoZXY9PT0iZGF0YSIpe3N0YXRlLnJlYWRhYmxlTGlzdGVuaW5nPXRoaXMubGlzdGVuZXJDb3VudCgicmVhZGFibGUiKT4wO2lmKHN0YXRlLmZsb3dpbmchPT1mYWxzZSl0aGlzLnJlc3VtZSgpfWVsc2UgaWYoZXY9PT0icmVhZGFibGUiKXtpZighc3RhdGUuZW5kRW1pdHRlZCYmIXN0YXRlLnJlYWRhYmxlTGlzdGVuaW5nKXtzdGF0ZS5yZWFkYWJsZUxpc3RlbmluZz1zdGF0ZS5uZWVkUmVhZGFibGU9dHJ1ZTtzdGF0ZS5mbG93aW5nPWZhbHNlO3N0YXRlLmVtaXR0ZWRSZWFkYWJsZT1mYWxzZTtkZWJ1Zygib24gcmVhZGFibGUiLHN0YXRlLmxlbmd0aCxzdGF0ZS5yZWFkaW5nKTtpZihzdGF0ZS5sZW5ndGgpe2VtaXRSZWFkYWJsZSh0aGlzKX1lbHNlIGlmKCFzdGF0ZS5yZWFkaW5nKXtwcm9jZXNzLm5leHRUaWNrKG5SZWFkaW5nTmV4dFRpY2ssdGhpcyl9fX1yZXR1cm4gcmVzfTtSZWFkYWJsZS5wcm90b3R5cGUuYWRkTGlzdGVuZXI9UmVhZGFibGUucHJvdG90eXBlLm9uO1JlYWRhYmxlLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcj1mdW5jdGlvbihldixmbil7dmFyIHJlcz1TdHJlYW0ucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyLmNhbGwodGhpcyxldixmbik7aWYoZXY9PT0icmVhZGFibGUiKXtwcm9jZXNzLm5leHRUaWNrKHVwZGF0ZVJlYWRhYmxlTGlzdGVuaW5nLHRoaXMpfXJldHVybiByZXN9O1JlYWRhYmxlLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnM9ZnVuY3Rpb24oZXYpe3ZhciByZXM9U3RyZWFtLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMuYXBwbHkodGhpcyxhcmd1bWVudHMpO2lmKGV2PT09InJlYWRhYmxlInx8ZXY9PT11bmRlZmluZWQpe3Byb2Nlc3MubmV4dFRpY2sodXBkYXRlUmVhZGFibGVMaXN0ZW5pbmcsdGhpcyl9cmV0dXJuIHJlc307ZnVuY3Rpb24gdXBkYXRlUmVhZGFibGVMaXN0ZW5pbmcoc2VsZil7dmFyIHN0YXRlPXNlbGYuX3JlYWRhYmxlU3RhdGU7c3RhdGUucmVhZGFibGVMaXN0ZW5pbmc9c2VsZi5saXN0ZW5lckNvdW50KCJyZWFkYWJsZSIpPjA7aWYoc3RhdGUucmVzdW1lU2NoZWR1bGVkJiYhc3RhdGUucGF1c2VkKXtzdGF0ZS5mbG93aW5nPXRydWV9ZWxzZSBpZihzZWxmLmxpc3RlbmVyQ291bnQoImRhdGEiKT4wKXtzZWxmLnJlc3VtZSgpfX1mdW5jdGlvbiBuUmVhZGluZ05leHRUaWNrKHNlbGYpe2RlYnVnKCJyZWFkYWJsZSBuZXh0dGljayByZWFkIDAiKTtzZWxmLnJlYWQoMCl9UmVhZGFibGUucHJvdG90eXBlLnJlc3VtZT1mdW5jdGlvbigpe3ZhciBzdGF0ZT10aGlzLl9yZWFkYWJsZVN0YXRlO2lmKCFzdGF0ZS5mbG93aW5nKXtkZWJ1ZygicmVzdW1lIik7c3RhdGUuZmxvd2luZz0hc3RhdGUucmVhZGFibGVMaXN0ZW5pbmc7cmVzdW1lKHRoaXMsc3RhdGUpfXN0YXRlLnBhdXNlZD1mYWxzZTtyZXR1cm4gdGhpc307ZnVuY3Rpb24gcmVzdW1lKHN0cmVhbSxzdGF0ZSl7aWYoIXN0YXRlLnJlc3VtZVNjaGVkdWxlZCl7c3RhdGUucmVzdW1lU2NoZWR1bGVkPXRydWU7cHJvY2Vzcy5uZXh0VGljayhyZXN1bWVfLHN0cmVhbSxzdGF0ZSl9fWZ1bmN0aW9uIHJlc3VtZV8oc3RyZWFtLHN0YXRlKXtkZWJ1ZygicmVzdW1lIixzdGF0ZS5yZWFkaW5nKTtpZighc3RhdGUucmVhZGluZyl7c3RyZWFtLnJlYWQoMCl9c3RhdGUucmVzdW1lU2NoZWR1bGVkPWZhbHNlO3N0cmVhbS5lbWl0KCJyZXN1bWUiKTtmbG93KHN0cmVhbSk7aWYoc3RhdGUuZmxvd2luZyYmIXN0YXRlLnJlYWRpbmcpc3RyZWFtLnJlYWQoMCl9UmVhZGFibGUucHJvdG90eXBlLnBhdXNlPWZ1bmN0aW9uKCl7ZGVidWcoImNhbGwgcGF1c2UgZmxvd2luZz0laiIsdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nKTtpZih0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmchPT1mYWxzZSl7ZGVidWcoInBhdXNlIik7dGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nPWZhbHNlO3RoaXMuZW1pdCgicGF1c2UiKX10aGlzLl9yZWFkYWJsZVN0YXRlLnBhdXNlZD10cnVlO3JldHVybiB0aGlzfTtmdW5jdGlvbiBmbG93KHN0cmVhbSl7dmFyIHN0YXRlPXN0cmVhbS5fcmVhZGFibGVTdGF0ZTtkZWJ1ZygiZmxvdyIsc3RhdGUuZmxvd2luZyk7d2hpbGUoc3RhdGUuZmxvd2luZyYmc3RyZWFtLnJlYWQoKSE9PW51bGwpe319UmVhZGFibGUucHJvdG90eXBlLndyYXA9ZnVuY3Rpb24oc3RyZWFtKXt2YXIgX3RoaXM9dGhpczt2YXIgc3RhdGU9dGhpcy5fcmVhZGFibGVTdGF0ZTt2YXIgcGF1c2VkPWZhbHNlO3N0cmVhbS5vbigiZW5kIixmdW5jdGlvbigpe2RlYnVnKCJ3cmFwcGVkIGVuZCIpO2lmKHN0YXRlLmRlY29kZXImJiFzdGF0ZS5lbmRlZCl7dmFyIGNodW5rPXN0YXRlLmRlY29kZXIuZW5kKCk7aWYoY2h1bmsmJmNodW5rLmxlbmd0aClfdGhpcy5wdXNoKGNodW5rKX1fdGhpcy5wdXNoKG51bGwpfSk7c3RyZWFtLm9uKCJkYXRhIixmdW5jdGlvbihjaHVuayl7ZGVidWcoIndyYXBwZWQgZGF0YSIpO2lmKHN0YXRlLmRlY29kZXIpY2h1bms9c3RhdGUuZGVjb2Rlci53cml0ZShjaHVuayk7aWYoc3RhdGUub2JqZWN0TW9kZSYmKGNodW5rPT09bnVsbHx8Y2h1bms9PT11bmRlZmluZWQpKXJldHVybjtlbHNlIGlmKCFzdGF0ZS5vYmplY3RNb2RlJiYoIWNodW5rfHwhY2h1bmsubGVuZ3RoKSlyZXR1cm47dmFyIHJldD1fdGhpcy5wdXNoKGNodW5rKTtpZighcmV0KXtwYXVzZWQ9dHJ1ZTtzdHJlYW0ucGF1c2UoKX19KTtmb3IodmFyIGkgaW4gc3RyZWFtKXtpZih0aGlzW2ldPT09dW5kZWZpbmVkJiZ0eXBlb2Ygc3RyZWFtW2ldPT09ImZ1bmN0aW9uIil7dGhpc1tpXT1mdW5jdGlvbiBtZXRob2RXcmFwKG1ldGhvZCl7cmV0dXJuIGZ1bmN0aW9uIG1ldGhvZFdyYXBSZXR1cm5GdW5jdGlvbigpe3JldHVybiBzdHJlYW1bbWV0aG9kXS5hcHBseShzdHJlYW0sYXJndW1lbnRzKX19KGkpfX1mb3IodmFyIG49MDtuPGtQcm94eUV2ZW50cy5sZW5ndGg7bisrKXtzdHJlYW0ub24oa1Byb3h5RXZlbnRzW25dLHRoaXMuZW1pdC5iaW5kKHRoaXMsa1Byb3h5RXZlbnRzW25dKSl9dGhpcy5fcmVhZD1mdW5jdGlvbihuKXtkZWJ1Zygid3JhcHBlZCBfcmVhZCIsbik7aWYocGF1c2VkKXtwYXVzZWQ9ZmFsc2U7c3RyZWFtLnJlc3VtZSgpfX07cmV0dXJuIHRoaXN9O2lmKHR5cGVvZiBTeW1ib2w9PT0iZnVuY3Rpb24iKXtSZWFkYWJsZS5wcm90b3R5cGVbU3ltYm9sLmFzeW5jSXRlcmF0b3JdPWZ1bmN0aW9uKCl7aWYoY3JlYXRlUmVhZGFibGVTdHJlYW1Bc3luY0l0ZXJhdG9yPT09dW5kZWZpbmVkKXtjcmVhdGVSZWFkYWJsZVN0cmVhbUFzeW5jSXRlcmF0b3I9cmVxdWlyZSgiLi9pbnRlcm5hbC9zdHJlYW1zL2FzeW5jX2l0ZXJhdG9yIil9cmV0dXJuIGNyZWF0ZVJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvcih0aGlzKX19T2JqZWN0LmRlZmluZVByb3BlcnR5KFJlYWRhYmxlLnByb3RvdHlwZSwicmVhZGFibGVIaWdoV2F0ZXJNYXJrIix7ZW51bWVyYWJsZTpmYWxzZSxnZXQ6ZnVuY3Rpb24gZ2V0KCl7cmV0dXJuIHRoaXMuX3JlYWRhYmxlU3RhdGUuaGlnaFdhdGVyTWFya319KTtPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGUucHJvdG90eXBlLCJyZWFkYWJsZUJ1ZmZlciIse2VudW1lcmFibGU6ZmFsc2UsZ2V0OmZ1bmN0aW9uIGdldCgpe3JldHVybiB0aGlzLl9yZWFkYWJsZVN0YXRlJiZ0aGlzLl9yZWFkYWJsZVN0YXRlLmJ1ZmZlcn19KTtPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGUucHJvdG90eXBlLCJyZWFkYWJsZUZsb3dpbmciLHtlbnVtZXJhYmxlOmZhbHNlLGdldDpmdW5jdGlvbiBnZXQoKXtyZXR1cm4gdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nfSxzZXQ6ZnVuY3Rpb24gc2V0KHN0YXRlKXtpZih0aGlzLl9yZWFkYWJsZVN0YXRlKXt0aGlzLl9yZWFkYWJsZVN0YXRlLmZsb3dpbmc9c3RhdGV9fX0pO1JlYWRhYmxlLl9mcm9tTGlzdD1mcm9tTGlzdDtPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGUucHJvdG90eXBlLCJyZWFkYWJsZUxlbmd0aCIse2VudW1lcmFibGU6ZmFsc2UsZ2V0OmZ1bmN0aW9uIGdldCgpe3JldHVybiB0aGlzLl9yZWFkYWJsZVN0YXRlLmxlbmd0aH19KTtmdW5jdGlvbiBmcm9tTGlzdChuLHN0YXRlKXtpZihzdGF0ZS5sZW5ndGg9PT0wKXJldHVybiBudWxsO3ZhciByZXQ7aWYoc3RhdGUub2JqZWN0TW9kZSlyZXQ9c3RhdGUuYnVmZmVyLnNoaWZ0KCk7ZWxzZSBpZighbnx8bj49c3RhdGUubGVuZ3RoKXtpZihzdGF0ZS5kZWNvZGVyKXJldD1zdGF0ZS5idWZmZXIuam9pbigiIik7ZWxzZSBpZihzdGF0ZS5idWZmZXIubGVuZ3RoPT09MSlyZXQ9c3RhdGUuYnVmZmVyLmZpcnN0KCk7ZWxzZSByZXQ9c3RhdGUuYnVmZmVyLmNvbmNhdChzdGF0ZS5sZW5ndGgpO3N0YXRlLmJ1ZmZlci5jbGVhcigpfWVsc2V7cmV0PXN0YXRlLmJ1ZmZlci5jb25zdW1lKG4sc3RhdGUuZGVjb2Rlcil9cmV0dXJuIHJldH1mdW5jdGlvbiBlbmRSZWFkYWJsZShzdHJlYW0pe3ZhciBzdGF0ZT1zdHJlYW0uX3JlYWRhYmxlU3RhdGU7ZGVidWcoImVuZFJlYWRhYmxlIixzdGF0ZS5lbmRFbWl0dGVkKTtpZighc3RhdGUuZW5kRW1pdHRlZCl7c3RhdGUuZW5kZWQ9dHJ1ZTtwcm9jZXNzLm5leHRUaWNrKGVuZFJlYWRhYmxlTlQsc3RhdGUsc3RyZWFtKX19ZnVuY3Rpb24gZW5kUmVhZGFibGVOVChzdGF0ZSxzdHJlYW0pe2RlYnVnKCJlbmRSZWFkYWJsZU5UIixzdGF0ZS5lbmRFbWl0dGVkLHN0YXRlLmxlbmd0aCk7aWYoIXN0YXRlLmVuZEVtaXR0ZWQmJnN0YXRlLmxlbmd0aD09PTApe3N0YXRlLmVuZEVtaXR0ZWQ9dHJ1ZTtzdHJlYW0ucmVhZGFibGU9ZmFsc2U7c3RyZWFtLmVtaXQoImVuZCIpO2lmKHN0YXRlLmF1dG9EZXN0cm95KXt2YXIgd1N0YXRlPXN0cmVhbS5fd3JpdGFibGVTdGF0ZTtpZighd1N0YXRlfHx3U3RhdGUuYXV0b0Rlc3Ryb3kmJndTdGF0ZS5maW5pc2hlZCl7c3RyZWFtLmRlc3Ryb3koKX19fX1pZih0eXBlb2YgU3ltYm9sPT09ImZ1bmN0aW9uIil7UmVhZGFibGUuZnJvbT1mdW5jdGlvbihpdGVyYWJsZSxvcHRzKXtpZihmcm9tPT09dW5kZWZpbmVkKXtmcm9tPXJlcXVpcmUoIi4vaW50ZXJuYWwvc3RyZWFtcy9mcm9tIil9cmV0dXJuIGZyb20oUmVhZGFibGUsaXRlcmFibGUsb3B0cyl9fWZ1bmN0aW9uIGluZGV4T2YoeHMseCl7Zm9yKHZhciBpPTAsbD14cy5sZW5ndGg7aTxsO2krKyl7aWYoeHNbaV09PT14KXJldHVybiBpfXJldHVybi0xfX0pLmNhbGwodGhpcyxyZXF1aXJlKCJfcHJvY2VzcyIpLHR5cGVvZiBnbG9iYWwhPT0idW5kZWZpbmVkIj9nbG9iYWw6dHlwZW9mIHNlbGYhPT0idW5kZWZpbmVkIj9zZWxmOnR5cGVvZiB3aW5kb3chPT0idW5kZWZpbmVkIj93aW5kb3c6e30pfSx7Ii4uL2Vycm9ycyI6NjcsIi4vX3N0cmVhbV9kdXBsZXgiOjY4LCIuL2ludGVybmFsL3N0cmVhbXMvYXN5bmNfaXRlcmF0b3IiOjczLCIuL2ludGVybmFsL3N0cmVhbXMvYnVmZmVyX2xpc3QiOjc0LCIuL2ludGVybmFsL3N0cmVhbXMvZGVzdHJveSI6NzUsIi4vaW50ZXJuYWwvc3RyZWFtcy9mcm9tIjo3NywiLi9pbnRlcm5hbC9zdHJlYW1zL3N0YXRlIjo3OSwiLi9pbnRlcm5hbC9zdHJlYW1zL3N0cmVhbSI6ODAsX3Byb2Nlc3M6NjYsYnVmZmVyOjI3LGV2ZW50czozMyxpbmhlcml0czozNiwic3RyaW5nX2RlY29kZXIvIjoxMTgsdXRpbDoyNn1dLDcxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsidXNlIHN0cmljdCI7bW9kdWxlLmV4cG9ydHM9VHJhbnNmb3JtO3ZhciBfcmVxdWlyZSRjb2Rlcz1yZXF1aXJlKCIuLi9lcnJvcnMiKS5jb2RlcyxFUlJfTUVUSE9EX05PVF9JTVBMRU1FTlRFRD1fcmVxdWlyZSRjb2Rlcy5FUlJfTUVUSE9EX05PVF9JTVBMRU1FTlRFRCxFUlJfTVVMVElQTEVfQ0FMTEJBQ0s9X3JlcXVpcmUkY29kZXMuRVJSX01VTFRJUExFX0NBTExCQUNLLEVSUl9UUkFOU0ZPUk1fQUxSRUFEWV9UUkFOU0ZPUk1JTkc9X3JlcXVpcmUkY29kZXMuRVJSX1RSQU5TRk9STV9BTFJFQURZX1RSQU5TRk9STUlORyxFUlJfVFJBTlNGT1JNX1dJVEhfTEVOR1RIXzA9X3JlcXVpcmUkY29kZXMuRVJSX1RSQU5TRk9STV9XSVRIX0xFTkdUSF8wO3ZhciBEdXBsZXg9cmVxdWlyZSgiLi9fc3RyZWFtX2R1cGxleCIpO3JlcXVpcmUoImluaGVyaXRzIikoVHJhbnNmb3JtLER1cGxleCk7ZnVuY3Rpb24gYWZ0ZXJUcmFuc2Zvcm0oZXIsZGF0YSl7dmFyIHRzPXRoaXMuX3RyYW5zZm9ybVN0YXRlO3RzLnRyYW5zZm9ybWluZz1mYWxzZTt2YXIgY2I9dHMud3JpdGVjYjtpZihjYj09PW51bGwpe3JldHVybiB0aGlzLmVtaXQoImVycm9yIixuZXcgRVJSX01VTFRJUExFX0NBTExCQUNLKX10cy53cml0ZWNodW5rPW51bGw7dHMud3JpdGVjYj1udWxsO2lmKGRhdGEhPW51bGwpdGhpcy5wdXNoKGRhdGEpO2NiKGVyKTt2YXIgcnM9dGhpcy5fcmVhZGFibGVTdGF0ZTtycy5yZWFkaW5nPWZhbHNlO2lmKHJzLm5lZWRSZWFkYWJsZXx8cnMubGVuZ3RoPHJzLmhpZ2hXYXRlck1hcmspe3RoaXMuX3JlYWQocnMuaGlnaFdhdGVyTWFyayl9fWZ1bmN0aW9uIFRyYW5zZm9ybShvcHRpb25zKXtpZighKHRoaXMgaW5zdGFuY2VvZiBUcmFuc2Zvcm0pKXJldHVybiBuZXcgVHJhbnNmb3JtKG9wdGlvbnMpO0R1cGxleC5jYWxsKHRoaXMsb3B0aW9ucyk7dGhpcy5fdHJhbnNmb3JtU3RhdGU9e2FmdGVyVHJhbnNmb3JtOmFmdGVyVHJhbnNmb3JtLmJpbmQodGhpcyksbmVlZFRyYW5zZm9ybTpmYWxzZSx0cmFuc2Zvcm1pbmc6ZmFsc2Usd3JpdGVjYjpudWxsLHdyaXRlY2h1bms6bnVsbCx3cml0ZWVuY29kaW5nOm51bGx9O3RoaXMuX3JlYWRhYmxlU3RhdGUubmVlZFJlYWRhYmxlPXRydWU7dGhpcy5fcmVhZGFibGVTdGF0ZS5zeW5jPWZhbHNlO2lmKG9wdGlvbnMpe2lmKHR5cGVvZiBvcHRpb25zLnRyYW5zZm9ybT09PSJmdW5jdGlvbiIpdGhpcy5fdHJhbnNmb3JtPW9wdGlvbnMudHJhbnNmb3JtO2lmKHR5cGVvZiBvcHRpb25zLmZsdXNoPT09ImZ1bmN0aW9uIil0aGlzLl9mbHVzaD1vcHRpb25zLmZsdXNofXRoaXMub24oInByZWZpbmlzaCIscHJlZmluaXNoKX1mdW5jdGlvbiBwcmVmaW5pc2goKXt2YXIgX3RoaXM9dGhpcztpZih0eXBlb2YgdGhpcy5fZmx1c2g9PT0iZnVuY3Rpb24iJiYhdGhpcy5fcmVhZGFibGVTdGF0ZS5kZXN0cm95ZWQpe3RoaXMuX2ZsdXNoKGZ1bmN0aW9uKGVyLGRhdGEpe2RvbmUoX3RoaXMsZXIsZGF0YSl9KX1lbHNle2RvbmUodGhpcyxudWxsLG51bGwpfX1UcmFuc2Zvcm0ucHJvdG90eXBlLnB1c2g9ZnVuY3Rpb24oY2h1bmssZW5jb2Rpbmcpe3RoaXMuX3RyYW5zZm9ybVN0YXRlLm5lZWRUcmFuc2Zvcm09ZmFsc2U7cmV0dXJuIER1cGxleC5wcm90b3R5cGUucHVzaC5jYWxsKHRoaXMsY2h1bmssZW5jb2RpbmcpfTtUcmFuc2Zvcm0ucHJvdG90eXBlLl90cmFuc2Zvcm09ZnVuY3Rpb24oY2h1bmssZW5jb2RpbmcsY2Ipe2NiKG5ldyBFUlJfTUVUSE9EX05PVF9JTVBMRU1FTlRFRCgiX3RyYW5zZm9ybSgpIikpfTtUcmFuc2Zvcm0ucHJvdG90eXBlLl93cml0ZT1mdW5jdGlvbihjaHVuayxlbmNvZGluZyxjYil7dmFyIHRzPXRoaXMuX3RyYW5zZm9ybVN0YXRlO3RzLndyaXRlY2I9Y2I7dHMud3JpdGVjaHVuaz1jaHVuazt0cy53cml0ZWVuY29kaW5nPWVuY29kaW5nO2lmKCF0cy50cmFuc2Zvcm1pbmcpe3ZhciBycz10aGlzLl9yZWFkYWJsZVN0YXRlO2lmKHRzLm5lZWRUcmFuc2Zvcm18fHJzLm5lZWRSZWFkYWJsZXx8cnMubGVuZ3RoPHJzLmhpZ2hXYXRlck1hcmspdGhpcy5fcmVhZChycy5oaWdoV2F0ZXJNYXJrKX19O1RyYW5zZm9ybS5wcm90b3R5cGUuX3JlYWQ9ZnVuY3Rpb24obil7dmFyIHRzPXRoaXMuX3RyYW5zZm9ybVN0YXRlO2lmKHRzLndyaXRlY2h1bmshPT1udWxsJiYhdHMudHJhbnNmb3JtaW5nKXt0cy50cmFuc2Zvcm1pbmc9dHJ1ZTt0aGlzLl90cmFuc2Zvcm0odHMud3JpdGVjaHVuayx0cy53cml0ZWVuY29kaW5nLHRzLmFmdGVyVHJhbnNmb3JtKX1lbHNle3RzLm5lZWRUcmFuc2Zvcm09dHJ1ZX19O1RyYW5zZm9ybS5wcm90b3R5cGUuX2Rlc3Ryb3k9ZnVuY3Rpb24oZXJyLGNiKXtEdXBsZXgucHJvdG90eXBlLl9kZXN0cm95LmNhbGwodGhpcyxlcnIsZnVuY3Rpb24oZXJyMil7Y2IoZXJyMil9KX07ZnVuY3Rpb24gZG9uZShzdHJlYW0sZXIsZGF0YSl7aWYoZXIpcmV0dXJuIHN0cmVhbS5lbWl0KCJlcnJvciIsZXIpO2lmKGRhdGEhPW51bGwpc3RyZWFtLnB1c2goZGF0YSk7aWYoc3RyZWFtLl93cml0YWJsZVN0YXRlLmxlbmd0aCl0aHJvdyBuZXcgRVJSX1RSQU5TRk9STV9XSVRIX0xFTkdUSF8wO2lmKHN0cmVhbS5fdHJhbnNmb3JtU3RhdGUudHJhbnNmb3JtaW5nKXRocm93IG5ldyBFUlJfVFJBTlNGT1JNX0FMUkVBRFlfVFJBTlNGT1JNSU5HO3JldHVybiBzdHJlYW0ucHVzaChudWxsKX19LHsiLi4vZXJyb3JzIjo2NywiLi9fc3RyZWFtX2R1cGxleCI6NjgsaW5oZXJpdHM6MzZ9XSw3MjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKHByb2Nlc3MsZ2xvYmFsKXsidXNlIHN0cmljdCI7bW9kdWxlLmV4cG9ydHM9V3JpdGFibGU7ZnVuY3Rpb24gV3JpdGVSZXEoY2h1bmssZW5jb2RpbmcsY2Ipe3RoaXMuY2h1bms9Y2h1bms7dGhpcy5lbmNvZGluZz1lbmNvZGluZzt0aGlzLmNhbGxiYWNrPWNiO3RoaXMubmV4dD1udWxsfWZ1bmN0aW9uIENvcmtlZFJlcXVlc3Qoc3RhdGUpe3ZhciBfdGhpcz10aGlzO3RoaXMubmV4dD1udWxsO3RoaXMuZW50cnk9bnVsbDt0aGlzLmZpbmlzaD1mdW5jdGlvbigpe29uQ29ya2VkRmluaXNoKF90aGlzLHN0YXRlKX19dmFyIER1cGxleDtXcml0YWJsZS5Xcml0YWJsZVN0YXRlPVdyaXRhYmxlU3RhdGU7dmFyIGludGVybmFsVXRpbD17ZGVwcmVjYXRlOnJlcXVpcmUoInV0aWwtZGVwcmVjYXRlIil9O3ZhciBTdHJlYW09cmVxdWlyZSgiLi9pbnRlcm5hbC9zdHJlYW1zL3N0cmVhbSIpO3ZhciBCdWZmZXI9cmVxdWlyZSgiYnVmZmVyIikuQnVmZmVyO3ZhciBPdXJVaW50OEFycmF5PWdsb2JhbC5VaW50OEFycmF5fHxmdW5jdGlvbigpe307ZnVuY3Rpb24gX3VpbnQ4QXJyYXlUb0J1ZmZlcihjaHVuayl7cmV0dXJuIEJ1ZmZlci5mcm9tKGNodW5rKX1mdW5jdGlvbiBfaXNVaW50OEFycmF5KG9iail7cmV0dXJuIEJ1ZmZlci5pc0J1ZmZlcihvYmopfHxvYmogaW5zdGFuY2VvZiBPdXJVaW50OEFycmF5fXZhciBkZXN0cm95SW1wbD1yZXF1aXJlKCIuL2ludGVybmFsL3N0cmVhbXMvZGVzdHJveSIpO3ZhciBfcmVxdWlyZT1yZXF1aXJlKCIuL2ludGVybmFsL3N0cmVhbXMvc3RhdGUiKSxnZXRIaWdoV2F0ZXJNYXJrPV9yZXF1aXJlLmdldEhpZ2hXYXRlck1hcms7dmFyIF9yZXF1aXJlJGNvZGVzPXJlcXVpcmUoIi4uL2Vycm9ycyIpLmNvZGVzLEVSUl9JTlZBTElEX0FSR19UWVBFPV9yZXF1aXJlJGNvZGVzLkVSUl9JTlZBTElEX0FSR19UWVBFLEVSUl9NRVRIT0RfTk9UX0lNUExFTUVOVEVEPV9yZXF1aXJlJGNvZGVzLkVSUl9NRVRIT0RfTk9UX0lNUExFTUVOVEVELEVSUl9NVUxUSVBMRV9DQUxMQkFDSz1fcmVxdWlyZSRjb2Rlcy5FUlJfTVVMVElQTEVfQ0FMTEJBQ0ssRVJSX1NUUkVBTV9DQU5OT1RfUElQRT1fcmVxdWlyZSRjb2Rlcy5FUlJfU1RSRUFNX0NBTk5PVF9QSVBFLEVSUl9TVFJFQU1fREVTVFJPWUVEPV9yZXF1aXJlJGNvZGVzLkVSUl9TVFJFQU1fREVTVFJPWUVELEVSUl9TVFJFQU1fTlVMTF9WQUxVRVM9X3JlcXVpcmUkY29kZXMuRVJSX1NUUkVBTV9OVUxMX1ZBTFVFUyxFUlJfU1RSRUFNX1dSSVRFX0FGVEVSX0VORD1fcmVxdWlyZSRjb2Rlcy5FUlJfU1RSRUFNX1dSSVRFX0FGVEVSX0VORCxFUlJfVU5LTk9XTl9FTkNPRElORz1fcmVxdWlyZSRjb2Rlcy5FUlJfVU5LTk9XTl9FTkNPRElORzt2YXIgZXJyb3JPckRlc3Ryb3k9ZGVzdHJveUltcGwuZXJyb3JPckRlc3Ryb3k7cmVxdWlyZSgiaW5oZXJpdHMiKShXcml0YWJsZSxTdHJlYW0pO2Z1bmN0aW9uIG5vcCgpe31mdW5jdGlvbiBXcml0YWJsZVN0YXRlKG9wdGlvbnMsc3RyZWFtLGlzRHVwbGV4KXtEdXBsZXg9RHVwbGV4fHxyZXF1aXJlKCIuL19zdHJlYW1fZHVwbGV4Iik7b3B0aW9ucz1vcHRpb25zfHx7fTtpZih0eXBlb2YgaXNEdXBsZXghPT0iYm9vbGVhbiIpaXNEdXBsZXg9c3RyZWFtIGluc3RhbmNlb2YgRHVwbGV4O3RoaXMub2JqZWN0TW9kZT0hIW9wdGlvbnMub2JqZWN0TW9kZTtpZihpc0R1cGxleCl0aGlzLm9iamVjdE1vZGU9dGhpcy5vYmplY3RNb2RlfHwhIW9wdGlvbnMud3JpdGFibGVPYmplY3RNb2RlO3RoaXMuaGlnaFdhdGVyTWFyaz1nZXRIaWdoV2F0ZXJNYXJrKHRoaXMsb3B0aW9ucywid3JpdGFibGVIaWdoV2F0ZXJNYXJrIixpc0R1cGxleCk7dGhpcy5maW5hbENhbGxlZD1mYWxzZTt0aGlzLm5lZWREcmFpbj1mYWxzZTt0aGlzLmVuZGluZz1mYWxzZTt0aGlzLmVuZGVkPWZhbHNlO3RoaXMuZmluaXNoZWQ9ZmFsc2U7dGhpcy5kZXN0cm95ZWQ9ZmFsc2U7dmFyIG5vRGVjb2RlPW9wdGlvbnMuZGVjb2RlU3RyaW5ncz09PWZhbHNlO3RoaXMuZGVjb2RlU3RyaW5ncz0hbm9EZWNvZGU7dGhpcy5kZWZhdWx0RW5jb2Rpbmc9b3B0aW9ucy5kZWZhdWx0RW5jb2Rpbmd8fCJ1dGY4Ijt0aGlzLmxlbmd0aD0wO3RoaXMud3JpdGluZz1mYWxzZTt0aGlzLmNvcmtlZD0wO3RoaXMuc3luYz10cnVlO3RoaXMuYnVmZmVyUHJvY2Vzc2luZz1mYWxzZTt0aGlzLm9ud3JpdGU9ZnVuY3Rpb24oZXIpe29ud3JpdGUoc3RyZWFtLGVyKX07dGhpcy53cml0ZWNiPW51bGw7dGhpcy53cml0ZWxlbj0wO3RoaXMuYnVmZmVyZWRSZXF1ZXN0PW51bGw7dGhpcy5sYXN0QnVmZmVyZWRSZXF1ZXN0PW51bGw7dGhpcy5wZW5kaW5nY2I9MDt0aGlzLnByZWZpbmlzaGVkPWZhbHNlO3RoaXMuZXJyb3JFbWl0dGVkPWZhbHNlO3RoaXMuZW1pdENsb3NlPW9wdGlvbnMuZW1pdENsb3NlIT09ZmFsc2U7dGhpcy5hdXRvRGVzdHJveT0hIW9wdGlvbnMuYXV0b0Rlc3Ryb3k7dGhpcy5idWZmZXJlZFJlcXVlc3RDb3VudD0wO3RoaXMuY29ya2VkUmVxdWVzdHNGcmVlPW5ldyBDb3JrZWRSZXF1ZXN0KHRoaXMpfVdyaXRhYmxlU3RhdGUucHJvdG90eXBlLmdldEJ1ZmZlcj1mdW5jdGlvbiBnZXRCdWZmZXIoKXt2YXIgY3VycmVudD10aGlzLmJ1ZmZlcmVkUmVxdWVzdDt2YXIgb3V0PVtdO3doaWxlKGN1cnJlbnQpe291dC5wdXNoKGN1cnJlbnQpO2N1cnJlbnQ9Y3VycmVudC5uZXh0fXJldHVybiBvdXR9OyhmdW5jdGlvbigpe3RyeXtPYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGFibGVTdGF0ZS5wcm90b3R5cGUsImJ1ZmZlciIse2dldDppbnRlcm5hbFV0aWwuZGVwcmVjYXRlKGZ1bmN0aW9uIHdyaXRhYmxlU3RhdGVCdWZmZXJHZXR0ZXIoKXtyZXR1cm4gdGhpcy5nZXRCdWZmZXIoKX0sIl93cml0YWJsZVN0YXRlLmJ1ZmZlciBpcyBkZXByZWNhdGVkLiBVc2UgX3dyaXRhYmxlU3RhdGUuZ2V0QnVmZmVyICIrImluc3RlYWQuIiwiREVQMDAwMyIpfSl9Y2F0Y2goXyl7fX0pKCk7dmFyIHJlYWxIYXNJbnN0YW5jZTtpZih0eXBlb2YgU3ltYm9sPT09ImZ1bmN0aW9uIiYmU3ltYm9sLmhhc0luc3RhbmNlJiZ0eXBlb2YgRnVuY3Rpb24ucHJvdG90eXBlW1N5bWJvbC5oYXNJbnN0YW5jZV09PT0iZnVuY3Rpb24iKXtyZWFsSGFzSW5zdGFuY2U9RnVuY3Rpb24ucHJvdG90eXBlW1N5bWJvbC5oYXNJbnN0YW5jZV07T2JqZWN0LmRlZmluZVByb3BlcnR5KFdyaXRhYmxlLFN5bWJvbC5oYXNJbnN0YW5jZSx7dmFsdWU6ZnVuY3Rpb24gdmFsdWUob2JqZWN0KXtpZihyZWFsSGFzSW5zdGFuY2UuY2FsbCh0aGlzLG9iamVjdCkpcmV0dXJuIHRydWU7aWYodGhpcyE9PVdyaXRhYmxlKXJldHVybiBmYWxzZTtyZXR1cm4gb2JqZWN0JiZvYmplY3QuX3dyaXRhYmxlU3RhdGUgaW5zdGFuY2VvZiBXcml0YWJsZVN0YXRlfX0pfWVsc2V7cmVhbEhhc0luc3RhbmNlPWZ1bmN0aW9uIHJlYWxIYXNJbnN0YW5jZShvYmplY3Qpe3JldHVybiBvYmplY3QgaW5zdGFuY2VvZiB0aGlzfX1mdW5jdGlvbiBXcml0YWJsZShvcHRpb25zKXtEdXBsZXg9RHVwbGV4fHxyZXF1aXJlKCIuL19zdHJlYW1fZHVwbGV4Iik7dmFyIGlzRHVwbGV4PXRoaXMgaW5zdGFuY2VvZiBEdXBsZXg7aWYoIWlzRHVwbGV4JiYhcmVhbEhhc0luc3RhbmNlLmNhbGwoV3JpdGFibGUsdGhpcykpcmV0dXJuIG5ldyBXcml0YWJsZShvcHRpb25zKTt0aGlzLl93cml0YWJsZVN0YXRlPW5ldyBXcml0YWJsZVN0YXRlKG9wdGlvbnMsdGhpcyxpc0R1cGxleCk7dGhpcy53cml0YWJsZT10cnVlO2lmKG9wdGlvbnMpe2lmKHR5cGVvZiBvcHRpb25zLndyaXRlPT09ImZ1bmN0aW9uIil0aGlzLl93cml0ZT1vcHRpb25zLndyaXRlO2lmKHR5cGVvZiBvcHRpb25zLndyaXRldj09PSJmdW5jdGlvbiIpdGhpcy5fd3JpdGV2PW9wdGlvbnMud3JpdGV2O2lmKHR5cGVvZiBvcHRpb25zLmRlc3Ryb3k9PT0iZnVuY3Rpb24iKXRoaXMuX2Rlc3Ryb3k9b3B0aW9ucy5kZXN0cm95O2lmKHR5cGVvZiBvcHRpb25zLmZpbmFsPT09ImZ1bmN0aW9uIil0aGlzLl9maW5hbD1vcHRpb25zLmZpbmFsfVN0cmVhbS5jYWxsKHRoaXMpfVdyaXRhYmxlLnByb3RvdHlwZS5waXBlPWZ1bmN0aW9uKCl7ZXJyb3JPckRlc3Ryb3kodGhpcyxuZXcgRVJSX1NUUkVBTV9DQU5OT1RfUElQRSl9O2Z1bmN0aW9uIHdyaXRlQWZ0ZXJFbmQoc3RyZWFtLGNiKXt2YXIgZXI9bmV3IEVSUl9TVFJFQU1fV1JJVEVfQUZURVJfRU5EO2Vycm9yT3JEZXN0cm95KHN0cmVhbSxlcik7cHJvY2Vzcy5uZXh0VGljayhjYixlcil9ZnVuY3Rpb24gdmFsaWRDaHVuayhzdHJlYW0sc3RhdGUsY2h1bmssY2Ipe3ZhciBlcjtpZihjaHVuaz09PW51bGwpe2VyPW5ldyBFUlJfU1RSRUFNX05VTExfVkFMVUVTfWVsc2UgaWYodHlwZW9mIGNodW5rIT09InN0cmluZyImJiFzdGF0ZS5vYmplY3RNb2RlKXtlcj1uZXcgRVJSX0lOVkFMSURfQVJHX1RZUEUoImNodW5rIixbInN0cmluZyIsIkJ1ZmZlciJdLGNodW5rKX1pZihlcil7ZXJyb3JPckRlc3Ryb3koc3RyZWFtLGVyKTtwcm9jZXNzLm5leHRUaWNrKGNiLGVyKTtyZXR1cm4gZmFsc2V9cmV0dXJuIHRydWV9V3JpdGFibGUucHJvdG90eXBlLndyaXRlPWZ1bmN0aW9uKGNodW5rLGVuY29kaW5nLGNiKXt2YXIgc3RhdGU9dGhpcy5fd3JpdGFibGVTdGF0ZTt2YXIgcmV0PWZhbHNlO3ZhciBpc0J1Zj0hc3RhdGUub2JqZWN0TW9kZSYmX2lzVWludDhBcnJheShjaHVuayk7aWYoaXNCdWYmJiFCdWZmZXIuaXNCdWZmZXIoY2h1bmspKXtjaHVuaz1fdWludDhBcnJheVRvQnVmZmVyKGNodW5rKX1pZih0eXBlb2YgZW5jb2Rpbmc9PT0iZnVuY3Rpb24iKXtjYj1lbmNvZGluZztlbmNvZGluZz1udWxsfWlmKGlzQnVmKWVuY29kaW5nPSJidWZmZXIiO2Vsc2UgaWYoIWVuY29kaW5nKWVuY29kaW5nPXN0YXRlLmRlZmF1bHRFbmNvZGluZztpZih0eXBlb2YgY2IhPT0iZnVuY3Rpb24iKWNiPW5vcDtpZihzdGF0ZS5lbmRpbmcpd3JpdGVBZnRlckVuZCh0aGlzLGNiKTtlbHNlIGlmKGlzQnVmfHx2YWxpZENodW5rKHRoaXMsc3RhdGUsY2h1bmssY2IpKXtzdGF0ZS5wZW5kaW5nY2IrKztyZXQ9d3JpdGVPckJ1ZmZlcih0aGlzLHN0YXRlLGlzQnVmLGNodW5rLGVuY29kaW5nLGNiKX1yZXR1cm4gcmV0fTtXcml0YWJsZS5wcm90b3R5cGUuY29yaz1mdW5jdGlvbigpe3RoaXMuX3dyaXRhYmxlU3RhdGUuY29ya2VkKyt9O1dyaXRhYmxlLnByb3RvdHlwZS51bmNvcms9ZnVuY3Rpb24oKXt2YXIgc3RhdGU9dGhpcy5fd3JpdGFibGVTdGF0ZTtpZihzdGF0ZS5jb3JrZWQpe3N0YXRlLmNvcmtlZC0tO2lmKCFzdGF0ZS53cml0aW5nJiYhc3RhdGUuY29ya2VkJiYhc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyYmc3RhdGUuYnVmZmVyZWRSZXF1ZXN0KWNsZWFyQnVmZmVyKHRoaXMsc3RhdGUpfX07V3JpdGFibGUucHJvdG90eXBlLnNldERlZmF1bHRFbmNvZGluZz1mdW5jdGlvbiBzZXREZWZhdWx0RW5jb2RpbmcoZW5jb2Rpbmcpe2lmKHR5cGVvZiBlbmNvZGluZz09PSJzdHJpbmciKWVuY29kaW5nPWVuY29kaW5nLnRvTG93ZXJDYXNlKCk7aWYoIShbImhleCIsInV0ZjgiLCJ1dGYtOCIsImFzY2lpIiwiYmluYXJ5IiwiYmFzZTY0IiwidWNzMiIsInVjcy0yIiwidXRmMTZsZSIsInV0Zi0xNmxlIiwicmF3Il0uaW5kZXhPZigoZW5jb2RpbmcrIiIpLnRvTG93ZXJDYXNlKCkpPi0xKSl0aHJvdyBuZXcgRVJSX1VOS05PV05fRU5DT0RJTkcoZW5jb2RpbmcpO3RoaXMuX3dyaXRhYmxlU3RhdGUuZGVmYXVsdEVuY29kaW5nPWVuY29kaW5nO3JldHVybiB0aGlzfTtPYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGFibGUucHJvdG90eXBlLCJ3cml0YWJsZUJ1ZmZlciIse2VudW1lcmFibGU6ZmFsc2UsZ2V0OmZ1bmN0aW9uIGdldCgpe3JldHVybiB0aGlzLl93cml0YWJsZVN0YXRlJiZ0aGlzLl93cml0YWJsZVN0YXRlLmdldEJ1ZmZlcigpfX0pO2Z1bmN0aW9uIGRlY29kZUNodW5rKHN0YXRlLGNodW5rLGVuY29kaW5nKXtpZighc3RhdGUub2JqZWN0TW9kZSYmc3RhdGUuZGVjb2RlU3RyaW5ncyE9PWZhbHNlJiZ0eXBlb2YgY2h1bms9PT0ic3RyaW5nIil7Y2h1bms9QnVmZmVyLmZyb20oY2h1bmssZW5jb2RpbmcpfXJldHVybiBjaHVua31PYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGFibGUucHJvdG90eXBlLCJ3cml0YWJsZUhpZ2hXYXRlck1hcmsiLHtlbnVtZXJhYmxlOmZhbHNlLGdldDpmdW5jdGlvbiBnZXQoKXtyZXR1cm4gdGhpcy5fd3JpdGFibGVTdGF0ZS5oaWdoV2F0ZXJNYXJrfX0pO2Z1bmN0aW9uIHdyaXRlT3JCdWZmZXIoc3RyZWFtLHN0YXRlLGlzQnVmLGNodW5rLGVuY29kaW5nLGNiKXtpZighaXNCdWYpe3ZhciBuZXdDaHVuaz1kZWNvZGVDaHVuayhzdGF0ZSxjaHVuayxlbmNvZGluZyk7aWYoY2h1bmshPT1uZXdDaHVuayl7aXNCdWY9dHJ1ZTtlbmNvZGluZz0iYnVmZmVyIjtjaHVuaz1uZXdDaHVua319dmFyIGxlbj1zdGF0ZS5vYmplY3RNb2RlPzE6Y2h1bmsubGVuZ3RoO3N0YXRlLmxlbmd0aCs9bGVuO3ZhciByZXQ9c3RhdGUubGVuZ3RoPHN0YXRlLmhpZ2hXYXRlck1hcms7aWYoIXJldClzdGF0ZS5uZWVkRHJhaW49dHJ1ZTtpZihzdGF0ZS53cml0aW5nfHxzdGF0ZS5jb3JrZWQpe3ZhciBsYXN0PXN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3Q7c3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdD17Y2h1bms6Y2h1bmssZW5jb2Rpbmc6ZW5jb2RpbmcsaXNCdWY6aXNCdWYsY2FsbGJhY2s6Y2IsbmV4dDpudWxsfTtpZihsYXN0KXtsYXN0Lm5leHQ9c3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdH1lbHNle3N0YXRlLmJ1ZmZlcmVkUmVxdWVzdD1zdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0fXN0YXRlLmJ1ZmZlcmVkUmVxdWVzdENvdW50Kz0xfWVsc2V7ZG9Xcml0ZShzdHJlYW0sc3RhdGUsZmFsc2UsbGVuLGNodW5rLGVuY29kaW5nLGNiKX1yZXR1cm4gcmV0fWZ1bmN0aW9uIGRvV3JpdGUoc3RyZWFtLHN0YXRlLHdyaXRldixsZW4sY2h1bmssZW5jb2RpbmcsY2Ipe3N0YXRlLndyaXRlbGVuPWxlbjtzdGF0ZS53cml0ZWNiPWNiO3N0YXRlLndyaXRpbmc9dHJ1ZTtzdGF0ZS5zeW5jPXRydWU7aWYoc3RhdGUuZGVzdHJveWVkKXN0YXRlLm9ud3JpdGUobmV3IEVSUl9TVFJFQU1fREVTVFJPWUVEKCJ3cml0ZSIpKTtlbHNlIGlmKHdyaXRldilzdHJlYW0uX3dyaXRldihjaHVuayxzdGF0ZS5vbndyaXRlKTtlbHNlIHN0cmVhbS5fd3JpdGUoY2h1bmssZW5jb2Rpbmcsc3RhdGUub253cml0ZSk7c3RhdGUuc3luYz1mYWxzZX1mdW5jdGlvbiBvbndyaXRlRXJyb3Ioc3RyZWFtLHN0YXRlLHN5bmMsZXIsY2Ipey0tc3RhdGUucGVuZGluZ2NiO2lmKHN5bmMpe3Byb2Nlc3MubmV4dFRpY2soY2IsZXIpO3Byb2Nlc3MubmV4dFRpY2soZmluaXNoTWF5YmUsc3RyZWFtLHN0YXRlKTtzdHJlYW0uX3dyaXRhYmxlU3RhdGUuZXJyb3JFbWl0dGVkPXRydWU7ZXJyb3JPckRlc3Ryb3koc3RyZWFtLGVyKX1lbHNle2NiKGVyKTtzdHJlYW0uX3dyaXRhYmxlU3RhdGUuZXJyb3JFbWl0dGVkPXRydWU7ZXJyb3JPckRlc3Ryb3koc3RyZWFtLGVyKTtmaW5pc2hNYXliZShzdHJlYW0sc3RhdGUpfX1mdW5jdGlvbiBvbndyaXRlU3RhdGVVcGRhdGUoc3RhdGUpe3N0YXRlLndyaXRpbmc9ZmFsc2U7c3RhdGUud3JpdGVjYj1udWxsO3N0YXRlLmxlbmd0aC09c3RhdGUud3JpdGVsZW47c3RhdGUud3JpdGVsZW49MH1mdW5jdGlvbiBvbndyaXRlKHN0cmVhbSxlcil7dmFyIHN0YXRlPXN0cmVhbS5fd3JpdGFibGVTdGF0ZTt2YXIgc3luYz1zdGF0ZS5zeW5jO3ZhciBjYj1zdGF0ZS53cml0ZWNiO2lmKHR5cGVvZiBjYiE9PSJmdW5jdGlvbiIpdGhyb3cgbmV3IEVSUl9NVUxUSVBMRV9DQUxMQkFDSztvbndyaXRlU3RhdGVVcGRhdGUoc3RhdGUpO2lmKGVyKW9ud3JpdGVFcnJvcihzdHJlYW0sc3RhdGUsc3luYyxlcixjYik7ZWxzZXt2YXIgZmluaXNoZWQ9bmVlZEZpbmlzaChzdGF0ZSl8fHN0cmVhbS5kZXN0cm95ZWQ7aWYoIWZpbmlzaGVkJiYhc3RhdGUuY29ya2VkJiYhc3RhdGUuYnVmZmVyUHJvY2Vzc2luZyYmc3RhdGUuYnVmZmVyZWRSZXF1ZXN0KXtjbGVhckJ1ZmZlcihzdHJlYW0sc3RhdGUpfWlmKHN5bmMpe3Byb2Nlc3MubmV4dFRpY2soYWZ0ZXJXcml0ZSxzdHJlYW0sc3RhdGUsZmluaXNoZWQsY2IpfWVsc2V7YWZ0ZXJXcml0ZShzdHJlYW0sc3RhdGUsZmluaXNoZWQsY2IpfX19ZnVuY3Rpb24gYWZ0ZXJXcml0ZShzdHJlYW0sc3RhdGUsZmluaXNoZWQsY2Ipe2lmKCFmaW5pc2hlZClvbndyaXRlRHJhaW4oc3RyZWFtLHN0YXRlKTtzdGF0ZS5wZW5kaW5nY2ItLTtjYigpO2ZpbmlzaE1heWJlKHN0cmVhbSxzdGF0ZSl9ZnVuY3Rpb24gb253cml0ZURyYWluKHN0cmVhbSxzdGF0ZSl7aWYoc3RhdGUubGVuZ3RoPT09MCYmc3RhdGUubmVlZERyYWluKXtzdGF0ZS5uZWVkRHJhaW49ZmFsc2U7c3RyZWFtLmVtaXQoImRyYWluIil9fWZ1bmN0aW9uIGNsZWFyQnVmZmVyKHN0cmVhbSxzdGF0ZSl7c3RhdGUuYnVmZmVyUHJvY2Vzc2luZz10cnVlO3ZhciBlbnRyeT1zdGF0ZS5idWZmZXJlZFJlcXVlc3Q7aWYoc3RyZWFtLl93cml0ZXYmJmVudHJ5JiZlbnRyeS5uZXh0KXt2YXIgbD1zdGF0ZS5idWZmZXJlZFJlcXVlc3RDb3VudDt2YXIgYnVmZmVyPW5ldyBBcnJheShsKTt2YXIgaG9sZGVyPXN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZTtob2xkZXIuZW50cnk9ZW50cnk7dmFyIGNvdW50PTA7dmFyIGFsbEJ1ZmZlcnM9dHJ1ZTt3aGlsZShlbnRyeSl7YnVmZmVyW2NvdW50XT1lbnRyeTtpZighZW50cnkuaXNCdWYpYWxsQnVmZmVycz1mYWxzZTtlbnRyeT1lbnRyeS5uZXh0O2NvdW50Kz0xfWJ1ZmZlci5hbGxCdWZmZXJzPWFsbEJ1ZmZlcnM7ZG9Xcml0ZShzdHJlYW0sc3RhdGUsdHJ1ZSxzdGF0ZS5sZW5ndGgsYnVmZmVyLCIiLGhvbGRlci5maW5pc2gpO3N0YXRlLnBlbmRpbmdjYisrO3N0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3Q9bnVsbDtpZihob2xkZXIubmV4dCl7c3RhdGUuY29ya2VkUmVxdWVzdHNGcmVlPWhvbGRlci5uZXh0O2hvbGRlci5uZXh0PW51bGx9ZWxzZXtzdGF0ZS5jb3JrZWRSZXF1ZXN0c0ZyZWU9bmV3IENvcmtlZFJlcXVlc3Qoc3RhdGUpfXN0YXRlLmJ1ZmZlcmVkUmVxdWVzdENvdW50PTB9ZWxzZXt3aGlsZShlbnRyeSl7dmFyIGNodW5rPWVudHJ5LmNodW5rO3ZhciBlbmNvZGluZz1lbnRyeS5lbmNvZGluZzt2YXIgY2I9ZW50cnkuY2FsbGJhY2s7dmFyIGxlbj1zdGF0ZS5vYmplY3RNb2RlPzE6Y2h1bmsubGVuZ3RoO2RvV3JpdGUoc3RyZWFtLHN0YXRlLGZhbHNlLGxlbixjaHVuayxlbmNvZGluZyxjYik7ZW50cnk9ZW50cnkubmV4dDtzdGF0ZS5idWZmZXJlZFJlcXVlc3RDb3VudC0tO2lmKHN0YXRlLndyaXRpbmcpe2JyZWFrfX1pZihlbnRyeT09PW51bGwpc3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdD1udWxsfXN0YXRlLmJ1ZmZlcmVkUmVxdWVzdD1lbnRyeTtzdGF0ZS5idWZmZXJQcm9jZXNzaW5nPWZhbHNlfVdyaXRhYmxlLnByb3RvdHlwZS5fd3JpdGU9ZnVuY3Rpb24oY2h1bmssZW5jb2RpbmcsY2Ipe2NiKG5ldyBFUlJfTUVUSE9EX05PVF9JTVBMRU1FTlRFRCgiX3dyaXRlKCkiKSl9O1dyaXRhYmxlLnByb3RvdHlwZS5fd3JpdGV2PW51bGw7V3JpdGFibGUucHJvdG90eXBlLmVuZD1mdW5jdGlvbihjaHVuayxlbmNvZGluZyxjYil7dmFyIHN0YXRlPXRoaXMuX3dyaXRhYmxlU3RhdGU7aWYodHlwZW9mIGNodW5rPT09ImZ1bmN0aW9uIil7Y2I9Y2h1bms7Y2h1bms9bnVsbDtlbmNvZGluZz1udWxsfWVsc2UgaWYodHlwZW9mIGVuY29kaW5nPT09ImZ1bmN0aW9uIil7Y2I9ZW5jb2Rpbmc7ZW5jb2Rpbmc9bnVsbH1pZihjaHVuayE9PW51bGwmJmNodW5rIT09dW5kZWZpbmVkKXRoaXMud3JpdGUoY2h1bmssZW5jb2RpbmcpO2lmKHN0YXRlLmNvcmtlZCl7c3RhdGUuY29ya2VkPTE7dGhpcy51bmNvcmsoKX1pZighc3RhdGUuZW5kaW5nKWVuZFdyaXRhYmxlKHRoaXMsc3RhdGUsY2IpO3JldHVybiB0aGlzfTtPYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGFibGUucHJvdG90eXBlLCJ3cml0YWJsZUxlbmd0aCIse2VudW1lcmFibGU6ZmFsc2UsZ2V0OmZ1bmN0aW9uIGdldCgpe3JldHVybiB0aGlzLl93cml0YWJsZVN0YXRlLmxlbmd0aH19KTtmdW5jdGlvbiBuZWVkRmluaXNoKHN0YXRlKXtyZXR1cm4gc3RhdGUuZW5kaW5nJiZzdGF0ZS5sZW5ndGg9PT0wJiZzdGF0ZS5idWZmZXJlZFJlcXVlc3Q9PT1udWxsJiYhc3RhdGUuZmluaXNoZWQmJiFzdGF0ZS53cml0aW5nfWZ1bmN0aW9uIGNhbGxGaW5hbChzdHJlYW0sc3RhdGUpe3N0cmVhbS5fZmluYWwoZnVuY3Rpb24oZXJyKXtzdGF0ZS5wZW5kaW5nY2ItLTtpZihlcnIpe2Vycm9yT3JEZXN0cm95KHN0cmVhbSxlcnIpfXN0YXRlLnByZWZpbmlzaGVkPXRydWU7c3RyZWFtLmVtaXQoInByZWZpbmlzaCIpO2ZpbmlzaE1heWJlKHN0cmVhbSxzdGF0ZSl9KX1mdW5jdGlvbiBwcmVmaW5pc2goc3RyZWFtLHN0YXRlKXtpZighc3RhdGUucHJlZmluaXNoZWQmJiFzdGF0ZS5maW5hbENhbGxlZCl7aWYodHlwZW9mIHN0cmVhbS5fZmluYWw9PT0iZnVuY3Rpb24iJiYhc3RhdGUuZGVzdHJveWVkKXtzdGF0ZS5wZW5kaW5nY2IrKztzdGF0ZS5maW5hbENhbGxlZD10cnVlO3Byb2Nlc3MubmV4dFRpY2soY2FsbEZpbmFsLHN0cmVhbSxzdGF0ZSl9ZWxzZXtzdGF0ZS5wcmVmaW5pc2hlZD10cnVlO3N0cmVhbS5lbWl0KCJwcmVmaW5pc2giKX19fWZ1bmN0aW9uIGZpbmlzaE1heWJlKHN0cmVhbSxzdGF0ZSl7dmFyIG5lZWQ9bmVlZEZpbmlzaChzdGF0ZSk7aWYobmVlZCl7cHJlZmluaXNoKHN0cmVhbSxzdGF0ZSk7aWYoc3RhdGUucGVuZGluZ2NiPT09MCl7c3RhdGUuZmluaXNoZWQ9dHJ1ZTtzdHJlYW0uZW1pdCgiZmluaXNoIik7aWYoc3RhdGUuYXV0b0Rlc3Ryb3kpe3ZhciByU3RhdGU9c3RyZWFtLl9yZWFkYWJsZVN0YXRlO2lmKCFyU3RhdGV8fHJTdGF0ZS5hdXRvRGVzdHJveSYmclN0YXRlLmVuZEVtaXR0ZWQpe3N0cmVhbS5kZXN0cm95KCl9fX19cmV0dXJuIG5lZWR9ZnVuY3Rpb24gZW5kV3JpdGFibGUoc3RyZWFtLHN0YXRlLGNiKXtzdGF0ZS5lbmRpbmc9dHJ1ZTtmaW5pc2hNYXliZShzdHJlYW0sc3RhdGUpO2lmKGNiKXtpZihzdGF0ZS5maW5pc2hlZClwcm9jZXNzLm5leHRUaWNrKGNiKTtlbHNlIHN0cmVhbS5vbmNlKCJmaW5pc2giLGNiKX1zdGF0ZS5lbmRlZD10cnVlO3N0cmVhbS53cml0YWJsZT1mYWxzZX1mdW5jdGlvbiBvbkNvcmtlZEZpbmlzaChjb3JrUmVxLHN0YXRlLGVycil7dmFyIGVudHJ5PWNvcmtSZXEuZW50cnk7Y29ya1JlcS5lbnRyeT1udWxsO3doaWxlKGVudHJ5KXt2YXIgY2I9ZW50cnkuY2FsbGJhY2s7c3RhdGUucGVuZGluZ2NiLS07Y2IoZXJyKTtlbnRyeT1lbnRyeS5uZXh0fXN0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZS5uZXh0PWNvcmtSZXF9T2JqZWN0LmRlZmluZVByb3BlcnR5KFdyaXRhYmxlLnByb3RvdHlwZSwiZGVzdHJveWVkIix7ZW51bWVyYWJsZTpmYWxzZSxnZXQ6ZnVuY3Rpb24gZ2V0KCl7aWYodGhpcy5fd3JpdGFibGVTdGF0ZT09PXVuZGVmaW5lZCl7cmV0dXJuIGZhbHNlfXJldHVybiB0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZH0sc2V0OmZ1bmN0aW9uIHNldCh2YWx1ZSl7aWYoIXRoaXMuX3dyaXRhYmxlU3RhdGUpe3JldHVybn10aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZD12YWx1ZX19KTtXcml0YWJsZS5wcm90b3R5cGUuZGVzdHJveT1kZXN0cm95SW1wbC5kZXN0cm95O1dyaXRhYmxlLnByb3RvdHlwZS5fdW5kZXN0cm95PWRlc3Ryb3lJbXBsLnVuZGVzdHJveTtXcml0YWJsZS5wcm90b3R5cGUuX2Rlc3Ryb3k9ZnVuY3Rpb24oZXJyLGNiKXtjYihlcnIpfX0pLmNhbGwodGhpcyxyZXF1aXJlKCJfcHJvY2VzcyIpLHR5cGVvZiBnbG9iYWwhPT0idW5kZWZpbmVkIj9nbG9iYWw6dHlwZW9mIHNlbGYhPT0idW5kZWZpbmVkIj9zZWxmOnR5cGVvZiB3aW5kb3chPT0idW5kZWZpbmVkIj93aW5kb3c6e30pfSx7Ii4uL2Vycm9ycyI6NjcsIi4vX3N0cmVhbV9kdXBsZXgiOjY4LCIuL2ludGVybmFsL3N0cmVhbXMvZGVzdHJveSI6NzUsIi4vaW50ZXJuYWwvc3RyZWFtcy9zdGF0ZSI6NzksIi4vaW50ZXJuYWwvc3RyZWFtcy9zdHJlYW0iOjgwLF9wcm9jZXNzOjY2LGJ1ZmZlcjoyNyxpbmhlcml0czozNiwidXRpbC1kZXByZWNhdGUiOjEyMH1dLDczOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24ocHJvY2Vzcyl7InVzZSBzdHJpY3QiO3ZhciBfT2JqZWN0JHNldFByb3RvdHlwZU87ZnVuY3Rpb24gX2RlZmluZVByb3BlcnR5KG9iaixrZXksdmFsdWUpe2lmKGtleSBpbiBvYmope09iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosa2V5LHt2YWx1ZTp2YWx1ZSxlbnVtZXJhYmxlOnRydWUsY29uZmlndXJhYmxlOnRydWUsd3JpdGFibGU6dHJ1ZX0pfWVsc2V7b2JqW2tleV09dmFsdWV9cmV0dXJuIG9ian12YXIgZmluaXNoZWQ9cmVxdWlyZSgiLi9lbmQtb2Ytc3RyZWFtIik7dmFyIGtMYXN0UmVzb2x2ZT1TeW1ib2woImxhc3RSZXNvbHZlIik7dmFyIGtMYXN0UmVqZWN0PVN5bWJvbCgibGFzdFJlamVjdCIpO3ZhciBrRXJyb3I9U3ltYm9sKCJlcnJvciIpO3ZhciBrRW5kZWQ9U3ltYm9sKCJlbmRlZCIpO3ZhciBrTGFzdFByb21pc2U9U3ltYm9sKCJsYXN0UHJvbWlzZSIpO3ZhciBrSGFuZGxlUHJvbWlzZT1TeW1ib2woImhhbmRsZVByb21pc2UiKTt2YXIga1N0cmVhbT1TeW1ib2woInN0cmVhbSIpO2Z1bmN0aW9uIGNyZWF0ZUl0ZXJSZXN1bHQodmFsdWUsZG9uZSl7cmV0dXJue3ZhbHVlOnZhbHVlLGRvbmU6ZG9uZX19ZnVuY3Rpb24gcmVhZEFuZFJlc29sdmUoaXRlcil7dmFyIHJlc29sdmU9aXRlcltrTGFzdFJlc29sdmVdO2lmKHJlc29sdmUhPT1udWxsKXt2YXIgZGF0YT1pdGVyW2tTdHJlYW1dLnJlYWQoKTtpZihkYXRhIT09bnVsbCl7aXRlcltrTGFzdFByb21pc2VdPW51bGw7aXRlcltrTGFzdFJlc29sdmVdPW51bGw7aXRlcltrTGFzdFJlamVjdF09bnVsbDtyZXNvbHZlKGNyZWF0ZUl0ZXJSZXN1bHQoZGF0YSxmYWxzZSkpfX19ZnVuY3Rpb24gb25SZWFkYWJsZShpdGVyKXtwcm9jZXNzLm5leHRUaWNrKHJlYWRBbmRSZXNvbHZlLGl0ZXIpfWZ1bmN0aW9uIHdyYXBGb3JOZXh0KGxhc3RQcm9taXNlLGl0ZXIpe3JldHVybiBmdW5jdGlvbihyZXNvbHZlLHJlamVjdCl7bGFzdFByb21pc2UudGhlbihmdW5jdGlvbigpe2lmKGl0ZXJba0VuZGVkXSl7cmVzb2x2ZShjcmVhdGVJdGVyUmVzdWx0KHVuZGVmaW5lZCx0cnVlKSk7cmV0dXJufWl0ZXJba0hhbmRsZVByb21pc2VdKHJlc29sdmUscmVqZWN0KX0scmVqZWN0KX19dmFyIEFzeW5jSXRlcmF0b3JQcm90b3R5cGU9T2JqZWN0LmdldFByb3RvdHlwZU9mKGZ1bmN0aW9uKCl7fSk7dmFyIFJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvclByb3RvdHlwZT1PYmplY3Quc2V0UHJvdG90eXBlT2YoKF9PYmplY3Qkc2V0UHJvdG90eXBlTz17Z2V0IHN0cmVhbSgpe3JldHVybiB0aGlzW2tTdHJlYW1dfSxuZXh0OmZ1bmN0aW9uIG5leHQoKXt2YXIgX3RoaXM9dGhpczt2YXIgZXJyb3I9dGhpc1trRXJyb3JdO2lmKGVycm9yIT09bnVsbCl7cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKX1pZih0aGlzW2tFbmRlZF0pe3JldHVybiBQcm9taXNlLnJlc29sdmUoY3JlYXRlSXRlclJlc3VsdCh1bmRlZmluZWQsdHJ1ZSkpfWlmKHRoaXNba1N0cmVhbV0uZGVzdHJveWVkKXtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSxyZWplY3Qpe3Byb2Nlc3MubmV4dFRpY2soZnVuY3Rpb24oKXtpZihfdGhpc1trRXJyb3JdKXtyZWplY3QoX3RoaXNba0Vycm9yXSl9ZWxzZXtyZXNvbHZlKGNyZWF0ZUl0ZXJSZXN1bHQodW5kZWZpbmVkLHRydWUpKX19KX0pfXZhciBsYXN0UHJvbWlzZT10aGlzW2tMYXN0UHJvbWlzZV07dmFyIHByb21pc2U7aWYobGFzdFByb21pc2Upe3Byb21pc2U9bmV3IFByb21pc2Uod3JhcEZvck5leHQobGFzdFByb21pc2UsdGhpcykpfWVsc2V7dmFyIGRhdGE9dGhpc1trU3RyZWFtXS5yZWFkKCk7aWYoZGF0YSE9PW51bGwpe3JldHVybiBQcm9taXNlLnJlc29sdmUoY3JlYXRlSXRlclJlc3VsdChkYXRhLGZhbHNlKSl9cHJvbWlzZT1uZXcgUHJvbWlzZSh0aGlzW2tIYW5kbGVQcm9taXNlXSl9dGhpc1trTGFzdFByb21pc2VdPXByb21pc2U7cmV0dXJuIHByb21pc2V9fSxfZGVmaW5lUHJvcGVydHkoX09iamVjdCRzZXRQcm90b3R5cGVPLFN5bWJvbC5hc3luY0l0ZXJhdG9yLGZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9KSxfZGVmaW5lUHJvcGVydHkoX09iamVjdCRzZXRQcm90b3R5cGVPLCJyZXR1cm4iLGZ1bmN0aW9uIF9yZXR1cm4oKXt2YXIgX3RoaXMyPXRoaXM7cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUscmVqZWN0KXtfdGhpczJba1N0cmVhbV0uZGVzdHJveShudWxsLGZ1bmN0aW9uKGVycil7aWYoZXJyKXtyZWplY3QoZXJyKTtyZXR1cm59cmVzb2x2ZShjcmVhdGVJdGVyUmVzdWx0KHVuZGVmaW5lZCx0cnVlKSl9KX0pfSksX09iamVjdCRzZXRQcm90b3R5cGVPKSxBc3luY0l0ZXJhdG9yUHJvdG90eXBlKTt2YXIgY3JlYXRlUmVhZGFibGVTdHJlYW1Bc3luY0l0ZXJhdG9yPWZ1bmN0aW9uIGNyZWF0ZVJlYWRhYmxlU3RyZWFtQXN5bmNJdGVyYXRvcihzdHJlYW0pe3ZhciBfT2JqZWN0JGNyZWF0ZTt2YXIgaXRlcmF0b3I9T2JqZWN0LmNyZWF0ZShSZWFkYWJsZVN0cmVhbUFzeW5jSXRlcmF0b3JQcm90b3R5cGUsKF9PYmplY3QkY3JlYXRlPXt9LF9kZWZpbmVQcm9wZXJ0eShfT2JqZWN0JGNyZWF0ZSxrU3RyZWFtLHt2YWx1ZTpzdHJlYW0sd3JpdGFibGU6dHJ1ZX0pLF9kZWZpbmVQcm9wZXJ0eShfT2JqZWN0JGNyZWF0ZSxrTGFzdFJlc29sdmUse3ZhbHVlOm51bGwsd3JpdGFibGU6dHJ1ZX0pLF9kZWZpbmVQcm9wZXJ0eShfT2JqZWN0JGNyZWF0ZSxrTGFzdFJlamVjdCx7dmFsdWU6bnVsbCx3cml0YWJsZTp0cnVlfSksX2RlZmluZVByb3BlcnR5KF9PYmplY3QkY3JlYXRlLGtFcnJvcix7dmFsdWU6bnVsbCx3cml0YWJsZTp0cnVlfSksX2RlZmluZVByb3BlcnR5KF9PYmplY3QkY3JlYXRlLGtFbmRlZCx7dmFsdWU6c3RyZWFtLl9yZWFkYWJsZVN0YXRlLmVuZEVtaXR0ZWQsd3JpdGFibGU6dHJ1ZX0pLF9kZWZpbmVQcm9wZXJ0eShfT2JqZWN0JGNyZWF0ZSxrSGFuZGxlUHJvbWlzZSx7dmFsdWU6ZnVuY3Rpb24gdmFsdWUocmVzb2x2ZSxyZWplY3Qpe3ZhciBkYXRhPWl0ZXJhdG9yW2tTdHJlYW1dLnJlYWQoKTtpZihkYXRhKXtpdGVyYXRvcltrTGFzdFByb21pc2VdPW51bGw7aXRlcmF0b3Jba0xhc3RSZXNvbHZlXT1udWxsO2l0ZXJhdG9yW2tMYXN0UmVqZWN0XT1udWxsO3Jlc29sdmUoY3JlYXRlSXRlclJlc3VsdChkYXRhLGZhbHNlKSl9ZWxzZXtpdGVyYXRvcltrTGFzdFJlc29sdmVdPXJlc29sdmU7aXRlcmF0b3Jba0xhc3RSZWplY3RdPXJlamVjdH19LHdyaXRhYmxlOnRydWV9KSxfT2JqZWN0JGNyZWF0ZSkpO2l0ZXJhdG9yW2tMYXN0UHJvbWlzZV09bnVsbDtmaW5pc2hlZChzdHJlYW0sZnVuY3Rpb24oZXJyKXtpZihlcnImJmVyci5jb2RlIT09IkVSUl9TVFJFQU1fUFJFTUFUVVJFX0NMT1NFIil7dmFyIHJlamVjdD1pdGVyYXRvcltrTGFzdFJlamVjdF07aWYocmVqZWN0IT09bnVsbCl7aXRlcmF0b3Jba0xhc3RQcm9taXNlXT1udWxsO2l0ZXJhdG9yW2tMYXN0UmVzb2x2ZV09bnVsbDtpdGVyYXRvcltrTGFzdFJlamVjdF09bnVsbDtyZWplY3QoZXJyKX1pdGVyYXRvcltrRXJyb3JdPWVycjtyZXR1cm59dmFyIHJlc29sdmU9aXRlcmF0b3Jba0xhc3RSZXNvbHZlXTtpZihyZXNvbHZlIT09bnVsbCl7aXRlcmF0b3Jba0xhc3RQcm9taXNlXT1udWxsO2l0ZXJhdG9yW2tMYXN0UmVzb2x2ZV09bnVsbDtpdGVyYXRvcltrTGFzdFJlamVjdF09bnVsbDtyZXNvbHZlKGNyZWF0ZUl0ZXJSZXN1bHQodW5kZWZpbmVkLHRydWUpKX1pdGVyYXRvcltrRW5kZWRdPXRydWV9KTtzdHJlYW0ub24oInJlYWRhYmxlIixvblJlYWRhYmxlLmJpbmQobnVsbCxpdGVyYXRvcikpO3JldHVybiBpdGVyYXRvcn07bW9kdWxlLmV4cG9ydHM9Y3JlYXRlUmVhZGFibGVTdHJlYW1Bc3luY0l0ZXJhdG9yfSkuY2FsbCh0aGlzLHJlcXVpcmUoIl9wcm9jZXNzIikpfSx7Ii4vZW5kLW9mLXN0cmVhbSI6NzYsX3Byb2Nlc3M6NjZ9XSw3NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO2Z1bmN0aW9uIG93bktleXMob2JqZWN0LGVudW1lcmFibGVPbmx5KXt2YXIga2V5cz1PYmplY3Qua2V5cyhvYmplY3QpO2lmKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpe3ZhciBzeW1ib2xzPU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KTtpZihlbnVtZXJhYmxlT25seSlzeW1ib2xzPXN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uKHN5bSl7cmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LHN5bSkuZW51bWVyYWJsZX0pO2tleXMucHVzaC5hcHBseShrZXlzLHN5bWJvbHMpfXJldHVybiBrZXlzfWZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KXtmb3IodmFyIGk9MTtpPGFyZ3VtZW50cy5sZW5ndGg7aSsrKXt2YXIgc291cmNlPWFyZ3VtZW50c1tpXSE9bnVsbD9hcmd1bWVudHNbaV06e307aWYoaSUyKXtvd25LZXlzKE9iamVjdChzb3VyY2UpLHRydWUpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtfZGVmaW5lUHJvcGVydHkodGFyZ2V0LGtleSxzb3VyY2Vba2V5XSl9KX1lbHNlIGlmKE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKXtPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSl9ZWxzZXtvd25LZXlzKE9iamVjdChzb3VyY2UpKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7T2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCxrZXksT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2Usa2V5KSl9KX19cmV0dXJuIHRhcmdldH1mdW5jdGlvbiBfZGVmaW5lUHJvcGVydHkob2JqLGtleSx2YWx1ZSl7aWYoa2V5IGluIG9iail7T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaixrZXkse3ZhbHVlOnZhbHVlLGVudW1lcmFibGU6dHJ1ZSxjb25maWd1cmFibGU6dHJ1ZSx3cml0YWJsZTp0cnVlfSl9ZWxzZXtvYmpba2V5XT12YWx1ZX1yZXR1cm4gb2JqfWZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSxDb25zdHJ1Y3Rvcil7aWYoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl7dGhyb3cgbmV3IFR5cGVFcnJvcigiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uIil9fWZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCxwcm9wcyl7Zm9yKHZhciBpPTA7aTxwcm9wcy5sZW5ndGg7aSsrKXt2YXIgZGVzY3JpcHRvcj1wcm9wc1tpXTtkZXNjcmlwdG9yLmVudW1lcmFibGU9ZGVzY3JpcHRvci5lbnVtZXJhYmxlfHxmYWxzZTtkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZT10cnVlO2lmKCJ2YWx1ZSJpbiBkZXNjcmlwdG9yKWRlc2NyaXB0b3Iud3JpdGFibGU9dHJ1ZTtPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LGRlc2NyaXB0b3Iua2V5LGRlc2NyaXB0b3IpfX1mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IscHJvdG9Qcm9wcyxzdGF0aWNQcm9wcyl7aWYocHJvdG9Qcm9wcylfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUscHJvdG9Qcm9wcyk7aWYoc3RhdGljUHJvcHMpX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3Isc3RhdGljUHJvcHMpO3JldHVybiBDb25zdHJ1Y3Rvcn12YXIgX3JlcXVpcmU9cmVxdWlyZSgiYnVmZmVyIiksQnVmZmVyPV9yZXF1aXJlLkJ1ZmZlcjt2YXIgX3JlcXVpcmUyPXJlcXVpcmUoInV0aWwiKSxpbnNwZWN0PV9yZXF1aXJlMi5pbnNwZWN0O3ZhciBjdXN0b209aW5zcGVjdCYmaW5zcGVjdC5jdXN0b218fCJpbnNwZWN0IjtmdW5jdGlvbiBjb3B5QnVmZmVyKHNyYyx0YXJnZXQsb2Zmc2V0KXtCdWZmZXIucHJvdG90eXBlLmNvcHkuY2FsbChzcmMsdGFyZ2V0LG9mZnNldCl9bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBCdWZmZXJMaXN0KCl7X2NsYXNzQ2FsbENoZWNrKHRoaXMsQnVmZmVyTGlzdCk7dGhpcy5oZWFkPW51bGw7dGhpcy50YWlsPW51bGw7dGhpcy5sZW5ndGg9MH1fY3JlYXRlQ2xhc3MoQnVmZmVyTGlzdCxbe2tleToicHVzaCIsdmFsdWU6ZnVuY3Rpb24gcHVzaCh2KXt2YXIgZW50cnk9e2RhdGE6dixuZXh0Om51bGx9O2lmKHRoaXMubGVuZ3RoPjApdGhpcy50YWlsLm5leHQ9ZW50cnk7ZWxzZSB0aGlzLmhlYWQ9ZW50cnk7dGhpcy50YWlsPWVudHJ5OysrdGhpcy5sZW5ndGh9fSx7a2V5OiJ1bnNoaWZ0Iix2YWx1ZTpmdW5jdGlvbiB1bnNoaWZ0KHYpe3ZhciBlbnRyeT17ZGF0YTp2LG5leHQ6dGhpcy5oZWFkfTtpZih0aGlzLmxlbmd0aD09PTApdGhpcy50YWlsPWVudHJ5O3RoaXMuaGVhZD1lbnRyeTsrK3RoaXMubGVuZ3RofX0se2tleToic2hpZnQiLHZhbHVlOmZ1bmN0aW9uIHNoaWZ0KCl7aWYodGhpcy5sZW5ndGg9PT0wKXJldHVybjt2YXIgcmV0PXRoaXMuaGVhZC5kYXRhO2lmKHRoaXMubGVuZ3RoPT09MSl0aGlzLmhlYWQ9dGhpcy50YWlsPW51bGw7ZWxzZSB0aGlzLmhlYWQ9dGhpcy5oZWFkLm5leHQ7LS10aGlzLmxlbmd0aDtyZXR1cm4gcmV0fX0se2tleToiY2xlYXIiLHZhbHVlOmZ1bmN0aW9uIGNsZWFyKCl7dGhpcy5oZWFkPXRoaXMudGFpbD1udWxsO3RoaXMubGVuZ3RoPTB9fSx7a2V5OiJqb2luIix2YWx1ZTpmdW5jdGlvbiBqb2luKHMpe2lmKHRoaXMubGVuZ3RoPT09MClyZXR1cm4iIjt2YXIgcD10aGlzLmhlYWQ7dmFyIHJldD0iIitwLmRhdGE7d2hpbGUocD1wLm5leHQpe3JldCs9cytwLmRhdGF9cmV0dXJuIHJldH19LHtrZXk6ImNvbmNhdCIsdmFsdWU6ZnVuY3Rpb24gY29uY2F0KG4pe2lmKHRoaXMubGVuZ3RoPT09MClyZXR1cm4gQnVmZmVyLmFsbG9jKDApO3ZhciByZXQ9QnVmZmVyLmFsbG9jVW5zYWZlKG4+Pj4wKTt2YXIgcD10aGlzLmhlYWQ7dmFyIGk9MDt3aGlsZShwKXtjb3B5QnVmZmVyKHAuZGF0YSxyZXQsaSk7aSs9cC5kYXRhLmxlbmd0aDtwPXAubmV4dH1yZXR1cm4gcmV0fX0se2tleToiY29uc3VtZSIsdmFsdWU6ZnVuY3Rpb24gY29uc3VtZShuLGhhc1N0cmluZ3Mpe3ZhciByZXQ7aWYobjx0aGlzLmhlYWQuZGF0YS5sZW5ndGgpe3JldD10aGlzLmhlYWQuZGF0YS5zbGljZSgwLG4pO3RoaXMuaGVhZC5kYXRhPXRoaXMuaGVhZC5kYXRhLnNsaWNlKG4pfWVsc2UgaWYobj09PXRoaXMuaGVhZC5kYXRhLmxlbmd0aCl7cmV0PXRoaXMuc2hpZnQoKX1lbHNle3JldD1oYXNTdHJpbmdzP3RoaXMuX2dldFN0cmluZyhuKTp0aGlzLl9nZXRCdWZmZXIobil9cmV0dXJuIHJldH19LHtrZXk6ImZpcnN0Iix2YWx1ZTpmdW5jdGlvbiBmaXJzdCgpe3JldHVybiB0aGlzLmhlYWQuZGF0YX19LHtrZXk6Il9nZXRTdHJpbmciLHZhbHVlOmZ1bmN0aW9uIF9nZXRTdHJpbmcobil7dmFyIHA9dGhpcy5oZWFkO3ZhciBjPTE7dmFyIHJldD1wLmRhdGE7bi09cmV0Lmxlbmd0aDt3aGlsZShwPXAubmV4dCl7dmFyIHN0cj1wLmRhdGE7dmFyIG5iPW4+c3RyLmxlbmd0aD9zdHIubGVuZ3RoOm47aWYobmI9PT1zdHIubGVuZ3RoKXJldCs9c3RyO2Vsc2UgcmV0Kz1zdHIuc2xpY2UoMCxuKTtuLT1uYjtpZihuPT09MCl7aWYobmI9PT1zdHIubGVuZ3RoKXsrK2M7aWYocC5uZXh0KXRoaXMuaGVhZD1wLm5leHQ7ZWxzZSB0aGlzLmhlYWQ9dGhpcy50YWlsPW51bGx9ZWxzZXt0aGlzLmhlYWQ9cDtwLmRhdGE9c3RyLnNsaWNlKG5iKX1icmVha30rK2N9dGhpcy5sZW5ndGgtPWM7cmV0dXJuIHJldH19LHtrZXk6Il9nZXRCdWZmZXIiLHZhbHVlOmZ1bmN0aW9uIF9nZXRCdWZmZXIobil7dmFyIHJldD1CdWZmZXIuYWxsb2NVbnNhZmUobik7dmFyIHA9dGhpcy5oZWFkO3ZhciBjPTE7cC5kYXRhLmNvcHkocmV0KTtuLT1wLmRhdGEubGVuZ3RoO3doaWxlKHA9cC5uZXh0KXt2YXIgYnVmPXAuZGF0YTt2YXIgbmI9bj5idWYubGVuZ3RoP2J1Zi5sZW5ndGg6bjtidWYuY29weShyZXQscmV0Lmxlbmd0aC1uLDAsbmIpO24tPW5iO2lmKG49PT0wKXtpZihuYj09PWJ1Zi5sZW5ndGgpeysrYztpZihwLm5leHQpdGhpcy5oZWFkPXAubmV4dDtlbHNlIHRoaXMuaGVhZD10aGlzLnRhaWw9bnVsbH1lbHNle3RoaXMuaGVhZD1wO3AuZGF0YT1idWYuc2xpY2UobmIpfWJyZWFrfSsrY310aGlzLmxlbmd0aC09YztyZXR1cm4gcmV0fX0se2tleTpjdXN0b20sdmFsdWU6ZnVuY3Rpb24gdmFsdWUoXyxvcHRpb25zKXtyZXR1cm4gaW5zcGVjdCh0aGlzLF9vYmplY3RTcHJlYWQoe30sb3B0aW9ucyx7ZGVwdGg6MCxjdXN0b21JbnNwZWN0OmZhbHNlfSkpfX1dKTtyZXR1cm4gQnVmZmVyTGlzdH0oKX0se2J1ZmZlcjoyNyx1dGlsOjI2fV0sNzU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihwcm9jZXNzKXsidXNlIHN0cmljdCI7ZnVuY3Rpb24gZGVzdHJveShlcnIsY2Ipe3ZhciBfdGhpcz10aGlzO3ZhciByZWFkYWJsZURlc3Ryb3llZD10aGlzLl9yZWFkYWJsZVN0YXRlJiZ0aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZDt2YXIgd3JpdGFibGVEZXN0cm95ZWQ9dGhpcy5fd3JpdGFibGVTdGF0ZSYmdGhpcy5fd3JpdGFibGVTdGF0ZS5kZXN0cm95ZWQ7aWYocmVhZGFibGVEZXN0cm95ZWR8fHdyaXRhYmxlRGVzdHJveWVkKXtpZihjYil7Y2IoZXJyKX1lbHNlIGlmKGVycil7aWYoIXRoaXMuX3dyaXRhYmxlU3RhdGUpe3Byb2Nlc3MubmV4dFRpY2soZW1pdEVycm9yTlQsdGhpcyxlcnIpfWVsc2UgaWYoIXRoaXMuX3dyaXRhYmxlU3RhdGUuZXJyb3JFbWl0dGVkKXt0aGlzLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZD10cnVlO3Byb2Nlc3MubmV4dFRpY2soZW1pdEVycm9yTlQsdGhpcyxlcnIpfX1yZXR1cm4gdGhpc31pZih0aGlzLl9yZWFkYWJsZVN0YXRlKXt0aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZD10cnVlfWlmKHRoaXMuX3dyaXRhYmxlU3RhdGUpe3RoaXMuX3dyaXRhYmxlU3RhdGUuZGVzdHJveWVkPXRydWV9dGhpcy5fZGVzdHJveShlcnJ8fG51bGwsZnVuY3Rpb24oZXJyKXtpZighY2ImJmVycil7aWYoIV90aGlzLl93cml0YWJsZVN0YXRlKXtwcm9jZXNzLm5leHRUaWNrKGVtaXRFcnJvckFuZENsb3NlTlQsX3RoaXMsZXJyKX1lbHNlIGlmKCFfdGhpcy5fd3JpdGFibGVTdGF0ZS5lcnJvckVtaXR0ZWQpe190aGlzLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZD10cnVlO3Byb2Nlc3MubmV4dFRpY2soZW1pdEVycm9yQW5kQ2xvc2VOVCxfdGhpcyxlcnIpfWVsc2V7cHJvY2Vzcy5uZXh0VGljayhlbWl0Q2xvc2VOVCxfdGhpcyl9fWVsc2UgaWYoY2Ipe3Byb2Nlc3MubmV4dFRpY2soZW1pdENsb3NlTlQsX3RoaXMpO2NiKGVycil9ZWxzZXtwcm9jZXNzLm5leHRUaWNrKGVtaXRDbG9zZU5ULF90aGlzKX19KTtyZXR1cm4gdGhpc31mdW5jdGlvbiBlbWl0RXJyb3JBbmRDbG9zZU5UKHNlbGYsZXJyKXtlbWl0RXJyb3JOVChzZWxmLGVycik7ZW1pdENsb3NlTlQoc2VsZil9ZnVuY3Rpb24gZW1pdENsb3NlTlQoc2VsZil7aWYoc2VsZi5fd3JpdGFibGVTdGF0ZSYmIXNlbGYuX3dyaXRhYmxlU3RhdGUuZW1pdENsb3NlKXJldHVybjtpZihzZWxmLl9yZWFkYWJsZVN0YXRlJiYhc2VsZi5fcmVhZGFibGVTdGF0ZS5lbWl0Q2xvc2UpcmV0dXJuO3NlbGYuZW1pdCgiY2xvc2UiKX1mdW5jdGlvbiB1bmRlc3Ryb3koKXtpZih0aGlzLl9yZWFkYWJsZVN0YXRlKXt0aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZD1mYWxzZTt0aGlzLl9yZWFkYWJsZVN0YXRlLnJlYWRpbmc9ZmFsc2U7dGhpcy5fcmVhZGFibGVTdGF0ZS5lbmRlZD1mYWxzZTt0aGlzLl9yZWFkYWJsZVN0YXRlLmVuZEVtaXR0ZWQ9ZmFsc2V9aWYodGhpcy5fd3JpdGFibGVTdGF0ZSl7dGhpcy5fd3JpdGFibGVTdGF0ZS5kZXN0cm95ZWQ9ZmFsc2U7dGhpcy5fd3JpdGFibGVTdGF0ZS5lbmRlZD1mYWxzZTt0aGlzLl93cml0YWJsZVN0YXRlLmVuZGluZz1mYWxzZTt0aGlzLl93cml0YWJsZVN0YXRlLmZpbmFsQ2FsbGVkPWZhbHNlO3RoaXMuX3dyaXRhYmxlU3RhdGUucHJlZmluaXNoZWQ9ZmFsc2U7dGhpcy5fd3JpdGFibGVTdGF0ZS5maW5pc2hlZD1mYWxzZTt0aGlzLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZD1mYWxzZX19ZnVuY3Rpb24gZW1pdEVycm9yTlQoc2VsZixlcnIpe3NlbGYuZW1pdCgiZXJyb3IiLGVycil9ZnVuY3Rpb24gZXJyb3JPckRlc3Ryb3koc3RyZWFtLGVycil7dmFyIHJTdGF0ZT1zdHJlYW0uX3JlYWRhYmxlU3RhdGU7dmFyIHdTdGF0ZT1zdHJlYW0uX3dyaXRhYmxlU3RhdGU7aWYoclN0YXRlJiZyU3RhdGUuYXV0b0Rlc3Ryb3l8fHdTdGF0ZSYmd1N0YXRlLmF1dG9EZXN0cm95KXN0cmVhbS5kZXN0cm95KGVycik7ZWxzZSBzdHJlYW0uZW1pdCgiZXJyb3IiLGVycil9bW9kdWxlLmV4cG9ydHM9e2Rlc3Ryb3k6ZGVzdHJveSx1bmRlc3Ryb3k6dW5kZXN0cm95LGVycm9yT3JEZXN0cm95OmVycm9yT3JEZXN0cm95fX0pLmNhbGwodGhpcyxyZXF1aXJlKCJfcHJvY2VzcyIpKX0se19wcm9jZXNzOjY2fV0sNzY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyJ1c2Ugc3RyaWN0Ijt2YXIgRVJSX1NUUkVBTV9QUkVNQVRVUkVfQ0xPU0U9cmVxdWlyZSgiLi4vLi4vLi4vZXJyb3JzIikuY29kZXMuRVJSX1NUUkVBTV9QUkVNQVRVUkVfQ0xPU0U7ZnVuY3Rpb24gb25jZShjYWxsYmFjayl7dmFyIGNhbGxlZD1mYWxzZTtyZXR1cm4gZnVuY3Rpb24oKXtpZihjYWxsZWQpcmV0dXJuO2NhbGxlZD10cnVlO2Zvcih2YXIgX2xlbj1hcmd1bWVudHMubGVuZ3RoLGFyZ3M9bmV3IEFycmF5KF9sZW4pLF9rZXk9MDtfa2V5PF9sZW47X2tleSsrKXthcmdzW19rZXldPWFyZ3VtZW50c1tfa2V5XX1jYWxsYmFjay5hcHBseSh0aGlzLGFyZ3MpfX1mdW5jdGlvbiBub29wKCl7fWZ1bmN0aW9uIGlzUmVxdWVzdChzdHJlYW0pe3JldHVybiBzdHJlYW0uc2V0SGVhZGVyJiZ0eXBlb2Ygc3RyZWFtLmFib3J0PT09ImZ1bmN0aW9uIn1mdW5jdGlvbiBlb3Moc3RyZWFtLG9wdHMsY2FsbGJhY2spe2lmKHR5cGVvZiBvcHRzPT09ImZ1bmN0aW9uIilyZXR1cm4gZW9zKHN0cmVhbSxudWxsLG9wdHMpO2lmKCFvcHRzKW9wdHM9e307Y2FsbGJhY2s9b25jZShjYWxsYmFja3x8bm9vcCk7dmFyIHJlYWRhYmxlPW9wdHMucmVhZGFibGV8fG9wdHMucmVhZGFibGUhPT1mYWxzZSYmc3RyZWFtLnJlYWRhYmxlO3ZhciB3cml0YWJsZT1vcHRzLndyaXRhYmxlfHxvcHRzLndyaXRhYmxlIT09ZmFsc2UmJnN0cmVhbS53cml0YWJsZTt2YXIgb25sZWdhY3lmaW5pc2g9ZnVuY3Rpb24gb25sZWdhY3lmaW5pc2goKXtpZighc3RyZWFtLndyaXRhYmxlKW9uZmluaXNoKCl9O3ZhciB3cml0YWJsZUVuZGVkPXN0cmVhbS5fd3JpdGFibGVTdGF0ZSYmc3RyZWFtLl93cml0YWJsZVN0YXRlLmZpbmlzaGVkO3ZhciBvbmZpbmlzaD1mdW5jdGlvbiBvbmZpbmlzaCgpe3dyaXRhYmxlPWZhbHNlO3dyaXRhYmxlRW5kZWQ9dHJ1ZTtpZighcmVhZGFibGUpY2FsbGJhY2suY2FsbChzdHJlYW0pfTt2YXIgcmVhZGFibGVFbmRlZD1zdHJlYW0uX3JlYWRhYmxlU3RhdGUmJnN0cmVhbS5fcmVhZGFibGVTdGF0ZS5lbmRFbWl0dGVkO3ZhciBvbmVuZD1mdW5jdGlvbiBvbmVuZCgpe3JlYWRhYmxlPWZhbHNlO3JlYWRhYmxlRW5kZWQ9dHJ1ZTtpZighd3JpdGFibGUpY2FsbGJhY2suY2FsbChzdHJlYW0pfTt2YXIgb25lcnJvcj1mdW5jdGlvbiBvbmVycm9yKGVycil7Y2FsbGJhY2suY2FsbChzdHJlYW0sZXJyKX07dmFyIG9uY2xvc2U9ZnVuY3Rpb24gb25jbG9zZSgpe3ZhciBlcnI7aWYocmVhZGFibGUmJiFyZWFkYWJsZUVuZGVkKXtpZighc3RyZWFtLl9yZWFkYWJsZVN0YXRlfHwhc3RyZWFtLl9yZWFkYWJsZVN0YXRlLmVuZGVkKWVycj1uZXcgRVJSX1NUUkVBTV9QUkVNQVRVUkVfQ0xPU0U7cmV0dXJuIGNhbGxiYWNrLmNhbGwoc3RyZWFtLGVycil9aWYod3JpdGFibGUmJiF3cml0YWJsZUVuZGVkKXtpZighc3RyZWFtLl93cml0YWJsZVN0YXRlfHwhc3RyZWFtLl93cml0YWJsZVN0YXRlLmVuZGVkKWVycj1uZXcgRVJSX1NUUkVBTV9QUkVNQVRVUkVfQ0xPU0U7cmV0dXJuIGNhbGxiYWNrLmNhbGwoc3RyZWFtLGVycil9fTt2YXIgb25yZXF1ZXN0PWZ1bmN0aW9uIG9ucmVxdWVzdCgpe3N0cmVhbS5yZXEub24oImZpbmlzaCIsb25maW5pc2gpfTtpZihpc1JlcXVlc3Qoc3RyZWFtKSl7c3RyZWFtLm9uKCJjb21wbGV0ZSIsb25maW5pc2gpO3N0cmVhbS5vbigiYWJvcnQiLG9uY2xvc2UpO2lmKHN0cmVhbS5yZXEpb25yZXF1ZXN0KCk7ZWxzZSBzdHJlYW0ub24oInJlcXVlc3QiLG9ucmVxdWVzdCl9ZWxzZSBpZih3cml0YWJsZSYmIXN0cmVhbS5fd3JpdGFibGVTdGF0ZSl7c3RyZWFtLm9uKCJlbmQiLG9ubGVnYWN5ZmluaXNoKTtzdHJlYW0ub24oImNsb3NlIixvbmxlZ2FjeWZpbmlzaCl9c3RyZWFtLm9uKCJlbmQiLG9uZW5kKTtzdHJlYW0ub24oImZpbmlzaCIsb25maW5pc2gpO2lmKG9wdHMuZXJyb3IhPT1mYWxzZSlzdHJlYW0ub24oImVycm9yIixvbmVycm9yKTtzdHJlYW0ub24oImNsb3NlIixvbmNsb3NlKTtyZXR1cm4gZnVuY3Rpb24oKXtzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoImNvbXBsZXRlIixvbmZpbmlzaCk7c3RyZWFtLnJlbW92ZUxpc3RlbmVyKCJhYm9ydCIsb25jbG9zZSk7c3RyZWFtLnJlbW92ZUxpc3RlbmVyKCJyZXF1ZXN0IixvbnJlcXVlc3QpO2lmKHN0cmVhbS5yZXEpc3RyZWFtLnJlcS5yZW1vdmVMaXN0ZW5lcigiZmluaXNoIixvbmZpbmlzaCk7c3RyZWFtLnJlbW92ZUxpc3RlbmVyKCJlbmQiLG9ubGVnYWN5ZmluaXNoKTtzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoImNsb3NlIixvbmxlZ2FjeWZpbmlzaCk7c3RyZWFtLnJlbW92ZUxpc3RlbmVyKCJmaW5pc2giLG9uZmluaXNoKTtzdHJlYW0ucmVtb3ZlTGlzdGVuZXIoImVuZCIsb25lbmQpO3N0cmVhbS5yZW1vdmVMaXN0ZW5lcigiZXJyb3IiLG9uZXJyb3IpO3N0cmVhbS5yZW1vdmVMaXN0ZW5lcigiY2xvc2UiLG9uY2xvc2UpfX1tb2R1bGUuZXhwb3J0cz1lb3N9LHsiLi4vLi4vLi4vZXJyb3JzIjo2N31dLDc3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cz1mdW5jdGlvbigpe3Rocm93IG5ldyBFcnJvcigiUmVhZGFibGUuZnJvbSBpcyBub3QgYXZhaWxhYmxlIGluIHRoZSBicm93c2VyIil9fSx7fV0sNzg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyJ1c2Ugc3RyaWN0Ijt2YXIgZW9zO2Z1bmN0aW9uIG9uY2UoY2FsbGJhY2spe3ZhciBjYWxsZWQ9ZmFsc2U7cmV0dXJuIGZ1bmN0aW9uKCl7aWYoY2FsbGVkKXJldHVybjtjYWxsZWQ9dHJ1ZTtjYWxsYmFjay5hcHBseSh2b2lkIDAsYXJndW1lbnRzKX19dmFyIF9yZXF1aXJlJGNvZGVzPXJlcXVpcmUoIi4uLy4uLy4uL2Vycm9ycyIpLmNvZGVzLEVSUl9NSVNTSU5HX0FSR1M9X3JlcXVpcmUkY29kZXMuRVJSX01JU1NJTkdfQVJHUyxFUlJfU1RSRUFNX0RFU1RST1lFRD1fcmVxdWlyZSRjb2Rlcy5FUlJfU1RSRUFNX0RFU1RST1lFRDtmdW5jdGlvbiBub29wKGVycil7aWYoZXJyKXRocm93IGVycn1mdW5jdGlvbiBpc1JlcXVlc3Qoc3RyZWFtKXtyZXR1cm4gc3RyZWFtLnNldEhlYWRlciYmdHlwZW9mIHN0cmVhbS5hYm9ydD09PSJmdW5jdGlvbiJ9ZnVuY3Rpb24gZGVzdHJveWVyKHN0cmVhbSxyZWFkaW5nLHdyaXRpbmcsY2FsbGJhY2spe2NhbGxiYWNrPW9uY2UoY2FsbGJhY2spO3ZhciBjbG9zZWQ9ZmFsc2U7c3RyZWFtLm9uKCJjbG9zZSIsZnVuY3Rpb24oKXtjbG9zZWQ9dHJ1ZX0pO2lmKGVvcz09PXVuZGVmaW5lZCllb3M9cmVxdWlyZSgiLi9lbmQtb2Ytc3RyZWFtIik7ZW9zKHN0cmVhbSx7cmVhZGFibGU6cmVhZGluZyx3cml0YWJsZTp3cml0aW5nfSxmdW5jdGlvbihlcnIpe2lmKGVycilyZXR1cm4gY2FsbGJhY2soZXJyKTtjbG9zZWQ9dHJ1ZTtjYWxsYmFjaygpfSk7dmFyIGRlc3Ryb3llZD1mYWxzZTtyZXR1cm4gZnVuY3Rpb24oZXJyKXtpZihjbG9zZWQpcmV0dXJuO2lmKGRlc3Ryb3llZClyZXR1cm47ZGVzdHJveWVkPXRydWU7aWYoaXNSZXF1ZXN0KHN0cmVhbSkpcmV0dXJuIHN0cmVhbS5hYm9ydCgpO2lmKHR5cGVvZiBzdHJlYW0uZGVzdHJveT09PSJmdW5jdGlvbiIpcmV0dXJuIHN0cmVhbS5kZXN0cm95KCk7Y2FsbGJhY2soZXJyfHxuZXcgRVJSX1NUUkVBTV9ERVNUUk9ZRUQoInBpcGUiKSl9fWZ1bmN0aW9uIGNhbGwoZm4pe2ZuKCl9ZnVuY3Rpb24gcGlwZShmcm9tLHRvKXtyZXR1cm4gZnJvbS5waXBlKHRvKX1mdW5jdGlvbiBwb3BDYWxsYmFjayhzdHJlYW1zKXtpZighc3RyZWFtcy5sZW5ndGgpcmV0dXJuIG5vb3A7aWYodHlwZW9mIHN0cmVhbXNbc3RyZWFtcy5sZW5ndGgtMV0hPT0iZnVuY3Rpb24iKXJldHVybiBub29wO3JldHVybiBzdHJlYW1zLnBvcCgpfWZ1bmN0aW9uIHBpcGVsaW5lKCl7Zm9yKHZhciBfbGVuPWFyZ3VtZW50cy5sZW5ndGgsc3RyZWFtcz1uZXcgQXJyYXkoX2xlbiksX2tleT0wO19rZXk8X2xlbjtfa2V5Kyspe3N0cmVhbXNbX2tleV09YXJndW1lbnRzW19rZXldfXZhciBjYWxsYmFjaz1wb3BDYWxsYmFjayhzdHJlYW1zKTtpZihBcnJheS5pc0FycmF5KHN0cmVhbXNbMF0pKXN0cmVhbXM9c3RyZWFtc1swXTtpZihzdHJlYW1zLmxlbmd0aDwyKXt0aHJvdyBuZXcgRVJSX01JU1NJTkdfQVJHUygic3RyZWFtcyIpfXZhciBlcnJvcjt2YXIgZGVzdHJveXM9c3RyZWFtcy5tYXAoZnVuY3Rpb24oc3RyZWFtLGkpe3ZhciByZWFkaW5nPWk8c3RyZWFtcy5sZW5ndGgtMTt2YXIgd3JpdGluZz1pPjA7cmV0dXJuIGRlc3Ryb3llcihzdHJlYW0scmVhZGluZyx3cml0aW5nLGZ1bmN0aW9uKGVycil7aWYoIWVycm9yKWVycm9yPWVycjtpZihlcnIpZGVzdHJveXMuZm9yRWFjaChjYWxsKTtpZihyZWFkaW5nKXJldHVybjtkZXN0cm95cy5mb3JFYWNoKGNhbGwpO2NhbGxiYWNrKGVycm9yKX0pfSk7cmV0dXJuIHN0cmVhbXMucmVkdWNlKHBpcGUpfW1vZHVsZS5leHBvcnRzPXBpcGVsaW5lfSx7Ii4uLy4uLy4uL2Vycm9ycyI6NjcsIi4vZW5kLW9mLXN0cmVhbSI6NzZ9XSw3OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO3ZhciBFUlJfSU5WQUxJRF9PUFRfVkFMVUU9cmVxdWlyZSgiLi4vLi4vLi4vZXJyb3JzIikuY29kZXMuRVJSX0lOVkFMSURfT1BUX1ZBTFVFO2Z1bmN0aW9uIGhpZ2hXYXRlck1hcmtGcm9tKG9wdGlvbnMsaXNEdXBsZXgsZHVwbGV4S2V5KXtyZXR1cm4gb3B0aW9ucy5oaWdoV2F0ZXJNYXJrIT1udWxsP29wdGlvbnMuaGlnaFdhdGVyTWFyazppc0R1cGxleD9vcHRpb25zW2R1cGxleEtleV06bnVsbH1mdW5jdGlvbiBnZXRIaWdoV2F0ZXJNYXJrKHN0YXRlLG9wdGlvbnMsZHVwbGV4S2V5LGlzRHVwbGV4KXt2YXIgaHdtPWhpZ2hXYXRlck1hcmtGcm9tKG9wdGlvbnMsaXNEdXBsZXgsZHVwbGV4S2V5KTtpZihod20hPW51bGwpe2lmKCEoaXNGaW5pdGUoaHdtKSYmTWF0aC5mbG9vcihod20pPT09aHdtKXx8aHdtPDApe3ZhciBuYW1lPWlzRHVwbGV4P2R1cGxleEtleToiaGlnaFdhdGVyTWFyayI7dGhyb3cgbmV3IEVSUl9JTlZBTElEX09QVF9WQUxVRShuYW1lLGh3bSl9cmV0dXJuIE1hdGguZmxvb3IoaHdtKX1yZXR1cm4gc3RhdGUub2JqZWN0TW9kZT8xNjoxNioxMDI0fW1vZHVsZS5leHBvcnRzPXtnZXRIaWdoV2F0ZXJNYXJrOmdldEhpZ2hXYXRlck1hcmt9fSx7Ii4uLy4uLy4uL2Vycm9ycyI6Njd9XSw4MDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHM9cmVxdWlyZSgiZXZlbnRzIikuRXZlbnRFbWl0dGVyfSx7ZXZlbnRzOjMzfV0sODE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe2V4cG9ydHM9bW9kdWxlLmV4cG9ydHM9cmVxdWlyZSgiLi9saWIvX3N0cmVhbV9yZWFkYWJsZS5qcyIpO2V4cG9ydHMuU3RyZWFtPWV4cG9ydHM7ZXhwb3J0cy5SZWFkYWJsZT1leHBvcnRzO2V4cG9ydHMuV3JpdGFibGU9cmVxdWlyZSgiLi9saWIvX3N0cmVhbV93cml0YWJsZS5qcyIpO2V4cG9ydHMuRHVwbGV4PXJlcXVpcmUoIi4vbGliL19zdHJlYW1fZHVwbGV4LmpzIik7ZXhwb3J0cy5UcmFuc2Zvcm09cmVxdWlyZSgiLi9saWIvX3N0cmVhbV90cmFuc2Zvcm0uanMiKTtleHBvcnRzLlBhc3NUaHJvdWdoPXJlcXVpcmUoIi4vbGliL19zdHJlYW1fcGFzc3Rocm91Z2guanMiKTtleHBvcnRzLmZpbmlzaGVkPXJlcXVpcmUoIi4vbGliL2ludGVybmFsL3N0cmVhbXMvZW5kLW9mLXN0cmVhbS5qcyIpO2V4cG9ydHMucGlwZWxpbmU9cmVxdWlyZSgiLi9saWIvaW50ZXJuYWwvc3RyZWFtcy9waXBlbGluZS5qcyIpfSx7Ii4vbGliL19zdHJlYW1fZHVwbGV4LmpzIjo2OCwiLi9saWIvX3N0cmVhbV9wYXNzdGhyb3VnaC5qcyI6NjksIi4vbGliL19zdHJlYW1fcmVhZGFibGUuanMiOjcwLCIuL2xpYi9fc3RyZWFtX3RyYW5zZm9ybS5qcyI6NzEsIi4vbGliL19zdHJlYW1fd3JpdGFibGUuanMiOjcyLCIuL2xpYi9pbnRlcm5hbC9zdHJlYW1zL2VuZC1vZi1zdHJlYW0uanMiOjc2LCIuL2xpYi9pbnRlcm5hbC9zdHJlYW1zL3BpcGVsaW5lLmpzIjo3OH1dLDgyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsidXNlIHN0cmljdCI7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJidWZmZXIiKS5CdWZmZXI7dmFyIGluaGVyaXRzPXJlcXVpcmUoImluaGVyaXRzIik7dmFyIEhhc2hCYXNlPXJlcXVpcmUoImhhc2gtYmFzZSIpO3ZhciBBUlJBWTE2PW5ldyBBcnJheSgxNik7dmFyIHpsPVswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDcsNCwxMywxLDEwLDYsMTUsMywxMiwwLDksNSwyLDE0LDExLDgsMywxMCwxNCw0LDksMTUsOCwxLDIsNywwLDYsMTMsMTEsNSwxMiwxLDksMTEsMTAsMCw4LDEyLDQsMTMsMyw3LDE1LDE0LDUsNiwyLDQsMCw1LDksNywxMiwyLDEwLDE0LDEsMyw4LDExLDYsMTUsMTNdO3ZhciB6cj1bNSwxNCw3LDAsOSwyLDExLDQsMTMsNiwxNSw4LDEsMTAsMywxMiw2LDExLDMsNywwLDEzLDUsMTAsMTQsMTUsOCwxMiw0LDksMSwyLDE1LDUsMSwzLDcsMTQsNiw5LDExLDgsMTIsMiwxMCwwLDQsMTMsOCw2LDQsMSwzLDExLDE1LDAsNSwxMiwyLDEzLDksNywxMCwxNCwxMiwxNSwxMCw0LDEsNSw4LDcsNiwyLDEzLDE0LDAsMyw5LDExXTt2YXIgc2w9WzExLDE0LDE1LDEyLDUsOCw3LDksMTEsMTMsMTQsMTUsNiw3LDksOCw3LDYsOCwxMywxMSw5LDcsMTUsNywxMiwxNSw5LDExLDcsMTMsMTIsMTEsMTMsNiw3LDE0LDksMTMsMTUsMTQsOCwxMyw2LDUsMTIsNyw1LDExLDEyLDE0LDE1LDE0LDE1LDksOCw5LDE0LDUsNiw4LDYsNSwxMiw5LDE1LDUsMTEsNiw4LDEzLDEyLDUsMTIsMTMsMTQsMTEsOCw1LDZdO3ZhciBzcj1bOCw5LDksMTEsMTMsMTUsMTUsNSw3LDcsOCwxMSwxNCwxNCwxMiw2LDksMTMsMTUsNywxMiw4LDksMTEsNyw3LDEyLDcsNiwxNSwxMywxMSw5LDcsMTUsMTEsOCw2LDYsMTQsMTIsMTMsNSwxNCwxMywxMyw3LDUsMTUsNSw4LDExLDE0LDE0LDYsMTQsNiw5LDEyLDksMTIsNSwxNSw4LDgsNSwxMiw5LDEyLDUsMTQsNiw4LDEzLDYsNSwxNSwxMywxMSwxMV07dmFyIGhsPVswLDE1MTg1MDAyNDksMTg1OTc3NTM5MywyNDAwOTU5NzA4LDI4NDA4NTM4MzhdO3ZhciBocj1bMTM1MjgyOTkyNiwxNTQ4NjAzNjg0LDE4MzYwNzI2OTEsMjA1Mzk5NDIxNywwXTtmdW5jdGlvbiBSSVBFTUQxNjAoKXtIYXNoQmFzZS5jYWxsKHRoaXMsNjQpO3RoaXMuX2E9MTczMjU4NDE5Mzt0aGlzLl9iPTQwMjMyMzM0MTc7dGhpcy5fYz0yNTYyMzgzMTAyO3RoaXMuX2Q9MjcxNzMzODc4O3RoaXMuX2U9MzI4NTM3NzUyMH1pbmhlcml0cyhSSVBFTUQxNjAsSGFzaEJhc2UpO1JJUEVNRDE2MC5wcm90b3R5cGUuX3VwZGF0ZT1mdW5jdGlvbigpe3ZhciB3b3Jkcz1BUlJBWTE2O2Zvcih2YXIgaj0wO2o8MTY7KytqKXdvcmRzW2pdPXRoaXMuX2Jsb2NrLnJlYWRJbnQzMkxFKGoqNCk7dmFyIGFsPXRoaXMuX2F8MDt2YXIgYmw9dGhpcy5fYnwwO3ZhciBjbD10aGlzLl9jfDA7dmFyIGRsPXRoaXMuX2R8MDt2YXIgZWw9dGhpcy5fZXwwO3ZhciBhcj10aGlzLl9hfDA7dmFyIGJyPXRoaXMuX2J8MDt2YXIgY3I9dGhpcy5fY3wwO3ZhciBkcj10aGlzLl9kfDA7dmFyIGVyPXRoaXMuX2V8MDtmb3IodmFyIGk9MDtpPDgwO2krPTEpe3ZhciB0bDt2YXIgdHI7aWYoaTwxNil7dGw9Zm4xKGFsLGJsLGNsLGRsLGVsLHdvcmRzW3psW2ldXSxobFswXSxzbFtpXSk7dHI9Zm41KGFyLGJyLGNyLGRyLGVyLHdvcmRzW3pyW2ldXSxoclswXSxzcltpXSl9ZWxzZSBpZihpPDMyKXt0bD1mbjIoYWwsYmwsY2wsZGwsZWwsd29yZHNbemxbaV1dLGhsWzFdLHNsW2ldKTt0cj1mbjQoYXIsYnIsY3IsZHIsZXIsd29yZHNbenJbaV1dLGhyWzFdLHNyW2ldKX1lbHNlIGlmKGk8NDgpe3RsPWZuMyhhbCxibCxjbCxkbCxlbCx3b3Jkc1t6bFtpXV0saGxbMl0sc2xbaV0pO3RyPWZuMyhhcixicixjcixkcixlcix3b3Jkc1t6cltpXV0saHJbMl0sc3JbaV0pfWVsc2UgaWYoaTw2NCl7dGw9Zm40KGFsLGJsLGNsLGRsLGVsLHdvcmRzW3psW2ldXSxobFszXSxzbFtpXSk7dHI9Zm4yKGFyLGJyLGNyLGRyLGVyLHdvcmRzW3pyW2ldXSxoclszXSxzcltpXSl9ZWxzZXt0bD1mbjUoYWwsYmwsY2wsZGwsZWwsd29yZHNbemxbaV1dLGhsWzRdLHNsW2ldKTt0cj1mbjEoYXIsYnIsY3IsZHIsZXIsd29yZHNbenJbaV1dLGhyWzRdLHNyW2ldKX1hbD1lbDtlbD1kbDtkbD1yb3RsKGNsLDEwKTtjbD1ibDtibD10bDthcj1lcjtlcj1kcjtkcj1yb3RsKGNyLDEwKTtjcj1icjticj10cn12YXIgdD10aGlzLl9iK2NsK2RyfDA7dGhpcy5fYj10aGlzLl9jK2RsK2VyfDA7dGhpcy5fYz10aGlzLl9kK2VsK2FyfDA7dGhpcy5fZD10aGlzLl9lK2FsK2JyfDA7dGhpcy5fZT10aGlzLl9hK2JsK2NyfDA7dGhpcy5fYT10fTtSSVBFTUQxNjAucHJvdG90eXBlLl9kaWdlc3Q9ZnVuY3Rpb24oKXt0aGlzLl9ibG9ja1t0aGlzLl9ibG9ja09mZnNldCsrXT0xMjg7aWYodGhpcy5fYmxvY2tPZmZzZXQ+NTYpe3RoaXMuX2Jsb2NrLmZpbGwoMCx0aGlzLl9ibG9ja09mZnNldCw2NCk7dGhpcy5fdXBkYXRlKCk7dGhpcy5fYmxvY2tPZmZzZXQ9MH10aGlzLl9ibG9jay5maWxsKDAsdGhpcy5fYmxvY2tPZmZzZXQsNTYpO3RoaXMuX2Jsb2NrLndyaXRlVUludDMyTEUodGhpcy5fbGVuZ3RoWzBdLDU2KTt0aGlzLl9ibG9jay53cml0ZVVJbnQzMkxFKHRoaXMuX2xlbmd0aFsxXSw2MCk7dGhpcy5fdXBkYXRlKCk7dmFyIGJ1ZmZlcj1CdWZmZXIuYWxsb2M/QnVmZmVyLmFsbG9jKDIwKTpuZXcgQnVmZmVyKDIwKTtidWZmZXIud3JpdGVJbnQzMkxFKHRoaXMuX2EsMCk7YnVmZmVyLndyaXRlSW50MzJMRSh0aGlzLl9iLDQpO2J1ZmZlci53cml0ZUludDMyTEUodGhpcy5fYyw4KTtidWZmZXIud3JpdGVJbnQzMkxFKHRoaXMuX2QsMTIpO2J1ZmZlci53cml0ZUludDMyTEUodGhpcy5fZSwxNik7cmV0dXJuIGJ1ZmZlcn07ZnVuY3Rpb24gcm90bCh4LG4pe3JldHVybiB4PDxufHg+Pj4zMi1ufWZ1bmN0aW9uIGZuMShhLGIsYyxkLGUsbSxrLHMpe3JldHVybiByb3RsKGErKGJeY15kKSttK2t8MCxzKStlfDB9ZnVuY3Rpb24gZm4yKGEsYixjLGQsZSxtLGsscyl7cmV0dXJuIHJvdGwoYSsoYiZjfH5iJmQpK20ra3wwLHMpK2V8MH1mdW5jdGlvbiBmbjMoYSxiLGMsZCxlLG0sayxzKXtyZXR1cm4gcm90bChhKygoYnx+YyleZCkrbStrfDAscykrZXwwfWZ1bmN0aW9uIGZuNChhLGIsYyxkLGUsbSxrLHMpe3JldHVybiByb3RsKGErKGImZHxjJn5kKSttK2t8MCxzKStlfDB9ZnVuY3Rpb24gZm41KGEsYixjLGQsZSxtLGsscyl7cmV0dXJuIHJvdGwoYSsoYl4oY3x+ZCkpK20ra3wwLHMpK2V8MH1tb2R1bGUuZXhwb3J0cz1SSVBFTUQxNjB9LHtidWZmZXI6MjcsImhhc2gtYmFzZSI6MzQsaW5oZXJpdHM6MzZ9XSw4MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIGJ1ZmZlcj1yZXF1aXJlKCJidWZmZXIiKTt2YXIgQnVmZmVyPWJ1ZmZlci5CdWZmZXI7ZnVuY3Rpb24gY29weVByb3BzKHNyYyxkc3Qpe2Zvcih2YXIga2V5IGluIHNyYyl7ZHN0W2tleV09c3JjW2tleV19fWlmKEJ1ZmZlci5mcm9tJiZCdWZmZXIuYWxsb2MmJkJ1ZmZlci5hbGxvY1Vuc2FmZSYmQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyl7bW9kdWxlLmV4cG9ydHM9YnVmZmVyfWVsc2V7Y29weVByb3BzKGJ1ZmZlcixleHBvcnRzKTtleHBvcnRzLkJ1ZmZlcj1TYWZlQnVmZmVyfWZ1bmN0aW9uIFNhZmVCdWZmZXIoYXJnLGVuY29kaW5nT3JPZmZzZXQsbGVuZ3RoKXtyZXR1cm4gQnVmZmVyKGFyZyxlbmNvZGluZ09yT2Zmc2V0LGxlbmd0aCl9U2FmZUJ1ZmZlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShCdWZmZXIucHJvdG90eXBlKTtjb3B5UHJvcHMoQnVmZmVyLFNhZmVCdWZmZXIpO1NhZmVCdWZmZXIuZnJvbT1mdW5jdGlvbihhcmcsZW5jb2RpbmdPck9mZnNldCxsZW5ndGgpe2lmKHR5cGVvZiBhcmc9PT0ibnVtYmVyIil7dGhyb3cgbmV3IFR5cGVFcnJvcigiQXJndW1lbnQgbXVzdCBub3QgYmUgYSBudW1iZXIiKX1yZXR1cm4gQnVmZmVyKGFyZyxlbmNvZGluZ09yT2Zmc2V0LGxlbmd0aCl9O1NhZmVCdWZmZXIuYWxsb2M9ZnVuY3Rpb24oc2l6ZSxmaWxsLGVuY29kaW5nKXtpZih0eXBlb2Ygc2l6ZSE9PSJudW1iZXIiKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJBcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyIil9dmFyIGJ1Zj1CdWZmZXIoc2l6ZSk7aWYoZmlsbCE9PXVuZGVmaW5lZCl7aWYodHlwZW9mIGVuY29kaW5nPT09InN0cmluZyIpe2J1Zi5maWxsKGZpbGwsZW5jb2RpbmcpfWVsc2V7YnVmLmZpbGwoZmlsbCl9fWVsc2V7YnVmLmZpbGwoMCl9cmV0dXJuIGJ1Zn07U2FmZUJ1ZmZlci5hbGxvY1Vuc2FmZT1mdW5jdGlvbihzaXplKXtpZih0eXBlb2Ygc2l6ZSE9PSJudW1iZXIiKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJBcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyIil9cmV0dXJuIEJ1ZmZlcihzaXplKX07U2FmZUJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3c9ZnVuY3Rpb24oc2l6ZSl7aWYodHlwZW9mIHNpemUhPT0ibnVtYmVyIil7dGhyb3cgbmV3IFR5cGVFcnJvcigiQXJndW1lbnQgbXVzdCBiZSBhIG51bWJlciIpfXJldHVybiBidWZmZXIuU2xvd0J1ZmZlcihzaXplKX19LHtidWZmZXI6Mjd9XSw4NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKHByb2Nlc3MpeyJ1c2Ugc3RyaWN0Ijt2YXIgYnVmZmVyPXJlcXVpcmUoImJ1ZmZlciIpO3ZhciBCdWZmZXI9YnVmZmVyLkJ1ZmZlcjt2YXIgc2FmZXI9e307dmFyIGtleTtmb3Ioa2V5IGluIGJ1ZmZlcil7aWYoIWJ1ZmZlci5oYXNPd25Qcm9wZXJ0eShrZXkpKWNvbnRpbnVlO2lmKGtleT09PSJTbG93QnVmZmVyInx8a2V5PT09IkJ1ZmZlciIpY29udGludWU7c2FmZXJba2V5XT1idWZmZXJba2V5XX12YXIgU2FmZXI9c2FmZXIuQnVmZmVyPXt9O2ZvcihrZXkgaW4gQnVmZmVyKXtpZighQnVmZmVyLmhhc093blByb3BlcnR5KGtleSkpY29udGludWU7aWYoa2V5PT09ImFsbG9jVW5zYWZlInx8a2V5PT09ImFsbG9jVW5zYWZlU2xvdyIpY29udGludWU7U2FmZXJba2V5XT1CdWZmZXJba2V5XX1zYWZlci5CdWZmZXIucHJvdG90eXBlPUJ1ZmZlci5wcm90b3R5cGU7aWYoIVNhZmVyLmZyb218fFNhZmVyLmZyb209PT1VaW50OEFycmF5LmZyb20pe1NhZmVyLmZyb209ZnVuY3Rpb24odmFsdWUsZW5jb2RpbmdPck9mZnNldCxsZW5ndGgpe2lmKHR5cGVvZiB2YWx1ZT09PSJudW1iZXIiKXt0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgInZhbHVlIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBvZiB0eXBlIG51bWJlci4gUmVjZWl2ZWQgdHlwZSAnK3R5cGVvZiB2YWx1ZSl9aWYodmFsdWUmJnR5cGVvZiB2YWx1ZS5sZW5ndGg9PT0idW5kZWZpbmVkIil7dGhyb3cgbmV3IFR5cGVFcnJvcigiVGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgb25lIG9mIHR5cGUgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgb3IgQXJyYXktbGlrZSBPYmplY3QuIFJlY2VpdmVkIHR5cGUgIit0eXBlb2YgdmFsdWUpfXJldHVybiBCdWZmZXIodmFsdWUsZW5jb2RpbmdPck9mZnNldCxsZW5ndGgpfX1pZighU2FmZXIuYWxsb2Mpe1NhZmVyLmFsbG9jPWZ1bmN0aW9uKHNpemUsZmlsbCxlbmNvZGluZyl7aWYodHlwZW9mIHNpemUhPT0ibnVtYmVyIil7dGhyb3cgbmV3IFR5cGVFcnJvcignVGhlICJzaXplIiBhcmd1bWVudCBtdXN0IGJlIG9mIHR5cGUgbnVtYmVyLiBSZWNlaXZlZCB0eXBlICcrdHlwZW9mIHNpemUpfWlmKHNpemU8MHx8c2l6ZT49MiooMTw8MzApKXt0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlICInK3NpemUrJyIgaXMgaW52YWxpZCBmb3Igb3B0aW9uICJzaXplIicpfXZhciBidWY9QnVmZmVyKHNpemUpO2lmKCFmaWxsfHxmaWxsLmxlbmd0aD09PTApe2J1Zi5maWxsKDApfWVsc2UgaWYodHlwZW9mIGVuY29kaW5nPT09InN0cmluZyIpe2J1Zi5maWxsKGZpbGwsZW5jb2RpbmcpfWVsc2V7YnVmLmZpbGwoZmlsbCl9cmV0dXJuIGJ1Zn19aWYoIXNhZmVyLmtTdHJpbmdNYXhMZW5ndGgpe3RyeXtzYWZlci5rU3RyaW5nTWF4TGVuZ3RoPXByb2Nlc3MuYmluZGluZygiYnVmZmVyIikua1N0cmluZ01heExlbmd0aH1jYXRjaChlKXt9fWlmKCFzYWZlci5jb25zdGFudHMpe3NhZmVyLmNvbnN0YW50cz17TUFYX0xFTkdUSDpzYWZlci5rTWF4TGVuZ3RofTtpZihzYWZlci5rU3RyaW5nTWF4TGVuZ3RoKXtzYWZlci5jb25zdGFudHMuTUFYX1NUUklOR19MRU5HVEg9c2FmZXIua1N0cmluZ01heExlbmd0aH19bW9kdWxlLmV4cG9ydHM9c2FmZXJ9KS5jYWxsKHRoaXMscmVxdWlyZSgiX3Byb2Nlc3MiKSl9LHtfcHJvY2Vzczo2NixidWZmZXI6Mjd9XSw4NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKEJ1ZmZlcil7dmFyIHBia2RmMj1yZXF1aXJlKCJwYmtkZjIiKTt2YXIgTUFYX1ZBTFVFPTIxNDc0ODM2NDc7ZnVuY3Rpb24gc2NyeXB0KGtleSxzYWx0LE4scixwLGRrTGVuLHByb2dyZXNzQ2FsbGJhY2spe2lmKE49PT0wfHwoTiZOLTEpIT09MCl0aHJvdyBFcnJvcigiTiBtdXN0IGJlID4gMCBhbmQgYSBwb3dlciBvZiAyIik7aWYoTj5NQVhfVkFMVUUvMTI4L3IpdGhyb3cgRXJyb3IoIlBhcmFtZXRlciBOIGlzIHRvbyBsYXJnZSIpO2lmKHI+TUFYX1ZBTFVFLzEyOC9wKXRocm93IEVycm9yKCJQYXJhbWV0ZXIgciBpcyB0b28gbGFyZ2UiKTt2YXIgWFk9bmV3IEJ1ZmZlcigyNTYqcik7dmFyIFY9bmV3IEJ1ZmZlcigxMjgqcipOKTt2YXIgQjMyPW5ldyBJbnQzMkFycmF5KDE2KTt2YXIgeD1uZXcgSW50MzJBcnJheSgxNik7dmFyIF9YPW5ldyBCdWZmZXIoNjQpO3ZhciBCPXBia2RmMi5wYmtkZjJTeW5jKGtleSxzYWx0LDEscCoxMjgqciwic2hhMjU2Iik7dmFyIHRpY2tDYWxsYmFjaztpZihwcm9ncmVzc0NhbGxiYWNrKXt2YXIgdG90YWxPcHM9cCpOKjI7dmFyIGN1cnJlbnRPcD0wO3RpY2tDYWxsYmFjaz1mdW5jdGlvbigpeysrY3VycmVudE9wO2lmKGN1cnJlbnRPcCUxZTM9PT0wKXtwcm9ncmVzc0NhbGxiYWNrKHtjdXJyZW50OmN1cnJlbnRPcCx0b3RhbDp0b3RhbE9wcyxwZXJjZW50OmN1cnJlbnRPcC90b3RhbE9wcyoxMDB9KX19fWZvcih2YXIgaT0wO2k8cDtpKyspe3NtaXgoQixpKjEyOCpyLHIsTixWLFhZKX1yZXR1cm4gcGJrZGYyLnBia2RmMlN5bmMoa2V5LEIsMSxka0xlbiwic2hhMjU2Iik7ZnVuY3Rpb24gc21peChCLEJpLHIsTixWLFhZKXt2YXIgWGk9MDt2YXIgWWk9MTI4KnI7dmFyIGk7Qi5jb3B5KFhZLFhpLEJpLEJpK1lpKTtmb3IoaT0wO2k8TjtpKyspe1hZLmNvcHkoVixpKllpLFhpLFhpK1lpKTtibG9ja21peF9zYWxzYTgoWFksWGksWWkscik7aWYodGlja0NhbGxiYWNrKXRpY2tDYWxsYmFjaygpfWZvcihpPTA7aTxOO2krKyl7dmFyIG9mZnNldD1YaSsoMipyLTEpKjY0O3ZhciBqPVhZLnJlYWRVSW50MzJMRShvZmZzZXQpJk4tMTtibG9ja3hvcihWLGoqWWksWFksWGksWWkpO2Jsb2NrbWl4X3NhbHNhOChYWSxYaSxZaSxyKTtpZih0aWNrQ2FsbGJhY2spdGlja0NhbGxiYWNrKCl9WFkuY29weShCLEJpLFhpLFhpK1lpKX1mdW5jdGlvbiBibG9ja21peF9zYWxzYTgoQlksQmksWWkscil7dmFyIGk7YXJyYXljb3B5KEJZLEJpKygyKnItMSkqNjQsX1gsMCw2NCk7Zm9yKGk9MDtpPDIqcjtpKyspe2Jsb2NreG9yKEJZLGkqNjQsX1gsMCw2NCk7c2Fsc2EyMF84KF9YKTthcnJheWNvcHkoX1gsMCxCWSxZaStpKjY0LDY0KX1mb3IoaT0wO2k8cjtpKyspe2FycmF5Y29weShCWSxZaStpKjIqNjQsQlksQmkraSo2NCw2NCl9Zm9yKGk9MDtpPHI7aSsrKXthcnJheWNvcHkoQlksWWkrKGkqMisxKSo2NCxCWSxCaSsoaStyKSo2NCw2NCl9fWZ1bmN0aW9uIFIoYSxiKXtyZXR1cm4gYTw8YnxhPj4+MzItYn1mdW5jdGlvbiBzYWxzYTIwXzgoQil7dmFyIGk7Zm9yKGk9MDtpPDE2O2krKyl7QjMyW2ldPShCW2kqNCswXSYyNTUpPDwwO0IzMltpXXw9KEJbaSo0KzFdJjI1NSk8PDg7QjMyW2ldfD0oQltpKjQrMl0mMjU1KTw8MTY7QjMyW2ldfD0oQltpKjQrM10mMjU1KTw8MjR9YXJyYXljb3B5KEIzMiwwLHgsMCwxNik7Zm9yKGk9ODtpPjA7aS09Mil7eFs0XV49Uih4WzBdK3hbMTJdLDcpO3hbOF1ePVIoeFs0XSt4WzBdLDkpO3hbMTJdXj1SKHhbOF0reFs0XSwxMyk7eFswXV49Uih4WzEyXSt4WzhdLDE4KTt4WzldXj1SKHhbNV0reFsxXSw3KTt4WzEzXV49Uih4WzldK3hbNV0sOSk7eFsxXV49Uih4WzEzXSt4WzldLDEzKTt4WzVdXj1SKHhbMV0reFsxM10sMTgpO3hbMTRdXj1SKHhbMTBdK3hbNl0sNyk7eFsyXV49Uih4WzE0XSt4WzEwXSw5KTt4WzZdXj1SKHhbMl0reFsxNF0sMTMpO3hbMTBdXj1SKHhbNl0reFsyXSwxOCk7eFszXV49Uih4WzE1XSt4WzExXSw3KTt4WzddXj1SKHhbM10reFsxNV0sOSk7eFsxMV1ePVIoeFs3XSt4WzNdLDEzKTt4WzE1XV49Uih4WzExXSt4WzddLDE4KTt4WzFdXj1SKHhbMF0reFszXSw3KTt4WzJdXj1SKHhbMV0reFswXSw5KTt4WzNdXj1SKHhbMl0reFsxXSwxMyk7eFswXV49Uih4WzNdK3hbMl0sMTgpO3hbNl1ePVIoeFs1XSt4WzRdLDcpO3hbN11ePVIoeFs2XSt4WzVdLDkpO3hbNF1ePVIoeFs3XSt4WzZdLDEzKTt4WzVdXj1SKHhbNF0reFs3XSwxOCk7eFsxMV1ePVIoeFsxMF0reFs5XSw3KTt4WzhdXj1SKHhbMTFdK3hbMTBdLDkpO3hbOV1ePVIoeFs4XSt4WzExXSwxMyk7eFsxMF1ePVIoeFs5XSt4WzhdLDE4KTt4WzEyXV49Uih4WzE1XSt4WzE0XSw3KTt4WzEzXV49Uih4WzEyXSt4WzE1XSw5KTt4WzE0XV49Uih4WzEzXSt4WzEyXSwxMyk7eFsxNV1ePVIoeFsxNF0reFsxM10sMTgpfWZvcihpPTA7aTwxNjsrK2kpQjMyW2ldPXhbaV0rQjMyW2ldO2ZvcihpPTA7aTwxNjtpKyspe3ZhciBiaT1pKjQ7QltiaSswXT1CMzJbaV0+PjAmMjU1O0JbYmkrMV09QjMyW2ldPj44JjI1NTtCW2JpKzJdPUIzMltpXT4+MTYmMjU1O0JbYmkrM109QjMyW2ldPj4yNCYyNTV9fWZ1bmN0aW9uIGJsb2NreG9yKFMsU2ksRCxEaSxsZW4pe2Zvcih2YXIgaT0wO2k8bGVuO2krKyl7RFtEaStpXV49U1tTaStpXX19fWZ1bmN0aW9uIGFycmF5Y29weShzcmMsc3JjUG9zLGRlc3QsZGVzdFBvcyxsZW5ndGgpe2lmKEJ1ZmZlci5pc0J1ZmZlcihzcmMpJiZCdWZmZXIuaXNCdWZmZXIoZGVzdCkpe3NyYy5jb3B5KGRlc3QsZGVzdFBvcyxzcmNQb3Msc3JjUG9zK2xlbmd0aCl9ZWxzZXt3aGlsZShsZW5ndGgtLSl7ZGVzdFtkZXN0UG9zKytdPXNyY1tzcmNQb3MrK119fX1tb2R1bGUuZXhwb3J0cz1zY3J5cHR9KS5jYWxsKHRoaXMscmVxdWlyZSgiYnVmZmVyIikuQnVmZmVyKX0se2J1ZmZlcjoyNyxwYmtkZjI6NjB9XSw4NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIGFsZWE9cmVxdWlyZSgiLi9saWIvYWxlYSIpO3ZhciB4b3IxMjg9cmVxdWlyZSgiLi9saWIveG9yMTI4Iik7dmFyIHhvcndvdz1yZXF1aXJlKCIuL2xpYi94b3J3b3ciKTt2YXIgeG9yc2hpZnQ3PXJlcXVpcmUoIi4vbGliL3hvcnNoaWZ0NyIpO3ZhciB4b3I0MDk2PXJlcXVpcmUoIi4vbGliL3hvcjQwOTYiKTt2YXIgdHljaGVpPXJlcXVpcmUoIi4vbGliL3R5Y2hlaSIpO3ZhciBzcj1yZXF1aXJlKCIuL3NlZWRyYW5kb20iKTtzci5hbGVhPWFsZWE7c3IueG9yMTI4PXhvcjEyODtzci54b3J3b3c9eG9yd293O3NyLnhvcnNoaWZ0Nz14b3JzaGlmdDc7c3IueG9yNDA5Nj14b3I0MDk2O3NyLnR5Y2hlaT10eWNoZWk7bW9kdWxlLmV4cG9ydHM9c3J9LHsiLi9saWIvYWxlYSI6ODcsIi4vbGliL3R5Y2hlaSI6ODgsIi4vbGliL3hvcjEyOCI6ODksIi4vbGliL3hvcjQwOTYiOjkwLCIuL2xpYi94b3JzaGlmdDciOjkxLCIuL2xpYi94b3J3b3ciOjkyLCIuL3NlZWRyYW5kb20iOjkzfV0sODc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwsbW9kdWxlLGRlZmluZSl7ZnVuY3Rpb24gQWxlYShzZWVkKXt2YXIgbWU9dGhpcyxtYXNoPU1hc2goKTttZS5uZXh0PWZ1bmN0aW9uKCl7dmFyIHQ9MjA5MTYzOSptZS5zMCttZS5jKjIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7bWUuczA9bWUuczE7bWUuczE9bWUuczI7cmV0dXJuIG1lLnMyPXQtKG1lLmM9dHwwKX07bWUuYz0xO21lLnMwPW1hc2goIiAiKTttZS5zMT1tYXNoKCIgIik7bWUuczI9bWFzaCgiICIpO21lLnMwLT1tYXNoKHNlZWQpO2lmKG1lLnMwPDApe21lLnMwKz0xfW1lLnMxLT1tYXNoKHNlZWQpO2lmKG1lLnMxPDApe21lLnMxKz0xfW1lLnMyLT1tYXNoKHNlZWQpO2lmKG1lLnMyPDApe21lLnMyKz0xfW1hc2g9bnVsbH1mdW5jdGlvbiBjb3B5KGYsdCl7dC5jPWYuYzt0LnMwPWYuczA7dC5zMT1mLnMxO3QuczI9Zi5zMjtyZXR1cm4gdH1mdW5jdGlvbiBpbXBsKHNlZWQsb3B0cyl7dmFyIHhnPW5ldyBBbGVhKHNlZWQpLHN0YXRlPW9wdHMmJm9wdHMuc3RhdGUscHJuZz14Zy5uZXh0O3BybmcuaW50MzI9ZnVuY3Rpb24oKXtyZXR1cm4geGcubmV4dCgpKjQyOTQ5NjcyOTZ8MH07cHJuZy5kb3VibGU9ZnVuY3Rpb24oKXtyZXR1cm4gcHJuZygpKyhwcm5nKCkqMjA5NzE1MnwwKSoxMTEwMjIzMDI0NjI1MTU2NWUtMzJ9O3BybmcucXVpY2s9cHJuZztpZihzdGF0ZSl7aWYodHlwZW9mIHN0YXRlPT0ib2JqZWN0Iiljb3B5KHN0YXRlLHhnKTtwcm5nLnN0YXRlPWZ1bmN0aW9uKCl7cmV0dXJuIGNvcHkoeGcse30pfX1yZXR1cm4gcHJuZ31mdW5jdGlvbiBNYXNoKCl7dmFyIG49NDAyMjg3MTE5Nzt2YXIgbWFzaD1mdW5jdGlvbihkYXRhKXtkYXRhPVN0cmluZyhkYXRhKTtmb3IodmFyIGk9MDtpPGRhdGEubGVuZ3RoO2krKyl7bis9ZGF0YS5jaGFyQ29kZUF0KGkpO3ZhciBoPS4wMjUxOTYwMzI4MjQxNjkzOCpuO249aD4+PjA7aC09bjtoKj1uO249aD4+PjA7aC09bjtuKz1oKjQyOTQ5NjcyOTZ9cmV0dXJuKG4+Pj4wKSoyLjMyODMwNjQzNjUzODY5NjNlLTEwfTtyZXR1cm4gbWFzaH1pZihtb2R1bGUmJm1vZHVsZS5leHBvcnRzKXttb2R1bGUuZXhwb3J0cz1pbXBsfWVsc2UgaWYoZGVmaW5lJiZkZWZpbmUuYW1kKXtkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gaW1wbH0pfWVsc2V7dGhpcy5hbGVhPWltcGx9fSkodGhpcyx0eXBlb2YgbW9kdWxlPT0ib2JqZWN0IiYmbW9kdWxlLHR5cGVvZiBkZWZpbmU9PSJmdW5jdGlvbiImJmRlZmluZSl9LHt9XSw4ODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCxtb2R1bGUsZGVmaW5lKXtmdW5jdGlvbiBYb3JHZW4oc2VlZCl7dmFyIG1lPXRoaXMsc3Ryc2VlZD0iIjttZS5uZXh0PWZ1bmN0aW9uKCl7dmFyIGI9bWUuYixjPW1lLmMsZD1tZS5kLGE9bWUuYTtiPWI8PDI1XmI+Pj43XmM7Yz1jLWR8MDtkPWQ8PDI0XmQ+Pj44XmE7YT1hLWJ8MDttZS5iPWI9Yjw8MjBeYj4+PjEyXmM7bWUuYz1jPWMtZHwwO21lLmQ9ZDw8MTZeYz4+PjE2XmE7cmV0dXJuIG1lLmE9YS1ifDB9O21lLmE9MDttZS5iPTA7bWUuYz0yNjU0NDM1NzY5fDA7bWUuZD0xMzY3MTMwNTUxO2lmKHNlZWQ9PT1NYXRoLmZsb29yKHNlZWQpKXttZS5hPXNlZWQvNDI5NDk2NzI5NnwwO21lLmI9c2VlZHwwfWVsc2V7c3Ryc2VlZCs9c2VlZH1mb3IodmFyIGs9MDtrPHN0cnNlZWQubGVuZ3RoKzIwO2srKyl7bWUuYl49c3Ryc2VlZC5jaGFyQ29kZUF0KGspfDA7bWUubmV4dCgpfX1mdW5jdGlvbiBjb3B5KGYsdCl7dC5hPWYuYTt0LmI9Zi5iO3QuYz1mLmM7dC5kPWYuZDtyZXR1cm4gdH1mdW5jdGlvbiBpbXBsKHNlZWQsb3B0cyl7dmFyIHhnPW5ldyBYb3JHZW4oc2VlZCksc3RhdGU9b3B0cyYmb3B0cy5zdGF0ZSxwcm5nPWZ1bmN0aW9uKCl7cmV0dXJuKHhnLm5leHQoKT4+PjApLzQyOTQ5NjcyOTZ9O3BybmcuZG91YmxlPWZ1bmN0aW9uKCl7ZG97dmFyIHRvcD14Zy5uZXh0KCk+Pj4xMSxib3Q9KHhnLm5leHQoKT4+PjApLzQyOTQ5NjcyOTYscmVzdWx0PSh0b3ArYm90KS8oMTw8MjEpfXdoaWxlKHJlc3VsdD09PTApO3JldHVybiByZXN1bHR9O3BybmcuaW50MzI9eGcubmV4dDtwcm5nLnF1aWNrPXBybmc7aWYoc3RhdGUpe2lmKHR5cGVvZiBzdGF0ZT09Im9iamVjdCIpY29weShzdGF0ZSx4Zyk7cHJuZy5zdGF0ZT1mdW5jdGlvbigpe3JldHVybiBjb3B5KHhnLHt9KX19cmV0dXJuIHBybmd9aWYobW9kdWxlJiZtb2R1bGUuZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHM9aW1wbH1lbHNlIGlmKGRlZmluZSYmZGVmaW5lLmFtZCl7ZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIGltcGx9KX1lbHNle3RoaXMudHljaGVpPWltcGx9fSkodGhpcyx0eXBlb2YgbW9kdWxlPT0ib2JqZWN0IiYmbW9kdWxlLHR5cGVvZiBkZWZpbmU9PSJmdW5jdGlvbiImJmRlZmluZSl9LHt9XSw4OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCxtb2R1bGUsZGVmaW5lKXtmdW5jdGlvbiBYb3JHZW4oc2VlZCl7dmFyIG1lPXRoaXMsc3Ryc2VlZD0iIjttZS54PTA7bWUueT0wO21lLno9MDttZS53PTA7bWUubmV4dD1mdW5jdGlvbigpe3ZhciB0PW1lLnhebWUueDw8MTE7bWUueD1tZS55O21lLnk9bWUuejttZS56PW1lLnc7cmV0dXJuIG1lLndePW1lLnc+Pj4xOV50XnQ+Pj44fTtpZihzZWVkPT09KHNlZWR8MCkpe21lLng9c2VlZH1lbHNle3N0cnNlZWQrPXNlZWR9Zm9yKHZhciBrPTA7azxzdHJzZWVkLmxlbmd0aCs2NDtrKyspe21lLnhePXN0cnNlZWQuY2hhckNvZGVBdChrKXwwO21lLm5leHQoKX19ZnVuY3Rpb24gY29weShmLHQpe3QueD1mLng7dC55PWYueTt0Lno9Zi56O3Qudz1mLnc7cmV0dXJuIHR9ZnVuY3Rpb24gaW1wbChzZWVkLG9wdHMpe3ZhciB4Zz1uZXcgWG9yR2VuKHNlZWQpLHN0YXRlPW9wdHMmJm9wdHMuc3RhdGUscHJuZz1mdW5jdGlvbigpe3JldHVybih4Zy5uZXh0KCk+Pj4wKS80Mjk0OTY3Mjk2fTtwcm5nLmRvdWJsZT1mdW5jdGlvbigpe2Rve3ZhciB0b3A9eGcubmV4dCgpPj4+MTEsYm90PSh4Zy5uZXh0KCk+Pj4wKS80Mjk0OTY3Mjk2LHJlc3VsdD0odG9wK2JvdCkvKDE8PDIxKX13aGlsZShyZXN1bHQ9PT0wKTtyZXR1cm4gcmVzdWx0fTtwcm5nLmludDMyPXhnLm5leHQ7cHJuZy5xdWljaz1wcm5nO2lmKHN0YXRlKXtpZih0eXBlb2Ygc3RhdGU9PSJvYmplY3QiKWNvcHkoc3RhdGUseGcpO3Bybmcuc3RhdGU9ZnVuY3Rpb24oKXtyZXR1cm4gY29weSh4Zyx7fSl9fXJldHVybiBwcm5nfWlmKG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMpe21vZHVsZS5leHBvcnRzPWltcGx9ZWxzZSBpZihkZWZpbmUmJmRlZmluZS5hbWQpe2RlZmluZShmdW5jdGlvbigpe3JldHVybiBpbXBsfSl9ZWxzZXt0aGlzLnhvcjEyOD1pbXBsfX0pKHRoaXMsdHlwZW9mIG1vZHVsZT09Im9iamVjdCImJm1vZHVsZSx0eXBlb2YgZGVmaW5lPT0iZnVuY3Rpb24iJiZkZWZpbmUpfSx7fV0sOTA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwsbW9kdWxlLGRlZmluZSl7ZnVuY3Rpb24gWG9yR2VuKHNlZWQpe3ZhciBtZT10aGlzO21lLm5leHQ9ZnVuY3Rpb24oKXt2YXIgdz1tZS53LFg9bWUuWCxpPW1lLmksdCx2O21lLnc9dz13KzE2NDA1MzE1Mjd8MDt2PVhbaSszNCYxMjddO3Q9WFtpPWkrMSYxMjddO3ZePXY8PDEzO3RePXQ8PDE3O3ZePXY+Pj4xNTt0Xj10Pj4+MTI7dj1YW2ldPXZedDttZS5pPWk7cmV0dXJuIHYrKHdedz4+PjE2KXwwfTtmdW5jdGlvbiBpbml0KG1lLHNlZWQpe3ZhciB0LHYsaSxqLHcsWD1bXSxsaW1pdD0xMjg7aWYoc2VlZD09PShzZWVkfDApKXt2PXNlZWQ7c2VlZD1udWxsfWVsc2V7c2VlZD1zZWVkKyJcMCI7dj0wO2xpbWl0PU1hdGgubWF4KGxpbWl0LHNlZWQubGVuZ3RoKX1mb3IoaT0wLGo9LTMyO2o8bGltaXQ7KytqKXtpZihzZWVkKXZePXNlZWQuY2hhckNvZGVBdCgoaiszMiklc2VlZC5sZW5ndGgpO2lmKGo9PT0wKXc9djt2Xj12PDwxMDt2Xj12Pj4+MTU7dl49djw8NDt2Xj12Pj4+MTM7aWYoaj49MCl7dz13KzE2NDA1MzE1Mjd8MDt0PVhbaiYxMjddXj12K3c7aT0wPT10P2krMTowfX1pZihpPj0xMjgpe1hbKHNlZWQmJnNlZWQubGVuZ3RofHwwKSYxMjddPS0xfWk9MTI3O2ZvcihqPTQqMTI4O2o+MDstLWope3Y9WFtpKzM0JjEyN107dD1YW2k9aSsxJjEyN107dl49djw8MTM7dF49dDw8MTc7dl49dj4+PjE1O3RePXQ+Pj4xMjtYW2ldPXZedH1tZS53PXc7bWUuWD1YO21lLmk9aX1pbml0KG1lLHNlZWQpfWZ1bmN0aW9uIGNvcHkoZix0KXt0Lmk9Zi5pO3Qudz1mLnc7dC5YPWYuWC5zbGljZSgpO3JldHVybiB0fWZ1bmN0aW9uIGltcGwoc2VlZCxvcHRzKXtpZihzZWVkPT1udWxsKXNlZWQ9K25ldyBEYXRlO3ZhciB4Zz1uZXcgWG9yR2VuKHNlZWQpLHN0YXRlPW9wdHMmJm9wdHMuc3RhdGUscHJuZz1mdW5jdGlvbigpe3JldHVybih4Zy5uZXh0KCk+Pj4wKS80Mjk0OTY3Mjk2fTtwcm5nLmRvdWJsZT1mdW5jdGlvbigpe2Rve3ZhciB0b3A9eGcubmV4dCgpPj4+MTEsYm90PSh4Zy5uZXh0KCk+Pj4wKS80Mjk0OTY3Mjk2LHJlc3VsdD0odG9wK2JvdCkvKDE8PDIxKX13aGlsZShyZXN1bHQ9PT0wKTtyZXR1cm4gcmVzdWx0fTtwcm5nLmludDMyPXhnLm5leHQ7cHJuZy5xdWljaz1wcm5nO2lmKHN0YXRlKXtpZihzdGF0ZS5YKWNvcHkoc3RhdGUseGcpO3Bybmcuc3RhdGU9ZnVuY3Rpb24oKXtyZXR1cm4gY29weSh4Zyx7fSl9fXJldHVybiBwcm5nfWlmKG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMpe21vZHVsZS5leHBvcnRzPWltcGx9ZWxzZSBpZihkZWZpbmUmJmRlZmluZS5hbWQpe2RlZmluZShmdW5jdGlvbigpe3JldHVybiBpbXBsfSl9ZWxzZXt0aGlzLnhvcjQwOTY9aW1wbH19KSh0aGlzLHR5cGVvZiBtb2R1bGU9PSJvYmplY3QiJiZtb2R1bGUsdHlwZW9mIGRlZmluZT09ImZ1bmN0aW9uIiYmZGVmaW5lKX0se31dLDkxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsLG1vZHVsZSxkZWZpbmUpe2Z1bmN0aW9uIFhvckdlbihzZWVkKXt2YXIgbWU9dGhpczttZS5uZXh0PWZ1bmN0aW9uKCl7dmFyIFg9bWUueCxpPW1lLmksdCx2LHc7dD1YW2ldO3RePXQ+Pj43O3Y9dF50PDwyNDt0PVhbaSsxJjddO3ZePXRedD4+PjEwO3Q9WFtpKzMmN107dl49dF50Pj4+Mzt0PVhbaSs0JjddO3ZePXRedDw8Nzt0PVhbaSs3JjddO3Q9dF50PDwxMzt2Xj10XnQ8PDk7WFtpXT12O21lLmk9aSsxJjc7cmV0dXJuIHZ9O2Z1bmN0aW9uIGluaXQobWUsc2VlZCl7dmFyIGosdyxYPVtdO2lmKHNlZWQ9PT0oc2VlZHwwKSl7dz1YWzBdPXNlZWR9ZWxzZXtzZWVkPSIiK3NlZWQ7Zm9yKGo9MDtqPHNlZWQubGVuZ3RoOysrail7WFtqJjddPVhbaiY3XTw8MTVec2VlZC5jaGFyQ29kZUF0KGopK1hbaisxJjddPDwxM319d2hpbGUoWC5sZW5ndGg8OClYLnB1c2goMCk7Zm9yKGo9MDtqPDgmJlhbal09PT0wOysraik7aWYoaj09OCl3PVhbN109LTE7ZWxzZSB3PVhbal07bWUueD1YO21lLmk9MDtmb3Ioaj0yNTY7aj4wOy0tail7bWUubmV4dCgpfX1pbml0KG1lLHNlZWQpfWZ1bmN0aW9uIGNvcHkoZix0KXt0Lng9Zi54LnNsaWNlKCk7dC5pPWYuaTtyZXR1cm4gdH1mdW5jdGlvbiBpbXBsKHNlZWQsb3B0cyl7aWYoc2VlZD09bnVsbClzZWVkPStuZXcgRGF0ZTt2YXIgeGc9bmV3IFhvckdlbihzZWVkKSxzdGF0ZT1vcHRzJiZvcHRzLnN0YXRlLHBybmc9ZnVuY3Rpb24oKXtyZXR1cm4oeGcubmV4dCgpPj4+MCkvNDI5NDk2NzI5Nn07cHJuZy5kb3VibGU9ZnVuY3Rpb24oKXtkb3t2YXIgdG9wPXhnLm5leHQoKT4+PjExLGJvdD0oeGcubmV4dCgpPj4+MCkvNDI5NDk2NzI5NixyZXN1bHQ9KHRvcCtib3QpLygxPDwyMSl9d2hpbGUocmVzdWx0PT09MCk7cmV0dXJuIHJlc3VsdH07cHJuZy5pbnQzMj14Zy5uZXh0O3BybmcucXVpY2s9cHJuZztpZihzdGF0ZSl7aWYoc3RhdGUueCljb3B5KHN0YXRlLHhnKTtwcm5nLnN0YXRlPWZ1bmN0aW9uKCl7cmV0dXJuIGNvcHkoeGcse30pfX1yZXR1cm4gcHJuZ31pZihtb2R1bGUmJm1vZHVsZS5leHBvcnRzKXttb2R1bGUuZXhwb3J0cz1pbXBsfWVsc2UgaWYoZGVmaW5lJiZkZWZpbmUuYW1kKXtkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gaW1wbH0pfWVsc2V7dGhpcy54b3JzaGlmdDc9aW1wbH19KSh0aGlzLHR5cGVvZiBtb2R1bGU9PSJvYmplY3QiJiZtb2R1bGUsdHlwZW9mIGRlZmluZT09ImZ1bmN0aW9uIiYmZGVmaW5lKX0se31dLDkyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsLG1vZHVsZSxkZWZpbmUpe2Z1bmN0aW9uIFhvckdlbihzZWVkKXt2YXIgbWU9dGhpcyxzdHJzZWVkPSIiO21lLm5leHQ9ZnVuY3Rpb24oKXt2YXIgdD1tZS54Xm1lLng+Pj4yO21lLng9bWUueTttZS55PW1lLno7bWUuej1tZS53O21lLnc9bWUudjtyZXR1cm4obWUuZD1tZS5kKzM2MjQzN3wwKSsobWUudj1tZS52Xm1lLnY8PDReKHRedDw8MSkpfDB9O21lLng9MDttZS55PTA7bWUuej0wO21lLnc9MDttZS52PTA7aWYoc2VlZD09PShzZWVkfDApKXttZS54PXNlZWR9ZWxzZXtzdHJzZWVkKz1zZWVkfWZvcih2YXIgaz0wO2s8c3Ryc2VlZC5sZW5ndGgrNjQ7aysrKXttZS54Xj1zdHJzZWVkLmNoYXJDb2RlQXQoayl8MDtpZihrPT1zdHJzZWVkLmxlbmd0aCl7bWUuZD1tZS54PDwxMF5tZS54Pj4+NH1tZS5uZXh0KCl9fWZ1bmN0aW9uIGNvcHkoZix0KXt0Lng9Zi54O3QueT1mLnk7dC56PWYuejt0Lnc9Zi53O3Qudj1mLnY7dC5kPWYuZDtyZXR1cm4gdH1mdW5jdGlvbiBpbXBsKHNlZWQsb3B0cyl7dmFyIHhnPW5ldyBYb3JHZW4oc2VlZCksc3RhdGU9b3B0cyYmb3B0cy5zdGF0ZSxwcm5nPWZ1bmN0aW9uKCl7cmV0dXJuKHhnLm5leHQoKT4+PjApLzQyOTQ5NjcyOTZ9O3BybmcuZG91YmxlPWZ1bmN0aW9uKCl7ZG97dmFyIHRvcD14Zy5uZXh0KCk+Pj4xMSxib3Q9KHhnLm5leHQoKT4+PjApLzQyOTQ5NjcyOTYscmVzdWx0PSh0b3ArYm90KS8oMTw8MjEpfXdoaWxlKHJlc3VsdD09PTApO3JldHVybiByZXN1bHR9O3BybmcuaW50MzI9eGcubmV4dDtwcm5nLnF1aWNrPXBybmc7aWYoc3RhdGUpe2lmKHR5cGVvZiBzdGF0ZT09Im9iamVjdCIpY29weShzdGF0ZSx4Zyk7cHJuZy5zdGF0ZT1mdW5jdGlvbigpe3JldHVybiBjb3B5KHhnLHt9KX19cmV0dXJuIHBybmd9aWYobW9kdWxlJiZtb2R1bGUuZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHM9aW1wbH1lbHNlIGlmKGRlZmluZSYmZGVmaW5lLmFtZCl7ZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIGltcGx9KX1lbHNle3RoaXMueG9yd293PWltcGx9fSkodGhpcyx0eXBlb2YgbW9kdWxlPT0ib2JqZWN0IiYmbW9kdWxlLHR5cGVvZiBkZWZpbmU9PSJmdW5jdGlvbiImJmRlZmluZSl9LHt9XSw5MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKHBvb2wsbWF0aCl7dmFyIGdsb2JhbD0oMCxldmFsKSgidGhpcyIpLHdpZHRoPTI1NixjaHVua3M9NixkaWdpdHM9NTIscm5nbmFtZT0icmFuZG9tIixzdGFydGRlbm9tPW1hdGgucG93KHdpZHRoLGNodW5rcyksc2lnbmlmaWNhbmNlPW1hdGgucG93KDIsZGlnaXRzKSxvdmVyZmxvdz1zaWduaWZpY2FuY2UqMixtYXNrPXdpZHRoLTEsbm9kZWNyeXB0bztmdW5jdGlvbiBzZWVkcmFuZG9tKHNlZWQsb3B0aW9ucyxjYWxsYmFjayl7dmFyIGtleT1bXTtvcHRpb25zPW9wdGlvbnM9PXRydWU/e2VudHJvcHk6dHJ1ZX06b3B0aW9uc3x8e307dmFyIHNob3J0c2VlZD1taXhrZXkoZmxhdHRlbihvcHRpb25zLmVudHJvcHk/W3NlZWQsdG9zdHJpbmcocG9vbCldOnNlZWQ9PW51bGw/YXV0b3NlZWQoKTpzZWVkLDMpLGtleSk7dmFyIGFyYzQ9bmV3IEFSQzQoa2V5KTt2YXIgcHJuZz1mdW5jdGlvbigpe3ZhciBuPWFyYzQuZyhjaHVua3MpLGQ9c3RhcnRkZW5vbSx4PTA7d2hpbGUobjxzaWduaWZpY2FuY2Upe249KG4reCkqd2lkdGg7ZCo9d2lkdGg7eD1hcmM0LmcoMSl9d2hpbGUobj49b3ZlcmZsb3cpe24vPTI7ZC89Mjt4Pj4+PTF9cmV0dXJuKG4reCkvZH07cHJuZy5pbnQzMj1mdW5jdGlvbigpe3JldHVybiBhcmM0LmcoNCl8MH07cHJuZy5xdWljaz1mdW5jdGlvbigpe3JldHVybiBhcmM0LmcoNCkvNDI5NDk2NzI5Nn07cHJuZy5kb3VibGU9cHJuZzttaXhrZXkodG9zdHJpbmcoYXJjNC5TKSxwb29sKTtyZXR1cm4ob3B0aW9ucy5wYXNzfHxjYWxsYmFja3x8ZnVuY3Rpb24ocHJuZyxzZWVkLGlzX21hdGhfY2FsbCxzdGF0ZSl7aWYoc3RhdGUpe2lmKHN0YXRlLlMpe2NvcHkoc3RhdGUsYXJjNCl9cHJuZy5zdGF0ZT1mdW5jdGlvbigpe3JldHVybiBjb3B5KGFyYzQse30pfX1pZihpc19tYXRoX2NhbGwpe21hdGhbcm5nbmFtZV09cHJuZztyZXR1cm4gc2VlZH1lbHNlIHJldHVybiBwcm5nfSkocHJuZyxzaG9ydHNlZWQsImdsb2JhbCJpbiBvcHRpb25zP29wdGlvbnMuZ2xvYmFsOnRoaXM9PW1hdGgsb3B0aW9ucy5zdGF0ZSl9ZnVuY3Rpb24gQVJDNChrZXkpe3ZhciB0LGtleWxlbj1rZXkubGVuZ3RoLG1lPXRoaXMsaT0wLGo9bWUuaT1tZS5qPTAscz1tZS5TPVtdO2lmKCFrZXlsZW4pe2tleT1ba2V5bGVuKytdfXdoaWxlKGk8d2lkdGgpe3NbaV09aSsrfWZvcihpPTA7aTx3aWR0aDtpKyspe3NbaV09c1tqPW1hc2smaitrZXlbaSVrZXlsZW5dKyh0PXNbaV0pXTtzW2pdPXR9KG1lLmc9ZnVuY3Rpb24oY291bnQpe3ZhciB0LHI9MCxpPW1lLmksaj1tZS5qLHM9bWUuUzt3aGlsZShjb3VudC0tKXt0PXNbaT1tYXNrJmkrMV07cj1yKndpZHRoK3NbbWFzayYoc1tpXT1zW2o9bWFzayZqK3RdKSsoc1tqXT10KV19bWUuaT1pO21lLmo9ajtyZXR1cm4gcn0pKHdpZHRoKX1mdW5jdGlvbiBjb3B5KGYsdCl7dC5pPWYuaTt0Lmo9Zi5qO3QuUz1mLlMuc2xpY2UoKTtyZXR1cm4gdH1mdW5jdGlvbiBmbGF0dGVuKG9iaixkZXB0aCl7dmFyIHJlc3VsdD1bXSx0eXA9dHlwZW9mIG9iaixwcm9wO2lmKGRlcHRoJiZ0eXA9PSJvYmplY3QiKXtmb3IocHJvcCBpbiBvYmope3RyeXtyZXN1bHQucHVzaChmbGF0dGVuKG9ialtwcm9wXSxkZXB0aC0xKSl9Y2F0Y2goZSl7fX19cmV0dXJuIHJlc3VsdC5sZW5ndGg/cmVzdWx0OnR5cD09InN0cmluZyI/b2JqOm9iaisiXDAifWZ1bmN0aW9uIG1peGtleShzZWVkLGtleSl7dmFyIHN0cmluZ3NlZWQ9c2VlZCsiIixzbWVhcixqPTA7d2hpbGUoajxzdHJpbmdzZWVkLmxlbmd0aCl7a2V5W21hc2smal09bWFzayYoc21lYXJePWtleVttYXNrJmpdKjE5KStzdHJpbmdzZWVkLmNoYXJDb2RlQXQoaisrKX1yZXR1cm4gdG9zdHJpbmcoa2V5KX1mdW5jdGlvbiBhdXRvc2VlZCgpe3RyeXt2YXIgb3V0O2lmKG5vZGVjcnlwdG8mJihvdXQ9bm9kZWNyeXB0by5yYW5kb21CeXRlcykpe291dD1vdXQod2lkdGgpfWVsc2V7b3V0PW5ldyBVaW50OEFycmF5KHdpZHRoKTsoZ2xvYmFsLmNyeXB0b3x8Z2xvYmFsLm1zQ3J5cHRvKS5nZXRSYW5kb21WYWx1ZXMob3V0KX1yZXR1cm4gdG9zdHJpbmcob3V0KX1jYXRjaChlKXt2YXIgYnJvd3Nlcj1nbG9iYWwubmF2aWdhdG9yLHBsdWdpbnM9YnJvd3NlciYmYnJvd3Nlci5wbHVnaW5zO3JldHVyblsrbmV3IERhdGUsZ2xvYmFsLHBsdWdpbnMsZ2xvYmFsLnNjcmVlbix0b3N0cmluZyhwb29sKV19fWZ1bmN0aW9uIHRvc3RyaW5nKGEpe3JldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KDAsYSl9bWl4a2V5KG1hdGgucmFuZG9tKCkscG9vbCk7aWYodHlwZW9mIG1vZHVsZT09Im9iamVjdCImJm1vZHVsZS5leHBvcnRzKXttb2R1bGUuZXhwb3J0cz1zZWVkcmFuZG9tO3RyeXtub2RlY3J5cHRvPXJlcXVpcmUoImNyeXB0byIpfWNhdGNoKGV4KXt9fWVsc2UgaWYodHlwZW9mIGRlZmluZT09ImZ1bmN0aW9uIiYmZGVmaW5lLmFtZCl7ZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIHNlZWRyYW5kb219KX1lbHNle21hdGhbInNlZWQiK3JuZ25hbWVdPXNlZWRyYW5kb219fSkoW10sTWF0aCl9LHtjcnlwdG86MjZ9XSw5NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjtmdW5jdGlvbiBIYXNoKGJsb2NrU2l6ZSxmaW5hbFNpemUpe3RoaXMuX2Jsb2NrPUJ1ZmZlci5hbGxvYyhibG9ja1NpemUpO3RoaXMuX2ZpbmFsU2l6ZT1maW5hbFNpemU7dGhpcy5fYmxvY2tTaXplPWJsb2NrU2l6ZTt0aGlzLl9sZW49MH1IYXNoLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oZGF0YSxlbmMpe2lmKHR5cGVvZiBkYXRhPT09InN0cmluZyIpe2VuYz1lbmN8fCJ1dGY4IjtkYXRhPUJ1ZmZlci5mcm9tKGRhdGEsZW5jKX12YXIgYmxvY2s9dGhpcy5fYmxvY2s7dmFyIGJsb2NrU2l6ZT10aGlzLl9ibG9ja1NpemU7dmFyIGxlbmd0aD1kYXRhLmxlbmd0aDt2YXIgYWNjdW09dGhpcy5fbGVuO2Zvcih2YXIgb2Zmc2V0PTA7b2Zmc2V0PGxlbmd0aDspe3ZhciBhc3NpZ25lZD1hY2N1bSVibG9ja1NpemU7dmFyIHJlbWFpbmRlcj1NYXRoLm1pbihsZW5ndGgtb2Zmc2V0LGJsb2NrU2l6ZS1hc3NpZ25lZCk7Zm9yKHZhciBpPTA7aTxyZW1haW5kZXI7aSsrKXtibG9ja1thc3NpZ25lZCtpXT1kYXRhW29mZnNldCtpXX1hY2N1bSs9cmVtYWluZGVyO29mZnNldCs9cmVtYWluZGVyO2lmKGFjY3VtJWJsb2NrU2l6ZT09PTApe3RoaXMuX3VwZGF0ZShibG9jayl9fXRoaXMuX2xlbis9bGVuZ3RoO3JldHVybiB0aGlzfTtIYXNoLnByb3RvdHlwZS5kaWdlc3Q9ZnVuY3Rpb24oZW5jKXt2YXIgcmVtPXRoaXMuX2xlbiV0aGlzLl9ibG9ja1NpemU7dGhpcy5fYmxvY2tbcmVtXT0xMjg7dGhpcy5fYmxvY2suZmlsbCgwLHJlbSsxKTtpZihyZW0+PXRoaXMuX2ZpbmFsU2l6ZSl7dGhpcy5fdXBkYXRlKHRoaXMuX2Jsb2NrKTt0aGlzLl9ibG9jay5maWxsKDApfXZhciBiaXRzPXRoaXMuX2xlbio4O2lmKGJpdHM8PTQyOTQ5NjcyOTUpe3RoaXMuX2Jsb2NrLndyaXRlVUludDMyQkUoYml0cyx0aGlzLl9ibG9ja1NpemUtNCl9ZWxzZXt2YXIgbG93Qml0cz0oYml0cyY0Mjk0OTY3Mjk1KT4+PjA7dmFyIGhpZ2hCaXRzPShiaXRzLWxvd0JpdHMpLzQyOTQ5NjcyOTY7dGhpcy5fYmxvY2sud3JpdGVVSW50MzJCRShoaWdoQml0cyx0aGlzLl9ibG9ja1NpemUtOCk7dGhpcy5fYmxvY2sud3JpdGVVSW50MzJCRShsb3dCaXRzLHRoaXMuX2Jsb2NrU2l6ZS00KX10aGlzLl91cGRhdGUodGhpcy5fYmxvY2spO3ZhciBoYXNoPXRoaXMuX2hhc2goKTtyZXR1cm4gZW5jP2hhc2gudG9TdHJpbmcoZW5jKTpoYXNofTtIYXNoLnByb3RvdHlwZS5fdXBkYXRlPWZ1bmN0aW9uKCl7dGhyb3cgbmV3IEVycm9yKCJfdXBkYXRlIG11c3QgYmUgaW1wbGVtZW50ZWQgYnkgc3ViY2xhc3MiKX07bW9kdWxlLmV4cG9ydHM9SGFzaH0seyJzYWZlLWJ1ZmZlciI6ODN9XSw5NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIGV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24gU0hBKGFsZ29yaXRobSl7YWxnb3JpdGhtPWFsZ29yaXRobS50b0xvd2VyQ2FzZSgpO3ZhciBBbGdvcml0aG09ZXhwb3J0c1thbGdvcml0aG1dO2lmKCFBbGdvcml0aG0pdGhyb3cgbmV3IEVycm9yKGFsZ29yaXRobSsiIGlzIG5vdCBzdXBwb3J0ZWQgKHdlIGFjY2VwdCBwdWxsIHJlcXVlc3RzKSIpO3JldHVybiBuZXcgQWxnb3JpdGhtfTtleHBvcnRzLnNoYT1yZXF1aXJlKCIuL3NoYSIpO2V4cG9ydHMuc2hhMT1yZXF1aXJlKCIuL3NoYTEiKTtleHBvcnRzLnNoYTIyND1yZXF1aXJlKCIuL3NoYTIyNCIpO2V4cG9ydHMuc2hhMjU2PXJlcXVpcmUoIi4vc2hhMjU2Iik7ZXhwb3J0cy5zaGEzODQ9cmVxdWlyZSgiLi9zaGEzODQiKTtleHBvcnRzLnNoYTUxMj1yZXF1aXJlKCIuL3NoYTUxMiIpfSx7Ii4vc2hhIjo5NiwiLi9zaGExIjo5NywiLi9zaGEyMjQiOjk4LCIuL3NoYTI1NiI6OTksIi4vc2hhMzg0IjoxMDAsIi4vc2hhNTEyIjoxMDF9XSw5NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIGluaGVyaXRzPXJlcXVpcmUoImluaGVyaXRzIik7dmFyIEhhc2g9cmVxdWlyZSgiLi9oYXNoIik7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgSz1bMTUxODUwMDI0OSwxODU5Nzc1MzkzLDI0MDA5NTk3MDh8MCwzMzk1NDY5NzgyfDBdO3ZhciBXPW5ldyBBcnJheSg4MCk7ZnVuY3Rpb24gU2hhKCl7dGhpcy5pbml0KCk7dGhpcy5fdz1XO0hhc2guY2FsbCh0aGlzLDY0LDU2KX1pbmhlcml0cyhTaGEsSGFzaCk7U2hhLnByb3RvdHlwZS5pbml0PWZ1bmN0aW9uKCl7dGhpcy5fYT0xNzMyNTg0MTkzO3RoaXMuX2I9NDAyMzIzMzQxNzt0aGlzLl9jPTI1NjIzODMxMDI7dGhpcy5fZD0yNzE3MzM4Nzg7dGhpcy5fZT0zMjg1Mzc3NTIwO3JldHVybiB0aGlzfTtmdW5jdGlvbiByb3RsNShudW0pe3JldHVybiBudW08PDV8bnVtPj4+Mjd9ZnVuY3Rpb24gcm90bDMwKG51bSl7cmV0dXJuIG51bTw8MzB8bnVtPj4+Mn1mdW5jdGlvbiBmdChzLGIsYyxkKXtpZihzPT09MClyZXR1cm4gYiZjfH5iJmQ7aWYocz09PTIpcmV0dXJuIGImY3xiJmR8YyZkO3JldHVybiBiXmNeZH1TaGEucHJvdG90eXBlLl91cGRhdGU9ZnVuY3Rpb24oTSl7dmFyIFc9dGhpcy5fdzt2YXIgYT10aGlzLl9hfDA7dmFyIGI9dGhpcy5fYnwwO3ZhciBjPXRoaXMuX2N8MDt2YXIgZD10aGlzLl9kfDA7dmFyIGU9dGhpcy5fZXwwO2Zvcih2YXIgaT0wO2k8MTY7KytpKVdbaV09TS5yZWFkSW50MzJCRShpKjQpO2Zvcig7aTw4MDsrK2kpV1tpXT1XW2ktM11eV1tpLThdXldbaS0xNF1eV1tpLTE2XTtmb3IodmFyIGo9MDtqPDgwOysrail7dmFyIHM9fn4oai8yMCk7dmFyIHQ9cm90bDUoYSkrZnQocyxiLGMsZCkrZStXW2pdK0tbc118MDtlPWQ7ZD1jO2M9cm90bDMwKGIpO2I9YTthPXR9dGhpcy5fYT1hK3RoaXMuX2F8MDt0aGlzLl9iPWIrdGhpcy5fYnwwO3RoaXMuX2M9Yyt0aGlzLl9jfDA7dGhpcy5fZD1kK3RoaXMuX2R8MDt0aGlzLl9lPWUrdGhpcy5fZXwwfTtTaGEucHJvdG90eXBlLl9oYXNoPWZ1bmN0aW9uKCl7dmFyIEg9QnVmZmVyLmFsbG9jVW5zYWZlKDIwKTtILndyaXRlSW50MzJCRSh0aGlzLl9hfDAsMCk7SC53cml0ZUludDMyQkUodGhpcy5fYnwwLDQpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2N8MCw4KTtILndyaXRlSW50MzJCRSh0aGlzLl9kfDAsMTIpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2V8MCwxNik7cmV0dXJuIEh9O21vZHVsZS5leHBvcnRzPVNoYX0seyIuL2hhc2giOjk0LGluaGVyaXRzOjM2LCJzYWZlLWJ1ZmZlciI6ODN9XSw5NzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIGluaGVyaXRzPXJlcXVpcmUoImluaGVyaXRzIik7dmFyIEhhc2g9cmVxdWlyZSgiLi9oYXNoIik7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgSz1bMTUxODUwMDI0OSwxODU5Nzc1MzkzLDI0MDA5NTk3MDh8MCwzMzk1NDY5NzgyfDBdO3ZhciBXPW5ldyBBcnJheSg4MCk7ZnVuY3Rpb24gU2hhMSgpe3RoaXMuaW5pdCgpO3RoaXMuX3c9VztIYXNoLmNhbGwodGhpcyw2NCw1Nil9aW5oZXJpdHMoU2hhMSxIYXNoKTtTaGExLnByb3RvdHlwZS5pbml0PWZ1bmN0aW9uKCl7dGhpcy5fYT0xNzMyNTg0MTkzO3RoaXMuX2I9NDAyMzIzMzQxNzt0aGlzLl9jPTI1NjIzODMxMDI7dGhpcy5fZD0yNzE3MzM4Nzg7dGhpcy5fZT0zMjg1Mzc3NTIwO3JldHVybiB0aGlzfTtmdW5jdGlvbiByb3RsMShudW0pe3JldHVybiBudW08PDF8bnVtPj4+MzF9ZnVuY3Rpb24gcm90bDUobnVtKXtyZXR1cm4gbnVtPDw1fG51bT4+PjI3fWZ1bmN0aW9uIHJvdGwzMChudW0pe3JldHVybiBudW08PDMwfG51bT4+PjJ9ZnVuY3Rpb24gZnQocyxiLGMsZCl7aWYocz09PTApcmV0dXJuIGImY3x+YiZkO2lmKHM9PT0yKXJldHVybiBiJmN8YiZkfGMmZDtyZXR1cm4gYl5jXmR9U2hhMS5wcm90b3R5cGUuX3VwZGF0ZT1mdW5jdGlvbihNKXt2YXIgVz10aGlzLl93O3ZhciBhPXRoaXMuX2F8MDt2YXIgYj10aGlzLl9ifDA7dmFyIGM9dGhpcy5fY3wwO3ZhciBkPXRoaXMuX2R8MDt2YXIgZT10aGlzLl9lfDA7Zm9yKHZhciBpPTA7aTwxNjsrK2kpV1tpXT1NLnJlYWRJbnQzMkJFKGkqNCk7Zm9yKDtpPDgwOysraSlXW2ldPXJvdGwxKFdbaS0zXV5XW2ktOF1eV1tpLTE0XV5XW2ktMTZdKTtmb3IodmFyIGo9MDtqPDgwOysrail7dmFyIHM9fn4oai8yMCk7dmFyIHQ9cm90bDUoYSkrZnQocyxiLGMsZCkrZStXW2pdK0tbc118MDtlPWQ7ZD1jO2M9cm90bDMwKGIpO2I9YTthPXR9dGhpcy5fYT1hK3RoaXMuX2F8MDt0aGlzLl9iPWIrdGhpcy5fYnwwO3RoaXMuX2M9Yyt0aGlzLl9jfDA7dGhpcy5fZD1kK3RoaXMuX2R8MDt0aGlzLl9lPWUrdGhpcy5fZXwwfTtTaGExLnByb3RvdHlwZS5faGFzaD1mdW5jdGlvbigpe3ZhciBIPUJ1ZmZlci5hbGxvY1Vuc2FmZSgyMCk7SC53cml0ZUludDMyQkUodGhpcy5fYXwwLDApO0gud3JpdGVJbnQzMkJFKHRoaXMuX2J8MCw0KTtILndyaXRlSW50MzJCRSh0aGlzLl9jfDAsOCk7SC53cml0ZUludDMyQkUodGhpcy5fZHwwLDEyKTtILndyaXRlSW50MzJCRSh0aGlzLl9lfDAsMTYpO3JldHVybiBIfTttb2R1bGUuZXhwb3J0cz1TaGExfSx7Ii4vaGFzaCI6OTQsaW5oZXJpdHM6MzYsInNhZmUtYnVmZmVyIjo4M31dLDk4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXt2YXIgaW5oZXJpdHM9cmVxdWlyZSgiaW5oZXJpdHMiKTt2YXIgU2hhMjU2PXJlcXVpcmUoIi4vc2hhMjU2Iik7dmFyIEhhc2g9cmVxdWlyZSgiLi9oYXNoIik7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgVz1uZXcgQXJyYXkoNjQpO2Z1bmN0aW9uIFNoYTIyNCgpe3RoaXMuaW5pdCgpO3RoaXMuX3c9VztIYXNoLmNhbGwodGhpcyw2NCw1Nil9aW5oZXJpdHMoU2hhMjI0LFNoYTI1Nik7U2hhMjI0LnByb3RvdHlwZS5pbml0PWZ1bmN0aW9uKCl7dGhpcy5fYT0zMjM4MzcxMDMyO3RoaXMuX2I9OTE0MTUwNjYzO3RoaXMuX2M9ODEyNzAyOTk5O3RoaXMuX2Q9NDE0NDkxMjY5Nzt0aGlzLl9lPTQyOTA3NzU4NTc7dGhpcy5fZj0xNzUwNjAzMDI1O3RoaXMuX2c9MTY5NDA3NjgzOTt0aGlzLl9oPTMyMDQwNzU0Mjg7cmV0dXJuIHRoaXN9O1NoYTIyNC5wcm90b3R5cGUuX2hhc2g9ZnVuY3Rpb24oKXt2YXIgSD1CdWZmZXIuYWxsb2NVbnNhZmUoMjgpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2EsMCk7SC53cml0ZUludDMyQkUodGhpcy5fYiw0KTtILndyaXRlSW50MzJCRSh0aGlzLl9jLDgpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2QsMTIpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2UsMTYpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2YsMjApO0gud3JpdGVJbnQzMkJFKHRoaXMuX2csMjQpO3JldHVybiBIfTttb2R1bGUuZXhwb3J0cz1TaGEyMjR9LHsiLi9oYXNoIjo5NCwiLi9zaGEyNTYiOjk5LGluaGVyaXRzOjM2LCJzYWZlLWJ1ZmZlciI6ODN9XSw5OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7dmFyIGluaGVyaXRzPXJlcXVpcmUoImluaGVyaXRzIik7dmFyIEhhc2g9cmVxdWlyZSgiLi9oYXNoIik7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgSz1bMTExNjM1MjQwOCwxODk5NDQ3NDQxLDMwNDkzMjM0NzEsMzkyMTAwOTU3Myw5NjE5ODcxNjMsMTUwODk3MDk5MywyNDUzNjM1NzQ4LDI4NzA3NjMyMjEsMzYyNDM4MTA4MCwzMTA1OTg0MDEsNjA3MjI1Mjc4LDE0MjY4ODE5ODcsMTkyNTA3ODM4OCwyMTYyMDc4MjA2LDI2MTQ4ODgxMDMsMzI0ODIyMjU4MCwzODM1MzkwNDAxLDQwMjIyMjQ3NzQsMjY0MzQ3MDc4LDYwNDgwNzYyOCw3NzAyNTU5ODMsMTI0OTE1MDEyMiwxNTU1MDgxNjkyLDE5OTYwNjQ5ODYsMjU1NDIyMDg4MiwyODIxODM0MzQ5LDI5NTI5OTY4MDgsMzIxMDMxMzY3MSwzMzM2NTcxODkxLDM1ODQ1Mjg3MTEsMTEzOTI2OTkzLDMzODI0MTg5NSw2NjYzMDcyMDUsNzczNTI5OTEyLDEyOTQ3NTczNzIsMTM5NjE4MjI5MSwxNjk1MTgzNzAwLDE5ODY2NjEwNTEsMjE3NzAyNjM1MCwyNDU2OTU2MDM3LDI3MzA0ODU5MjEsMjgyMDMwMjQxMSwzMjU5NzMwODAwLDMzNDU3NjQ3NzEsMzUxNjA2NTgxNywzNjAwMzUyODA0LDQwOTQ1NzE5MDksMjc1NDIzMzQ0LDQzMDIyNzczNCw1MDY5NDg2MTYsNjU5MDYwNTU2LDg4Mzk5Nzg3Nyw5NTgxMzk1NzEsMTMyMjgyMjIxOCwxNTM3MDAyMDYzLDE3NDc4NzM3NzksMTk1NTU2MjIyMiwyMDI0MTA0ODE1LDIyMjc3MzA0NTIsMjM2MTg1MjQyNCwyNDI4NDM2NDc0LDI3NTY3MzQxODcsMzIwNDAzMTQ3OSwzMzI5MzI1Mjk4XTt2YXIgVz1uZXcgQXJyYXkoNjQpO2Z1bmN0aW9uIFNoYTI1Nigpe3RoaXMuaW5pdCgpO3RoaXMuX3c9VztIYXNoLmNhbGwodGhpcyw2NCw1Nil9aW5oZXJpdHMoU2hhMjU2LEhhc2gpO1NoYTI1Ni5wcm90b3R5cGUuaW5pdD1mdW5jdGlvbigpe3RoaXMuX2E9MTc3OTAzMzcwMzt0aGlzLl9iPTMxNDQxMzQyNzc7dGhpcy5fYz0xMDEzOTA0MjQyO3RoaXMuX2Q9Mjc3MzQ4MDc2Mjt0aGlzLl9lPTEzNTk4OTMxMTk7dGhpcy5fZj0yNjAwODIyOTI0O3RoaXMuX2c9NTI4NzM0NjM1O3RoaXMuX2g9MTU0MTQ1OTIyNTtyZXR1cm4gdGhpc307ZnVuY3Rpb24gY2goeCx5LHope3JldHVybiB6XngmKHleeil9ZnVuY3Rpb24gbWFqKHgseSx6KXtyZXR1cm4geCZ5fHomKHh8eSl9ZnVuY3Rpb24gc2lnbWEwKHgpe3JldHVybih4Pj4+Mnx4PDwzMCleKHg+Pj4xM3x4PDwxOSleKHg+Pj4yMnx4PDwxMCl9ZnVuY3Rpb24gc2lnbWExKHgpe3JldHVybih4Pj4+Nnx4PDwyNileKHg+Pj4xMXx4PDwyMSleKHg+Pj4yNXx4PDw3KX1mdW5jdGlvbiBnYW1tYTAoeCl7cmV0dXJuKHg+Pj43fHg8PDI1KV4oeD4+PjE4fHg8PDE0KV54Pj4+M31mdW5jdGlvbiBnYW1tYTEoeCl7cmV0dXJuKHg+Pj4xN3x4PDwxNSleKHg+Pj4xOXx4PDwxMyleeD4+PjEwfVNoYTI1Ni5wcm90b3R5cGUuX3VwZGF0ZT1mdW5jdGlvbihNKXt2YXIgVz10aGlzLl93O3ZhciBhPXRoaXMuX2F8MDt2YXIgYj10aGlzLl9ifDA7dmFyIGM9dGhpcy5fY3wwO3ZhciBkPXRoaXMuX2R8MDt2YXIgZT10aGlzLl9lfDA7dmFyIGY9dGhpcy5fZnwwO3ZhciBnPXRoaXMuX2d8MDt2YXIgaD10aGlzLl9ofDA7Zm9yKHZhciBpPTA7aTwxNjsrK2kpV1tpXT1NLnJlYWRJbnQzMkJFKGkqNCk7Zm9yKDtpPDY0OysraSlXW2ldPWdhbW1hMShXW2ktMl0pK1dbaS03XStnYW1tYTAoV1tpLTE1XSkrV1tpLTE2XXwwO2Zvcih2YXIgaj0wO2o8NjQ7KytqKXt2YXIgVDE9aCtzaWdtYTEoZSkrY2goZSxmLGcpK0tbal0rV1tqXXwwO3ZhciBUMj1zaWdtYTAoYSkrbWFqKGEsYixjKXwwO2g9ZztnPWY7Zj1lO2U9ZCtUMXwwO2Q9YztjPWI7Yj1hO2E9VDErVDJ8MH10aGlzLl9hPWErdGhpcy5fYXwwO3RoaXMuX2I9Yit0aGlzLl9ifDA7dGhpcy5fYz1jK3RoaXMuX2N8MDt0aGlzLl9kPWQrdGhpcy5fZHwwO3RoaXMuX2U9ZSt0aGlzLl9lfDA7dGhpcy5fZj1mK3RoaXMuX2Z8MDt0aGlzLl9nPWcrdGhpcy5fZ3wwO3RoaXMuX2g9aCt0aGlzLl9ofDB9O1NoYTI1Ni5wcm90b3R5cGUuX2hhc2g9ZnVuY3Rpb24oKXt2YXIgSD1CdWZmZXIuYWxsb2NVbnNhZmUoMzIpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2EsMCk7SC53cml0ZUludDMyQkUodGhpcy5fYiw0KTtILndyaXRlSW50MzJCRSh0aGlzLl9jLDgpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2QsMTIpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2UsMTYpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2YsMjApO0gud3JpdGVJbnQzMkJFKHRoaXMuX2csMjQpO0gud3JpdGVJbnQzMkJFKHRoaXMuX2gsMjgpO3JldHVybiBIfTttb2R1bGUuZXhwb3J0cz1TaGEyNTZ9LHsiLi9oYXNoIjo5NCxpbmhlcml0czozNiwic2FmZS1idWZmZXIiOjgzfV0sMTAwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXt2YXIgaW5oZXJpdHM9cmVxdWlyZSgiaW5oZXJpdHMiKTt2YXIgU0hBNTEyPXJlcXVpcmUoIi4vc2hhNTEyIik7dmFyIEhhc2g9cmVxdWlyZSgiLi9oYXNoIik7dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgVz1uZXcgQXJyYXkoMTYwKTtmdW5jdGlvbiBTaGEzODQoKXt0aGlzLmluaXQoKTt0aGlzLl93PVc7SGFzaC5jYWxsKHRoaXMsMTI4LDExMil9aW5oZXJpdHMoU2hhMzg0LFNIQTUxMik7U2hhMzg0LnByb3RvdHlwZS5pbml0PWZ1bmN0aW9uKCl7dGhpcy5fYWg9MzQxODA3MDM2NTt0aGlzLl9iaD0xNjU0MjcwMjUwO3RoaXMuX2NoPTI0Mzg1MjkzNzA7dGhpcy5fZGg9MzU1NDYyMzYwO3RoaXMuX2VoPTE3MzE0MDU0MTU7dGhpcy5fZmg9MjM5NDE4MDIzMTt0aGlzLl9naD0zNjc1MDA4NTI1O3RoaXMuX2hoPTEyMDMwNjI4MTM7dGhpcy5fYWw9MzIzODM3MTAzMjt0aGlzLl9ibD05MTQxNTA2NjM7dGhpcy5fY2w9ODEyNzAyOTk5O3RoaXMuX2RsPTQxNDQ5MTI2OTc7dGhpcy5fZWw9NDI5MDc3NTg1Nzt0aGlzLl9mbD0xNzUwNjAzMDI1O3RoaXMuX2dsPTE2OTQwNzY4Mzk7dGhpcy5faGw9MzIwNDA3NTQyODtyZXR1cm4gdGhpc307U2hhMzg0LnByb3RvdHlwZS5faGFzaD1mdW5jdGlvbigpe3ZhciBIPUJ1ZmZlci5hbGxvY1Vuc2FmZSg0OCk7ZnVuY3Rpb24gd3JpdGVJbnQ2NEJFKGgsbCxvZmZzZXQpe0gud3JpdGVJbnQzMkJFKGgsb2Zmc2V0KTtILndyaXRlSW50MzJCRShsLG9mZnNldCs0KX13cml0ZUludDY0QkUodGhpcy5fYWgsdGhpcy5fYWwsMCk7d3JpdGVJbnQ2NEJFKHRoaXMuX2JoLHRoaXMuX2JsLDgpO3dyaXRlSW50NjRCRSh0aGlzLl9jaCx0aGlzLl9jbCwxNik7d3JpdGVJbnQ2NEJFKHRoaXMuX2RoLHRoaXMuX2RsLDI0KTt3cml0ZUludDY0QkUodGhpcy5fZWgsdGhpcy5fZWwsMzIpO3dyaXRlSW50NjRCRSh0aGlzLl9maCx0aGlzLl9mbCw0MCk7cmV0dXJuIEh9O21vZHVsZS5leHBvcnRzPVNoYTM4NH0seyIuL2hhc2giOjk0LCIuL3NoYTUxMiI6MTAxLGluaGVyaXRzOjM2LCJzYWZlLWJ1ZmZlciI6ODN9XSwxMDE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe3ZhciBpbmhlcml0cz1yZXF1aXJlKCJpbmhlcml0cyIpO3ZhciBIYXNoPXJlcXVpcmUoIi4vaGFzaCIpO3ZhciBCdWZmZXI9cmVxdWlyZSgic2FmZS1idWZmZXIiKS5CdWZmZXI7dmFyIEs9WzExMTYzNTI0MDgsMzYwOTc2NzQ1OCwxODk5NDQ3NDQxLDYwMjg5MTcyNSwzMDQ5MzIzNDcxLDM5NjQ0ODQzOTksMzkyMTAwOTU3MywyMTczMjk1NTQ4LDk2MTk4NzE2Myw0MDgxNjI4NDcyLDE1MDg5NzA5OTMsMzA1MzgzNDI2NSwyNDUzNjM1NzQ4LDI5Mzc2NzE1NzksMjg3MDc2MzIyMSwzNjY0NjA5NTYwLDM2MjQzODEwODAsMjczNDg4MzM5NCwzMTA1OTg0MDEsMTE2NDk5NjU0Miw2MDcyMjUyNzgsMTMyMzYxMDc2NCwxNDI2ODgxOTg3LDM1OTAzMDQ5OTQsMTkyNTA3ODM4OCw0MDY4MTgyMzgzLDIxNjIwNzgyMDYsOTkxMzM2MTEzLDI2MTQ4ODgxMDMsNjMzODAzMzE3LDMyNDgyMjI1ODAsMzQ3OTc3NDg2OCwzODM1MzkwNDAxLDI2NjY2MTM0NTgsNDAyMjIyNDc3NCw5NDQ3MTExMzksMjY0MzQ3MDc4LDIzNDEyNjI3NzMsNjA0ODA3NjI4LDIwMDc4MDA5MzMsNzcwMjU1OTgzLDE0OTU5OTA5MDEsMTI0OTE1MDEyMiwxODU2NDMxMjM1LDE1NTUwODE2OTIsMzE3NTIxODEzMiwxOTk2MDY0OTg2LDIxOTg5NTA4MzcsMjU1NDIyMDg4MiwzOTk5NzE5MzM5LDI4MjE4MzQzNDksNzY2Nzg0MDE2LDI5NTI5OTY4MDgsMjU2NjU5NDg3OSwzMjEwMzEzNjcxLDMyMDMzMzc5NTYsMzMzNjU3MTg5MSwxMDM0NDU3MDI2LDM1ODQ1Mjg3MTEsMjQ2Njk0ODkwMSwxMTM5MjY5OTMsMzc1ODMyNjM4MywzMzgyNDE4OTUsMTY4NzE3OTM2LDY2NjMwNzIwNSwxMTg4MTc5OTY0LDc3MzUyOTkxMiwxNTQ2MDQ1NzM0LDEyOTQ3NTczNzIsMTUyMjgwNTQ4NSwxMzk2MTgyMjkxLDI2NDM4MzM4MjMsMTY5NTE4MzcwMCwyMzQzNTI3MzkwLDE5ODY2NjEwNTEsMTAxNDQ3NzQ4MCwyMTc3MDI2MzUwLDEyMDY3NTkxNDIsMjQ1Njk1NjAzNywzNDQwNzc2MjcsMjczMDQ4NTkyMSwxMjkwODYzNDYwLDI4MjAzMDI0MTEsMzE1ODQ1NDI3MywzMjU5NzMwODAwLDM1MDU5NTI2NTcsMzM0NTc2NDc3MSwxMDYyMTcwMDgsMzUxNjA2NTgxNywzNjA2MDA4MzQ0LDM2MDAzNTI4MDQsMTQzMjcyNTc3Niw0MDk0NTcxOTA5LDE0NjcwMzE1OTQsMjc1NDIzMzQ0LDg1MTE2OTcyMCw0MzAyMjc3MzQsMzEwMDgyMzc1Miw1MDY5NDg2MTYsMTM2MzI1ODE5NSw2NTkwNjA1NTYsMzc1MDY4NTU5Myw4ODM5OTc4NzcsMzc4NTA1MDI4MCw5NTgxMzk1NzEsMzMxODMwNzQyNywxMzIyODIyMjE4LDM4MTI3MjM0MDMsMTUzNzAwMjA2MywyMDAzMDM0OTk1LDE3NDc4NzM3NzksMzYwMjAzNjg5OSwxOTU1NTYyMjIyLDE1NzU5OTAwMTIsMjAyNDEwNDgxNSwxMTI1NTkyOTI4LDIyMjc3MzA0NTIsMjcxNjkwNDMwNiwyMzYxODUyNDI0LDQ0Mjc3NjA0NCwyNDI4NDM2NDc0LDU5MzY5ODM0NCwyNzU2NzM0MTg3LDM3MzMxMTAyNDksMzIwNDAzMTQ3OSwyOTk5MzUxNTczLDMzMjkzMjUyOTgsMzgxNTkyMDQyNywzMzkxNTY5NjE0LDM5MjgzODM5MDAsMzUxNTI2NzI3MSw1NjYyODA3MTEsMzk0MDE4NzYwNiwzNDU0MDY5NTM0LDQxMTg2MzAyNzEsNDAwMDIzOTk5MiwxMTY0MTg0NzQsMTkxNDEzODU1NCwxNzQyOTI0MjEsMjczMTA1NTI3MCwyODkzODAzNTYsMzIwMzk5MzAwNiw0NjAzOTMyNjksMzIwNjIwMzE1LDY4NTQ3MTczMyw1ODc0OTY4MzYsODUyMTQyOTcxLDEwODY3OTI4NTEsMTAxNzAzNjI5OCwzNjU1NDMxMDAsMTEyNjAwMDU4MCwyNjE4Mjk3Njc2LDEyODgwMzM0NzAsMzQwOTg1NTE1OCwxNTAxNTA1OTQ4LDQyMzQ1MDk4NjYsMTYwNzE2NzkxNSw5ODcxNjc0NjgsMTgxNjQwMjMxNiwxMjQ2MTg5NTkxXTt2YXIgVz1uZXcgQXJyYXkoMTYwKTtmdW5jdGlvbiBTaGE1MTIoKXt0aGlzLmluaXQoKTt0aGlzLl93PVc7SGFzaC5jYWxsKHRoaXMsMTI4LDExMil9aW5oZXJpdHMoU2hhNTEyLEhhc2gpO1NoYTUxMi5wcm90b3R5cGUuaW5pdD1mdW5jdGlvbigpe3RoaXMuX2FoPTE3NzkwMzM3MDM7dGhpcy5fYmg9MzE0NDEzNDI3Nzt0aGlzLl9jaD0xMDEzOTA0MjQyO3RoaXMuX2RoPTI3NzM0ODA3NjI7dGhpcy5fZWg9MTM1OTg5MzExOTt0aGlzLl9maD0yNjAwODIyOTI0O3RoaXMuX2doPTUyODczNDYzNTt0aGlzLl9oaD0xNTQxNDU5MjI1O3RoaXMuX2FsPTQwODkyMzU3MjA7dGhpcy5fYmw9MjIyNzg3MzU5NTt0aGlzLl9jbD00MjcxMTc1NzIzO3RoaXMuX2RsPTE1OTU3NTAxMjk7dGhpcy5fZWw9MjkxNzU2NTEzNzt0aGlzLl9mbD03MjU1MTExOTk7dGhpcy5fZ2w9NDIxNTM4OTU0Nzt0aGlzLl9obD0zMjcwMzMyMDk7cmV0dXJuIHRoaXN9O2Z1bmN0aW9uIENoKHgseSx6KXtyZXR1cm4gel54Jih5XnopfWZ1bmN0aW9uIG1haih4LHkseil7cmV0dXJuIHgmeXx6Jih4fHkpfWZ1bmN0aW9uIHNpZ21hMCh4LHhsKXtyZXR1cm4oeD4+PjI4fHhsPDw0KV4oeGw+Pj4yfHg8PDMwKV4oeGw+Pj43fHg8PDI1KX1mdW5jdGlvbiBzaWdtYTEoeCx4bCl7cmV0dXJuKHg+Pj4xNHx4bDw8MTgpXih4Pj4+MTh8eGw8PDE0KV4oeGw+Pj45fHg8PDIzKX1mdW5jdGlvbiBHYW1tYTAoeCx4bCl7cmV0dXJuKHg+Pj4xfHhsPDwzMSleKHg+Pj44fHhsPDwyNCleeD4+Pjd9ZnVuY3Rpb24gR2FtbWEwbCh4LHhsKXtyZXR1cm4oeD4+PjF8eGw8PDMxKV4oeD4+Pjh8eGw8PDI0KV4oeD4+Pjd8eGw8PDI1KX1mdW5jdGlvbiBHYW1tYTEoeCx4bCl7cmV0dXJuKHg+Pj4xOXx4bDw8MTMpXih4bD4+PjI5fHg8PDMpXng+Pj42fWZ1bmN0aW9uIEdhbW1hMWwoeCx4bCl7cmV0dXJuKHg+Pj4xOXx4bDw8MTMpXih4bD4+PjI5fHg8PDMpXih4Pj4+Nnx4bDw8MjYpfWZ1bmN0aW9uIGdldENhcnJ5KGEsYil7cmV0dXJuIGE+Pj4wPGI+Pj4wPzE6MH1TaGE1MTIucHJvdG90eXBlLl91cGRhdGU9ZnVuY3Rpb24oTSl7dmFyIFc9dGhpcy5fdzt2YXIgYWg9dGhpcy5fYWh8MDt2YXIgYmg9dGhpcy5fYmh8MDt2YXIgY2g9dGhpcy5fY2h8MDt2YXIgZGg9dGhpcy5fZGh8MDt2YXIgZWg9dGhpcy5fZWh8MDt2YXIgZmg9dGhpcy5fZmh8MDt2YXIgZ2g9dGhpcy5fZ2h8MDt2YXIgaGg9dGhpcy5faGh8MDt2YXIgYWw9dGhpcy5fYWx8MDt2YXIgYmw9dGhpcy5fYmx8MDt2YXIgY2w9dGhpcy5fY2x8MDt2YXIgZGw9dGhpcy5fZGx8MDt2YXIgZWw9dGhpcy5fZWx8MDt2YXIgZmw9dGhpcy5fZmx8MDt2YXIgZ2w9dGhpcy5fZ2x8MDt2YXIgaGw9dGhpcy5faGx8MDtmb3IodmFyIGk9MDtpPDMyO2krPTIpe1dbaV09TS5yZWFkSW50MzJCRShpKjQpO1dbaSsxXT1NLnJlYWRJbnQzMkJFKGkqNCs0KX1mb3IoO2k8MTYwO2krPTIpe3ZhciB4aD1XW2ktMTUqMl07dmFyIHhsPVdbaS0xNSoyKzFdO3ZhciBnYW1tYTA9R2FtbWEwKHhoLHhsKTt2YXIgZ2FtbWEwbD1HYW1tYTBsKHhsLHhoKTt4aD1XW2ktMioyXTt4bD1XW2ktMioyKzFdO3ZhciBnYW1tYTE9R2FtbWExKHhoLHhsKTt2YXIgZ2FtbWExbD1HYW1tYTFsKHhsLHhoKTt2YXIgV2k3aD1XW2ktNyoyXTt2YXIgV2k3bD1XW2ktNyoyKzFdO3ZhciBXaTE2aD1XW2ktMTYqMl07dmFyIFdpMTZsPVdbaS0xNioyKzFdO3ZhciBXaWw9Z2FtbWEwbCtXaTdsfDA7dmFyIFdpaD1nYW1tYTArV2k3aCtnZXRDYXJyeShXaWwsZ2FtbWEwbCl8MDtXaWw9V2lsK2dhbW1hMWx8MDtXaWg9V2loK2dhbW1hMStnZXRDYXJyeShXaWwsZ2FtbWExbCl8MDtXaWw9V2lsK1dpMTZsfDA7V2loPVdpaCtXaTE2aCtnZXRDYXJyeShXaWwsV2kxNmwpfDA7V1tpXT1XaWg7V1tpKzFdPVdpbH1mb3IodmFyIGo9MDtqPDE2MDtqKz0yKXtXaWg9V1tqXTtXaWw9V1tqKzFdO3ZhciBtYWpoPW1haihhaCxiaCxjaCk7dmFyIG1hamw9bWFqKGFsLGJsLGNsKTt2YXIgc2lnbWEwaD1zaWdtYTAoYWgsYWwpO3ZhciBzaWdtYTBsPXNpZ21hMChhbCxhaCk7dmFyIHNpZ21hMWg9c2lnbWExKGVoLGVsKTt2YXIgc2lnbWExbD1zaWdtYTEoZWwsZWgpO3ZhciBLaWg9S1tqXTt2YXIgS2lsPUtbaisxXTt2YXIgY2hoPUNoKGVoLGZoLGdoKTt2YXIgY2hsPUNoKGVsLGZsLGdsKTt2YXIgdDFsPWhsK3NpZ21hMWx8MDt2YXIgdDFoPWhoK3NpZ21hMWgrZ2V0Q2FycnkodDFsLGhsKXwwO3QxbD10MWwrY2hsfDA7dDFoPXQxaCtjaGgrZ2V0Q2FycnkodDFsLGNobCl8MDt0MWw9dDFsK0tpbHwwO3QxaD10MWgrS2loK2dldENhcnJ5KHQxbCxLaWwpfDA7dDFsPXQxbCtXaWx8MDt0MWg9dDFoK1dpaCtnZXRDYXJyeSh0MWwsV2lsKXwwO3ZhciB0Mmw9c2lnbWEwbCttYWpsfDA7dmFyIHQyaD1zaWdtYTBoK21hamgrZ2V0Q2FycnkodDJsLHNpZ21hMGwpfDA7aGg9Z2g7aGw9Z2w7Z2g9Zmg7Z2w9Zmw7Zmg9ZWg7Zmw9ZWw7ZWw9ZGwrdDFsfDA7ZWg9ZGgrdDFoK2dldENhcnJ5KGVsLGRsKXwwO2RoPWNoO2RsPWNsO2NoPWJoO2NsPWJsO2JoPWFoO2JsPWFsO2FsPXQxbCt0Mmx8MDthaD10MWgrdDJoK2dldENhcnJ5KGFsLHQxbCl8MH10aGlzLl9hbD10aGlzLl9hbCthbHwwO3RoaXMuX2JsPXRoaXMuX2JsK2JsfDA7dGhpcy5fY2w9dGhpcy5fY2wrY2x8MDt0aGlzLl9kbD10aGlzLl9kbCtkbHwwO3RoaXMuX2VsPXRoaXMuX2VsK2VsfDA7dGhpcy5fZmw9dGhpcy5fZmwrZmx8MDt0aGlzLl9nbD10aGlzLl9nbCtnbHwwO3RoaXMuX2hsPXRoaXMuX2hsK2hsfDA7dGhpcy5fYWg9dGhpcy5fYWgrYWgrZ2V0Q2FycnkodGhpcy5fYWwsYWwpfDA7dGhpcy5fYmg9dGhpcy5fYmgrYmgrZ2V0Q2FycnkodGhpcy5fYmwsYmwpfDA7dGhpcy5fY2g9dGhpcy5fY2grY2grZ2V0Q2FycnkodGhpcy5fY2wsY2wpfDA7dGhpcy5fZGg9dGhpcy5fZGgrZGgrZ2V0Q2FycnkodGhpcy5fZGwsZGwpfDA7dGhpcy5fZWg9dGhpcy5fZWgrZWgrZ2V0Q2FycnkodGhpcy5fZWwsZWwpfDA7dGhpcy5fZmg9dGhpcy5fZmgrZmgrZ2V0Q2FycnkodGhpcy5fZmwsZmwpfDA7dGhpcy5fZ2g9dGhpcy5fZ2grZ2grZ2V0Q2FycnkodGhpcy5fZ2wsZ2wpfDA7dGhpcy5faGg9dGhpcy5faGgraGgrZ2V0Q2FycnkodGhpcy5faGwsaGwpfDB9O1NoYTUxMi5wcm90b3R5cGUuX2hhc2g9ZnVuY3Rpb24oKXt2YXIgSD1CdWZmZXIuYWxsb2NVbnNhZmUoNjQpO2Z1bmN0aW9uIHdyaXRlSW50NjRCRShoLGwsb2Zmc2V0KXtILndyaXRlSW50MzJCRShoLG9mZnNldCk7SC53cml0ZUludDMyQkUobCxvZmZzZXQrNCl9d3JpdGVJbnQ2NEJFKHRoaXMuX2FoLHRoaXMuX2FsLDApO3dyaXRlSW50NjRCRSh0aGlzLl9iaCx0aGlzLl9ibCw4KTt3cml0ZUludDY0QkUodGhpcy5fY2gsdGhpcy5fY2wsMTYpO3dyaXRlSW50NjRCRSh0aGlzLl9kaCx0aGlzLl9kbCwyNCk7d3JpdGVJbnQ2NEJFKHRoaXMuX2VoLHRoaXMuX2VsLDMyKTt3cml0ZUludDY0QkUodGhpcy5fZmgsdGhpcy5fZmwsNDApO3dyaXRlSW50NjRCRSh0aGlzLl9naCx0aGlzLl9nbCw0OCk7d3JpdGVJbnQ2NEJFKHRoaXMuX2hoLHRoaXMuX2hsLDU2KTtyZXR1cm4gSH07bW9kdWxlLmV4cG9ydHM9U2hhNTEyfSx7Ii4vaGFzaCI6OTQsaW5oZXJpdHM6MzYsInNhZmUtYnVmZmVyIjo4M31dLDEwMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHM9U3RyZWFtO3ZhciBFRT1yZXF1aXJlKCJldmVudHMiKS5FdmVudEVtaXR0ZXI7dmFyIGluaGVyaXRzPXJlcXVpcmUoImluaGVyaXRzIik7aW5oZXJpdHMoU3RyZWFtLEVFKTtTdHJlYW0uUmVhZGFibGU9cmVxdWlyZSgicmVhZGFibGUtc3RyZWFtL3JlYWRhYmxlLmpzIik7U3RyZWFtLldyaXRhYmxlPXJlcXVpcmUoInJlYWRhYmxlLXN0cmVhbS93cml0YWJsZS5qcyIpO1N0cmVhbS5EdXBsZXg9cmVxdWlyZSgicmVhZGFibGUtc3RyZWFtL2R1cGxleC5qcyIpO1N0cmVhbS5UcmFuc2Zvcm09cmVxdWlyZSgicmVhZGFibGUtc3RyZWFtL3RyYW5zZm9ybS5qcyIpO1N0cmVhbS5QYXNzVGhyb3VnaD1yZXF1aXJlKCJyZWFkYWJsZS1zdHJlYW0vcGFzc3Rocm91Z2guanMiKTtTdHJlYW0uU3RyZWFtPVN0cmVhbTtmdW5jdGlvbiBTdHJlYW0oKXtFRS5jYWxsKHRoaXMpfVN0cmVhbS5wcm90b3R5cGUucGlwZT1mdW5jdGlvbihkZXN0LG9wdGlvbnMpe3ZhciBzb3VyY2U9dGhpcztmdW5jdGlvbiBvbmRhdGEoY2h1bmspe2lmKGRlc3Qud3JpdGFibGUpe2lmKGZhbHNlPT09ZGVzdC53cml0ZShjaHVuaykmJnNvdXJjZS5wYXVzZSl7c291cmNlLnBhdXNlKCl9fX1zb3VyY2Uub24oImRhdGEiLG9uZGF0YSk7ZnVuY3Rpb24gb25kcmFpbigpe2lmKHNvdXJjZS5yZWFkYWJsZSYmc291cmNlLnJlc3VtZSl7c291cmNlLnJlc3VtZSgpfX1kZXN0Lm9uKCJkcmFpbiIsb25kcmFpbik7aWYoIWRlc3QuX2lzU3RkaW8mJighb3B0aW9uc3x8b3B0aW9ucy5lbmQhPT1mYWxzZSkpe3NvdXJjZS5vbigiZW5kIixvbmVuZCk7c291cmNlLm9uKCJjbG9zZSIsb25jbG9zZSl9dmFyIGRpZE9uRW5kPWZhbHNlO2Z1bmN0aW9uIG9uZW5kKCl7aWYoZGlkT25FbmQpcmV0dXJuO2RpZE9uRW5kPXRydWU7ZGVzdC5lbmQoKX1mdW5jdGlvbiBvbmNsb3NlKCl7aWYoZGlkT25FbmQpcmV0dXJuO2RpZE9uRW5kPXRydWU7aWYodHlwZW9mIGRlc3QuZGVzdHJveT09PSJmdW5jdGlvbiIpZGVzdC5kZXN0cm95KCl9ZnVuY3Rpb24gb25lcnJvcihlcil7Y2xlYW51cCgpO2lmKEVFLmxpc3RlbmVyQ291bnQodGhpcywiZXJyb3IiKT09PTApe3Rocm93IGVyfX1zb3VyY2Uub24oImVycm9yIixvbmVycm9yKTtkZXN0Lm9uKCJlcnJvciIsb25lcnJvcik7ZnVuY3Rpb24gY2xlYW51cCgpe3NvdXJjZS5yZW1vdmVMaXN0ZW5lcigiZGF0YSIsb25kYXRhKTtkZXN0LnJlbW92ZUxpc3RlbmVyKCJkcmFpbiIsb25kcmFpbik7c291cmNlLnJlbW92ZUxpc3RlbmVyKCJlbmQiLG9uZW5kKTtzb3VyY2UucmVtb3ZlTGlzdGVuZXIoImNsb3NlIixvbmNsb3NlKTtzb3VyY2UucmVtb3ZlTGlzdGVuZXIoImVycm9yIixvbmVycm9yKTtkZXN0LnJlbW92ZUxpc3RlbmVyKCJlcnJvciIsb25lcnJvcik7c291cmNlLnJlbW92ZUxpc3RlbmVyKCJlbmQiLGNsZWFudXApO3NvdXJjZS5yZW1vdmVMaXN0ZW5lcigiY2xvc2UiLGNsZWFudXApO2Rlc3QucmVtb3ZlTGlzdGVuZXIoImNsb3NlIixjbGVhbnVwKX1zb3VyY2Uub24oImVuZCIsY2xlYW51cCk7c291cmNlLm9uKCJjbG9zZSIsY2xlYW51cCk7ZGVzdC5vbigiY2xvc2UiLGNsZWFudXApO2Rlc3QuZW1pdCgicGlwZSIsc291cmNlKTtyZXR1cm4gZGVzdH19LHtldmVudHM6MzMsaW5oZXJpdHM6MzYsInJlYWRhYmxlLXN0cmVhbS9kdXBsZXguanMiOjEwMywicmVhZGFibGUtc3RyZWFtL3Bhc3N0aHJvdWdoLmpzIjoxMTIsInJlYWRhYmxlLXN0cmVhbS9yZWFkYWJsZS5qcyI6MTEzLCJyZWFkYWJsZS1zdHJlYW0vdHJhbnNmb3JtLmpzIjoxMTQsInJlYWRhYmxlLXN0cmVhbS93cml0YWJsZS5qcyI6MTE1fV0sMTAzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cz1yZXF1aXJlKCIuL2xpYi9fc3RyZWFtX2R1cGxleC5qcyIpfSx7Ii4vbGliL19zdHJlYW1fZHVwbGV4LmpzIjoxMDR9XSwxMDQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpeyJ1c2Ugc3RyaWN0Ijt2YXIgcG5hPXJlcXVpcmUoInByb2Nlc3MtbmV4dGljay1hcmdzIik7dmFyIG9iamVjdEtleXM9T2JqZWN0LmtleXN8fGZ1bmN0aW9uKG9iail7dmFyIGtleXM9W107Zm9yKHZhciBrZXkgaW4gb2JqKXtrZXlzLnB1c2goa2V5KX1yZXR1cm4ga2V5c307bW9kdWxlLmV4cG9ydHM9RHVwbGV4O3ZhciB1dGlsPU9iamVjdC5jcmVhdGUocmVxdWlyZSgiY29yZS11dGlsLWlzIikpO3V0aWwuaW5oZXJpdHM9cmVxdWlyZSgiaW5oZXJpdHMiKTt2YXIgUmVhZGFibGU9cmVxdWlyZSgiLi9fc3RyZWFtX3JlYWRhYmxlIik7dmFyIFdyaXRhYmxlPXJlcXVpcmUoIi4vX3N0cmVhbV93cml0YWJsZSIpO3V0aWwuaW5oZXJpdHMoRHVwbGV4LFJlYWRhYmxlKTt7dmFyIGtleXM9b2JqZWN0S2V5cyhXcml0YWJsZS5wcm90b3R5cGUpO2Zvcih2YXIgdj0wO3Y8a2V5cy5sZW5ndGg7disrKXt2YXIgbWV0aG9kPWtleXNbdl07aWYoIUR1cGxleC5wcm90b3R5cGVbbWV0aG9kXSlEdXBsZXgucHJvdG90eXBlW21ldGhvZF09V3JpdGFibGUucHJvdG90eXBlW21ldGhvZF19fWZ1bmN0aW9uIER1cGxleChvcHRpb25zKXtpZighKHRoaXMgaW5zdGFuY2VvZiBEdXBsZXgpKXJldHVybiBuZXcgRHVwbGV4KG9wdGlvbnMpO1JlYWRhYmxlLmNhbGwodGhpcyxvcHRpb25zKTtXcml0YWJsZS5jYWxsKHRoaXMsb3B0aW9ucyk7aWYob3B0aW9ucyYmb3B0aW9ucy5yZWFkYWJsZT09PWZhbHNlKXRoaXMucmVhZGFibGU9ZmFsc2U7aWYob3B0aW9ucyYmb3B0aW9ucy53cml0YWJsZT09PWZhbHNlKXRoaXMud3JpdGFibGU9ZmFsc2U7dGhpcy5hbGxvd0hhbGZPcGVuPXRydWU7aWYob3B0aW9ucyYmb3B0aW9ucy5hbGxvd0hhbGZPcGVuPT09ZmFsc2UpdGhpcy5hbGxvd0hhbGZPcGVuPWZhbHNlO3RoaXMub25jZSgiZW5kIixvbmVuZCl9T2JqZWN0LmRlZmluZVByb3BlcnR5KER1cGxleC5wcm90b3R5cGUsIndyaXRhYmxlSGlnaFdhdGVyTWFyayIse2VudW1lcmFibGU6ZmFsc2UsZ2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX3dyaXRhYmxlU3RhdGUuaGlnaFdhdGVyTWFya319KTtmdW5jdGlvbiBvbmVuZCgpe2lmKHRoaXMuYWxsb3dIYWxmT3Blbnx8dGhpcy5fd3JpdGFibGVTdGF0ZS5lbmRlZClyZXR1cm47cG5hLm5leHRUaWNrKG9uRW5kTlQsdGhpcyl9ZnVuY3Rpb24gb25FbmROVChzZWxmKXtzZWxmLmVuZCgpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShEdXBsZXgucHJvdG90eXBlLCJkZXN0cm95ZWQiLHtnZXQ6ZnVuY3Rpb24oKXtpZih0aGlzLl9yZWFkYWJsZVN0YXRlPT09dW5kZWZpbmVkfHx0aGlzLl93cml0YWJsZVN0YXRlPT09dW5kZWZpbmVkKXtyZXR1cm4gZmFsc2V9cmV0dXJuIHRoaXMuX3JlYWRhYmxlU3RhdGUuZGVzdHJveWVkJiZ0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZH0sc2V0OmZ1bmN0aW9uKHZhbHVlKXtpZih0aGlzLl9yZWFkYWJsZVN0YXRlPT09dW5kZWZpbmVkfHx0aGlzLl93cml0YWJsZVN0YXRlPT09dW5kZWZpbmVkKXtyZXR1cm59dGhpcy5fcmVhZGFibGVTdGF0ZS5kZXN0cm95ZWQ9dmFsdWU7dGhpcy5fd3JpdGFibGVTdGF0ZS5kZXN0cm95ZWQ9dmFsdWV9fSk7RHVwbGV4LnByb3RvdHlwZS5fZGVzdHJveT1mdW5jdGlvbihlcnIsY2Ipe3RoaXMucHVzaChudWxsKTt0aGlzLmVuZCgpO3BuYS5uZXh0VGljayhjYixlcnIpfX0seyIuL19zdHJlYW1fcmVhZGFibGUiOjEwNiwiLi9fc3RyZWFtX3dyaXRhYmxlIjoxMDgsImNvcmUtdXRpbC1pcyI6MzAsaW5oZXJpdHM6MzYsInByb2Nlc3MtbmV4dGljay1hcmdzIjo2NX1dLDEwNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO21vZHVsZS5leHBvcnRzPVBhc3NUaHJvdWdoO3ZhciBUcmFuc2Zvcm09cmVxdWlyZSgiLi9fc3RyZWFtX3RyYW5zZm9ybSIpO3ZhciB1dGlsPU9iamVjdC5jcmVhdGUocmVxdWlyZSgiY29yZS11dGlsLWlzIikpO3V0aWwuaW5oZXJpdHM9cmVxdWlyZSgiaW5oZXJpdHMiKTt1dGlsLmluaGVyaXRzKFBhc3NUaHJvdWdoLFRyYW5zZm9ybSk7ZnVuY3Rpb24gUGFzc1Rocm91Z2gob3B0aW9ucyl7aWYoISh0aGlzIGluc3RhbmNlb2YgUGFzc1Rocm91Z2gpKXJldHVybiBuZXcgUGFzc1Rocm91Z2gob3B0aW9ucyk7VHJhbnNmb3JtLmNhbGwodGhpcyxvcHRpb25zKX1QYXNzVGhyb3VnaC5wcm90b3R5cGUuX3RyYW5zZm9ybT1mdW5jdGlvbihjaHVuayxlbmNvZGluZyxjYil7Y2IobnVsbCxjaHVuayl9fSx7Ii4vX3N0cmVhbV90cmFuc2Zvcm0iOjEwNywiY29yZS11dGlsLWlzIjozMCxpbmhlcml0czozNn1dLDEwNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKHByb2Nlc3MsZ2xvYmFsKXsidXNlIHN0cmljdCI7dmFyIHBuYT1yZXF1aXJlKCJwcm9jZXNzLW5leHRpY2stYXJncyIpO21vZHVsZS5leHBvcnRzPVJlYWRhYmxlO3ZhciBpc0FycmF5PXJlcXVpcmUoImlzYXJyYXkiKTt2YXIgRHVwbGV4O1JlYWRhYmxlLlJlYWRhYmxlU3RhdGU9UmVhZGFibGVTdGF0ZTt2YXIgRUU9cmVxdWlyZSgiZXZlbnRzIikuRXZlbnRFbWl0dGVyO3ZhciBFRWxpc3RlbmVyQ291bnQ9ZnVuY3Rpb24oZW1pdHRlcix0eXBlKXtyZXR1cm4gZW1pdHRlci5saXN0ZW5lcnModHlwZSkubGVuZ3RofTt2YXIgU3RyZWFtPXJlcXVpcmUoIi4vaW50ZXJuYWwvc3RyZWFtcy9zdHJlYW0iKTt2YXIgQnVmZmVyPXJlcXVpcmUoInNhZmUtYnVmZmVyIikuQnVmZmVyO3ZhciBPdXJVaW50OEFycmF5PWdsb2JhbC5VaW50OEFycmF5fHxmdW5jdGlvbigpe307ZnVuY3Rpb24gX3VpbnQ4QXJyYXlUb0J1ZmZlcihjaHVuayl7cmV0dXJuIEJ1ZmZlci5mcm9tKGNodW5rKX1mdW5jdGlvbiBfaXNVaW50OEFycmF5KG9iail7cmV0dXJuIEJ1ZmZlci5pc0J1ZmZlcihvYmopfHxvYmogaW5zdGFuY2VvZiBPdXJVaW50OEFycmF5fXZhciB1dGlsPU9iamVjdC5jcmVhdGUocmVxdWlyZSgiY29yZS11dGlsLWlzIikpO3V0aWwuaW5oZXJpdHM9cmVxdWlyZSgiaW5oZXJpdHMiKTt2YXIgZGVidWdVdGlsPXJlcXVpcmUoInV0aWwiKTt2YXIgZGVidWc9dm9pZCAwO2lmKGRlYnVnVXRpbCYmZGVidWdVdGlsLmRlYnVnbG9nKXtkZWJ1Zz1kZWJ1Z1V0aWwuZGVidWdsb2coInN0cmVhbSIpfWVsc2V7ZGVidWc9ZnVuY3Rpb24oKXt9fXZhciBCdWZmZXJMaXN0PXJlcXVpcmUoIi4vaW50ZXJuYWwvc3RyZWFtcy9CdWZmZXJMaXN0Iik7dmFyIGRlc3Ryb3lJbXBsPXJlcXVpcmUoIi4vaW50ZXJuYWwvc3RyZWFtcy9kZXN0cm95Iik7dmFyIFN0cmluZ0RlY29kZXI7dXRpbC5pbmhlcml0cyhSZWFkYWJsZSxTdHJlYW0pO3ZhciBrUHJveHlFdmVudHM9WyJlcnJvciIsImNsb3NlIiwiZGVzdHJveSIsInBhdXNlIiwicmVzdW1lIl07ZnVuY3Rpb24gcHJlcGVuZExpc3RlbmVyKGVtaXR0ZXIsZXZlbnQsZm4pe2lmKHR5cGVvZiBlbWl0dGVyLnByZXBlbmRMaXN0ZW5lcj09PSJmdW5jdGlvbiIpcmV0dXJuIGVtaXR0ZXIucHJlcGVuZExpc3RlbmVyKGV2ZW50LGZuKTtpZighZW1pdHRlci5fZXZlbnRzfHwhZW1pdHRlci5fZXZlbnRzW2V2ZW50XSllbWl0dGVyLm9uKGV2ZW50LGZuKTtlbHNlIGlmKGlzQXJyYXkoZW1pdHRlci5fZXZlbnRzW2V2ZW50XSkpZW1pdHRlci5fZXZlbnRzW2V2ZW50XS51bnNoaWZ0KGZuKTtlbHNlIGVtaXR0ZXIuX2V2ZW50c1tldmVudF09W2ZuLGVtaXR0ZXIuX2V2ZW50c1tldmVudF1dfWZ1bmN0aW9uIFJlYWRhYmxlU3RhdGUob3B0aW9ucyxzdHJlYW0pe0R1cGxleD1EdXBsZXh8fHJlcXVpcmUoIi4vX3N0cmVhbV9kdXBsZXgiKTtvcHRpb25zPW9wdGlvbnN8fHt9O3ZhciBpc0R1cGxleD1zdHJlYW0gaW5zdGFuY2VvZiBEdXBsZXg7dGhpcy5vYmplY3RNb2RlPSEhb3B0aW9ucy5vYmplY3RNb2RlO2lmKGlzRHVwbGV4KXRoaXMub2JqZWN0TW9kZT10aGlzLm9iamVjdE1vZGV8fCEhb3B0aW9ucy5yZWFkYWJsZU9iamVjdE1vZGU7dmFyIGh3bT1vcHRpb25zLmhpZ2hXYXRlck1hcms7dmFyIHJlYWRhYmxlSHdtPW9wdGlvbnMucmVhZGFibGVIaWdoV2F0ZXJNYXJrO3ZhciBkZWZhdWx0SHdtPXRoaXMub2JqZWN0TW9kZT8xNjoxNioxMDI0O2lmKGh3bXx8aHdtPT09MCl0aGlzLmhpZ2hXYXRlck1hcms9aHdtO2Vsc2UgaWYoaXNEdXBsZXgmJihyZWFkYWJsZUh3bXx8cmVhZGFibGVId209PT0wKSl0aGlzLmhpZ2hXYXRlck1hcms9cmVhZGFibGVId207ZWxzZSB0aGlzLmhpZ2hXYXRlck1hcms9ZGVmYXVsdEh3bTt0aGlzLmhpZ2hXYXRlck1hcms9TWF0aC5mbG9vcih0aGlzLmhpZ2hXYXRlck1hcmspO3RoaXMuYnVmZmVyPW5ldyBCdWZmZXJMaXN0O3RoaXMubGVuZ3RoPTA7dGhpcy5waXBlcz1udWxsO3RoaXMucGlwZXNDb3VudD0wO3RoaXMuZmxvd2luZz1udWxsO3RoaXMuZW5kZWQ9ZmFsc2U7dGhpcy5lbmRFbWl0dGVkPWZhbHNlO3RoaXMucmVhZGluZz1mYWxzZTt0aGlzLnN5bmM9dHJ1ZTt0aGlzLm5lZWRSZWFkYWJsZT1mYWxzZTt0aGlzLmVtaXR0ZWRSZWFkYWJsZT1mYWxzZTt0aGlzLnJlYWRhYmxlTGlzdGVuaW5nPWZhbHNlO3RoaXMucmVzdW1lU2NoZWR1bGVkPWZhbHNlO3RoaXMuZGVzdHJveWVkPWZhbHNlO3RoaXMuZGVmYXVsdEVuY29kaW5nPW9wdGlvbnMuZGVmYXVsdEVuY29kaW5nfHwidXRmOCI7dGhpcy5hd2FpdERyYWluPTA7dGhpcy5yZWFkaW5nTW9yZT1mYWxzZTt0aGlzLmRlY29kZXI9bnVsbDt0aGlzLmVuY29kaW5nPW51bGw7aWYob3B0aW9ucy5lbmNvZGluZyl7aWYoIVN0cmluZ0RlY29kZXIpU3RyaW5nRGVjb2Rlcj1yZXF1aXJlKCJzdHJpbmdfZGVjb2Rlci8iKS5TdHJpbmdEZWNvZGVyO3RoaXMuZGVjb2Rlcj1uZXcgU3RyaW5nRGVjb2RlcihvcHRpb25zLmVuY29kaW5nKTt0aGlzLmVuY29kaW5nPW9wdGlvbnMuZW5jb2Rpbmd9fWZ1bmN0aW9uIFJlYWRhYmxlKG9wdGlvbnMpe0R1cGxleD1EdXBsZXh8fHJlcXVpcmUoIi4vX3N0cmVhbV9kdXBsZXgiKTtpZighKHRoaXMgaW5zdGFuY2VvZiBSZWFkYWJsZSkpcmV0dXJuIG5ldyBSZWFkYWJsZShvcHRpb25zKTt0aGlzLl9yZWFkYWJsZVN0YXRlPW5ldyBSZWFkYWJsZVN0YXRlKG9wdGlvbnMsdGhpcyk7dGhpcy5yZWFkYWJsZT10cnVlO2lmKG9wdGlvbnMpe2lmKHR5cGVvZiBvcHRpb25zLnJlYWQ9PT0iZnVuY3Rpb24iKXRoaXMuX3JlYWQ9b3B0aW9ucy5yZWFkO2lmKHR5cGVvZiBvcHRpb25zLmRlc3Ryb3k9PT0iZnVuY3Rpb24iKXRoaXMuX2Rlc3Ryb3k9b3B0aW9ucy5kZXN0cm95fVN0cmVhbS5jYWxsKHRoaXMpfU9iamVjdC5kZWZpbmVQcm9wZXJ0eShSZWFkYWJsZS5wcm90b3R5cGUsImRlc3Ryb3llZCIse2dldDpmdW5jdGlvbigpe2lmKHRoaXMuX3JlYWRhYmxlU3RhdGU9PT11bmRlZmluZWQpe3JldHVybiBmYWxzZX1yZXR1cm4gdGhpcy5fcmVhZGFibGVTdGF0ZS5kZXN0cm95ZWR9LHNldDpmdW5jdGlvbih2YWx1ZSl7aWYoIXRoaXMuX3JlYWRhYmxlU3RhdGUpe3JldHVybn10aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZD12YWx1ZX19KTtSZWFkYWJsZS5wcm90b3R5cGUuZGVzdHJveT1kZXN0cm95SW1wbC5kZXN0cm95O1JlYWRhYmxlLnByb3RvdHlwZS5fdW5kZXN0cm95PWRlc3Ryb3lJbXBsLnVuZGVzdHJveTtSZWFkYWJsZS5wcm90b3R5cGUuX2Rlc3Ryb3k9ZnVuY3Rpb24oZXJyLGNiKXt0aGlzLnB1c2gobnVsbCk7Y2IoZXJyKX07UmVhZGFibGUucHJvdG90eXBlLnB1c2g9ZnVuY3Rpb24oY2h1bmssZW5jb2Rpbmcpe3ZhciBzdGF0ZT10aGlzLl9yZWFkYWJsZVN0YXRlO3ZhciBza2lwQ2h1bmtDaGVjaztpZighc3RhdGUub2JqZWN0TW9kZSl7aWYodHlwZW9mIGNodW5rPT09InN0cmluZyIpe2VuY29kaW5nPWVuY29kaW5nfHxzdGF0ZS5kZWZhdWx0RW5jb2Rpbmc7aWYoZW5jb2RpbmchPT1zdGF0ZS5lbmNvZGluZyl7Y2h1bms9QnVmZmVyLmZyb20oY2h1bmssZW5jb2RpbmcpO2VuY29kaW5nPSIifXNraXBDaHVua0NoZWNrPXRydWV9fWVsc2V7c2tpcENodW5rQ2hlY2s9dHJ1ZX1yZXR1cm4gcmVhZGFibGVBZGRDaHVuayh0aGlzLGNodW5rLGVuY29kaW5nLGZhbHNlLHNraXBDaHVua0NoZWNrKX07UmVhZGFibGUucHJvdG90eXBlLnVuc2hpZnQ9ZnVuY3Rpb24oY2h1bmspe3JldHVybiByZWFkYWJsZUFkZENodW5rKHRoaXMsY2h1bmssbnVsbCx0cnVlLGZhbHNlKX07ZnVuY3Rpb24gcmVhZGFibGVBZGRDaHVuayhzdHJlYW0sY2h1bmssZW5jb2RpbmcsYWRkVG9Gcm9udCxza2lwQ2h1bmtDaGVjayl7dmFyIHN0YXRlPXN0cmVhbS5fcmVhZGFibGVTdGF0ZTtpZihjaHVuaz09PW51bGwpe3N0YXRlLnJlYWRpbmc9ZmFsc2U7b25Fb2ZDaHVuayhzdHJlYW0sc3RhdGUpfWVsc2V7dmFyIGVyO2lmKCFza2lwQ2h1bmtDaGVjayllcj1jaHVua0ludmFsaWQoc3RhdGUsY2h1bmspO2lmKGVyKXtzdHJlYW0uZW1pdCgiZXJyb3IiLGVyKX1lbHNlIGlmKHN0YXRlLm9iamVjdE1vZGV8fGNodW5rJiZjaHVuay5sZW5ndGg+MCl7aWYodHlwZW9mIGNodW5rIT09InN0cmluZyImJiFzdGF0ZS5vYmplY3RNb2RlJiZPYmplY3QuZ2V0UHJvdG90eXBlT2YoY2h1bmspIT09QnVmZmVyLnByb3RvdHlwZSl7Y2h1bms9X3VpbnQ4QXJyYXlUb0J1ZmZlcihjaHVuayl9aWYoYWRkVG9Gcm9udCl7aWYoc3RhdGUuZW5kRW1pdHRlZClzdHJlYW0uZW1pdCgiZXJyb3IiLG5ldyBFcnJvcigic3RyZWFtLnVuc2hpZnQoKSBhZnRlciBlbmQgZXZlbnQiKSk7ZWxzZSBhZGRDaHVuayhzdHJlYW0sc3RhdGUsY2h1bmssdHJ1ZSl9ZWxzZSBpZihzdGF0ZS5lbmRlZCl7c3RyZWFtLmVtaXQoImVycm9yIixuZXcgRXJyb3IoInN0cmVhbS5wdXNoKCkgYWZ0ZXIgRU9GIikpfWVsc2V7c3RhdGUucmVhZGluZz1mYWxzZTtpZihzdGF0ZS5kZWNvZGVyJiYhZW5jb2Rpbmcpe2NodW5rPXN0YXRlLmRlY29kZXIud3JpdGUoY2h1bmspO2lmKHN0YXRlLm9iamVjdE1vZGV8fGNodW5rLmxlbmd0aCE9PTApYWRkQ2h1bmsoc3RyZWFtLHN0YXRlLGNodW5rLGZhbHNlKTtlbHNlIG1heWJlUmVhZE1vcmUoc3RyZWFtLHN0YXRlKX1lbHNle2FkZENodW5rKHN0cmVhbSxzdGF0ZSxjaHVuayxmYWxzZSl9fX1lbHNlIGlmKCFhZGRUb0Zyb250KXtzdGF0ZS5yZWFkaW5nPWZhbHNlfX1yZXR1cm4gbmVlZE1vcmVEYXRhKHN0YXRlKX1mdW5jdGlvbiBhZGRDaHVuayhzdHJlYW0sc3RhdGUsY2h1bmssYWRkVG9Gcm9udCl7aWYoc3RhdGUuZmxvd2luZyYmc3RhdGUubGVuZ3RoPT09MCYmIXN0YXRlLnN5bmMpe3N0cmVhbS5lbWl0KCJkYXRhIixjaHVuayk7c3RyZWFtLnJlYWQoMCl9ZWxzZXtzdGF0ZS5sZW5ndGgrPXN0YXRlLm9iamVjdE1vZGU/MTpjaHVuay5sZW5ndGg7aWYoYWRkVG9Gcm9udClzdGF0ZS5idWZmZXIudW5zaGlmdChjaHVuayk7ZWxzZSBzdGF0ZS5idWZmZXIucHVzaChjaHVuayk7aWYoc3RhdGUubmVlZFJlYWRhYmxlKWVtaXRSZWFkYWJsZShzdHJlYW0pfW1heWJlUmVhZE1vcmUoc3RyZWFtLHN0YXRlKX1mdW5jdGlvbiBjaHVua0ludmFsaWQoc3RhdGUsY2h1bmspe3ZhciBlcjtpZighX2lzVWludDhBcnJheShjaHVuaykmJnR5cGVvZiBjaHVuayE9PSJzdHJpbmciJiZjaHVuayE9PXVuZGVmaW5lZCYmIXN0YXRlLm9iamVjdE1vZGUpe2VyPW5ldyBUeXBlRXJyb3IoIkludmFsaWQgbm9uLXN0cmluZy9idWZmZXIgY2h1bmsiKX1yZXR1cm4gZXJ9ZnVuY3Rpb24gbmVlZE1vcmVEYXRhKHN0YXRlKXtyZXR1cm4hc3RhdGUuZW5kZWQmJihzdGF0ZS5uZWVkUmVhZGFibGV8fHN0YXRlLmxlbmd0aDxzdGF0ZS5oaWdoV2F0ZXJNYXJrfHxzdGF0ZS5sZW5ndGg9PT0wKX1SZWFkYWJsZS5wcm90b3R5cGUuaXNQYXVzZWQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nPT09ZmFsc2V9O1JlYWRhYmxlLnByb3RvdHlwZS5zZXRFbmNvZGluZz1mdW5jdGlvbihlbmMpe2lmKCFTdHJpbmdEZWNvZGVyKVN0cmluZ0RlY29kZXI9cmVxdWlyZSgic3RyaW5nX2RlY29kZXIvIikuU3RyaW5nRGVjb2Rlcjt0aGlzLl9yZWFkYWJsZVN0YXRlLmRlY29kZXI9bmV3IFN0cmluZ0RlY29kZXIoZW5jKTt0aGlzLl9yZWFkYWJsZVN0YXRlLmVuY29kaW5nPWVuYztyZXR1cm4gdGhpc307dmFyIE1BWF9IV009ODM4ODYwODtmdW5jdGlvbiBjb21wdXRlTmV3SGlnaFdhdGVyTWFyayhuKXtpZihuPj1NQVhfSFdNKXtuPU1BWF9IV019ZWxzZXtuLS07bnw9bj4+PjE7bnw9bj4+PjI7bnw9bj4+PjQ7bnw9bj4+Pjg7bnw9bj4+PjE2O24rK31yZXR1cm4gbn1mdW5jdGlvbiBob3dNdWNoVG9SZWFkKG4sc3RhdGUpe2lmKG48PTB8fHN0YXRlLmxlbmd0aD09PTAmJnN0YXRlLmVuZGVkKXJldHVybiAwO2lmKHN0YXRlLm9iamVjdE1vZGUpcmV0dXJuIDE7aWYobiE9PW4pe2lmKHN0YXRlLmZsb3dpbmcmJnN0YXRlLmxlbmd0aClyZXR1cm4gc3RhdGUuYnVmZmVyLmhlYWQuZGF0YS5sZW5ndGg7ZWxzZSByZXR1cm4gc3RhdGUubGVuZ3RofWlmKG4+c3RhdGUuaGlnaFdhdGVyTWFyaylzdGF0ZS5oaWdoV2F0ZXJNYXJrPWNvbXB1dGVOZXdIaWdoV2F0ZXJNYXJrKG4pO2lmKG48PXN0YXRlLmxlbmd0aClyZXR1cm4gbjtpZighc3RhdGUuZW5kZWQpe3N0YXRlLm5lZWRSZWFkYWJsZT10cnVlO3JldHVybiAwfXJldHVybiBzdGF0ZS5sZW5ndGh9UmVhZGFibGUucHJvdG90eXBlLnJlYWQ9ZnVuY3Rpb24obil7ZGVidWcoInJlYWQiLG4pO249cGFyc2VJbnQobiwxMCk7dmFyIHN0YXRlPXRoaXMuX3JlYWRhYmxlU3RhdGU7dmFyIG5PcmlnPW47aWYobiE9PTApc3RhdGUuZW1pdHRlZFJlYWRhYmxlPWZhbHNlO2lmKG49PT0wJiZzdGF0ZS5uZWVkUmVhZGFibGUmJihzdGF0ZS5sZW5ndGg+PXN0YXRlLmhpZ2hXYXRlck1hcmt8fHN0YXRlLmVuZGVkKSl7ZGVidWcoInJlYWQ6IGVtaXRSZWFkYWJsZSIsc3RhdGUubGVuZ3RoLHN0YXRlLmVuZGVkKTtpZihzdGF0ZS5sZW5ndGg9PT0wJiZzdGF0ZS5lbmRlZCllbmRSZWFkYWJsZSh0aGlzKTtlbHNlIGVtaXRSZWFkYWJsZSh0aGlzKTtyZXR1cm4gbnVsbH1uPWhvd011Y2hUb1JlYWQobixzdGF0ZSk7aWYobj09PTAmJnN0YXRlLmVuZGVkKXtpZihzdGF0ZS5sZW5ndGg9PT0wKWVuZFJlYWRhYmxlKHRoaXMpO3JldHVybiBudWxsfXZhciBkb1JlYWQ9c3RhdGUubmVlZFJlYWRhYmxlO2RlYnVnKCJuZWVkIHJlYWRhYmxlIixkb1JlYWQpO2lmKHN0YXRlLmxlbmd0aD09PTB8fHN0YXRlLmxlbmd0aC1uPHN0YXRlLmhpZ2hXYXRlck1hcmspe2RvUmVhZD10cnVlO2RlYnVnKCJsZW5ndGggbGVzcyB0aGFuIHdhdGVybWFyayIsZG9SZWFkKX1pZihzdGF0ZS5lbmRlZHx8c3RhdGUucmVhZGluZyl7ZG9SZWFkPWZhbHNlO2RlYnVnKCJyZWFkaW5nIG9yIGVuZGVkIixkb1JlYWQpfWVsc2UgaWYoZG9SZWFkKXtkZWJ1ZygiZG8gcmVhZCIpO3N0YXRlLnJlYWRpbmc9dHJ1ZTtzdGF0ZS5zeW5jPXRydWU7aWYoc3RhdGUubGVuZ3RoPT09MClzdGF0ZS5uZWVkUmVhZGFibGU9dHJ1ZTt0aGlzLl9yZWFkKHN0YXRlLmhpZ2hXYXRlck1hcmspO3N0YXRlLnN5bmM9ZmFsc2U7aWYoIXN0YXRlLnJlYWRpbmcpbj1ob3dNdWNoVG9SZWFkKG5PcmlnLHN0YXRlKX12YXIgcmV0O2lmKG4+MClyZXQ9ZnJvbUxpc3QobixzdGF0ZSk7ZWxzZSByZXQ9bnVsbDtpZihyZXQ9PT1udWxsKXtzdGF0ZS5uZWVkUmVhZGFibGU9dHJ1ZTtuPTB9ZWxzZXtzdGF0ZS5sZW5ndGgtPW59aWYoc3RhdGUubGVuZ3RoPT09MCl7aWYoIXN0YXRlLmVuZGVkKXN0YXRlLm5lZWRSZWFkYWJsZT10cnVlO2lmKG5PcmlnIT09biYmc3RhdGUuZW5kZWQpZW5kUmVhZGFibGUodGhpcyl9aWYocmV0IT09bnVsbCl0aGlzLmVtaXQoImRhdGEiLHJldCk7cmV0dXJuIHJldH07ZnVuY3Rpb24gb25Fb2ZDaHVuayhzdHJlYW0sc3RhdGUpe2lmKHN0YXRlLmVuZGVkKXJldHVybjtpZihzdGF0ZS5kZWNvZGVyKXt2YXIgY2h1bms9c3RhdGUuZGVjb2Rlci5lbmQoKTtpZihjaHVuayYmY2h1bmsubGVuZ3RoKXtzdGF0ZS5idWZmZXIucHVzaChjaHVuayk7c3RhdGUubGVuZ3RoKz1zdGF0ZS5vYmplY3RNb2RlPzE6Y2h1bmsubGVuZ3RofX1zdGF0ZS5lbmRlZD10cnVlO2VtaXRSZWFkYWJsZShzdHJlYW0pfWZ1bmN0aW9uIGVtaXRSZWFkYWJsZShzdHJlYW0pe3ZhciBzdGF0ZT1zdHJlYW0uX3JlYWRhYmxlU3RhdGU7c3RhdGUubmVlZFJlYWRhYmxlPWZhbHNlO2lmKCFzdGF0ZS5lbWl0dGVkUmVhZGFibGUpe2RlYnVnKCJlbWl0UmVhZGFibGUiLHN0YXRlLmZsb3dpbmcpO3N0YXRlLmVtaXR0ZWRSZWFkYWJsZT10cnVlO2lmKHN0YXRlLnN5bmMpcG5hLm5leHRUaWNrKGVtaXRSZWFkYWJsZV8sc3RyZWFtKTtlbHNlIGVtaXRSZWFkYWJsZV8oc3RyZWFtKX19ZnVuY3Rpb24gZW1pdFJlYWRhYmxlXyhzdHJlYW0pe2RlYnVnKCJlbWl0IHJlYWRhYmxlIik7c3RyZWFtLmVtaXQoInJlYWRhYmxlIik7ZmxvdyhzdHJlYW0pfWZ1bmN0aW9uIG1heWJlUmVhZE1vcmUoc3RyZWFtLHN0YXRlKXtpZighc3RhdGUucmVhZGluZ01vcmUpe3N0YXRlLnJlYWRpbmdNb3JlPXRydWU7cG5hLm5leHRUaWNrKG1heWJlUmVhZE1vcmVfLHN0cmVhbSxzdGF0ZSl9fWZ1bmN0aW9uIG1heWJlUmVhZE1vcmVfKHN0cmVhbSxzdGF0ZSl7dmFyIGxlbj1zdGF0ZS5sZW5ndGg7d2hpbGUoIXN0YXRlLnJlYWRpbmcmJiFzdGF0ZS5mbG93aW5nJiYhc3RhdGUuZW5kZWQmJnN0YXRlLmxlbmd0aDxzdGF0ZS5oaWdoV2F0ZXJNYXJrKXtkZWJ1ZygibWF5YmVSZWFkTW9yZSByZWFkIDAiKTtzdHJlYW0ucmVhZCgwKTtpZihsZW49PT1zdGF0ZS5sZW5ndGgpYnJlYWs7ZWxzZSBsZW49c3RhdGUubGVuZ3RofXN0YXRlLnJlYWRpbmdNb3JlPWZhbHNlfVJlYWRhYmxlLnByb3RvdHlwZS5fcmVhZD1mdW5jdGlvbihuKXt0aGlzLmVtaXQoImVycm9yIixuZXcgRXJyb3IoIl9yZWFkKCkgaXMgbm90IGltcGxlbWVudGVkIikpfTtSZWFkYWJsZS5wcm90b3R5cGUucGlwZT1mdW5jdGlvbihkZXN0LHBpcGVPcHRzKXt2YXIgc3JjPXRoaXM7dmFyIHN0YXRlPXRoaXMuX3JlYWRhYmxlU3RhdGU7c3dpdGNoKHN0YXRlLnBpcGVzQ291bnQpe2Nhc2UgMDpzdGF0ZS5waXBlcz1kZXN0O2JyZWFrO2Nhc2UgMTpzdGF0ZS5waXBlcz1bc3RhdGUucGlwZXMsZGVzdF07YnJlYWs7ZGVmYXVsdDpzdGF0ZS5waXBlcy5wdXNoKGRlc3QpO2JyZWFrfXN0YXRlLnBpcGVzQ291bnQrPTE7ZGVidWcoInBpcGUgY291bnQ9JWQgb3B0cz0laiIsc3RhdGUucGlwZXNDb3VudCxwaXBlT3B0cyk7dmFyIGRvRW5kPSghcGlwZU9wdHN8fHBpcGVPcHRzLmVuZCE9PWZhbHNlKSYmZGVzdCE9PXByb2Nlc3Muc3Rkb3V0JiZkZXN0IT09cHJvY2Vzcy5zdGRlcnI7dmFyIGVuZEZuPWRvRW5kP29uZW5kOnVucGlwZTtpZihzdGF0ZS5lbmRFbWl0dGVkKXBuYS5uZXh0VGljayhlbmRGbik7ZWxzZSBzcmMub25jZSgiZW5kIixlbmRGbik7ZGVzdC5vbigidW5waXBlIixvbnVucGlwZSk7ZnVuY3Rpb24gb251bnBpcGUocmVhZGFibGUsdW5waXBlSW5mbyl7ZGVidWcoIm9udW5waXBlIik7aWYocmVhZGFibGU9PT1zcmMpe2lmKHVucGlwZUluZm8mJnVucGlwZUluZm8uaGFzVW5waXBlZD09PWZhbHNlKXt1bnBpcGVJbmZvLmhhc1VucGlwZWQ9dHJ1ZTtjbGVhbnVwKCl9fX1mdW5jdGlvbiBvbmVuZCgpe2RlYnVnKCJvbmVuZCIpO2Rlc3QuZW5kKCl9dmFyIG9uZHJhaW49cGlwZU9uRHJhaW4oc3JjKTtkZXN0Lm9uKCJkcmFpbiIsb25kcmFpbik7dmFyIGNsZWFuZWRVcD1mYWxzZTtmdW5jdGlvbiBjbGVhbnVwKCl7ZGVidWcoImNsZWFudXAiKTtkZXN0LnJlbW92ZUxpc3RlbmVyKCJjbG9zZSIsb25jbG9zZSk7ZGVzdC5yZW1vdmVMaXN0ZW5lcigiZmluaXNoIixvbmZpbmlzaCk7ZGVzdC5yZW1vdmVMaXN0ZW5lcigiZHJhaW4iLG9uZHJhaW4pO2Rlc3QucmVtb3ZlTGlzdGVuZXIoImVycm9yIixvbmVycm9yKTtkZXN0LnJlbW92ZUxpc3RlbmVyKCJ1bnBpcGUiLG9udW5waXBlKTtzcmMucmVtb3ZlTGlzdGVuZXIoImVuZCIsb25lbmQpO3NyYy5yZW1vdmVMaXN0ZW5lcigiZW5kIix1bnBpcGUpO3NyYy5yZW1vdmVMaXN0ZW5lcigiZGF0YSIsb25kYXRhKTtjbGVhbmVkVXA9dHJ1ZTtpZihzdGF0ZS5hd2FpdERyYWluJiYoIWRlc3QuX3dyaXRhYmxlU3RhdGV8fGRlc3QuX3dyaXRhYmxlU3RhdGUubmVlZERyYWluKSlvbmRyYWluKCl9dmFyIGluY3JlYXNlZEF3YWl0RHJhaW49ZmFsc2U7c3JjLm9uKCJkYXRhIixvbmRhdGEpO2Z1bmN0aW9uIG9uZGF0YShjaHVuayl7ZGVidWcoIm9uZGF0YSIpO2luY3JlYXNlZEF3YWl0RHJhaW49ZmFsc2U7dmFyIHJldD1kZXN0LndyaXRlKGNodW5rKTtpZihmYWxzZT09PXJldCYmIWluY3JlYXNlZEF3YWl0RHJhaW4pe2lmKChzdGF0ZS5waXBlc0NvdW50PT09MSYmc3RhdGUucGlwZXM9PT1kZXN0fHxzdGF0ZS5waXBlc0NvdW50PjEmJmluZGV4T2Yoc3RhdGUucGlwZXMsZGVzdCkhPT0tMSkmJiFjbGVhbmVkVXApe2RlYnVnKCJmYWxzZSB3cml0ZSByZXNwb25zZSwgcGF1c2UiLHNyYy5fcmVhZGFibGVTdGF0ZS5hd2FpdERyYWluKTtzcmMuX3JlYWRhYmxlU3RhdGUuYXdhaXREcmFpbisrO2luY3JlYXNlZEF3YWl0RHJhaW49dHJ1ZX1zcmMucGF1c2UoKX19ZnVuY3Rpb24gb25lcnJvcihlcil7ZGVidWcoIm9uZXJyb3IiLGVyKTt1bnBpcGUoKTtkZXN0LnJlbW92ZUxpc3RlbmVyKCJlcnJvciIsb25lcnJvcik7aWYoRUVsaXN0ZW5lckNvdW50KGRlc3QsImVycm9yIik9PT0wKWRlc3QuZW1pdCgiZXJyb3IiLGVyKX1wcmVwZW5kTGlzdGVuZXIoZGVzdCwiZXJyb3IiLG9uZXJyb3IpO2Z1bmN0aW9uIG9uY2xvc2UoKXtkZXN0LnJlbW92ZUxpc3RlbmVyKCJmaW5pc2giLG9uZmluaXNoKTt1bnBpcGUoKX1kZXN0Lm9uY2UoImNsb3NlIixvbmNsb3NlKTtmdW5jdGlvbiBvbmZpbmlzaCgpe2RlYnVnKCJvbmZpbmlzaCIpO2Rlc3QucmVtb3ZlTGlzdGVuZXIoImNsb3NlIixvbmNsb3NlKTt1bnBpcGUoKX1kZXN0Lm9uY2UoImZpbmlzaCIsb25maW5pc2gpO2Z1bmN0aW9uIHVucGlwZSgpe2RlYnVnKCJ1bnBpcGUiKTtzcmMudW5waXBlKGRlc3QpfWRlc3QuZW1pdCgicGlwZSIsc3JjKTtpZighc3RhdGUuZmxvd2luZyl7ZGVidWcoInBpcGUgcmVzdW1lIik7c3JjLnJlc3VtZSgpfXJldHVybiBkZXN0fTtmdW5jdGlvbiBwaXBlT25EcmFpbihzcmMpe3JldHVybiBmdW5jdGlvbigpe3ZhciBzdGF0ZT1zcmMuX3JlYWRhYmxlU3RhdGU7ZGVidWcoInBpcGVPbkRyYWluIixzdGF0ZS5hd2FpdERyYWluKTtpZihzdGF0ZS5hd2FpdERyYWluKXN0YXRlLmF3YWl0RHJhaW4tLTtpZihzdGF0ZS5hd2FpdERyYWluPT09MCYmRUVsaXN0ZW5lckNvdW50KHNyYywiZGF0YSIpKXtzdGF0ZS5mbG93aW5nPXRydWU7ZmxvdyhzcmMpfX19UmVhZGFibGUucHJvdG90eXBlLnVucGlwZT1mdW5jdGlvbihkZXN0KXt2YXIgc3RhdGU9dGhpcy5fcmVhZGFibGVTdGF0ZTt2YXIgdW5waXBlSW5mbz17aGFzVW5waXBlZDpmYWxzZX07aWYoc3RhdGUucGlwZXNDb3VudD09PTApcmV0dXJuIHRoaXM7aWYoc3RhdGUucGlwZXNDb3VudD09PTEpe2lmKGRlc3QmJmRlc3QhPT1zdGF0ZS5waXBlcylyZXR1cm4gdGhpcztpZighZGVzdClkZXN0PXN0YXRlLnBpcGVzO3N0YXRlLnBpcGVzPW51bGw7c3RhdGUucGlwZXNDb3VudD0wO3N0YXRlLmZsb3dpbmc9ZmFsc2U7aWYoZGVzdClkZXN0LmVtaXQoInVucGlwZSIsdGhpcyx1bnBpcGVJbmZvKTtyZXR1cm4gdGhpc31pZighZGVzdCl7dmFyIGRlc3RzPXN0YXRlLnBpcGVzO3ZhciBsZW49c3RhdGUucGlwZXNDb3VudDtzdGF0ZS5waXBlcz1udWxsO3N0YXRlLnBpcGVzQ291bnQ9MDtzdGF0ZS5mbG93aW5nPWZhbHNlO2Zvcih2YXIgaT0wO2k8bGVuO2krKyl7ZGVzdHNbaV0uZW1pdCgidW5waXBlIix0aGlzLHVucGlwZUluZm8pfXJldHVybiB0aGlzfXZhciBpbmRleD1pbmRleE9mKHN0YXRlLnBpcGVzLGRlc3QpO2lmKGluZGV4PT09LTEpcmV0dXJuIHRoaXM7c3RhdGUucGlwZXMuc3BsaWNlKGluZGV4LDEpO3N0YXRlLnBpcGVzQ291bnQtPTE7aWYoc3RhdGUucGlwZXNDb3VudD09PTEpc3RhdGUucGlwZXM9c3RhdGUucGlwZXNbMF07ZGVzdC5lbWl0KCJ1bnBpcGUiLHRoaXMsdW5waXBlSW5mbyk7cmV0dXJuIHRoaXN9O1JlYWRhYmxlLnByb3RvdHlwZS5vbj1mdW5jdGlvbihldixmbil7dmFyIHJlcz1TdHJlYW0ucHJvdG90eXBlLm9uLmNhbGwodGhpcyxldixmbik7aWYoZXY9PT0iZGF0YSIpe2lmKHRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZyE9PWZhbHNlKXRoaXMucmVzdW1lKCl9ZWxzZSBpZihldj09PSJyZWFkYWJsZSIpe3ZhciBzdGF0ZT10aGlzLl9yZWFkYWJsZVN0YXRlO2lmKCFzdGF0ZS5lbmRFbWl0dGVkJiYhc3RhdGUucmVhZGFibGVMaXN0ZW5pbmcpe3N0YXRlLnJlYWRhYmxlTGlzdGVuaW5nPXN0YXRlLm5lZWRSZWFkYWJsZT10cnVlO3N0YXRlLmVtaXR0ZWRSZWFkYWJsZT1mYWxzZTtpZighc3RhdGUucmVhZGluZyl7cG5hLm5leHRUaWNrKG5SZWFkaW5nTmV4dFRpY2ssdGhpcyl9ZWxzZSBpZihzdGF0ZS5sZW5ndGgpe2VtaXRSZWFkYWJsZSh0aGlzKX19fXJldHVybiByZXN9O1JlYWRhYmxlLnByb3RvdHlwZS5hZGRMaXN0ZW5lcj1SZWFkYWJsZS5wcm90b3R5cGUub247ZnVuY3Rpb24gblJlYWRpbmdOZXh0VGljayhzZWxmKXtkZWJ1ZygicmVhZGFibGUgbmV4dHRpY2sgcmVhZCAwIik7c2VsZi5yZWFkKDApfVJlYWRhYmxlLnByb3RvdHlwZS5yZXN1bWU9ZnVuY3Rpb24oKXt2YXIgc3RhdGU9dGhpcy5fcmVhZGFibGVTdGF0ZTtpZighc3RhdGUuZmxvd2luZyl7ZGVidWcoInJlc3VtZSIpO3N0YXRlLmZsb3dpbmc9dHJ1ZTtyZXN1bWUodGhpcyxzdGF0ZSl9cmV0dXJuIHRoaXN9O2Z1bmN0aW9uIHJlc3VtZShzdHJlYW0sc3RhdGUpe2lmKCFzdGF0ZS5yZXN1bWVTY2hlZHVsZWQpe3N0YXRlLnJlc3VtZVNjaGVkdWxlZD10cnVlO3BuYS5uZXh0VGljayhyZXN1bWVfLHN0cmVhbSxzdGF0ZSl9fWZ1bmN0aW9uIHJlc3VtZV8oc3RyZWFtLHN0YXRlKXtpZighc3RhdGUucmVhZGluZyl7ZGVidWcoInJlc3VtZSByZWFkIDAiKTtzdHJlYW0ucmVhZCgwKX1zdGF0ZS5yZXN1bWVTY2hlZHVsZWQ9ZmFsc2U7c3RhdGUuYXdhaXREcmFpbj0wO3N0cmVhbS5lbWl0KCJyZXN1bWUiKTtmbG93KHN0cmVhbSk7aWYoc3RhdGUuZmxvd2luZyYmIXN0YXRlLnJlYWRpbmcpc3RyZWFtLnJlYWQoMCl9UmVhZGFibGUucHJvdG90eXBlLnBhdXNlPWZ1bmN0aW9uKCl7ZGVidWcoImNhbGwgcGF1c2UgZmxvd2luZz0laiIsdGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nKTtpZihmYWxzZSE9PXRoaXMuX3JlYWRhYmxlU3RhdGUuZmxvd2luZyl7ZGVidWcoInBhdXNlIik7dGhpcy5fcmVhZGFibGVTdGF0ZS5mbG93aW5nPWZhbHNlO3RoaXMuZW1pdCgicGF1c2UiKX1yZXR1cm4gdGhpc307ZnVuY3Rpb24gZmxvdyhzdHJlYW0pe3ZhciBzdGF0ZT1zdHJlYW0uX3JlYWRhYmxlU3RhdGU7ZGVidWcoImZsb3ciLHN0YXRlLmZsb3dpbmcpO3doaWxlKHN0YXRlLmZsb3dpbmcmJnN0cmVhbS5yZWFkKCkhPT1udWxsKXt9fVJlYWRhYmxlLnByb3RvdHlwZS53cmFwPWZ1bmN0aW9uKHN0cmVhbSl7dmFyIF90aGlzPXRoaXM7dmFyIHN0YXRlPXRoaXMuX3JlYWRhYmxlU3RhdGU7dmFyIHBhdXNlZD1mYWxzZTtzdHJlYW0ub24oImVuZCIsZnVuY3Rpb24oKXtkZWJ1Zygid3JhcHBlZCBlbmQiKTtpZihzdGF0ZS5kZWNvZGVyJiYhc3RhdGUuZW5kZWQpe3ZhciBjaHVuaz1zdGF0ZS5kZWNvZGVyLmVuZCgpO2lmKGNodW5rJiZjaHVuay5sZW5ndGgpX3RoaXMucHVzaChjaHVuayl9X3RoaXMucHVzaChudWxsKX0pO3N0cmVhbS5vbigiZGF0YSIsZnVuY3Rpb24oY2h1bmspe2RlYnVnKCJ3cmFwcGVkIGRhdGEiKTtpZihzdGF0ZS5kZWNvZGVyKWNodW5rPXN0YXRlLmRlY29kZXIud3JpdGUoY2h1bmspO2lmKHN0YXRlLm9iamVjdE1vZGUmJihjaHVuaz09PW51bGx8fGNodW5rPT09dW5kZWZpbmVkKSlyZXR1cm47ZWxzZSBpZighc3RhdGUub2JqZWN0TW9kZSYmKCFjaHVua3x8IWNodW5rLmxlbmd0aCkpcmV0dXJuO3ZhciByZXQ9X3RoaXMucHVzaChjaHVuayk7aWYoIXJldCl7cGF1c2VkPXRydWU7c3RyZWFtLnBhdXNlKCl9fSk7Zm9yKHZhciBpIGluIHN0cmVhbSl7aWYodGhpc1tpXT09PXVuZGVmaW5lZCYmdHlwZW9mIHN0cmVhbVtpXT09PSJmdW5jdGlvbiIpe3RoaXNbaV09ZnVuY3Rpb24obWV0aG9kKXtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gc3RyZWFtW21ldGhvZF0uYXBwbHkoc3RyZWFtLGFyZ3VtZW50cyl9fShpKX19Zm9yKHZhciBuPTA7bjxrUHJveHlFdmVudHMubGVuZ3RoO24rKyl7c3RyZWFtLm9uKGtQcm94eUV2ZW50c1tuXSx0aGlzLmVtaXQuYmluZCh0aGlzLGtQcm94eUV2ZW50c1tuXSkpfXRoaXMuX3JlYWQ9ZnVuY3Rpb24obil7ZGVidWcoIndyYXBwZWQgX3JlYWQiLG4pO2lmKHBhdXNlZCl7cGF1c2VkPWZhbHNlO3N0cmVhbS5yZXN1bWUoKX19O3JldHVybiB0aGlzfTtPYmplY3QuZGVmaW5lUHJvcGVydHkoUmVhZGFibGUucHJvdG90eXBlLCJyZWFkYWJsZUhpZ2hXYXRlck1hcmsiLHtlbnVtZXJhYmxlOmZhbHNlLGdldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9yZWFkYWJsZVN0YXRlLmhpZ2hXYXRlck1hcmt9fSk7UmVhZGFibGUuX2Zyb21MaXN0PWZyb21MaXN0O2Z1bmN0aW9uIGZyb21MaXN0KG4sc3RhdGUpe2lmKHN0YXRlLmxlbmd0aD09PTApcmV0dXJuIG51bGw7dmFyIHJldDtpZihzdGF0ZS5vYmplY3RNb2RlKXJldD1zdGF0ZS5idWZmZXIuc2hpZnQoKTtlbHNlIGlmKCFufHxuPj1zdGF0ZS5sZW5ndGgpe2lmKHN0YXRlLmRlY29kZXIpcmV0PXN0YXRlLmJ1ZmZlci5qb2luKCIiKTtlbHNlIGlmKHN0YXRlLmJ1ZmZlci5sZW5ndGg9PT0xKXJldD1zdGF0ZS5idWZmZXIuaGVhZC5kYXRhO2Vsc2UgcmV0PXN0YXRlLmJ1ZmZlci5jb25jYXQoc3RhdGUubGVuZ3RoKTtzdGF0ZS5idWZmZXIuY2xlYXIoKX1lbHNle3JldD1mcm9tTGlzdFBhcnRpYWwobixzdGF0ZS5idWZmZXIsc3RhdGUuZGVjb2Rlcil9cmV0dXJuIHJldH1mdW5jdGlvbiBmcm9tTGlzdFBhcnRpYWwobixsaXN0LGhhc1N0cmluZ3Mpe3ZhciByZXQ7aWYobjxsaXN0LmhlYWQuZGF0YS5sZW5ndGgpe3JldD1saXN0LmhlYWQuZGF0YS5zbGljZSgwLG4pO2xpc3QuaGVhZC5kYXRhPWxpc3QuaGVhZC5kYXRhLnNsaWNlKG4pfWVsc2UgaWYobj09PWxpc3QuaGVhZC5kYXRhLmxlbmd0aCl7cmV0PWxpc3Quc2hpZnQoKX1lbHNle3JldD1oYXNTdHJpbmdzP2NvcHlGcm9tQnVmZmVyU3RyaW5nKG4sbGlzdCk6Y29weUZyb21CdWZmZXIobixsaXN0KX1yZXR1cm4gcmV0fWZ1bmN0aW9uIGNvcHlGcm9tQnVmZmVyU3RyaW5nKG4sbGlzdCl7dmFyIHA9bGlzdC5oZWFkO3ZhciBjPTE7dmFyIHJldD1wLmRhdGE7bi09cmV0Lmxlbmd0aDt3aGlsZShwPXAubmV4dCl7dmFyIHN0cj1wLmRhdGE7dmFyIG5iPW4+c3RyLmxlbmd0aD9zdHIubGVuZ3RoOm47aWYobmI9PT1zdHIubGVuZ3RoKXJldCs9c3RyO2Vsc2UgcmV0Kz1zdHIuc2xpY2UoMCxuKTtuLT1uYjtpZihuPT09MCl7aWYobmI9PT1zdHIubGVuZ3RoKXsrK2M7aWYocC5uZXh0KWxpc3QuaGVhZD1wLm5leHQ7ZWxzZSBsaXN0LmhlYWQ9bGlzdC50YWlsPW51bGx9ZWxzZXtsaXN0LmhlYWQ9cDtwLmRhdGE9c3RyLnNsaWNlKG5iKX1icmVha30rK2N9bGlzdC5sZW5ndGgtPWM7cmV0dXJuIHJldH1mdW5jdGlvbiBjb3B5RnJvbUJ1ZmZlcihuLGxpc3Qpe3ZhciByZXQ9QnVmZmVyLmFsbG9jVW5zYWZlKG4pO3ZhciBwPWxpc3QuaGVhZDt2YXIgYz0xO3AuZGF0YS5jb3B5KHJldCk7bi09cC5kYXRhLmxlbmd0aDt3aGlsZShwPXAubmV4dCl7dmFyIGJ1Zj1wLmRhdGE7dmFyIG5iPW4+YnVmLmxlbmd0aD9idWYubGVuZ3RoOm47YnVmLmNvcHkocmV0LHJldC5sZW5ndGgtbiwwLG5iKTtuLT1uYjtpZihuPT09MCl7aWYobmI9PT1idWYubGVuZ3RoKXsrK2M7aWYocC5uZXh0KWxpc3QuaGVhZD1wLm5leHQ7ZWxzZSBsaXN0LmhlYWQ9bGlzdC50YWlsPW51bGx9ZWxzZXtsaXN0LmhlYWQ9cDtwLmRhdGE9YnVmLnNsaWNlKG5iKX1icmVha30rK2N9bGlzdC5sZW5ndGgtPWM7cmV0dXJuIHJldH1mdW5jdGlvbiBlbmRSZWFkYWJsZShzdHJlYW0pe3ZhciBzdGF0ZT1zdHJlYW0uX3JlYWRhYmxlU3RhdGU7aWYoc3RhdGUubGVuZ3RoPjApdGhyb3cgbmV3IEVycm9yKCciZW5kUmVhZGFibGUoKSIgY2FsbGVkIG9uIG5vbi1lbXB0eSBzdHJlYW0nKTtpZighc3RhdGUuZW5kRW1pdHRlZCl7c3RhdGUuZW5kZWQ9dHJ1ZTtwbmEubmV4dFRpY2soZW5kUmVhZGFibGVOVCxzdGF0ZSxzdHJlYW0pfX1mdW5jdGlvbiBlbmRSZWFkYWJsZU5UKHN0YXRlLHN0cmVhbSl7aWYoIXN0YXRlLmVuZEVtaXR0ZWQmJnN0YXRlLmxlbmd0aD09PTApe3N0YXRlLmVuZEVtaXR0ZWQ9dHJ1ZTtzdHJlYW0ucmVhZGFibGU9ZmFsc2U7c3RyZWFtLmVtaXQoImVuZCIpfX1mdW5jdGlvbiBpbmRleE9mKHhzLHgpe2Zvcih2YXIgaT0wLGw9eHMubGVuZ3RoO2k8bDtpKyspe2lmKHhzW2ldPT09eClyZXR1cm4gaX1yZXR1cm4tMX19KS5jYWxsKHRoaXMscmVxdWlyZSgiX3Byb2Nlc3MiKSx0eXBlb2YgZ2xvYmFsIT09InVuZGVmaW5lZCI/Z2xvYmFsOnR5cGVvZiBzZWxmIT09InVuZGVmaW5lZCI/c2VsZjp0eXBlb2Ygd2luZG93IT09InVuZGVmaW5lZCI/d2luZG93Ont9KX0seyIuL19zdHJlYW1fZHVwbGV4IjoxMDQsIi4vaW50ZXJuYWwvc3RyZWFtcy9CdWZmZXJMaXN0IjoxMDksIi4vaW50ZXJuYWwvc3RyZWFtcy9kZXN0cm95IjoxMTAsIi4vaW50ZXJuYWwvc3RyZWFtcy9zdHJlYW0iOjExMSxfcHJvY2Vzczo2NiwiY29yZS11dGlsLWlzIjozMCxldmVudHM6MzMsaW5oZXJpdHM6MzYsaXNhcnJheTozOCwicHJvY2Vzcy1uZXh0aWNrLWFyZ3MiOjY1LCJzYWZlLWJ1ZmZlciI6MTE2LCJzdHJpbmdfZGVjb2Rlci8iOjExNyx1dGlsOjI2fV0sMTA3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsidXNlIHN0cmljdCI7bW9kdWxlLmV4cG9ydHM9VHJhbnNmb3JtO3ZhciBEdXBsZXg9cmVxdWlyZSgiLi9fc3RyZWFtX2R1cGxleCIpO3ZhciB1dGlsPU9iamVjdC5jcmVhdGUocmVxdWlyZSgiY29yZS11dGlsLWlzIikpO3V0aWwuaW5oZXJpdHM9cmVxdWlyZSgiaW5oZXJpdHMiKTt1dGlsLmluaGVyaXRzKFRyYW5zZm9ybSxEdXBsZXgpO2Z1bmN0aW9uIGFmdGVyVHJhbnNmb3JtKGVyLGRhdGEpe3ZhciB0cz10aGlzLl90cmFuc2Zvcm1TdGF0ZTt0cy50cmFuc2Zvcm1pbmc9ZmFsc2U7dmFyIGNiPXRzLndyaXRlY2I7aWYoIWNiKXtyZXR1cm4gdGhpcy5lbWl0KCJlcnJvciIsbmV3IEVycm9yKCJ3cml0ZSBjYWxsYmFjayBjYWxsZWQgbXVsdGlwbGUgdGltZXMiKSl9dHMud3JpdGVjaHVuaz1udWxsO3RzLndyaXRlY2I9bnVsbDtpZihkYXRhIT1udWxsKXRoaXMucHVzaChkYXRhKTtjYihlcik7dmFyIHJzPXRoaXMuX3JlYWRhYmxlU3RhdGU7cnMucmVhZGluZz1mYWxzZTtpZihycy5uZWVkUmVhZGFibGV8fHJzLmxlbmd0aDxycy5oaWdoV2F0ZXJNYXJrKXt0aGlzLl9yZWFkKHJzLmhpZ2hXYXRlck1hcmspfX1mdW5jdGlvbiBUcmFuc2Zvcm0ob3B0aW9ucyl7aWYoISh0aGlzIGluc3RhbmNlb2YgVHJhbnNmb3JtKSlyZXR1cm4gbmV3IFRyYW5zZm9ybShvcHRpb25zKTtEdXBsZXguY2FsbCh0aGlzLG9wdGlvbnMpO3RoaXMuX3RyYW5zZm9ybVN0YXRlPXthZnRlclRyYW5zZm9ybTphZnRlclRyYW5zZm9ybS5iaW5kKHRoaXMpLG5lZWRUcmFuc2Zvcm06ZmFsc2UsdHJhbnNmb3JtaW5nOmZhbHNlLHdyaXRlY2I6bnVsbCx3cml0ZWNodW5rOm51bGwsd3JpdGVlbmNvZGluZzpudWxsfTt0aGlzLl9yZWFkYWJsZVN0YXRlLm5lZWRSZWFkYWJsZT10cnVlO3RoaXMuX3JlYWRhYmxlU3RhdGUuc3luYz1mYWxzZTtpZihvcHRpb25zKXtpZih0eXBlb2Ygb3B0aW9ucy50cmFuc2Zvcm09PT0iZnVuY3Rpb24iKXRoaXMuX3RyYW5zZm9ybT1vcHRpb25zLnRyYW5zZm9ybTtpZih0eXBlb2Ygb3B0aW9ucy5mbHVzaD09PSJmdW5jdGlvbiIpdGhpcy5fZmx1c2g9b3B0aW9ucy5mbHVzaH10aGlzLm9uKCJwcmVmaW5pc2giLHByZWZpbmlzaCl9ZnVuY3Rpb24gcHJlZmluaXNoKCl7dmFyIF90aGlzPXRoaXM7aWYodHlwZW9mIHRoaXMuX2ZsdXNoPT09ImZ1bmN0aW9uIil7dGhpcy5fZmx1c2goZnVuY3Rpb24oZXIsZGF0YSl7ZG9uZShfdGhpcyxlcixkYXRhKX0pfWVsc2V7ZG9uZSh0aGlzLG51bGwsbnVsbCl9fVRyYW5zZm9ybS5wcm90b3R5cGUucHVzaD1mdW5jdGlvbihjaHVuayxlbmNvZGluZyl7dGhpcy5fdHJhbnNmb3JtU3RhdGUubmVlZFRyYW5zZm9ybT1mYWxzZTtyZXR1cm4gRHVwbGV4LnByb3RvdHlwZS5wdXNoLmNhbGwodGhpcyxjaHVuayxlbmNvZGluZyl9O1RyYW5zZm9ybS5wcm90b3R5cGUuX3RyYW5zZm9ybT1mdW5jdGlvbihjaHVuayxlbmNvZGluZyxjYil7dGhyb3cgbmV3IEVycm9yKCJfdHJhbnNmb3JtKCkgaXMgbm90IGltcGxlbWVudGVkIil9O1RyYW5zZm9ybS5wcm90b3R5cGUuX3dyaXRlPWZ1bmN0aW9uKGNodW5rLGVuY29kaW5nLGNiKXt2YXIgdHM9dGhpcy5fdHJhbnNmb3JtU3RhdGU7dHMud3JpdGVjYj1jYjt0cy53cml0ZWNodW5rPWNodW5rO3RzLndyaXRlZW5jb2Rpbmc9ZW5jb2Rpbmc7aWYoIXRzLnRyYW5zZm9ybWluZyl7dmFyIHJzPXRoaXMuX3JlYWRhYmxlU3RhdGU7aWYodHMubmVlZFRyYW5zZm9ybXx8cnMubmVlZFJlYWRhYmxlfHxycy5sZW5ndGg8cnMuaGlnaFdhdGVyTWFyayl0aGlzLl9yZWFkKHJzLmhpZ2hXYXRlck1hcmspfX07VHJhbnNmb3JtLnByb3RvdHlwZS5fcmVhZD1mdW5jdGlvbihuKXt2YXIgdHM9dGhpcy5fdHJhbnNmb3JtU3RhdGU7aWYodHMud3JpdGVjaHVuayE9PW51bGwmJnRzLndyaXRlY2ImJiF0cy50cmFuc2Zvcm1pbmcpe3RzLnRyYW5zZm9ybWluZz10cnVlO3RoaXMuX3RyYW5zZm9ybSh0cy53cml0ZWNodW5rLHRzLndyaXRlZW5jb2RpbmcsdHMuYWZ0ZXJUcmFuc2Zvcm0pfWVsc2V7dHMubmVlZFRyYW5zZm9ybT10cnVlfX07VHJhbnNmb3JtLnByb3RvdHlwZS5fZGVzdHJveT1mdW5jdGlvbihlcnIsY2Ipe3ZhciBfdGhpczI9dGhpcztEdXBsZXgucHJvdG90eXBlLl9kZXN0cm95LmNhbGwodGhpcyxlcnIsZnVuY3Rpb24oZXJyMil7Y2IoZXJyMik7X3RoaXMyLmVtaXQoImNsb3NlIil9KX07ZnVuY3Rpb24gZG9uZShzdHJlYW0sZXIsZGF0YSl7aWYoZXIpcmV0dXJuIHN0cmVhbS5lbWl0KCJlcnJvciIsZXIpO2lmKGRhdGEhPW51bGwpc3RyZWFtLnB1c2goZGF0YSk7aWYoc3RyZWFtLl93cml0YWJsZVN0YXRlLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoIkNhbGxpbmcgdHJhbnNmb3JtIGRvbmUgd2hlbiB3cy5sZW5ndGggIT0gMCIpO2lmKHN0cmVhbS5fdHJhbnNmb3JtU3RhdGUudHJhbnNmb3JtaW5nKXRocm93IG5ldyBFcnJvcigiQ2FsbGluZyB0cmFuc2Zvcm0gZG9uZSB3aGVuIHN0aWxsIHRyYW5zZm9ybWluZyIpO3JldHVybiBzdHJlYW0ucHVzaChudWxsKX19LHsiLi9fc3RyZWFtX2R1cGxleCI6MTA0LCJjb3JlLXV0aWwtaXMiOjMwLGluaGVyaXRzOjM2fV0sMTA4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24ocHJvY2VzcyxnbG9iYWwsc2V0SW1tZWRpYXRlKXsidXNlIHN0cmljdCI7dmFyIHBuYT1yZXF1aXJlKCJwcm9jZXNzLW5leHRpY2stYXJncyIpO21vZHVsZS5leHBvcnRzPVdyaXRhYmxlO2Z1bmN0aW9uIFdyaXRlUmVxKGNodW5rLGVuY29kaW5nLGNiKXt0aGlzLmNodW5rPWNodW5rO3RoaXMuZW5jb2Rpbmc9ZW5jb2Rpbmc7dGhpcy5jYWxsYmFjaz1jYjt0aGlzLm5leHQ9bnVsbH1mdW5jdGlvbiBDb3JrZWRSZXF1ZXN0KHN0YXRlKXt2YXIgX3RoaXM9dGhpczt0aGlzLm5leHQ9bnVsbDt0aGlzLmVudHJ5PW51bGw7dGhpcy5maW5pc2g9ZnVuY3Rpb24oKXtvbkNvcmtlZEZpbmlzaChfdGhpcyxzdGF0ZSl9fXZhciBhc3luY1dyaXRlPSFwcm9jZXNzLmJyb3dzZXImJlsidjAuMTAiLCJ2MC45LiJdLmluZGV4T2YocHJvY2Vzcy52ZXJzaW9uLnNsaWNlKDAsNSkpPi0xP3NldEltbWVkaWF0ZTpwbmEubmV4dFRpY2s7dmFyIER1cGxleDtXcml0YWJsZS5Xcml0YWJsZVN0YXRlPVdyaXRhYmxlU3RhdGU7dmFyIHV0aWw9T2JqZWN0LmNyZWF0ZShyZXF1aXJlKCJjb3JlLXV0aWwtaXMiKSk7dXRpbC5pbmhlcml0cz1yZXF1aXJlKCJpbmhlcml0cyIpO3ZhciBpbnRlcm5hbFV0aWw9e2RlcHJlY2F0ZTpyZXF1aXJlKCJ1dGlsLWRlcHJlY2F0ZSIpfTt2YXIgU3RyZWFtPXJlcXVpcmUoIi4vaW50ZXJuYWwvc3RyZWFtcy9zdHJlYW0iKTt2YXIgQnVmZmVyPXJlcXVpcmUoInNhZmUtYnVmZmVyIikuQnVmZmVyO3ZhciBPdXJVaW50OEFycmF5PWdsb2JhbC5VaW50OEFycmF5fHxmdW5jdGlvbigpe307ZnVuY3Rpb24gX3VpbnQ4QXJyYXlUb0J1ZmZlcihjaHVuayl7cmV0dXJuIEJ1ZmZlci5mcm9tKGNodW5rKX1mdW5jdGlvbiBfaXNVaW50OEFycmF5KG9iail7cmV0dXJuIEJ1ZmZlci5pc0J1ZmZlcihvYmopfHxvYmogaW5zdGFuY2VvZiBPdXJVaW50OEFycmF5fXZhciBkZXN0cm95SW1wbD1yZXF1aXJlKCIuL2ludGVybmFsL3N0cmVhbXMvZGVzdHJveSIpO3V0aWwuaW5oZXJpdHMoV3JpdGFibGUsU3RyZWFtKTtmdW5jdGlvbiBub3AoKXt9ZnVuY3Rpb24gV3JpdGFibGVTdGF0ZShvcHRpb25zLHN0cmVhbSl7RHVwbGV4PUR1cGxleHx8cmVxdWlyZSgiLi9fc3RyZWFtX2R1cGxleCIpO29wdGlvbnM9b3B0aW9uc3x8e307dmFyIGlzRHVwbGV4PXN0cmVhbSBpbnN0YW5jZW9mIER1cGxleDt0aGlzLm9iamVjdE1vZGU9ISFvcHRpb25zLm9iamVjdE1vZGU7aWYoaXNEdXBsZXgpdGhpcy5vYmplY3RNb2RlPXRoaXMub2JqZWN0TW9kZXx8ISFvcHRpb25zLndyaXRhYmxlT2JqZWN0TW9kZTt2YXIgaHdtPW9wdGlvbnMuaGlnaFdhdGVyTWFyazt2YXIgd3JpdGFibGVId209b3B0aW9ucy53cml0YWJsZUhpZ2hXYXRlck1hcms7dmFyIGRlZmF1bHRId209dGhpcy5vYmplY3RNb2RlPzE2OjE2KjEwMjQ7aWYoaHdtfHxod209PT0wKXRoaXMuaGlnaFdhdGVyTWFyaz1od207ZWxzZSBpZihpc0R1cGxleCYmKHdyaXRhYmxlSHdtfHx3cml0YWJsZUh3bT09PTApKXRoaXMuaGlnaFdhdGVyTWFyaz13cml0YWJsZUh3bTtlbHNlIHRoaXMuaGlnaFdhdGVyTWFyaz1kZWZhdWx0SHdtO3RoaXMuaGlnaFdhdGVyTWFyaz1NYXRoLmZsb29yKHRoaXMuaGlnaFdhdGVyTWFyayk7dGhpcy5maW5hbENhbGxlZD1mYWxzZTt0aGlzLm5lZWREcmFpbj1mYWxzZTt0aGlzLmVuZGluZz1mYWxzZTt0aGlzLmVuZGVkPWZhbHNlO3RoaXMuZmluaXNoZWQ9ZmFsc2U7dGhpcy5kZXN0cm95ZWQ9ZmFsc2U7dmFyIG5vRGVjb2RlPW9wdGlvbnMuZGVjb2RlU3RyaW5ncz09PWZhbHNlO3RoaXMuZGVjb2RlU3RyaW5ncz0hbm9EZWNvZGU7dGhpcy5kZWZhdWx0RW5jb2Rpbmc9b3B0aW9ucy5kZWZhdWx0RW5jb2Rpbmd8fCJ1dGY4Ijt0aGlzLmxlbmd0aD0wO3RoaXMud3JpdGluZz1mYWxzZTt0aGlzLmNvcmtlZD0wO3RoaXMuc3luYz10cnVlO3RoaXMuYnVmZmVyUHJvY2Vzc2luZz1mYWxzZTt0aGlzLm9ud3JpdGU9ZnVuY3Rpb24oZXIpe29ud3JpdGUoc3RyZWFtLGVyKX07dGhpcy53cml0ZWNiPW51bGw7dGhpcy53cml0ZWxlbj0wO3RoaXMuYnVmZmVyZWRSZXF1ZXN0PW51bGw7dGhpcy5sYXN0QnVmZmVyZWRSZXF1ZXN0PW51bGw7dGhpcy5wZW5kaW5nY2I9MDt0aGlzLnByZWZpbmlzaGVkPWZhbHNlO3RoaXMuZXJyb3JFbWl0dGVkPWZhbHNlO3RoaXMuYnVmZmVyZWRSZXF1ZXN0Q291bnQ9MDt0aGlzLmNvcmtlZFJlcXVlc3RzRnJlZT1uZXcgQ29ya2VkUmVxdWVzdCh0aGlzKX1Xcml0YWJsZVN0YXRlLnByb3RvdHlwZS5nZXRCdWZmZXI9ZnVuY3Rpb24gZ2V0QnVmZmVyKCl7dmFyIGN1cnJlbnQ9dGhpcy5idWZmZXJlZFJlcXVlc3Q7dmFyIG91dD1bXTt3aGlsZShjdXJyZW50KXtvdXQucHVzaChjdXJyZW50KTtjdXJyZW50PWN1cnJlbnQubmV4dH1yZXR1cm4gb3V0fTsoZnVuY3Rpb24oKXt0cnl7T2JqZWN0LmRlZmluZVByb3BlcnR5KFdyaXRhYmxlU3RhdGUucHJvdG90eXBlLCJidWZmZXIiLHtnZXQ6aW50ZXJuYWxVdGlsLmRlcHJlY2F0ZShmdW5jdGlvbigpe3JldHVybiB0aGlzLmdldEJ1ZmZlcigpfSwiX3dyaXRhYmxlU3RhdGUuYnVmZmVyIGlzIGRlcHJlY2F0ZWQuIFVzZSBfd3JpdGFibGVTdGF0ZS5nZXRCdWZmZXIgIisiaW5zdGVhZC4iLCJERVAwMDAzIil9KX1jYXRjaChfKXt9fSkoKTt2YXIgcmVhbEhhc0luc3RhbmNlO2lmKHR5cGVvZiBTeW1ib2w9PT0iZnVuY3Rpb24iJiZTeW1ib2wuaGFzSW5zdGFuY2UmJnR5cGVvZiBGdW5jdGlvbi5wcm90b3R5cGVbU3ltYm9sLmhhc0luc3RhbmNlXT09PSJmdW5jdGlvbiIpe3JlYWxIYXNJbnN0YW5jZT1GdW5jdGlvbi5wcm90b3R5cGVbU3ltYm9sLmhhc0luc3RhbmNlXTtPYmplY3QuZGVmaW5lUHJvcGVydHkoV3JpdGFibGUsU3ltYm9sLmhhc0luc3RhbmNlLHt2YWx1ZTpmdW5jdGlvbihvYmplY3Qpe2lmKHJlYWxIYXNJbnN0YW5jZS5jYWxsKHRoaXMsb2JqZWN0KSlyZXR1cm4gdHJ1ZTtpZih0aGlzIT09V3JpdGFibGUpcmV0dXJuIGZhbHNlO3JldHVybiBvYmplY3QmJm9iamVjdC5fd3JpdGFibGVTdGF0ZSBpbnN0YW5jZW9mIFdyaXRhYmxlU3RhdGV9fSl9ZWxzZXtyZWFsSGFzSW5zdGFuY2U9ZnVuY3Rpb24ob2JqZWN0KXtyZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgdGhpc319ZnVuY3Rpb24gV3JpdGFibGUob3B0aW9ucyl7RHVwbGV4PUR1cGxleHx8cmVxdWlyZSgiLi9fc3RyZWFtX2R1cGxleCIpO2lmKCFyZWFsSGFzSW5zdGFuY2UuY2FsbChXcml0YWJsZSx0aGlzKSYmISh0aGlzIGluc3RhbmNlb2YgRHVwbGV4KSl7cmV0dXJuIG5ldyBXcml0YWJsZShvcHRpb25zKX10aGlzLl93cml0YWJsZVN0YXRlPW5ldyBXcml0YWJsZVN0YXRlKG9wdGlvbnMsdGhpcyk7dGhpcy53cml0YWJsZT10cnVlO2lmKG9wdGlvbnMpe2lmKHR5cGVvZiBvcHRpb25zLndyaXRlPT09ImZ1bmN0aW9uIil0aGlzLl93cml0ZT1vcHRpb25zLndyaXRlO2lmKHR5cGVvZiBvcHRpb25zLndyaXRldj09PSJmdW5jdGlvbiIpdGhpcy5fd3JpdGV2PW9wdGlvbnMud3JpdGV2O2lmKHR5cGVvZiBvcHRpb25zLmRlc3Ryb3k9PT0iZnVuY3Rpb24iKXRoaXMuX2Rlc3Ryb3k9b3B0aW9ucy5kZXN0cm95O2lmKHR5cGVvZiBvcHRpb25zLmZpbmFsPT09ImZ1bmN0aW9uIil0aGlzLl9maW5hbD1vcHRpb25zLmZpbmFsfVN0cmVhbS5jYWxsKHRoaXMpfVdyaXRhYmxlLnByb3RvdHlwZS5waXBlPWZ1bmN0aW9uKCl7dGhpcy5lbWl0KCJlcnJvciIsbmV3IEVycm9yKCJDYW5ub3QgcGlwZSwgbm90IHJlYWRhYmxlIikpfTtmdW5jdGlvbiB3cml0ZUFmdGVyRW5kKHN0cmVhbSxjYil7dmFyIGVyPW5ldyBFcnJvcigid3JpdGUgYWZ0ZXIgZW5kIik7c3RyZWFtLmVtaXQoImVycm9yIixlcik7cG5hLm5leHRUaWNrKGNiLGVyKX1mdW5jdGlvbiB2YWxpZENodW5rKHN0cmVhbSxzdGF0ZSxjaHVuayxjYil7dmFyIHZhbGlkPXRydWU7dmFyIGVyPWZhbHNlO2lmKGNodW5rPT09bnVsbCl7ZXI9bmV3IFR5cGVFcnJvcigiTWF5IG5vdCB3cml0ZSBudWxsIHZhbHVlcyB0byBzdHJlYW0iKX1lbHNlIGlmKHR5cGVvZiBjaHVuayE9PSJzdHJpbmciJiZjaHVuayE9PXVuZGVmaW5lZCYmIXN0YXRlLm9iamVjdE1vZGUpe2VyPW5ldyBUeXBlRXJyb3IoIkludmFsaWQgbm9uLXN0cmluZy9idWZmZXIgY2h1bmsiKX1pZihlcil7c3RyZWFtLmVtaXQoImVycm9yIixlcik7cG5hLm5leHRUaWNrKGNiLGVyKTt2YWxpZD1mYWxzZX1yZXR1cm4gdmFsaWR9V3JpdGFibGUucHJvdG90eXBlLndyaXRlPWZ1bmN0aW9uKGNodW5rLGVuY29kaW5nLGNiKXt2YXIgc3RhdGU9dGhpcy5fd3JpdGFibGVTdGF0ZTt2YXIgcmV0PWZhbHNlO3ZhciBpc0J1Zj0hc3RhdGUub2JqZWN0TW9kZSYmX2lzVWludDhBcnJheShjaHVuayk7aWYoaXNCdWYmJiFCdWZmZXIuaXNCdWZmZXIoY2h1bmspKXtjaHVuaz1fdWludDhBcnJheVRvQnVmZmVyKGNodW5rKX1pZih0eXBlb2YgZW5jb2Rpbmc9PT0iZnVuY3Rpb24iKXtjYj1lbmNvZGluZztlbmNvZGluZz1udWxsfWlmKGlzQnVmKWVuY29kaW5nPSJidWZmZXIiO2Vsc2UgaWYoIWVuY29kaW5nKWVuY29kaW5nPXN0YXRlLmRlZmF1bHRFbmNvZGluZztpZih0eXBlb2YgY2IhPT0iZnVuY3Rpb24iKWNiPW5vcDtpZihzdGF0ZS5lbmRlZCl3cml0ZUFmdGVyRW5kKHRoaXMsY2IpO2Vsc2UgaWYoaXNCdWZ8fHZhbGlkQ2h1bmsodGhpcyxzdGF0ZSxjaHVuayxjYikpe3N0YXRlLnBlbmRpbmdjYisrO3JldD13cml0ZU9yQnVmZmVyKHRoaXMsc3RhdGUsaXNCdWYsY2h1bmssZW5jb2RpbmcsY2IpfXJldHVybiByZXR9O1dyaXRhYmxlLnByb3RvdHlwZS5jb3JrPWZ1bmN0aW9uKCl7dmFyIHN0YXRlPXRoaXMuX3dyaXRhYmxlU3RhdGU7c3RhdGUuY29ya2VkKyt9O1dyaXRhYmxlLnByb3RvdHlwZS51bmNvcms9ZnVuY3Rpb24oKXt2YXIgc3RhdGU9dGhpcy5fd3JpdGFibGVTdGF0ZTtpZihzdGF0ZS5jb3JrZWQpe3N0YXRlLmNvcmtlZC0tO2lmKCFzdGF0ZS53cml0aW5nJiYhc3RhdGUuY29ya2VkJiYhc3RhdGUuZmluaXNoZWQmJiFzdGF0ZS5idWZmZXJQcm9jZXNzaW5nJiZzdGF0ZS5idWZmZXJlZFJlcXVlc3QpY2xlYXJCdWZmZXIodGhpcyxzdGF0ZSl9fTtXcml0YWJsZS5wcm90b3R5cGUuc2V0RGVmYXVsdEVuY29kaW5nPWZ1bmN0aW9uIHNldERlZmF1bHRFbmNvZGluZyhlbmNvZGluZyl7aWYodHlwZW9mIGVuY29kaW5nPT09InN0cmluZyIpZW5jb2Rpbmc9ZW5jb2RpbmcudG9Mb3dlckNhc2UoKTtpZighKFsiaGV4IiwidXRmOCIsInV0Zi04IiwiYXNjaWkiLCJiaW5hcnkiLCJiYXNlNjQiLCJ1Y3MyIiwidWNzLTIiLCJ1dGYxNmxlIiwidXRmLTE2bGUiLCJyYXciXS5pbmRleE9mKChlbmNvZGluZysiIikudG9Mb3dlckNhc2UoKSk+LTEpKXRocm93IG5ldyBUeXBlRXJyb3IoIlVua25vd24gZW5jb2Rpbmc6ICIrZW5jb2RpbmcpO3RoaXMuX3dyaXRhYmxlU3RhdGUuZGVmYXVsdEVuY29kaW5nPWVuY29kaW5nO3JldHVybiB0aGlzfTtmdW5jdGlvbiBkZWNvZGVDaHVuayhzdGF0ZSxjaHVuayxlbmNvZGluZyl7aWYoIXN0YXRlLm9iamVjdE1vZGUmJnN0YXRlLmRlY29kZVN0cmluZ3MhPT1mYWxzZSYmdHlwZW9mIGNodW5rPT09InN0cmluZyIpe2NodW5rPUJ1ZmZlci5mcm9tKGNodW5rLGVuY29kaW5nKX1yZXR1cm4gY2h1bmt9T2JqZWN0LmRlZmluZVByb3BlcnR5KFdyaXRhYmxlLnByb3RvdHlwZSwid3JpdGFibGVIaWdoV2F0ZXJNYXJrIix7ZW51bWVyYWJsZTpmYWxzZSxnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fd3JpdGFibGVTdGF0ZS5oaWdoV2F0ZXJNYXJrfX0pO2Z1bmN0aW9uIHdyaXRlT3JCdWZmZXIoc3RyZWFtLHN0YXRlLGlzQnVmLGNodW5rLGVuY29kaW5nLGNiKXtpZighaXNCdWYpe3ZhciBuZXdDaHVuaz1kZWNvZGVDaHVuayhzdGF0ZSxjaHVuayxlbmNvZGluZyk7aWYoY2h1bmshPT1uZXdDaHVuayl7aXNCdWY9dHJ1ZTtlbmNvZGluZz0iYnVmZmVyIjtjaHVuaz1uZXdDaHVua319dmFyIGxlbj1zdGF0ZS5vYmplY3RNb2RlPzE6Y2h1bmsubGVuZ3RoO3N0YXRlLmxlbmd0aCs9bGVuO3ZhciByZXQ9c3RhdGUubGVuZ3RoPHN0YXRlLmhpZ2hXYXRlck1hcms7aWYoIXJldClzdGF0ZS5uZWVkRHJhaW49dHJ1ZTtpZihzdGF0ZS53cml0aW5nfHxzdGF0ZS5jb3JrZWQpe3ZhciBsYXN0PXN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3Q7c3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdD17Y2h1bms6Y2h1bmssZW5jb2Rpbmc6ZW5jb2RpbmcsaXNCdWY6aXNCdWYsY2FsbGJhY2s6Y2IsbmV4dDpudWxsfTtpZihsYXN0KXtsYXN0Lm5leHQ9c3RhdGUubGFzdEJ1ZmZlcmVkUmVxdWVzdH1lbHNle3N0YXRlLmJ1ZmZlcmVkUmVxdWVzdD1zdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0fXN0YXRlLmJ1ZmZlcmVkUmVxdWVzdENvdW50Kz0xfWVsc2V7ZG9Xcml0ZShzdHJlYW0sc3RhdGUsZmFsc2UsbGVuLGNodW5rLGVuY29kaW5nLGNiKX1yZXR1cm4gcmV0fWZ1bmN0aW9uIGRvV3JpdGUoc3RyZWFtLHN0YXRlLHdyaXRldixsZW4sY2h1bmssZW5jb2RpbmcsY2Ipe3N0YXRlLndyaXRlbGVuPWxlbjtzdGF0ZS53cml0ZWNiPWNiO3N0YXRlLndyaXRpbmc9dHJ1ZTtzdGF0ZS5zeW5jPXRydWU7aWYod3JpdGV2KXN0cmVhbS5fd3JpdGV2KGNodW5rLHN0YXRlLm9ud3JpdGUpO2Vsc2Ugc3RyZWFtLl93cml0ZShjaHVuayxlbmNvZGluZyxzdGF0ZS5vbndyaXRlKTtzdGF0ZS5zeW5jPWZhbHNlfWZ1bmN0aW9uIG9ud3JpdGVFcnJvcihzdHJlYW0sc3RhdGUsc3luYyxlcixjYil7LS1zdGF0ZS5wZW5kaW5nY2I7aWYoc3luYyl7cG5hLm5leHRUaWNrKGNiLGVyKTtwbmEubmV4dFRpY2soZmluaXNoTWF5YmUsc3RyZWFtLHN0YXRlKTtzdHJlYW0uX3dyaXRhYmxlU3RhdGUuZXJyb3JFbWl0dGVkPXRydWU7c3RyZWFtLmVtaXQoImVycm9yIixlcil9ZWxzZXtjYihlcik7c3RyZWFtLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZD10cnVlO3N0cmVhbS5lbWl0KCJlcnJvciIsZXIpO2ZpbmlzaE1heWJlKHN0cmVhbSxzdGF0ZSl9fWZ1bmN0aW9uIG9ud3JpdGVTdGF0ZVVwZGF0ZShzdGF0ZSl7c3RhdGUud3JpdGluZz1mYWxzZTtzdGF0ZS53cml0ZWNiPW51bGw7c3RhdGUubGVuZ3RoLT1zdGF0ZS53cml0ZWxlbjtzdGF0ZS53cml0ZWxlbj0wfWZ1bmN0aW9uIG9ud3JpdGUoc3RyZWFtLGVyKXt2YXIgc3RhdGU9c3RyZWFtLl93cml0YWJsZVN0YXRlO3ZhciBzeW5jPXN0YXRlLnN5bmM7dmFyIGNiPXN0YXRlLndyaXRlY2I7b253cml0ZVN0YXRlVXBkYXRlKHN0YXRlKTtpZihlcilvbndyaXRlRXJyb3Ioc3RyZWFtLHN0YXRlLHN5bmMsZXIsY2IpO2Vsc2V7dmFyIGZpbmlzaGVkPW5lZWRGaW5pc2goc3RhdGUpO2lmKCFmaW5pc2hlZCYmIXN0YXRlLmNvcmtlZCYmIXN0YXRlLmJ1ZmZlclByb2Nlc3NpbmcmJnN0YXRlLmJ1ZmZlcmVkUmVxdWVzdCl7Y2xlYXJCdWZmZXIoc3RyZWFtLHN0YXRlKX1pZihzeW5jKXthc3luY1dyaXRlKGFmdGVyV3JpdGUsc3RyZWFtLHN0YXRlLGZpbmlzaGVkLGNiKX1lbHNle2FmdGVyV3JpdGUoc3RyZWFtLHN0YXRlLGZpbmlzaGVkLGNiKX19fWZ1bmN0aW9uIGFmdGVyV3JpdGUoc3RyZWFtLHN0YXRlLGZpbmlzaGVkLGNiKXtpZighZmluaXNoZWQpb253cml0ZURyYWluKHN0cmVhbSxzdGF0ZSk7c3RhdGUucGVuZGluZ2NiLS07Y2IoKTtmaW5pc2hNYXliZShzdHJlYW0sc3RhdGUpfWZ1bmN0aW9uIG9ud3JpdGVEcmFpbihzdHJlYW0sc3RhdGUpe2lmKHN0YXRlLmxlbmd0aD09PTAmJnN0YXRlLm5lZWREcmFpbil7c3RhdGUubmVlZERyYWluPWZhbHNlO3N0cmVhbS5lbWl0KCJkcmFpbiIpfX1mdW5jdGlvbiBjbGVhckJ1ZmZlcihzdHJlYW0sc3RhdGUpe3N0YXRlLmJ1ZmZlclByb2Nlc3Npbmc9dHJ1ZTt2YXIgZW50cnk9c3RhdGUuYnVmZmVyZWRSZXF1ZXN0O2lmKHN0cmVhbS5fd3JpdGV2JiZlbnRyeSYmZW50cnkubmV4dCl7dmFyIGw9c3RhdGUuYnVmZmVyZWRSZXF1ZXN0Q291bnQ7dmFyIGJ1ZmZlcj1uZXcgQXJyYXkobCk7dmFyIGhvbGRlcj1zdGF0ZS5jb3JrZWRSZXF1ZXN0c0ZyZWU7aG9sZGVyLmVudHJ5PWVudHJ5O3ZhciBjb3VudD0wO3ZhciBhbGxCdWZmZXJzPXRydWU7d2hpbGUoZW50cnkpe2J1ZmZlcltjb3VudF09ZW50cnk7aWYoIWVudHJ5LmlzQnVmKWFsbEJ1ZmZlcnM9ZmFsc2U7ZW50cnk9ZW50cnkubmV4dDtjb3VudCs9MX1idWZmZXIuYWxsQnVmZmVycz1hbGxCdWZmZXJzO2RvV3JpdGUoc3RyZWFtLHN0YXRlLHRydWUsc3RhdGUubGVuZ3RoLGJ1ZmZlciwiIixob2xkZXIuZmluaXNoKTtzdGF0ZS5wZW5kaW5nY2IrKztzdGF0ZS5sYXN0QnVmZmVyZWRSZXF1ZXN0PW51bGw7aWYoaG9sZGVyLm5leHQpe3N0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZT1ob2xkZXIubmV4dDtob2xkZXIubmV4dD1udWxsfWVsc2V7c3RhdGUuY29ya2VkUmVxdWVzdHNGcmVlPW5ldyBDb3JrZWRSZXF1ZXN0KHN0YXRlKX1zdGF0ZS5idWZmZXJlZFJlcXVlc3RDb3VudD0wfWVsc2V7d2hpbGUoZW50cnkpe3ZhciBjaHVuaz1lbnRyeS5jaHVuazt2YXIgZW5jb2Rpbmc9ZW50cnkuZW5jb2Rpbmc7dmFyIGNiPWVudHJ5LmNhbGxiYWNrO3ZhciBsZW49c3RhdGUub2JqZWN0TW9kZT8xOmNodW5rLmxlbmd0aDtkb1dyaXRlKHN0cmVhbSxzdGF0ZSxmYWxzZSxsZW4sY2h1bmssZW5jb2RpbmcsY2IpO2VudHJ5PWVudHJ5Lm5leHQ7c3RhdGUuYnVmZmVyZWRSZXF1ZXN0Q291bnQtLTtpZihzdGF0ZS53cml0aW5nKXticmVha319aWYoZW50cnk9PT1udWxsKXN0YXRlLmxhc3RCdWZmZXJlZFJlcXVlc3Q9bnVsbH1zdGF0ZS5idWZmZXJlZFJlcXVlc3Q9ZW50cnk7c3RhdGUuYnVmZmVyUHJvY2Vzc2luZz1mYWxzZX1Xcml0YWJsZS5wcm90b3R5cGUuX3dyaXRlPWZ1bmN0aW9uKGNodW5rLGVuY29kaW5nLGNiKXtjYihuZXcgRXJyb3IoIl93cml0ZSgpIGlzIG5vdCBpbXBsZW1lbnRlZCIpKX07V3JpdGFibGUucHJvdG90eXBlLl93cml0ZXY9bnVsbDtXcml0YWJsZS5wcm90b3R5cGUuZW5kPWZ1bmN0aW9uKGNodW5rLGVuY29kaW5nLGNiKXt2YXIgc3RhdGU9dGhpcy5fd3JpdGFibGVTdGF0ZTtpZih0eXBlb2YgY2h1bms9PT0iZnVuY3Rpb24iKXtjYj1jaHVuaztjaHVuaz1udWxsO2VuY29kaW5nPW51bGx9ZWxzZSBpZih0eXBlb2YgZW5jb2Rpbmc9PT0iZnVuY3Rpb24iKXtjYj1lbmNvZGluZztlbmNvZGluZz1udWxsfWlmKGNodW5rIT09bnVsbCYmY2h1bmshPT11bmRlZmluZWQpdGhpcy53cml0ZShjaHVuayxlbmNvZGluZyk7aWYoc3RhdGUuY29ya2VkKXtzdGF0ZS5jb3JrZWQ9MTt0aGlzLnVuY29yaygpfWlmKCFzdGF0ZS5lbmRpbmcmJiFzdGF0ZS5maW5pc2hlZCllbmRXcml0YWJsZSh0aGlzLHN0YXRlLGNiKX07ZnVuY3Rpb24gbmVlZEZpbmlzaChzdGF0ZSl7cmV0dXJuIHN0YXRlLmVuZGluZyYmc3RhdGUubGVuZ3RoPT09MCYmc3RhdGUuYnVmZmVyZWRSZXF1ZXN0PT09bnVsbCYmIXN0YXRlLmZpbmlzaGVkJiYhc3RhdGUud3JpdGluZ31mdW5jdGlvbiBjYWxsRmluYWwoc3RyZWFtLHN0YXRlKXtzdHJlYW0uX2ZpbmFsKGZ1bmN0aW9uKGVycil7c3RhdGUucGVuZGluZ2NiLS07aWYoZXJyKXtzdHJlYW0uZW1pdCgiZXJyb3IiLGVycil9c3RhdGUucHJlZmluaXNoZWQ9dHJ1ZTtzdHJlYW0uZW1pdCgicHJlZmluaXNoIik7ZmluaXNoTWF5YmUoc3RyZWFtLHN0YXRlKX0pfWZ1bmN0aW9uIHByZWZpbmlzaChzdHJlYW0sc3RhdGUpe2lmKCFzdGF0ZS5wcmVmaW5pc2hlZCYmIXN0YXRlLmZpbmFsQ2FsbGVkKXtpZih0eXBlb2Ygc3RyZWFtLl9maW5hbD09PSJmdW5jdGlvbiIpe3N0YXRlLnBlbmRpbmdjYisrO3N0YXRlLmZpbmFsQ2FsbGVkPXRydWU7cG5hLm5leHRUaWNrKGNhbGxGaW5hbCxzdHJlYW0sc3RhdGUpfWVsc2V7c3RhdGUucHJlZmluaXNoZWQ9dHJ1ZTtzdHJlYW0uZW1pdCgicHJlZmluaXNoIil9fX1mdW5jdGlvbiBmaW5pc2hNYXliZShzdHJlYW0sc3RhdGUpe3ZhciBuZWVkPW5lZWRGaW5pc2goc3RhdGUpO2lmKG5lZWQpe3ByZWZpbmlzaChzdHJlYW0sc3RhdGUpO2lmKHN0YXRlLnBlbmRpbmdjYj09PTApe3N0YXRlLmZpbmlzaGVkPXRydWU7c3RyZWFtLmVtaXQoImZpbmlzaCIpfX1yZXR1cm4gbmVlZH1mdW5jdGlvbiBlbmRXcml0YWJsZShzdHJlYW0sc3RhdGUsY2Ipe3N0YXRlLmVuZGluZz10cnVlO2ZpbmlzaE1heWJlKHN0cmVhbSxzdGF0ZSk7aWYoY2Ipe2lmKHN0YXRlLmZpbmlzaGVkKXBuYS5uZXh0VGljayhjYik7ZWxzZSBzdHJlYW0ub25jZSgiZmluaXNoIixjYil9c3RhdGUuZW5kZWQ9dHJ1ZTtzdHJlYW0ud3JpdGFibGU9ZmFsc2V9ZnVuY3Rpb24gb25Db3JrZWRGaW5pc2goY29ya1JlcSxzdGF0ZSxlcnIpe3ZhciBlbnRyeT1jb3JrUmVxLmVudHJ5O2NvcmtSZXEuZW50cnk9bnVsbDt3aGlsZShlbnRyeSl7dmFyIGNiPWVudHJ5LmNhbGxiYWNrO3N0YXRlLnBlbmRpbmdjYi0tO2NiKGVycik7ZW50cnk9ZW50cnkubmV4dH1pZihzdGF0ZS5jb3JrZWRSZXF1ZXN0c0ZyZWUpe3N0YXRlLmNvcmtlZFJlcXVlc3RzRnJlZS5uZXh0PWNvcmtSZXF9ZWxzZXtzdGF0ZS5jb3JrZWRSZXF1ZXN0c0ZyZWU9Y29ya1JlcX19T2JqZWN0LmRlZmluZVByb3BlcnR5KFdyaXRhYmxlLnByb3RvdHlwZSwiZGVzdHJveWVkIix7Z2V0OmZ1bmN0aW9uKCl7aWYodGhpcy5fd3JpdGFibGVTdGF0ZT09PXVuZGVmaW5lZCl7cmV0dXJuIGZhbHNlfXJldHVybiB0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZH0sc2V0OmZ1bmN0aW9uKHZhbHVlKXtpZighdGhpcy5fd3JpdGFibGVTdGF0ZSl7cmV0dXJufXRoaXMuX3dyaXRhYmxlU3RhdGUuZGVzdHJveWVkPXZhbHVlfX0pO1dyaXRhYmxlLnByb3RvdHlwZS5kZXN0cm95PWRlc3Ryb3lJbXBsLmRlc3Ryb3k7V3JpdGFibGUucHJvdG90eXBlLl91bmRlc3Ryb3k9ZGVzdHJveUltcGwudW5kZXN0cm95O1dyaXRhYmxlLnByb3RvdHlwZS5fZGVzdHJveT1mdW5jdGlvbihlcnIsY2Ipe3RoaXMuZW5kKCk7Y2IoZXJyKX19KS5jYWxsKHRoaXMscmVxdWlyZSgiX3Byb2Nlc3MiKSx0eXBlb2YgZ2xvYmFsIT09InVuZGVmaW5lZCI/Z2xvYmFsOnR5cGVvZiBzZWxmIT09InVuZGVmaW5lZCI/c2VsZjp0eXBlb2Ygd2luZG93IT09InVuZGVmaW5lZCI/d2luZG93Ont9LHJlcXVpcmUoInRpbWVycyIpLnNldEltbWVkaWF0ZSl9LHsiLi9fc3RyZWFtX2R1cGxleCI6MTA0LCIuL2ludGVybmFsL3N0cmVhbXMvZGVzdHJveSI6MTEwLCIuL2ludGVybmFsL3N0cmVhbXMvc3RyZWFtIjoxMTEsX3Byb2Nlc3M6NjYsImNvcmUtdXRpbC1pcyI6MzAsaW5oZXJpdHM6MzYsInByb2Nlc3MtbmV4dGljay1hcmdzIjo2NSwic2FmZS1idWZmZXIiOjExNix0aW1lcnM6MTE5LCJ1dGlsLWRlcHJlY2F0ZSI6MTIwfV0sMTA5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsidXNlIHN0cmljdCI7ZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLENvbnN0cnVjdG9yKXtpZighKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24iKX19dmFyIEJ1ZmZlcj1yZXF1aXJlKCJzYWZlLWJ1ZmZlciIpLkJ1ZmZlcjt2YXIgdXRpbD1yZXF1aXJlKCJ1dGlsIik7ZnVuY3Rpb24gY29weUJ1ZmZlcihzcmMsdGFyZ2V0LG9mZnNldCl7c3JjLmNvcHkodGFyZ2V0LG9mZnNldCl9bW9kdWxlLmV4cG9ydHM9ZnVuY3Rpb24oKXtmdW5jdGlvbiBCdWZmZXJMaXN0KCl7X2NsYXNzQ2FsbENoZWNrKHRoaXMsQnVmZmVyTGlzdCk7dGhpcy5oZWFkPW51bGw7dGhpcy50YWlsPW51bGw7dGhpcy5sZW5ndGg9MH1CdWZmZXJMaXN0LnByb3RvdHlwZS5wdXNoPWZ1bmN0aW9uIHB1c2godil7dmFyIGVudHJ5PXtkYXRhOnYsbmV4dDpudWxsfTtpZih0aGlzLmxlbmd0aD4wKXRoaXMudGFpbC5uZXh0PWVudHJ5O2Vsc2UgdGhpcy5oZWFkPWVudHJ5O3RoaXMudGFpbD1lbnRyeTsrK3RoaXMubGVuZ3RofTtCdWZmZXJMaXN0LnByb3RvdHlwZS51bnNoaWZ0PWZ1bmN0aW9uIHVuc2hpZnQodil7dmFyIGVudHJ5PXtkYXRhOnYsbmV4dDp0aGlzLmhlYWR9O2lmKHRoaXMubGVuZ3RoPT09MCl0aGlzLnRhaWw9ZW50cnk7dGhpcy5oZWFkPWVudHJ5OysrdGhpcy5sZW5ndGh9O0J1ZmZlckxpc3QucHJvdG90eXBlLnNoaWZ0PWZ1bmN0aW9uIHNoaWZ0KCl7aWYodGhpcy5sZW5ndGg9PT0wKXJldHVybjt2YXIgcmV0PXRoaXMuaGVhZC5kYXRhO2lmKHRoaXMubGVuZ3RoPT09MSl0aGlzLmhlYWQ9dGhpcy50YWlsPW51bGw7ZWxzZSB0aGlzLmhlYWQ9dGhpcy5oZWFkLm5leHQ7LS10aGlzLmxlbmd0aDtyZXR1cm4gcmV0fTtCdWZmZXJMaXN0LnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbiBjbGVhcigpe3RoaXMuaGVhZD10aGlzLnRhaWw9bnVsbDt0aGlzLmxlbmd0aD0wfTtCdWZmZXJMaXN0LnByb3RvdHlwZS5qb2luPWZ1bmN0aW9uIGpvaW4ocyl7aWYodGhpcy5sZW5ndGg9PT0wKXJldHVybiIiO3ZhciBwPXRoaXMuaGVhZDt2YXIgcmV0PSIiK3AuZGF0YTt3aGlsZShwPXAubmV4dCl7cmV0Kz1zK3AuZGF0YX1yZXR1cm4gcmV0fTtCdWZmZXJMaXN0LnByb3RvdHlwZS5jb25jYXQ9ZnVuY3Rpb24gY29uY2F0KG4pe2lmKHRoaXMubGVuZ3RoPT09MClyZXR1cm4gQnVmZmVyLmFsbG9jKDApO2lmKHRoaXMubGVuZ3RoPT09MSlyZXR1cm4gdGhpcy5oZWFkLmRhdGE7dmFyIHJldD1CdWZmZXIuYWxsb2NVbnNhZmUobj4+PjApO3ZhciBwPXRoaXMuaGVhZDt2YXIgaT0wO3doaWxlKHApe2NvcHlCdWZmZXIocC5kYXRhLHJldCxpKTtpKz1wLmRhdGEubGVuZ3RoO3A9cC5uZXh0fXJldHVybiByZXR9O3JldHVybiBCdWZmZXJMaXN0fSgpO2lmKHV0aWwmJnV0aWwuaW5zcGVjdCYmdXRpbC5pbnNwZWN0LmN1c3RvbSl7bW9kdWxlLmV4cG9ydHMucHJvdG90eXBlW3V0aWwuaW5zcGVjdC5jdXN0b21dPWZ1bmN0aW9uKCl7dmFyIG9iaj11dGlsLmluc3BlY3Qoe2xlbmd0aDp0aGlzLmxlbmd0aH0pO3JldHVybiB0aGlzLmNvbnN0cnVjdG9yLm5hbWUrIiAiK29ian19fSx7InNhZmUtYnVmZmVyIjoxMTYsdXRpbDoyNn1dLDExMDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO3ZhciBwbmE9cmVxdWlyZSgicHJvY2Vzcy1uZXh0aWNrLWFyZ3MiKTtmdW5jdGlvbiBkZXN0cm95KGVycixjYil7dmFyIF90aGlzPXRoaXM7dmFyIHJlYWRhYmxlRGVzdHJveWVkPXRoaXMuX3JlYWRhYmxlU3RhdGUmJnRoaXMuX3JlYWRhYmxlU3RhdGUuZGVzdHJveWVkO3ZhciB3cml0YWJsZURlc3Ryb3llZD10aGlzLl93cml0YWJsZVN0YXRlJiZ0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZDtpZihyZWFkYWJsZURlc3Ryb3llZHx8d3JpdGFibGVEZXN0cm95ZWQpe2lmKGNiKXtjYihlcnIpfWVsc2UgaWYoZXJyJiYoIXRoaXMuX3dyaXRhYmxlU3RhdGV8fCF0aGlzLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZCkpe3BuYS5uZXh0VGljayhlbWl0RXJyb3JOVCx0aGlzLGVycil9cmV0dXJuIHRoaXN9aWYodGhpcy5fcmVhZGFibGVTdGF0ZSl7dGhpcy5fcmVhZGFibGVTdGF0ZS5kZXN0cm95ZWQ9dHJ1ZX1pZih0aGlzLl93cml0YWJsZVN0YXRlKXt0aGlzLl93cml0YWJsZVN0YXRlLmRlc3Ryb3llZD10cnVlfXRoaXMuX2Rlc3Ryb3koZXJyfHxudWxsLGZ1bmN0aW9uKGVycil7aWYoIWNiJiZlcnIpe3BuYS5uZXh0VGljayhlbWl0RXJyb3JOVCxfdGhpcyxlcnIpO2lmKF90aGlzLl93cml0YWJsZVN0YXRlKXtfdGhpcy5fd3JpdGFibGVTdGF0ZS5lcnJvckVtaXR0ZWQ9dHJ1ZX19ZWxzZSBpZihjYil7Y2IoZXJyKX19KTtyZXR1cm4gdGhpc31mdW5jdGlvbiB1bmRlc3Ryb3koKXtpZih0aGlzLl9yZWFkYWJsZVN0YXRlKXt0aGlzLl9yZWFkYWJsZVN0YXRlLmRlc3Ryb3llZD1mYWxzZTt0aGlzLl9yZWFkYWJsZVN0YXRlLnJlYWRpbmc9ZmFsc2U7dGhpcy5fcmVhZGFibGVTdGF0ZS5lbmRlZD1mYWxzZTt0aGlzLl9yZWFkYWJsZVN0YXRlLmVuZEVtaXR0ZWQ9ZmFsc2V9aWYodGhpcy5fd3JpdGFibGVTdGF0ZSl7dGhpcy5fd3JpdGFibGVTdGF0ZS5kZXN0cm95ZWQ9ZmFsc2U7dGhpcy5fd3JpdGFibGVTdGF0ZS5lbmRlZD1mYWxzZTt0aGlzLl93cml0YWJsZVN0YXRlLmVuZGluZz1mYWxzZTt0aGlzLl93cml0YWJsZVN0YXRlLmZpbmlzaGVkPWZhbHNlO3RoaXMuX3dyaXRhYmxlU3RhdGUuZXJyb3JFbWl0dGVkPWZhbHNlfX1mdW5jdGlvbiBlbWl0RXJyb3JOVChzZWxmLGVycil7c2VsZi5lbWl0KCJlcnJvciIsZXJyKX1tb2R1bGUuZXhwb3J0cz17ZGVzdHJveTpkZXN0cm95LHVuZGVzdHJveTp1bmRlc3Ryb3l9fSx7InByb2Nlc3MtbmV4dGljay1hcmdzIjo2NX1dLDExMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7YXJndW1lbnRzWzRdWzgwXVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cyl9LHtkdXA6ODAsZXZlbnRzOjMzfV0sMTEyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cz1yZXF1aXJlKCIuL3JlYWRhYmxlIikuUGFzc1Rocm91Z2h9LHsiLi9yZWFkYWJsZSI6MTEzfV0sMTEzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtleHBvcnRzPW1vZHVsZS5leHBvcnRzPXJlcXVpcmUoIi4vbGliL19zdHJlYW1fcmVhZGFibGUuanMiKTtleHBvcnRzLlN0cmVhbT1leHBvcnRzO2V4cG9ydHMuUmVhZGFibGU9ZXhwb3J0cztleHBvcnRzLldyaXRhYmxlPXJlcXVpcmUoIi4vbGliL19zdHJlYW1fd3JpdGFibGUuanMiKTtleHBvcnRzLkR1cGxleD1yZXF1aXJlKCIuL2xpYi9fc3RyZWFtX2R1cGxleC5qcyIpO2V4cG9ydHMuVHJhbnNmb3JtPXJlcXVpcmUoIi4vbGliL19zdHJlYW1fdHJhbnNmb3JtLmpzIik7ZXhwb3J0cy5QYXNzVGhyb3VnaD1yZXF1aXJlKCIuL2xpYi9fc3RyZWFtX3Bhc3N0aHJvdWdoLmpzIil9LHsiLi9saWIvX3N0cmVhbV9kdXBsZXguanMiOjEwNCwiLi9saWIvX3N0cmVhbV9wYXNzdGhyb3VnaC5qcyI6MTA1LCIuL2xpYi9fc3RyZWFtX3JlYWRhYmxlLmpzIjoxMDYsIi4vbGliL19zdHJlYW1fdHJhbnNmb3JtLmpzIjoxMDcsIi4vbGliL19zdHJlYW1fd3JpdGFibGUuanMiOjEwOH1dLDExNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHM9cmVxdWlyZSgiLi9yZWFkYWJsZSIpLlRyYW5zZm9ybX0seyIuL3JlYWRhYmxlIjoxMTN9XSwxMTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe21vZHVsZS5leHBvcnRzPXJlcXVpcmUoIi4vbGliL19zdHJlYW1fd3JpdGFibGUuanMiKX0seyIuL2xpYi9fc3RyZWFtX3dyaXRhYmxlLmpzIjoxMDh9XSwxMTY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe3ZhciBidWZmZXI9cmVxdWlyZSgiYnVmZmVyIik7dmFyIEJ1ZmZlcj1idWZmZXIuQnVmZmVyO2Z1bmN0aW9uIGNvcHlQcm9wcyhzcmMsZHN0KXtmb3IodmFyIGtleSBpbiBzcmMpe2RzdFtrZXldPXNyY1trZXldfX1pZihCdWZmZXIuZnJvbSYmQnVmZmVyLmFsbG9jJiZCdWZmZXIuYWxsb2NVbnNhZmUmJkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cpe21vZHVsZS5leHBvcnRzPWJ1ZmZlcn1lbHNle2NvcHlQcm9wcyhidWZmZXIsZXhwb3J0cyk7ZXhwb3J0cy5CdWZmZXI9U2FmZUJ1ZmZlcn1mdW5jdGlvbiBTYWZlQnVmZmVyKGFyZyxlbmNvZGluZ09yT2Zmc2V0LGxlbmd0aCl7cmV0dXJuIEJ1ZmZlcihhcmcsZW5jb2RpbmdPck9mZnNldCxsZW5ndGgpfWNvcHlQcm9wcyhCdWZmZXIsU2FmZUJ1ZmZlcik7U2FmZUJ1ZmZlci5mcm9tPWZ1bmN0aW9uKGFyZyxlbmNvZGluZ09yT2Zmc2V0LGxlbmd0aCl7aWYodHlwZW9mIGFyZz09PSJudW1iZXIiKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJBcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlciIpfXJldHVybiBCdWZmZXIoYXJnLGVuY29kaW5nT3JPZmZzZXQsbGVuZ3RoKX07U2FmZUJ1ZmZlci5hbGxvYz1mdW5jdGlvbihzaXplLGZpbGwsZW5jb2Rpbmcpe2lmKHR5cGVvZiBzaXplIT09Im51bWJlciIpe3Rocm93IG5ldyBUeXBlRXJyb3IoIkFyZ3VtZW50IG11c3QgYmUgYSBudW1iZXIiKX12YXIgYnVmPUJ1ZmZlcihzaXplKTtpZihmaWxsIT09dW5kZWZpbmVkKXtpZih0eXBlb2YgZW5jb2Rpbmc9PT0ic3RyaW5nIil7YnVmLmZpbGwoZmlsbCxlbmNvZGluZyl9ZWxzZXtidWYuZmlsbChmaWxsKX19ZWxzZXtidWYuZmlsbCgwKX1yZXR1cm4gYnVmfTtTYWZlQnVmZmVyLmFsbG9jVW5zYWZlPWZ1bmN0aW9uKHNpemUpe2lmKHR5cGVvZiBzaXplIT09Im51bWJlciIpe3Rocm93IG5ldyBUeXBlRXJyb3IoIkFyZ3VtZW50IG11c3QgYmUgYSBudW1iZXIiKX1yZXR1cm4gQnVmZmVyKHNpemUpfTtTYWZlQnVmZmVyLmFsbG9jVW5zYWZlU2xvdz1mdW5jdGlvbihzaXplKXtpZih0eXBlb2Ygc2l6ZSE9PSJudW1iZXIiKXt0aHJvdyBuZXcgVHlwZUVycm9yKCJBcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyIil9cmV0dXJuIGJ1ZmZlci5TbG93QnVmZmVyKHNpemUpfX0se2J1ZmZlcjoyN31dLDExNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7InVzZSBzdHJpY3QiO3ZhciBCdWZmZXI9cmVxdWlyZSgic2FmZS1idWZmZXIiKS5CdWZmZXI7dmFyIGlzRW5jb2Rpbmc9QnVmZmVyLmlzRW5jb2Rpbmd8fGZ1bmN0aW9uKGVuY29kaW5nKXtlbmNvZGluZz0iIitlbmNvZGluZztzd2l0Y2goZW5jb2RpbmcmJmVuY29kaW5nLnRvTG93ZXJDYXNlKCkpe2Nhc2UiaGV4IjpjYXNlInV0ZjgiOmNhc2UidXRmLTgiOmNhc2UiYXNjaWkiOmNhc2UiYmluYXJ5IjpjYXNlImJhc2U2NCI6Y2FzZSJ1Y3MyIjpjYXNlInVjcy0yIjpjYXNlInV0ZjE2bGUiOmNhc2UidXRmLTE2bGUiOmNhc2UicmF3IjpyZXR1cm4gdHJ1ZTtkZWZhdWx0OnJldHVybiBmYWxzZX19O2Z1bmN0aW9uIF9ub3JtYWxpemVFbmNvZGluZyhlbmMpe2lmKCFlbmMpcmV0dXJuInV0ZjgiO3ZhciByZXRyaWVkO3doaWxlKHRydWUpe3N3aXRjaChlbmMpe2Nhc2UidXRmOCI6Y2FzZSJ1dGYtOCI6cmV0dXJuInV0ZjgiO2Nhc2UidWNzMiI6Y2FzZSJ1Y3MtMiI6Y2FzZSJ1dGYxNmxlIjpjYXNlInV0Zi0xNmxlIjpyZXR1cm4idXRmMTZsZSI7Y2FzZSJsYXRpbjEiOmNhc2UiYmluYXJ5IjpyZXR1cm4ibGF0aW4xIjtjYXNlImJhc2U2NCI6Y2FzZSJhc2NpaSI6Y2FzZSJoZXgiOnJldHVybiBlbmM7ZGVmYXVsdDppZihyZXRyaWVkKXJldHVybjtlbmM9KCIiK2VuYykudG9Mb3dlckNhc2UoKTtyZXRyaWVkPXRydWV9fX1mdW5jdGlvbiBub3JtYWxpemVFbmNvZGluZyhlbmMpe3ZhciBuZW5jPV9ub3JtYWxpemVFbmNvZGluZyhlbmMpO2lmKHR5cGVvZiBuZW5jIT09InN0cmluZyImJihCdWZmZXIuaXNFbmNvZGluZz09PWlzRW5jb2Rpbmd8fCFpc0VuY29kaW5nKGVuYykpKXRocm93IG5ldyBFcnJvcigiVW5rbm93biBlbmNvZGluZzogIitlbmMpO3JldHVybiBuZW5jfHxlbmN9ZXhwb3J0cy5TdHJpbmdEZWNvZGVyPVN0cmluZ0RlY29kZXI7ZnVuY3Rpb24gU3RyaW5nRGVjb2RlcihlbmNvZGluZyl7dGhpcy5lbmNvZGluZz1ub3JtYWxpemVFbmNvZGluZyhlbmNvZGluZyk7dmFyIG5iO3N3aXRjaCh0aGlzLmVuY29kaW5nKXtjYXNlInV0ZjE2bGUiOnRoaXMudGV4dD11dGYxNlRleHQ7dGhpcy5lbmQ9dXRmMTZFbmQ7bmI9NDticmVhaztjYXNlInV0ZjgiOnRoaXMuZmlsbExhc3Q9dXRmOEZpbGxMYXN0O25iPTQ7YnJlYWs7Y2FzZSJiYXNlNjQiOnRoaXMudGV4dD1iYXNlNjRUZXh0O3RoaXMuZW5kPWJhc2U2NEVuZDtuYj0zO2JyZWFrO2RlZmF1bHQ6dGhpcy53cml0ZT1zaW1wbGVXcml0ZTt0aGlzLmVuZD1zaW1wbGVFbmQ7cmV0dXJufXRoaXMubGFzdE5lZWQ9MDt0aGlzLmxhc3RUb3RhbD0wO3RoaXMubGFzdENoYXI9QnVmZmVyLmFsbG9jVW5zYWZlKG5iKX1TdHJpbmdEZWNvZGVyLnByb3RvdHlwZS53cml0ZT1mdW5jdGlvbihidWYpe2lmKGJ1Zi5sZW5ndGg9PT0wKXJldHVybiIiO3ZhciByO3ZhciBpO2lmKHRoaXMubGFzdE5lZWQpe3I9dGhpcy5maWxsTGFzdChidWYpO2lmKHI9PT11bmRlZmluZWQpcmV0dXJuIiI7aT10aGlzLmxhc3ROZWVkO3RoaXMubGFzdE5lZWQ9MH1lbHNle2k9MH1pZihpPGJ1Zi5sZW5ndGgpcmV0dXJuIHI/cit0aGlzLnRleHQoYnVmLGkpOnRoaXMudGV4dChidWYsaSk7cmV0dXJuIHJ8fCIifTtTdHJpbmdEZWNvZGVyLnByb3RvdHlwZS5lbmQ9dXRmOEVuZDtTdHJpbmdEZWNvZGVyLnByb3RvdHlwZS50ZXh0PXV0ZjhUZXh0O1N0cmluZ0RlY29kZXIucHJvdG90eXBlLmZpbGxMYXN0PWZ1bmN0aW9uKGJ1Zil7aWYodGhpcy5sYXN0TmVlZDw9YnVmLmxlbmd0aCl7YnVmLmNvcHkodGhpcy5sYXN0Q2hhcix0aGlzLmxhc3RUb3RhbC10aGlzLmxhc3ROZWVkLDAsdGhpcy5sYXN0TmVlZCk7cmV0dXJuIHRoaXMubGFzdENoYXIudG9TdHJpbmcodGhpcy5lbmNvZGluZywwLHRoaXMubGFzdFRvdGFsKX1idWYuY29weSh0aGlzLmxhc3RDaGFyLHRoaXMubGFzdFRvdGFsLXRoaXMubGFzdE5lZWQsMCxidWYubGVuZ3RoKTt0aGlzLmxhc3ROZWVkLT1idWYubGVuZ3RofTtmdW5jdGlvbiB1dGY4Q2hlY2tCeXRlKGJ5dGUpe2lmKGJ5dGU8PTEyNylyZXR1cm4gMDtlbHNlIGlmKGJ5dGU+PjU9PT02KXJldHVybiAyO2Vsc2UgaWYoYnl0ZT4+ND09PTE0KXJldHVybiAzO2Vsc2UgaWYoYnl0ZT4+Mz09PTMwKXJldHVybiA0O3JldHVybiBieXRlPj42PT09Mj8tMTotMn1mdW5jdGlvbiB1dGY4Q2hlY2tJbmNvbXBsZXRlKHNlbGYsYnVmLGkpe3ZhciBqPWJ1Zi5sZW5ndGgtMTtpZihqPGkpcmV0dXJuIDA7dmFyIG5iPXV0ZjhDaGVja0J5dGUoYnVmW2pdKTtpZihuYj49MCl7aWYobmI+MClzZWxmLmxhc3ROZWVkPW5iLTE7cmV0dXJuIG5ifWlmKC0tajxpfHxuYj09PS0yKXJldHVybiAwO25iPXV0ZjhDaGVja0J5dGUoYnVmW2pdKTtpZihuYj49MCl7aWYobmI+MClzZWxmLmxhc3ROZWVkPW5iLTI7cmV0dXJuIG5ifWlmKC0tajxpfHxuYj09PS0yKXJldHVybiAwO25iPXV0ZjhDaGVja0J5dGUoYnVmW2pdKTtpZihuYj49MCl7aWYobmI+MCl7aWYobmI9PT0yKW5iPTA7ZWxzZSBzZWxmLmxhc3ROZWVkPW5iLTN9cmV0dXJuIG5ifXJldHVybiAwfWZ1bmN0aW9uIHV0ZjhDaGVja0V4dHJhQnl0ZXMoc2VsZixidWYscCl7aWYoKGJ1ZlswXSYxOTIpIT09MTI4KXtzZWxmLmxhc3ROZWVkPTA7cmV0dXJuIu+/vSJ9aWYoc2VsZi5sYXN0TmVlZD4xJiZidWYubGVuZ3RoPjEpe2lmKChidWZbMV0mMTkyKSE9PTEyOCl7c2VsZi5sYXN0TmVlZD0xO3JldHVybiLvv70ifWlmKHNlbGYubGFzdE5lZWQ+MiYmYnVmLmxlbmd0aD4yKXtpZigoYnVmWzJdJjE5MikhPT0xMjgpe3NlbGYubGFzdE5lZWQ9MjtyZXR1cm4i77+9In19fX1mdW5jdGlvbiB1dGY4RmlsbExhc3QoYnVmKXt2YXIgcD10aGlzLmxhc3RUb3RhbC10aGlzLmxhc3ROZWVkO3ZhciByPXV0ZjhDaGVja0V4dHJhQnl0ZXModGhpcyxidWYscCk7aWYociE9PXVuZGVmaW5lZClyZXR1cm4gcjtpZih0aGlzLmxhc3ROZWVkPD1idWYubGVuZ3RoKXtidWYuY29weSh0aGlzLmxhc3RDaGFyLHAsMCx0aGlzLmxhc3ROZWVkKTtyZXR1cm4gdGhpcy5sYXN0Q2hhci50b1N0cmluZyh0aGlzLmVuY29kaW5nLDAsdGhpcy5sYXN0VG90YWwpfWJ1Zi5jb3B5KHRoaXMubGFzdENoYXIscCwwLGJ1Zi5sZW5ndGgpO3RoaXMubGFzdE5lZWQtPWJ1Zi5sZW5ndGh9ZnVuY3Rpb24gdXRmOFRleHQoYnVmLGkpe3ZhciB0b3RhbD11dGY4Q2hlY2tJbmNvbXBsZXRlKHRoaXMsYnVmLGkpO2lmKCF0aGlzLmxhc3ROZWVkKXJldHVybiBidWYudG9TdHJpbmcoInV0ZjgiLGkpO3RoaXMubGFzdFRvdGFsPXRvdGFsO3ZhciBlbmQ9YnVmLmxlbmd0aC0odG90YWwtdGhpcy5sYXN0TmVlZCk7YnVmLmNvcHkodGhpcy5sYXN0Q2hhciwwLGVuZCk7cmV0dXJuIGJ1Zi50b1N0cmluZygidXRmOCIsaSxlbmQpfWZ1bmN0aW9uIHV0ZjhFbmQoYnVmKXt2YXIgcj1idWYmJmJ1Zi5sZW5ndGg/dGhpcy53cml0ZShidWYpOiIiO2lmKHRoaXMubGFzdE5lZWQpcmV0dXJuIHIrIu+/vSI7cmV0dXJuIHJ9ZnVuY3Rpb24gdXRmMTZUZXh0KGJ1ZixpKXtpZigoYnVmLmxlbmd0aC1pKSUyPT09MCl7dmFyIHI9YnVmLnRvU3RyaW5nKCJ1dGYxNmxlIixpKTtpZihyKXt2YXIgYz1yLmNoYXJDb2RlQXQoci5sZW5ndGgtMSk7aWYoYz49NTUyOTYmJmM8PTU2MzE5KXt0aGlzLmxhc3ROZWVkPTI7dGhpcy5sYXN0VG90YWw9NDt0aGlzLmxhc3RDaGFyWzBdPWJ1ZltidWYubGVuZ3RoLTJdO3RoaXMubGFzdENoYXJbMV09YnVmW2J1Zi5sZW5ndGgtMV07cmV0dXJuIHIuc2xpY2UoMCwtMSl9fXJldHVybiByfXRoaXMubGFzdE5lZWQ9MTt0aGlzLmxhc3RUb3RhbD0yO3RoaXMubGFzdENoYXJbMF09YnVmW2J1Zi5sZW5ndGgtMV07cmV0dXJuIGJ1Zi50b1N0cmluZygidXRmMTZsZSIsaSxidWYubGVuZ3RoLTEpfWZ1bmN0aW9uIHV0ZjE2RW5kKGJ1Zil7dmFyIHI9YnVmJiZidWYubGVuZ3RoP3RoaXMud3JpdGUoYnVmKToiIjtpZih0aGlzLmxhc3ROZWVkKXt2YXIgZW5kPXRoaXMubGFzdFRvdGFsLXRoaXMubGFzdE5lZWQ7cmV0dXJuIHIrdGhpcy5sYXN0Q2hhci50b1N0cmluZygidXRmMTZsZSIsMCxlbmQpfXJldHVybiByfWZ1bmN0aW9uIGJhc2U2NFRleHQoYnVmLGkpe3ZhciBuPShidWYubGVuZ3RoLWkpJTM7aWYobj09PTApcmV0dXJuIGJ1Zi50b1N0cmluZygiYmFzZTY0IixpKTt0aGlzLmxhc3ROZWVkPTMtbjt0aGlzLmxhc3RUb3RhbD0zO2lmKG49PT0xKXt0aGlzLmxhc3RDaGFyWzBdPWJ1ZltidWYubGVuZ3RoLTFdfWVsc2V7dGhpcy5sYXN0Q2hhclswXT1idWZbYnVmLmxlbmd0aC0yXTt0aGlzLmxhc3RDaGFyWzFdPWJ1ZltidWYubGVuZ3RoLTFdfXJldHVybiBidWYudG9TdHJpbmcoImJhc2U2NCIsaSxidWYubGVuZ3RoLW4pfWZ1bmN0aW9uIGJhc2U2NEVuZChidWYpe3ZhciByPWJ1ZiYmYnVmLmxlbmd0aD90aGlzLndyaXRlKGJ1Zik6IiI7aWYodGhpcy5sYXN0TmVlZClyZXR1cm4gcit0aGlzLmxhc3RDaGFyLnRvU3RyaW5nKCJiYXNlNjQiLDAsMy10aGlzLmxhc3ROZWVkKTtyZXR1cm4gcn1mdW5jdGlvbiBzaW1wbGVXcml0ZShidWYpe3JldHVybiBidWYudG9TdHJpbmcodGhpcy5lbmNvZGluZyl9ZnVuY3Rpb24gc2ltcGxlRW5kKGJ1Zil7cmV0dXJuIGJ1ZiYmYnVmLmxlbmd0aD90aGlzLndyaXRlKGJ1Zik6IiJ9fSx7InNhZmUtYnVmZmVyIjoxMTZ9XSwxMTg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe2FyZ3VtZW50c1s0XVsxMTddWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKX0se2R1cDoxMTcsInNhZmUtYnVmZmVyIjo4M31dLDExOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKHNldEltbWVkaWF0ZSxjbGVhckltbWVkaWF0ZSl7dmFyIG5leHRUaWNrPXJlcXVpcmUoInByb2Nlc3MvYnJvd3Nlci5qcyIpLm5leHRUaWNrO3ZhciBhcHBseT1GdW5jdGlvbi5wcm90b3R5cGUuYXBwbHk7dmFyIHNsaWNlPUFycmF5LnByb3RvdHlwZS5zbGljZTt2YXIgaW1tZWRpYXRlSWRzPXt9O3ZhciBuZXh0SW1tZWRpYXRlSWQ9MDtleHBvcnRzLnNldFRpbWVvdXQ9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRUaW1lb3V0LHdpbmRvdyxhcmd1bWVudHMpLGNsZWFyVGltZW91dCl9O2V4cG9ydHMuc2V0SW50ZXJ2YWw9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IFRpbWVvdXQoYXBwbHkuY2FsbChzZXRJbnRlcnZhbCx3aW5kb3csYXJndW1lbnRzKSxjbGVhckludGVydmFsKX07ZXhwb3J0cy5jbGVhclRpbWVvdXQ9ZXhwb3J0cy5jbGVhckludGVydmFsPWZ1bmN0aW9uKHRpbWVvdXQpe3RpbWVvdXQuY2xvc2UoKX07ZnVuY3Rpb24gVGltZW91dChpZCxjbGVhckZuKXt0aGlzLl9pZD1pZDt0aGlzLl9jbGVhckZuPWNsZWFyRm59VGltZW91dC5wcm90b3R5cGUudW5yZWY9VGltZW91dC5wcm90b3R5cGUucmVmPWZ1bmN0aW9uKCl7fTtUaW1lb3V0LnByb3RvdHlwZS5jbG9zZT1mdW5jdGlvbigpe3RoaXMuX2NsZWFyRm4uY2FsbCh3aW5kb3csdGhpcy5faWQpfTtleHBvcnRzLmVucm9sbD1mdW5jdGlvbihpdGVtLG1zZWNzKXtjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7aXRlbS5faWRsZVRpbWVvdXQ9bXNlY3N9O2V4cG9ydHMudW5lbnJvbGw9ZnVuY3Rpb24oaXRlbSl7Y2xlYXJUaW1lb3V0KGl0ZW0uX2lkbGVUaW1lb3V0SWQpO2l0ZW0uX2lkbGVUaW1lb3V0PS0xfTtleHBvcnRzLl91bnJlZkFjdGl2ZT1leHBvcnRzLmFjdGl2ZT1mdW5jdGlvbihpdGVtKXtjbGVhclRpbWVvdXQoaXRlbS5faWRsZVRpbWVvdXRJZCk7dmFyIG1zZWNzPWl0ZW0uX2lkbGVUaW1lb3V0O2lmKG1zZWNzPj0wKXtpdGVtLl9pZGxlVGltZW91dElkPXNldFRpbWVvdXQoZnVuY3Rpb24gb25UaW1lb3V0KCl7aWYoaXRlbS5fb25UaW1lb3V0KWl0ZW0uX29uVGltZW91dCgpfSxtc2Vjcyl9fTtleHBvcnRzLnNldEltbWVkaWF0ZT10eXBlb2Ygc2V0SW1tZWRpYXRlPT09ImZ1bmN0aW9uIj9zZXRJbW1lZGlhdGU6ZnVuY3Rpb24oZm4pe3ZhciBpZD1uZXh0SW1tZWRpYXRlSWQrKzt2YXIgYXJncz1hcmd1bWVudHMubGVuZ3RoPDI/ZmFsc2U6c2xpY2UuY2FsbChhcmd1bWVudHMsMSk7aW1tZWRpYXRlSWRzW2lkXT10cnVlO25leHRUaWNrKGZ1bmN0aW9uIG9uTmV4dFRpY2soKXtpZihpbW1lZGlhdGVJZHNbaWRdKXtpZihhcmdzKXtmbi5hcHBseShudWxsLGFyZ3MpfWVsc2V7Zm4uY2FsbChudWxsKX1leHBvcnRzLmNsZWFySW1tZWRpYXRlKGlkKX19KTtyZXR1cm4gaWR9O2V4cG9ydHMuY2xlYXJJbW1lZGlhdGU9dHlwZW9mIGNsZWFySW1tZWRpYXRlPT09ImZ1bmN0aW9uIj9jbGVhckltbWVkaWF0ZTpmdW5jdGlvbihpZCl7ZGVsZXRlIGltbWVkaWF0ZUlkc1tpZF19fSkuY2FsbCh0aGlzLHJlcXVpcmUoInRpbWVycyIpLnNldEltbWVkaWF0ZSxyZXF1aXJlKCJ0aW1lcnMiKS5jbGVhckltbWVkaWF0ZSl9LHsicHJvY2Vzcy9icm93c2VyLmpzIjo2Nix0aW1lcnM6MTE5fV0sMTIwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXttb2R1bGUuZXhwb3J0cz1kZXByZWNhdGU7ZnVuY3Rpb24gZGVwcmVjYXRlKGZuLG1zZyl7aWYoY29uZmlnKCJub0RlcHJlY2F0aW9uIikpe3JldHVybiBmbn12YXIgd2FybmVkPWZhbHNlO2Z1bmN0aW9uIGRlcHJlY2F0ZWQoKXtpZighd2FybmVkKXtpZihjb25maWcoInRocm93RGVwcmVjYXRpb24iKSl7dGhyb3cgbmV3IEVycm9yKG1zZyl9ZWxzZSBpZihjb25maWcoInRyYWNlRGVwcmVjYXRpb24iKSl7Y29uc29sZS50cmFjZShtc2cpfWVsc2V7Y29uc29sZS53YXJuKG1zZyl9d2FybmVkPXRydWV9cmV0dXJuIGZuLmFwcGx5KHRoaXMsYXJndW1lbnRzKX1yZXR1cm4gZGVwcmVjYXRlZH1mdW5jdGlvbiBjb25maWcobmFtZSl7dHJ5e2lmKCFnbG9iYWwubG9jYWxTdG9yYWdlKXJldHVybiBmYWxzZX1jYXRjaChfKXtyZXR1cm4gZmFsc2V9dmFyIHZhbD1nbG9iYWwubG9jYWxTdG9yYWdlW25hbWVdO2lmKG51bGw9PXZhbClyZXR1cm4gZmFsc2U7cmV0dXJuIFN0cmluZyh2YWwpLnRvTG93ZXJDYXNlKCk9PT0idHJ1ZSJ9fSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwhPT0idW5kZWZpbmVkIj9nbG9iYWw6dHlwZW9mIHNlbGYhPT0idW5kZWZpbmVkIj9zZWxmOnR5cGVvZiB3aW5kb3chPT0idW5kZWZpbmVkIj93aW5kb3c6e30pfSx7fV19LHt9LFsyXSk7","base64").toString("utf8");
})();
var __cryptoLib;
eval(bundle_source);
__exportStar(require("../sync/types"), exports);
__exportStar(require("./serializer"), exports);
var toBuffer_1 = require("../sync/utils/toBuffer");
Object.defineProperty(exports, "toBuffer", { enumerable: true, get: function () { return toBuffer_1.toBuffer; } });
var isMultithreadingEnabled = (function () {
    switch (environnement_1.environnement.type) {
        case "BROWSER": return (typeof Worker !== "undefined" &&
            typeof URL !== "undefined" &&
            typeof Blob !== "undefined");
        case "LIQUID CORE": return false;
        case "NODE": return true;
        case "REACT NATIVE": return false;
    }
})();
function disableMultithreading() {
    isMultithreadingEnabled = false;
}
exports.disableMultithreading = disableMultithreading;
var WorkerThreadId;
(function (WorkerThreadId) {
    function generate() {
        return { "type": "WORKER THREAD ID" };
    }
    WorkerThreadId.generate = generate;
})(WorkerThreadId = exports.WorkerThreadId || (exports.WorkerThreadId = {}));
var _a = (function () {
    var spawn = WorkerThread_1.WorkerThread.factory(bundle_source, function () { return isMultithreadingEnabled; });
    var map = new Map_1.Polyfill();
    return [
        function (workerThreadId) {
            var workerThread = map.get(workerThreadId);
            if (workerThread === undefined) {
                workerThread = spawn();
                map.set(workerThreadId, workerThread);
            }
            return workerThread;
        },
        function (workerThreadId) {
            var match = workerThreadId === undefined ?
                (function () { return true; })
                :
                    (function (o) { return o === workerThreadId; });
            for (var _i = 0, _a = Array.from(map.keys()); _i < _a.length; _i++) {
                var workerThreadId_1 = _a[_i];
                if (!match(workerThreadId_1)) {
                    continue;
                }
                map.get(workerThreadId_1).terminate();
                map.delete(workerThreadId_1);
            }
        },
        function () { return Array.from(map.keys()); }
    ];
})(), getWorkerThread = _a[0], terminateWorkerThreads = _a[1], listWorkerThreadIds = _a[2];
exports.terminateWorkerThreads = terminateWorkerThreads;
function preSpawnWorkerThread(workerThreadId) {
    getWorkerThread(workerThreadId);
}
exports.preSpawnWorkerThread = preSpawnWorkerThread;
var workerThreadPool;
(function (workerThreadPool) {
    var Id;
    (function (Id) {
        function generate() {
            return { "type": "WORKER THREAD POOL ID" };
        }
        Id.generate = generate;
    })(Id = workerThreadPool.Id || (workerThreadPool.Id = {}));
    var map = new Map_1.Polyfill();
    function preSpawn(workerThreadPoolId, poolSize) {
        //TODO: When we pre spawn multiple time with the same 
        //id the treads adds up...
        if (!map.has(workerThreadPoolId)) {
            map.set(workerThreadPoolId, new Set_1.Polyfill());
        }
        for (var i = 1; i <= poolSize; i++) {
            var workerThreadId = WorkerThreadId.generate();
            map.get(workerThreadPoolId).add(workerThreadId);
            preSpawnWorkerThread(workerThreadId);
        }
    }
    workerThreadPool.preSpawn = preSpawn;
    function listIds(workerThreadPoolId) {
        var set = map.get(workerThreadPoolId) || new Set_1.Polyfill();
        return listWorkerThreadIds()
            .filter(function (workerThreadId) { return set.has(workerThreadId); });
    }
    workerThreadPool.listIds = listIds;
    function terminate(workerThreadPoolId) {
        for (var _i = 0, _a = listIds(workerThreadPoolId); _i < _a.length; _i++) {
            var workerThreadId = _a[_i];
            terminateWorkerThreads(workerThreadId);
        }
    }
    workerThreadPool.terminate = terminate;
})(workerThreadPool = exports.workerThreadPool || (exports.workerThreadPool = {}));
var getCounter = (function () {
    var counter = 0;
    return function () { return counter++; };
})();
var defaultWorkerPoolIds = {
    "aes": workerThreadPool.Id.generate(),
    "plain": workerThreadPool.Id.generate(),
    "rsa": workerThreadPool.Id.generate()
};
function cipherFactoryPool(params, workerThreadPoolId) {
    var _this = this;
    if (workerThreadPoolId === undefined) {
        workerThreadPoolId = defaultWorkerPoolIds[params.cipherName];
        workerThreadPool.preSpawn(workerThreadPoolId, 4);
    }
    else if (workerThreadPool.listIds(workerThreadPoolId).length === 0) {
        throw new Error("No thread in the pool");
    }
    var runExclusiveFunctions = workerThreadPool.listIds(workerThreadPoolId)
        .map(function (workerThreadId) {
        var cipher = cipherFactoryPool.cipherFactory(params, workerThreadId);
        return runExclusive.build(function (method, data) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, cipher[method](data)];
        }); }); });
    });
    return (function () {
        var _a = ["encrypt", "decrypt"]
            .map(function (method) { return function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, runExclusiveFunctions
                        .map(function (runExclusiveFunction) { return [
                        runExclusive.getQueuedCallCount(runExclusiveFunction),
                        runExclusiveFunction
                    ]; })
                        .sort(function (_a, _b) {
                        var n1 = _a[0];
                        var n2 = _b[0];
                        return n1 - n2;
                    })[0][1](method, data)];
            });
        }); }; }), encrypt = _a[0], decrypt = _a[1];
        switch (params.components) {
            case "EncryptorDecryptor": return { encrypt: encrypt, decrypt: decrypt };
            case "Decryptor": return { decrypt: decrypt };
            case "Encryptor": return { encrypt: encrypt };
        }
    })();
}
(function (cipherFactoryPool) {
    function cipherFactory(params, workerThreadId) {
        var cipherInstanceRef = getCounter();
        var appWorker = getWorkerThread(workerThreadId);
        appWorker.send((function () {
            var action = __assign({ "action": "CipherFactory", cipherInstanceRef: cipherInstanceRef }, params);
            return action;
        })());
        return (function () {
            var _a = ["encrypt", "decrypt"]
                .map(function (method) { return (function (data) { return cipherFactory.encryptOrDecrypt(cipherInstanceRef, method, data, workerThreadId); }); }), encrypt = _a[0], decrypt = _a[1];
            switch (params.components) {
                case "EncryptorDecryptor": return { encrypt: encrypt, decrypt: decrypt };
                case "Decryptor": return { decrypt: decrypt };
                case "Encryptor": return { encrypt: encrypt };
            }
        })();
    }
    cipherFactoryPool.cipherFactory = cipherFactory;
    (function (cipherFactory) {
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
        cipherFactory.encryptOrDecrypt = encryptOrDecrypt;
    })(cipherFactory = cipherFactoryPool.cipherFactory || (cipherFactoryPool.cipherFactory = {}));
})(cipherFactoryPool || (cipherFactoryPool = {}));
exports.plain = (function () {
    var encryptorDecryptorFactory = function (workerThreadPoolId) {
        return cipherFactoryPool({
            "cipherName": "plain",
            "components": "EncryptorDecryptor",
            "params": []
        }, workerThreadPoolId);
    };
    return __assign({ encryptorDecryptorFactory: encryptorDecryptorFactory }, __cryptoLib.plain);
})();
exports.aes = (function () {
    var encryptorDecryptorFactory = function (key, workerThreadPoolId) {
        return cipherFactoryPool({
            "cipherName": "aes",
            "components": "EncryptorDecryptor",
            "params": [key]
        }, workerThreadPoolId);
    };
    return __assign({ encryptorDecryptorFactory: encryptorDecryptorFactory }, __cryptoLib.aes);
})();
exports.rsa = (function () {
    var encryptorFactory = function (encryptKey, workerThreadPoolId) {
        return cipherFactoryPool({
            "cipherName": "rsa",
            "components": "Encryptor",
            "params": [encryptKey]
        }, workerThreadPoolId);
    };
    var decryptorFactory = function (decryptKey, workerThreadPoolId) {
        return cipherFactoryPool({
            "cipherName": "rsa",
            "components": "Decryptor",
            "params": [decryptKey]
        }, workerThreadPoolId);
    };
    function encryptorDecryptorFactory(encryptKey, decryptKey, workerThreadPoolId) {
        return cipherFactoryPool({
            "cipherName": "rsa",
            "components": "EncryptorDecryptor",
            "params": [encryptKey, decryptKey]
        }, workerThreadPoolId);
    }
    var generateKeys = function (seed, keysLengthBytes, workerThreadId) { return __awaiter(void 0, void 0, void 0, function () {
        var wasWorkerThreadIdSpecified, actionId, appWorker, outputs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wasWorkerThreadIdSpecified = workerThreadId !== undefined;
                    workerThreadId = workerThreadId !== undefined ?
                        workerThreadId :
                        WorkerThreadId.generate();
                    actionId = getCounter();
                    appWorker = getWorkerThread(workerThreadId);
                    appWorker.send((function () {
                        var action = {
                            "action": "GenerateRsaKeys",
                            actionId: actionId,
                            "params": [seed, keysLengthBytes]
                        };
                        return action;
                    })());
                    return [4 /*yield*/, appWorker.evtResponse.waitFor(function (response) {
                            return response.actionId === actionId;
                        })];
                case 1:
                    outputs = (_a.sent()).outputs;
                    if (!wasWorkerThreadIdSpecified) {
                        terminateWorkerThreads(workerThreadId);
                    }
                    return [2 /*return*/, outputs];
            }
        });
    }); };
    return __assign({ encryptorFactory: encryptorFactory,
        decryptorFactory: decryptorFactory,
        encryptorDecryptorFactory: encryptorDecryptorFactory,
        generateKeys: generateKeys }, __cryptoLib.rsa);
})();
exports.scrypt = (function () {
    var hash = function (text, salt, params, progress, workerThreadId) {
        if (params === void 0) { params = {}; }
        if (progress === void 0) { progress = (function () { }); }
        return __awaiter(void 0, void 0, void 0, function () {
            var actionId, wasWorkerThreadIdSpecified, appWorker, ctx, digest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        actionId = getCounter();
                        wasWorkerThreadIdSpecified = workerThreadId !== undefined;
                        workerThreadId = workerThreadId !== undefined ?
                            workerThreadId :
                            WorkerThreadId.generate();
                        appWorker = getWorkerThread(workerThreadId);
                        appWorker.send((function () {
                            var action = {
                                "action": "ScryptHash",
                                actionId: actionId,
                                "params": [text, salt, params]
                            };
                            return action;
                        })());
                        ctx = evt_1.Evt.newCtx();
                        appWorker.evtResponse.attach(function (response) { return (response.actionId === actionId &&
                            "percent" in response); }, ctx, function (_a) {
                            var percent = _a.percent;
                            return progress(percent);
                        });
                        return [4 /*yield*/, appWorker.evtResponse.waitFor(function (response) { return (response.actionId === actionId &&
                                "digest" in response); })];
                    case 1:
                        digest = (_a.sent()).digest;
                        appWorker.evtResponse.detach(ctx);
                        if (!wasWorkerThreadIdSpecified) {
                            terminateWorkerThreads(workerThreadId);
                        }
                        return [2 /*return*/, digest];
                }
            });
        });
    };
    return __assign({ hash: hash }, __cryptoLib.scrypt);
})();

}).call(this,require("buffer").Buffer)
},{"../sync/types":9,"../sync/utils/environnement":10,"../sync/utils/toBuffer":12,"./WorkerThread":1,"./serializer":7,"buffer":15,"evt":33,"minimal-polyfills/Array.from":64,"minimal-polyfills/Map":66,"minimal-polyfills/Set":68,"path":70,"run-exclusive":72}],7:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptThenParseFactory = exports.stringifyThenEncryptFactory = void 0;
var toBuffer_1 = require("../sync/utils/toBuffer");
var ttJC = require("transfer-tools/dist/lib/JSON_CUSTOM");
function matchPromise(prOrValue) {
    return "then" in prOrValue;
}
var stringRepresentationEncoding = "base64";
function stringifyThenEncryptFactory(encryptor) {
    var stringify = ttJC.get().stringify;
    return function stringifyThenEncrypt(value) {
        var prOrValue = encryptor.encrypt(Buffer.from([
            stringify(value),
            (new Array(9 + Math.floor(Math.random() * 20)))
                .fill(" ")
                .join("")
        ].join(""), "utf8"));
        var finalize = function (value) { return toBuffer_1.toBuffer(value).toString(stringRepresentationEncoding); };
        return (matchPromise(prOrValue) ?
            prOrValue.then(function (value) { return finalize(value); }) :
            finalize(prOrValue));
    };
}
exports.stringifyThenEncryptFactory = stringifyThenEncryptFactory;
function decryptThenParseFactory(decryptor) {
    var parse = ttJC.get().parse;
    return function decryptThenParse(encryptedValue) {
        var prOrValue = decryptor.decrypt(Buffer.from(encryptedValue, stringRepresentationEncoding));
        var finalize = function (value) { return parse(toBuffer_1.toBuffer(value).toString("utf8")); };
        return matchPromise(prOrValue) ?
            prOrValue.then(function (value) { return finalize(value); }) :
            finalize(prOrValue);
    };
}
exports.decryptThenParseFactory = decryptThenParseFactory;

}).call(this,require("buffer").Buffer)
},{"../sync/utils/toBuffer":12,"buffer":15,"transfer-tools/dist/lib/JSON_CUSTOM":74}],8:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transfer = void 0;
var environnement_1 = require("../utils/environnement");
var toBuffer_1 = require("../utils/toBuffer");
var transfer;
(function (transfer) {
    var SerializableUint8Array;
    (function (SerializableUint8Array) {
        function match(value) {
            return (value instanceof Object &&
                value.type === "Uint8Array" &&
                typeof value.data === "string");
        }
        SerializableUint8Array.match = match;
        function build(value) {
            return {
                "type": "Uint8Array",
                "data": toBuffer_1.toBuffer(value).toString("binary")
            };
        }
        SerializableUint8Array.build = build;
        function restore(value) {
            return Buffer.from(value.data, "binary");
        }
        SerializableUint8Array.restore = restore;
    })(SerializableUint8Array || (SerializableUint8Array = {}));
    function prepare(threadMessage) {
        if (environnement_1.environnement.type !== "NODE") {
            throw new Error("only for node");
        }
        var message = (function () {
            if (threadMessage instanceof Uint8Array) {
                return SerializableUint8Array.build(threadMessage);
            }
            else if (threadMessage instanceof Array) {
                return threadMessage.map(function (entry) { return prepare(entry); });
            }
            else if (threadMessage instanceof Object) {
                var out = {};
                for (var key in threadMessage) {
                    out[key] = prepare(threadMessage[key]);
                }
                return out;
            }
            else {
                return threadMessage;
            }
        })();
        return message;
    }
    transfer.prepare = prepare;
    function restore(message) {
        if (environnement_1.environnement.type !== "NODE") {
            throw new Error("only for node");
        }
        var threadMessage = (function () {
            if (SerializableUint8Array.match(message)) {
                return SerializableUint8Array.restore(message);
            }
            else if (message instanceof Array) {
                return message.map(function (entry) { return restore(entry); });
            }
            else if (message instanceof Object) {
                var out = {};
                for (var key in message) {
                    out[key] = restore(message[key]);
                }
                return out;
            }
            else {
                return message;
            }
        })();
        return threadMessage;
    }
    transfer.restore = restore;
})(transfer = exports.transfer || (exports.transfer = {}));

}).call(this,require("buffer").Buffer)
},{"../utils/environnement":10,"../utils/toBuffer":12,"buffer":15}],9:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RsaKey = void 0;
var toBuffer_1 = require("./utils/toBuffer");
var RsaKey;
(function (RsaKey) {
    function stringify(rsaKey) {
        return JSON.stringify([rsaKey.format, toBuffer_1.toBuffer(rsaKey.data).toString("base64")]);
    }
    RsaKey.stringify = stringify;
    function parse(stringifiedRsaKey) {
        var _a = JSON.parse(stringifiedRsaKey), format = _a[0], strData = _a[1];
        return { format: format, "data": new Uint8Array(Buffer.from(strData, "base64")) };
    }
    RsaKey.parse = parse;
    var Public;
    (function (Public) {
        function match(rsaKey) {
            return rsaKey.format === "pkcs1-public-der";
        }
        Public.match = match;
    })(Public = RsaKey.Public || (RsaKey.Public = {}));
    var Private;
    (function (Private) {
        function match(rsaKey) {
            return rsaKey.format === "pkcs1-private-der";
        }
        Private.match = match;
    })(Private = RsaKey.Private || (RsaKey.Private = {}));
})(RsaKey = exports.RsaKey || (exports.RsaKey = {}));

}).call(this,require("buffer").Buffer)
},{"./utils/toBuffer":12,"buffer":15}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.environnement = void 0;
exports.environnement = (function () {
    if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
        return {
            "type": "REACT NATIVE",
            "isMainThread": true
        };
    }
    if (typeof window !== "undefined") {
        return {
            "type": "BROWSER",
            "isMainThread": true
        };
    }
    if (typeof self !== "undefined" && !!self.postMessage) {
        return {
            "type": "BROWSER",
            "isMainThread": false
        };
    }
    var isNodeCryptoAvailable = (function () {
        try {
            require("crypto" + "");
        }
        catch (_a) {
            return false;
        }
        return true;
    })();
    if (isNodeCryptoAvailable) {
        //NOTE: We do not check process.send because browserify hide it.
        return {
            "type": "NODE",
            "isMainThread": undefined
        };
    }
    return {
        "type": "LIQUID CORE",
        "isMainThread": true
    };
})();

},{}],11:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomBytes = void 0;
var environnement_1 = require("./environnement");
function randomBytes(size, callback) {
    var MAX_UINT32 = randomBytes.MAX_UINT32, MAX_BYTES = randomBytes.MAX_BYTES, getRandomValues = randomBytes.getRandomValues, getNodeRandomBytes = randomBytes.getNodeRandomBytes;
    if (environnement_1.environnement.type === "NODE") {
        var toLocalBufferImplementation_1 = function (nodeBufferInst) { return Buffer.from(nodeBufferInst.buffer, nodeBufferInst.byteOffset, nodeBufferInst.length); };
        var nodeRandomBytes = getNodeRandomBytes();
        if (callback !== undefined) {
            nodeRandomBytes(size, function (err, buf) { return callback(err, !!buf ? toLocalBufferImplementation_1(buf) : buf); });
            return;
        }
        var nodeBufferInst = nodeRandomBytes(size);
        return toLocalBufferImplementation_1(nodeBufferInst);
    }
    // phantomjs needs to throw
    if (size > MAX_UINT32) {
        throw new RangeError('requested too many random bytes');
    }
    var bytes = Buffer.allocUnsafe(size);
    if (size > 0) { // getRandomValues fails on IE if size == 0
        if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
            // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
            for (var generated = 0; generated < size; generated += MAX_BYTES) {
                // buffer.slice automatically checks if the end is past the end of
                // the buffer so we don't have to here
                getRandomValues(bytes.slice(generated, generated + MAX_BYTES));
            }
        }
        else {
            getRandomValues(bytes);
        }
    }
    if (typeof callback === "function") {
        /*
        NOTE:If liquid core it will crash, it's ok
        liquid core is not supposed to do anything async
        */
        setTimeout(function () { return callback(null, bytes); }, 0);
        return;
    }
    return bytes;
}
exports.randomBytes = randomBytes;
(function (randomBytes) {
    // limit of Crypto.getRandomValues()
    // https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
    randomBytes.MAX_BYTES = 65536;
    // Node supports requesting up to this number of bytes
    // https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
    randomBytes.MAX_UINT32 = 4294967295;
    randomBytes.getRandomValues = (function () {
        //NOTE: Used when in edge in a service worker or with LiquidCore.
        var nonCryptographicGetRandomValue = function (abv) {
            var l = abv.length;
            while (l--) {
                abv[l] = Math.floor(Math.random() * 256);
            }
            return abv;
        };
        var browserGetRandomValues = (function () {
            if (typeof crypto === "object" && !!crypto.getRandomValues) {
                return crypto.getRandomValues.bind(crypto);
            }
            else if (typeof msCrypto === "object" && !!msCrypto.getRandomValues) {
                return msCrypto.getRandomValues.bind(msCrypto);
            }
            else if (typeof self === "object" && typeof self.crypto === "object" && !!self.crypto.getRandomValues) {
                return self.crypto.getRandomValues.bind(self.crypto);
            }
            else {
                return undefined;
            }
        })();
        return !!browserGetRandomValues ?
            browserGetRandomValues :
            nonCryptographicGetRandomValue;
    })();
    randomBytes.getNodeRandomBytes = (function () {
        var nodeRandomBytes = undefined;
        return function () {
            if (nodeRandomBytes === undefined) {
                nodeRandomBytes = require("crypto" + "").randomBytes;
            }
            return nodeRandomBytes;
        };
    })();
})(randomBytes = exports.randomBytes || (exports.randomBytes = {}));

}).call(this,require("buffer").Buffer)
},{"./environnement":10,"buffer":15}],12:[function(require,module,exports){
(function (Buffer){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBuffer = void 0;
/**
 * The returned object is an instance of the global Buffer class.
 * ( toBuffer(data) instanceof Buffer === true )
 */
function toBuffer(uint8Array) {
    return Buffer.from(uint8Array.buffer, uint8Array.byteOffset, uint8Array.length);
}
exports.toBuffer = toBuffer;

}).call(this,require("buffer").Buffer)
},{"buffer":15}],13:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
var cryptoLib = require("../async");
var randomBytes_1 = require("../sync/utils/randomBytes");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var threadPoolId, testEncryptorDecryptor, _i, _a, keyLengthBytes, start, rsaKeys;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                threadPoolId = cryptoLib.workerThreadPool.Id.generate();
                cryptoLib.workerThreadPool.preSpawn(threadPoolId, 1);
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 9000); })];
            case 1:
                _b.sent();
                testEncryptorDecryptor = function (encryptorDecryptor) { return __awaiter(void 0, void 0, void 0, function () {
                    var start, plainData, plainDataAsHex, encryptedData, restoredPlainData;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                start = Date.now();
                                plainData = randomBytes_1.randomBytes(150);
                                console.log("randomBytes(150) duration: " + (Date.now() - start) + "ms");
                                plainDataAsHex = cryptoLib.toBuffer(plainData).toString("hex");
                                start = Date.now();
                                return [4 /*yield*/, encryptorDecryptor.encrypt(plainData)];
                            case 1:
                                encryptedData = _a.sent();
                                console.log("encrypt duration: " + (Date.now() - start) + "ms");
                                start = Date.now();
                                return [4 /*yield*/, encryptorDecryptor.decrypt(encryptedData)];
                            case 2:
                                restoredPlainData = _a.sent();
                                console.log("decrypt duration: " + (Date.now() - start) + "ms");
                                if (cryptoLib.toBuffer(restoredPlainData).toString("hex")
                                    !==
                                        plainDataAsHex) {
                                    throw new Error("fail");
                                }
                                return [2 /*return*/];
                        }
                    });
                }); };
                _i = 0, _a = [80, 128, 160, 255];
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                keyLengthBytes = _a[_i];
                console.log({ keyLengthBytes: keyLengthBytes }, "( " + keyLengthBytes * 8 + " bits )");
                start = Date.now();
                return [4 /*yield*/, cryptoLib.rsa.generateKeys(null, keyLengthBytes, cryptoLib.workerThreadPool.listIds(threadPoolId)[0])];
            case 3:
                rsaKeys = _b.sent();
                console.log("Rsa key generation duration: " + (Date.now() - start));
                console.log("encrypt with private key");
                return [4 /*yield*/, testEncryptorDecryptor(cryptoLib.rsa.encryptorDecryptorFactory(rsaKeys.privateKey, rsaKeys.publicKey, threadPoolId))];
            case 4:
                _b.sent();
                console.log("encrypt with public key");
                return [4 /*yield*/, testEncryptorDecryptor(cryptoLib.rsa.encryptorDecryptorFactory(rsaKeys.publicKey, rsaKeys.privateKey, threadPoolId))];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 2];
            case 7:
                cryptoLib.workerThreadPool.terminate(threadPoolId);
                console.log("PASS");
                return [2 /*return*/];
        }
    });
}); })();

},{"../async":6,"../sync/utils/randomBytes":11}],14:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],15:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)
},{"base64-js":14,"buffer":15,"ieee754":63}],16:[function(require,module,exports){
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
exports.Ctx = void 0;
var Set_1 = require("minimal-polyfills/Set");
var WeakMap_1 = require("minimal-polyfills/WeakMap");
var assert_1 = require("../tools/typeSafety/assert");
var typeGuard_1 = require("../tools/typeSafety/typeGuard");
var LazyEvt_1 = require("./LazyEvt");
var importProxy_1 = require("./importProxy");
var defineAccessors_1 = require("../tools/typeSafety/defineAccessors");
var overwriteReadonlyProp_1 = require("../tools/typeSafety/overwriteReadonlyProp");
var CtxImpl = /** @class */ (function () {
    function CtxImpl() {
        this.lazyEvtAttach = new LazyEvt_1.LazyEvt();
        this.lazyEvtDetach = new LazyEvt_1.LazyEvt();
        this.lazyEvtDoneOrAborted = new LazyEvt_1.LazyEvt();
        this.handlers = new Set_1.Polyfill();
        this.evtByHandler = new WeakMap_1.Polyfill();
    }
    CtxImpl.prototype.onDoneOrAborted = function (doneEvtData) {
        this.lazyEvtDoneOrAborted.post(doneEvtData);
    };
    CtxImpl.prototype.waitFor = function (timeout) {
        var _this_1 = this;
        return this.evtDoneOrAborted
            .waitFor(timeout)
            .then(function (data) {
            if (data.type === "ABORTED") {
                throw data.error;
            }
            return data.result;
        }, function (timeoutError) {
            _this_1.abort(timeoutError);
            throw timeoutError;
        });
    };
    CtxImpl.prototype.abort = function (error) {
        return this.__done(error);
    };
    CtxImpl.prototype.done = function (result) {
        return this.__done(undefined, result);
    };
    /** Detach all handler bound to this context from theirs respective Evt and post getEvtDone() */
    CtxImpl.prototype.__done = function (error, result) {
        var e_1, _a;
        var handlers = [];
        try {
            for (var _b = __values(this.handlers.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var handler = _c.value;
                var evt = this.evtByHandler.get(handler);
                var wasStillAttached = handler.detach();
                //NOTE: It should not be possible
                if (!wasStillAttached) {
                    continue;
                }
                handlers.push({ handler: handler, evt: evt });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.onDoneOrAborted(__assign(__assign({}, (!!error ?
            { type: "ABORTED", error: error } :
            { type: "DONE", "result": result })), { handlers: handlers }));
        return handlers;
    };
    CtxImpl.prototype.getHandlers = function () {
        var _this_1 = this;
        return Array.from(this.handlers.values())
            .map(function (handler) { return ({ handler: handler, "evt": _this_1.evtByHandler.get(handler) }); });
    };
    CtxImpl.prototype.zz__addHandler = function (handler, evt) {
        assert_1.assert(handler.ctx === this);
        assert_1.assert(typeGuard_1.typeGuard(handler));
        this.handlers.add(handler);
        this.evtByHandler.set(handler, evt);
        this.lazyEvtAttach.post({ handler: handler, evt: evt });
    };
    CtxImpl.prototype.zz__removeHandler = function (handler) {
        assert_1.assert(handler.ctx === this);
        assert_1.assert(typeGuard_1.typeGuard(handler));
        this.lazyEvtDetach.post({
            handler: handler,
            "evt": this.evtByHandler.get(handler)
        });
        this.handlers["delete"](handler);
    };
    CtxImpl.__1 = (function () {
        if (false) {
            CtxImpl.__1;
        }
        defineAccessors_1.defineAccessors(CtxImpl.prototype, "evtDoneOrAborted", {
            "get": function () {
                return this.lazyEvtDoneOrAborted.evt;
            }
        });
        defineAccessors_1.defineAccessors(CtxImpl.prototype, "evtAttach", {
            "get": function () {
                return this.lazyEvtAttach.evt;
            }
        });
        defineAccessors_1.defineAccessors(CtxImpl.prototype, "evtDetach", {
            "get": function () {
                return this.lazyEvtDetach.evt;
            }
        });
    })();
    return CtxImpl;
}());
exports.Ctx = CtxImpl;
try {
    overwriteReadonlyProp_1.overwriteReadonlyProp(exports.Ctx, "name", "Ctx");
}
catch (_a) { }
importProxy_1.importProxy.Ctx = exports.Ctx;

},{"../tools/typeSafety/assert":51,"../tools/typeSafety/defineAccessors":52,"../tools/typeSafety/overwriteReadonlyProp":58,"../tools/typeSafety/typeGuard":59,"./LazyEvt":29,"./importProxy":32,"minimal-polyfills/Set":68,"minimal-polyfills/WeakMap":69}],17:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.asNonPostable = void 0;
/** https://docs.evt.land/api/evt/asnonpostable */
function asNonPostable(evt) {
    return evt;
}
exports.asNonPostable = asNonPostable;

},{}],18:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.asPostable = void 0;
/**
 * https://docs.evt.land/api/evt/aspostable
 * ⚠ UNSAFE ⚠ - Please refer to documentation before using.
 * */
function asPostable(evt) {
    return evt;
}
exports.asPostable = asPostable;

},{}],19:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.create = void 0;
var importProxy_1 = require("./importProxy");
function create() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.length === 0 ?
        new importProxy_1.importProxy.Evt() :
        new importProxy_1.importProxy.StatefulEvt(args[0]);
}
exports.create = create;

},{"./importProxy":32}],20:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.factorize = void 0;
/** https://docs.evt.land/api/evt/factorize */
function factorize(evt) {
    return evt;
}
exports.factorize = factorize;
/*
import { Evt } from "./Evt";
const x: Evt<boolean> = loosenType(new Evt<true>()); x;
const y: Evt<boolean> = loosenType(new Evt<number>()); y;
*/ 

},{}],21:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.from = void 0;
var id_1 = require("../tools/typeSafety/id");
var assert_1 = require("../tools/typeSafety/assert");
var typeGuard_1 = require("../tools/typeSafety/typeGuard");
var EventTargetLike_1 = require("./types/EventTargetLike");
var Evt_merge_1 = require("./Evt.merge");
var importProxy_1 = require("./importProxy");
function fromImpl(ctx, target, eventName, options) {
    var matchEventTargetLike = function (target_) {
        return EventTargetLike_1.EventTargetLike.canBe(target_);
    };
    if (!matchEventTargetLike(target)) {
        if ("then" in target) {
            var evt_1 = new importProxy_1.importProxy.Evt();
            var isCtxDone_1 = (function () {
                var getEvtDonePostCount = function () { return ctx === null || ctx === void 0 ? void 0 : ctx.evtDoneOrAborted.postCount; };
                var n = getEvtDonePostCount();
                return function () { return n !== getEvtDonePostCount(); };
            })();
            target.then(function (data) {
                if (isCtxDone_1()) {
                    return;
                }
                evt_1.post(data);
            });
            return evt_1;
        }
        return Evt_merge_1.mergeImpl(ctx, Array.from(target).map(function (target) { return fromImpl(ctx, target, eventName, options); }));
    }
    var proxy;
    if (EventTargetLike_1.EventTargetLike.NodeStyleEventEmitter.match(target)) {
        proxy = {
            "on": function (listener, eventName) { return target.addListener(eventName, listener); },
            "off": function (listener, eventName) { return target.removeListener(eventName, listener); }
        };
    }
    else if (EventTargetLike_1.EventTargetLike.JQueryStyleEventEmitter.match(target)) {
        proxy = {
            "on": function (listener, eventName) { return target.on(eventName, listener); },
            "off": function (listener, eventName) { return target.off(eventName, listener); }
        };
    }
    else if (EventTargetLike_1.EventTargetLike.HasEventTargetAddRemove.match(target)) {
        proxy = {
            "on": function (listener, eventName, options) { return target.addEventListener(eventName, listener, options); },
            "off": function (listener, eventName, options) { return target.removeEventListener(eventName, listener, options); }
        };
    }
    else if (EventTargetLike_1.EventTargetLike.RxJSSubject.match(target)) {
        var subscription_1;
        proxy = {
            "on": function (listener) { return subscription_1 = target.subscribe(function (data) { return listener(data); }); },
            "off": function () { return subscription_1.unsubscribe(); }
        };
    }
    else {
        id_1.id(target);
        assert_1.assert(false);
    }
    var evt = new importProxy_1.importProxy.Evt();
    var listener = function (data) { return evt.post(data); };
    ctx === null || ctx === void 0 ? void 0 : ctx.evtDoneOrAborted.attachOnce(function () { return proxy.off(listener, eventName, options); });
    proxy.on(listener, eventName, options);
    return evt;
}
function from(ctxOrTarget, targetOrEventName, eventNameOrOptions, options) {
    if ("evtDoneOrAborted" in ctxOrTarget) {
        assert_1.assert(typeGuard_1.typeGuard(targetOrEventName) &&
            typeGuard_1.typeGuard(eventNameOrOptions) &&
            typeGuard_1.typeGuard(options));
        return fromImpl(ctxOrTarget, targetOrEventName, eventNameOrOptions, options);
    }
    else {
        assert_1.assert(typeGuard_1.typeGuard(targetOrEventName) &&
            typeGuard_1.typeGuard(eventNameOrOptions));
        return fromImpl(undefined, ctxOrTarget, targetOrEventName, eventNameOrOptions);
    }
}
exports.from = from;

},{"../tools/typeSafety/assert":51,"../tools/typeSafety/id":54,"../tools/typeSafety/typeGuard":59,"./Evt.merge":25,"./importProxy":32,"./types/EventTargetLike":34}],22:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.getCtxFactory = void 0;
var WeakMap_1 = require("minimal-polyfills/WeakMap");
var importProxy_1 = require("./importProxy");
/**
 * https://docs.evt.land/api/evt/getctx
 *
 * Evt.weakCtx(obj) always return the same instance of VoidCtx for a given object.
 * No strong reference to the object is created
 * when the object is no longer referenced it's associated Ctx will be freed from memory.
 */
function getCtxFactory() {
    var ctxByObj = new WeakMap_1.Polyfill();
    function getCtx(obj) {
        var ctx = ctxByObj.get(obj);
        if (ctx === undefined) {
            ctx = (new importProxy_1.importProxy.Ctx());
            ctxByObj.set(obj, ctx);
        }
        return ctx;
    }
    return getCtx;
}
exports.getCtxFactory = getCtxFactory;

},{"./importProxy":32,"minimal-polyfills/WeakMap":69}],23:[function(require,module,exports){
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
exports.Evt = void 0;
require("minimal-polyfills/Array.prototype.find");
var importProxy_1 = require("./importProxy");
var Evt_create_1 = require("./Evt.create");
var Evt_getCtx_1 = require("./Evt.getCtx");
var Evt_factorize_1 = require("./Evt.factorize");
var Evt_merge_1 = require("./Evt.merge");
var Evt_from_1 = require("./Evt.from");
var Evt_useEffect_1 = require("./Evt.useEffect");
var Evt_asPostable_1 = require("./Evt.asPostable");
var Evt_asNonPostable_1 = require("./Evt.asNonPostable");
var Evt_parsePropsFromArgs_1 = require("./Evt.parsePropsFromArgs");
var Evt_newCtx_1 = require("./Evt.newCtx");
var LazyEvt_1 = require("./LazyEvt");
var defineAccessors_1 = require("../tools/typeSafety/defineAccessors");
var invokeOperator_1 = require("./util/invokeOperator");
var Map_1 = require("minimal-polyfills/Map");
var WeakMap_1 = require("minimal-polyfills/WeakMap");
var runExclusive = require("run-exclusive");
var EvtError_1 = require("./types/EvtError");
var overwriteReadonlyProp_1 = require("../tools/typeSafety/overwriteReadonlyProp");
var typeGuard_1 = require("../tools/typeSafety/typeGuard");
var encapsulateOpState_1 = require("./util/encapsulateOpState");
var Deferred_1 = require("../tools/Deferred");
var Evt_loosenType_1 = require("./Evt.loosenType");
var CtxLike_1 = require("./types/interfaces/CtxLike");
var safeSetTimeout_1 = require("../tools/safeSetTimeout");
var Operator_1 = require("./types/Operator");
var EvtImpl = /** @class */ (function () {
    function EvtImpl() {
        this.lazyEvtAttach = new LazyEvt_1.LazyEvt();
        this.lazyEvtDetach = new LazyEvt_1.LazyEvt();
        this.__maxHandlers = undefined;
        this.postCount = 0;
        this.traceId = null;
        this.handlers = [];
        this.handlerTriggers = new Map_1.Polyfill();
        /*
        NOTE: Used as Date.now() would be used to compare if an event is anterior
        or posterior to an other. We don't use Date.now() because two call within
        less than a ms will return the same value unlike this function.
        */
        this.__currentChronologyMark = 0;
        this.asyncHandlerCount = 0;
    }
    EvtImpl.setDefaultMaxHandlers = function (n) {
        this.__defaultMaxHandlers = isFinite(n) ? n : 0;
    };
    EvtImpl.prototype.toStateful = function (p1, p2) {
        var isP1Ctx = CtxLike_1.CtxLike.match(p1);
        var initialValue = isP1Ctx ? undefined : p1;
        var ctx = p2 || (isP1Ctx ? p1 : undefined);
        var out = new importProxy_1.importProxy.StatefulEvt(initialValue);
        var callback = function (data) { return out.post(data); };
        if (!!ctx) {
            this.attach(ctx, callback);
        }
        else {
            this.attach(callback);
        }
        return out;
    };
    EvtImpl.prototype.setMaxHandlers = function (n) {
        this.__maxHandlers = isFinite(n) ? n : 0;
        return this;
    };
    EvtImpl.prototype.enableTrace = function (params
    //NOTE: Not typeof console.log as we don't want to expose types from node
    ) {
        var id = params.id, formatter = params.formatter, log = params.log;
        this.traceId = id;
        this.traceFormatter = formatter || (function (data) {
            try {
                return JSON.stringify(data, null, 2);
            }
            catch (_a) {
                return "" + data;
            }
        });
        this.log =
            log === undefined ?
                (function () {
                    var inputs = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        inputs[_i] = arguments[_i];
                    }
                    return console.log.apply(console, __spread(inputs));
                }) :
                log === false ? undefined : log;
    };
    EvtImpl.prototype.disableTrace = function () {
        this.traceId = null;
        return this;
    };
    EvtImpl.prototype.getChronologyMark = function () {
        return this.__currentChronologyMark++;
    };
    EvtImpl.prototype.detachHandler = function (handler, wTimer, rejectPr) {
        var index = this.handlers.indexOf(handler);
        if (index < 0) {
            return false;
        }
        if (typeGuard_1.typeGuard(handler, !!handler.ctx)) {
            handler.ctx.zz__removeHandler(handler);
        }
        this.handlers.splice(index, 1);
        if (handler.async) {
            this.asyncHandlerCount--;
        }
        this.handlerTriggers["delete"](handler);
        if (wTimer[0] !== undefined) {
            safeSetTimeout_1.safeClearTimeout(wTimer[0]);
            rejectPr(new EvtError_1.EvtError.Detached());
        }
        this.lazyEvtDetach.post(handler);
        return true;
    };
    EvtImpl.prototype.triggerHandler = function (handler, wTimer, resolvePr, opResult) {
        var callback = handler.callback, once = handler.once;
        if (wTimer[0] !== undefined) {
            safeSetTimeout_1.safeClearTimeout(wTimer[0]);
            wTimer[0] = undefined;
        }
        EvtImpl.doDetachIfNeeded(handler, opResult, once);
        var _a = __read(opResult, 1), transformedData = _a[0];
        callback === null || callback === void 0 ? void 0 : callback.call(this, transformedData);
        resolvePr === null || resolvePr === void 0 ? void 0 : resolvePr(transformedData);
    };
    EvtImpl.prototype.addHandler = function (propsFromArgs, propsFromMethodName) {
        var _this_1 = this;
        if (Operator_1.Operator.fλ.Stateful.match(propsFromArgs.op)) {
            this.statelessByStatefulOp.set(propsFromArgs.op, encapsulateOpState_1.encapsulateOpState(propsFromArgs.op));
        }
        var d = new Deferred_1.Deferred();
        var wTimer = [undefined];
        var handler = __assign(__assign(__assign({}, propsFromArgs), propsFromMethodName), { "detach": function () { return _this_1.detachHandler(handler, wTimer, d.reject); }, "promise": d.pr });
        if (typeof handler.timeout === "number") {
            wTimer[0] = safeSetTimeout_1.safeSetTimeout(function () {
                wTimer[0] = undefined;
                handler.detach();
                d.reject(new EvtError_1.EvtError.Timeout(handler.timeout));
            }, handler.timeout);
        }
        this.handlerTriggers.set(handler, function (opResult) { return _this_1.triggerHandler(handler, wTimer, d.isPending ? d.resolve : undefined, opResult); });
        if (handler.async) {
            this.asyncHandlerChronologyMark.set(handler, this.getChronologyMark());
        }
        if (handler.prepend) {
            var i = void 0;
            for (i = 0; i < this.handlers.length; i++) {
                if (this.handlers[i].extract) {
                    continue;
                }
                break;
            }
            this.handlers.splice(i, 0, handler);
        }
        else {
            this.handlers.push(handler);
        }
        if (handler.async) {
            this.asyncHandlerCount++;
        }
        this.checkForPotentialMemoryLeak();
        if (typeGuard_1.typeGuard(handler, !!handler.ctx)) {
            handler.ctx.zz__addHandler(handler, this);
        }
        this.lazyEvtAttach.post(handler);
        return handler;
    };
    EvtImpl.prototype.checkForPotentialMemoryLeak = function () {
        var maxHandlers = this.__maxHandlers !== undefined ?
            this.__maxHandlers :
            EvtImpl.__defaultMaxHandlers;
        if (maxHandlers === 0 ||
            this.handlers.length % (maxHandlers + 1) !== 0) {
            return;
        }
        var message = [
            "MaxHandlersExceededWarning: Possible Evt memory leak detected.",
            this.handlers.length + " handlers attached" + (this.traceId ? " to \"" + this.traceId + "\"" : "") + ".\n",
            "Use Evt.prototype.setMaxHandlers(n) to increase limit on a specific Evt.\n",
            "Use Evt.setDefaultMaxHandlers(n) to change the default limit currently set to " + EvtImpl.__defaultMaxHandlers + ".\n",
        ].join("");
        var map = new Map_1.Polyfill();
        this.getHandlers()
            .map(function (_a) {
            var ctx = _a.ctx, async = _a.async, once = _a.once, prepend = _a.prepend, extract = _a.extract, op = _a.op, callback = _a.callback;
            return (__assign(__assign({ "hasCtx": !!ctx, once: once,
                prepend: prepend,
                extract: extract, "isWaitFor": async }, (op === Evt_parsePropsFromArgs_1.matchAll ? {} : { "op": op.toString() })), (!callback ? {} : { "callback": callback.toString() })));
        })
            .map(function (obj) {
            return "{\n" + Object.keys(obj)
                .map(function (key) { return "  " + key + ": " + obj[key]; })
                .join(",\n") + "\n}";
        })
            .forEach(function (str) { return map.set(str, (map.has(str) ? map.get(str) : 0) + 1); });
        message += "\n" + Array.from(map.keys())
            .map(function (str) { return map.get(str) + " handler" + (map.get(str) === 1 ? "" : "s") + " like:\n" + str; })
            .join("\n") + "\n";
        if (this.traceId === null) {
            message += "\n" + [
                "To validate the identify of the Evt instance that is triggering this warning you can call",
                "Evt.prototype.enableTrace({ \"id\": \"My evt id\", \"log\": false }) on the Evt that you suspect.\n"
            ].join(" ");
        }
        try {
            console.warn(message);
        }
        catch (_a) {
        }
    };
    EvtImpl.prototype.getStatelessOp = function (op) {
        return Operator_1.Operator.fλ.Stateful.match(op) ?
            this.statelessByStatefulOp.get(op) :
            op;
    };
    EvtImpl.prototype.trace = function (data) {
        var _this_1 = this;
        var _a;
        if (this.traceId === null) {
            return;
        }
        var message = "(" + this.traceId + ") ";
        var isExtracted = !!this.handlers.find(function (_a) {
            var extract = _a.extract, op = _a.op;
            return (extract &&
                !!_this_1.getStatelessOp(op)(data));
        });
        if (isExtracted) {
            message += "extracted ";
        }
        else {
            var handlerCount = this.handlers
                .filter(function (_a) {
                var extract = _a.extract, op = _a.op;
                return !extract &&
                    !!_this_1.getStatelessOp(op)(data);
            })
                .length;
            message += handlerCount + " handler" + ((handlerCount > 1) ? "s" : "") + ", ";
        }
        (_a = this.log) === null || _a === void 0 ? void 0 : _a.call(this, message + this.traceFormatter(data));
    };
    /** Return isExtracted */
    EvtImpl.prototype.postSync = function (data) {
        var e_1, _a;
        try {
            for (var _b = __values(__spread(this.handlers)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var handler = _c.value;
                var async = handler.async, op = handler.op, extract = handler.extract;
                if (async) {
                    continue;
                }
                var opResult = invokeOperator_1.invokeOperator(this.getStatelessOp(op), data, true);
                if (Operator_1.Operator.fλ.Result.NotMatched.match(opResult)) {
                    EvtImpl.doDetachIfNeeded(handler, opResult);
                    continue;
                }
                var handlerTrigger = this.handlerTriggers.get(handler);
                //NOTE: Possible if detached while in the loop.
                if (!handlerTrigger) {
                    continue;
                }
                handlerTrigger(opResult);
                if (extract) {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    };
    EvtImpl.prototype.postAsyncFactory = function () {
        var _this_1 = this;
        return runExclusive.buildMethodCb(function (data, postChronologyMark, releaseLock) {
            var e_2, _a;
            if (_this_1.asyncHandlerCount === 0) {
                releaseLock();
                return;
            }
            var promises = [];
            var chronologyMarkStartResolveTick;
            //NOTE: Must be before handlerTrigger call.
            Promise.resolve().then(function () { return chronologyMarkStartResolveTick = _this_1.getChronologyMark(); });
            var _loop_1 = function (handler) {
                if (!handler.async) {
                    return "continue";
                }
                var opResult = invokeOperator_1.invokeOperator(_this_1.getStatelessOp(handler.op), data, true);
                if (Operator_1.Operator.fλ.Result.NotMatched.match(opResult)) {
                    EvtImpl.doDetachIfNeeded(handler, opResult);
                    return "continue";
                }
                var handlerTrigger = _this_1.handlerTriggers.get(handler);
                if (!handlerTrigger) {
                    return "continue";
                }
                var shouldCallHandlerTrigger = (function () {
                    var handlerMark = _this_1.asyncHandlerChronologyMark.get(handler);
                    if (postChronologyMark > handlerMark) {
                        return true;
                    }
                    var exceptionRange = _this_1.asyncHandlerChronologyExceptionRange.get(handler);
                    return (exceptionRange !== undefined &&
                        exceptionRange.lowerMark < postChronologyMark &&
                        postChronologyMark < exceptionRange.upperMark &&
                        handlerMark > exceptionRange.upperMark);
                })();
                if (!shouldCallHandlerTrigger) {
                    return "continue";
                }
                promises.push(new Promise(function (resolve) { return handler.promise
                    .then(function () { return resolve(); })["catch"](function () { return resolve(); }); }));
                handlerTrigger(opResult);
            };
            try {
                for (var _b = __values(__spread(_this_1.handlers)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var handler = _c.value;
                    _loop_1(handler);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            if (promises.length === 0) {
                releaseLock();
                return;
            }
            var handlersDump = __spread(_this_1.handlers);
            Promise.all(promises).then(function () {
                var e_3, _a;
                try {
                    for (var _b = __values(_this_1.handlers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var handler = _c.value;
                        if (!handler.async) {
                            continue;
                        }
                        if (handlersDump.indexOf(handler) >= 0) {
                            continue;
                        }
                        _this_1.asyncHandlerChronologyExceptionRange.set(handler, {
                            "lowerMark": postChronologyMark,
                            "upperMark": chronologyMarkStartResolveTick
                        });
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                releaseLock();
            });
        });
    };
    EvtImpl.prototype.isHandled = function (data) {
        var _this_1 = this;
        return !!this.getHandlers()
            .find(function (_a) {
            var op = _a.op;
            return !!_this_1.getStatelessOp(op)(data);
        });
    };
    EvtImpl.prototype.getHandlers = function () {
        return __spread(this.handlers);
    };
    EvtImpl.prototype.detach = function (ctx) {
        var e_4, _a;
        var detachedHandlers = [];
        try {
            for (var _b = __values(this.getHandlers()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var handler = _c.value;
                if (ctx !== undefined && handler.ctx !== ctx) {
                    continue;
                }
                var wasStillAttached = handler.detach();
                //NOTE: It should not be possible.
                if (!wasStillAttached) {
                    continue;
                }
                detachedHandlers.push(handler);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return detachedHandlers;
    };
    EvtImpl.prototype.pipe = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var evtDelegate = new EvtImpl();
        this.addHandler(__assign(__assign({}, Evt_parsePropsFromArgs_1.parsePropsFromArgs(args, "pipe")), { "callback": function (transformedData) { return evtDelegate.post(transformedData); } }), EvtImpl.propsFormMethodNames.attach);
        return evtDelegate;
    };
    EvtImpl.prototype.waitFor = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.addHandler(Evt_parsePropsFromArgs_1.parsePropsFromArgs(args, "waitFor"), EvtImpl.propsFormMethodNames.waitFor).promise;
    };
    EvtImpl.prototype.$attach = function () {
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        return this.attach.apply(this, __spread(inputs));
    };
    EvtImpl.prototype.attach = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.__attachX(args, "attach");
    };
    EvtImpl.prototype.$attachOnce = function () {
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        return this.attachOnce.apply(this, __spread(inputs));
    };
    EvtImpl.prototype.attachOnce = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.__attachX(args, "attachOnce");
    };
    EvtImpl.prototype.$attachExtract = function () {
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        return this.attachExtract.apply(this, __spread(inputs));
    };
    EvtImpl.prototype.attachExtract = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.__attachX(args, "attachExtract");
    };
    EvtImpl.prototype.$attachPrepend = function () {
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        return this.attachPrepend.apply(this, __spread(inputs));
    };
    EvtImpl.prototype.attachPrepend = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.__attachX(args, "attachPrepend");
    };
    EvtImpl.prototype.$attachOncePrepend = function () {
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        return this.attachOncePrepend.apply(this, __spread(inputs));
    };
    EvtImpl.prototype.attachOncePrepend = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.__attachX(args, "attachOncePrepend");
    };
    EvtImpl.prototype.$attachOnceExtract = function () {
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        return this.attachOnceExtract.apply(this, __spread(inputs));
    };
    EvtImpl.prototype.attachOnceExtract = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.__attachX(args, "attachOnceExtract");
    };
    EvtImpl.prototype.__attachX = function (args, methodName) {
        var propsFromArgs = Evt_parsePropsFromArgs_1.parsePropsFromArgs(args, "attach*");
        var handler = this.addHandler(propsFromArgs, EvtImpl.propsFormMethodNames[methodName]);
        return propsFromArgs.timeout === undefined ?
            this :
            handler.promise;
    };
    EvtImpl.prototype.postAsyncOnceHandled = function (data) {
        var _this_1 = this;
        if (this.isHandled(data)) {
            return this.post(data);
        }
        var d = new Deferred_1.Deferred();
        this.evtAttach.attachOnce(function (_a) {
            var op = _a.op;
            return !!invokeOperator_1.invokeOperator(_this_1.getStatelessOp(op), data);
        }, function () { return Promise.resolve().then(function () { return d.resolve(_this_1.post(data)); }); });
        return d.pr;
    };
    EvtImpl.prototype.post = function (data) {
        this.trace(data);
        overwriteReadonlyProp_1.overwriteReadonlyProp(this, "postCount", this.postCount + 1);
        //NOTE: Must be before postSync.
        var postChronologyMark = this.getChronologyMark();
        var isExtracted = this.postSync(data);
        if (isExtracted) {
            return this.postCount;
        }
        if (this.postAsync === undefined) {
            if (this.asyncHandlerCount === 0) {
                return this.postCount;
            }
            this.postAsync = this.postAsyncFactory();
        }
        this.postAsync(data, postChronologyMark);
        return this.postCount;
    };
    EvtImpl.create = Evt_create_1.create;
    EvtImpl.newCtx = Evt_newCtx_1.newCtx;
    EvtImpl.merge = Evt_merge_1.merge;
    EvtImpl.from = Evt_from_1.from;
    EvtImpl.useEffect = Evt_useEffect_1.useEffect;
    EvtImpl.getCtx = Evt_getCtx_1.getCtxFactory();
    EvtImpl.loosenType = Evt_loosenType_1.loosenType;
    EvtImpl.factorize = Evt_factorize_1.factorize;
    EvtImpl.asPostable = Evt_asPostable_1.asPostable;
    EvtImpl.asNonPostable = Evt_asNonPostable_1.asNonPostable;
    EvtImpl.__defaultMaxHandlers = 25;
    EvtImpl.__1 = (function () {
        if (false) {
            EvtImpl.__1;
        }
        defineAccessors_1.defineAccessors(EvtImpl.prototype, "evtAttach", {
            "get": function () {
                return this.lazyEvtAttach.evt;
            }
        });
        defineAccessors_1.defineAccessors(EvtImpl.prototype, "evtDetach", {
            "get": function () {
                return this.lazyEvtDetach.evt;
            }
        });
    })();
    EvtImpl.__2 = (function () {
        if (false) {
            EvtImpl.__2;
        }
        Object.defineProperties(EvtImpl.prototype, [
            "__asyncHandlerChronologyMark",
            "__asyncHandlerChronologyExceptionRange",
            "__statelessByStatefulOp"
        ].map(function (key) { return [
            key.substr(2),
            {
                "get": function () {
                    if (this[key] === undefined) {
                        this[key] = new WeakMap_1.Polyfill();
                    }
                    return this[key];
                }
            }
        ]; }).reduce(function (prev, _a) {
            var _b;
            var _c = __read(_a, 2), key = _c[0], obj = _c[1];
            return (__assign(__assign({}, prev), (_b = {}, _b[key] = obj, _b)));
        }, {}));
    })();
    EvtImpl.propsFormMethodNames = {
        "waitFor": { "async": true, "extract": false, "once": true, "prepend": false },
        "attach": { "async": false, "extract": false, "once": false, "prepend": false },
        "attachExtract": { "async": false, "extract": true, "once": false, "prepend": true },
        "attachPrepend": { "async": false, "extract": false, "once": false, "prepend": true },
        "attachOnce": { "async": false, "extract": false, "once": true, "prepend": false },
        "attachOncePrepend": { "async": false, "extract": false, "once": true, "prepend": true },
        "attachOnceExtract": { "async": false, "extract": true, "once": true, "prepend": true }
    };
    return EvtImpl;
}());
(function (EvtImpl) {
    function doDetachIfNeeded(handler, opResult, once) {
        var detach = Operator_1.Operator.fλ.Result.getDetachArg(opResult);
        if (typeof detach !== "boolean") {
            var _a = __read(detach, 3), ctx = _a[0], error = _a[1], res = _a[2];
            if (!!error) {
                ctx.abort(error);
            }
            else {
                ctx.done(res);
            }
        }
        else if (detach || !!once) {
            handler.detach();
        }
    }
    EvtImpl.doDetachIfNeeded = doDetachIfNeeded;
})(EvtImpl || (EvtImpl = {}));
exports.Evt = EvtImpl;
try {
    overwriteReadonlyProp_1.overwriteReadonlyProp(exports.Evt, "name", "Evt");
}
catch (_a) { }
importProxy_1.importProxy.Evt = exports.Evt;

},{"../tools/Deferred":49,"../tools/safeSetTimeout":50,"../tools/typeSafety/defineAccessors":52,"../tools/typeSafety/overwriteReadonlyProp":58,"../tools/typeSafety/typeGuard":59,"./Evt.asNonPostable":17,"./Evt.asPostable":18,"./Evt.create":19,"./Evt.factorize":20,"./Evt.from":21,"./Evt.getCtx":22,"./Evt.loosenType":24,"./Evt.merge":25,"./Evt.newCtx":26,"./Evt.parsePropsFromArgs":27,"./Evt.useEffect":28,"./LazyEvt":29,"./importProxy":32,"./types/EvtError":35,"./types/Operator":36,"./types/interfaces/CtxLike":39,"./util/encapsulateOpState":43,"./util/invokeOperator":48,"minimal-polyfills/Array.prototype.find":65,"minimal-polyfills/Map":66,"minimal-polyfills/WeakMap":69,"run-exclusive":72}],24:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.loosenType = void 0;
/**
 * https://docs.evt.land/api/evt/loosenType
 */
function loosenType(evt) {
    return evt;
}
exports.loosenType = loosenType;
/*
import { Evt } from "./Evt";
const x: Evt<boolean> = loosenType(new Evt<true>()); x;
const y: Evt<boolean> = loosenType(new Evt<number>()); y;
*/

},{}],25:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.merge = exports.mergeImpl = void 0;
var importProxy_1 = require("./importProxy");
function mergeImpl(ctx, evts) {
    var evtUnion = new importProxy_1.importProxy.Evt();
    var callback = function (data) { return evtUnion.post(data); };
    evts.forEach(function (evt) {
        if (ctx === undefined) {
            evt.attach(callback);
        }
        else {
            evt.attach(ctx, callback);
        }
    });
    return evtUnion;
}
exports.mergeImpl = mergeImpl;
function merge(p1, p2) {
    return "length" in p1 ?
        mergeImpl(undefined, p1) :
        mergeImpl(p1, p2);
}
exports.merge = merge;

},{"./importProxy":32}],26:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.newCtx = void 0;
var importProxy_1 = require("./importProxy");
function newCtx() {
    return new importProxy_1.importProxy.Ctx();
}
exports.newCtx = newCtx;

},{"./importProxy":32}],27:[function(require,module,exports){
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
exports.parsePropsFromArgs = exports.matchAll = void 0;
var id_1 = require("../tools/typeSafety/id");
var compose_1 = require("./util/compose");
var typeGuard_1 = require("../tools/typeSafety/typeGuard");
function matchAll() { return true; }
exports.matchAll = matchAll;
var canBeOperator = function (p) {
    return (p !== undefined &&
        typeGuard_1.typeGuard(p) &&
        (typeof p === "function" ||
            typeof p[0] === "function"));
};
var defaultParams = {
    "op": matchAll,
    "ctx": undefined,
    "timeout": undefined,
    "callback": undefined
};
function parsePropsFromArgs(inputs, methodName) {
    typeGuard_1.typeGuard(defaultParams);
    switch (methodName) {
        case "pipe":
            {
                //[]
                //[undefined] ( not valid but user would expect it to work )
                //[ ctx, ...op[] ]
                //[ ...op[] ]
                var getOpWrap = function (ops) {
                    return ops.length === 0 ?
                        {}
                        :
                            { "op": ops.length === 1 ? ops[0] : compose_1.compose.apply(void 0, __spread(ops)) };
                };
                if (canBeOperator(inputs[0])) {
                    //[ ...op[] ]
                    return id_1.id(__assign(__assign({}, defaultParams), getOpWrap(inputs)));
                }
                else {
                    //[]
                    //[ ctx, ...Operator.fλ[] ]
                    var _a = __read(inputs), ctx = _a[0], rest = _a.slice(1);
                    return id_1.id(__assign(__assign(__assign({}, defaultParams), (ctx !== undefined ? { ctx: ctx } : {})), getOpWrap(rest)));
                }
            }
            break;
        case "waitFor":
            {
                //[ op, ctx, timeout ]
                //[ op, ctx, undefined ]
                //[ op, ctx ]
                //[ op, timeout ]
                //[ op, undefined ]
                //[ ctx, timeout ]
                //[ ctx, undefined ]
                //[ op ]
                //[ ctx ]
                //[ timeout ]
                //[ undefined ]
                //[ callback ]
                return parsePropsFromArgs(__spread(inputs.filter(function (value, index) { return !(index === inputs.length - 1 &&
                    value === undefined); }), [
                    defaultParams.callback
                ]), "attach*");
            }
            break;
        case "attach*":
            {
                //NOTE: when callback is undefined call has been forward from waitFor.
                //[ op, ctx, timeout, callback ]
                //[ op, ctx, timeout, undefined ]
                //[ op, ctx, callback ]
                //[ op, ctx, undefined ]
                //[ op, timeout, callback ]
                //[ op, timeout, undefined ]
                //[ ctx, timeout, callback ]
                //[ ctx, timeout, undefined ]
                //[ op, callback ]
                //[ op, undefined ]
                //[ ctx, callback ]
                //[ ctx, undefined ]
                //[ timeout, callback ]
                //[ timeout, undefined ]
                //[ callback ]
                //[ undefined ]
                var n = inputs.length;
                switch (n) {
                    case 4: {
                        //[ op, ctx, timeout, callback ]
                        var _b = __read(inputs, 4), p1 = _b[0], p2 = _b[1], p3 = _b[2], p4 = _b[3];
                        return id_1.id(__assign(__assign({}, defaultParams), { "op": p1, "ctx": p2, "timeout": p3, "callback": p4 }));
                    }
                    case 3: {
                        //[ op, ctx, callback ]
                        //[ op, timeout, callback ]
                        //[ ctx, timeout, callback ]
                        var _c = __read(inputs, 3), p1 = _c[0], p2 = _c[1], p3 = _c[2];
                        if (typeof p2 === "number") {
                            //[ op, timeout, callback ]
                            //[ ctx, timeout, callback ]
                            var timeout = p2;
                            var callback = p3;
                            if (canBeOperator(p1)) {
                                //[ op, timeout, callback ]
                                return id_1.id(__assign(__assign({}, defaultParams), { timeout: timeout,
                                    callback: callback, "op": p1 }));
                            }
                            else {
                                //[ ctx, timeout, callback ]
                                return id_1.id(__assign(__assign({}, defaultParams), { timeout: timeout,
                                    callback: callback, "ctx": p1 }));
                            }
                        }
                        else {
                            //[ op, ctx, callback ]
                            return id_1.id(__assign(__assign({}, defaultParams), { "op": p1, "ctx": p2, "callback": p3 }));
                        }
                    }
                    case 2: {
                        //[ op, callback ]
                        //[ ctx, callback ]
                        //[ timeout, callback ]
                        var _d = __read(inputs, 2), p1 = _d[0], p2 = _d[1];
                        if (typeof p1 === "number") {
                            //[ timeout, callback ]
                            return id_1.id(__assign(__assign({}, defaultParams), { "timeout": p1, "callback": p2 }));
                        }
                        else {
                            //[ op, callback ]
                            //[ ctx, callback ]
                            var callback = p2;
                            if (canBeOperator(p1)) {
                                return id_1.id(__assign(__assign({}, defaultParams), { callback: callback, "op": p1 }));
                            }
                            else {
                                return id_1.id(__assign(__assign({}, defaultParams), { callback: callback, "ctx": p1 }));
                            }
                        }
                    }
                    case 1: {
                        //[ callback ]
                        var _e = __read(inputs, 1), p = _e[0];
                        return id_1.id(__assign(__assign({}, defaultParams), { "callback": p }));
                    }
                    case 0: {
                        return id_1.id(__assign({}, defaultParams));
                    }
                }
            }
            break;
    }
}
exports.parsePropsFromArgs = parsePropsFromArgs;

},{"../tools/typeSafety/id":54,"../tools/typeSafety/typeGuard":59,"./util/compose":42}],28:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.useEffect = void 0;
function useEffect(effect, evt, dataFirst) {
    var i = 0;
    ("state" in evt ? evt.evtChange : evt)
        .attach(function (data) {
        return effect(data, { "isFirst": false, data: data }, i++);
    });
    effect("state" in evt ? evt.state : dataFirst === null || dataFirst === void 0 ? void 0 : dataFirst[0], { "isFirst": true }, i++);
}
exports.useEffect = useEffect;

},{}],29:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.LazyEvt = void 0;
var overwriteReadonlyProp_1 = require("../tools/typeSafety/overwriteReadonlyProp");
var importProxy_1 = require("./importProxy");
var defineAccessors_1 = require("../tools/typeSafety/defineAccessors");
var LazyEvt = /** @class */ (function () {
    function LazyEvt() {
        this.initialPostCount = 0;
    }
    LazyEvt.prototype.post = function (data) {
        if (this.__evt === undefined) {
            return ++this.initialPostCount;
        }
        return this.__evt.post(data);
    };
    LazyEvt.__1 = (function () {
        if (false) {
            LazyEvt.__1;
        }
        defineAccessors_1.defineAccessors(LazyEvt.prototype, "evt", {
            "get": function () {
                if (this.__evt === undefined) {
                    this.__evt = new importProxy_1.importProxy.Evt();
                    overwriteReadonlyProp_1.overwriteReadonlyProp(this.__evt, "postCount", this.initialPostCount);
                }
                return this.__evt;
            }
        });
    })();
    return LazyEvt;
}());
exports.LazyEvt = LazyEvt;

},{"../tools/typeSafety/defineAccessors":52,"../tools/typeSafety/overwriteReadonlyProp":58,"./importProxy":32}],30:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.LazyStatefulEvt = void 0;
var overwriteReadonlyProp_1 = require("../tools/typeSafety/overwriteReadonlyProp");
var importProxy_1 = require("./importProxy");
var defineAccessors_1 = require("../tools/typeSafety/defineAccessors");
var LazyStatefulEvt = /** @class */ (function () {
    function LazyStatefulEvt(initialState) {
        this.initialPostCount = 0;
        this.initialState = initialState;
    }
    LazyStatefulEvt.prototype.post = function (data) {
        if (this.__evt === undefined) {
            this.initialState = data;
            return ++this.initialPostCount;
        }
        return this.__evt.post(data);
    };
    LazyStatefulEvt.__1 = (function () {
        if (false) {
            LazyStatefulEvt.__1;
        }
        defineAccessors_1.defineAccessors(LazyStatefulEvt.prototype, "evt", {
            "get": function () {
                if (this.__evt === undefined) {
                    this.__evt = new importProxy_1.importProxy.StatefulEvt(this.initialState);
                    delete this.initialState;
                    overwriteReadonlyProp_1.overwriteReadonlyProp(this.__evt, "postCount", this.initialPostCount);
                }
                return this.__evt;
            }
        });
    })();
    return LazyStatefulEvt;
}());
exports.LazyStatefulEvt = LazyStatefulEvt;

},{"../tools/typeSafety/defineAccessors":52,"../tools/typeSafety/overwriteReadonlyProp":58,"./importProxy":32}],31:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
exports.StatefulEvt = void 0;
require("minimal-polyfills/Object.is");
var defineAccessors_1 = require("../tools/typeSafety/defineAccessors");
var LazyEvt_1 = require("./LazyEvt");
var LazyStatefulEvt_1 = require("./LazyStatefulEvt");
var importProxy_1 = require("./importProxy");
var invokeOperator_1 = require("./util/invokeOperator");
var Operator_1 = require("./types/Operator");
var Evt_parsePropsFromArgs_1 = require("./Evt.parsePropsFromArgs");
var Evt_2 = require("./Evt");
var StatefulEvtImpl = /** @class */ (function (_super) {
    __extends(StatefulEvtImpl, _super);
    function StatefulEvtImpl(initialState) {
        var _this_1 = _super.call(this) || this;
        _this_1.lazyEvtDiff = new LazyEvt_1.LazyEvt();
        _this_1.lazyEvtChangeDiff = new LazyEvt_1.LazyEvt();
        _this_1.__state = initialState;
        _this_1.lazyEvtChange = new LazyStatefulEvt_1.LazyStatefulEvt(_this_1.__state);
        return _this_1;
    }
    StatefulEvtImpl.prototype.post = function (data) {
        return this.__post(data, false);
    };
    StatefulEvtImpl.prototype.postForceChange = function (wData) {
        return this.__post(!!wData ? wData[0] : this.state, true);
    };
    StatefulEvtImpl.prototype.__post = function (data, forceChange) {
        var prevState = this.state;
        this.__state = data;
        var diff = { prevState: prevState, "newState": this.state };
        this.lazyEvtDiff.post(diff);
        if (forceChange || !Object.is(prevState, this.state)) {
            this.lazyEvtChange.post(this.state);
            this.lazyEvtChangeDiff.post(diff);
        }
        return _super.prototype.post.call(this, data);
    };
    StatefulEvtImpl.prototype.pipe = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var evt = _super.prototype.pipe.apply(this, __spread(args));
        var opResult = invokeOperator_1.invokeOperator(this.getStatelessOp(Evt_parsePropsFromArgs_1.parsePropsFromArgs(args, "pipe").op), this.state);
        if (Operator_1.Operator.fλ.Result.NotMatched.match(opResult)) {
            throw new Error([
                "Cannot pipe StatefulEvt because the operator does not match",
                "it's current state.",
                "Use evt.toStateless([ctx]).pipe(op).toStatic(initialState)",
                "to be sure the StatefulEvt is correctly initialized"
            ].join(" "));
        }
        return evt.toStateful(opResult[0]);
    };
    StatefulEvtImpl.prototype.toStateless = function (ctx) {
        return !!ctx ? _super.prototype.pipe.call(this, ctx) : _super.prototype.pipe.call(this);
    };
    StatefulEvtImpl.__4 = (function () {
        if (false) {
            StatefulEvtImpl.__4;
        }
        defineAccessors_1.defineAccessors(StatefulEvtImpl.prototype, "state", {
            "get": function () { return this.__state; },
            "set": function (state) { this.post(state); }
        });
        defineAccessors_1.defineAccessors(StatefulEvtImpl.prototype, "evtDiff", { "get": function () { return this.lazyEvtDiff.evt; } });
        defineAccessors_1.defineAccessors(StatefulEvtImpl.prototype, "evtChange", { "get": function () { return this.lazyEvtChange.evt; } });
        defineAccessors_1.defineAccessors(StatefulEvtImpl.prototype, "evtChangeDiff", { "get": function () { return this.lazyEvtChangeDiff.evt; } });
    })();
    return StatefulEvtImpl;
}(Evt_2.Evt));
exports.StatefulEvt = StatefulEvtImpl;
importProxy_1.importProxy.StatefulEvt = exports.StatefulEvt;

},{"../tools/typeSafety/defineAccessors":52,"./Evt":23,"./Evt.parsePropsFromArgs":27,"./LazyEvt":29,"./LazyStatefulEvt":30,"./importProxy":32,"./types/Operator":36,"./util/invokeOperator":48,"minimal-polyfills/Object.is":67}],32:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.importProxy = void 0;
/** Manually handling circular import so React Native does not gives warning. */
exports.importProxy = {};

},{}],33:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
__exportStar(require("./types"), exports);
__exportStar(require("./util"), exports);
var Ctx_1 = require("./Ctx");
__createBinding(exports, Ctx_1, "Ctx");
var Evt_2 = require("./Evt");
__createBinding(exports, Evt_2, "Evt");
var StatefulEvt_1 = require("./StatefulEvt");
__createBinding(exports, StatefulEvt_1, "StatefulEvt");
var matchVoid_1 = require("../tools/typeSafety/matchVoid");
__createBinding(exports, matchVoid_1, "matchVoid");

},{"../tools/typeSafety/matchVoid":56,"./Ctx":16,"./Evt":23,"./StatefulEvt":31,"./types":38,"./util":47}],34:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.EventTargetLike = void 0;
var typeSafety_1 = require("../../tools/typeSafety");
var EventTargetLike;
(function (EventTargetLike) {
    var RxJSSubject;
    (function (RxJSSubject) {
        function match(eventTarget) {
            return (typeSafety_1.typeGuard(eventTarget) &&
                eventTarget instanceof Object &&
                typeof eventTarget.subscribe === "function");
        }
        RxJSSubject.match = match;
    })(RxJSSubject = EventTargetLike.RxJSSubject || (EventTargetLike.RxJSSubject = {}));
    var NodeStyleEventEmitter;
    (function (NodeStyleEventEmitter) {
        ;
        function match(eventTarget) {
            return (typeSafety_1.typeGuard(eventTarget) &&
                eventTarget instanceof Object &&
                typeof eventTarget.addListener === "function" &&
                typeof eventTarget.removeListener === "function");
        }
        NodeStyleEventEmitter.match = match;
    })(NodeStyleEventEmitter = EventTargetLike.NodeStyleEventEmitter || (EventTargetLike.NodeStyleEventEmitter = {}));
    var JQueryStyleEventEmitter;
    (function (JQueryStyleEventEmitter) {
        function match(eventTarget) {
            return (typeSafety_1.typeGuard(eventTarget) &&
                eventTarget instanceof Object &&
                typeof eventTarget.on === "function" &&
                typeof eventTarget.off === "function");
        }
        JQueryStyleEventEmitter.match = match;
    })(JQueryStyleEventEmitter = EventTargetLike.JQueryStyleEventEmitter || (EventTargetLike.JQueryStyleEventEmitter = {}));
    var HasEventTargetAddRemove;
    (function (HasEventTargetAddRemove) {
        function match(eventTarget) {
            return (typeSafety_1.typeGuard(eventTarget) &&
                eventTarget instanceof Object &&
                typeof eventTarget.addEventListener === "function" &&
                typeof eventTarget.removeEventListener === "function");
        }
        HasEventTargetAddRemove.match = match;
    })(HasEventTargetAddRemove = EventTargetLike.HasEventTargetAddRemove || (EventTargetLike.HasEventTargetAddRemove = {}));
    /* Return true if o can be a EventTargetLike */
    function canBe(o) {
        try {
            return (HasEventTargetAddRemove.match(o) ||
                NodeStyleEventEmitter.match(o) ||
                JQueryStyleEventEmitter.match(o) ||
                RxJSSubject.match(o));
        }
        catch (_a) {
            return false;
        }
    }
    EventTargetLike.canBe = canBe;
})(EventTargetLike = exports.EventTargetLike || (exports.EventTargetLike = {}));

},{"../../tools/typeSafety":55}],35:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.EvtError = void 0;
var EvtError;
(function (EvtError) {
    var Timeout = /** @class */ (function (_super) {
        __extends(Timeout, _super);
        function Timeout(timeout) {
            var _newTarget = this.constructor;
            var _this_1 = _super.call(this, "Evt timeout after " + timeout + "ms") || this;
            _this_1.timeout = timeout;
            Object.setPrototypeOf(_this_1, _newTarget.prototype);
            return _this_1;
        }
        return Timeout;
    }(Error));
    EvtError.Timeout = Timeout;
    var Detached = /** @class */ (function (_super) {
        __extends(Detached, _super);
        function Detached() {
            var _newTarget = this.constructor;
            var _this_1 = _super.call(this, "Evt handler detached") || this;
            Object.setPrototypeOf(_this_1, _newTarget.prototype);
            return _this_1;
        }
        return Detached;
    }(Error));
    EvtError.Detached = Detached;
})(EvtError = exports.EvtError || (exports.EvtError = {}));

},{}],36:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.Operator = void 0;
var typeSafety_1 = require("../../tools/typeSafety");
var Operator;
(function (Operator) {
    var fλ;
    (function (fλ) {
        var Stateful;
        (function (Stateful) {
            function match(op) {
                return typeof op !== "function";
            }
            Stateful.match = match;
        })(Stateful = fλ.Stateful || (fλ.Stateful = {}));
        var Result;
        (function (Result) {
            function match(result) {
                return Matched.match(result) || NotMatched.match(result);
            }
            Result.match = match;
            function getDetachArg(result) {
                var detach = Matched.match(result) ? result[1] : result;
                if (Detach.FromEvt.match(detach)) {
                    return true;
                }
                if (Detach.WithCtxArg.match(detach)) {
                    return [
                        detach.DETACH,
                        detach.err,
                        detach.res
                    ];
                }
                return false;
            }
            Result.getDetachArg = getDetachArg;
            var NotMatched;
            (function (NotMatched) {
                function match(result) {
                    return (result === null ||
                        Detach.match(result));
                }
                NotMatched.match = match;
            })(NotMatched = Result.NotMatched || (Result.NotMatched = {}));
            var Matched;
            (function (Matched) {
                function match(result) {
                    return (typeSafety_1.typeGuard(result) &&
                        result instanceof Object &&
                        !("input" in result) && //exclude String.prototype.match
                        (result.length === 1 ||
                            (result.length === 2 &&
                                (result[1] === null ||
                                    Detach.match(result[1])))));
                }
                Matched.match = match;
            })(Matched = Result.Matched || (Result.Matched = {}));
            var Detach;
            (function (Detach) {
                var FromEvt;
                (function (FromEvt) {
                    function match(detach) {
                        return detach === "DETACH";
                    }
                    FromEvt.match = match;
                })(FromEvt = Detach.FromEvt || (Detach.FromEvt = {}));
                var WithCtxArg;
                (function (WithCtxArg) {
                    function match(detach) {
                        return (typeSafety_1.typeGuard(detach) &&
                            detach instanceof Object &&
                            detach.DETACH instanceof Object);
                    }
                    WithCtxArg.match = match;
                })(WithCtxArg = Detach.WithCtxArg || (Detach.WithCtxArg = {}));
                function match(detach) {
                    return FromEvt.match(detach) || WithCtxArg.match(detach);
                }
                Detach.match = match;
            })(Detach = Result.Detach || (Result.Detach = {}));
        })(Result = fλ.Result || (fλ.Result = {}));
    })(fλ = Operator.fλ || (Operator.fλ = {}));
})(Operator = exports.Operator || (exports.Operator = {}));

},{"../../tools/typeSafety":55}],37:[function(require,module,exports){
"use strict";
exports.__esModule = true;

},{}],38:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.dom = void 0;
__exportStar(require("./helper"), exports);
__exportStar(require("./interfaces"), exports);
var EventTargetLike_1 = require("./EventTargetLike");
__createBinding(exports, EventTargetLike_1, "EventTargetLike");
var EvtError_1 = require("./EvtError");
__createBinding(exports, EvtError_1, "EvtError");
var dom = require("./lib.dom");
exports.dom = dom;
var Operator_1 = require("./Operator");
__createBinding(exports, Operator_1, "Operator");

},{"./EventTargetLike":34,"./EvtError":35,"./Operator":36,"./helper":37,"./interfaces":40,"./lib.dom":41}],39:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.CtxLike = void 0;
var typeGuard_1 = require("../../../tools/typeSafety/typeGuard");
var CtxLike;
(function (CtxLike) {
    function match(o) {
        return (typeGuard_1.typeGuard(o) &&
            o instanceof Object &&
            typeof o.done === "function" &&
            typeof o.abort === "function" &&
            typeof o.zz__addHandler === "function" &&
            typeof o.zz__removeHandler === "function");
    }
    CtxLike.match = match;
})(CtxLike = exports.CtxLike || (exports.CtxLike = {}));

},{"../../../tools/typeSafety/typeGuard":59}],40:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
var CtxLike_1 = require("./CtxLike");
__createBinding(exports, CtxLike_1, "CtxLike");

},{"./CtxLike":39}],41:[function(require,module,exports){
"use strict";
/*
This is a curated re export of the dom API definitions.

The DOM definitions are available only when "compilerOptions": { "lib": ["DOM"] }}
is present in the tsconfig.json.

We need we re-export those definitions so that we can expose methods that interact with
the DOM ( ex Evt.from ) while not producing type error when
EVT is imported in project that does not use 'lib DOM', typically
projects that targets Node.JS.
*/
exports.__esModule = true;

},{}],42:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
exports.compose = void 0;
var encapsulateOpState_1 = require("./encapsulateOpState");
var invokeOperator_1 = require("./invokeOperator");
var Operator_1 = require("../types/Operator");
var id_1 = require("../../tools/typeSafety/id");
var assert_1 = require("../../tools/typeSafety/assert");
var typeGuard_1 = require("../../tools/typeSafety/typeGuard");
function f_o_g(op1, op2) {
    var opAtoB = Operator_1.Operator.fλ.Stateful.match(op1) ?
        encapsulateOpState_1.encapsulateOpState(op1) :
        id_1.id(op1);
    var opBtoC = Operator_1.Operator.fλ.Stateful.match(op2) ?
        encapsulateOpState_1.encapsulateOpState(op2) :
        id_1.id(op2);
    return id_1.id(function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var _b = __read(_a, 3), dataA = _b[0], isPost = _b[2];
        var resultB = invokeOperator_1.invokeOperator(opAtoB, dataA, isPost);
        if (Operator_1.Operator.fλ.Result.NotMatched.match(resultB)) {
            //CtxResultOp1 assignable to CtxResultOp1 | CtxResultOp2...
            assert_1.assert(typeGuard_1.typeGuard(resultB));
            return resultB;
        }
        var detachOp1 = !!resultB[1] ? resultB[1] : null;
        //...same...
        assert_1.assert(typeGuard_1.typeGuard(detachOp1));
        var _c = __read(resultB, 1), dataB = _c[0];
        var resultC = invokeOperator_1.invokeOperator(opBtoC, dataB, isPost);
        if (Operator_1.Operator.fλ.Result.NotMatched.match(resultC)) {
            //...same
            assert_1.assert(typeGuard_1.typeGuard(resultC));
            return detachOp1 !== null ? detachOp1 : resultC;
        }
        return id_1.id([
            resultC[0],
            !!detachOp1 ? detachOp1 : (!!resultC[1] ? resultC[1] : null)
        ]);
    });
}
function compose() {
    var ops = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        ops[_i] = arguments[_i];
    }
    if (ops.length === 1) {
        var _a = __read(ops, 1), op = _a[0];
        return Operator_1.Operator.fλ.Stateful.match(op) ?
            encapsulateOpState_1.encapsulateOpState(op) :
            op;
    }
    var _b = __read(ops), op1 = _b[0], op2 = _b[1], rest = _b.slice(2);
    var op1_o_op2 = f_o_g(op1, op2);
    if (rest.length === 0) {
        return op1_o_op2;
    }
    return compose.apply(void 0, __spread([op1_o_op2], rest));
}
exports.compose = compose;

},{"../../tools/typeSafety/assert":51,"../../tools/typeSafety/id":54,"../../tools/typeSafety/typeGuard":59,"../types/Operator":36,"./encapsulateOpState":43,"./invokeOperator":48}],43:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
exports.encapsulateOpState = void 0;
var id_1 = require("../../tools/typeSafety/id");
var Operator_1 = require("../types/Operator");
function encapsulateOpState(statefulFλOp) {
    var state = statefulFλOp[1];
    return id_1.id(function () {
        var _a = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _a[_i] = arguments[_i];
        }
        var _b = __read(_a, 3), data = _b[0], cbInvokedIfMatched = _b[2];
        var opResult = statefulFλOp[0](data, state, cbInvokedIfMatched);
        if (!!cbInvokedIfMatched &&
            Operator_1.Operator.fλ.Result.Matched.match(opResult)) {
            state = opResult[0];
        }
        return opResult;
    });
}
exports.encapsulateOpState = encapsulateOpState;

},{"../../tools/typeSafety/id":54,"../types/Operator":36}],44:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
var throttleTime_1 = require("./throttleTime");
__createBinding(exports, throttleTime_1, "throttleTime");
var to_1 = require("./to");
__createBinding(exports, to_1, "to");

},{"./throttleTime":45,"./to":46}],45:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.throttleTime = void 0;
var compose_1 = require("../compose");
exports.throttleTime = function (duration) {
    return compose_1.compose([
        function (data, _a) {
            var lastClick = _a.lastClick;
            var now = Date.now();
            return now - lastClick < duration ?
                null :
                [{ data: data, "lastClick": now }];
        },
        { "lastClick": 0, "data": null }
    ], function (_a) {
        var data = _a.data;
        return [data];
    });
};

},{"../compose":42}],46:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.to = void 0;
exports.to = function (eventName) {
    return function (data) { return data[0] !== eventName ?
        null : [data[1]]; };
};

},{}],47:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
__exportStar(require("./genericOperators"), exports);
var compose_1 = require("./compose");
__createBinding(exports, compose_1, "compose");
var invokeOperator_1 = require("./invokeOperator");
__createBinding(exports, invokeOperator_1, "invokeOperator");

},{"./compose":42,"./genericOperators":44,"./invokeOperator":48}],48:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.invokeOperator = void 0;
var Operator_1 = require("../types/Operator");
function invokeOperator(op, data, isPost) {
    var result = op(data, undefined, isPost);
    return Operator_1.Operator.fλ.Result.match(result) ?
        result :
        !!result ? [data] : null;
}
exports.invokeOperator = invokeOperator;

},{"../types/Operator":36}],49:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.VoidDeferred = exports.Deferred = void 0;
var overwriteReadonlyProp_1 = require("./typeSafety/overwriteReadonlyProp");
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this_1 = this;
        this.isPending = true;
        var resolve;
        var reject;
        this.pr = new Promise(function (resolve_, reject_) {
            resolve = function (value) {
                overwriteReadonlyProp_1.overwriteReadonlyProp(_this_1, "isPending", false);
                resolve_(value);
            };
            reject = function (error) {
                overwriteReadonlyProp_1.overwriteReadonlyProp(_this_1, "isPending", false);
                reject_(error);
            };
        });
        this.resolve = resolve;
        this.reject = reject;
    }
    return Deferred;
}());
exports.Deferred = Deferred;
var VoidDeferred = /** @class */ (function (_super) {
    __extends(VoidDeferred, _super);
    function VoidDeferred() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return VoidDeferred;
}(Deferred));
exports.VoidDeferred = VoidDeferred;

},{"./typeSafety/overwriteReadonlyProp":58}],50:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.safeClearTimeout = exports.safeSetTimeout = void 0;
exports.safeSetTimeout = function (callback, ms) { return setTimeout(callback, ms); };
exports.safeClearTimeout = function (timer) { return clearTimeout(timer); };

},{}],51:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.assert = void 0;
function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
}
exports.assert = assert;

},{}],52:[function(require,module,exports){
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
exports.__esModule = true;
exports.defineAccessors = void 0;
exports.defineAccessors = function (obj, propertyName, propertyDescriptor) {
    var get = propertyDescriptor.get, set = propertyDescriptor.set;
    Object.defineProperty(obj, propertyName, __assign(__assign(__assign({}, (Object.getOwnPropertyDescriptor(obj, propertyName) || {
        "enumerable": true,
        "configurable": true
    })), (get !== undefined ? { "get": function () { return get.call(this); } } : {})), (set !== undefined ? { "set": function (value) { set.call(this, value); } } : {})));
};

},{}],53:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.exclude = void 0;
/** Return a function to use as Array.prototype.filter argument
 * to exclude one or many primitive value element from the array.
 * Ex: ([ "a", "b" ] as const).filter(exclude("a") return "b"[]
 */
function exclude(target) {
    var test = target instanceof Object ?
        (function (element) { return target.indexOf(element) < 0; }) :
        (function (element) { return element !== target; });
    return function (str) {
        return test(str);
    };
}
exports.exclude = exclude;

},{}],54:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.id = void 0;
/**
 * The identity function.
 *
 * Help to build an object of type T.
 * Better than using 'as T' as there is no type safety loss.
 *
 * - Used as continence for enabling type inference.
 * Example:
 *
 * type Circle = {
 *     type: "CIRCLE";
 *     radius: number;
 * };
 *
 * type Square = {
 *     type: "SQUARE";
 *     side: number;
 * };
 * type Shape= Circle | Square;
 *
 * declare function f(shape: Shape): void;
 *
 * f(id<Circle>({ "type": "CIRCLE", "radius": 33 }); <== We have auto completion to instantiate circle.
 *
 * - Used to loosen the type restriction without saying "trust me" to the compiler.
 * declare const x: Set<readonly ["FOO"]>;
 * declare function f(s: Set<string[]>): void;
 * f(id<Set<any>>(x));
 *
 * Example:
 * declare const x: Set<readonly [ "FOO" ]>;
 * declare f(x: Set<string[]>): void;
 * id(x as Set<["FOO"]>); <== trust me it's readonly!
 * f(id<Set<any>>(x)); <== we acknowledge that we are out of the safe zone.
 */
exports.id = function (x) { return x; };

},{}],55:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
exports.__esModule = true;
var assert_1 = require("./assert");
__createBinding(exports, assert_1, "assert");
var exclude_1 = require("./exclude");
__createBinding(exports, exclude_1, "exclude");
var id_1 = require("./id");
__createBinding(exports, id_1, "id");
var matchVoid_1 = require("./matchVoid");
__createBinding(exports, matchVoid_1, "matchVoid");
var objectKeys_1 = require("./objectKeys");
__createBinding(exports, objectKeys_1, "objectKeys");
var typeGuard_1 = require("./typeGuard");
__createBinding(exports, typeGuard_1, "typeGuard");

},{"./assert":51,"./exclude":53,"./id":54,"./matchVoid":56,"./objectKeys":57,"./typeGuard":59}],56:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.matchVoid = void 0;
/**
 *
 * Unlike undefined or null, testing o !== void
 * will not restrict the type.
 *
 * Example:
 *
 * declare o: { p: string; } | void;
 *
 * matchVoid(o)?null:o.p <== Type inference ok
 *
 * Match void
 * @param o type of o should be a union of type containing void
 * @returns true if o is undefined
 */
function matchVoid(o) {
    return o === undefined;
}
exports.matchVoid = matchVoid;

},{}],57:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.objectKeys = void 0;
/** Object.keys() with types */
function objectKeys(o) {
    return Object.keys(o);
}
exports.objectKeys = objectKeys;

},{}],58:[function(require,module,exports){
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
exports.__esModule = true;
exports.overwriteReadonlyProp = void 0;
/**
 * Assign a value to a property even if the object is freezed or if the property is not writable
 * Throw if the assignation fail ( for example if the property is non configurable write: false )
 * */
exports.overwriteReadonlyProp = function (obj, propertyName, value) {
    try {
        obj[propertyName] = value;
    }
    catch (_a) {
    }
    if (obj[propertyName] === value) {
        return value;
    }
    var errorDefineProperty = undefined;
    var propertyDescriptor = Object.getOwnPropertyDescriptor(obj, propertyName) || {
        "enumerable": true,
        "configurable": true
    };
    if (!!propertyDescriptor.get) {
        throw new Error("Probably a wrong ides to overwrite " + propertyName + " getter");
    }
    try {
        Object.defineProperty(obj, propertyName, __assign(__assign({}, propertyDescriptor), { value: value }));
    }
    catch (error) {
        errorDefineProperty = error;
    }
    if (obj[propertyName] !== value) {
        throw errorDefineProperty || new Error("Can't assign");
    }
    return value;
};

},{}],59:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.typeGuard = void 0;
/**
 * Use cases:
 *
 * 1) When we know the subtype of a variable but the compiler is unaware.
 *
 * declare const x: "FOO" | "BAR";
 *
 * 1.1) If we want to tel the compile that we know x is of type "BAR"
 *
 * assert(typeGuard<"BAR">(x));
 * x; <== x is of type "BAR"
 *
 * 1.2) If we want to tell the compiler that x is NOT of type "BAR"
 *
 * assert(!typeGuard<"BAR">(x,false));
 * x; <== x is of type "FOO"
 *
 * 2) Tell the compiler what assertion can be made on a given variable
 * if a given test return true.
 *
 * type Circle = { type: "CIRCLE"; radius: number; };
 * type Square = { type: "SQUARE"; sideLength: number; };
 * type Shape = Circle | Square;
 *
 * declare const shape: Shape;
 *
 * if( typeGuard<Circle>(shape, shape.type === "CIRCLE") ){
 *     [ shape is Circle ]
 * }else{
 *     [ shape is not Circle ]
 * }
 *
 *
 * export function matchVoid(o: any): o is void {
 *     return typeGuard<void>(o, o === undefined || o === null );
 * }
 *
 * 3) Helper for safely build other type guards
 *
 * export function match<T>(set: Object): set is SetLike<T> {
 *     return (
 *         typeGuard<SetLike<T>>(set) &&
 *         typeof set.values === "function" &&
 *         /Set/.test(Object.getPrototypeOf(set).constructor.name)
 *     );
 * }
 *
 */
function typeGuard(o, isMatched) {
    if (isMatched === void 0) { isMatched = true; }
    o; //NOTE: Just to avoid unused variable;
    return isMatched;
}
exports.typeGuard = typeGuard;

},{}],60:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],61:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":60}],62:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":61}],63:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],64:[function(require,module,exports){
"use strict";
exports.__esModule = true;
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
    Array.from = (function () {
        var toStr = Object.prototype.toString;
        var isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
        };
        var toInteger = function (value) {
            var number = Number(value);
            if (isNaN(number)) {
                return 0;
            }
            if (number === 0 || !isFinite(number)) {
                return number;
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
        };
        var maxSafeInteger = Math.pow(2, 53) - 1;
        var toLength = function (value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
        };
        // The length property of the from method is 1.
        return function from(arrayLike /*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;
            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);
            // 3. ReturnIfAbrupt(items).
            if (arrayLike == null) {
                throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }
            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T;
            if (typeof mapFn !== 'undefined') {
                // 5. else
                // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
                if (!isCallable(mapFn)) {
                    throw new TypeError('Array.from: when provided, the second argument must be a function');
                }
                // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
                if (arguments.length > 2) {
                    T = arguments[2];
                }
            }
            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            var len = toLength(items.length);
            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method 
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);
            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue;
            while (k < len) {
                kValue = items[k];
                if (mapFn) {
                    A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
                }
                else {
                    A[k] = kValue;
                }
                k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
        };
    }());
}

},{}],65:[function(require,module,exports){
"use strict";
exports.__esModule = true;
// https://tc39.github.io/ecma262/#sec-array.prototype.find
if (!Array.prototype.find) {
    Object.defineProperty(Array.prototype, 'find', {
        value: function (predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }
            var o = Object(this);
            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;
            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];
            // 5. Let k be 0.
            var k = 0;
            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return kValue.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return kValue;
                }
                // e. Increase k by 1.
                k++;
            }
            // 7. Return undefined.
            return undefined;
        },
        configurable: true,
        writable: true
    });
}

},{}],66:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.Polyfill = exports.LightMapImpl = void 0;
var LightMapImpl = /** @class */ (function () {
    function LightMapImpl() {
        this.record = [];
    }
    LightMapImpl.prototype.has = function (key) {
        return this.record
            .map(function (_a) {
            var _key = _a[0];
            return _key;
        })
            .indexOf(key) >= 0;
    };
    LightMapImpl.prototype.get = function (key) {
        var entry = this.record
            .filter(function (_a) {
            var _key = _a[0];
            return _key === key;
        })[0];
        if (entry === undefined) {
            return undefined;
        }
        return entry[1];
    };
    LightMapImpl.prototype.set = function (key, value) {
        var entry = this.record
            .filter(function (_a) {
            var _key = _a[0];
            return _key === key;
        })[0];
        if (entry === undefined) {
            this.record.push([key, value]);
        }
        else {
            entry[1] = value;
        }
        return this;
    };
    LightMapImpl.prototype["delete"] = function (key) {
        var index = this.record.map(function (_a) {
            var key = _a[0];
            return key;
        }).indexOf(key);
        if (index < 0) {
            return false;
        }
        this.record.splice(index, 1);
        return true;
    };
    LightMapImpl.prototype.keys = function () {
        return this.record.map(function (_a) {
            var key = _a[0];
            return key;
        });
    };
    return LightMapImpl;
}());
exports.LightMapImpl = LightMapImpl;
exports.Polyfill = typeof Map !== "undefined" ? Map : LightMapImpl;

},{}],67:[function(require,module,exports){
"use strict";
exports.__esModule = true;
if (!Object.is) {
    Object.is = function (x, y) {
        // SameValue algorithm
        if (x === y) { // Steps 1-5, 7-10
            // Steps 6.b-6.e: +0 != -0
            return x !== 0 || 1 / x === 1 / y;
        }
        else {
            // Step 6.a: NaN == NaN
            return x !== x && y !== y;
        }
    };
}

},{}],68:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.Polyfill = exports.LightSetImpl = void 0;
var Map_1 = require("./Map");
var LightSetImpl = /** @class */ (function () {
    function LightSetImpl(values) {
        this.map = new Map_1.Polyfill();
        if (values === undefined) {
            return;
        }
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            this.add(value);
        }
    }
    LightSetImpl.prototype.has = function (value) {
        return this.map.has(value);
    };
    LightSetImpl.prototype.add = function (value) {
        this.map.set(value, true);
        return this;
    };
    LightSetImpl.prototype.values = function () {
        return this.map.keys();
    };
    LightSetImpl.prototype["delete"] = function (value) {
        return this.map["delete"](value);
    };
    return LightSetImpl;
}());
exports.LightSetImpl = LightSetImpl;
exports.Polyfill = typeof Set !== "undefined" ? Set : LightSetImpl;

},{"./Map":66}],69:[function(require,module,exports){
"use strict";
exports.__esModule = true;
exports.Polyfill = void 0;
var Map_1 = require("./Map");
exports.Polyfill = typeof WeakMap !== "undefined" ? WeakMap : Map_1.Polyfill;

},{"./Map":66}],70:[function(require,module,exports){
(function (process){
// .dirname, .basename, and .extname methods are extracted from Node.js v8.11.1,
// backported and transplited with Babel, with backwards-compat fixes

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function (path) {
  if (typeof path !== 'string') path = path + '';
  if (path.length === 0) return '.';
  var code = path.charCodeAt(0);
  var hasRoot = code === 47 /*/*/;
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        if (!matchedSlash) {
          end = i;
          break;
        }
      } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? '/' : '.';
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return '/';
  }
  return path.slice(0, end);
};

function basename(path) {
  if (typeof path !== 'string') path = path + '';

  var start = 0;
  var end = -1;
  var matchedSlash = true;
  var i;

  for (i = path.length - 1; i >= 0; --i) {
    if (path.charCodeAt(i) === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          start = i + 1;
          break;
        }
      } else if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // path component
      matchedSlash = false;
      end = i + 1;
    }
  }

  if (end === -1) return '';
  return path.slice(start, end);
}

// Uses a mixed approach for backwards-compatibility, as ext behavior changed
// in new Node.js versions, so only basename() above is backported here
exports.basename = function (path, ext) {
  var f = basename(path);
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};

exports.extname = function (path) {
  if (typeof path !== 'string') path = path + '';
  var startDot = -1;
  var startPart = 0;
  var end = -1;
  var matchedSlash = true;
  // Track the state of characters (if any) we see before our first dot and
  // after any path separator we find
  var preDotState = 0;
  for (var i = path.length - 1; i >= 0; --i) {
    var code = path.charCodeAt(i);
    if (code === 47 /*/*/) {
        // If we reached a path separator that was not part of a set of path
        // separators at the end of the string, stop now
        if (!matchedSlash) {
          startPart = i + 1;
          break;
        }
        continue;
      }
    if (end === -1) {
      // We saw the first non-path separator, mark this as the end of our
      // extension
      matchedSlash = false;
      end = i + 1;
    }
    if (code === 46 /*.*/) {
        // If this is our first dot, mark it as the start of our extension
        if (startDot === -1)
          startDot = i;
        else if (preDotState !== 1)
          preDotState = 1;
    } else if (startDot !== -1) {
      // We saw a non-dot and non-path separator before our dot, so we should
      // have a good chance at having a non-empty extension
      preDotState = -1;
    }
  }

  if (startDot === -1 || end === -1 ||
      // We saw a non-dot character immediately before the dot
      preDotState === 0 ||
      // The (right-most) trimmed path component is exactly '..'
      preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
    return '';
  }
  return path.slice(startDot, end);
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":71}],71:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],72:[function(require,module,exports){
"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.buildMethodCb = exports.buildCb = exports.getPrComplete = exports.isRunning = exports.cancelAllQueuedCalls = exports.getQueuedCallCount = exports.buildMethod = exports.build = exports.createGroupRef = void 0;
var WeakMap_1 = require("minimal-polyfills/WeakMap");
var ExecQueue = /** @class */ (function () {
    function ExecQueue() {
        this.queuedCalls = [];
        this.isRunning = false;
        this.prComplete = Promise.resolve();
    }
    //TODO: move where it is used.
    ExecQueue.prototype.cancelAllQueuedCalls = function () {
        var n;
        this.queuedCalls.splice(0, n = this.queuedCalls.length);
        return n;
    };
    return ExecQueue;
}());
var globalContext = {};
var clusters = new WeakMap_1.Polyfill();
//console.log("Map version");
//export const clusters = new Map<Object, Map<GroupRef,ExecQueue>>();
function getOrCreateExecQueue(context, groupRef) {
    var execQueueByGroup = clusters.get(context);
    if (!execQueueByGroup) {
        execQueueByGroup = new WeakMap_1.Polyfill();
        clusters.set(context, execQueueByGroup);
    }
    var execQueue = execQueueByGroup.get(groupRef);
    if (!execQueue) {
        execQueue = new ExecQueue();
        execQueueByGroup.set(groupRef, execQueue);
    }
    return execQueue;
}
function createGroupRef() {
    return new Array(0);
}
exports.createGroupRef = createGroupRef;
function build() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return buildFnPromise(true, createGroupRef(), inputs[0]);
        case 2: return buildFnPromise(true, inputs[0], inputs[1]);
    }
}
exports.build = build;
function buildMethod() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return buildFnPromise(false, createGroupRef(), inputs[0]);
        case 2: return buildFnPromise(false, inputs[0], inputs[1]);
    }
}
exports.buildMethod = buildMethod;
/**
 *
 * Get the number of queued call of a run-exclusive function.
 * Note that if you call a runExclusive function and call this
 * directly after it will return 0 as there is one function call
 * execution ongoing but 0 queued.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 *
 * */
function getQueuedCallCount(runExclusiveFunction, classInstanceObject) {
    var execQueue = getExecQueueByFunctionAndContext(runExclusiveFunction, classInstanceObject);
    return execQueue ? execQueue.queuedCalls.length : 0;
}
exports.getQueuedCallCount = getQueuedCallCount;
/**
 *
 * Cancel all queued calls of a run-exclusive function.
 * Note that the current running call will not be cancelled.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 *
 */
function cancelAllQueuedCalls(runExclusiveFunction, classInstanceObject) {
    var execQueue = getExecQueueByFunctionAndContext(runExclusiveFunction, classInstanceObject);
    return execQueue ? execQueue.cancelAllQueuedCalls() : 0;
}
exports.cancelAllQueuedCalls = cancelAllQueuedCalls;
/**
 * Tell if a run-exclusive function has an instance of it's call currently being
 * performed.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 */
function isRunning(runExclusiveFunction, classInstanceObject) {
    var execQueue = getExecQueueByFunctionAndContext(runExclusiveFunction, classInstanceObject);
    return execQueue ? execQueue.isRunning : false;
}
exports.isRunning = isRunning;
/**
 * Return a promise that resolve when all the current queued call of a runExclusive functions
 * have completed.
 *
 * The classInstanceObject parameter is to provide only for the run-exclusive
 * function created with 'buildMethod[Cb].
 */
function getPrComplete(runExclusiveFunction, classInstanceObject) {
    var execQueue = getExecQueueByFunctionAndContext(runExclusiveFunction, classInstanceObject);
    return execQueue ? execQueue.prComplete : Promise.resolve();
}
exports.getPrComplete = getPrComplete;
var groupByRunExclusiveFunction = new WeakMap_1.Polyfill();
function getExecQueueByFunctionAndContext(runExclusiveFunction, context) {
    if (context === void 0) { context = globalContext; }
    var groupRef = groupByRunExclusiveFunction.get(runExclusiveFunction);
    if (!groupRef) {
        throw Error("Not a run exclusiveFunction");
    }
    var execQueueByGroup = clusters.get(context);
    if (!execQueueByGroup) {
        return undefined;
    }
    return execQueueByGroup.get(groupRef);
}
function buildFnPromise(isGlobal, groupRef, fun) {
    var execQueue;
    var runExclusiveFunction = (function () {
        var _this = this;
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        if (!isGlobal) {
            if (!(this instanceof Object)) {
                throw new Error("Run exclusive, <this> should be an object");
            }
            execQueue = getOrCreateExecQueue(this, groupRef);
        }
        return new Promise(function (resolve, reject) {
            var onPrCompleteResolve;
            execQueue.prComplete = new Promise(function (resolve) {
                return onPrCompleteResolve = function () { return resolve(); };
            });
            var onComplete = function (result) {
                onPrCompleteResolve();
                execQueue.isRunning = false;
                if (execQueue.queuedCalls.length) {
                    execQueue.queuedCalls.shift()();
                }
                if ("data" in result) {
                    resolve(result.data);
                }
                else {
                    reject(result.reason);
                }
            };
            (function callee() {
                var _this = this;
                var inputs = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    inputs[_i] = arguments[_i];
                }
                if (execQueue.isRunning) {
                    execQueue.queuedCalls.push(function () { return callee.apply(_this, inputs); });
                    return;
                }
                execQueue.isRunning = true;
                try {
                    fun.apply(this, inputs)
                        .then(function (data) { return onComplete({ data: data }); })["catch"](function (reason) { return onComplete({ reason: reason }); });
                }
                catch (error) {
                    onComplete({ "reason": error });
                }
            }).apply(_this, inputs);
        });
    });
    if (isGlobal) {
        execQueue = getOrCreateExecQueue(globalContext, groupRef);
    }
    groupByRunExclusiveFunction.set(runExclusiveFunction, groupRef);
    return runExclusiveFunction;
}
function buildCb() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return buildFnCallback(true, createGroupRef(), inputs[0]);
        case 2: return buildFnCallback(true, inputs[0], inputs[1]);
    }
}
exports.buildCb = buildCb;
function buildMethodCb() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    switch (inputs.length) {
        case 1: return buildFnCallback(false, createGroupRef(), inputs[0]);
        case 2: return buildFnCallback(false, inputs[0], inputs[1]);
    }
}
exports.buildMethodCb = buildMethodCb;
function buildFnCallback(isGlobal, groupRef, fun) {
    var execQueue;
    var runExclusiveFunction = (function () {
        var _this = this;
        var inputs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            inputs[_i] = arguments[_i];
        }
        if (!isGlobal) {
            if (!(this instanceof Object)) {
                throw new Error("Run exclusive, <this> should be an object");
            }
            execQueue = getOrCreateExecQueue(this, groupRef);
        }
        var callback = undefined;
        if (inputs.length && typeof inputs[inputs.length - 1] === "function") {
            callback = inputs.pop();
        }
        var onPrCompleteResolve;
        execQueue.prComplete = new Promise(function (resolve) {
            return onPrCompleteResolve = function () { return resolve(); };
        });
        var onComplete = function () {
            var inputs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                inputs[_i] = arguments[_i];
            }
            onPrCompleteResolve();
            execQueue.isRunning = false;
            if (execQueue.queuedCalls.length) {
                execQueue.queuedCalls.shift()();
            }
            if (callback) {
                callback.apply(_this, inputs);
            }
        };
        onComplete.hasCallback = !!callback;
        (function callee() {
            var _this = this;
            var inputs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                inputs[_i] = arguments[_i];
            }
            if (execQueue.isRunning) {
                execQueue.queuedCalls.push(function () { return callee.apply(_this, inputs); });
                return;
            }
            execQueue.isRunning = true;
            try {
                fun.apply(this, __spreadArrays(inputs, [onComplete]));
            }
            catch (error) {
                error.message += " ( This exception should not have been thrown, miss use of run-exclusive buildCb )";
                throw error;
            }
        }).apply(this, inputs);
    });
    if (isGlobal) {
        execQueue = getOrCreateExecQueue(globalContext, groupRef);
    }
    groupByRunExclusiveFunction.set(runExclusiveFunction, groupRef);
    return runExclusiveFunction;
}

},{"minimal-polyfills/WeakMap":69}],73:[function(require,module,exports){
(function (global){
"use strict";
var has = require('has');

var toString = Object.prototype.toString;
var keys = Object.keys;
var jsonParse = JSON.parse;
var jsonStringify = JSON.stringify;
var identifierFormat = '[a-zA-Z_$][0-9a-zA-Z_$]*';
var identifierPattern = new RegExp('^' + identifierFormat + '$');
var functionPattern = new RegExp(
  '^\\s*function(?:\\s+' + identifierFormat  + ')?\\s*' +
  '\\(\\s*(?:(' + identifierFormat + ')' +
  '((?:\\s*,\\s*' + identifierFormat + ')*)?)?\\s*\\)\\s*' + 
  '\\{([\\s\\S]*)\\}\\s*', 'm');
var nativeFunctionBodyPattern = /^\s\[native\scode\]\s$/;

function isArray(obj) {
  return toString.call(obj) === '[object Array]';
}

function escapeForRegExp(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function isReplaceable(obj) {
  /*jshint -W122 */
  return (typeof obj === 'object' && obj !== null) ||
    typeof obj === 'function' || typeof obj === 'symbol';
}

var dateSerializer = {
  serialize: function(date) {
    return [date.getTime()];
  },
  deserialize: function(time) {
    return new Date(time);
  },
  isInstance: function(obj) {
    return obj instanceof Date;
  },
  name: 'Date'
};

var regExpSerializer = {
  serialize: function(regExp) {
    var flags = '';
    if (regExp.global) flags += 'g';
    if (regExp.multiline) flags += 'm';
    if (regExp.ignoreCase) flags += 'i';
    return [regExp.source, flags];
  },
  deserialize: function(source, flags) {
    return new RegExp(source, flags);
  },
  isInstance: function(obj) {
    return obj instanceof RegExp;
  },
  name: 'RegExp'
};

var functionSerializer = {
  serialize: function(f) {
    var firstArg, functionBody, parts, remainingArgs;
    var args = '';

    parts = functionPattern.exec(f.toString());

    if (!parts)
      throw new Error('Functions must have a working toString method' +
                      'in order to be serialized');

    firstArg = parts[1];
    remainingArgs = parts[2];
    functionBody = parts[3];

    if (nativeFunctionBodyPattern.test(functionBody))
      throw new Error('Native functions cannot be serialized');
    
    if (firstArg)
      args += firstArg.trim();

    if (remainingArgs) {
      remainingArgs = remainingArgs.split(',').slice(1);
      for (var i = 0; i < remainingArgs.length; i += 1) {
        args += ', ' + remainingArgs[i].trim();
      }
    }

    return [args, functionBody];
  },
  deserialize: function(args, functionBody) {
    var rv = new Function(args, functionBody);
    return rv;
  },
  isInstance: function(obj) {
    return typeof obj === 'function';
  },
  name: 'Function'
};

var symbolSerializer;

if (typeof global.Symbol !== 'undefined') {
  (function(Symbol) {
   /*jshint -W122 */
    // add symbol serializer for es6. this will probably break for private
    // symbols.
    symbolSerializer = {
      serialize: function(sym) {
        var key = Symbol.keyFor(sym);
        if (typeof key === 'string') {
          // symbol registered globally
          return [key, 0, 0];
        }
        var symStr = sym.toString();
        var match = /^Symbol\(Symbol\.([^)]+)\)$/.exec(symStr);
        if (match && has(Symbol, match[1])) {
          // well known symbol, return the key in the Symbol object
          return [0, match[1], 0];
        }
        match = /^Symbol\(([^)]*)\)$/.exec(symStr);
        return [0, 0, match[1]];
      },
      deserialize: function(key, wellKnownKey, description) {
        if (key) {
          return Symbol.for(key);
        } else if (wellKnownKey) {
          return Symbol[wellKnownKey];
        }
        return Symbol(description);
      },
      isInstance: function(obj) {
        return typeof obj === 'symbol';
      },
      name: 'Symbol'
    };
  })(global.Symbol);
}

var defaultOpts = {
  magic: '#!',
  serializers: [dateSerializer, regExpSerializer, functionSerializer]
};

if (symbolSerializer)
  defaultOpts.serializers.push(symbolSerializer);

function create(options) {
  var magic = escapeForRegExp((options && options.magic) ||
                              defaultOpts.magic);
  var initialSerializers = (options && options.serializers) ||
    defaultOpts.serializers;
  var serializers = [];
  var magicEscaper = new RegExp('([' + magic + '])', 'g');
  var magicUnescaper = new RegExp('([' + magic + '])\\1', 'g');
  var superJsonStringPattern = new RegExp('^([' + magic + ']+)' +
                                    '(' + identifierFormat +
                                    '\\[.*\\])$');
  var superJsonPattern = new RegExp('^' + magic +
                                    '(' + identifierFormat + ')' +
                                    '(\\[.*\\])$');


  function installSerializer(serializer) {
    if (typeof serializer.name === 'function') {
      if (serializer.deserialize) {
        throw new Error('Serializers with a function name should not define ' +
                        'a deserialize function');
      }
    } else {
      if (!identifierPattern.test(serializer.name))
        throw new Error("Serializers must have a 'name' property " +
                        'that is a valid javascript identifier.');

      if (typeof serializer.deserialize !== 'function' &&
          typeof serializer.replace !== 'function')
        throw new Error("Serializers must have a 'deserialize' function " +
                        'that when passed the arguments generated by ' +
                        "'serialize' will return a instance that is equal " +
                        'to the one serialized');
    }

    if (typeof serializer.serialize !== 'function' &&
        typeof serializer.replace !== 'function')
      throw new Error("Serializers must have a 'serialize' function " +
                      'that will receive an instance and return an array ' +
                      'of arguments necessary to reconstruct the object ' +
                      'state.');

    if (typeof serializer.isInstance !== 'function')
      throw new Error("Serializers must have a 'isInstance' function " +
                      'that tells if an object is an instance of the ' +
                      'type represented by the serializer');

    serializers.push(serializer);
  }

  function stringify(obj, userReplacer, indent) {
    function replaceValue(value) {
      var match;

      if (typeof value === 'string' && 
          (match = superJsonStringPattern.exec(value))) {
        // Escape magic string at the start only
        return match[1].replace(magicEscaper, '$1$1') + match[2];
      } else {
        for (var i = 0; i < serializers.length; i++) {
          var serializer = serializers[i];
          if (serializer.isInstance(value)) {
            if (typeof serializer.replace === 'function') {
              return serializer.replace(value);
            }
            var name;
            if (typeof serializer.name === 'function')
              name = serializer.name(value);
            else
              name = serializer.name;
            var args = serializer.serialize(value);
            if (!isArray(args))
              throw new Error("'serialize' function must return an array " +
                              "containing arguments for 'deserialize'");
              return magic + name + jsonStringify(args);
          }
        }
      }
    }

    function replacer(key, value) {
      var rv = null;

      if (isReplaceable(value)) {
        if (isArray(value)) {
          rv = [];
          value.forEach(function(v) {
            var replacedValue = replaceValue(v);
            if (replacedValue === undefined) replacedValue = v;
            rv.push(replacedValue);
          });
        } else {
          rv = {};
          keys(value).forEach(function(k) {
            var v = value[k];
            var replacedValue = replaceValue(v);
            if (replacedValue === undefined) replacedValue = v;
            rv[k] = replacedValue;
          });
        }
      }

      if (!rv) return value;
      return rv;
    }

    var rv;

    if (typeof userReplacer === 'number') 
      indent = userReplacer;

    if (!userReplacer && isReplaceable(obj))
      rv = replaceValue(obj);

    if (rv) 
      return jsonStringify(rv, null, indent);

    return jsonStringify(obj, typeof userReplacer === 'function' ?
                         userReplacer : replacer, indent);
  }

  function parse(json, userReviver) {
    var revived = [];

    function reviveValue(value) {
      var args, match, name;

      if ((match = superJsonPattern.exec(value))) {
        name = match[1];
        try {
          args = jsonParse(match[2]);
        } catch (e) {
          // Ignore parse errors
          return;
        }
        for (var i = 0; i < serializers.length; i += 1) {
          var serializer = serializers[i];
          if (name === serializer.name)
            return serializer.deserialize.apply(serializer, args);
        }
      } else if ((match = superJsonStringPattern.exec(value))) {
        return match[1].replace(magicUnescaper, '$1') + match[2];
      }
    }

    function reviver(key, value) {
      if (typeof value === 'object' && value && revived.indexOf(value) === -1) {
        keys(value).forEach(function(k) {
          var revivedValue;
          var v = value[k];
          if (typeof v === 'string')
            revivedValue = reviveValue(v);
          if (revivedValue) revived.push(revivedValue);
          else revivedValue = v;
          value[k] = revivedValue;
        });
      }

      return value;
    }

    var rv;
    var parsed = jsonParse(json, typeof userReviver === 'function' ?
                          userReviver : reviver);

    if (typeof parsed === 'string') rv = reviveValue(parsed);
    if (!rv) rv = parsed;
    return rv;
  }

  initialSerializers.forEach(installSerializer);

  return {
    stringify: stringify,
    parse: parse,
    installSerializer: installSerializer
  };
}

exports.dateSerializer = dateSerializer;
exports.regExpSerializer = regExpSerializer;
exports.functionSerializer = functionSerializer;
if (symbolSerializer) exports.symbolSerializer = symbolSerializer;
exports.create = create;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"has":62}],74:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
var superJson = require("super-json");
/** Support undefined and Date by default*/
function get(serializers) {
    if (serializers === void 0) { serializers = []; }
    var myJson = superJson.create({
        "magic": '#!',
        "serializers": __spread([
            superJson.dateSerializer
        ], serializers)
    });
    return {
        "stringify": function (obj) {
            if (obj === undefined) {
                return "undefined";
            }
            return myJson.stringify([obj]);
        },
        "parse": function (str) {
            if (str === "undefined") {
                return undefined;
            }
            return myJson.parse(str).pop();
        }
    };
}
exports.get = get;

},{"super-json":73}]},{},[13]);
