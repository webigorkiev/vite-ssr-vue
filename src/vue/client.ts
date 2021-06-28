import {createSSRApp} from "vue";
import type {ClientHandler} from "../plugin";
import {unserialize} from "../utils/serialize";
export { ClientOnly } from "./components";

declare global {
    interface Window {
        __INITIAL_STATE__:any;
    }
}

/**
 * Create client instance of vue app
 */
export const createViteSsrVue:ClientHandler = async(App, options= {}) => {
    const app = createSSRApp(App, options.rootProps);
    const serializer = options.serializer || unserialize;
    const initialState =  await serializer(window.__INITIAL_STATE__);
    const url = window.location;

    if(options.created) {
        const {store} = (await options.created({
            url,
            app,
            isClient: true,
            initialState: initialState
        })) || {};

        if(store && initialState.state) {
            store.replaceState(initialState.state);
        }
    }

    app.mount(
        options?.mount?.rootContainer||"#app",
        options?.mount?.isHydrate||true,
        options?.mount?.isSVG||false,
    );
};