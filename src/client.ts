import type {Hook, CreateOptions} from "./plugin";
import {unserialize} from "./utils/serialize";

declare global {
    interface Window {
        __INITIAL_STATE__:any;
    }
}

/**
 * Create client instance of vue app
 * @param creator
 * @param hook
 */
export const createViteSsrVue = async(
    creator: () => CreateOptions,
    hook?: Hook
) => {
    const {app, transformState} = creator();
    const transformer = transformState || unserialize;
    const initialState =  await transformer(window.__INITIAL_STATE__);

    if(hook) {
        await hook({
            app,
            isClient: true,
            initialState: initialState
        })
    }

    return app;
}