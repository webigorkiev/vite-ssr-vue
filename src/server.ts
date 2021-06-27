import type {Hook, CreateOptions} from "./plugin";
import {serialize} from "./utils/serialize";
import {findDependencies, renderPreloadLinks} from "./utils/html";
import { renderToString } from '@vue/server-renderer';
import { renderHeadToString } from '@vueuse/head';

declare global {
    interface Window {
        __INITIAL_STATE__:any;
    }
}
export type Renderer = (
    url?: string,
    options?: {
        manifest?: Record<string, string[]>
        preload?: boolean,
        [key: string]: any
    }
) => Promise<{ dependencies: string[] }>

/**
 * Create client instance of vue app
 * @param creator
 * @param hook
 * @returns render function
 */
export const createViteSsrVue = (
    creator: () => CreateOptions,
    hook?: Hook
): Renderer => {
    const {app, router, transformState} = creator();
    const transformer = transformState || serialize;

    return async (url?, { manifest, preload = false, ...extra } = {}) => {
        const context: {
            isClient: boolean,
            initialState: Record<string, any>
            [key: string]: any
        } = {
            url,
            isClient: false,
            initialState: {},
            ...extra,
        };

        const { head } =
        (hook &&
            (await hook({
                ...context,
            }))) ||
        {}

        if(router && url) {
            await router.push(url);
            await router.isReady();
            Object.assign(
                context.initialState,
                (router.currentRoute.value.meta || {}).state || {}
            )
        }

        const body = await renderToString(app, context);
        let { headTags = '', htmlAttrs = '', bodyAttrs = '' } = head
            ? renderHeadToString(head)
            : {};
        const dependencies = manifest ?
            findDependencies(context.modules, manifest)
            : []

        if (preload && dependencies.length > 0) {
            headTags += renderPreloadLinks(dependencies)
        }
        const initialState = await transformer(context.initialState || {});

        return {
            htmlAttrs,
            headTags,
            body,
            bodyAttrs,
            initialState,
            dependencies
        }
    }
}