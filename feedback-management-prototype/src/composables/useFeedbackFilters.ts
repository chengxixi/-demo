import { computed, type Ref } from 'vue';

import type { FeedbackItem, FeedbackStatusFilter } from '@/types/feedback';

export const useFeedbackFilters = (
  items: Ref<FeedbackItem[]>,
  selectedStatus: Ref<FeedbackStatusFilter>,
) => {
  const filterOptions: Array<{ label: string; value: FeedbackStatusFilter }> = [
    { label: '全部', value: 'all' },
    { label: '待分流', value: 'pending' },
    { label: '处理中', value: 'processing' },
    { label: '已解决', value: 'resolved' },
  ];

  const filteredFeedback = computed(() => {
    if (selectedStatus.value === 'all') {
      return items.value;
    }

    return items.value.filter((item) => item.status === selectedStatus.value);
  });

  const stats = computed(() => [
    { label: '反馈总数', value: items.value.length },
    {
      label: '待分流',
      value: items.value.filter((item) => item.status === 'pending').length,
    },
    {
      label: '处理中',
      value: items.value.filter((item) => item.status === 'processing').length,
    },
  ]);

  return {
    filteredFeedback,
    filterOptions,
    stats,
  };
};
