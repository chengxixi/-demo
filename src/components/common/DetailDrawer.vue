<script setup lang="ts">
    import { computed } from 'vue';

    const props = defineProps<{
        visible: boolean;
        title: string;
        width?: string;
    }>();

    const emit = defineEmits<{ (e: 'close'): void }>();

    const drawerWidth = computed(() => props.width || '480px');
</script>

<template>
    <Teleport to="body">
        <div v-if="visible" class="fixed inset-0 z-50 flex justify-end">
            <div class="absolute inset-0 bg-black/30" @click="emit('close')"></div>
            <div
                class="relative bg-white h-full overflow-y-auto shadow-xl"
                :style="{ width: drawerWidth, maxWidth: '100vw' }"
            >
                <div
                    class="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10"
                >
                    <h2 class="text-base font-extrabold text-gray-900">{{ title }}</h2>
                    <button
                        class="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                        @click="emit('close')"
                    >
                        <span class="text-gray-400 text-xl leading-none">&times;</span>
                    </button>
                </div>
                <div class="p-5">
                    <slot />
                </div>
            </div>
        </div>
    </Teleport>
</template>
