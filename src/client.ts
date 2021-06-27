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
    const {app, router, transformState} = creator();
    const transformer = transformState || unserialize;
    const initialState =  await transformer(window.__INITIAL_STATE__);
    const url = window.location;

    if(hook) {
        await hook({
            url,
            app,
            router,
            isClient: true,
            initialState: initialState
        })
    }

    return app;
}