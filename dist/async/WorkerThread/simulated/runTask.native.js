"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var runTask = function (task) {
    console.log("================>[crypto thread start task]");
    var start = Date.now();
    task();
    console.log("================>[crypto thread lock]: " + (Date.now() - start) + "ms");
    /*
    //@ts-ignore
    import("react-native")
        .then(({ InteractionManager }) => InteractionManager.runAfterInteractions(task))
        ;
    */
};
exports.default = runTask;
