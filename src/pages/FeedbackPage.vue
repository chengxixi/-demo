<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FeedbackItem, WorkOrder } from '@/types'
import { feedbackData } from '@/api/mock'
import FeedbackAddModal from './feedback/FeedbackAddModal.vue'
import FeedbackBatchCloseModal from './feedback/FeedbackBatchCloseModal.vue'
import FeedbackFilter from './feedback/FeedbackFilter.vue'
import FeedbackImportModal from './feedback/FeedbackImportModal.vue'
import FeedbackReviewModal from './feedback/FeedbackReviewModal.vue'
import FeedbackTable from './feedback/FeedbackTable.vue'
import FeedbackTemplateModal from './feedback/FeedbackTemplateModal.vue'

interface AiRecommendation {
  id: string
  route: string
  reason: string
  summary: string
  model: string
  level3: string
  confidence: 'high' | 'medium' | 'low'
}

const GENERATED_WORKORDERS_KEY = 'feedback-generated-workorders'

const router = useRouter()
const items = ref<FeedbackItem[]>([...feedbackData])
const selectedIds = ref<Set<string>>(new Set())
const activeTab = ref('pending')
const addOpen = ref(false)
const reviewOpen = ref(false)
const templateOpen = ref(false)
const importOpen = ref(false)
const batchCloseOpen = ref(false)
const filterVisible = ref(false)
const aiOpen = ref(false)
const currentItem = ref<FeedbackItem | null>(null)
const aiRecommendations = ref<AiRecommendation[]>([])

const aiRouteSummary = computed(() => {
  return routeCards
    .map((route) => ({
      ...route,
      count: aiRecommendations.value.filter((item) => item.route === route.key).length,
    }))
    .filter((route) => route.count > 0)
})

const filters = ref({
  keyword: '',
  source: '',
  mode: '',
  processState: '',
  exception: '',
  brand: '',
  site: '',
  productType: '',
  model: '',
  internal: '',
  level1: '',
  level2: '',
  level3: '',
  feedbackUser: '',
  dateFrom: '',
  dateTo: '',
  returned: '',
  processRoute: '',
})

const tabOptions = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'review', label: '待人工复核' },
  { key: 'done', label: '已处理' },
  { key: 'mine', label: '我的反馈' },
]

const routeCards = [
  { key: '已转需求', title: '转产品需求', desc: '有产品价值的问题进入需求池，补充证据和评分。' },
  { key: '已转异常', title: '转紧急异常', desc: '安全、法规、合规、集中投诉或重大风险进入 P0/P1 流程。' },
  { key: '已转Q&A', title: '沉淀 Q&A', desc: '咨询类或已解决问题沉淀为标准回复和案例库。' },
  { key: '已直接回复关闭', title: '直接关闭', desc: '确认已回复用户并记录关闭原因。' },
  { key: '已转工单', title: '转工单', desc: '集中质量问题转工单持续跟进。' },
]

const selectedItems = computed(() => items.value.filter((item) => selectedIds.value.has(item.id)))

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const keyword = filters.value.keyword.trim().toLowerCase()
    const text = [
      item.id,
      item.brand,
      item.site,
      item.model,
      item.internal,
      item.asin,
      item.orderNo,
      item.raw,
      item.ai,
      item.feedbackUser,
      item.handler,
      item.level1,
      item.level2,
      item.level3,
    ]
      .join(' ')
      .toLowerCase()

    const matchesKeyword = !keyword || text.includes(keyword)
    const matchesSource = !filters.value.source || dataSource(item).includes(filters.value.source) || item.source === filters.value.source
    const matchesMode = !filters.value.mode || item.createMode === filters.value.mode
    const matchesState = !filters.value.processState || item.processState === filters.value.processState || (filters.value.processState === '待人工复核' && item.processState === '待复核')
    const matchesException = !filters.value.exception || item.exception === filters.value.exception
    const matchesBrand = !filters.value.brand || item.brand === filters.value.brand
    const matchesSite = !filters.value.site || item.site === filters.value.site
    const matchesProductType = !filters.value.productType || item.productType === filters.value.productType
    const matchesModel = !filters.value.model || item.model.toLowerCase().includes(filters.value.model.toLowerCase())
    const matchesInternal = !filters.value.internal || item.internal.toLowerCase().includes(filters.value.internal.toLowerCase())
    const matchesLevel1 = !filters.value.level1 || item.level1 === filters.value.level1
    const matchesLevel2 = !filters.value.level2 || item.level2.toLowerCase().includes(filters.value.level2.toLowerCase())
    const matchesLevel3 = !filters.value.level3 || item.level3.toLowerCase().includes(filters.value.level3.toLowerCase())
    const matchesFeedbackUser = !filters.value.feedbackUser || item.feedbackUser.includes(filters.value.feedbackUser)
    const matchesDateFrom = !filters.value.dateFrom || item.date >= filters.value.dateFrom
    const matchesDateTo = !filters.value.dateTo || item.date <= filters.value.dateTo
    const matchesReturned = !filters.value.returned || item.returned === filters.value.returned
    const matchesProcessRoute = !filters.value.processRoute || item.processRoute === filters.value.processRoute
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'pending' && ['待处理', '待复核', '待人工复核'].includes(item.processState)) ||
      (activeTab.value === 'review' && ['待复核', '待人工复核'].includes(item.processState)) ||
      (activeTab.value === 'done' && item.processState === '已处理') ||
      (activeTab.value === 'mine' && item.handler === '李工')

    return (
      matchesKeyword &&
      matchesSource &&
      matchesMode &&
      matchesState &&
      matchesException &&
      matchesBrand &&
      matchesSite &&
      matchesProductType &&
      matchesModel &&
      matchesInternal &&
      matchesLevel1 &&
      matchesLevel2 &&
      matchesLevel3 &&
      matchesFeedbackUser &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesReturned &&
      matchesProcessRoute &&
      matchesTab
    )
  })
})

const tabCounts = computed(() => ({
  review: items.value.filter((item) => ['待复核', '待人工复核'].includes(item.processState)).length,
}))

const feedbackStats = computed(() => {
  const mergeGroups = new Set(items.value.map((item) => item.mergeGroup).filter(Boolean))

  return [
    {
      title: '反馈总数',
      value: items.value.length,
      note: '覆盖商品评论、退货反馈、APP反馈、客服沟通',
    },
    {
      title: '合并组',
      value: mergeGroups.size,
      note: '同类问题可展开合并处理',
    },
    {
      title: '待处理',
      value: items.value.filter((item) => ['待处理', '待复核', '待人工复核'].includes(item.processState)).length,
      note: '包含待处理和待人工复核',
    },
    {
      title: '待人工复核',
      value: tabCounts.value.review,
      note: '等待人工确认分类和处理去向',
    },
  ]
})

function dataSource(item: FeedbackItem) {
  if (item.dataSource) return item.dataSource
  if (item.source === '退货原因' || item.source === '退货反馈') return item.region === '国内' ? '国内电商-退货反馈' : '海外电商-退货反馈'
  if (item.source === '商品评论') return item.region === '国内' ? '国内电商-商品评论' : '海外电商-商品评论'
  return item.source
}

function suggestRoute(item: FeedbackItem) {
  const text = `${item.level1} ${item.level2} ${item.level3} ${item.raw} ${item.ai}`
  if (['P0', 'P1'].includes(item.exception)) return { route: '已转异常', reason: '异常等级较高，建议进入异常流程。' }
  if (item.returned === '退货' || item.returned === '换货' || item.returned === '退货+换货') return { route: '已转工单', reason: '涉及退换货，需要工单持续跟进。' }
  if (item.level1 === '产品体验' || text.includes('建议') || text.includes('功能')) return { route: '已转需求', reason: '反馈包含产品体验或功能改进价值。' }
  if (item.level1 === '咨询服务' || text.includes('咨询') || text.includes('说明')) return { route: '已转Q&A', reason: '咨询类问题适合沉淀标准问答。' }
  return { route: '已直接回复关闭', reason: '未识别到持续跟进风险，可直接回复并关闭。' }
}

function routeTitle(route: string) {
  return routeCards.find((item) => item.key === route)?.title || route
}

function routeColor(route: string) {
  if (route === '已转异常') return 'red'
  if (route === '已转工单') return 'orange'
  if (route === '已转需求') return 'blue'
  if (route === '已转Q&A') return 'purple'
  return 'green'
}

function routeConfidence(item: FeedbackItem, route: string): 'high' | 'medium' | 'low' {
  if (['P0', 'P1'].includes(item.exception) || route === '已转工单') return 'high'
  if (route === '已转需求' || route === '已转异常') return 'medium'
  return 'low'
}

function confidenceLabel(confidence: AiRecommendation['confidence']) {
  if (confidence === 'high') return '高'
  if (confidence === 'medium') return '中'
  return '低'
}

function confidenceColor(confidence: AiRecommendation['confidence']) {
  if (confidence === 'high') return 'green'
  if (confidence === 'medium') return 'orange'
  return 'red'
}

function openAiAssist() {
  if (!selectedItems.value.length) {
    message.info('请先选择需要AI辅助处理的反馈')
    return
  }

  aiRecommendations.value = selectedItems.value.map((item) => {
    const suggestion = suggestRoute(item)
    const summary = item.raw || item.ai || item.level3 || item.level2
    return {
      id: item.id,
      route: suggestion.route,
      reason: suggestion.reason,
      summary: summary.length > 52 ? summary.slice(0, 52) + '...' : summary,
      model: item.model,
      level3: item.level3,
      confidence: routeConfidence(item, suggestion.route),
    }
  })
  aiOpen.value = true
}

function updateRecommendation(id: string, route: string) {
  aiRecommendations.value = aiRecommendations.value.map((item) => (item.id === id ? { ...item, route } : item))
}

function confirmAiRecommendations() {
  const workOrderTargets: FeedbackItem[] = []

  items.value = items.value.map((item) => {
    const recommendation = aiRecommendations.value.find((row) => row.id === item.id)
    if (!recommendation) return item

    const next = {
      ...item,
      processRoute: recommendation.route,
      processState: '已处理',
      handler: '管理员',
      note: recommendation.reason,
    }

    if (recommendation.route === '已转工单') workOrderTargets.push(next)
    return next
  })

  if (workOrderTargets.length) appendGeneratedWorkOrders(workOrderTargets)
  aiOpen.value = false
  selectedIds.value = new Set()
  message.success('AI辅助建议已应用')
}

function productLine(item: FeedbackItem) {
  if (item.productType === '筋膜枪') return '筋膜枪产品线'
  if (item.productType === '八电极') return '八电极产品线'
  return '体脂秤产品线'
}

function buildWorkOrder(targets: FeedbackItem[]): WorkOrder {
  const first = targets[0]
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  return {
    id: `TK-${date}-${String(Date.now()).slice(-4)}`,
    summary: `${first.model || first.internal} ${first.level3 || '反馈问题'}处理`,
    relatedFeedback: targets.map((item) => item.id).join(' / '),
    productLine: productLine(first),
    status: '处理中',
    owner: first.productType === '筋膜枪' ? '孙工' : '李工',
    dept: '产品部',
    sla: '24h',
    result: '待处理',
    closeReason: '-',
    exception: ['P0', 'P1'].includes(first.exception) ? '是' : '否',
    requirement: first.level1 === '产品体验' ? '预留' : '否',
    qa: '否',
    step: 1,
    aiAbstract: targets.map((item) => item.ai || item.raw).join(' / '),
    closeNote: '',
  }
}

function appendGeneratedWorkOrders(targets: FeedbackItem[]) {
  const stored = JSON.parse(localStorage.getItem(GENERATED_WORKORDERS_KEY) || '[]') as WorkOrder[]
  const existingFeedback = new Set(stored.flatMap((order) => order.relatedFeedback.split(' / ')))
  const nextTargets = targets.filter((item) => !existingFeedback.has(item.id))
  if (!nextTargets.length) return

  const next = [buildWorkOrder(nextTargets), ...stored]
  localStorage.setItem(GENERATED_WORKORDERS_KEY, JSON.stringify(next))
}

function openDetail(item: FeedbackItem) {
  router.push(`/feedback/detail/${encodeURIComponent(item.id)}`)
}

function openMergeDetail(groupId: string) {
  router.push(`/feedback/merge/${encodeURIComponent(groupId)}`)
}

function openReview(item: FeedbackItem) {
  currentItem.value = item
  reviewOpen.value = true
}

function addFeedback(item: FeedbackItem) {
  items.value = [item, ...items.value]
  message.success('反馈已新增')
}

function updateFeedback(item: FeedbackItem) {
  items.value = items.value.map((row) => (row.id === item.id ? item : row))
  message.success('反馈已更新')
}

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value)

  if (next.has(id)) next.delete(id)
  else next.add(id)

  selectedIds.value = next
}

function toggleSelectMany(ids: string[]) {
  const next = new Set(selectedIds.value)
  const allSelected = ids.every((id) => next.has(id))

  ids.forEach((id) => {
    if (allSelected) next.delete(id)
    else next.add(id)
  })
  selectedIds.value = next
}

function toggleSelectAll() {
  if (selectedIds.value.size === filteredItems.value.length) {
    selectedIds.value = new Set()
    return
  }

  selectedIds.value = new Set(filteredItems.value.map((item) => item.id))
}

function batchClose() {
  if (selectedIds.value.size === 0) {
    message.info('请先选择反馈')
    return
  }

  batchCloseOpen.value = true
}

function confirmBatchClose(payload: { route: string; closeReason: string; qa: boolean }) {
  const workOrderTargets: FeedbackItem[] = []

  items.value = items.value.map((item) => {
    if (!selectedIds.value.has(item.id)) return item

    const next = {
      ...item,
      processRoute: payload.route,
      processState: '已处理',
      solution: payload.closeReason || item.solution || '批量关闭确认',
      note: payload.qa ? '已同步沉淀Q&A' : item.note,
    }
    if (payload.route === '已转工单') workOrderTargets.push(next)
    return next
  })

  if (workOrderTargets.length) appendGeneratedWorkOrders(workOrderTargets)
  selectedIds.value = new Set()
  message.success('已批量处理')
}

function submitImport() {
  message.success('导入任务已创建，需复核的数据会进入待人工复核')
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-row :gutter="[12, 12]" align="middle" justify="space-between">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">反馈清单</a-typography-title>
          <a-typography-text type="secondary">
            按来源汇聚反馈，支持同类问题合并展开、复核、转异常、转需求和批量关闭。
          </a-typography-text>
        </a-space>
      </a-col>
      <a-col>
        <a-space>
          <a-button @click="openAiAssist">AI辅助处理</a-button>
          <a-button @click="filterVisible = !filterVisible">{{ filterVisible ? '收起筛选' : '筛选' }}</a-button>
          <a-button @click="templateOpen = true">我的模板设置</a-button>
          <a-button @click="importOpen = true">批量导入</a-button>
          <a-button @click="batchClose">批量关闭</a-button>
          <a-button type="primary" @click="addOpen = true">新增反馈</a-button>
        </a-space>
      </a-col>
    </a-row>

    <a-row :gutter="[12, 12]">
      <a-col v-for="stat in feedbackStats" :key="stat.title" :xs="12" :lg="6">
        <a-card size="small" :bordered="false" class="feedback-stat-card">
          <a-statistic :title="stat.title" :value="stat.value" />
          <a-typography-text type="secondary">{{ stat.note }}</a-typography-text>
        </a-card>
      </a-col>
    </a-row>

    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane v-for="tab in tabOptions" :key="tab.key">
        <template #tab>
          <span class="tab-label">
            {{ tab.label }}
            <a-tag v-if="tab.key === 'review'" color="red" class="tab-count">{{ tabCounts.review }}个</a-tag>
          </span>
        </template>
      </a-tab-pane>
    </a-tabs>

    <FeedbackFilter v-if="filterVisible" v-model:filters="filters" />

    <FeedbackTable
      :items="filteredItems"
      :selected-ids="selectedIds"
      @toggle-select="toggleSelect"
      @toggle-select-many="toggleSelectMany"
      @toggle-select-all="toggleSelectAll"
      @open-detail="openDetail"
      @open-merge="openMergeDetail"
      @manual-review="openReview"
    />

    <a-modal v-model:open="aiOpen" title="AI 处理建议清单" width="980px" :footer="null">
      <a-space direction="vertical" size="middle" class="w-full">
        <a-alert type="info" show-icon message="AI 已分析选中反馈并给出初步处理建议，请人工复核后确认导入。" />
        <div class="ai-summary-bar">
          <div v-for="item in aiRouteSummary" :key="item.key" class="ai-summary-item">
            <strong>{{ item.count }}</strong>
            <small>{{ item.title }}</small>
          </div>
          <a-typography-text type="secondary" class="ai-total">共 {{ aiRecommendations.length }} 条</a-typography-text>
        </div>
        <vxe-table :data="aiRecommendations" border size="mini" stripe max-height="420">
          <vxe-column field="id" title="反馈ID" width="140" />
          <vxe-column title="问题摘要" min-width="230">
            <template #default="{ row }">
              <a-typography-text strong>{{ row.summary }}</a-typography-text>
              <div class="ai-meta">{{ row.model }} · {{ row.level3 }}</div>
            </template>
          </vxe-column>
          <vxe-column title="AI建议" width="120">
            <template #default="{ row }">
              <a-tag :color="routeColor(row.route)">{{ routeTitle(row.route) }}</a-tag>
            </template>
          </vxe-column>
          <vxe-column field="reason" title="建议理由" min-width="260" />
          <vxe-column title="信心" width="70" align="center">
            <template #default="{ row }">
              <a-tag :color="confidenceColor(row.confidence)">{{ confidenceLabel(row.confidence) }}</a-tag>
            </template>
          </vxe-column>
          <vxe-column title="人工调整" width="170">
            <template #default="{ row }">
              <a-select
                :value="row.route"
                class="w-full"
                :options="routeCards.map((item) => ({ label: item.title, value: item.key }))"
                @change="updateRecommendation(row.id, String($event))"
              />
            </template>
          </vxe-column>
        </vxe-table>
        <a-typography-text type="secondary" class="ai-tip">
          提示：可在人工调整列修改每条反馈的处理方式，确认后会批量导入到对应模块。
        </a-typography-text>
        <div class="ai-actions">
          <a-space>
            <a-button @click="aiOpen = false">取消</a-button>
            <a-button type="primary" @click="confirmAiRecommendations">确认导入全部建议</a-button>
          </a-space>
        </div>
      </a-space>
    </a-modal>

    <FeedbackAddModal v-model:open="addOpen" @add="addFeedback" />
    <FeedbackImportModal v-model:open="importOpen" @submit="submitImport" />
    <FeedbackBatchCloseModal v-model:open="batchCloseOpen" :items="selectedItems" @confirm="confirmBatchClose" />
    <FeedbackReviewModal v-model:open="reviewOpen" :item="currentItem" @save="updateFeedback" />
    <FeedbackTemplateModal v-model:open="templateOpen" />
  </section>
</template>

<style scoped>
.feedback-stat-card {
  border-radius: 8px;
  min-height: 122px;
}

.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tab-count {
  margin-inline-end: 0;
}

.ai-summary-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  background: #fafafa;
}

.ai-summary-item {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #eef4ff;
  color: #1d4ed8;
}

.ai-summary-item strong {
  font-size: 18px;
}

.ai-total {
  margin-left: auto;
}

.ai-meta,
.ai-tip {
  color: #667085;
  font-size: 12px;
}

.ai-actions {
  display: flex;
  justify-content: flex-end;
}
</style>