import { ref, onMounted, defineComponent } from "vue";

export const ClientOnly = defineComponent({
    name: "ClientOnly",
    setup(props, { slots }) {
        const show = ref(false);
        onMounted(() => {
            show.value = true;
        });

        return () => (show.value && slots.default ? slots.default() : null);
    },
});
