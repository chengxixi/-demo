<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import * as echarts from 'echarts'
import {
  emergencyTimelineData,
  filterBrandOptions,
  filterModelOptions,
  filterPeriodOptions,
  filterProductTypeOptions,
  filterSiteOptions,
  filterSourceOptions,
  level1Categories,
  level2Categories,
  level3Categories,
  qualityBoardActions,
  qualityBoardSummary,
  topQualityIssues,
} from '@/api/mock'

const props = defineProps<{
  filters: Record<string, string>
  comparison: '环比' | '同比'
  changeKey: 'mom' | 'yoy'
  formatNum: (value: number) => string
  formatChange: (value: number) => string
}>()

const emit = defineEmits<{
  (event: 'update:filters', value: Record<string, string>): void
  (event: 'update:comparison', value: '环比' | '同比'): void
}>()

const level1ChartRef = useTemplateRef<HTMLDivElement>('level1Chart')
const level2ChartRef = useTemplateRef<HTMLDivElement>('level2Chart')
const level3ChartRef = useTemplateRef<HTMLDivElement>('level3Chart')
let level1Chart: echarts.ECharts | null = null
let level2Chart: echarts.ECharts | null = null
let level3Chart: echarts.ECharts | null = null

const filterOptions = [
  { label: '时间周期', key: 'period', options: filterPeriodOptions },
  { label: '品牌', key: 'brand', options: filterBrandOptions },
  { label: '平台', key: 'site', options: filterSiteOptions },
  { label: '产品类型', key: 'productType', options: filterProductTypeOptions },
  { label: '产品型号', key: 'model', options: filterModelOptions },
  { label: '反馈来源', key: 'source', options: filterSourceOptions },
]

const categoryRows = computed(() => {
  return [
    ...level1Categories.map((item) => ({ ...item, level: '一级' })),
    ...level2Categories.map((item) => ({ ...item, level: '二级' })),
    ...level3Categories.map((item) => ({ ...item, level: '三级' })),
  ]
})

const issueRows = computed(() => {
  return topQualityIssues.map((row) => ({
    issue: row[0],
    count: row[1],
    percent: row[2],
    trend: row[3],
    mainModel: row[4],
    owner: row[5],
    sla: row[6],
  }))
})

function updateFilter(key: string, value: unknown) {
  emit('update:filters', {
    ...props.filters,
    [key]: String(value),
  })
}

function updateComparison(value: unknown) {
  emit('update:comparison', String(value) as '环比' | '同比')
}

function pieOption(title: string, rows: typeof level1Categories) {
  return {
    color: rows.map((item) => item.color),
    tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#475569', fontSize: 12 },
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['48%', '70%'],
        center: ['50%', '43%'],
        avoidLabelOverlap: true,
        label: {
          formatter: '{b}\n{c}%',
          color: '#334155',
          fontSize: 12,
        },
        labelLine: { length: 10, length2: 8 },
        data: rows.map((item) => ({
          name: item.name,
          value: item.value,
        })),
      },
    ],
  }
}

function renderCharts() {
  if (!level1ChartRef.value || !level2ChartRef.value || !level3ChartRef.value) {
    return
  }

  level1Chart ||= echarts.init(level1ChartRef.value)
  level2Chart ||= echarts.init(level2ChartRef.value)
  level3Chart ||= echarts.init(level3ChartRef.value)

  level1Chart.setOption(pieOption('一级分类占比', level1Categories))
  level2Chart.setOption(pieOption('二级分类占比', level2Categories))
  level3Chart.setOption(pieOption('三级分类占比', level3Categories))
}

function resizeCharts() {
  level1Chart?.resize()
  level2Chart?.resize()
  level3Chart?.resize()
}

onMounted(async () => {
  await nextTick()
  renderCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  level1Chart?.dispose()
  level2Chart?.dispose()
  level3Chart?.dispose()
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
              :options="item.options.map((option) => ({ label: option, value: option }))"
              @change="updateFilter(item.key, $event)"
            />
          </label>
        </a-col>
      </a-row>
    </a-card>

    <div class="comparison-row">
      <a-segmented :value="props.comparison" :options="['环比', '同比']" @change="updateComparison" />
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card title="一级分类占比" :bordered="false">
          <div ref="level1Chart" class="donut-chart" />
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="二级问题场景占比" :bordered="false">
          <div ref="level2Chart" class="donut-chart" />
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="三级具体问题占比" :bordered="false">
          <div ref="level3Chart" class="donut-chart" />
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="14">
        <a-card title="反馈分类结构" :bordered="false">
          <vxe-table :data="categoryRows" border size="mini" stripe>
            <vxe-column field="level" title="层级" width="80" />
            <vxe-column field="name" title="分类" />
            <vxe-column field="value" title="占比" width="90">
              <template #default="{ row }">{{ row.value }}%</template>
            </vxe-column>
            <vxe-column field="mom" title="环比" width="90">
              <template #default="{ row }">{{ row.mom }}%</template>
            </vxe-column>
            <vxe-column field="yoy" title="同比" width="90">
              <template #default="{ row }">{{ row.yoy }}%</template>
            </vxe-column>
          </vxe-table>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="10">
        <a-card title="紧急异常动态" :bordered="false">
          <a-timeline>
            <a-timeline-item v-for="item in emergencyTimelineData" :key="item.id">
              <a-space direction="vertical" size="small">
                <a-space>
                  <a-tag :color="item.p === 'P1' ? 'red' : 'orange'">{{ item.p }}</a-tag>
                  <a-typography-text strong>{{ item.issue }}</a-typography-text>
                </a-space>
                <a-typography-text type="secondary">
                  {{ item.source }} / {{ item.status }} / {{ item.time }}
                </a-typography-text>
              </a-space>
            </a-timeline-item>
          </a-timeline>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="TOP 质量问题" :bordered="false">
      <vxe-table :data="issueRows" border size="mini" stripe show-overflow :export-config="{}">
        <vxe-column field="issue" title="三级问题" min-width="160" />
        <vxe-column field="count" title="数量" width="80" align="right" />
        <vxe-column field="percent" title="反馈占比" width="110" />
        <vxe-column field="trend" title="趋势" width="100" />
        <vxe-column field="mainModel" title="主要型号" min-width="150" />
        <vxe-column field="owner" title="负责人" width="100" />
        <vxe-column field="sla" title="异常SLA" width="110" />
      </vxe-table>
    </a-card>

    <a-card title="质量改善动作" :bordered="false">
      <a-row :gutter="16" class="mb-4">
        <a-col :span="8">
          <a-statistic title="改善任务" :value="qualityBoardSummary.tasks" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="本周关闭" :value="qualityBoardSummary.closed" />
        </a-col>
        <a-col :span="8">
          <a-statistic title="逾期风险" :value="qualityBoardSummary.overdue" />
        </a-col>
      </a-row>
      <a-space direction="vertical" size="middle" class="w-full">
        <a-row
          v-for="action in qualityBoardActions"
          :key="action[0]"
          :gutter="[12, 8]"
          align="middle"
        >
          <a-col :xs="24" :md="10">
            <a-typography-text strong>{{ action[0] }} / {{ action[1] }}</a-typography-text>
          </a-col>
          <a-col :xs="8" :md="4">
            <a-tag>{{ action[2] }}</a-tag>
          </a-col>
          <a-col :xs="16" :md="10">
            <a-progress :percent="Number(action[3])" />
          </a-col>
        </a-row>
      </a-space>
    </a-card>
  </div>
</template>

<style scoped>
.dashboard-filter-card {
  border-radius: 8px;
}

.comparison-row {
  display: flex;
  justify-content: flex-end;
  margin-top: -8px;
}

.donut-chart {
  height: 280px;
  min-height: 280px;
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
