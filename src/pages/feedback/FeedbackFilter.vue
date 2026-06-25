<script setup lang="ts">
import { Search, Filter } from 'lucide-vue-next'
import { siteOptions, sourceOptions, processRouteOptions, processStateOptions, exceptionLevels, returnOptions, feedbackTabOptions } from '@/api/mock-data'

const props = defineProps<{
  searchQuery: string
  activeTab: string
  filterVisible: boolean
  filters: Record<string, string>
  tabCounts: { all: number; pending: number; review: number; done: number; mine: number }
}>()

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:activeTab', value: string): void
  (e: 'update:filterVisible', value: boolean): void
  (e: 'update:filters', value: Record<string, string>): void
  (e: 'resetFilters'): void
}>()

function handleTabChange(key: string) {
  emit('update:activeTab', key)
}

function handleFilterChange(key: string, value: string) {
  emit('update:filters', { ...props.filters, [key]: value })
}

function handleToggleFilter() {
  emit('update:filterVisible', !props.filterVisible)
}
</script>

<template>
  <div class="px-6 pt-3 bg-white border-b border-gray-200">
    <!-- Search -->
    <div class="relative mb-2">
      <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
      <input
        :value="searchQuery"
        type="search"
        placeholder="搜索反馈ID、ASIN、型号、原文关键词"
        class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
        @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 -mb-px">
      <button
        v-for="tab in feedbackTabOptions"
        :key="tab.key"
        class="px-4 py-2 text-xs font-extrabold border-b-2 transition-colors"
        :class="activeTab === tab.key ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
        <span v-if="tab.key === 'all'" class="ml-1 text-gray-400">({{ tabCounts.all }})</span>
        <span v-else-if="tab.key === 'pending'" class="ml-1 text-gray-400">({{ tabCounts.pending }})</span>
        <span v-else-if="tab.key === 'review'" class="ml-1 text-gray-400">({{ tabCounts.review }})</span>
        <span v-else-if="tab.key === 'done'" class="ml-1 text-gray-400">({{ tabCounts.done }})</span>
      </button>
      <button
        class="ml-auto px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
        :class="{ 'text-blue-600 border-blue-300 bg-blue-50': filterVisible }"
        @click="handleToggleFilter"
      >
        <Filter class="w-3 h-3 inline mr-1" />
        {{ filterVisible ? '收起筛选' : '筛选' }}
      </button>
    </div>

    <!-- Filter Panel -->
    <div v-if="filterVisible" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 py-3 border-t border-gray-100">
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        数据来源
        <select :value="filters.source" class="h-7 text-xs border border-gray-200 rounded px-1.5" @change="handleFilterChange('source', ($event.target as HTMLSelectElement).value)">
          <option value="">全部</option>
          <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        创建方式
        <select :value="filters.mode" class="h-7 text-xs border border-gray-200 rounded px-1.5" @change="handleFilterChange('mode', ($event.target as HTMLSelectElement).value)">
          <option value="">全部</option>
          <option value="AI自动创建">AI自动创建</option>
          <option value="人工录入">人工录入</option>
        </select>
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        品牌
        <input :value="filters.brand" placeholder="输入品牌" class="h-7 text-xs border border-gray-200 rounded px-1.5" @input="handleFilterChange('brand', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        站点
        <select :value="filters.site" class="h-7 text-xs border border-gray-200 rounded px-1.5" @change="handleFilterChange('site', ($event.target as HTMLSelectElement).value)">
          <option value="">全部</option>
          <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        设备类型
        <input :value="filters.productType" placeholder="输入设备类型" class="h-7 text-xs border border-gray-200 rounded px-1.5" @input="handleFilterChange('productType', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        销售型号
        <input :value="filters.model" placeholder="输入销售型号" class="h-7 text-xs border border-gray-200 rounded px-1.5" @input="handleFilterChange('model', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        内部型号/料号
        <input :value="filters.internal" placeholder="输入内部型号" class="h-7 text-xs border border-gray-200 rounded px-1.5" @input="handleFilterChange('internal', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        反馈人
        <input :value="filters.feedbackUser" placeholder="输入反馈人" class="h-7 text-xs border border-gray-200 rounded px-1.5" @input="handleFilterChange('feedbackUser', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        反馈开始时间
        <input type="date" :value="filters.dateFrom" class="h-7 text-xs border border-gray-200 rounded px-1.5" @input="handleFilterChange('dateFrom', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        反馈结束时间
        <input type="date" :value="filters.dateTo" class="h-7 text-xs border border-gray-200 rounded px-1.5" @input="handleFilterChange('dateTo', ($event.target as HTMLInputElement).value)" />
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        状态
        <select :value="filters.processState" class="h-7 text-xs border border-gray-200 rounded px-1.5" @change="handleFilterChange('processState', ($event.target as HTMLSelectElement).value)">
          <option value="">全部</option>
          <option v-for="s in processStateOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        异常等级
        <select :value="filters.exception" class="h-7 text-xs border border-gray-200 rounded px-1.5" @change="handleFilterChange('exception', ($event.target as HTMLSelectElement).value)">
          <option value="">全部</option>
          <option v-for="s in exceptionLevels" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        处理去向
        <select :value="filters.processRoute" class="h-7 text-xs border border-gray-200 rounded px-1.5" @change="handleFilterChange('processRoute', ($event.target as HTMLSelectElement).value)">
          <option value="">全部</option>
          <option v-for="s in processRouteOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
        退换货
        <select :value="filters.returned" class="h-7 text-xs border border-gray-200 rounded px-1.5" @change="handleFilterChange('returned', ($event.target as HTMLSelectElement).value)">
          <option value="">全部</option>
          <option v-for="s in returnOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <div class="flex items-end">
        <button class="btn-secondary text-xs h-7" @click="emit('resetFilters')">重置筛选</button>
      </div>
    </div>
  </div>
</template>
