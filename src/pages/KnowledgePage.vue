<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, ChevronDown } from 'lucide-vue-next'
import { knowledgeData } from '@/api/mock-data'

const searchQuery = ref('')
const expandedId = ref<string | null>(null)

const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return knowledgeData
  return knowledgeData.filter(item =>
    item.question.toLowerCase().includes(q) ||
    item.answer.toLowerCase().includes(q) ||
    item.tags.some(t => t.toLowerCase().includes(q))
  )
})

function toggle(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="text-lg font-extrabold text-gray-900">Q&A/案例库</h2>
      <p class="text-xs text-gray-400 mt-0.5">用户反馈处理标准问答 - 根据所选反馈整理可复用的客服回复、排查步骤和用户解释口径。</p>
    </div>
    <div class="flex-1 overflow-auto p-6">
      <!-- Banner -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
        <span class="text-xs font-bold text-blue-700">Q&A新增视频指引 - 部分高频问题的处理步骤已增加短视频教程，可直接转发给用户。</span>
        <button class="text-[11px] font-bold text-blue-600 hover:underline">了解更多</button>
      </div>

      <!-- Search -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchQuery"
          type="search"
          placeholder="搜索Q&A、案例关键词"
          class="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
        />
      </div>

      <!-- Q&A List -->
      <div class="space-y-2">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <button
            class="w-full text-left px-4 py-3 flex items-start justify-between gap-3 hover:bg-gray-50 transition-colors"
            @click="toggle(item.id)"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-600">{{ item.category }}</span>
                <span class="text-[10px] text-gray-400">{{ item.date }}</span>
              </div>
              <h3 class="text-sm font-extrabold text-gray-900">{{ item.question }}</h3>
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600"
                >#{{ tag }}</span>
              </div>
            </div>
            <ChevronDown
              class="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400 transition-transform"
              :class="{ 'rotate-180': expandedId === item.id }"
            />
          </button>
          <div v-if="expandedId === item.id" class="px-4 pb-4 border-t border-gray-100">
            <div class="pt-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{{ item.answer }}</div>
          </div>
        </div>
        <div v-if="filteredItems.length === 0" class="text-center py-8 text-gray-400 text-sm font-bold">
          未找到匹配的Q&A内容
        </div>
      </div>
    </div>
  </div>
</template>
