<script setup lang="ts">
    defineProps<{ message?: string; icon?: string }>();
</script>

<template>
    <div class="flex flex-col items-center justify-center py-16 text-gray-400">
        <span class="text-5xl mb-3">{{ icon || '📭' }}</span>
        <p class="text-sm">{{ message || '暂无数据' }}</p>
        <slot />
    </div>
</template>
