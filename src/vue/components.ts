import {ref, onMounted, Component} from "vue";

export const ClientOnly: Component = {
    name: "ClientOnly",
    setup(props, { slots }) {
        const show = ref(false);
        onMounted(() => {
            show.value = true;
        });

        return () => (show.value && slots.default ? slots.default() : null);
    },
};
