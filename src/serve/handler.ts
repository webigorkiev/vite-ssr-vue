import type {Connect, ViteDevServer} from "vite";
import type {PluginOptionsInternal} from "@/types";
import type {Context} from "@/types";
import {promises as fs} from "fs";
import path from "path";
import {buildHtml} from "@/utils/buildHtml";
import {teleportsInject} from "@/utils/teleportsInject";
import {entryFromTemplate} from "@/utils/entryFromTemplate";
import {cookieParse} from "@/utils/cookieParser";
import * as http from "http";

/**
 * Read and transform index.html
 * @param server vite dev server instance
 * @param url for current request
 */
const readIndexTemplate = async(server: ViteDevServer, url: string) => await server.transformIndexHtml(
    url,
    await fs.readFile(path.resolve(server.config.root, "index.html"), "utf-8")
);

/**
 * Replace client alias to server
 * @param server
 * @param name
 * @param wrapper
 */
const replaceEnteryPoint = (server: ViteDevServer, name: string, wrapper: string) => {
    const alias = server.config.resolve.alias.find(
        item => typeof item.replacement === "string" && item.replacement.indexOf(name) === 0
    );

    if(alias) {
        alias.replacement = wrapper;
    }
};

/**
 * @param server Vite dev server instance
 * @param options plugin options
 * @returns handler for dev server middleware
 */
export const createHandler = (server: ViteDevServer, options: PluginOptionsInternal): Connect.NextHandleFunction => {

    return async(req, res, next) => {
        const response = res as http.ServerResponse & {redirect: (url: string, statusCode: 301|307) => void};

        if(req.method !== "GET" || !req.originalUrl) {

            return next();
        }
        response.redirect = (url: string, statusCode: 301|307 = 307) => {
            response.statusCode = statusCode;
            response.setHeader("location", url);
            response.end();
        };

        try {
            replaceEnteryPoint(server, options.name, options.wrappers.server);
            const template = await readIndexTemplate(server, req.originalUrl);
            const entry = options.ssr || entryFromTemplate(template);

            if(!entry) {
                throw new Error("Entry point for ssr not found");
            }
            const entryResolve = path.join(server.config.root, entry);
            const ssrMoudile = await server.ssrLoadModule(entryResolve);
            const render = ssrMoudile.default || ssrMoudile;
            const headers = req.headers as Record<string, any>;
            const protocol = server.config?.server?.https ? "https" : "";
            const context: Context = {
                hostname: headers.host,
                protocol: headers["x-forwarded-proto"] || protocol || "http",
                url: req.originalUrl || "/",
                cookies: cookieParse(headers["cookie"]),
                ip: headers["x-forwarded-for"]?.split(/, /)?.[0] || req.socket.remoteAddress,
                memcache: null,
                statusCode: 200,
                headers: req.headers,
                responseHeaders: {"content-type": "text/html; charset=utf-8"},
            };
            const htmlParts = await render(req.originalUrl, {req, res: response, context});
            const html = teleportsInject(buildHtml(template, htmlParts),htmlParts.teleports);
            response.statusCode = context.statusCode;
            Object.keys(context.responseHeaders).map(key => response.setHeader(key, context.responseHeaders[key]));
            response.end(html);
        } catch(e: any) {
            server.ssrFixStacktrace(e);
        } finally {
            replaceEnteryPoint(server, options.name, options.wrappers.client);
        }
    };
};