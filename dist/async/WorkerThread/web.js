"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_evt_1 = require("ts-evt");
function spawn(source) {
    var evtResponse = new ts_evt_1.Evt();
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
