import type {Plugin, Connect, ResolvedConfig, UserConfig} from "vite";
import {createHandler} from "./serve/handler";
import {rollupBuild} from "./build/rollup";

import type {PluginOptions} from "./types";

export {PluginOptions};
export interface PluginOptionsInternal {
    name:string,
    ssr?: string,
    wrappers: {
        client:string,
        server:string
    }
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