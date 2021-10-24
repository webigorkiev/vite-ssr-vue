import {ViteDevServer} from "vite";

declare global {
    var server: ViteDevServer;
}

const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer');

/**
 * Close Vite server
 */
export default async() => {
    await teardownPuppeteer();
    await global.server.close();
};