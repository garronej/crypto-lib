"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environnement_1 = require("../sync/environnement");
var web_1 = require("./WorkerThread/web");
var node_1 = require("./WorkerThread/node");
var WorkerThread;
(function (WorkerThread) {
    function factory(source) {
        return function () { return environnement_1.isBrowser() ?
            web_1.spawn(source) :
            node_1.spawn(source); };
    }
    WorkerThread.factory = factory;
})(WorkerThread = exports.WorkerThread || (exports.WorkerThread = {}));
