<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import {
  level1Categories, level2Categories, level3Categories,
  top5ComparisonData, comparisonLegend,
  emergencyTimelineData, emergencyStatusTags,
  topQualityIssues, qualityBoardSummary, qualityBoardActions,
} from '@/api/mock-data'

interface CategoryItem {
  name: string
  value: number
  color: string
  mom: number
  yoy: number
}

const props = defineProps<{
  filters: Record<string, string>
  comparison: '环比' | '同比'
  changeKey: 'mom' | 'yoy'
  formatNum: (n: number) => string
  formatChange: (n: number) => string
}>()

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

function getChange(item: CategoryItem, key: 'mom' | 'yoy'): number {
  return item[key]
}
</script>

<template>
  <div class="space-y-5">
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
</template>
