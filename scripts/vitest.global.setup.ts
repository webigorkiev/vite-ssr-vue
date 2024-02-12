import {createServer, ViteDevServer} from "vite";
import fetch from "cross-fetch";

declare global {
    var server: ViteDevServer;
}

const start = async(resolve: CallableFunction) => {
    try {
        await fetch(`http://localhost:3000/dev-start'`);
        resolve();
    } catch(e: any) {
        await new Promise(resolve => setTimeout(resolve, 100));
        await start(resolve);
    }
};

export async function setup() {
    global.server = await createServer({server: {host: "localhost", port: 3000}, mode: "development"});
    await global.server.listen();
    await new Promise(resolve => start(resolve));
}

export async function teardown() {
    await global.server.close();
}