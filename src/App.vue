<script setup lang="ts">
    import { RouterView } from 'vue-router';
    import AppLayout from '@/components/layout/AppLayout.vue';
</script>

<template>
    <AppLayout>
        <RouterView v-slot="{ Component, route }">
            <KeepAlive v-if="route.meta.keepAlive">
                <component :is="Component" :key="route.path" />
            </KeepAlive>
            <component v-else :is="Component" :key="route.path" />
        </RouterView>
    </AppLayout>
</template>
