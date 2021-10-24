import {App, Component} from "vue";
import {HeadClient} from "@vueuse/head";
import {Router} from "vue-router";
import {Store} from "vuex";
import {SSRContext} from "@vue/server-renderer";

/**
 * Options for plugin
 *
 * ```typescript
 *  // vite.config.js
 *  import ssr from "vite-ssr-vue/plugin";
 *  import vue from "@vitejs/plugin-vue";
 *
 *  export default {
 *   plugins: [
 *       ssr({
 *           // PluginOptions
 *       }),
 *       vue(),
 *   ],
 * }
 * ```
 *
 */
export interface PluginOptions {

    /**
     * plugin name, default: vite-ssr-vue
     */
    name?:string,

    /**
     * way to server entry point, if you want to use this separately
     */
    ssr?: string
}

/**
 * Server side handler
 */
export type SsrHandler = (
    App: Component,
    options?: CreatorOptions
) => SsrRenderer

/**
 * Client side handler
 */
export type ClientHandler = (
    App: Component,
    options?: CreatorOptions
) => Promise<void>

/**
 * Application creator wrapper settings
 */
export interface CreatorOptions {
    created?:Hook,
    serializer?: (
        state: any
    ) => any | Promise<any>,
    shouldPreload?:(file: string, type: string) => boolean,
    shouldPrefetch?:(file: string, type: string) => boolean,
    mount?: {
        rootContainer?:any,
        isHydrate?: boolean,
        isSVG?: boolean
    },
    rootProps?:Record<string, any>|null
}

/**
 * Wrapper for ssr render
 */
export type SsrRenderer = (
    url: string | URL,
    options?: {
        manifest?: Record<string, string[]>,
        [key: string]: any
    }
) => Promise<{ html: string; dependencies: string[] }>

/**
 * Created hook params
 */
export type Hook = (params: {
    app: App
    url: URL | Location
    isClient: boolean
    initialState: Record<string, any>,
    context?: Context,
    [key: string]: any
}) => HookResponse | Promise<HookResponse>

/**
 * Created hook response
 */
type HookResponse = void | {
    head?: HeadClient,
    router?:Router,
    store?:Store<any>,
    inserts?: {
        htmlAttrs?:string,
        headTags?:string,
        bodyAttrs?:string,
        body?:string,
        dependencies?:Array<string>
    },
    context?:SSRContext
}

/**
 * Context that used for render server entry point for development
 * It needs a production implementation for your environment.
 * The context will go to the created hook parameters of the plugin
 */
export interface Context {
    hostname: string,
    protocol: string,
    url: string,
    cookies: Record<string, any>,
    ip: string,
    memcache: number|null,
    statusCode: number,
    headers: Record<string, any>,
    responseHeaders: Record<string, any>,
}