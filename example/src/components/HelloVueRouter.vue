<template>
    <h1>Hello Vue Router</h1>
    <p>
        Creating a Single-page Application with Vue + Vue Router feels natural:
        with Vue.js, we are already composing our application with components.
        When adding Vue Router to the mix, all we need to do is map our components
        to the routes and let Vue Router know where to render them.
    </p>
    <ClientOnly>
        <p>
            Client only content!
        </p>
    </ClientOnly>
</template>

<script lang="ts">
    import {defineComponent} from "vue";
    import {ClientOnly} from "vite-ssr-vue";

    export default defineComponent({
        name: "HelloVueRouter",
        components: {
            ClientOnly
        }
    })
</script>
