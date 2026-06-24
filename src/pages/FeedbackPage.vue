<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Filter, Plus, ChevronDown, X } from 'lucide-vue-next'
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
    handler: route === '已转工单' ? '系统' : item.handler,
  })
  if (detailItem.value?.id === item.id) closeDetail()
}

function unmergeItem(item: FeedbackItem) {
  store.updateItem(item.id, { mergeGroup: '' })
}

// Toast notification
const toast = ref<{ msg: string; type: 'info' | 'success' | 'warning' } | null>(null)
function showToast(msg: string, type: 'info' | 'success' | 'warning' = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

// Add Feedback Modal
const showAddModal = ref(false)
const newFeedback = ref({
  site: 'Amazon.com (US)',
  source: '商品评论',
  brand: '云康宝',
  productType: '体脂秤' as string,
  model: 'CS20A',
  internal: '',
  asin: '',
  raw: '',
  createMode: '人工录入' as const,
  feedbackUser: '张伟',
  exception: '无' as string,
  sentiment: '中性' as string,
})

function openAddModal() {
  showAddModal.value = true
  newFeedback.value = {
    site: 'Amazon.com (US)',
    source: '商品评论',
    brand: '云康宝',
    productType: '体脂秤',
    model: 'CS20A',
    internal: '',
    asin: '',
    raw: '',
    createMode: '人工录入',
    feedbackUser: '张伟',
    exception: '无' as string,
    sentiment: '中性' as string,
  }
}

function closeAddModal() {
  showAddModal.value = false
}

function submitNewFeedback() {
  if (!newFeedback.value.raw.trim()) {
    showToast('请填写用户反馈内容', 'warning')
    return
  }
  const now = new Date()
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const id = `FB-${dateStr}-${String(store.items.length + 1).padStart(4, '0')}`
  const item: FeedbackItem = {
    id,
    site: newFeedback.value.site,
    source: newFeedback.value.source,
    brand: newFeedback.value.brand,
    productType: newFeedback.value.productType,
    model: newFeedback.value.model,
    internal: newFeedback.value.internal || `${newFeedback.value.model}-V${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`,
    asin: newFeedback.value.asin || '-',
    raw: newFeedback.value.raw,
    ai: newFeedback.value.source === '商品评论' || newFeedback.value.source === '退货原因' ? '' : newFeedback.value.raw,
    date: now.toLocaleDateString('zh-CN'),
    processRoute: '待处理',
    processState: '待处理',
    level1: '待分类',
    level2: '待分类',
    level3: '待分类',
    exception: newFeedback.value.exception,
    createMode: newFeedback.value.createMode,
    returned: '否',
    feedbackUser: newFeedback.value.feedbackUser,
    handler: '',
    mergeGroup: '',
    sentiment: newFeedback.value.source === '退货原因' ? '差评' : '中性',
  }
  store.addItem(item)
  closeAddModal()
  showToast(`反馈 ${id} 已创建成功`, 'success')
}

function addFeedback() {
  openAddModal()
}

function openTemplateSettings() {
  showToast('模板设置：跳转至系统配置页面', 'info')
}

function batchImport() {
  showToast('批量导入：请选择 CSV/Excel 文件', 'info')
}

function batchAction(action: string) {
  showToast(`批量操作：已选中项执行「${action}」`, 'success')
}

function manualReview(item: FeedbackItem) {
  store.updateItem(item.id, { processState: '已处理', processRoute: '已转Q&A' })
  showToast(`反馈 ${item.id} 已完成人工复核`, 'success')
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
              <th>快递单号</th>
              <th>用户反馈</th>
              <th>AI翻译</th>
              <th>图片补充</th>
              <th>视频补充</th>
              <th>反馈时间</th>
              <th>处理方案</th>
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
                <td colspan="25">
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
                  <td>{{ getExpressNo(member.data) }}</td>
                  <td class="max-w-[200px] truncate text-xs">{{ member.data.raw }}</td>
                  <td class="max-w-[200px] truncate text-xs">{{ member.data.ai }}</td>
                  <td>-</td>
                  <td>-</td>
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
              <td colspan="26" class="text-center py-10 text-gray-400 text-sm font-bold">当前筛选条件下没有反馈记录</td>
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
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button class="btn-secondary text-xs" @click="closeDetail">关闭</button>
          <button class="btn-primary text-xs" @click="saveDetail">保存修改</button>
          <button class="btn-warning text-xs" @click="applyRoute(detailItem, '已转工单')">转工单</button>
          <button class="btn-danger text-xs" @click="applyRoute(detailItem, '已转异常')">转异常</button>
          <button class="btn-success text-xs" @click="applyRoute(detailItem, '已转需求')">转需求</button>
        </div>
      </div>
    </div>

    <!-- Add Feedback Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <h3 class="text-base font-extrabold text-gray-900">新增反馈</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="closeAddModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 space-y-3">
          <p class="text-xs text-gray-400">请填写反馈信息，带 <span class="text-red-500">*</span> 为必填项</p>

          <!-- Row 1: Source & Site -->
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">数据来源 <span class="text-red-500">*</span></span>
              <select v-model="newFeedback.source" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option value="商品评论">商品评论</option>
                <option value="退货原因">退货原因</option>
                <option value="站内信">站内信</option>
                <option value="客服沟通">客服沟通</option>
                <option value="APP反馈">APP反馈</option>
                <option value="社媒">社媒</option>
                <option value="Vine">Vine</option>
                <option value="天使用户">天使用户</option>
                <option value="投诉/警告">投诉/警告</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">站点 <span class="text-red-500">*</span></span>
              <select v-model="newFeedback.site" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </label>
          </div>

          <!-- Row 2: Brand & Product Type -->
          <div class="grid grid-cols-3 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">品牌</span>
              <input v-model="newFeedback.brand" placeholder="如：云康宝" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">设备类型</span>
              <select v-model="newFeedback.productType" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option value="体脂秤">体脂秤</option>
                <option value="人体秤">人体秤</option>
                <option value="八电极秤">八电极秤</option>
                <option value="筋膜枪">筋膜枪</option>
                <option value="血压计">血压计</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">销售型号</span>
              <input v-model="newFeedback.model" placeholder="如：CS20A" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
          </div>

          <!-- Row 3: Internal Model, ASIN, Exception Level -->
          <div class="grid grid-cols-3 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">内部型号/料号</span>
              <input v-model="newFeedback.internal" placeholder="自动生成或手动填写" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">ASIN / 订单号</span>
              <input v-model="newFeedback.asin" placeholder="选填" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">异常级别</span>
              <select v-model="newFeedback.exception" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option v-for="lvl in exceptionLevels" :key="lvl" :value="lvl">{{ lvl }}</option>
              </select>
            </label>
          </div>

          <!-- Row 4: Raw Feedback (required) -->
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">用户反馈内容 <span class="text-red-500">*</span></span>
            <textarea
              v-model="newFeedback.raw"
              rows="4"
              placeholder="请输入用户原始反馈内容（支持中英文）"
              class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold focus:border-blue-500 outline-none"
            ></textarea>
          </label>

          <!-- Row 5: Create Mode & Feedback User -->
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">创建方式</span>
              <select v-model="newFeedback.createMode" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none">
                <option value="人工录入">人工录入</option>
                <option value="AI自动创建">AI自动创建</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">反馈人</span>
              <input v-model="newFeedback.feedbackUser" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold focus:border-blue-500 outline-none" />
            </label>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeAddModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="submitNewFeedback">提交反馈</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-orange-500' : 'bg-blue-600'">
      {{ toast.msg }}
    </div>
  </div>
</template>
