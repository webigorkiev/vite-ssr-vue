import type {SsrHandler, Context} from "@/types.d";
import {createSSRApp} from "vue";
import {renderToString} from "@vue/server-renderer";
import {serialize} from "@/utils/serialize";
import {createUrl} from "@/utils/createUrl";
import {renderHeadToString} from "@vueuse/head";
export { ClientOnly } from "./components";
import {
    findDependencies, renderPreloadLinks, renderPrefetchLinks, findIndexHtmlDependencies,
    renderPreloadLinksIndexHtml
} from "@/utils/html";
import {teleportsInject} from "@/utils/teleportsInject";
import type {CreatorOptions} from "@/types.d";

export type {Context, CreatorOptions};

// Server side rendering
const createViteSsrVue:SsrHandler = (App, options: CreatorOptions = {}) => {

    // manifest - for prod build
    return async(url, {manifest, ssrManifest, ...extra } = {}) => {
        const app = createSSRApp(App, options.rootProps);
        const serializer = options.serializer || serialize;
        const ssrContext: {
            url: URL,
            isClient: boolean,
            initialState: Record<string, any>
            [key: string]: any
        } = {
            url: createUrl(url),
            isClient: false,
            initialState: {},
            ...extra,
        };
        ssrManifest = ssrManifest || manifest;
        const { head, router, store, inserts, context, pinia } =
        (options.created &&
            (await options.created({
                app,
                ...ssrContext,
            }))) ||
        {};

        // Router default behavior
        if(router && url) {
            await router.push(url);
            await router.isReady();
        }

        options.mounted && (await options.mounted({
            app,
            router,
            store,
            pinia,
            ...ssrContext,
        }));

        if(store) {
            ssrContext.initialState.state = store.state; // Vuex
        }
        if(pinia) {
            ssrContext.initialState.pinia = pinia.state.value; //Pinia
        }

        const body = inserts?.body || await renderToString(app, Object.assign(ssrContext, context || {})); // add modules to ssrContext
        let headTags = inserts?.headTags || "",
            htmlAttrs = inserts?.htmlAttrs || "",
            bodyAttrs = inserts?.bodyAttrs || "",
            dependencies = inserts?.dependencies || [];

        // head default behavior
        if(head) {
            ({headTags, htmlAttrs, bodyAttrs} = await renderHeadToString(head));
        }

        // Предзагрузка для стилей и js основной сборки
        // Нужен manifest.json
        if(options.preloadIndexHtml && manifest) {
            const preloadIndexHtmlFiles = findIndexHtmlDependencies(manifest);
            const links = renderPreloadLinksIndexHtml(preloadIndexHtmlFiles);
            headTags += (links.length ? "\n" + links.join("\n"): "");
        }

        if(ssrManifest) {
            const {preload, prefetch} = findDependencies(
                ssrContext.modules,
                ssrManifest,
                options.shouldPreload,
                options.shouldPrefetch
            );
            dependencies =  preload;

            if(preload.length > 0) {
                const links = renderPreloadLinks(preload);
                headTags += (links.length ? "\n" + links.join("\n"): "");
            }

            if(prefetch.length > 0) {
                const links = renderPrefetchLinks(prefetch);
                headTags += links.length ? "\n" + links.join("\n") : "";
            }
        }

        options.rendered && (await options.rendered({
            app,
            router,
            store,
            pinia,
            ...ssrContext,
        }));

        const initialState = await serializer(ssrContext.initialState || {});
        const teleports = ssrContext?.teleports || {};

        return {
            html: teleportsInject(`__VITE_SSR_VUE_HTML__`, teleports),
            htmlAttrs,
            bodyAttrs,
            headTags,
            body,
            initialState,
            dependencies,
            teleports
        };
    };
};
export default createViteSsrVue;