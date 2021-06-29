import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import viteSsrVue from "vite-ssr-vue/plugin";

export default defineConfig({
    root: "./example",
    plugins: [
        viteSsrVue(),
        vue()
    ]
});
