<script setup lang="ts">
import { ref, computed } from 'vue';
import { Search, ChevronDown } from 'lucide-vue-next';
import { knowledgeData } from '@/api/mock-data';

const searchQuery = ref('');
const expandedId = ref<string | null>(null);

const filteredList = computed(() => {
  if (!searchQuery.value) return knowledgeData;
  const q = searchQuery.value.toLowerCase();
  return knowledgeData.filter(
    (item) =>
      item.question.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)),
  );
});

function toggle(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}
</script>

<template>
  <div class="p-6 max-w-[1000px] mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-800">Q&A / 案例库</h2>
      <div class="relative">
        <Search :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          v-model="searchQuery"
          placeholder="搜索问题和标签..."
          class="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:border-brand-400"
        />
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="item in filteredList"
        :key="item.id"
        class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div
          class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50"
          @click="toggle(item.id)"
        >
          <div class="flex items-center gap-3">
            <ChevronDown :size="16" :class="['transition-transform text-gray-400', expandedId === item.id ? '' : '-rotate-90']" />
            <span class="font-medium text-gray-800">{{ item.question }}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <span class="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs">{{ item.category }}</span>
            <span class="text-xs text-gray-400">{{ item.date }}</span>
          </div>
        </div>
        <div v-if="expandedId === item.id" class="px-4 pb-4 ml-10 border-t border-gray-50 pt-3">
          <p class="text-sm text-gray-600 leading-relaxed">{{ item.answer }}</p>
          <div class="flex flex-wrap gap-1.5 mt-3">
            <span
              v-for="tag in item.tags"
              :key="tag"
              class="inline-flex px-2 py-0.5 rounded-md bg-brand-50 text-brand-600 text-xs"
            >
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
