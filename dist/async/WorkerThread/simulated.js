"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_events_extended_1 = require("ts-events-extended");
function spawn(source) {
    var evtResponse = new ts_events_extended_1.SyncEvent();
    var actionListener;
    //@ts-ignore
    var __simulatedMainThreadApi = {
        "sendResponse": function (response) { return setTimeout(function () { return evtResponse.post(response); }, 0); },
        "setActionListener": function (actionListener_) { return actionListener = actionListener_; }
    };
    eval(source);
    return {
        evtResponse: evtResponse,
        "send": function (action) { return actionListener(action); },
        "terminate": function () { }
    };
}
exports.spawn = spawn;
