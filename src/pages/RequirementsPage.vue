<script setup lang="ts">
import { ref } from 'vue';
import { Plus, ChevronDown } from 'lucide-vue-next';
import { requirementData } from '@/api/mock-data';

const expandedId = ref<string | null>(null);

function priorityClass(p: string) {
  if (p === '高') return 'bg-red-50 text-red-600';
  if (p === '中') return 'bg-yellow-50 text-yellow-600';
  return 'bg-gray-100 text-gray-500';
}

function statusClass(s: string) {
  if (s === '开发中') return 'bg-blue-50 text-blue-600';
  if (s === '待评估') return 'bg-yellow-50 text-yellow-600';
  return 'bg-gray-100 text-gray-500';
}

function toggle(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}
</script>

<template>
  <div class="p-6 max-w-[1200px] mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">需求管理</h2>
      <button class="flex items-center gap-1 px-3 py-1.5 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700">
        <Plus :size="14" />
        <span>新增需求</span>
      </button>
    </div>

    <div class="space-y-3">
      <div
        v-for="item in requirementData"
        :key="item.id"
        class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div class="p-4 cursor-pointer hover:bg-gray-50/50" @click="toggle(item.id)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <ChevronDown :size="16" :class="['transition-transform text-gray-400', expandedId === item.id ? '' : '-rotate-90']" />
              <span class="font-mono text-xs text-brand-600">{{ item.id }}</span>
              <span class="font-medium text-gray-800">{{ item.title }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span :class="['inline-flex px-2 py-0.5 rounded text-xs font-medium', priorityClass(item.priority)]">{{ item.priority }}</span>
              <span :class="['inline-flex px-2 py-0.5 rounded text-xs font-medium', statusClass(item.status)]">{{ item.status }}</span>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-2 ml-9 text-xs text-gray-400">
            <span>来源：{{ item.source }}</span>
            <span>负责人：{{ item.owner }}</span>
            <span>部门：{{ item.dept }}</span>
            <span>{{ item.date }}</span>
          </div>
        </div>
        <div v-if="expandedId === item.id" class="px-4 pb-4 pt-0 ml-9 border-t border-gray-50">
          <p class="text-sm text-gray-600 mt-3">{{ item.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
