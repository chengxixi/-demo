<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrendingDown, TrendingUp, HelpCircle, AlertTriangle } from 'lucide-vue-next'
import {
  dashboardMetricCards, metricFormulas,
  trendLineData, trendXLabels,
  modelTop5Data, returnVsFeedbackData,
  level1Categories, level2Categories, level3Categories,
  top5ComparisonData, comparisonLegend,
  emergencyTimelineData, emergencyStatusTags,
  topQualityIssues, qualityBoardSummary, qualityBoardActions,
  filterPeriodOptions, filterBrandOptions, filterSiteOptions,
  filterProductTypeOptions, filterModelOptions, filterSourceOptions,
  defaultFilters,
} from '@/api/mock-data'

const activeTab = ref<'business' | 'quality'>('business')
const comparison = ref<'环比' | '同比'>('环比')
const showFormula = ref<string | null>(null)
const filters = ref({ ...defaultFilters })

const changeKey = computed(() => comparison.value === '同比' ? 'yoy' : 'mom')

function formatNum(n: number): string {
  return Math.round(n).toLocaleString('zh-CN')
}

function formatChange(n: number): string {
  return n > 0 ? `↑${n}%` : n < 0 ? `↓${Math.abs(n)}%` : '0%'
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

// ===== Donut chart helpers =====
function donutGradient(items: { value: number; color: string }[]): string {
  const total = items.reduce((s, i) => s + i.value, 0)
  let acc = 0
  return items.map(i => {
    const start = acc
    acc += (i.value / total) * 100
    return `${i.color} ${start}% ${acc}%`
  }).join(', ')
}

interface CategoryItem {
  name: string
  value: number
  color: string
  mom: number
  yoy: number
}

function getChange(item: CategoryItem, key: 'mom' | 'yoy'): number {
  return item[key]
}
</script>

<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <!-- Filter Bar -->
    <section class="flex flex-wrap items-end gap-3 mb-4 bg-white border border-gray-200 rounded-lg p-3">
      <label v-for="opt in [
        { label: '时间周期', key: 'period', options: filterPeriodOptions },
        { label: '品牌', key: 'brand', options: filterBrandOptions },
        { label: '站点', key: 'site', options: filterSiteOptions },
        { label: '产品类型', key: 'productType', options: filterProductTypeOptions },
        { label: '产品型号', key: 'model', options: filterModelOptions },
        { label: '反馈来源', key: 'source', options: filterSourceOptions },
      ]" :key="opt.key" class="flex flex-col gap-1">
        <span class="text-xs font-bold text-gray-500">{{ opt.label }}</span>
        <select
          v-model="(filters as Record<string, string>)[opt.key]"
          class="px-2 py-1.5 text-xs border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500"
        >
          <option v-for="o in opt.options" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>
    </section>

    <!-- Tab Row -->
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
      <div class="flex-1"></div>
      <span class="text-xs font-bold text-gray-500">对比维度：</span>
      <button
        class="px-3 py-1 text-xs font-bold rounded-md border transition-colors"
        :class="comparison === '环比' ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-white text-gray-600 border-gray-300'"
        @click="comparison = '环比'"
      >环比</button>
      <button
        class="px-3 py-1 text-xs font-bold rounded-md border transition-colors"
        :class="comparison === '同比' ? 'bg-blue-50 text-blue-600 border-blue-300' : 'bg-white text-gray-600 border-gray-300'"
        @click="comparison = '同比'"
      >同比</button>
    </div>

    <!-- ===== Business Tab ===== -->
    <div v-if="activeTab === 'business'" class="space-y-5">
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

    <!-- ===== Quality Tab ===== -->
    <div v-else class="space-y-5">
      <!-- Donut Charts Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <section
          v-for="cat in [
            { title: `一级反馈分类（${filters.period}）`, items: level1Categories, centerLabel: '一级分类', centerValue: '100%' },
            { title: `二级反馈分类（${filters.period}）`, items: level2Categories, centerLabel: '二级分类', centerValue: '100%' },
            { title: `三级反馈分类（${filters.period}）`, items: level3Categories, centerLabel: '问题数', centerValue: '82' },
          ]"
          :key="cat.title"
          class="bg-white border border-gray-200 rounded-lg"
        >
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="text-sm font-extrabold text-gray-900">{{ cat.title }}</h3>
          </div>
          <div class="p-4 flex gap-4">
            <!-- Donut -->
            <div
              class="w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0"
              :style="{ background: `conic-gradient(${donutGradient(cat.items)})` }"
            >
              <div class="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center">
                <span class="text-[10px] text-gray-400">{{ cat.centerLabel }}</span>
                <strong class="text-sm font-extrabold text-gray-900">{{ cat.centerValue }}</strong>
              </div>
            </div>
            <!-- Legend -->
            <div class="flex-1 space-y-1">
              <div v-for="item in cat.items" :key="item.name" class="flex items-center gap-2 text-xs">
                <i class="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" :style="{ background: item.color }"></i>
                <span class="font-bold text-gray-600 flex-1 truncate">{{ item.name }}</span>
                <small
                  class="font-bold"
                  :class="getChange(item, changeKey) > 0 ? 'text-red-500' : getChange(item, changeKey) < 0 ? 'text-green-600' : 'text-gray-400'"
                  :title="`${comparison}${formatChange(getChange(item, changeKey))}`"
                >{{ formatChange(getChange(item, changeKey)) }}</small>
                <b class="font-extrabold text-gray-700">{{ item.value }}%</b>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Top 5 Comparison + Emergency Timeline -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <!-- Top 5 Comparison Bar Chart -->
        <section class="bg-white border border-gray-200 rounded-lg">
          <div class="px-4 py-3 border-b border-gray-200">
            <h3 class="text-sm font-extrabold text-gray-900">前5大三级反馈比例对比</h3>
          </div>
          <div class="p-4">
            <div class="flex items-center gap-4 mb-4">
              <span v-for="lg in comparisonLegend" :key="lg.label" class="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                <i class="inline-block w-3 h-3 rounded-sm" :style="{ background: lg.color }"></i>{{ lg.label }}
              </span>
            </div>
            <div class="flex items-end justify-around gap-4 h-48">
              <div v-for="item in top5ComparisonData" :key="item[0]" class="flex flex-col items-center gap-2 flex-1">
                <div class="flex items-end gap-1 h-full">
                  <div v-for="(val, vi) in [item[1], item[2], item[3]]" :key="vi" class="flex flex-col items-center justify-end">
                    <span class="text-[10px] font-bold text-gray-600 mb-0.5">{{ val }}%</span>
                    <div class="w-7 rounded-t" :style="{ height: `${val * 5}px`, background: comparisonLegend[vi].color }"></div>
                  </div>
                </div>
                <span class="text-xs font-bold text-gray-600 text-center leading-tight">{{ item[0] }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Emergency Timeline -->
        <section class="bg-white border border-gray-200 rounded-lg">
          <div class="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <AlertTriangle class="w-4 h-4 text-red-500" />
            <h3 class="text-sm font-extrabold text-gray-900">紧急异常动态（近24小时）</h3>
          </div>
          <div class="p-4 space-y-3">
            <div
              v-for="(ex, idx) in emergencyTimelineData"
              :key="ex.id"
              class="flex items-start gap-3 p-3 rounded-lg border"
              :class="ex.p === 'P1' ? 'border-red-300 bg-red-50' : ex.p === 'P2' ? 'border-orange-200 bg-orange-50' : 'border-gray-100'"
            >
              <span
                class="flex-shrink-0 px-2 py-0.5 rounded text-[11px] font-black"
                :class="ex.p === 'P1' ? 'bg-red-600 text-white' : ex.p === 'P2' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'"
              >{{ ex.p }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-gray-900">{{ ex.issue }}</p>
                <p class="text-[11px] text-gray-500 mt-0.5">{{ ex.source }} / {{ ex.status }}</p>
              </div>
              <span
                class="flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold"
                :class="idx === 0 ? 'bg-red-100 text-red-600' : idx === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-600'"
              >{{ emergencyStatusTags[idx] }}</span>
              <time class="flex-shrink-0 text-[11px] text-gray-400 font-bold">{{ ex.time }}</time>
            </div>
          </div>
        </section>
      </div>

      <!-- TOP Quality Issues Table -->
      <section class="bg-white border border-gray-200 rounded-lg">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">TOP质量问题（按占比）</h3>
        </div>
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">三级问题</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">涉及型号</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">反馈占比</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">趋势</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">主要型号</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">负责人</th>
              <th class="text-right px-3 py-2 font-extrabold text-gray-600">异常SLA</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in topQualityIssues"
              :key="row[0]"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-3 py-2 font-bold text-gray-900">{{ row[0] }}</td>
              <td class="px-3 py-2 text-gray-600">{{ row[1] }}</td>
              <td class="px-3 py-2 text-right font-bold text-gray-700">{{ row[2] }}</td>
              <td class="px-3 py-2 text-right font-bold" :class="String(row[3]).includes('+') ? 'text-red-500' : 'text-green-600'">{{ row[3] }}</td>
              <td class="px-3 py-2 text-gray-600">{{ row[4] }}</td>
              <td class="px-3 py-2 text-gray-600">{{ row[5] }}</td>
              <td class="px-3 py-2 text-right font-bold text-gray-700">{{ row[6] }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Quality Improvement Board -->
      <section class="bg-white border border-gray-200 rounded-lg">
        <div class="px-4 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">质量改善动作看板</h3>
        </div>
        <div class="p-4">
          <!-- Summary -->
          <div class="flex gap-6 mb-4 pb-4 border-b border-gray-100">
            <div class="flex flex-col">
              <span class="text-xs text-gray-400">改善任务</span>
              <strong class="text-xl font-extrabold text-gray-900">{{ qualityBoardSummary.tasks }}</strong>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-400">本周关闭</span>
              <strong class="text-xl font-extrabold text-gray-900">{{ qualityBoardSummary.closed }}</strong>
            </div>
            <div class="flex flex-col">
              <span class="text-xs text-gray-400">逾期风险</span>
              <strong class="text-xl font-extrabold text-red-500">{{ qualityBoardSummary.overdue }}</strong>
            </div>
          </div>
          <!-- Action rows -->
          <div class="space-y-3">
            <div
              v-for="action in qualityBoardActions"
              :key="action[0]"
              class="flex items-center gap-4"
            >
              <div class="flex-1">
                <strong class="text-sm font-bold text-gray-900 block">{{ action[0] }}</strong>
                <span class="text-xs text-gray-500">{{ action[1] }} / {{ action[2] }}</span>
              </div>
              <b class="text-sm font-extrabold text-gray-700 w-12 text-right">{{ action[3] }}%</b>
              <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <i class="block h-full rounded-full" :style="{ width: `${action[3]}%`, background: action[4] }"></i>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
