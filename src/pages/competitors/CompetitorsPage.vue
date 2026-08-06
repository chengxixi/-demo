<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { message } from 'ant-design-vue'
import type { Competitor, LevelRecord } from '@/types'
import { competitorData, defaultLevelRecords } from '@/api/mock'
import CompetitorAddModal from './CompetitorAddModal.vue'
import CompetitorFilter from './CompetitorFilter.vue'

type MarketStatus = 'all' | 'pending' | 'done'

interface MarketRow {
  platform: string
  brand: string
  product: string
  category: string
  rank: string
  price: string
  rating: string
  reviews: string
  change: string
  event: string
  trigger: string
  plan: string
  handled: boolean
  date: string
}

interface MonitorItem {
  key: string
  label: string
  owner: string
  desc: string
}

const competitors = ref<Competitor[]>([...competitorData])
const addOpen = shallowRef(false)
const compareOpen = shallowRef(false)
const exportOpen = shallowRef(false)
const handleOpen = shallowRef(false)
const physicalStarted = shallowRef(false)
const activeTab = shallowRef('competitor')
const marketStatus = shallowRef<MarketStatus>('all')
const opinionSearch = shallowRef('')
const currentCompetitor = ref<Competitor | null>(null)
const handleTarget = shallowRef('')
const compareSlots = ref<number[]>([0, 1, -1, -1])

const filters = ref({
  name: '',
  channelType: '',
  asin: '',
  line: '',
  price: '',
})

const stats = computed(() => [
  { label: '本月新增竞品', value: 12, desc: '直接竞争 7 / 间接竞争 5' },
  { label: '触发提醒', value: 6, desc: '价格、排名、差评、功能变化' },
  { label: '实物/拆机分析', value: 3, desc: '2 份体验报告，1 份拆机报告' },
  { label: '转需求/异常', value: 4, desc: '需求 3 / 紧急异常 1' },
])

const keywordRows = [
  { keyword: 'body fat scale', rank: 'Amazon #6', change: '+4', reason: 'RENPHO降价进入广告位' },
  { keyword: '智能体脂秤', rank: '天猫 第3', change: '+6', reason: '华为八电极秤预售上升' },
  { keyword: '筋膜枪低噪音', rank: '抖音 热词', change: '+9', reason: '达人内容集中放大低噪音卖点' },
]

const marketAlerts = [
  { level: 'L4', title: 'Withings 新增心率/血管年龄卖点', desc: '建议进入换代功能机会评估' },
  { level: 'L3', title: 'RENPHO 近7天价格下降 18%', desc: '跟进价格带和促销节奏' },
  { level: 'L3', title: '华为八电极秤大促排名上升', desc: '复盘国内高端秤卖点结构' },
]

const marketRows: MarketRow[] = [
  { platform: 'Amazon US', brand: 'RENPHO', product: 'Elis 1 Smart Scale', category: '四电极体脂秤', rank: '#8', price: '$39.99', rating: '4.6', reviews: '23,400', change: '价格 -18%', event: '促销', trigger: 'L3', plan: '转入需求', handled: true, date: '2026-06-18' },
  { platform: 'Amazon US', brand: 'Withings', product: 'Body Scan', category: '八电极体脂秤', rank: '#24', price: '$99.00', rating: '4.4', reviews: '8,920', change: '新增心率/血管年龄', event: '上新', trigger: 'L4', plan: '启动实物分析', handled: true, date: '2026-06-18' },
  { platform: '天猫', brand: '华为', product: '智能体脂秤 3 Pro', category: '八电极体脂秤', rank: '类目第3', price: '¥399', rating: '4.8', reviews: '18,260', change: '618预售上升', event: '排名', trigger: 'L3', plan: '转入需求', handled: true, date: '2026-06-19' },
  { platform: '京东', brand: '小米', product: '体脂秤 S400 Pro', category: '四电极体脂秤', rank: '类目第5', price: '¥179', rating: '4.7', reviews: '52,100', change: '低价型号放量', event: '价格', trigger: 'L2', plan: '', handled: false, date: '2026-06-10' },
  { platform: '独立站', brand: 'Wyze', product: 'Scale X', category: '体脂秤', rank: '自然流量上升', price: '$33.99', rating: '4.2', reviews: '4,700', change: '套餐包上线', event: '上新', trigger: 'L1', plan: '', handled: false, date: '2026-06-12' },
  { platform: '抖音', brand: '倍轻松', product: 'M5 筋膜枪', category: '筋膜枪', rank: '热销榜第7', price: '¥499', rating: '4.6', reviews: '9,840', change: '达人视频曝光增加', event: '内容', trigger: 'L3', plan: '', handled: false, date: '2026-06-21' },
]

const sentimentSummary = [
  { label: '任务', value: 5 },
  { label: '成功', value: 5 },
  { label: '失败', value: 0 },
  { label: '商品', value: 45 },
  { label: '新增评论', value: 28 },
  { label: '平均星级', value: 3.5 },
]

const collectionConditions = [
  { label: '品牌', value: 'Withings / RENPHO / 华为' },
  { label: '产品', value: '体脂秤、八电极秤、筋膜枪' },
  { label: '来源', value: 'Amazon评论、天猫评价、京东问答、主流媒体、社媒' },
  { label: '关键词', value: '准确性、App、隐私、离线、续航、质量' },
  { label: '采集频率', value: '每周一 09:00' },
]

const starRows = [
  { label: '5星', value: 14, color: '#22a06b' },
  { label: '4星', value: 2, color: '#1f73e8' },
  { label: '3星', value: 3, color: '#f2b705' },
  { label: '2星', value: 3, color: '#ff8a00' },
  { label: '1星', value: 6, color: '#e5484d' },
]

const opinionGroups = [
  {
    title: '正向观点 Top',
    tone: 'good',
    rows: [
      { topic: '总体满意度', count: '13次', desc: '我太喜欢这玩意儿了' },
      { topic: '应用功能', count: '6次', desc: '通过应用持续提供反馈，并监测健康与体重趋势' },
      { topic: '身体成分追踪', count: '5次', desc: '一款有助于追踪进度的好产品' },
    ],
  },
  {
    title: '负向观点 Top',
    tone: 'bad',
    rows: [
      { topic: '计算不准确', count: '5次', desc: '体重自然上升后体脂率也随之升高，让我质疑准确性' },
      { topic: '设备故障', count: '4次', desc: '不起作用' },
      { topic: '应用可用性', count: '3次', desc: '数据被压缩到一个页面内，字体极小' },
    ],
  },
  {
    title: '未满足需求',
    tone: 'warning',
    rows: [
      { topic: '更高的测量精度', count: '3次', desc: '用户质疑整体测量结果可信度' },
      { topic: '更优的质量', count: '3次', desc: '使用6个月后部件损坏' },
      { topic: '更好的长期追踪', count: '2次', desc: '需要更清晰的历史和趋势展示' },
    ],
  },
]

const mediaRows = [
  { source: 'Amazon评论', brand: 'Withings', asin: 'B0CS20AUS1', sentiment: '负向', content: '体脂率随水分波动明显，用户开始质疑整体准确性。', tag: '准确性' },
  { source: '媒体测评', brand: 'RENPHO', asin: 'B0RENPHO01', sentiment: '正向', content: 'App趋势功能被多篇测评作为核心优势提及。', tag: 'App体验' },
  { source: '京东问答', brand: '华为', asin: 'JD-HW-SCALE3', sentiment: '中性', content: '用户集中询问是否支持多人识别和离线保存。', tag: '离线/多人' },
]

const normalizedOpinionSearch = computed(() => opinionSearch.value.trim().toLowerCase())

const collectionSearchText = computed(() =>
  collectionConditions.map((item) => `${item.label} ${item.value}`).join(' ').toLowerCase()
)

const filteredOpinionGroups = computed(() => {
  const keyword = normalizedOpinionSearch.value
  if (!keyword) return opinionGroups

  return opinionGroups
    .map((group) => {
      const groupText = `${group.title} ${group.tone} ${collectionSearchText.value}`.toLowerCase()
      const rows = groupText.includes(keyword)
        ? group.rows
        : group.rows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(keyword))

      return { ...group, rows }
    })
    .filter((group) => group.rows.length > 0)
})

const filteredOpinionResultCount = computed(() =>
  filteredOpinionGroups.value.reduce((total, group) => total + group.rows.length, 0)
)

const filteredMediaRows = computed(() => {
  const keyword = normalizedOpinionSearch.value
  if (!keyword) return mediaRows

  return mediaRows.filter((row) => Object.values(row).join(' ').toLowerCase().includes(keyword))
})


const monitorItems: MonitorItem[] = [
  { key: 'avgPrice', label: '近期成交均价', owner: '胡锦弘', desc: '海外/国内主渠道近7日平均成交价' },
  { key: 'gmvBsr', label: 'GMV/BSR排名', owner: '胡锦弘', desc: '海外每周监控，国内每周更新排名变化' },
  { key: 'salesVolume', label: '销量（运营评估）', owner: '胡锦弘', desc: '国内销量取最低值，国外数据按周更新' },
  { key: 'rating', label: '评分', owner: '胡锦弘', desc: '海外每周监控，国内按需补充' },
  { key: 'newFeature', label: '新功能', owner: '胡锦弘', desc: '竞品新增功能或卖点' },
  { key: 'promoEvent', label: '促销活动', owner: '胡锦弘', desc: '近期促销活动及力度' },
  { key: 'stockStatus', label: '库存状态', owner: '胡锦弘', desc: '缺货/断货/正常' },
  { key: 'listingChange', label: 'Listing变动', owner: '胡锦弘', desc: '标题、图片、A+页面变更' },
]

const monitorSnapshots = {
  withings: {
    avgPrice: { W1: '399.95', W2: '399.95', W3: '349.95', W4: '349.95' },
    gmvBsr: { W1: '#28', W2: '#26', W3: '#24', W4: '#24' },
    salesVolume: { W1: '820', W2: '910', W3: '980', W4: '1020' },
    rating: { W1: '4.4', W2: '4.4', W3: '4.4', W4: '4.4' },
    newFeature: { W1: '-', W2: '-', W3: '血管年龄', W4: '-' },
    promoEvent: { W1: '-', W2: '-', W3: 'Prime折扣', W4: '-' },
    stockStatus: { W1: '正常', W2: '正常', W3: '紧张', W4: '正常' },
    listingChange: { W1: '-', W2: 'A+更新', W3: '-', W4: '-' },
  },
}

const selectedProducts = computed(() => {
  return compareSlots.value
    .filter((index) => index >= 0 && index < competitors.value.length)
    .map((index) => competitors.value[index])
})

const compareRows = computed(() => {
  const fields = [
    { group: '基础档案', label: '竞品类型', key: 'type' },
    { group: '基础档案', label: '产品类型', key: 'productType' },
    { group: '基础档案', label: '型号', key: 'model' },
    { group: '基础档案', label: '定位', key: 'position' },
    { group: '价格与评价', label: '到手价', key: 'dealPrice' },
    { group: '价格与评价', label: '评分', key: 'rating' },
    { group: '价格与评价', label: '评论数', key: 'reviews' },
    { group: '痛点与风险', label: '核心卖点', key: 'sellingPoints' },
    { group: '痛点与风险', label: '用户痛点', key: 'pain' },
  ]

  return fields.map((field) => {
    const row: Record<string, string> = {
      group: field.group,
      label: field.label,
    }

    selectedProducts.value.forEach((product, index) => {
      const value = product[field.key as keyof Competitor]
      row[`value${index}`] = Array.isArray(value) ? value.join(' / ') : String(value || '')
    })

    return row
  })
})

const filteredCompetitors = computed(() => {
  return competitors.value.filter((item) => {
    const keyword = filters.value.name.trim().toLowerCase()
    const matchesName = !keyword || `${item.brand} ${item.name}`.toLowerCase().includes(keyword)
    const matchesChannel = !filters.value.channelType || item.channelType === filters.value.channelType
    const matchesAsin = !filters.value.asin || (item.asin || '').toUpperCase().includes(filters.value.asin.toUpperCase())
    const matchesLine = !filters.value.line || item.category === filters.value.line
    const matchesPrice = !filters.value.price || String(item.price || item.dealPrice).includes(filters.value.price)

    return matchesName && matchesChannel && matchesAsin && matchesLine && matchesPrice
  })
})

const marketTableRows = computed(() => {
  return marketRows.map((row) => {
    const ageDays = Math.floor((new Date('2026-06-22').getTime() - new Date(row.date).getTime()) / 86_400_000)
    const needsAction = row.trigger === 'L3' || row.trigger === 'L4'
    const autoDone = !row.handled && ageDays >= 7
    const status = row.handled || autoDone || !needsAction ? 'done' : 'pending'
    const plan = row.handled ? row.plan : autoDone ? '未处理，系统自动关闭' : '未处理'

    return {
      ...row,
      status,
      plan,
      autoDone,
    }
  })
})

const filteredMarketRows = computed(() => {
  if (marketStatus.value === 'all') {
    return marketTableRows.value
  }

  return marketTableRows.value.filter((row) => row.status === marketStatus.value)
})

const registerRows = computed(() => {
  if (!currentCompetitor.value) {
    return []
  }

  const item = currentCompetitor.value
  const base = {
    竞品类型: item.type,
    内部竞品: '否',
    品牌: item.brand,
    产品名称: item.name,
    产品型号: item.model,
    产品类型: item.productType,
    产品定位: item.position,
    上市时间: item.launch,
    销售平台: item.platform,
    销售区域: item.region,
    信息来源: '平台详情页 / 品牌官网',
    信息状态: item.monitorStatus || '正常监控',
    官方售价: item.officialPrice,
    到手价: item.dealPrice,
    评分: item.rating,
    评论数: item.reviews,
  }

  return Object.entries({ ...base, ...(item.specs as Record<string, string>), ...(item.registerFields || {}) })
    .map(([name, value]) => ({ name, value }))
})

const detailLevelRecords = computed<LevelRecord[]>(() => {
  if (!currentCompetitor.value) {
    return defaultLevelRecords
  }

  return defaultLevelRecords.map((record) => ({
    ...record,
    content: `${currentCompetitor.value?.brand} ${currentCompetitor.value?.name}：${record.content}`,
  }))
})

const monitorRows = computed(() => {
  const productId = currentCompetitor.value?.id || 'withings'
  const snapshot = monitorSnapshots[productId as keyof typeof monitorSnapshots] || monitorSnapshots.withings

  return monitorItems.map((item) => ({
    ...item,
    W1: snapshot[item.key as keyof typeof snapshot]?.W1 || '-',
    W2: snapshot[item.key as keyof typeof snapshot]?.W2 || '-',
    W3: snapshot[item.key as keyof typeof snapshot]?.W3 || '-',
    W4: snapshot[item.key as keyof typeof snapshot]?.W4 || '-',
    current: '',
  }))
})

function openDetail(row: Competitor) {
  currentCompetitor.value = row
  physicalStarted.value = false
}

function backToList() {
  currentCompetitor.value = null
  physicalStarted.value = false
}

function addCompetitor(row: Competitor) {
  competitors.value = [row, ...competitors.value]
  message.success('竞品已新增')
}

function resetFilters() {
  filters.value = {
    name: '',
    channelType: '',
    asin: '',
    line: '',
    price: '',
  }
}

function setCompareSlot(slotIndex: number, competitorIndex: number) {
  const nextSlots = [...compareSlots.value]
  nextSlots[slotIndex] = competitorIndex
  compareSlots.value = nextSlots
}

function handleMarketRow(row: MarketRow) {
  handleTarget.value = `${row.brand} ${row.product}`
  handleOpen.value = true
}

function completeMarketAction(plan: string) {
  message.success(`${handleTarget.value} 已选择处理方案：${plan}`)
  handleOpen.value = false
}

function archiveCurrent() {
  if (!currentCompetitor.value) {
    return
  }

  currentCompetitor.value.archived = !currentCompetitor.value.archived
  currentCompetitor.value.monitorStatus = currentCompetitor.value.archived ? '已归档' : '正常监控'
  message.success(currentCompetitor.value.archived ? '已归档并停止监控' : '已取消归档')
}

function toggleMonitor() {
  if (!currentCompetitor.value) {
    return
  }

  const isMonitoring = (currentCompetitor.value.monitorStatus || '正常监控') === '正常监控'
  currentCompetitor.value.monitorStatus = isMonitoring ? '已解除监控' : '正常监控'
  message.success(currentCompetitor.value.monitorStatus)
}

function startPhysicalAnalysis() {
  physicalStarted.value = true
  message.success('实物分析已启动')
}

function recordSnapshot() {
  message.success('已保存本周快照')
}
</script>

<template>
  <section class="competitor-page">
    <template v-if="currentCompetitor">
      <a-card :bordered="false" class="detail-head">
        <a-row :gutter="[12, 12]" align="middle" justify="space-between">
          <a-col>
            <a-space direction="vertical" size="small">
              <a-typography-title :level="4" class="page-title">
                竞品详情
                <a-tag color="blue">{{ currentCompetitor.monitorStatus || '正常监控' }}</a-tag>
              </a-typography-title>
              <a-typography-text type="secondary">
                {{ currentCompetitor.brand }} {{ currentCompetitor.name }} / {{ currentCompetitor.model }} /
                {{ currentCompetitor.productType }} / {{ currentCompetitor.platform }}
              </a-typography-text>
            </a-space>
          </a-col>
          <a-col>
            <a-space wrap>
              <a-button @click="backToList">返回竞品列表</a-button>
              <a-button @click="archiveCurrent">{{ currentCompetitor.archived ? '取消归档' : '归档' }}</a-button>
              <a-button @click="toggleMonitor">
                {{ currentCompetitor.monitorStatus === '已解除监控' ? '持续监控' : '解除监控' }}
              </a-button>
              <a-button type="primary" @click="startPhysicalAnalysis">启动实物分析</a-button>
            </a-space>
          </a-col>
        </a-row>
      </a-card>

      <a-row :gutter="[12, 12]" class="detail-grid">
        <a-col
          v-for="item in [
            ['竞品类型', currentCompetitor.type],
            ['产品类型', currentCompetitor.productType],
            ['产品定位', currentCompetitor.position],
            ['上市时间', currentCompetitor.launch],
            ['销售平台', currentCompetitor.platform],
            ['销售区域', currentCompetitor.region],
            ['官方售价', currentCompetitor.officialPrice],
            ['到手价', currentCompetitor.dealPrice],
            ['评分', currentCompetitor.rating],
            ['评论数', currentCompetitor.reviews],
            ['产品型号', currentCompetitor.model],
            ['ASIN/链接', currentCompetitor.asin || '-'],
          ]"
          :key="item[0]"
          :xs="12"
          :lg="6"
        >
          <a-card size="small" class="field-card">
            <a-typography-text type="secondary">{{ item[0] }}</a-typography-text>
            <strong>{{ item[1] }}</strong>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="[12, 12]" class="mt-4">
        <a-col :xs="24" :lg="12">
          <a-card title="核心卖点" :bordered="false">
            <a-typography-paragraph>
              {{ Array.isArray(currentCompetitor.sellingPoints) ? currentCompetitor.sellingPoints.join('、') : currentCompetitor.sellingPoints }}
            </a-typography-paragraph>
          </a-card>
        </a-col>
        <a-col :xs="24" :lg="12">
          <a-card title="用户痛点" :bordered="false">
            <a-typography-paragraph>{{ currentCompetitor.pain }}</a-typography-paragraph>
          </a-card>
        </a-col>
      </a-row>

      <a-card title="竞品信息登记表字段" :bordered="false" class="table-card">
        <vxe-table :data="registerRows" border stripe height="300" :export-config="{}">
          <vxe-column field="name" title="字段" width="180" />
          <vxe-column field="value" title="信息" min-width="220" />
        </vxe-table>
      </a-card>

      <a-card title="L1-L4 监控记录" :bordered="false" class="table-card">
        <vxe-table :data="detailLevelRecords" border stripe :export-config="{}">
          <vxe-column field="level" title="等级" width="80">
            <template #default="{ row }">
              <a-tag :color="row.level === 'L4' ? 'red' : row.level === 'L3' ? 'orange' : 'blue'">{{ row.level }}</a-tag>
            </template>
          </vxe-column>
          <vxe-column field="source" title="触发来源" width="120" />
          <vxe-column field="content" title="记录内容" min-width="260" />
          <vxe-column field="action" title="最新处理方案" width="140" />
          <vxe-column field="status" title="状态" width="120" />
          <vxe-column field="date" title="记录时间" width="120" />
        </vxe-table>
      </a-card>

      <a-card :bordered="false" class="table-card">
        <template #title>
          <a-row justify="space-between" align="middle">
            <a-col>竞品监控快照 - {{ currentCompetitor.brand }} {{ currentCompetitor.name }}</a-col>
            <a-col><a-button size="small" @click="recordSnapshot">记录本周快照</a-button></a-col>
          </a-row>
        </template>
        <vxe-table :data="monitorRows" border stripe :export-config="{}">
          <vxe-column field="label" title="监控项" min-width="220" />
          <vxe-column field="owner" title="登记人" width="100" />
          <vxe-column field="W1" title="W1" width="90" />
          <vxe-column field="W2" title="W2" width="90" />
          <vxe-column field="W3" title="W3" width="90" />
          <vxe-column field="W4" title="W4" width="90" />
          <vxe-column field="current" title="本周" width="130">
            <template #default="{ row }">
              <a-input v-model:value="row.current" size="small" placeholder="-" />
            </template>
          </vxe-column>
        </vxe-table>
      </a-card>

      <a-card v-if="currentCompetitor.archived" title="归档记录" :bordered="false" class="table-card">
        <a-descriptions bordered size="small" :column="3">
          <a-descriptions-item label="监控状态">{{ currentCompetitor.monitorStatus }}</a-descriptions-item>
          <a-descriptions-item label="归档时间">2026-06-22</a-descriptions-item>
          <a-descriptions-item label="归档说明">保留历史记录，后续如再次出现变化可重新启动日常监控。</a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card v-if="physicalStarted" title="实物分析信息" :bordered="false" class="table-card">
        <a-form layout="vertical">
          <a-row :gutter="12">
            <a-col :xs="24" :md="8"><a-form-item label="竞品对象"><a-input :value="`${currentCompetitor.brand} ${currentCompetitor.name}`" readonly /></a-form-item></a-col>
            <a-col :xs="24" :md="8"><a-form-item label="分析状态"><a-select value="待上传报告" :options="['待上传报告', '分析中', '已完成', '已归档'].map((item) => ({ label: item, value: item }))" /></a-form-item></a-col>
            <a-col :xs="24" :md="8"><a-form-item label="负责人"><a-input placeholder="填写负责人" /></a-form-item></a-col>
            <a-col :xs="24" :md="8"><a-form-item label="计划完成时间"><a-date-picker class="w-full" /></a-form-item></a-col>
            <a-col :xs="24" :md="8"><a-form-item label="触发来源"><a-select value="L4 紧急提醒" :options="['L4 紧急提醒', 'L3 触发提醒', '产品经理主动发起'].map((item) => ({ label: item, value: item }))" /></a-form-item></a-col>
            <a-col :xs="24" :md="8"><a-form-item label="分析类型"><a-select value="实物分析 + 拆机分析 + 产品体验" :options="['实物分析 + 拆机分析 + 产品体验', '仅产品体验', '仅拆机分析', '专项对标'].map((item) => ({ label: item, value: item }))" /></a-form-item></a-col>
            <a-col :xs="24"><a-form-item label="重点验证项"><a-textarea :rows="3" placeholder="填写需要重点验证的结构、功能、体验、包装、APP或风险点" /></a-form-item></a-col>
            <a-col :xs="24"><a-form-item label="分析结论"><a-textarea :rows="3" placeholder="后续补充分析结论、可借鉴点、风险判断和下一步建议" /></a-form-item></a-col>
          </a-row>
        </a-form>
      </a-card>
    </template>

    <template v-else>
      <a-row :gutter="[12, 12]" align="middle" justify="space-between">
        <a-col>
          <a-space direction="vertical" size="small">
            <a-typography-title :level="4" class="page-title">竞品分析</a-typography-title>
            <a-typography-text type="secondary">
              整合市场动态、舆情监测和竞品产品档案，支撑需求机会识别与产品策略判断。
            </a-typography-text>
          </a-space>
        </a-col>
        <a-col>
          <a-button type="primary" @click="addOpen = true">增加竞品</a-button>
        </a-col>
      </a-row>


      <a-tabs v-model:active-key="activeTab" class="page-tabs">
        <a-tab-pane key="competitor" tab="竞品信息" />
        <a-tab-pane key="market" tab="市场监控" />
        <a-tab-pane key="opinion" tab="舆情监测" />
      </a-tabs>

      <template v-if="activeTab === 'competitor'">
      <a-row :gutter="[12, 12]" class="stat-grid">
        <a-col v-for="stat in stats" :key="stat.label" :xs="12" :lg="6">
          <a-card size="small" class="stat-card">
            <a-statistic :title="stat.label" :value="stat.value" />
            <a-typography-text type="secondary">{{ stat.desc }}</a-typography-text>
          </a-card>
        </a-col>
      </a-row>
        <a-card :bordered="false" class="filter-card">
          <a-row :gutter="[12, 12]" align="middle">
            <a-col :xs="24" :lg="16">
              <CompetitorFilter v-model:filters="filters" />
            </a-col>
            <a-col :xs="24" :lg="8" class="filter-actions">
              <a-space wrap>
                <a-button @click="resetFilters">重置</a-button>
                <a-button @click="compareOpen = true">产品对比</a-button>
                <a-button @click="exportOpen = true">导出</a-button>
              </a-space>
            </a-col>
          </a-row>
        </a-card>

        <a-row :gutter="[14, 14]" class="product-grid">
          <a-col v-for="(item, index) in filteredCompetitors" :key="item.id" :xs="24" :md="12" :xl="8">
            <a-card
              class="product-card"
              :class="{ active: index === 0 }"
              :bordered="false"
              hoverable
              @click="openDetail(item)"
            >
              <a-row justify="space-between" align="top" class="card-head">
                <a-col><a-tag color="blue">{{ item.type }}</a-tag></a-col>
                <a-col><a-tag :color="item.monitorStatus === '已归档' ? 'default' : 'green'">{{ item.monitorStatus || '正常监控' }}</a-tag></a-col>
              </a-row>
              <a-typography-title :level="5" class="product-title">
                {{ item.brand }} {{ item.name }}
              </a-typography-title>
              <a-typography-text type="secondary">{{ item.productType }} / {{ item.position }}</a-typography-text>
              <a-row justify="space-between" align="bottom" class="price-row">
                <a-col><strong>{{ item.dealPrice }}</strong></a-col>
                <a-col><a-typography-text type="secondary">{{ item.platform }}</a-typography-text></a-col>
              </a-row>
              <a-typography-paragraph class="selling-points" :ellipsis="{ rows: 2 }">
                {{ Array.isArray(item.sellingPoints) ? item.sellingPoints.join(' / ') : item.sellingPoints }}
              </a-typography-paragraph>
            </a-card>
          </a-col>
        </a-row>
      </template>

      <template v-else-if="activeTab === 'market'">
        <a-row :gutter="[12, 12]">
          <a-col :xs="24" :lg="12">
            <a-card title="关键词/排名变化" :bordered="false" class="panel-card">
              <a-list :data-source="keywordRows" item-layout="vertical">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-row :gutter="[12, 8]" align="middle">
                      <a-col :xs="24" :md="8"><a-typography-text strong>{{ item.keyword }}</a-typography-text></a-col>
                      <a-col :xs="12" :md="5"><a-typography-text type="secondary">当前 {{ item.rank }}</a-typography-text></a-col>
                      <a-col :xs="12" :md="3"><a-tag color="success">{{ item.change }}</a-tag></a-col>
                      <a-col :xs="24" :md="8"><a-typography-text type="secondary">{{ item.reason }}</a-typography-text></a-col>
                    </a-row>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="12">
            <a-card title="市场触发提醒" :bordered="false" class="panel-card">
              <a-list :data-source="marketAlerts" item-layout="vertical">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-space align="start">
                      <a-tag :color="item.level === 'L4' ? 'red' : 'orange'">{{ item.level }}</a-tag>
                      <a-space direction="vertical" size="small">
                        <a-typography-text strong>{{ item.title }}</a-typography-text>
                        <a-typography-text type="secondary">{{ item.desc }}</a-typography-text>
                      </a-space>
                    </a-space>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>
        </a-row>

        <a-card title="跨平台竞品动态" :bordered="false" class="table-card">
          <a-segmented
            v-model:value="marketStatus"
            :options="[
              { label: '全部', value: 'all' },
              { label: '待处理', value: 'pending' },
              { label: '已完成', value: 'done' },
            ]"
            class="status-tabs"
          />

          <vxe-table :data="filteredMarketRows" border stripe height="420" :export-config="{}">
            <vxe-column field="platform" title="平台" width="120"><template #default="{ row }"><a-tag>{{ row.platform }}</a-tag></template></vxe-column>
            <vxe-column field="brand" title="品牌" width="110" />
            <vxe-column field="product" title="产品" min-width="170" />
            <vxe-column field="category" title="类别" width="130" />
            <vxe-column field="rank" title="排名" width="120" />
            <vxe-column field="price" title="价格" width="100" />
            <vxe-column field="rating" title="评分" width="80" />
            <vxe-column field="reviews" title="评论数" width="110" />
            <vxe-column field="change" title="变化" min-width="150" />
            <vxe-column field="event" title="事件" width="90" />
            <vxe-column field="trigger" title="触发" width="90"><template #default="{ row }"><a-tag :color="row.trigger === 'L4' ? 'red' : row.trigger === 'L3' ? 'orange' : 'blue'">{{ row.trigger }}</a-tag></template></vxe-column>
            <vxe-column field="plan" title="最新处理方案" min-width="170" />
            <vxe-column title="操作" width="110" fixed="right">
              <template #default="{ row }">
                <a-button v-if="row.status === 'pending'" size="small" @click="handleMarketRow(row)">处理</a-button>
                <a-tag v-else :color="row.autoDone ? 'default' : 'success'">{{ row.autoDone ? '自动完成' : '已完成' }}</a-tag>
              </template>
            </vxe-column>
          </vxe-table>
        </a-card>
      </template>

      <template v-else>
        <a-card :bordered="false" class="filter-card">
          <a-row :gutter="[12, 12]" align="middle">
            <a-col :xs="24" :lg="16">
              <label class="filter-field">
                <span>舆情搜索</span>
                <a-input-search
                  v-model:value="opinionSearch"
                  allow-clear
                  placeholder="输入竞品名称、ASIN、品牌、来源、关键词或评论内容"
                />
              </label>
            </a-col>
            <a-col :xs="24" :lg="8" class="filter-actions">
              <a-typography-text type="secondary">
                观点 {{ filteredOpinionResultCount }} 条 / 评论 {{ filteredMediaRows.length }} 条
              </a-typography-text>
            </a-col>
          </a-row>
        </a-card>

        <a-row :gutter="[12, 12]">
          <a-col :xs="24" :lg="16">
            <a-card title="本周AI舆情采集" :bordered="false" class="panel-card">
              <a-row :gutter="[12, 12]" class="summary-grid">
                <a-col v-for="item in sentimentSummary" :key="item.label" :xs="8" :md="4">
                  <a-card size="small" class="summary-card"><a-statistic :title="item.label" :value="item.value" /></a-card>
                </a-col>
              </a-row>
              <a-descriptions :column="{ xs: 1, md: 2 }" bordered size="small" class="condition-list">
                <a-descriptions-item v-for="item in collectionConditions" :key="item.label" :label="item.label">{{ item.value }}</a-descriptions-item>
              </a-descriptions>
            </a-card>
          </a-col>

          <a-col :xs="24" :lg="8">
            <a-card title="星级分布" :bordered="false" class="panel-card">
              <a-space direction="vertical" class="star-list">
                <a-row v-for="item in starRows" :key="item.label" :gutter="[8, 8]" align="middle">
                  <a-col :span="4"><a-typography-text>{{ item.label }}</a-typography-text></a-col>
                  <a-col :span="16"><a-progress :percent="Math.round((item.value / 14) * 100)" :stroke-color="item.color" :show-info="false" /></a-col>
                  <a-col :span="4" class="star-count"><a-typography-text strong>{{ item.value }}</a-typography-text></a-col>
                </a-row>
              </a-space>
            </a-card>
          </a-col>
        </a-row>

        <a-row :gutter="[12, 12]" class="opinion-grid">
          <a-col v-for="group in filteredOpinionGroups" :key="group.title" :xs="24" :lg="8">
            <a-card :title="group.title" :bordered="false" class="panel-card">
              <a-list :data-source="group.rows" item-layout="vertical">
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-space direction="vertical" size="small">
                      <a-space>
                        <a-typography-text :class="['opinion-topic', group.tone]" strong>{{ item.topic }}</a-typography-text>
                        <a-tag>{{ item.count }}</a-tag>
                      </a-space>
                      <a-typography-text type="secondary">{{ item.desc }}</a-typography-text>
                    </a-space>
                  </a-list-item>
                </template>
              </a-list>
            </a-card>
          </a-col>
        </a-row>

        <a-card title="典型评论与媒体线索" :bordered="false" class="table-card">
          <vxe-table :data="filteredMediaRows" border stripe :export-config="{}">
            <vxe-column field="source" title="来源" width="130"><template #default="{ row }"><a-tag>{{ row.source }}</a-tag></template></vxe-column>
            <vxe-column field="brand" title="品牌" width="120" />
            <vxe-column field="sentiment" title="倾向" width="100"><template #default="{ row }"><a-tag :color="row.sentiment === '正向' ? 'success' : row.sentiment === '负向' ? 'error' : 'default'">{{ row.sentiment }}</a-tag></template></vxe-column>
            <vxe-column field="content" title="内容" min-width="320" />
            <vxe-column field="tag" title="标签" width="130"><template #default="{ row }"><a-tag color="blue">{{ row.tag }}</a-tag></template></vxe-column>
          </vxe-table>
        </a-card>
      </template>
    </template>

    <a-drawer v-model:open="compareOpen" title="产品对比" width="920">
      <a-typography-text type="secondary">已选 {{ selectedProducts.length }}/4 个产品</a-typography-text>
      <a-row :gutter="[10, 10]" class="compare-picker">
        <a-col v-for="(slot, index) in compareSlots" :key="index" :xs="24" :md="6">
          <a-card size="small" :class="{ active: slot >= 0 }">
            <a-typography-text type="secondary">对比产品 {{ index + 1 }}</a-typography-text>
            <a-select :value="slot" size="small" class="w-full mt-1" @change="setCompareSlot(index, Number($event))">
              <a-select-option :value="-1">请选择产品</a-select-option>
              <a-select-option v-for="(competitor, competitorIndex) in competitors" :key="competitor.id" :value="competitorIndex">
                {{ competitor.brand }} {{ competitor.name }}
              </a-select-option>
            </a-select>
          </a-card>
        </a-col>
      </a-row>
      <vxe-table v-if="selectedProducts.length >= 2" :data="compareRows" border stripe show-overflow :export-config="{}">
        <vxe-column field="group" title="分组" width="120" />
        <vxe-column field="label" title="字段" width="120" />
        <vxe-column v-for="(product, index) in selectedProducts" :key="product.id" :field="`value${index}`" :title="`${product.brand} ${product.name}`" min-width="180" />
      </vxe-table>
      <a-empty v-else description="请至少选择 2 个产品进行对比" />
    </a-drawer>

    <a-modal v-model:open="exportOpen" title="按产品线导出" :footer="null" width="760px">
      <a-row :gutter="[12, 12]">
        <a-col v-for="item in [
          ['全部产品线', '导出当前竞品池内所有产品线、所有字段。'],
          ['八电极秤', '导出八电极秤竞品及基础信息、销售信息、参数、卖点、痛点等字段。'],
          ['体脂秤', '导出体脂秤竞品及基础信息、销售信息、参数、卖点、痛点等字段。'],
          ['筋膜枪', '导出筋膜枪竞品及基础信息、销售信息、参数、卖点、痛点等字段。'],
        ]" :key="item[0]" :xs="24" :md="12">
          <a-card :title="item[0]" size="small">
            <a-typography-paragraph>{{ item[1] }}</a-typography-paragraph>
            <a-button @click="message.success(`${item[0]}导出已生成`)">导出</a-button>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>

    <a-modal v-model:open="handleOpen" :title="handleTarget" :footer="null" width="640px">
      <a-row :gutter="[12, 12]">
        <a-col v-for="plan in ['转紧急异常处理', '启动实物分析', '转入需求', '解除监控并归档']" :key="plan" :span="12">
          <a-card size="small">
            <a-typography-text strong>{{ plan }}</a-typography-text>
            <a-button class="mt-3" block @click="completeMarketAction(plan)">选择方案</a-button>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>

    <CompetitorAddModal v-model:open="addOpen" @add="addCompetitor" />
  </section>
</template>

<style scoped>
.competitor-page {
  padding: 16px;
}

.page-title {
  margin: 0;
}

.stat-grid,
.page-tabs,
.opinion-grid,
.table-card,
.detail-grid,
.compare-picker,
.product-grid {
  margin-top: 16px;
}

.stat-card,
.panel-card,
.filter-card,
.table-card,
.summary-card,
.detail-head,
.field-card,
.product-card {
  border-radius: 8px;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-actions {
  text-align: right;
}

.product-card {
  min-height: 196px;
  cursor: pointer;
}

.product-card.active {
  border: 1px solid #1677ff;
  box-shadow: 0 6px 18px rgba(22, 119, 255, 0.12);
}

.card-head,
.price-row {
  margin-bottom: 10px;
}

.product-title {
  margin: 4px 0;
}

.price-row strong {
  color: #d92d20;
  font-size: 18px;
}

.selling-points {
  margin-top: 10px;
  margin-bottom: 0;
}

.status-tabs,
.condition-list {
  margin-bottom: 12px;
}

.summary-grid {
  margin-bottom: 16px;
}

.star-list {
  width: 100%;
}

.star-count,
.filter-actions {
  text-align: right;
}

.field-card {
  min-height: 74px;
}

.field-card strong {
  display: block;
  margin-top: 6px;
}

.opinion-topic.good {
  color: #22a06b;
}

.opinion-topic.bad {
  color: #e5484d;
}

.opinion-topic.warning {
  color: #d48806;
}
</style>
