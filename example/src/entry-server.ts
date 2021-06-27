import {createViteSsrVue} from "../../src/server";
import createApp from "./main";

export default () => createViteSsrVue(
    createApp,
    async({initialState}) => {
        initialState.myData = 'DB/API data';
    }
);