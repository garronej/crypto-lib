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
