import {App, Component} from "vue";
import {HeadClient} from "@vueuse/head";
import {Router} from "vue-router";
import {Store} from "vuex";
import {SSRContext} from "@vue/server-renderer";
import {Connect, ViteDevServer} from "vite";

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
    ssr?: string,

    /**
     * Custom serve middleware
     * @param server - instance of ViteDevServer
     * @param options - options extends PluginOptionsInternal
     */
    serve?: (server: ViteDevServer, options: PluginOptionsInternal) => Connect.NextHandleFunction,

    /**
     * Any addition property
     */
    [key: string]: any
}

/**
 * Plugin options with addition params
 */
export interface PluginOptionsInternal extends PluginOptions {
    name:string,
    wrappers: {
        client:string,
        server:string
    }
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

    /**
     * Fire when app instance created
     */
    created?:Hook,

    /**
     * allows you to override the default serialization
     * @param state
     */
    serializer?: (
        state: any
    ) => any | Promise<any>,

    /**
     * shouldPreload aka [shouldPreload](https://ssr.vuejs.org/api/#shouldpreload)
     * @param file
     * @param type
     */
    shouldPreload?:(file: string, type: string) => boolean,

    /**
     * shouldPrefetch aka [shouldPrefetch](https://ssr.vuejs.org/api/#shouldprefetch)
     * @param file
     * @param type
     */
    shouldPrefetch?:(file: string, type: string) => boolean,

    /**
     * vue mount options (for client side)
     */
    mount?: {
        rootContainer?:any,
        isHydrate?: boolean,
        isSVG?: boolean
    },

    /**
     * vue root props
     */
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
 * If the parameter is returned, the default action is enabled
 * examle: if you return store,
 * auto add initialState
 * you can override this behavior(if you don’t return the store)
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

    /**
     * hostname (example.com)
     * as express req.hostname
     */
    hostname: string,

    /**
     * protocol (http)
     * as express req.protocol
     */
    protocol: string,

    /**
     * string current url
     * /search?q=something
     */
    url: string,

    /**
     * this property is an object that contains cookies sent by the request
     */
    cookies: Record<string, any>,

    /**
     * remote address (127.0.0.1)
     */
    ip: string,

    /**
     * special property for usin memcached
     */
    memcache: number|null,

    /**
     * response status code
     * default 200
     */
    statusCode: number,

    /**
     * Request headers
     */
    headers: Record<string, any>,

    /**
     * Response headers
     */
    responseHeaders: Record<string, any>,
}