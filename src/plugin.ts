import type {Component, App} from "vue";
import type {Plugin, Connect, ResolvedConfig, UserConfig} from "vite";
import type {HeadClient} from "@vueuse/head";
import type {Router} from "vue-router";
import type {Store} from "vuex";
import type {SSRContext} from "@vue/server-renderer";
import {createHandler} from "./serve/handler";
import {rollupBuild} from "./build/rollup";

export interface PluginOptions {
    name?:string,
    ssr?: string
}
export interface PluginOptionsInternal {
    name:string,
    ssr?: string,
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
interface CreatorOptions {
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
type SsrRenderer = (
    url: string | URL,
    options?: {
        manifest?: Record<string, string[]>,
        [key: string]: any
    }
) => Promise<{ html: string; dependencies: string[] }>
type Hook = (params: {
    app: App
    url: URL | Location
    isClient: boolean
    initialState: Record<string, any>,
    [key: string]: any
}) => HookResponse | Promise<HookResponse>
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
export interface Context {
    hostname: string,
    protocol: string,
    url: string,
    cookies: Record<string, any>,
    ip: string,
    memcache: number|null,
}

/**
 * Vite plugin vite-ssr-vue
 * @param opt plugin options
 */
export default (opt:PluginOptions = {}): Plugin => {
    const options = opt as PluginOptionsInternal;
    options.name = options.name || "vite-ssr-vue";
    options.wrappers = {
        client: `${options.name}/client`,
        server: `${options.name}/server`
    };

    return {
        name: options.name,
        config(): UserConfig {

            return {
                ssr: {
                    noExternal: [options.name]
                }
            } as UserConfig;
        },
        async configResolved(config:ResolvedConfig) {
            config.optimizeDeps.include = config.optimizeDeps.include || [];
            config.optimizeDeps.include.push(
                options.wrappers.client,
                options.wrappers.server
            );

            if(config.command === "build") {
                config.resolve.alias.push({
                    find: new RegExp(`^${options.name}$`),
                    replacement: config.build.ssr ? options.wrappers.server : options.wrappers.client
                });

                // @ts-ignore
                if(!config.build.isBuild) {
                    await rollupBuild(config, options);
                    process.exit(0);
                }
            } else {
                config.resolve.alias.push({
                    find: new RegExp(`^${options.name}$`),
                    replacement: options.wrappers.client
                });

                config.logger.info("\n --- SSR ---\n");
            }
        },
        async configureServer(server) {
            const handler = createHandler(server, options);

            return (): Connect.Server => server.middlewares.use(handler);
        }
    };
};