<script setup lang="ts">
import { ref, computed } from 'vue'
import { Package } from 'lucide-vue-next'
import { competitorData } from '@/api/mock-data'
import type { Competitor, LevelRecord } from '@/types'
import CompetitorFilter from './CompetitorFilter.vue'
import CompetitorCard from './CompetitorCard.vue'
import CompetitorAddModal from './CompetitorAddModal.vue'
import CompetitorDetail from './CompetitorDetail.vue'
import CompetitorCompare from './CompetitorCompare.vue'
import CompetitorMonitor from './CompetitorMonitor.vue'
import CompetitorSentiment from './CompetitorSentiment.vue'

// ===== Header & Stats =====
const tabs = ['竞品信息', '市场监控', '舆情监测']
const activeMainTab = ref<'market' | 'sentiment' | 'products'>('products')
const stats = [
  { label: '监控平台', value: '5', sub: 'Amazon/天猫/京东/抖音/独立站' },
  { label: '分析对象', value: '126', sub: '+18 本周' },
  { label: '价格异动', value: '23', sub: '+7 本周' },
  { label: '上新/卖点变化', value: '14', sub: '+5 本周' },
]

// ===== 竞品列表 =====
const allCompetitors = ref<Competitor[]>(JSON.parse(JSON.stringify(competitorData)))
const productLineFilter = ref('全部')
const filterObj = ref({ name: '', channelType: '', asin: '', line: '', price: '' })

const filteredCompetitors = computed(() => {
  if (productLineFilter.value === '全部') return allCompetitors.value
  return allCompetitors.value.filter(c => c.category === productLineFilter.value)
})

const filterFilteredCompetitors = computed(() => {
  return allCompetitors.value.filter(c => {
    if (productLineFilter.value !== '全部' && c.category !== productLineFilter.value) return false
    const name = (c.brand + ' ' + c.name).toLowerCase()
    if (filterObj.value.name && !name.includes(filterObj.value.name.toLowerCase())) return false
    if (filterObj.value.channelType && c.channelType !== filterObj.value.channelType) return false
    if (filterObj.value.asin && !(c.asin || '').toUpperCase().includes(filterObj.value.asin.toUpperCase())) return false
    if (filterObj.value.line && c.category !== filterObj.value.line) return false
    if (filterObj.value.price && !String(c.dealPrice).includes(filterObj.value.price)) return false
    return true
  })
})

function handleResetFilters() {
  filterObj.value = { name: '', channelType: '', asin: '', line: '', price: '' }
}

// ===== 详情页 =====
const selectedCompetitor = ref<Competitor | null>(null)
const showDetail = ref(false)
const levelRecords = ref<LevelRecord[]>([])
const showArchive = ref(false)
const showPhysicalAnalysis = ref(false)
const physicalAnalysis = ref({
  status: '待上传报告', owner: '', deadline: '', triggerSource: 'L4 紧急提醒',
  analysisType: '实物分析 + 拆机分析 + 产品体验', focusItems: '', conclusion: '',
})

function getLevelRecords(): LevelRecord[] {
  const c = selectedCompetitor.value
  if (!c) return []
  return [
    { level: 'L1', source: '日常监控', content: `${c.brand} ${c.name} 页面卖点与价格无明显变化。`, action: '继续监控', status: '展示', date: '2026-06-03' },
    { level: 'L2', source: '价格/排名', content: `${c.name} 价格小幅波动，未形成明确业务影响。`, action: '继续监控', status: '展示', date: '2026-06-09' },
    { level: 'L3', source: '触发提醒', content: `${c.name} 近7天价格、排名或差评趋势变化明显。`, action: '转入需求', status: '已提醒产品经理', date: '2026-06-15' },
    { level: 'L4', source: '紧急提醒', content: `${c.name} 出现关键功能变化，需要实物分析确认。`, action: '启动实物分析', status: '处理中', date: '2026-06-18' },
  ]
}

function handleOpenDetail(c: Competitor) {
  selectedCompetitor.value = c
  levelRecords.value = getLevelRecords()
  showDetail.value = true
}

function handleCloseDetail() { showDetail.value = false; selectedCompetitor.value = null }

function handleArchive(c: Competitor) {
  c.archived = !c.archived
  c.monitorStatus = c.archived ? '已归档' : '正常监控'
  showArchive.value = c.archived
}

function handleUnmonitor(c: Competitor) {
  if (c.monitorStatus === '已解除监控') { c.monitorStatus = '正常监控' }
  else { c.monitorStatus = '已解除监控' }
}

// ===== 产品对比 =====
const showCompare = ref(false)
const compareSlots = ref([0, 1, -1, -1])

// ===== 增加竞品 =====
const showAddModal = ref(false)
const addModalKey = ref(0)

function handleOpenAddModal() {
  addModalKey.value++
  showAddModal.value = true
}

function handleCloseAddModal() { showAddModal.value = false }

function handleSaveCompetitor(c: Competitor) {
  allCompetitors.value.unshift(c)
  showAddModal.value = false
}

// ===== 收藏/对比选择 =====
const compareChecked = ref<Set<string>>(new Set())

function handleToggleCompareCheck(id: string) {
  if (compareChecked.value.has(id)) { compareChecked.value.delete(id) }
  else {
    if (compareChecked.value.size >= 4) return
    compareChecked.value.add(id)
  }
}

function handleStartCompare() {
  const checked = Array.from(compareChecked.value)
  if (checked.length < 2) return
  compareSlots.value = [-1, -1, -1, -1]
  checked.forEach((id, i) => {
    const idx = allCompetitors.value.findIndex(c => c.id === id)
    if (idx >= 0) compareSlots.value[i] = idx
  })
  showCompare.value = true
}

function handleStartPhysicalAnalysis(c: Competitor) {
  selectedCompetitor.value = c
  showPhysicalAnalysis.value = true
  physicalAnalysis.value = {
    status: '待上传报告', owner: '', deadline: '', triggerSource: 'L4 紧急提醒',
    analysisType: '实物分析 + 拆机分析 + 产品体验', focusItems: '', conclusion: '',
  }
}
</script>

<template>
  <div class="page">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-left">
        <span class="page-header-sub">竞品分析</span>
        <h1>竞品分析</h1>
        <p>整合市场动态、舆情监测和竞品产品档案，支撑需求机会识别与产品策略判断。</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div v-for="s in stats" :key="s.label" class="stat-card">
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-sub">{{ s.sub }}</div>
      </div>
    </div>

    <!-- 主Tab -->
    <div class="tabs-row compact-tabs">
      <button v-for="t in tabs" :key="t" :class="{ active: activeMainTab === (t === '竞品信息' ? 'products' : t === '市场监控' ? 'market' : 'sentiment') }"
        @click="activeMainTab = t === '竞品信息' ? 'products' : t === '市场监控' ? 'market' : 'sentiment'">
        {{ t }}
      </button>
    </div>

    <div class="page-body" v-if="showDetail">
      <CompetitorDetail
        :competitor="selectedCompetitor"
        :visible="showDetail"
        :level-records="levelRecords"
        :show-archive="showArchive"
        :show-physical-analysis="showPhysicalAnalysis"
        :physical-analysis="physicalAnalysis"
        @close="handleCloseDetail"
        @archive="handleArchive"
        @unmonitor="handleUnmonitor"
        @start-physical-analysis="handleStartPhysicalAnalysis"
        @update:physical-analysis="physicalAnalysis = $event"
      />
    </div>

    <div class="page-body" v-else>
      <CompetitorMonitor v-if="activeMainTab === 'market'" />
      <CompetitorSentiment v-if="activeMainTab === 'sentiment'" />

      <div v-if="activeMainTab === 'products'">
        <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
          <button class="primary-button" @click="handleOpenAddModal">增加竞品</button>
        </div>

        <CompetitorFilter
          v-model:filters="filterObj"
          @reset="handleResetFilters"
          @compare="handleStartCompare"
        />

        <div class="product-card-grid">
          <CompetitorCard
            v-for="c in filterFilteredCompetitors"
            :key="c.id"
            :competitor="c"
            @click="handleOpenDetail"
          />
        </div>

        <div v-if="filterFilteredCompetitors.length === 0" style="text-align:center;padding:40px;color:#999;">
          <Package style="width:48px;height:48px;margin:0 auto 12px;color:#ccc;" />
          <p>暂无竞品数据</p>
          <button class="primary-button" style="margin-top:12px;" @click="handleOpenAddModal">增加竞品</button>
        </div>
      </div>
    </div>

    <CompetitorCompare
      :all-competitors="allCompetitors"
      v-model:compare-slots="compareSlots"
      :visible="showCompare"
      @close="showCompare = false"
    />

    <CompetitorAddModal
      :key="addModalKey"
      :visible="showAddModal"
      @close="handleCloseAddModal"
      @save="handleSaveCompetitor"
    />
  </div>
</template>

<style scoped>
.page { padding: 0; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-header-left h1 { margin: 0; font-size: 24px; }
.page-header-left p { margin: 4px 0 0; color: #667085; font-size: 13px; }
.page-header-sub { display: inline-block; padding: 2px 8px; background: #eef4ff; color: #175cd3; border-radius: 4px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }
.stat-card { background: #fff; border: 1px solid #d7deea; border-radius: 8px; padding: 16px; }
.stat-label { font-size: 12px; color: #667085; font-weight: 600; }
.stat-value { font-size: 28px; font-weight: 800; color: #101828; margin: 4px 0; }
.stat-sub { font-size: 11px; color: #475467; }
.tabs-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.tabs-row button { padding: 6px 16px; border: 1px solid #d7deea; border-radius: 6px; background: #fff; font-size: 13px; cursor: pointer; }
.tabs-row button.active { background: #175cd3; color: #fff; border-color: #175cd3; }
.page-body { min-height: 400px; }
.product-card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; margin: 14px 0 16px; }
.primary-button { padding: 8px 16px; background: #175cd3; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
</style>
