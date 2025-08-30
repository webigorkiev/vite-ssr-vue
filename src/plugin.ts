import type {Plugin, Connect, ResolvedConfig, UserConfig} from "vite";
import {createHandler} from "./serve/handler";
import {type BuildOptions, rollupBuild} from "./build/rollup";

import type {PluginOptions, PluginOptionsInternal} from "./types";
export type {PluginOptions, PluginOptionsInternal};


// Vite plugin vite-ssr-vue
export default (opt:PluginOptions = {}, buildOptions: BuildOptions = {}): Plugin => {
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
                    await rollupBuild(config, options, buildOptions);
                    process.exit(0);
                }
            } else {

                // Only for then replace in handler
                config.resolve.alias.push({
                    find: new RegExp(`^${options.name}$`),
                    replacement: options.wrappers.client
                });

                config.logger.info("\n --- SSR ---\n");
            }
        },
        async configureServer(server) {
            const handler = opt.serve ? opt.serve(server, options) : createHandler(server, options);

            return (): Connect.Server => server.middlewares.use(handler);
        }
    };
};