<template>
  <section class="space-y-5">
    <div class="grid gap-4 md:grid-cols-3">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="rounded-lg border border-slate-200 bg-white p-4"
      >
        <p class="text-sm font-medium text-slate-500">{{ stat.label }}</p>
        <p class="mt-2 text-2xl font-semibold text-slate-950">
          {{ stat.value }}
        </p>
      </div>
    </div>

    <div class="rounded-lg border border-slate-200 bg-white">
      <div
        class="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 class="text-lg font-semibold text-slate-950">反馈列表</h2>
          <p class="mt-1 text-sm text-slate-500">
            统一查看用户反馈、异常与需求线索。
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in filterOptions"
            :key="option.value"
            class="rounded-md px-3 py-2 text-sm font-medium transition"
            :class="
              selectedStatus === option.value
                ? 'bg-slate-950 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            "
            type="button"
            @click="feedbackStore.setStatusFilter(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="p-8 text-center text-sm text-slate-500">
        正在加载反馈数据...
      </div>
      <div v-else-if="error" class="p-8 text-center text-sm text-rose-600">
        {{ error.message }}
      </div>
      <div
        v-else-if="filteredFeedback.length === 0"
        class="p-8 text-center text-sm text-slate-500"
      >
        暂无匹配的反馈数据
      </div>
      <div v-else class="divide-y divide-slate-200">
        <FeedbackCard
          v-for="item in filteredFeedback"
          :key="item.id"
          :item="item"
          @select="feedbackStore.selectFeedback"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';

import FeedbackCard from '@/components/FeedbackCard.vue';
import { useFeedbackFilters } from '@/composables/useFeedbackFilters';
import { useFeedbackStore } from '@/stores/feedback';

const feedbackStore = useFeedbackStore();
const { error, items, loading, selectedStatus } = storeToRefs(feedbackStore);
const { filteredFeedback, filterOptions, stats } = useFeedbackFilters(
  items,
  selectedStatus,
);

onMounted(() => {
  void feedbackStore.loadFeedback();
});
</script>
