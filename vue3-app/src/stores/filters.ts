import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { GlobalFilters } from '@/types/feedback';

export const useFilterStore = defineStore('filters', () => {
  const filters = ref<GlobalFilters>({
    timeRange: '30d',
    site: '全部站点',
    brand: '全部品牌',
    productType: '全部产品类型',
    salesModel: '全部',
    source: '全部',
    compareMode: '环比',
  });

  const updateFilter = <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    filters.value[key] = value;
  };

  const resetFilters = () => {
    filters.value = {
      timeRange: '30d',
      site: '全部站点',
      brand: '全部品牌',
      productType: '全部产品类型',
      salesModel: '全部',
      source: '全部',
      compareMode: '环比',
    };
  };

  return { filters, updateFilter, resetFilters };
});
