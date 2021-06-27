import {createSSRApp} from "vue";
import App from './App.vue'
import router from "./routes"

export default () => {
    const app = createSSRApp(App);
    app.use(router);

    return {app, router};
}
