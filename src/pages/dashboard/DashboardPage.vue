<script setup lang="ts">
import { ref, computed } from 'vue'
import { defaultFilters } from '@/api/mock-data'
import BusinessBoard from './BusinessBoard.vue'
import QualityBoard from './QualityBoard.vue'

const activeTab = ref<'business' | 'quality'>('business')
const comparison = ref<'环比' | '同比'>('环比')
const filters = ref<Record<string, string>>({ ...defaultFilters })

const changeKey = computed(() => comparison.value === '同比' ? 'yoy' : 'mom')

function formatNum(n: number): string {
  return Math.round(n).toLocaleString('zh-CN')
}

function formatChange(n: number): string {
  return n > 0 ? `↑${n}%` : n < 0 ? `↓${Math.abs(n)}%` : '0%'
}

function handleUpdateFilters(value: Record<string, string>) {
  filters.value = value
}

function handleUpdateComparison(value: '环比' | '同比') {
  comparison.value = value
}
</script>

<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <!-- Header -->
    <h1 class="text-lg font-extrabold text-gray-900 mb-4">反馈运营看板</h1>

    <!-- Tab Switcher -->
    <div class="flex items-center gap-2 mb-5 border-b border-gray-200">
      <button
        class="px-4 py-2 text-sm font-bold border-b-2 transition-colors"
        :class="activeTab === 'business' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'business'"
      >反馈仪表盘</button>
      <button
        class="px-4 py-2 text-sm font-bold border-b-2 transition-colors"
        :class="activeTab === 'quality' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'quality'"
      >问题仪表盘</button>
    </div>

    <!-- Business Tab -->
    <BusinessBoard
      v-if="activeTab === 'business'"
      :filters="filters"
      :comparison="comparison"
      :change-key="changeKey"
      :format-num="formatNum"
      :format-change="formatChange"
      @update:filters="handleUpdateFilters"
      @update:comparison="handleUpdateComparison"
    />

    <!-- Quality Tab -->
    <QualityBoard
      v-else
      :filters="filters"
      :comparison="comparison"
      :change-key="changeKey"
      :format-num="formatNum"
      :format-change="formatChange"
    />
  </div>
</template>
