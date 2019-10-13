"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runTask = function (task) {
    //@ts-ignore
    Promise.resolve().then(function () { return require("react-native"); }).then(function (_a) {
        var InteractionManager = _a.InteractionManager;
        return InteractionManager.runAfterInteractions(task);
    });
};
exports.default = runTask;
