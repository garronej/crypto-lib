import { RunTaskFn } from "./RunTaskFn";

const runTask: RunTaskFn = task => {

    console.log(`================>[crypto thread start task]`);

    const start= Date.now();

    task();

    console.log(`================>[crypto thread lock]: ${Date.now() - start}ms`);

    /*
    //@ts-ignore
    import("react-native")
        .then(({ InteractionManager }) => InteractionManager.runAfterInteractions(task))
        ;
    */

};

export default runTask;

