import {createRouter, createWebHashHistory, createMemoryHistory} from "vue-router";
import HelloWorld from '../components/HelloWorld.vue'

declare global {
    interface ImportMeta {
        env: {
           SSR: boolean
        };
    }
}

export default () => createRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createMemoryHistory(),
    routes: [
        { path: '/', component: HelloWorld },
    ]
});