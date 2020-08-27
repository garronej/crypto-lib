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
