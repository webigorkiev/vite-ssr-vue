import {App, Component} from "vue";
import {HeadClient} from "@vueuse/head";
import {Router} from "vue-router";
import {Store} from "vuex";
import {SSRContext} from "@vue/server-renderer";
import {Connect, ViteDevServer} from "vite";
import {Pinia} from "pinia";

export interface PluginOptions {
    name?:string, // plugin name, default: vite-ssr-vue
    ssr?: string, // way to server entry point, if you want to use this separately

    /**
     * way to custom entry points
     * used for build production chunk
     * * for develop custom implementation must be used
     */
    custom?: {
        ws?: string,
        [key: string]: string
    }

    // Custom serve middleware
    serve?: (server: ViteDevServer, options: PluginOptionsInternal) => Connect.NextHandleFunction,
    [key: string]: any
}

// Plugin options with addition params
export interface PluginOptionsInternal extends PluginOptions {
    name:string,
    wrappers: {
        client:string,
        server:string
    }
}
export type SsrHandler = (
    App: Component,
    options?: CreatorOptions
) => SsrRenderer
export type ClientHandler = (
    App: Component,
    options?: CreatorOptions
) => Promise<void>
export interface CreatorOptions {
    created?:Hook, // Fire when app instance created
    mounted?:Hook, // Fire after all internal operations, as router isReady
    rendered?:Hook, // After ssr rendered or after replace state in client
    serializer?: ( // allows you to override the default serialization
        state: any
    ) => any | Promise<any>,

    // shouldPreload aka [shouldPreload](https://ssr.vuejs.org/api/#shouldpreload)
    shouldPreload?:(file: string, type: string) => boolean,

    // shouldPrefetch aka [shouldPrefetch](https://ssr.vuejs.org/api/#shouldprefetch)
    shouldPrefetch?:(file: string, type: string) => boolean,
    mount?: { // vue mount options (for client side)
        rootContainer?:any,
        isHydrate?: boolean,
        isSVG?: boolean
    },
    rootProps?:Record<string, any>|null // vue root props
}

// Wrapper for ssr render
export type SsrRenderer = (
    url: string | URL,
    options?: {
        manifest?: Record<string, string[]>,
        [key: string]: any
    }
) => Promise<{ html: string; dependencies: string[] }>

// Created hook params
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
    pinia?: Pinia,
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