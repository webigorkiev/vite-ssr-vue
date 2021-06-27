import type {Hook, CreateOptions} from "./plugin";
import {unserialize} from "./utils/serialize";

declare global {
    interface Window {
        __INITIAL_STATE__:any;
    }
}

/**
 * Create client instance of vue app
 * @param app
 * @param hook
 * @param options
 */
export const createViteSsrVue = async(
    {
        app,
        transformState
    }: CreateOptions,
    hook?: Hook
) => {
    const transformer = transformState || unserialize;
    const initialState =  await transformer(window.__INITIAL_STATE__);

    if(hook) {
        await hook({
            isClient: true,
            initialState: initialState
        })
    }

    return app;
}