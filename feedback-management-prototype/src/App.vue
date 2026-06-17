<template>
  <div class="min-h-screen bg-slate-100 text-slate-900">
    <AppHeader />
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <FeedbackList />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue';
import FeedbackList from '@/components/FeedbackList.vue';
</script>
