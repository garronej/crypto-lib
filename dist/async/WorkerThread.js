"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environnement_1 = require("../sync/utils/environnement");
var web_1 = require("./WorkerThread/web");
var node_1 = require("./WorkerThread/node");
var simulated_1 = require("./WorkerThread/simulated");
var WorkerThread;
(function (WorkerThread) {
    function factory(source, isMultithreadingEnabled) {
        return function () {
            if (environnement_1.environnement.type === "LIQUID CORE") {
                throw new Error("LiquidCore cant fork");
            }
            if (!isMultithreadingEnabled()) {
                return simulated_1.spawn(source);
            }
            switch (environnement_1.environnement.type) {
                case "BROWSER": return web_1.spawn(source);
                case "NODE": return node_1.spawn(source);
            }
        };
    }
    WorkerThread.factory = factory;
})(WorkerThread = exports.WorkerThread || (exports.WorkerThread = {}));
