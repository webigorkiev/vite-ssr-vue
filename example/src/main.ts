import {createViteSsrVue} from "vite-ssr-vue";
import App from "./App.vue";
import createRouter from "./routes";
import createStore from "./store";

/**
 * Create app
 * only one entry point for server and client
 * plugin change alias for #vite-ssr-vue by the ssr or client version
 * automatically
 */
export default createViteSsrVue(App, {
    created: ({app}) => {
        const router = createRouter();
        const store = createStore();
        app.use(router);
        app.use(store);

        return {router, store};
    },
    rootProps: {
        test: "vite-ssr-vue"
    },
    shouldPreload(file, type) {

        return false;
    },
    shouldPrefetch(file, type) {

        return false;
    }
});
