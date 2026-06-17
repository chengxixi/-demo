<template>
  <span
    class="rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="badgeClass"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { FeedbackStatus } from '@/types/feedback';

interface Props {
  status: FeedbackStatus;
}

const props = defineProps<Props>();

const statusMeta: Record<FeedbackStatus, { label: string; className: string }> =
  {
    pending: {
      label: '待分流',
      className: 'bg-amber-50 text-amber-700',
    },
    processing: {
      label: '处理中',
      className: 'bg-sky-50 text-sky-700',
    },
    resolved: {
      label: '已解决',
      className: 'bg-emerald-50 text-emerald-700',
    },
  };

const label = computed(() => statusMeta[props.status].label);
const badgeClass = computed(() => statusMeta[props.status].className);
</script>
