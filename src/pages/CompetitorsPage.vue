<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next';
import { competitorData } from '@/api/mock-data';
</script>

<template>
  <div class="p-6 max-w-[1200px] mx-auto">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">竞品分析</h2>
    <div class="grid grid-cols-3 gap-4">
      <div
        v-for="item in competitorData"
        :key="item.name"
        class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-800">{{ item.name }}</h3>
          <ExternalLink :size="14" class="text-gray-300" />
        </div>
        <div class="space-y-2.5 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">ASIN</span>
            <span class="text-gray-700 font-mono text-xs">{{ item.asin }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">产品线</span>
            <span class="text-gray-700">{{ item.line }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">价格</span>
            <span class="text-gray-700 font-medium">{{ item.price }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">渠道</span>
            <span class="text-gray-700">{{ item.channels }}</span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t border-gray-50">
          <span class="text-xs text-gray-400">参数特性</span>
          <div class="flex flex-wrap gap-1.5 mt-2">
            <span
              v-for="tag in item.params.split(' / ')"
              :key="tag"
              class="inline-flex px-2 py-1 rounded-md bg-brand-50 text-brand-600 text-xs font-medium"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
