<script setup lang="ts">
    defineProps<{
        label: string;
        variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    }>();
</script>

<template>
    <span
        :class="{
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold': true,
            'bg-gray-100 text-gray-600': !variant || variant === 'default',
            'bg-green-50 text-green-700': variant === 'success',
            'bg-orange-50 text-orange-700': variant === 'warning',
            'bg-red-50 text-red-700': variant === 'danger',
            'bg-blue-50 text-blue-700': variant === 'info',
        }"
    >
        {{ label }}
    </span>
</template>
