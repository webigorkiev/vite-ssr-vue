import type {SsrHandler, Context} from "@/types.d";
import {createSSRApp} from "vue";
import {renderToString} from "@vue/server-renderer";
import {serialize} from "@/utils/serialize";
import {createUrl} from "@/utils/createUrl";
import {renderHeadToString} from "@vueuse/head";
export { ClientOnly } from "./components";
import {findDependencies, renderPreloadLinks, renderPrefetchLinks} from "@/utils/html";
import {teleportsInject} from "@/utils/teleportsInject";
import type {CreatorOptions} from "@/types.d";

export type {Context, CreatorOptions};

/**
 * Create client instance of vue app
 */
const createViteSsrVue:SsrHandler = (App, options: CreatorOptions = {}) => {

    // manifest - for prod build
    return async(url, {manifest, ...extra } = {}) => {
        const app = createSSRApp(App, options.rootProps);
        const serializer = options.serializer || serialize;
        const ssrContext: {
            isClient: boolean,
            initialState: Record<string, any>
            [key: string]: any
        } = {
            url,
            isClient: false,
            initialState: {},
            ...extra,
        };
        const { head, router, store, inserts, context } =
        (options.created &&
            (await options.created({
                url: createUrl(url),
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
            url: createUrl(url),
            app,
            router,
            store,
            ...ssrContext,
        }));

        // store default behavior
        if(store) {
            ssrContext.initialState.state = store.state;
        }

        const body = inserts?.body || await renderToString(app, Object.assign(ssrContext, context || {}));
        let headTags = inserts?.headTags || "",
            htmlAttrs = inserts?.htmlAttrs || "",
            bodyAttrs = inserts?.bodyAttrs || "",
            dependencies = inserts?.dependencies || [];

        // head default behavior
        if(head) {
            ({headTags, htmlAttrs, bodyAttrs} = await renderHeadToString(head));
        }

        if(manifest) {
            const {preload, prefetch} = findDependencies(
                ssrContext.modules,
                manifest,
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