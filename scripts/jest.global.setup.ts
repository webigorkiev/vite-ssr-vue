import {createServer, ViteDevServer} from "vite";
import fetch from "cross-fetch";
import {testsConfig} from "./jest.setup";

declare global {
    var server: ViteDevServer;
}

const { setup: setupPuppeteer } = require('jest-environment-puppeteer');

/**
 * Create Vite server
 */
export default async(config: Record<string, any>) => {
    await setupPuppeteer({
        headless: false
    });

    global.server = await createServer({
        server: {
            port: 3000
        }
    });
    await global.server.listen();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const url = new URL(testsConfig.host);
    const response = await fetch(url.toString());
};