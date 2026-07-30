<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, useTemplateRef, watch } from 'vue'
import * as echarts from 'echarts'

type PmsFilterKey = 'period' | 'platform' | 'productType' | 'model'

interface FilterOption {
  label: string
  key: PmsFilterKey
  options: string[]
  multiple?: boolean
}

interface MetricCard {
  title: string
  value: number
  note: string
  tone: 'blue' | 'orange' | 'green' | 'purple'
}

interface RatioRow {
  name: string
  value: number
  color: string
}

interface ReasonRow {
  reason: string
  value: number
  color: string
  description: string
  route: string
}

interface ResponsibilityRow {
  dept: string
  count: number
  percent: string
  scope: string
}

interface RepairIssueRow {
  rank: number
  issue: string
  count: number
  percent: string
  owner: string
  action: string
}

interface ClosureActionRow {
  action: string
  count: number
  status: string
  nextStep: string
}

const filters = reactive<Record<PmsFilterKey, string | string[]>>({
  period: '',
  platform: [],
  productType: [],
  model: '',
})

const filterOptions: FilterOption[] = [
  { label: '时间', key: 'period', options: ['近7天', '近30天', '近90天'] },
  { label: '平台', key: 'platform', options: ['天猫', '淘宝', '京东', '抖音', '快手'], multiple: true },
  { label: '产品类型', key: 'productType', options: ['体脂秤', '筋膜枪', '八电极'], multiple: true },
  { label: '产品型号', key: 'model', options: ['YKB27011A1-CS(US)_01.01.01.222', 'YKB27011A1-CS(CN)_01.01.02.118', 'AF14304E1-CM(LM)_02.03.01.006', 'HAT14304A2-CM(AU)_02.04.01.032', 'BP30016A1-CS(CN)_03.01.01.015'] },
]

const metricCards: MetricCard[] = [
  { title: '售后总数', value: 386, note: '退、换、维修总数', tone: 'blue' },
  { title: '待售后收货', value: 42, note: '待售后收到的总数', tone: 'orange' },
  { title: '待售后维修分析', value: 31, note: '待售后维修分析总数', tone: 'purple' },
  { title: '已完成处理', value: 313, note: '已完成处理总数', tone: 'green' },
]

const serviceTypeRows: RatioRow[] = [
  { name: '退货占比', value: 46, color: '#2563eb' },
  { name: '换货占比', value: 28, color: '#f97316' },
  { name: '维修占比', value: 26, color: '#16a34a' },
]

const reasonRows: ReasonRow[] = [
  {
    reason: '无理由退货',
    value: 24,
    color: '#64748b',
    description: '客户未提供明确问题，系统只记录数据。',
    route: '直接关闭',
  },
  {
    reason: '生产问题退货',
    value: 31,
    color: '#ef4444',
    description: '装包、黄灯闪一下就过了、刚开始还维修/加热、时断时续等现象，需接触拉力机横块复查，判定问题迹象。',
    route: '有故障则质检表现，完成样机入库；有效度完成原因分析，样机保留3个月。',
  },
  {
    reason: '体验问题',
    value: 27,
    color: '#8b5cf6',
    description: '力度太大、用的地方都肿了等体验反馈。',
    route: '有价值需求合并流转到需求池；无价值需求直接关闭。',
  },
  {
    reason: '产品设计问题',
    value: 18,
    color: '#0ea5e9',
    description: '按键类、波次类等设计相关反馈。',
    route: '有价值需求合并流转到需求池；需要跨部门协助处理则流转到工单；无价值需求直接关闭。',
  },
]

const responsibilityRows: ResponsibilityRow[] = [
  { dept: '研发-设计问题', count: 86, percent: '34%', scope: '结构设计、按键波次、功能定义相关问题' },
  { dept: '生产-生产质量问题', count: 104, percent: '41%', scope: '装配、焊接、灯效、电池仓接触等制造质量问题' },
  { dept: '产品-产品体验问题', count: 64, percent: '25%', scope: '力度、易用性、场景体验和需求价值判断' },
]

const repairTopRows: RepairIssueRow[] = [
  { rank: 1, issue: '无法开机/时断时续', count: 42, percent: '18%', owner: '生产-生产质量问题', action: '复测电池仓弹片、焊点和电源管理模块' },
  { rank: 2, issue: '加热/灯效异常', count: 35, percent: '15%', owner: '生产-生产质量问题', action: '检查灯板、加热片和装配一致性' },
  { rank: 3, issue: '按键/波次体验不佳', count: 29, percent: '13%', owner: '研发-设计问题', action: '评估按键结构、波次策略和容错逻辑' },
  { rank: 4, issue: '力度过大/使用不适', count: 24, percent: '10%', owner: '产品-产品体验问题', action: '判断是否沉淀需求或调整用户指引' },
  { rank: 5, issue: '配件/接触不良', count: 21, percent: '9%', owner: '生产-生产质量问题', action: '复核配件来料、装配间隙和接触稳定性' },
]

const closureActionRows: ClosureActionRow[] = [
  { action: '质检分析', count: 68, status: '处理中', nextStep: '输出原因分析，样机保留3个月' },
  { action: '流转需求池', count: 31, status: '待评审', nextStep: '体验/设计类问题合并沉淀需求' },
  { action: '流转工单', count: 18, status: '协同中', nextStep: '跨部门处理生产、研发或产品协同事项' },
  { action: '直接关闭', count: 73, status: '已关闭', nextStep: '无理由退货或无有效价值需求归档' },
]

const typeChartRef = useTemplateRef<HTMLDivElement>('typeChart')
const reasonChartRef = useTemplateRef<HTMLDivElement>('reasonChart')
const deptChartRef = useTemplateRef<HTMLDivElement>('deptChart')
let typeChart: echarts.ECharts | null = null
let reasonChart: echarts.ECharts | null = null
let deptChart: echarts.ECharts | null = null

const filteredModelOptions = computed(() => {
  const selectedTypes = Array.isArray(filters.productType) ? filters.productType : []
  if (selectedTypes.includes('筋膜枪')) return ['AF14304E1-CM(LM)_02.03.01.006', 'HAT14304A2-CM(AU)_02.04.01.032']
  if (selectedTypes.includes('八电极')) return ['BP30016A1-CS(CN)_03.01.01.015', 'YKB27011A1-CS(CN)_01.01.02.118']
  return ['YKB27011A1-CS(US)_01.01.01.222', 'YKB27011A1-CS(CN)_01.01.02.118', 'AF14304E1-CM(LM)_02.03.01.006', 'HAT14304A2-CM(AU)_02.04.01.032', 'BP30016A1-CS(CN)_03.01.01.015']
})

function updateFilter(key: PmsFilterKey, value: unknown) {
  filters[key] = key === 'platform' || key === 'productType'
    ? Array.isArray(value) ? value.map(String) : []
    : String(value || '')

  if (key === 'productType' && !filteredModelOptions.value.includes(String(filters.model))) {
    filters.model = ''
  }
}

function formatNum(value: number) {
  return value.toLocaleString('zh-CN')
}

function donutOption(title: string, rows: RatioRow[]) {
  return {
    color: rows.map((item) => item.color),
    tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
    legend: { bottom: 0, left: 'center', itemWidth: 10, itemHeight: 10 },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['46%', '70%'],
        center: ['50%', '42%'],
        label: { formatter: '{b}\n{c}%', color: '#334155', fontSize: 12 },
        labelLine: { length: 10, length2: 8 },
        data: rows.map((item) => ({ name: item.name, value: item.value })),
      },
    ],
  }
}

function renderCharts() {
  if (!typeChartRef.value || !reasonChartRef.value || !deptChartRef.value) return

  typeChart ||= echarts.init(typeChartRef.value)
  reasonChart ||= echarts.init(reasonChartRef.value)
  deptChart ||= echarts.init(deptChartRef.value)

  typeChart.setOption(donutOption('售后类型占比', serviceTypeRows))
  reasonChart.setOption(donutOption('售后原因占比', reasonRows.map(({ reason, value, color }) => ({ name: reason, value, color }))))
  deptChart.setOption({
    color: ['#2563eb'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 42, right: 20, top: 20, bottom: 34 },
    xAxis: { type: 'category', data: responsibilityRows.map((item) => item.dept) },
    yAxis: { type: 'value', axisLabel: { formatter: '{value}%' } },
    series: [
      {
        name: '责任占比',
        type: 'bar',
        barWidth: 24,
        data: responsibilityRows.map((item) => Number.parseInt(item.percent, 10)),
      },
    ],
  })
}

function resizeCharts() {
  typeChart?.resize()
  reasonChart?.resize()
  deptChart?.resize()
}

onMounted(async () => {
  await nextTick()
  renderCharts()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  typeChart?.dispose()
  reasonChart?.dispose()
  deptChart?.dispose()
})

watch(filters, () => nextTick(renderCharts), { deep: true })
</script>

<template>
  <div class="space-y-5">
    <a-card :bordered="false" class="dashboard-filter-card">
      <a-row :gutter="[12, 12]">
        <a-col v-for="item in filterOptions" :key="item.key" :xs="12" :md="6">
          <label class="filter-field">
            <span>{{ item.label }}</span>
            <a-select
              :value="filters[item.key]"
              class="w-full"
              :placeholder="item.label"
              :mode="item.multiple ? 'multiple' : undefined"
              :max-tag-count="1"
              :options="(item.key === 'model' ? filteredModelOptions : item.options).map((option) => ({ label: option, value: option }))"
              allow-clear
              @change="updateFilter(item.key, $event)"
            />
          </label>
        </a-col>
      </a-row>
    </a-card>

    <a-row :gutter="[12, 12]">
      <a-col v-for="card in metricCards" :key="card.title" :xs="12" :md="6">
        <a-card size="small" class="pms-metric-card" :class="`pms-metric-card-${card.tone}`">
          <a-statistic :title="card.title" :value="formatNum(card.value)" />
          <a-typography-text type="secondary" class="pms-card-note">{{ card.note }}</a-typography-text>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card title="类型占比扇形图" :bordered="false">
          <div ref="typeChart" class="pms-chart" />
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="售后原因占比扇形图" :bordered="false">
          <div ref="reasonChart" class="pms-chart" />
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="品质问题-售后维修责任部门占比" :bordered="false">
          <div ref="deptChart" class="pms-chart" />
        </a-card>
      </a-col>
    </a-row>

    <a-card title="品质维修问题分析TOP5" :bordered="false">
      <vxe-table :data="repairTopRows" border size="mini" stripe show-overflow>
        <vxe-column field="rank" title="排名" width="70" />
        <vxe-column field="issue" title="维修问题" min-width="180" />
        <vxe-column field="count" title="数量" width="90" align="right" />
        <vxe-column field="percent" title="占比" width="90" />
        <vxe-column field="owner" title="责任归因" min-width="160" />
        <vxe-column field="action" title="分析动作" min-width="260" />
      </vxe-table>
    </a-card>

    <a-card title="售后闭环动作看板" :bordered="false">
      <vxe-table :data="closureActionRows" border size="mini" stripe>
        <vxe-column field="action" title="闭环动作" width="130" />
        <vxe-column field="count" title="数量" width="90" align="right" />
        <vxe-column field="status" title="当前状态" width="110" />
        <vxe-column field="nextStep" title="下一步" min-width="320" />
      </vxe-table>
    </a-card>
  </div>
</template>

<style scoped>
.dashboard-filter-card,
.pms-metric-card {
  border-radius: 8px;
}

.pms-metric-card {
  min-height: 118px;
}

.pms-metric-card-blue {
  border-left: 4px solid #2563eb;
}

.pms-metric-card-orange {
  border-left: 4px solid #f97316;
}

.pms-metric-card-green {
  border-left: 4px solid #16a34a;
}

.pms-metric-card-purple {
  border-left: 4px solid #8b5cf6;
}

.pms-card-note {
  display: block;
  margin-top: 10px;
}

.pms-chart {
  height: 280px;
}
</style>
