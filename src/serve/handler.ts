import type {Connect, ViteDevServer, ResolvedConfig} from "vite";
import type {Options} from "../plugin";
import {promises as fs} from "fs";
import path from "path";
import {buildHtml} from "../utils/buildHtml";

/**
 * Read and transform index.html
 * @param server vite dev server instance
 * @param url for current request
 */
const readIndexTemplate = async(server: ViteDevServer, url: string) => server.transformIndexHtml(
    url,
    await fs.readFile(path.resolve(server.config.root, "index.html"), "utf-8")
);

/**
 * @param server Vite dev server instance
 * @param options plugin options
 * @returns handler for dev server middleware
 */
export const createHandler = (server: ViteDevServer, options: Options): Connect.NextHandleFunction => {
    const config: ResolvedConfig & Options = {
        ...server.config,
        ...options
    };

    return async(req, res, next) => {

        if(req.method !== "GET" || !req.originalUrl) {

            return next();
        }
        
        try {
            const template = await readIndexTemplate(server, req.originalUrl);
            const entry = path.join(server.config.root, options.ssr);
            const ssrMoudile = await server.ssrLoadModule(entry);
            const handler = ssrMoudile.default || ssrMoudile;
            const render = handler();
            const htmlParts = await render(req.originalUrl);
            const html = buildHtml(template, htmlParts);

            res.setHeader("Content-Type", "text/html");
            res.end(html);
        } catch(e) {
            server.ssrFixStacktrace(e);
            console.log(e.stack);

            throw e;
        }
    }
}