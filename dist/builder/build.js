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
var buildTools = require("frontend-build-tools");
var path = require("path");
var module_dir_path = path.join(__dirname, "..", "..");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var watch, bundle_file_path, _loop_1, _i, _a, test_file_basename;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                watch = process.argv[2] === "-w" ? "WATCH" : undefined;
                return [4 /*yield*/, buildTools.tsc(path.join(module_dir_path, "sync", "tsconfig.json"), watch)];
            case 1:
                _b.sent();
                bundle_file_path = path.join(module_dir_path, "dist", "sync", "_worker_thread", "bundle.js");
                return [4 /*yield*/, buildTools.browserify(["--entry", path.join(module_dir_path, "dist", "sync", "_worker_thread", "main.js")], ["--outfile", bundle_file_path], undefined, watch)];
            case 2:
                _b.sent();
                return [4 /*yield*/, buildTools.minify(bundle_file_path, watch)];
            case 3:
                _b.sent();
                return [4 /*yield*/, buildTools.tsc(path.join(module_dir_path, "async", "tsconfig.json"), watch)];
            case 4:
                _b.sent();
                return [4 /*yield*/, buildTools.brfs(path.join(module_dir_path, "dist", "async", "index.js"), watch)];
            case 5:
                _b.sent();
                return [4 /*yield*/, buildTools.tsc(path.join(module_dir_path, "test", "tsconfig.json"), watch)];
            case 6:
                _b.sent();
                _loop_1 = function (test_file_basename) {
                    (function () { return __awaiter(void 0, void 0, void 0, function () {
                        var entry_point_file_path, dst_file_path;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    entry_point_file_path = path.join(module_dir_path, "dist", "test", test_file_basename + ".js");
                                    dst_file_path = path.join(module_dir_path, "docs", test_file_basename + "-bundled.js");
                                    return [4 /*yield*/, buildTools.browserify(["--entry", entry_point_file_path], ["--outfile", dst_file_path], undefined, watch)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, buildTools.minify(dst_file_path, watch)];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, buildTools.buildTestHtmlPage(dst_file_path, watch)];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })();
                };
                for (_i = 0, _a = ["perf", "scrypt", "rsa", "subtle"]; _i < _a.length; _i++) {
                    test_file_basename = _a[_i];
                    _loop_1(test_file_basename);
                }
                return [2 /*return*/];
        }
    });
}); })();
