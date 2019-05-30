"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environnement_1 = require("../sync/environnement");
var web_1 = require("./WorkerThread/web");
var node_1 = require("./WorkerThread/node");
var simulated_1 = require("./WorkerThread/simulated");
var WorkerThread;
(function (WorkerThread) {
    function factory(source, isMultithreadingEnabled) {
        return function () { return isMultithreadingEnabled() ?
            environnement_1.isBrowser() ?
                web_1.spawn(source) :
                node_1.spawn(source)
            :
                simulated_1.spawn(source); };
    }
    WorkerThread.factory = factory;
})(WorkerThread = exports.WorkerThread || (exports.WorkerThread = {}));
