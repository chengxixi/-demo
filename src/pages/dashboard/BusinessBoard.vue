<script setup lang="ts">
import { ref } from 'vue'
import { TrendingDown, TrendingUp, HelpCircle } from 'lucide-vue-next'
import {
  dashboardMetricCards, metricFormulas,
  trendLineData, trendXLabels,
  modelTop5Data, returnVsFeedbackData,
  filterPeriodOptions, filterBrandOptions, filterSiteOptions,
  filterProductTypeOptions, filterModelOptions, filterSourceOptions,
} from '@/api/mock-data'

const props = defineProps<{
  filters: Record<string, string>
  comparison: '环比' | '同比'
  changeKey: 'mom' | 'yoy'
  formatNum: (n: number) => string
  formatChange: (n: number) => string
}>()

const emit = defineEmits<{
  'update:filters': [value: Record<string, string>]
  'update:comparison': [value: '环比' | '同比']
}>()

const showFormula = ref<string | null>(null)

function handleFilterChange(key: string, value: string) {
  emit('update:filters', { ...props.filters, [key]: value })
}

function handleComparisonChange(value: '环比' | '同比') {
  emit('update:comparison', value)
}

// ===== Trend line chart SVG helpers =====
const chartW = 900
const chartH = 220
const chartMargin = { top: 18, right: 10, bottom: 26, left: 34 }
const chartMax = 100

function yScale(val: number): number {
  return chartMargin.top + (1 - val / chartMax) * (chartH - chartMargin.top - chartMargin.bottom)
}
function xScale(idx: number): number {
  return chartMargin.left + (idx / 12) * (chartW - chartMargin.left - chartMargin.right)
}
function linePath(values: number[]): string {
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(v)}`).join(' ')
}
function areaPath(values: number[]): string {
  return `${linePath(values)} L ${xScale(values.length - 1)} ${chartH - chartMargin.bottom} L ${xScale(0)} ${chartH - chartMargin.bottom} Z`
}

const filterOptions = [
  { label: '时间周期', key: 'period', options: filterPeriodOptions },
  { label: '品牌', key: 'brand', options: filterBrandOptions },
  { label: '站点', key: 'site', options: filterSiteOptions },
  { label: '产品类型', key: 'productType', options: filterProductTypeOptions },
  { label: '产品型号', key: 'model', options: filterModelOptions },
  { label: '反馈来源', key: 'source', options: filterSourceOptions },
]
</script>

<template>
  <div class="space-y-5">
    <!-- Filter Bar -->
    <section class="flex flex-wrap items-end gap-3 mb-4 bg-white border border-gray-200 rounded-lg p-3">
      <label v-for="opt in filterOptions" :key="opt.key" class="flex flex-col gap-1">
        <span class="text-xs font-bold text-gray-500">{{ opt.label }}</span>
        <select
          :value="(filters as Record<string, string>)[opt.key]"
          class="px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
          @change="handleFilterChange(opt.key, ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="o in opt.options" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>
    </section>

    <!-- Comparison Toggle -->
    <div class="flex items-center gap-2 mb-2">
      <span class="text-xs font-bold text-gray-500">对比维度：</span>
      <button
        class="px-3 py-1 text-xs font-bold rounded-md border transition-colors"
        :class="comparison === '环比' ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-white text-gray-600 border-gray-300'"
        @click="handleComparisonChange('环比')"
      >环比</button>
      <button
        class="px-3 py-1 text-xs font-bold rounded-md border transition-colors"
        :class="comparison === '同比' ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-white text-gray-600 border-gray-300'"
        @click="handleComparisonChange('同比')"
      >同比</button>
    </div>

    <!-- Metric Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <article
        v-for="card in dashboardMetricCards"
        :key="card.label"
        class="relative bg-white border rounded-lg p-4 cursor-pointer group"
        :class="card.trendType.includes('bad') ? 'border-l-[3px] border-l-red-500' : 'border-l-[3px] border-l-blue-500'"
        @click="showFormula = showFormula === card.label ? null : card.label"
      >
        <div class="flex items-center gap-1 text-xs font-bold text-gray-500">
          <span>{{ card.label }}</span>
          <HelpCircle class="w-3 h-3 text-gray-300" />
        </div>
        <strong class="block text-2xl font-extrabold mt-1 text-gray-900">{{ card.value }}</strong>
        <div
          class="inline-flex items-center gap-0.5 text-xs font-bold"
          :class="card.trendType.includes('good') ? 'text-green-600' : 'text-red-500'"
        >
          <TrendingUp v-if="card.trendType.startsWith('up')" class="w-3 h-3" />
          <TrendingDown v-else class="w-3 h-3" />
          {{ card.trend }}
        </div>
        <div v-if="card.note1" class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span class="text-[11px] text-gray-400">{{ card.note1 }}</span>
          <b class="text-xs font-bold text-gray-700">{{ card.note2 }}</b>
        </div>
        <!-- Formula tooltip -->
        <div
          v-if="showFormula === card.label && metricFormulas[card.label]"
          class="absolute top-full left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs font-bold text-gray-700 min-w-[200px] mt-1"
        >
          {{ metricFormulas[card.label] }}
        </div>
      </article>
    </div>

    <!-- Key Metric Trend Line Chart -->
    <section class="bg-white border border-gray-200 rounded-lg">
      <div class="px-4 py-3 border-b border-gray-200 flex items-center gap-1">
        <h3 class="text-sm font-extrabold text-gray-900">关键指标趋势（{{ filters.period }}）</h3>
        <HelpCircle class="w-3.5 h-3.5 text-gray-300" />
      </div>
      <div class="p-4">
        <!-- Legend -->
        <div class="flex items-center gap-4 mb-3">
          <span v-for="s in trendLineData" :key="s.label" class="flex items-center gap-1.5 text-xs font-bold text-gray-600">
            <i class="inline-block w-3 h-3 rounded-sm" :style="{ background: s.color }"></i>
            {{ s.label }}
          </span>
          <select class="ml-auto text-xs border border-gray-300 rounded px-2 py-1">
            <option>按天</option>
            <option>按周</option>
          </select>
        </div>
        <!-- SVG Chart -->
        <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="w-full" role="img" aria-label="关键指标趋势图">
          <defs>
            <linearGradient id="closeRateArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#22a06b" stop-opacity="0.16" />
              <stop offset="100%" stop-color="#22a06b" stop-opacity="0.02" />
            </linearGradient>
          </defs>
          <!-- Y grid + labels -->
          <g v-for="gy in [0, 25, 50, 75, 100]" :key="gy">
            <line :x1="chartMargin.left" :x2="chartW - chartMargin.right" :y1="yScale(gy)" :y2="yScale(gy)" stroke="#f0f0f0" />
            <text :x="chartMargin.left - 10" :y="yScale(gy) + 4" text-anchor="end" class="fill-gray-400 text-[10px]">{{ gy }}%</text>
          </g>
          <!-- X labels -->
          <g v-for="(xl, i) in trendXLabels" :key="xl">
            <line :x1="xScale(i * 2)" :x2="xScale(i * 2)" :y1="chartMargin.top" :y2="chartH - chartMargin.bottom" stroke="#f8f8f8" />
            <text :x="xScale(i * 2)" :y="chartH - 6" text-anchor="middle" class="fill-gray-400 text-[10px]">{{ xl }}</text>
          </g>
          <!-- Area for 闭环率 -->
          <path :d="areaPath(trendLineData[0].values)" fill="url(#closeRateArea)" />
          <!-- Lines + dots -->
          <g v-for="s in trendLineData" :key="s.label">
            <path :d="linePath(s.values)" fill="none" :stroke="s.color" :stroke-width="s.width" stroke-linecap="round" stroke-linejoin="round" />
            <circle
              v-for="(v, i) in s.values"
              v-show="i % 2 === 0"
              :key="i"
              :cx="xScale(i)"
              :cy="yScale(v)"
              :r="s.width + 1"
              fill="#fff"
              :stroke="s.color"
              stroke-width="2"
            />
          </g>
          <!-- Callout -->
          <g>
            <line :x1="xScale(12)" :x2="xScale(12)" :y1="chartMargin.top" :y2="chartH - chartMargin.bottom" stroke="#e0e0e0" stroke-dasharray="3,3" />
            <rect :x="xScale(12) - 116" y="16" width="108" height="56" rx="6" fill="#fff" stroke="#e0e0e0" />
            <text :x="xScale(12) - 104" y="38" class="fill-gray-700 text-[11px] font-bold">闭环率 91.0%</text>
            <text :x="xScale(12) - 104" y="58" class="fill-gray-700 text-[11px] font-bold">响应达成 88.0%</text>
          </g>
        </svg>
      </div>
    </section>

    <!-- Model TOP5 Table + Return vs Feedback -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Model TOP5 -->
      <section class="bg-white border border-gray-200 rounded-lg">
        <div class="px-4 py-3 border-b border-gray-200 flex items-center gap-1">
          <h3 class="text-sm font-extrabold text-gray-900">产品型号表现 TOP10</h3>
          <HelpCircle class="w-3.5 h-3.5 text-gray-300" />
        </div>
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">排名</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">产品型号</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">销量</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">反馈量</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">退货率</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">差评率</th>
              <th class="text-center px-3 py-2 font-extrabold text-gray-600">评分</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in modelTop5Data"
              :key="row[0]"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-3 py-2 font-bold text-gray-500">{{ idx + 1 }}</td>
              <td class="px-3 py-2 font-bold text-gray-900">{{ row[0] }}</td>
              <td class="px-3 py-2 text-right font-bold text-gray-700">{{ formatNum(row[1]) }}</td>
              <td class="px-3 py-2 text-right font-bold text-gray-700">{{ formatNum(row[2]) }}</td>
              <td class="px-3 py-2 text-right font-bold" :class="idx === 1 || idx === 4 ? 'text-red-500' : 'text-green-600'">{{ row[3] }}</td>
              <td class="px-3 py-2 text-right font-bold" :class="idx === 1 || idx === 4 ? 'text-red-500' : 'text-green-600'">{{ row[6] }}</td>
              <td class="px-3 py-2 text-center font-bold text-green-600">{{ row[5] }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Return vs Feedback -->
      <section class="bg-white border border-gray-200 rounded-lg">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">退货率 vs 反馈率（按产品类型）</h3>
        </div>
        <div class="p-4">
          <div class="flex items-center gap-4 mb-3">
            <span class="flex items-center gap-1.5 text-xs font-bold text-gray-600">
              <i class="inline-block w-3 h-3 rounded-sm bg-blue-500"></i>退货率
            </span>
            <span class="flex items-center gap-1.5 text-xs font-bold text-gray-600">
              <i class="inline-block w-3 h-3 rounded-sm bg-orange-500"></i>反馈率
            </span>
          </div>
          <div class="flex items-end justify-around gap-4 h-48">
            <div v-for="item in returnVsFeedbackData" :key="item[0]" class="flex flex-col items-center gap-2 flex-1">
              <div class="flex items-end gap-1 h-full">
                <div class="flex flex-col items-center justify-end">
                  <span class="text-[10px] font-bold text-blue-600 mb-0.5">{{ item[1] }}%</span>
                  <div class="w-8 rounded-t bg-blue-500" :style="{ height: `${item[1] * 8}px` }"></div>
                </div>
                <div class="flex flex-col items-center justify-end">
                  <span class="text-[10px] font-bold text-orange-600 mb-0.5">{{ item[2] }}%</span>
                  <div class="w-8 rounded-t bg-orange-500" :style="{ height: `${item[2] * 6}px` }"></div>
                </div>
              </div>
              <span class="text-xs font-bold text-gray-600">{{ item[0] }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
