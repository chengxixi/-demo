<template>
  <button
    class="block w-full p-4 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400"
    type="button"
    @click="emit('select', item)"
  >
    <div
      class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <StatusBadge :status="item.status" />
          <span class="text-sm font-medium text-slate-500">{{
            item.source
          }}</span>
          <span class="text-sm text-slate-400">{{ item.createdAt }}</span>
        </div>
        <h3 class="mt-2 text-base font-semibold text-slate-950">
          {{ item.title }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.summary }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="tag in item.tags"
            :key="tag"
            class="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      <div
        class="flex shrink-0 flex-col gap-1 text-sm text-slate-500 sm:items-end"
      >
        <span>负责人：{{ item.owner }}</span>
        <span :class="priorityClass">优先级：{{ item.priority }}</span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import StatusBadge from '@/components/StatusBadge.vue';
import type { FeedbackItem } from '@/types/feedback';

interface Props {
  item: FeedbackItem;
}

interface Emits {
  select: [item: FeedbackItem];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const priorityClass = computed(() => {
  const classes: Record<FeedbackItem['priority'], string> = {
    P0: 'text-rose-600',
    P1: 'text-amber-600',
    P2: 'text-sky-600',
    P3: 'text-slate-500',
  };

  return classes[props.item.priority];
});
</script>
