<script setup lang="ts">
import { competitorData } from '@/api/mock-data'

const paramRows = [
  { label: '产品线', values: ['八电极秤', '体脂秤', '八电极秤'] },
  { label: '价格', values: ['$349.95', '$39.99', '¥399'] },
  { label: '销售渠道', values: ['Amazon / 独立站', 'Amazon / Walmart', '天猫 / 京东 / 抖音'] },
  { label: '核心卖点', values: ['高端健康管理', '低价高评价', '华为生态'] },
]
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">竞品分析/差评聚类</h2>
        <p class="text-xs text-gray-400 mt-0.5">整合市场动态、舆情监测和竞品产品档案，支撑需求机会识别与产品策略判断。</p>
      </div>
    </div>
    <div class="flex-1 overflow-auto p-6">
      <!-- Competitor Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          v-for="comp in competitorData"
          :key="comp.name"
          class="bg-white border border-gray-200 rounded-lg p-5 min-h-[220px] flex flex-col gap-2.5"
        >
          <span class="inline-flex self-start px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold">
            {{ comp.line }}
          </span>
          <h3 class="text-base font-extrabold text-gray-900 leading-tight">{{ comp.name }}</h3>
          <p class="text-xs text-gray-500">ASIN: {{ comp.asin }}</p>
          <strong class="text-lg font-extrabold text-gray-900">{{ comp.price }}</strong>
          <span class="text-xs text-gray-600 font-bold">{{ comp.channels }}</span>
          <div class="flex flex-wrap gap-2 mt-auto">
            <span
              v-for="(p, i) in comp.params.split(' / ')"
              :key="i"
              class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-extrabold"
            >{{ p }}</span>
          </div>
        </div>
      </div>

      <!-- Comparison Table -->
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">对比参数</h3>
        </div>
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">参数项</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">Withings</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">RENPHO</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">华为</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paramRows" :key="row.label" class="border-b border-gray-100">
              <td class="px-3 py-2 font-extrabold text-gray-700">{{ row.label }}</td>
              <td v-for="(val, i) in row.values" :key="i" class="px-3 py-2 font-bold text-gray-600">{{ val }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
