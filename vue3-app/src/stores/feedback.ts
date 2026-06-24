import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FeedbackItem, FeedbackStatusFilter } from '@/types/feedback';

export const useFeedbackStore = defineStore('feedback', () => {
  const items = ref<FeedbackItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedStatus = ref<FeedbackStatusFilter>('all');
  const selectedFeedback = ref<FeedbackItem | null>(null);

  const filteredItems = computed(() => {
    if (selectedStatus.value === 'all') return items.value;
    return items.value.filter((item) => item.status === selectedStatus.value);
  });

  const stats = computed(() => {
    const total = items.value.length;
    const pending = items.value.filter((i) => i.status === 'pending').length;
    const processing = items.value.filter((i) => i.status === 'processing').length;
    const resolved = items.value.filter((i) => i.status === 'resolved').length;
    return { total, pending, processing, resolved };
  });

  const setItems = (data: FeedbackItem[]) => {
    items.value = data;
  };

  const setStatusFilter = (status: FeedbackStatusFilter) => {
    selectedStatus.value = status;
  };

  const selectFeedback = (item: FeedbackItem | null) => {
    selectedFeedback.value = item;
  };

  const updateFeedbackDisposition = (id: string, disposition: FeedbackItem['disposition']) => {
    const item = items.value.find((i) => i.id === id);
    if (item) {
      item.disposition = disposition;
    }
  };

  return {
    items,
    loading,
    error,
    selectedStatus,
    selectedFeedback,
    filteredItems,
    stats,
    setItems,
    setStatusFilter,
    selectFeedback,
    updateFeedbackDisposition,
  };
});
