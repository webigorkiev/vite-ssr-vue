import {ViteDevServer} from "vite";

declare global {
    var server: ViteDevServer;
}

/**
 * Close Vite server
 */
export default async() => {
    await global.server.close();
};