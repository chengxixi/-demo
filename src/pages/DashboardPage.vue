<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, TrendingDown, TrendingUp, HelpCircle, AlertTriangle } from 'lucide-vue-next'
import { modelRankingData, metricCards, metricFormulas, emergencyData } from '@/api/mock-data'

const compareMode = ref<'mom' | 'yoy'>('mom')
const showFormula = ref<string | null>(null)
const searchQuery = ref('')

const momValues = [['4.38%', '-0.72%'], ['12.67%', '-1.34%'], ['87.45%', '+3.21%'], ['92.16%', '+4.57%'], ['6.72%', '+0.89%'], ['3.25%', '-0.31%']]
const yoyValues = [['4.91%', '+0.48%'], ['13.24%', '+2.06%'], ['86.03%', '-1.18%'], ['89.74%', '+1.92%'], ['7.18%', '+1.16%'], ['3.62%', '+0.27%']]

const internalMap: Record<string, [string, string]> = {
  'YB-S100 八电极体脂秤': ['YL-S100-8', 'PN-S100-8E'],
  'YB-201 人体成分秤': ['YL-201-BIA', 'PN-201-B'],
  'YB-301 体脂秤 Pro': ['YL-301-PRO', 'PN-301-P'],
  'YB-M3 筋膜枪 M3 Pro': ['YL-M3-PRO', 'PN-M3-MASS'],
  'YB-F1 智能体脂秤 F1': ['YL-F1-SCALE', 'PN-F1-BIA'],
  'YB-CS10 入门体脂秤': ['YL-CS10-4', 'PN-CS10-4E'],
  'YB-BF511 八电极体脂秤': ['YL-BF511-8', 'PN-BF511'],
  'YB-MS30 深层筋膜枪': ['YL-MS30', 'PN-MS30-MASS'],
  'YB-S30 人体秤': ['YL-S30', 'PN-S30-WT'],
  'YB-F2 智能体脂秤 F2': ['YL-F2-SCALE', 'PN-F2-BIA'],
}

const filteredModels = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return modelRankingData
  return modelRankingData.filter(m => {
    const [internal, partNo] = internalMap[m.model] || ['', '']
    return `${m.model} ${internal} ${partNo}`.toLowerCase().includes(q)
  })
})

const getMetrics = computed(() => compareMode.value === 'mom' ? momValues : yoyValues)

function isGoodDelta(idx: number, delta: string): boolean {
  // For index 4 (异常占比), positive is bad
  if (idx === 4) return !delta.startsWith('+')
  return delta.startsWith('-')
}

const sourceDistribution = [
  { source: '商品评论', count: 2 },
  { source: '退货原因', count: 1 },
  { source: 'APP反馈', count: 1 },
  { source: '客服沟通', count: 2 },
]
const maxSourceCount = Math.max(...sourceDistribution.map(s => s.count))
</script>

<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900">反馈仪表盘</h2>
        <p class="text-sm text-gray-500 mt-1">Core metrics and model ranking overview</p>
      </div>
      <div class="flex gap-2">
        <button
          class="px-3 py-1.5 text-xs font-bold rounded-md border"
          :class="compareMode === 'mom' ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-white text-gray-600 border-gray-300'"
          @click="compareMode = 'mom'"
        >环比</button>
        <button
          class="px-3 py-1.5 text-xs font-bold rounded-md border"
          :class="compareMode === 'yoy' ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-white text-gray-600 border-gray-300'"
          @click="compareMode = 'yoy'"
        >同比</button>
      </div>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <div
        v-for="(card, idx) in metricCards"
        :key="card.label"
        class="relative bg-white border rounded-lg p-4 cursor-pointer group"
        :class="idx === 4 ? 'border-l-3 border-l-red-500' : 'border-l-3 border-l-blue-500'"
        style="border-left-width: 3px;"
        @click="showFormula = showFormula === card.label ? null : card.label"
      >
        <span class="text-xs font-bold text-gray-500">{{ card.label }}</span>
        <strong class="block text-2xl font-extrabold mt-1">{{ getMetrics[idx][0] }}</strong>
        <span
          class="inline-flex items-center gap-0.5 text-xs font-bold"
          :class="isGoodDelta(idx, getMetrics[idx][1]) ? 'text-green-600' : 'text-red-500'"
        >
          <TrendingDown v-if="isGoodDelta(idx, getMetrics[idx][1])" class="w-3 h-3" />
          <TrendingUp v-else class="w-3 h-3" />
          {{ getMetrics[idx][1] }}
        </span>
        <button class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
          <HelpCircle class="w-3 h-3" />
        </button>
        <!-- Formula tooltip -->
        <div
          v-if="showFormula === card.label && metricFormulas[card.label]"
          class="absolute top-12 right-2 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs font-bold text-gray-700 min-w-[200px]"
        >
          {{ metricFormulas[card.label] }}
        </div>
      </div>
    </div>

    <!-- Model Ranking Table -->
    <div class="bg-white border border-gray-200 rounded-lg mb-6">
      <div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-sm font-extrabold text-gray-900">产品型号表现 TOP10</h3>
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="search"
            placeholder="搜索内部型号或料号"
            class="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md w-52 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
          />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">排名</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">产品型号</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">内部型号/料号</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">销量</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">反馈量</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">退货率</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">反馈率</th>
              <th class="text-center px-3 py-2 font-extrabold text-gray-600">评分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredModels.length === 0">
              <td colspan="8" class="text-center py-10 text-gray-400 text-sm font-bold">未找到匹配的内部型号或料号</td>
            </tr>
            <tr
              v-for="(model, idx) in filteredModels"
              :key="model.model"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-3 py-2 font-bold text-gray-500">{{ idx + 1 }}</td>
              <td class="px-3 py-2 font-bold text-gray-900">{{ model.model }}</td>
              <td class="px-3 py-2">
                <span class="block text-gray-500 font-semibold leading-tight">{{ internalMap[model.model]?.[0] || '待补充' }}</span>
                <span class="block text-[11px] text-gray-400 font-medium">{{ internalMap[model.model]?.[1] || '待补充' }}</span>
              </td>
              <td class="px-3 py-2 text-right font-bold text-gray-700">{{ model.sales }}</td>
              <td class="px-3 py-2 text-right font-bold text-gray-700">{{ model.feedback }}</td>
              <td class="px-3 py-2 text-right font-bold text-gray-700">{{ model.returnRate }}</td>
              <td class="px-3 py-2 text-right font-bold text-gray-700">{{ model.feedbackRate }}</td>
              <td class="px-3 py-2 text-center">
                <span class="inline-flex items-center gap-1 text-yellow-500 font-bold">
                  <Star class="w-3 h-3 fill-yellow-400" /> {{ model.rating }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bottom Panels -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Emergency Alerts -->
      <div class="bg-white border border-gray-200 rounded-lg">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-red-500" />
            紧急异常动态（近24小时）
          </h3>
        </div>
        <div class="p-4 space-y-3">
          <div
            v-for="ex in emergencyData"
            :key="ex.id"
            class="flex items-start gap-3 p-3 rounded-lg border"
            :class="ex.overdue ? 'border-red-300 bg-red-50' : 'border-gray-100'"
          >
            <span
              class="flex-shrink-0 px-2 py-0.5 rounded text-[11px] font-black"
              :class="ex.level === 'P0' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'"
            >{{ ex.level }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-gray-900 truncate">{{ ex.issue }}</p>
              <p class="text-[11px] text-gray-500 mt-0.5">{{ ex.deadline }}</p>
            </div>
            <span
              class="flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold"
              :class="ex.overdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'"
            >{{ ex.status }}</span>
          </div>
        </div>
      </div>

      <!-- Source Distribution -->
      <div class="bg-white border border-gray-200 rounded-lg">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">反馈来源分布</h3>
        </div>
        <div class="p-4 space-y-3">
          <div v-for="item in sourceDistribution" :key="item.source" class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-600 w-16">{{ item.source }}</span>
            <div class="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full bg-blue-500 rounded-full transition-all"
                :style="{ width: `${(item.count / maxSourceCount) * 100}%` }"
              ></div>
            </div>
            <span class="text-xs font-extrabold text-gray-700 w-6 text-right">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
