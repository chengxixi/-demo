<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import * as echarts from 'echarts'
import {
  dashboardMetricCards,
  filterBrandOptions,
  filterRegionOptions,
  filterModelOptions,
  filterPeriodOptions,
  filterProductTypeOptions,
  filterSiteOptions,
  modelTop5Data,
  returnVsFeedbackData,
  trendLineData,
  trendXLabels,
} from '@/api/mock'

const props = defineProps<{
  filters: Record<string, string | string[]>
  comparison: '环比' | '同比'
  changeKey: 'mom' | 'yoy'
  formatNum: (value: number) => string
  formatChange: (value: number) => string
}>()

const emit = defineEmits<{
  (event: 'update:filters', value: Record<string, string | string[]>): void
  (event: 'update:comparison', value: '环比' | '同比'): void
}>()

const trendChartRef = useTemplateRef<HTMLDivElement>('trendChart')
const returnChartRef = useTemplateRef<HTMLDivElement>('returnChart')
let trendChart: echarts.ECharts | null = null
let returnChart: echarts.ECharts | null = null

const filterOptions = [
  { label: '时间周期', key: 'period', options: filterPeriodOptions },
  { label: '地区', key: 'region', options: filterRegionOptions },
  { label: '品牌', key: 'brand', options: filterBrandOptions },
  { label: '平台', key: 'site', options: filterSiteOptions },
  { label: '产品类型', key: 'productType', options: filterProductTypeOptions },
  { label: '产品型号', key: 'model', options: filterModelOptions },
]

const modelRows = computed(() => {
  return modelTop5Data.map((row, index) => ({
    rank: index + 1,
    model: row[0],
    sales: Number(row[1]),
    feedback: Number(row[2]),
    returnRate: row[3],
    feedbackRate: row[4],
    score: row[5],
    badReviewRate: row[6],
  }))
})

function updateFilter(key: string, value: unknown) {
  emit('update:filters', {
    ...props.filters,
    [key]: key === 'period' ? String(value || '') : Array.isArray(value) ? value.map(String) : [],
  })
}

function trendColor(trend: string) {
  return trend.trim().startsWith('-') ? 'red' : 'green'
}

function updateComparison(value: unknown) {
  emit('update:comparison', String(value) as '环比' | '同比')
}

function renderCharts() {
  if (!trendChartRef.value || !returnChartRef.value) {
    return
  }

  trendChart ||= echarts.init(trendChartRef.value)
  returnChart ||= echarts.init(returnChartRef.value)

  trendChart.setOption({
    color: trendLineData.map((item) => item.color),
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 8 },
    grid: { left: 42, right: 24, top: 48, bottom: 36 },
    xAxis: { type: 'category', boundaryGap: false, data: trendXLabels },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: trendLineData.map((line) => ({
      name: line.label,
      type: 'line',
      smooth: true,
      symbolSize: 8,
      lineStyle: { width: line.width },
      data: line.values,
    })),
  })

  returnChart.setOption({
    color: ['#2563eb', '#f97316'],
    tooltip: { trigger: 'axis' },
    legend: { top: 0, right: 8 },
    grid: { left: 42, right: 18, top: 48, bottom: 36 },
    xAxis: { type: 'category', data: returnVsFeedbackData.map((row) => row[0]) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      {
        name: '退货率',
        type: 'bar',
        barWidth: 18,
        data: returnVsFeedbackData.map((row) => row[1]),
      },
      {
        name: '反馈率',
        type: 'bar',
        barWidth: 18,
        data: returnVsFeedbackData.map((row) => row[2]),
      },
    ],
  })
}

function resizeCharts() {
  trendChart?.resize()
  returnChart?.resize()
}

onMounted(async () => {
  await nextTick()
  renderCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  trendChart?.dispose()
  returnChart?.dispose()
})

watch(
  () => props.filters,
  () => {
    nextTick(renderCharts)
  },
  { deep: true },
)
</script>

<template>
  <div class="space-y-5">

    <a-card :bordered="false" class="dashboard-filter-card">
      <a-row :gutter="[12, 12]">
        <a-col v-for="item in filterOptions" :key="item.key" :xs="12" :md="8" :lg="4">
          <label class="filter-field">
            <span>{{ item.label }}</span>
            <a-select
              :value="props.filters[item.key]"
              class="w-full"
              :placeholder="item.label"
              :mode="item.key === 'period' ? undefined : 'multiple'"
              :max-tag-count="1"
              :options="item.options.map((option: string) => ({ label: option, value: option }))"
              @change="updateFilter(item.key, $event)"
            />
          </label>
        </a-col>
      </a-row>
    </a-card>

    <div class="comparison-row">
      <a-segmented :value="props.comparison" :options="['环比', '同比']" @change="updateComparison" />
    </div>

    <a-row :gutter="[12, 12]">
      <a-col v-for="card in dashboardMetricCards" :key="card.label" :xs="12" :md="8" :lg="4">
        <a-card size="small" class="metric-card">
          <a-statistic :title="card.label" :value="card.value" />
          <div class="metric-note-row">
            <a-tag :color="trendColor(card.trend)">
              {{ props.comparison }} {{ card.trend }}
            </a-tag>
            <a-typography-text type="secondary" class="metric-note">
              <span>{{ card.note1 }}</span>
              <strong>{{ card.note2 }}</strong>
            </a-typography-text>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :xl="14">
        <a-card title="关键指标趋势" :bordered="false">
          <div ref="trendChart" class="chart-panel" />
        </a-card>
      </a-col>
      <a-col :xs="24" :xl="10">
        <a-card title="退货率 vs 反馈率" :bordered="false">
          <div ref="returnChart" class="chart-panel" />
        </a-card>
      </a-col>
    </a-row>

    <a-card title="产品型号表现 TOP5" :bordered="false">
      <vxe-table :data="modelRows" border size="mini" stripe show-overflow :export-config="{}">
        <vxe-column field="rank" title="排名" width="70" />
        <vxe-column field="model" title="产品型号" min-width="180" />
        <vxe-column field="sales" title="销量" width="100" align="right">
          <template #default="{ row }">{{ props.formatNum(row.sales) }}</template>
        </vxe-column>
        <vxe-column field="feedback" title="反馈量" width="100" align="right" />
        <vxe-column field="badReviewRate" title="差评率" width="100" />
        <vxe-column field="score" title="评分" width="80" />
        <vxe-column field="returnRate" title="退货率" width="100" />
        <vxe-column field="feedbackRate" title="反馈率" width="100" />
      </vxe-table>
    </a-card>
  </div>
</template>

<style scoped>
.dashboard-filter-card,
.metric-card {
  border-radius: 8px;
}

.metric-note-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
}

.metric-note {
  display: grid;
  gap: 2px;
  min-width: 0;
  white-space: normal;
}

.metric-note span,
.metric-note strong {
  overflow-wrap: anywhere;
}

.metric-note strong {
  color: #8c8c8c;
  font-weight: 500;
}

.comparison-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
}

.chart-panel {
  height: 320px;
  min-height: 320px;
  width: 100%;
}

.filter-field {
  display: grid;
  gap: 6px;
  margin: 0;
  color: #475467;
  font-size: 12px;
  font-weight: 700;
}

.filter-field span {
  line-height: 1.2;
}
</style>
