import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import ssr from "vite-ssr-vue/plugin";

export default defineConfig({
    plugins: [
        ssr(),
        vue()
    ]
});