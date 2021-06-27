import {createViteSsrVue} from "../../src/client";
import createApp from "./main";

createViteSsrVue(
    createApp,
    async({initialState}) => {
        console.log(initialState.myData);
    }
).then(app => app.mount('#app'));