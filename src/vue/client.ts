import {createSSRApp} from "vue";
import type {ClientHandler, SsrHandler, Context, CreatorOptions} from "@/types.d";
import {unserialize} from "@/utils/serialize";
export { ClientOnly } from "./components";
export type {Context, CreatorOptions};

declare global {
    interface Window {
        __INITIAL_STATE__:any;
    }
}

const createViteSsrVue:ClientHandler|SsrHandler = async(App, options= {}) => {
    const app = createSSRApp(App, options.rootProps);
    const serializer = options.serializer || unserialize;
    const initialState =  await serializer(window.__INITIAL_STATE__);
    const url = window.location;
    let store, router, pinia;

    if(options.created) {
        ({store, router, pinia} = (await options.created({
            url,
            app,
            isClient: true,
            initialState
        })) || {});
    }

    // Store default behavior
    if(store && initialState.state) {
        store.replaceState(initialState.state); // Vuex
    }
    if(pinia && initialState.pinia) {
        pinia.state.value = initialState.pinia; // Pinia
    }

    // Router default behavior
    if(router) {
        await router.isReady();
    }

    if(options.mounted) {
        await options.mounted({
            url,
            app,
            isClient: true,
            initialState,
            store,
            pinia,
            router
        });
    }

    if(options.rendered) {
        await options.rendered({
            url,
            app,
            isClient: true,
            initialState,
            store,
            pinia,
            router
        });
    }

    app.mount(
        options?.mount?.rootContainer||"#app",
        options?.mount?.isHydrate||true,
        options?.mount?.isSVG||true,
    );
};
export default createViteSsrVue;