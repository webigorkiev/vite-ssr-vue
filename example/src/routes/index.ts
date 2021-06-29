import {createRouter, createMemoryHistory, createWebHistory} from "vue-router";
import HelloWorld from "../components/HelloWorld.vue";
import HelloVueRouter from "../components/HelloVueRouter.vue";
import HelloVuex from "../components/HelloVuex.vue";
import HelloVite from "../components/HelloVite.vue";

// declare global {
//     interface ImportMeta {
//         env: {
//            SSR: boolean
//         };
//     }
// }

export default () => createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: [
        { path: "/", component: HelloWorld },
        { path: "/router", component: HelloVueRouter },
        { path: "/vuex", component: HelloVuex },
        { path: "/vite", component: HelloVite },
    ]
});