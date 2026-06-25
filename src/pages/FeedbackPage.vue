<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Filter, Plus, ChevronDown, X, FileDown } from 'lucide-vue-next'
import { useFeedbackStore } from '@/stores'
import { siteOptions, sourceOptions, processRouteOptions, processStateOptions, exceptionLevels, returnOptions, feedbackTabOptions } from '@/api/mock-data'
import type { FeedbackItem } from '@/types'

const store = useFeedbackStore()
const detailItem = ref<FeedbackItem | null>(null)

// Select all / individual checkboxes
const selectedIds = ref<Set<string>>(new Set())
const allSelected = computed(() => {
  const items = store.filteredItems
  return items.length > 0 && items.every(i => selectedIds.value.has(i.id))
})
const someSelected = computed(() => {
  const items = store.filteredItems
  return items.length > 0 && items.some(i => selectedIds.value.has(i.id)) && !allSelected.value
})
function toggleSelectAll() {
  const items = store.filteredItems
  if (allSelected.value) {
    items.forEach(i => selectedIds.value.delete(i.id))
  } else {
    items.forEach(i => selectedIds.value.add(i.id))
  }
}
function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

// Detail editing
const editMode = ref(false)
const editData = ref<Partial<FeedbackItem>>({})

const tabCounts = computed(() => ({
  all: store.items.length,
  pending: store.items.filter(i => i.processState === '待处理').length,
  review: store.items.filter(i => i.processState === '待人工复核').length,
  done: store.items.filter(i => i.processState === '已处理').length,
  mine: store.items.filter(i => i.feedbackUser === '张伟').length,
}))

function getDataSource(item: FeedbackItem): string {
  if (item.source === '退货原因') return item.site === 'Amazon.com (US)' ? '海外电商-退货反馈' : '国内电商-退货反馈'
  if (item.source === '商品评论') return item.site === 'Amazon.com (US)' ? '海外电商-商品评论' : '国内电商-商品评论'
  return item.source
}

function getDeviceType(item: FeedbackItem): string {
  return item.productType === '体脂秤' ? '八电极' : item.productType
}

function getSolution(item: FeedbackItem): string {
  if (item.processRoute === '待处理') return '待产品经理确认处理方案'
  if (item.processRoute === '已转工单') return '已转工单跟进质量排查'
  if (item.processRoute === '已转需求') return '已转需求池评审'
  if (item.processRoute === '已转异常') return '已转异常处理流程'
  if (item.processRoute === '已转Q&A') return '已沉淀至Q&A案例库'
  return '已直接回复并关闭'
}

function getExpressNo(item: FeedbackItem): string {
  if (['退货', '换货', '退货+换货'].includes(item.returned)) return `RT-${item.id.replace(/[^0-9]/g, '').slice(-8)}`
  return ''
}

function getRegion(item: FeedbackItem): string {
  return item.site === 'Amazon.com (US)' ? '海外' : '国内'
}

function openDetail(item: FeedbackItem) {
  detailItem.value = item
  editData.value = { ...item }
  editMode.value = false
  showReplyPanel.value = false
  replyContent.value = ''
}

function closeDetail() {
  detailItem.value = null
}

function saveDetail() {
  if (detailItem.value) {
    store.updateItem(detailItem.value.id, editData.value)
    closeDetail()
  }
}

function applyRoute(item: FeedbackItem, route: string) {
  store.updateItem(item.id, {
    processRoute: route,
    processState: route === '待处理' ? '待处理' : '已处理',
    handler: route === '已转工单' ? '系统' : '陈晨',
  })
  if (detailItem.value?.id === item.id) closeDetail()
}

function unmergeItem(item: FeedbackItem) {
  store.updateItem(item.id, { mergeGroup: '' })
}

// Reply panel in detail
const showReplyPanel = ref(false)
const replyContent = ref('')
function toggleReplyPanel() {
  showReplyPanel.value = !showReplyPanel.value
}
function confirmDirectClose() {
  if (detailItem.value) {
    store.updateItem(detailItem.value.id, {
      processRoute: '已直接回复关闭',
      processState: '已处理',
      handler: '陈晨',
    })
    showReplyPanel.value = false
    replyContent.value = ''
    closeDetail()
  }
}

// Toast notification
const toast = ref<{ msg: string; type: 'info' | 'success' | 'warning' } | null>(null)
function showToast(msg: string, type: 'info' | 'success' | 'warning' = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

// ==================== Add Feedback Modal ====================
const showAddModal = ref(false)
const newFeedback = ref({
  id: 'CS-20260618-0007',
  region: '海外',
  dataSource: '海外电商-退货反馈',
  deviceType: '八电极',
  brand: '云康宝',
  internal: 'YL-CS20A-8',
  model: 'CS20A',
  orderNo: 'B0CS20AUS1',
  expressNo: '',
  feedbackDate: '2026-06-18',
  raw: '用户反馈体脂秤无法开机，疑似电池或主板异常。',
  ai: 'The customer reports that the body fat scale cannot power on, possibly due to a battery or mainboard issue.',
  solution: '待产品经理确认处理方案。',
  level1: '产品质量',
  level2: '硬件损坏/无法使用',
  level3: '无法开机/上电',
  exception: 'P2',
})

function addFeedback() {
  showAddModal.value = true
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const tpl = defaultTemplate.value?.fields || defaultTemplateFields
  newFeedback.value = {
    id: `CS-${dateStr}-${String(store.items.length + 1).padStart(4, '0')}`,
    region: tpl.region,
    dataSource: tpl.dataSource,
    deviceType: tpl.deviceType,
    brand: tpl.brand,
    internal: tpl.internal,
    model: tpl.model,
    orderNo: tpl.orderNo,
    expressNo: tpl.expressNo,
    feedbackDate: now.toISOString().slice(0, 10),
    raw: '',
    ai: '',
    solution: tpl.solution,
    level1: tpl.level1,
    level2: tpl.level2,
    level3: tpl.level3,
    exception: tpl.exception,
  }
}

function closeAddModal() {
  showAddModal.value = false
  showTemplatePicker.value = false
}

// ==================== Import Template into New Feedback ====================
const showTemplatePicker = ref(false)

function importTemplateFrom(tpl: Template) {
  const f = tpl.fields
  newFeedback.value.region = f.region
  newFeedback.value.dataSource = f.dataSource
  newFeedback.value.deviceType = f.deviceType
  newFeedback.value.brand = f.brand
  newFeedback.value.internal = f.internal
  newFeedback.value.model = f.model
  newFeedback.value.orderNo = f.orderNo
  newFeedback.value.expressNo = f.expressNo
  newFeedback.value.feedbackDate = f.feedbackDate
  newFeedback.value.raw = f.raw
  newFeedback.value.ai = f.ai
  newFeedback.value.solution = f.solution
  newFeedback.value.level1 = f.level1
  newFeedback.value.level2 = f.level2
  newFeedback.value.level3 = f.level3
  newFeedback.value.exception = f.exception
  showToast(`已导入模板「${tpl.name}」`, 'success')
  showTemplatePicker.value = false
}

function submitNewFeedback() {
  if (!newFeedback.value.raw.trim()) {
    showToast('请填写用户反馈内容', 'warning')
    return
  }
  const item: FeedbackItem = {
    id: newFeedback.value.id,
    site: newFeedback.value.region === '海外' ? 'Amazon.com (US)' : '京东',
    source: newFeedback.value.dataSource.includes('退货') ? '退货原因' : newFeedback.value.dataSource.includes('评论') ? '商品评论' : newFeedback.value.dataSource,
    brand: newFeedback.value.brand,
    productType: newFeedback.value.deviceType === '八电极' ? '体脂秤' : newFeedback.value.deviceType,
    model: newFeedback.value.model,
    internal: newFeedback.value.internal,
    asin: newFeedback.value.orderNo,
    raw: newFeedback.value.raw,
    ai: newFeedback.value.ai,
    date: newFeedback.value.feedbackDate,
    processRoute: '待处理',
    processState: '待处理',
    level1: newFeedback.value.level1,
    level2: newFeedback.value.level2,
    level3: newFeedback.value.level3,
    exception: newFeedback.value.exception,
    createMode: '人工录入',
    returned: '否',
    feedbackUser: '张伟',
    handler: '',
    mergeGroup: '',
    sentiment: '中性',
  }
  store.addItem(item)
  closeAddModal()
  showToast(`反馈 ${item.id} 已创建成功`, 'success')
}

// ==================== Template Settings Modal (Multi-template) ====================
interface TemplateField {
  region: string
  dataSource: string
  deviceType: string
  brand: string
  internal: string
  model: string
  orderNo: string
  expressNo: string
  feedbackDate: string
  image: string
  video: string
  createMode: string
  exception: string
  processRoute: string
  processState: string
  feedbackUser: string
  level1: string
  level2: string
  level3: string
  raw: string
  ai: string
  solution: string
  note: string
}

interface Template {
  id: string
  name: string
  isDefault: boolean
  fields: TemplateField
}

const defaultTemplateFields: TemplateField = {
  region: '海外', dataSource: '海外电商-退货反馈', deviceType: '八电极',
  brand: '云康宝', internal: 'YL-CS20A-8', model: 'CS20A',
  orderNo: 'B0CS20AUS1', expressNo: '', feedbackDate: new Date().toISOString().slice(0, 10),
  image: '', video: '', createMode: '人工录入', exception: '否',
  processRoute: '待处理', processState: '待处理', feedbackUser: '张伟',
  level1: '产品质量', level2: '硬件损坏/无法使用', level3: '无法开机/上电',
  raw: '', ai: '', solution: '待产品经理确认处理方案。', note: '',
}

function loadTemplates(): Template[] {
  try {
    const data = localStorage.getItem('feedback_templates')
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return [{
    id: 'tpl_default',
    name: '默认模板',
    isDefault: true,
    fields: { ...defaultTemplateFields },
  }]
}

function persistTemplates() {
  localStorage.setItem('feedback_templates', JSON.stringify(templates.value))
}

const showTemplateModal = ref(false)
const templates = ref<Template[]>(loadTemplates())
const editingTemplateIdx = ref(0)
const renamingIdx = ref(-1)
const renameInput = ref('')

const defaultTemplate = computed(() => templates.value.find(t => t.isDefault) || templates.value[0])
const currentEditing = computed(() => templates.value[editingTemplateIdx.value])

function openTemplateSettings() {
  showTemplateModal.value = true
  const def = templates.value.findIndex(t => t.isDefault)
  editingTemplateIdx.value = def >= 0 ? def : 0
}
function closeTemplateModal() {
  showTemplateModal.value = false
}

function addNewTemplate() {
  const n = templates.value.length + 1
  templates.value.push({
    id: `tpl_${Date.now()}`,
    name: `模板 ${n}`,
    isDefault: templates.value.length === 0,
    fields: { ...defaultTemplateFields },
  })
  editingTemplateIdx.value = templates.value.length - 1
  persistTemplates()
  showToast(`已新建「模板 ${n}」`, 'success')
}

function deleteCurrentTemplate() {
  if (templates.value.length <= 1) {
    showToast('至少保留一个模板', 'warning')
    return
  }
  const removed = templates.value[editingTemplateIdx.value]
  const name = removed.name
  templates.value.splice(editingTemplateIdx.value, 1)
  if (removed.isDefault && templates.value.length > 0) {
    templates.value[0].isDefault = true
  }
  if (editingTemplateIdx.value >= templates.value.length) {
    editingTemplateIdx.value = templates.value.length - 1
  }
  persistTemplates()
  showToast(`「${name}」已删除`, 'success')
}

function setAsDefault(idx: number) {
  templates.value.forEach((t, i) => { t.isDefault = i === idx })
  persistTemplates()
  showToast(`已将「${templates.value[idx].name}」设为默认导入模板`, 'success')
}

function duplicateTemplate(idx: number) {
  const src = templates.value[idx]
  templates.value.push({
    ...JSON.parse(JSON.stringify(src)),
    id: `tpl_${Date.now()}`,
    name: `${src.name} 副本`,
    isDefault: false,
  })
  editingTemplateIdx.value = templates.value.length - 1
  persistTemplates()
  showToast(`已复制「${src.name}」`, 'success')
}

function startRename(idx: number) {
  renamingIdx.value = idx
  renameInput.value = templates.value[idx].name
}
function confirmRename() {
  if (renamingIdx.value >= 0 && renameInput.value.trim()) {
    templates.value[renamingIdx.value].name = renameInput.value.trim()
    persistTemplates()
  }
  renamingIdx.value = -1
  renameInput.value = ''
}
function cancelRename() {
  renamingIdx.value = -1
  renameInput.value = ''
}

function saveTemplate() {
  persistTemplates()
  showToast('模板已保存', 'success')
}

// ==================== Batch Import Modal ====================
const showImportModal = ref(false)
const importForm = ref({
  file: '',
  mode: '按模板字段导入',
  dedup: '按内容+型号',
})

function batchImport() {
  showImportModal.value = true
}
function closeImportModal() {
  showImportModal.value = false
}
function startImport() {
  showImportModal.value = false
  showToast('批量导入完成，已创建反馈记录', 'success')
}

// ==================== Manual Review Modal ====================
const showReviewModal = ref(false)
const reviewItem = ref<FeedbackItem | null>(null)
const reviewData = ref<Partial<FeedbackItem>>({})

function manualReview(item: FeedbackItem) {
  reviewItem.value = item
  reviewData.value = { ...item }
  showReviewModal.value = true
}
function closeReviewModal() {
  showReviewModal.value = false
  reviewItem.value = null
}
function saveReview() {
  if (reviewItem.value && reviewData.value) {
    const route = reviewData.value.processRoute || reviewItem.value.processRoute
    store.updateItem(reviewItem.value.id, {
      ...reviewData.value,
      createMode: '人工录入',
      processState: route === '待处理' ? '待处理' : '已处理',
      handler: reviewData.value.handler || '陈晨',
    } as Partial<FeedbackItem>)
    showReviewModal.value = false
    showToast(`反馈 ${reviewItem.value.id} 已完成人工复核`, 'success')
    reviewItem.value = null
  }
}

// ==================== Batch Actions ====================
function batchAction(action: string) {
  if (selectedIds.value.size === 0) {
    showToast('请先选择反馈记录', 'warning')
    return
  }
  showToast(`批量操作：已选中 ${selectedIds.value.size} 项执行「${action}」`, 'success')
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-lg font-extrabold text-gray-900">反馈清单</h2>
        <p class="text-xs text-gray-400 mt-0.5">原始反馈数据池与AI分类结果总览，独立于工单处理流程</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-primary" @click="addFeedback"><Plus class="w-3.5 h-3.5 mr-1" /> 新增反馈</button>
        <button class="btn-secondary text-xs" @click="openTemplateSettings">我的模板设置</button>
        <button class="btn-secondary text-xs" @click="batchImport">批量导入</button>
        <div class="relative group">
          <button class="btn-secondary text-xs flex items-center gap-1">批量操作 <ChevronDown class="w-3 h-3" /></button>
          <div class="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 hidden group-hover:block min-w-[120px]">
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50" @click="batchAction('转工单')">转工单</button>
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50" @click="batchAction('转异常')">转异常</button>
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50" @click="batchAction('转需求')">转需求</button>
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50" @click="batchAction('转Q&A')">转Q&A</button>
            <button class="block w-full text-left px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50" @click="batchAction('直接关闭')">直接关闭</button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto" :class="{ 'hidden': detailItem }">
      <!-- Filter & Tabs -->
      <div class="px-6 pt-3 bg-white border-b border-gray-200">
        <!-- Search -->
        <div class="relative mb-2">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="store.searchQuery"
            type="search"
            placeholder="搜索反馈ID、ASIN、型号、原文关键词"
            class="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
          />
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-1 -mb-px">
          <button
            v-for="tab in feedbackTabOptions"
            :key="tab.key"
            class="px-4 py-2 text-xs font-extrabold border-b-2 transition-colors"
            :class="store.activeTab === tab.key ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-700'"
            @click="store.activeTab = tab.key"
          >
            {{ tab.label }}
            <span v-if="tab.key === 'all'" class="ml-1 text-gray-400">({{ tabCounts.all }})</span>
            <span v-else-if="tab.key === 'pending'" class="ml-1 text-gray-400">({{ tabCounts.pending }})</span>
            <span v-else-if="tab.key === 'review'" class="ml-1 text-gray-400">({{ tabCounts.review }})</span>
            <span v-else-if="tab.key === 'done'" class="ml-1 text-gray-400">({{ tabCounts.done }})</span>
          </button>
          <button
            class="ml-auto px-3 py-1.5 text-xs font-bold text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
            :class="{ 'text-blue-600 border-blue-300 bg-blue-50': store.filterVisible }"
            @click="store.filterVisible = !store.filterVisible"
          >
            <Filter class="w-3 h-3 inline mr-1" />
            {{ store.filterVisible ? '收起筛选' : '筛选' }}
          </button>
        </div>

        <!-- Filter Panel -->
        <div v-if="store.filterVisible" class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 py-3 border-t border-gray-100">
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            数据来源
            <select v-model="store.filters.source" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            创建方式
            <select v-model="store.filters.mode" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option value="AI自动创建">AI自动创建</option>
              <option value="人工录入">人工录入</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            品牌
            <input v-model="store.filters.brand" placeholder="输入品牌" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            站点
            <select v-model="store.filters.site" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            设备类型
            <input v-model="store.filters.productType" placeholder="输入设备类型" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            销售型号
            <input v-model="store.filters.model" placeholder="输入销售型号" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            内部型号/料号
            <input v-model="store.filters.internal" placeholder="输入内部型号" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            反馈人
            <input v-model="store.filters.feedbackUser" placeholder="输入反馈人" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            反馈开始时间
            <input type="date" v-model="store.filters.dateFrom" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            反馈结束时间
            <input type="date" v-model="store.filters.dateTo" class="h-7 text-xs border border-gray-200 rounded px-1.5" />
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            状态
            <select v-model="store.filters.processState" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in processStateOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            异常等级
            <select v-model="store.filters.exception" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in exceptionLevels" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            处理去向
            <select v-model="store.filters.processRoute" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in processRouteOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <label class="text-[11px] font-bold text-gray-500 flex flex-col gap-1">
            退换货
            <select v-model="store.filters.returned" class="h-7 text-xs border border-gray-200 rounded px-1.5">
              <option value="">全部</option>
              <option v-for="s in returnOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </label>
          <div class="flex items-end">
            <button class="btn-secondary text-xs h-7" @click="store.resetFilters()">重置筛选</button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-auto">
        <table class="feedback-table">
          <thead>
            <tr>
              <th class="w-12">
                <input type="checkbox" :checked="allSelected" :indeterminate.prop="someSelected" @change="toggleSelectAll()" />
              </th>
              <th>编号</th>
              <th>地区</th>
              <th>数据来源</th>
              <th>设备类型</th>
              <th>品牌</th>
              <th>内部型号/料号</th>
              <th>销售型号</th>
              <th>订单号</th>
              <th>是否退换货</th>
              <th>用户反馈</th>
              <th>AI翻译</th>
              <th>反馈时间</th>
              <th>问题回答/处理方案</th>
              <th>一级职能</th>
              <th>二级问题</th>
              <th>三级问题</th>
              <th>异常级别</th>
              <th>创建方式</th>
              <th>处理去向</th>
              <th>状态</th>
              <th>反馈人</th>
              <th>处理人</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in store.filteredGroups" :key="group.lead.data.id">
              <!-- Merge parent row -->
              <tr v-if="group.members.length > 1" class="merge-parent cursor-pointer" @click="group.expanded = !group.expanded">
                <td><input type="checkbox" :checked="selectedIds.has(group.lead.data.id)" @change="toggleSelect(group.lead.data.id)" @click.stop /></td>
                <td colspan="23">
                  <div class="flex items-center gap-2">
                    <button class="w-5 h-5 flex items-center justify-center border border-blue-200 rounded bg-white text-blue-600 text-xs font-extrabold">
                      {{ group.expanded ? '−' : '+' }}
                    </button>
                    <div>
                      <span class="font-extrabold text-sm text-gray-900">{{ group.lead.data.model }} {{ group.lead.data.level3 }}合并反馈</span>
                      <span class="ml-2 text-xs text-gray-500">
                        {{ group.lead.data.internal }} / {{ group.members.length }}条明细
                      </span>
                    </div>
                    <span class="ml-auto text-xs text-gray-400">{{ getDataSource(group.lead.data) }}</span>
                  </div>
                </td>
                <td>
                  <div class="flex items-center gap-1">
                    <button class="px-2 py-0.5 text-[11px] font-bold text-blue-600 border border-gray-200 rounded hover:bg-blue-50" @click.stop="openDetail(group.lead.data)">详情</button>
                  </div>
                </td>
              </tr>
              <!-- Children -->
              <template v-if="group.expanded || group.members.length === 1">
                <tr
                  v-for="(member, idx) in group.members"
                  :key="member.data.id"
                  :class="group.members.length > 1 ? 'merge-child' : ''"
                >
                  <td><input type="checkbox" :checked="selectedIds.has(member.data.id)" @change="toggleSelect(member.data.id)" /></td>
                  <td>
                    <template v-if="group.members.length > 1">
                      <div class="flex items-center gap-1 pl-5">
                        <span class="text-gray-400 font-extrabold">└</span>
                        <span>
                          <span class="font-extrabold text-gray-900 text-xs">{{ member.data.id }}</span>
                          <span class="block text-[11px] text-gray-400">第 {{ idx + 1 }} 条明细</span>
                        </span>
                      </div>
                    </template>
                    <template v-else>
                      <span class="font-extrabold text-gray-900 text-xs">{{ member.data.id }}</span>
                    </template>
                  </td>
                  <td>{{ getRegion(member.data) }}</td>
                  <td><span class="text-xs font-bold text-gray-600">{{ getDataSource(member.data) }}</span></td>
                  <td>{{ getDeviceType(member.data) }}</td>
                  <td>{{ member.data.brand }}</td>
                  <td>{{ member.data.internal }}</td>
                  <td>{{ member.data.model }}</td>
                  <td>{{ member.data.asin !== '-' ? member.data.asin : 'ORD-' + member.data.id.replace('FB-', '') }}</td>
                  <td>{{ member.data.returned || '-' }}</td>
                  <td class="max-w-[200px] truncate text-xs">{{ member.data.raw }}</td>
                  <td class="max-w-[200px] truncate text-xs">{{ member.data.ai }}</td>
                  <td>{{ member.data.date }}</td>
                  <td class="max-w-[180px] truncate text-xs">{{ getSolution(member.data) }}</td>
                  <td>{{ member.data.level1 }}</td>
                  <td>{{ member.data.level2 }}</td>
                  <td>{{ member.data.level3 }}</td>
                  <td>{{ member.data.exception }}</td>
                  <td>
                    <span :class="member.data.createMode === 'AI自动创建' ? 'badge-ai' : 'badge-manual'">
                      {{ member.data.createMode }}
                    </span>
                  </td>
                  <td>{{ member.data.processRoute }}</td>
                  <td>{{ member.data.processState }}</td>
                  <td>{{ member.data.feedbackUser }}</td>
                  <td>{{ member.data.handler }}</td>
                  <td>
                    <div class="flex items-center gap-1">
                      <button class="px-2 py-0.5 text-[11px] font-bold text-blue-600 border border-gray-200 rounded hover:bg-blue-50" @click="openDetail(member.data)">详情</button>
                      <button v-if="group.members.length > 1 && !['P0', 'P1'].includes(member.data.exception)" class="px-2 py-0.5 text-[11px] font-bold text-gray-500 border border-gray-200 rounded hover:bg-gray-50" @click="unmergeItem(member.data)">移出合并</button>
                      <button v-if="member.data.processState === '待人工复核'" class="px-2 py-0.5 text-[11px] font-bold text-red-600 border border-red-200 rounded bg-red-50 hover:bg-red-100" @click.stop="manualReview(member.data)">人工复核</button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-if="store.filteredGroups.length === 0">
              <td colspan="24" class="text-center py-10 text-gray-400 text-sm font-bold">当前筛选条件下没有反馈记录</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Drawer -->
    <div v-if="detailItem" class="flex-1 overflow-auto bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg">
        <div class="flex items-start justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400 font-bold">反馈详情</span>
            <h2 class="text-xl font-extrabold text-gray-900 mt-0.5">{{ detailItem.id }}</h2>
            <p class="text-xs text-gray-500 mt-1">{{ getDataSource(detailItem) }} / {{ detailItem.brand }} / {{ detailItem.model }}</p>
          </div>
          <button class="btn-secondary text-xs" @click="closeDetail">返回列表</button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Editable fields -->
          <div class="grid grid-cols-3 gap-3">
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">地区</span>
              <select v-model="editData.site" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">设备类型</span>
              <select v-model="editData.productType" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option value="体脂秤">体脂秤</option>
                <option value="筋膜枪">筋膜枪</option>
                <option value="血压计">血压计</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">异常级别</span>
              <select v-model="editData.exception" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option v-for="lvl in exceptionLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">处理去向</span>
              <select v-model="editData.processRoute" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option v-for="r in processRouteOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">状态</span>
              <select v-model="editData.processState" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold">
                <option v-for="s in processStateOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">处理人</span>
              <input v-model="editData.handler" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold" />
            </div>
          </div>

          <!-- Text areas -->
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500 mb-1">用户反馈（客户对话/退货反馈）</span>
            <textarea v-model="editData.raw" rows="3" class="w-full text-xs border border-gray-200 rounded p-2 resize-y font-bold"></textarea>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500 mb-1">用户评价翻译（AI自动翻译）</span>
            <textarea v-model="editData.ai" rows="3" class="w-full text-xs border border-gray-200 rounded p-2 resize-y font-bold"></textarea>
          </div>

          <!-- L1/L2/L3 Classification (editable) -->
          <div class="grid grid-cols-3 gap-3">
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">一级职能划分</span>
              <input v-model="editData.level1" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold" />
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">二级问题场景分类</span>
              <input v-model="editData.level2" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold" />
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">三级具体问题</span>
              <input v-model="editData.level3" class="w-full mt-1 h-8 text-xs border border-gray-200 rounded px-1.5 font-bold" />
            </div>
          </div>

          <!-- Solution -->
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">问题回答/处理方案</span>
            <strong class="block mt-1 text-sm text-gray-900">{{ getSolution(detailItem) }}</strong>
          </div>

          <!-- Return progress -->
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500 mb-1">退换货进度（PMS售后模块）</span>
            <div class="grid grid-cols-4 gap-2">
              <div class="p-2 bg-white border border-gray-100 rounded">
                <b class="block text-xs">售后状态</b>
                <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ detailItem.returned !== '否' ? `${detailItem.returned}处理中` : '未触发退换货' }}</em>
              </div>
              <div class="p-2 bg-white border border-gray-100 rounded">
                <b class="block text-xs">PMS单号</b>
                <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ getExpressNo(detailItem) || '无' }}</em>
              </div>
              <div class="p-2 bg-white border border-gray-100 rounded">
                <b class="block text-xs">当前节点</b>
                <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ detailItem.processState === '已处理' ? '已完成售后闭环' : 'PMS售后模块处理中' }}</em>
              </div>
              <div class="p-2 bg-white border border-gray-100 rounded">
                <b class="block text-xs">更新时间</b>
                <em class="block text-[11px] text-gray-500 not-italic mt-0.5">{{ detailItem.date }}</em>
              </div>
            </div>
          </div>

          <!-- Reply Panel (toggle) -->
          <div v-if="showReplyPanel" class="p-3 border border-blue-200 rounded-lg bg-blue-50">
            <span class="block text-[11px] font-bold text-gray-500 mb-1">直接回复内容</span>
            <textarea v-model="replyContent" rows="3" placeholder="由操作人输入给用户的直接回复内容。" class="w-full text-xs border border-gray-200 rounded p-2 resize-y font-bold"></textarea>
            <button class="btn-primary text-xs mt-2" @click="confirmDirectClose">确认回复并关闭</button>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex-wrap">
          <button class="btn-secondary text-xs" @click="closeDetail">关闭</button>
          <button class="btn-primary text-xs" @click="saveDetail">保存修改</button>
          <button class="btn-warning text-xs" @click="applyRoute(detailItem, '已转工单')">转工单</button>
          <button class="btn-danger text-xs" @click="applyRoute(detailItem, '已转异常')">转异常</button>
          <button class="btn-success text-xs" @click="applyRoute(detailItem, '已转需求')">转需求</button>
          <button class="btn-primary text-xs" @click="toggleReplyPanel">直接回复并关闭</button>
        </div>
      </div>
    </div>

    <!-- ==================== Add Feedback Modal ==================== -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">新增反馈</span>
            <h3 class="text-base font-extrabold text-gray-900">新增反馈</h3>
            <p class="text-[11px] text-gray-400">编号规则：产品线简码-创建时间年月日-流水号。CS：八电极/体脂秤，CM：筋膜枪。</p>
          </div>
          <div class="flex items-center gap-2">
            <!-- 导入我的模板 -->
            <div class="relative">
              <button
                class="text-xs font-extrabold text-red-500 hover:text-red-600 border border-red-300 hover:border-red-400 rounded-md px-3 h-7 flex items-center gap-1 transition-colors"
                @click="showTemplatePicker = !showTemplatePicker"
              >
                <FileDown class="w-3.5 h-3.5" />
                导入我的模板
              </button>
              <!-- Template Picker Dropdown -->
              <div v-if="showTemplatePicker" class="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl w-60 max-h-64 overflow-y-auto">
                <div class="p-2 border-b border-gray-100">
                  <span class="text-[10px] font-extrabold text-gray-400">选择模板导入</span>
                </div>
                <div
                  v-for="tpl in templates"
                  :key="tpl.id"
                  class="px-3 py-2.5 cursor-pointer hover:bg-blue-50 border-b border-gray-50 flex items-center justify-between transition-colors"
                  @click="importTemplateFrom(tpl)"
                >
                  <div>
                    <div class="text-xs font-extrabold text-gray-800">{{ tpl.name }}</div>
                    <div class="text-[10px] text-gray-400 mt-0.5">{{ tpl.fields.brand }} / {{ tpl.fields.model }} / {{ tpl.fields.region }}</div>
                  </div>
                  <span v-if="tpl.isDefault" class="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-extrabold flex-shrink-0">默认</span>
                </div>
                <div v-if="templates.length === 0" class="px-3 py-4 text-center text-[11px] text-gray-400">
                  暂无模板，请先在「我的模板设置」中创建
                </div>
              </div>
            </div>
            <button class="text-gray-400 hover:text-gray-600" @click="closeAddModal"><X class="w-5 h-5" /></button>
          </div>
        </div>

        <div class="p-5 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">编号</span>
              <input v-model="newFeedback.id" readonly class="h-8 text-xs border border-gray-200 rounded-md px-2 font-bold bg-gray-50" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">地区</span>
              <select v-model="newFeedback.region" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option value="海外">海外</option>
                <option value="国内">国内</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">数据来源</span>
              <select v-model="newFeedback.dataSource" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option>海外电商-退货反馈</option>
                <option>海外电商-商品评论</option>
                <option>国内电商-退货反馈</option>
                <option>国内电商-商品评论</option>
                <option>站内信</option>
                <option>客服沟通</option>
                <option>APP反馈</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">设备类型</span>
              <input v-model="newFeedback.deviceType" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">品牌</span>
              <input v-model="newFeedback.brand" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">内部型号/料号</span>
              <input v-model="newFeedback.internal" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">销售型号</span>
              <input v-model="newFeedback.model" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">订单号</span>
              <input v-model="newFeedback.orderNo" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">快递单号（退换货）</span>
              <input v-model="newFeedback.expressNo" placeholder="退换货时填写" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">问题反馈时间</span>
              <input type="date" v-model="newFeedback.feedbackDate" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
          </div>

          <div class="mt-3 space-y-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">用户反馈（客户对话/退货反馈）<span class="text-red-500">*</span></span>
              <textarea v-model="newFeedback.raw" rows="3" placeholder="请输入用户原始反馈内容" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold focus:border-blue-500 outline-none"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">用户评价翻译（AI自动翻译）</span>
              <textarea v-model="newFeedback.ai" rows="3" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold focus:border-blue-500 outline-none"></textarea>
            </label>
          </div>

          <div class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">图片补充</span>
              <input type="file" accept="image/*" multiple class="h-8 text-xs border border-gray-300 rounded-md px-2 py-1.5" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">视频补充</span>
              <input type="file" accept="video/*" multiple class="h-8 text-xs border border-gray-300 rounded-md px-2 py-1.5" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">异常级别</span>
              <select v-model="newFeedback.exception" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option>P2</option>
                <option>P1</option>
                <option>P3</option>
                <option>P0</option>
                <option>待确认</option>
                <option>否</option>
              </select>
            </label>
          </div>

          <div class="mt-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">问题回答/处理方案</span>
              <textarea v-model="newFeedback.solution" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold focus:border-blue-500 outline-none"></textarea>
            </label>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">一级职能划分</span>
              <select v-model="newFeedback.level1" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option>产品质量</option>
                <option>产品体验</option>
                <option>咨询服务</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">二级问题场景分类</span>
              <input v-model="newFeedback.level2" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">三级具体问题</span>
              <input v-model="newFeedback.level3" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeAddModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="submitNewFeedback">创建反馈</button>
        </div>
      </div>
    </div>

    <!-- ==================== Template Settings Modal ==================== -->
    <div v-if="showTemplateModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl mt-6" style="height: 85vh; max-height: 800px;">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
          <div>
            <span class="text-xs text-gray-400">我的模板设置</span>
            <h3 class="text-base font-extrabold text-gray-900">我的模板设置</h3>
            <p class="text-[11px] text-gray-400">支持创建多个模板，自定义命名，设置默认导入模板用于新增反馈时自动预填。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeTemplateModal"><X class="w-5 h-5" /></button>
        </div>

        <!-- Body: Left sidebar + Right panel -->
        <div class="flex h-full" style="height: calc(100% - 110px);">
          <!-- Left sidebar: Template list -->
          <div class="w-56 border-r border-gray-200 flex flex-col flex-shrink-0 bg-gray-50">
            <div class="p-2 flex items-center justify-between border-b border-gray-200">
              <span class="text-[11px] font-extrabold text-gray-500">模板列表（{{ templates.length }}）</span>
              <button class="w-6 h-6 flex items-center justify-center rounded text-blue-600 hover:bg-blue-50 text-sm font-extrabold" title="新建模板" @click="addNewTemplate">+</button>
            </div>
            <div class="flex-1 overflow-y-auto">
              <div
                v-for="(tpl, idx) in templates"
                :key="tpl.id"
                class="px-3 py-2 cursor-pointer border-b border-gray-100 transition-colors"
                :class="editingTemplateIdx === idx ? 'bg-blue-50 border-l-2 border-l-blue-500' : 'hover:bg-gray-100 border-l-2 border-l-transparent'"
                @click="editingTemplateIdx = idx"
              >
                <div class="flex items-center gap-1.5">
                  <!-- Rename mode -->
                  <template v-if="renamingIdx === idx">
                    <input
                      v-model="renameInput"
                      class="flex-1 h-6 text-xs border border-blue-300 rounded px-1.5 font-bold outline-none"
                      @keyup.enter="confirmRename()"
                      @keyup.escape="cancelRename()"
                      @blur="confirmRename()"
                      @click.stop
                    />
                  </template>
                  <template v-else>
                    <span class="text-xs font-extrabold text-gray-800 flex-1 truncate">{{ tpl.name }}</span>
                    <span v-if="tpl.isDefault" class="text-[9px] px-1 py-0.5 rounded bg-green-100 text-green-700 font-extrabold">默认</span>
                  </template>
                </div>
                <!-- Action buttons -->
                <div v-if="renamingIdx !== idx" class="flex items-center gap-1 mt-1" @click.stop>
                  <button class="text-[10px] text-gray-400 hover:text-blue-600 px-1" title="重命名" @click="startRename(idx)">重命名</button>
                  <button v-if="!tpl.isDefault" class="text-[10px] text-gray-400 hover:text-green-600 px-1" title="设为默认" @click="setAsDefault(idx)">默认</button>
                  <button class="text-[10px] text-gray-400 hover:text-purple-600 px-1" title="复制模板" @click="duplicateTemplate(idx)">复制</button>
                  <button class="text-[10px] text-gray-400 hover:text-red-600 px-1" title="删除模板" @click="deleteCurrentTemplate(); $event.stopPropagation()">删除</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right panel: Template editor -->
          <div class="flex-1 flex flex-col min-w-0" v-if="currentEditing">
            <div class="px-5 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
              <span class="text-xs font-extrabold text-gray-700">编辑：{{ currentEditing.name }}</span>
              <span v-if="currentEditing.isDefault" class="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-extrabold">默认导入模板</span>
              <button v-else class="text-[10px] text-blue-600 hover:underline ml-auto" @click="setAsDefault(editingTemplateIdx)">设为默认</button>
            </div>
            <div class="flex-1 overflow-y-auto p-5">
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">地区</span>
                  <select v-model="currentEditing.fields.region" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                    <option>海外</option>
                    <option>国内</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">数据来源</span>
                  <select v-model="currentEditing.fields.dataSource" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                    <option>海外电商-退货反馈</option>
                    <option>海外电商-商品评论</option>
                    <option>国内电商-退货反馈</option>
                    <option>国内电商-商品评论</option>
                    <option>站内信</option>
                    <option>客服沟通</option>
                    <option>APP反馈</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">设备类型</span>
                  <input v-model="currentEditing.fields.deviceType" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">品牌</span>
                  <input v-model="currentEditing.fields.brand" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">内部型号/料号</span>
                  <input v-model="currentEditing.fields.internal" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">销售型号</span>
                  <input v-model="currentEditing.fields.model" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">订单号</span>
                  <input v-model="currentEditing.fields.orderNo" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">快递单号（退换货）</span>
                  <input v-model="currentEditing.fields.expressNo" placeholder="退换货时填写" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">问题反馈时间</span>
                  <input type="date" v-model="currentEditing.fields.feedbackDate" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">图片补充</span>
                  <input v-model="currentEditing.fields.image" placeholder="图片链接或附件说明" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">视频补充</span>
                  <input v-model="currentEditing.fields.video" placeholder="视频链接或附件说明" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">创建方式</span>
                  <select v-model="currentEditing.fields.createMode" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                    <option>人工录入</option>
                    <option>AI自动创建</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">异常级别</span>
                  <select v-model="currentEditing.fields.exception" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                    <option>否</option>
                    <option>待确认</option>
                    <option>P0</option>
                    <option>P1</option>
                    <option>P2</option>
                    <option>P3</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">处理去向</span>
                  <select v-model="currentEditing.fields.processRoute" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                    <option v-for="r in processRouteOptions" :key="r" :value="r">{{ r }}</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">状态</span>
                  <select v-model="currentEditing.fields.processState" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                    <option v-for="s in processStateOptions" :key="s" :value="s">{{ s }}</option>
                  </select>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">反馈人</span>
                  <input v-model="currentEditing.fields.feedbackUser" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">一级职能划分</span>
                  <input v-model="currentEditing.fields.level1" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">二级问题场景分类</span>
                  <input v-model="currentEditing.fields.level2" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">三级具体问题</span>
                  <input v-model="currentEditing.fields.level3" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
                </label>
              </div>

              <div class="mt-3 space-y-3">
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">用户反馈（客户对话/退货反馈）</span>
                  <textarea v-model="currentEditing.fields.raw" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">用户评价翻译（AI自动翻译）</span>
                  <textarea v-model="currentEditing.fields.ai" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">问题回答/处理方案</span>
                  <textarea v-model="currentEditing.fields.solution" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
                </label>
                <label class="flex flex-col gap-1">
                  <span class="text-[11px] font-bold text-gray-600">备注</span>
                  <textarea v-model="currentEditing.fields.note" rows="2" placeholder="可保存固定话术、默认标签、备注字段" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2 px-5 py-2.5 bg-gray-50 rounded-b-xl border-t border-gray-200 flex-shrink-0">
          <button class="btn-primary text-xs h-8 px-4" @click="saveTemplate">保存全部模板</button>
          <button class="btn-secondary text-xs h-8 px-4" @click="closeTemplateModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- ==================== Batch Import Modal ==================== -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-xl">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">批量导入</span>
            <h3 class="text-base font-extrabold text-gray-900">批量导入</h3>
            <p class="text-[11px] text-gray-400">上传 Excel 表格后批量创建反馈单。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeImportModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 space-y-3">
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">上传Excel表格</span>
            <input type="file" accept=".xlsx,.xls" class="h-9 text-xs border border-gray-300 rounded-md px-2 py-1.5" />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">导入模式</span>
              <select v-model="importForm.mode" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>按模板字段导入</option>
                <option>自动匹配表头</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">去重方式</span>
              <select v-model="importForm.dedup" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>按内容+型号</option>
                <option>按反馈ID</option>
              </select>
            </label>
          </div>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">说明</span>
            <textarea rows="3" placeholder="请上传 .xlsx 或 .xls 文件。系统会读取表格字段并批量创建反馈，需人工确认的记录会进入复核队列。" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
          </label>
        </div>

        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeImportModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="startImport">开始导入</button>
        </div>
      </div>
    </div>

    <!-- ==================== Manual Review Modal ==================== -->
    <div v-if="showReviewModal && reviewItem" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">人工复核</span>
            <h3 class="text-base font-extrabold text-gray-900">{{ reviewItem.id }}</h3>
            <p class="text-[11px] text-gray-400">人工修改 AI 录入内容、翻译、分类和异常级别。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeReviewModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">数据来源</span>
              <select v-model="reviewData.source" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>{{ getDataSource(reviewItem) }}</option>
                <option>海外电商-退货反馈</option>
                <option>海外电商-商品评论</option>
                <option>客服沟通</option>
                <option>APP反馈</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">品牌</span>
              <input v-model="reviewData.brand" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">内部型号/料号</span>
              <input v-model="reviewData.internal" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">销售型号</span>
              <input v-model="reviewData.model" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">异常级别</span>
              <select v-model="reviewData.exception" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option v-for="lvl in exceptionLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">处理去向</span>
              <select v-model="reviewData.processRoute" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option v-for="r in processRouteOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">处理人</span>
              <input v-model="reviewData.handler" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">一级职能划分</span>
              <select v-model="reviewData.level1" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>产品质量</option>
                <option>产品体验</option>
                <option>咨询服务</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">二级问题场景分类</span>
              <input v-model="reviewData.level2" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">三级具体问题</span>
              <input v-model="reviewData.level3" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
          </div>

          <div class="mt-3 space-y-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">用户反馈（客户对话/退货反馈）</span>
              <textarea v-model="reviewData.raw" rows="3" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">用户评价翻译（AI自动翻译）</span>
              <textarea v-model="reviewData.ai" rows="3" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeReviewModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="saveReview">保存复核</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-orange-500' : 'bg-blue-600'">
      {{ toast.msg }}
    </div>
  </div>
</template>
