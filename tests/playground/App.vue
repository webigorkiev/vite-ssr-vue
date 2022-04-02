<template>
    <div>Hello World!</div>
    <ClientOnly>
        <p>ClientOnly</p>
    </ClientOnly>
</template>

<script lang="ts">
    import {defineComponent} from "vue";
    import {ClientOnly} from "vite-ssr-vue";

    export default defineComponent({
        name: "App",
        components: {
            ClientOnly
        }
    });
</script>

<style scoped>

</style>