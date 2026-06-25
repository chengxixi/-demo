<script setup lang="ts">
    defineProps<{ title: string; value: string | number; note?: string }>();
</script>

<template>
    <div class="bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-1">
        <span class="text-xs text-gray-500 font-medium uppercase tracking-wide">{{ title }}</span>
        <span class="text-2xl font-extrabold text-gray-900">{{ value }}</span>
        <span v-if="note" class="text-xs text-gray-400">{{ note }}</span>
    </div>
</template>
