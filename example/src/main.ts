import {createSSRApp} from "vue";
import App from './App.vue'
import createRouter from "./routes"

export default () => {
    const app = createSSRApp(App);
    const router = createRouter();
    app.use(router);

    return {app, router};
}
