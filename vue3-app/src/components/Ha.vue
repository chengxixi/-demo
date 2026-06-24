<template>
  <div class="page-header">
    <p>{{ eyebrow }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string;
}>();
</script>
