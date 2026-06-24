import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  fetchFeedbackList,
  fetchWorkOrderList,
  fetchEmergencyList,
  fetchRequirementList,
  fetchCompetitorList,
  fetchKnowledgeList,
} from '@/api';
import type {
  FeedbackItem,
  WorkOrder,
  EmergencyException,
  Requirement,
  Competitor,
  KnowledgeItem,
} from '@/types';

export const useFeedbackStore = defineStore('feedback', () => {
  const list = ref<FeedbackItem[]>([]);
  const loading = ref(false);
  const activeTab = ref('all');

  async function load() {
    loading.value = true;
    try {
      list.value = await fetchFeedbackList();
    } finally {
      loading.value = false;
    }
  }

  const filteredList = computed(() => {
    if (activeTab.value === 'all') return list.value;
    if (activeTab.value === 'pending') return list.value.filter((i) => i.processState === '待处理');
    if (activeTab.value === 'review') return list.value.filter((i) => i.createMode === '人工录入');
    if (activeTab.value === 'done') return list.value.filter((i) => i.processState === '已关闭' || i.processState === '已转需求' || i.processState === '异常处理中');
    return list.value;
  });

  return { list, loading, activeTab, filteredList, load };
});

export const useWorkOrderStore = defineStore('workorder', () => {
  const list = ref<WorkOrder[]>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      list.value = await fetchWorkOrderList();
    } finally {
      loading.value = false;
    }
  }

  return { list, loading, load };
});

export const useEmergencyStore = defineStore('emergency', () => {
  const list = ref<EmergencyException[]>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      list.value = await fetchEmergencyList();
    } finally {
      loading.value = false;
    }
  }

  return { list, loading, load };
});

export const useRequirementStore = defineStore('requirement', () => {
  const list = ref<Requirement[]>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      list.value = await fetchRequirementList();
    } finally {
      loading.value = false;
    }
  }

  return { list, loading, load };
});

export const useCompetitorStore = defineStore('competitor', () => {
  const list = ref<Competitor[]>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      list.value = await fetchCompetitorList();
    } finally {
      loading.value = false;
    }
  }

  return { list, loading, load };
});

export const useKnowledgeStore = defineStore('knowledge', () => {
  const list = ref<KnowledgeItem[]>([]);
  const loading = ref(false);

  async function load() {
    loading.value = true;
    try {
      list.value = await fetchKnowledgeList();
    } finally {
      loading.value = false;
    }
  }

  return { list, loading, load };
});
