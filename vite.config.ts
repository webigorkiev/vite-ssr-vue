import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import viteSsrVue from "./src/plugin";

export default defineConfig({
    root: "./example",
    plugins: [
        viteSsrVue({
            name: "../../"
        }),
        vue()
    ]
});
