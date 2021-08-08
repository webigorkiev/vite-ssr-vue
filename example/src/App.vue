<template>
    <div>
        <router-link to="/">
            <img alt="Vue logo" src="./assets/logo.png" />
        </router-link>
        <ul>
            <li>
                <router-link to="/router">Hello Vue Router</router-link>
            </li>
            <li>
                <router-link to="/vuex">Hello Vuex</router-link>
            </li>
            <li>
                <router-link to="/vite">Hello Vite</router-link>
            </li>
        </ul>
        <RouterView />
        <Teleport to="body"></Teleport>
    </div>
</template>

<script lang="ts">
    import {defineComponent} from 'vue'

    export default defineComponent({
        name: 'App',
        inheritAttrs: false
    })
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-align: center;
        color: #2c3e50;
        max-width: 1024px;
        margin: 0 auto;
    }
    ul {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        padding-inline-start: 0;
        margin-block-start: 0;
        margin-block-end: 0;
    }
    li {
        list-style: none;
        text-align: center;
        min-width: 200px;
    }
    p {
        max-width: 600px;
        margin: 0 auto;
    }
</style>
