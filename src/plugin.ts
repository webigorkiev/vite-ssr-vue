import type {Plugin, Connect, ResolvedConfig, UserConfig} from "vite";
import {createHandler} from "./serve/handler";
import type { HeadClient } from "@vueuse/head";
import type {App} from "vue";
import type {Router} from "vue-router";
import build from "./build";

export interface CreateOptions {
    app: App,
    router?:Router,
    transformState?:CallableFunction
}

/**
 * Plugin options
 */
export interface Options {
    ssr: string
}

type HookResponse = void | {
    head?: HeadClient
}

export type Hook = (params: {
    url?: URL | Location,
    app: App,
    router?:Router,
    isClient: boolean
    initialState: Record<string, any>
}) => HookResponse | Promise<HookResponse>

/**
 * Vite plugin
 * @param options
 */
export default (options: Options): Plugin => {

    return {
        name: "vite-ssr-vue",
        config(config): UserConfig {

            return {
                ssr: {
                    external: ["vite-ssr-vue"]
                }
            } as UserConfig
        },
        async configResolved(config:ResolvedConfig): Promise<void> {

            // @ts-ignore
            if(config.command === "build" && !config.inlineConfig.build.isBuild) {
                await build(config, options);
                process.exit(1);
            } else {
                config.logger.info("\n -- SSR mode\n");
            }
        },
        async configureServer(server) {
            const handler = createHandler(server, options);

            return (): Connect.Server => server.middlewares.use(handler)
        }
    }
}