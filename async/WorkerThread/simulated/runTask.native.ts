import { RunTaskFn } from "./RunTaskFn";

const runTask: RunTaskFn = task => {

    //@ts-ignore
    import("react-native")
        .then(({ InteractionManager }) => InteractionManager.runAfterInteractions(task))
        ;

};

export default runTask;

