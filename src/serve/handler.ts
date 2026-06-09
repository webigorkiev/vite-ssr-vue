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
import {getClientIp} from "@/utils/getClientIp";
import {genErrorPage} from "@/serve/genErrorPage";

const readIndexTemplate = async(server: ViteDevServer, url: string) => await server.transformIndexHtml(
    url,
    await fs.readFile(path.resolve(server.config.root, "index.html"), "utf-8")
);

const replaceEnteryPoint = (server: ViteDevServer, name: string, wrapper: string) => {
    const alias = server.config.resolve.alias.find(
        item => typeof item.replacement === "string" && item.replacement.indexOf(name) === 0
    );

    if(alias) {
        alias.replacement = wrapper;
    }
};

export const createHandler = (server: ViteDevServer, options: PluginOptionsInternal): Connect.NextHandleFunction => {

    return async(req, res, next) => {
        const response = res as http.ServerResponse & {redirect: (url: string, statusCode: 301|307) => void};

        if(req.method !== "GET" || !req.originalUrl) {
            return next(); // Следующий обработчик
        }
        response.redirect = (url: string, statusCode: 301|307 = 307) => {
            response.statusCode = statusCode;
            response.setHeader("location", url);
            response.end();
        };
        const headers = req.headers as Record<string, any>;
        const protocol = headers["x-forwarded-proto"] || (server.config?.server?.https ? "https" : "http"); // По параметру Vite
        const hostname = headers.host || ""; // На dev просто  = ""
        const url = `${protocol}://${hostname}${req.originalUrl}`;
        let ssrError:any = null;
        const context: Context = {
            hostname,
            protocol,
            url,
            cookies: cookieParse(headers["cookie"]),
            ip: getClientIp(req),
            memcache: null,
            statusCode: 200,
            headers: req.headers as Record<string, string|string[]>,
            responseHeaders: {"content-type": "text/html; charset=utf-8"},
            // SSR Error
            onError: (err: any) => ssrError = err
        };

        try {
            replaceEnteryPoint(server, options.name, options.wrappers.server);
            const template = await readIndexTemplate(server, req.originalUrl);
            const entry = options.ssr || entryFromTemplate(template);

            if(!entry) {
                throw new Error("Entry point for ssr not found");
            }
            const entryResolve = path.join(server.config.root, entry);
            const ssrModule = await server.ssrLoadModule(entryResolve);
            const render = ssrModule.default || ssrModule;
            const htmlParts = await render(url, {req, res: response, context});
            if(ssrError) {
                throw ssrError;
            }
            const html = teleportsInject(buildHtml(template, htmlParts),htmlParts.teleports);
            response.statusCode = context.statusCode;
            Object.keys(context.responseHeaders).forEach(key => response.setHeader(key, context.responseHeaders[key]));
            response.end(html);
        } catch(e: any) {
            if(String(e.code).toLowerCase() === "redirect") {
                return;
            }
            server.ssrFixStacktrace(e);
            console.error('SSR Error:', e);
            response.statusCode = 500;
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(genErrorPage({
                error: e,
                req,
                url,
                context
            }));

        } finally {
            replaceEnteryPoint(server, options.name, options.wrappers.client);
        }
    };
};