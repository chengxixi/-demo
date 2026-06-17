import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { fetchFeedbackList } from '@/services/feedback';
import { normalizeApiError, type ApiError } from '@/services/http';
import type { FeedbackItem, FeedbackStatusFilter } from '@/types/feedback';

export const useFeedbackStore = defineStore('feedback', () => {
  const items = ref<FeedbackItem[]>([]);
  const loading = ref(false);
  const error = ref<ApiError | null>(null);
  const selectedStatus = ref<FeedbackStatusFilter>('all');
  const selectedFeedback = ref<FeedbackItem | null>(null);

  const hasFeedback = computed(() => items.value.length > 0);

  const loadFeedback = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      items.value = await fetchFeedbackList();
    } catch (caughtError: unknown) {
      error.value = normalizeApiError(caughtError);
    } finally {
      loading.value = false;
    }
  };

  const setStatusFilter = (status: FeedbackStatusFilter): void => {
    selectedStatus.value = status;
  };

  const selectFeedback = (item: FeedbackItem): void => {
    selectedFeedback.value = item;
  };

  return {
    error,
    hasFeedback,
    items,
    loading,
    loadFeedback,
    selectedFeedback,
    selectedStatus,
    selectFeedback,
    setStatusFilter,
  };
});
