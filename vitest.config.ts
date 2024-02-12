import {defineConfig} from "vitest/config";
import path from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    resolve: {
        alias: [
            {
                find: /^~(.+)/,
                replacement: path.resolve("./node_modules") + "/$1"
            },
            {
                find: /@\/(.*)/,
                replacement: path.resolve("./src") + "/$1"
            }
        ],
    },
    plugins: [

        //@ts-ignore
        vue(),
    ],
    test: {
        name: 'helpers',
        root: "./",
        include: ["./tests/*.[jt]s?(x)"],
        exclude: ["**/node_modules/**"],
        environment: "jsdom",
        globals: true,
        globalSetup: ["./scripts/vitest.global.setup.ts"],
        testTimeout: 15000,
        hookTimeout: 15000,
        //@ts-ignore
        threads: false,

        // @ts-ignore
        poolOptions: {
            threads: {
                singleThread: true
            }
        }
    }
});