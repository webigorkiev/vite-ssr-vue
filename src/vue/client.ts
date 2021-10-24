import {createSSRApp} from "vue";
import type {ClientHandler, SsrHandler, Context} from "@/types.d";
import {unserialize} from "@/utils/serialize";
export { ClientOnly } from "./components";
export type {Context};

declare global {
    interface Window {
        __INITIAL_STATE__:any;
    }
}

/**
 * Create client instance of vue app
 */
const createViteSsrVue:ClientHandler|SsrHandler = async(App, options= {}) => {
    const app = createSSRApp(App, options.rootProps);
    const serializer = options.serializer || unserialize;
    const initialState =  await serializer(window.__INITIAL_STATE__);
    const url = window.location;

    if(options.created) {
        const {store, router} = (await options.created({
            url,
            app,
            isClient: true,
            initialState: initialState
        })) || {};

        // Router default behavior
        if(router) {
            await router.isReady();
        }

        // Store default behavior
        if(store && initialState.state) {
            store.replaceState(initialState.state);
        }
    }

    app.mount(
        options?.mount?.rootContainer||"#app",
        options?.mount?.isHydrate||true,
        options?.mount?.isSVG||true,
    );
};
export default createViteSsrVue;