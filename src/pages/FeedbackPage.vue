<script setup lang="ts">
import { ref } from 'vue'
import { Plus, ChevronDown, X } from 'lucide-vue-next'
import { useFeedbackStore } from '@/stores'
import type { FeedbackItem } from '@/types'
import FeedbackFilter from './feedback/FeedbackFilter.vue'
import FeedbackTable from './feedback/FeedbackTable.vue'
import FeedbackDetailDrawer from './feedback/FeedbackDetailDrawer.vue'
import FeedbackMergeModal from './feedback/FeedbackMergeModal.vue'
import FeedbackAddModal from './feedback/FeedbackAddModal.vue'
import FeedbackTemplateModal from './feedback/FeedbackTemplateModal.vue'
import FeedbackReviewModal from './feedback/FeedbackReviewModal.vue'

const store = useFeedbackStore()
const detailItem = ref<FeedbackItem | null>(null)
const selectedIds = ref<Set<string>>(new Set())
const showAddModal = ref(false)
const showTemplateModal = ref(false)
const showMergeModal = ref(false)
const mergeGroupId = ref<string | null>(null)
const showImportModal = ref(false)
const showReviewModal = ref(false)
const reviewItem = ref<FeedbackItem | null>(null)
const reviewData = ref<Partial<FeedbackItem>>({})
const importForm = ref({ file: '', mode: '按模板字段导入', dedup: '按内容+型号' })

// Toast
const toast = ref<{ msg: string; type: 'info' | 'success' | 'warning' } | null>(null)
function showToast(msg: string, type: 'info' | 'success' | 'warning' = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

// Select
function handleToggleSelect(id: string) {
  if (selectedIds.value.has(id)) { selectedIds.value.delete(id) } else { selectedIds.value.add(id) }
}
function handleToggleSelectAll() {
  const items = store.filteredItems
  const allSel = items.length > 0 && items.every(i => selectedIds.value.has(i.id))
  items.forEach(i => allSel ? selectedIds.value.delete(i.id) : selectedIds.value.add(i.id))
}

// Detail drawer
function handleOpenDetail(item: FeedbackItem) { detailItem.value = item }
function handleCloseDetail() { detailItem.value = null }
function handleSaveDetail(id: string, data: Partial<FeedbackItem>) { store.updateItem(id, data); handleCloseDetail() }
function handleApplyRoute(item: FeedbackItem, route: string) {
  store.updateItem(item.id, { processRoute: route, processState: route === '待处理' ? '待处理' : '已处理', handler: route === '已转工单' ? '系统' : '陈晨' })
  if (detailItem.value?.id === item.id) handleCloseDetail()
}

// Table actions
function handleUnmergeItem(item: FeedbackItem) { store.updateItem(item.id, { mergeGroup: '' }) }
function handleManualReview(item: FeedbackItem) { reviewItem.value = item; reviewData.value = { ...item }; showReviewModal.value = true }
function handleToggleGroupExpand(group: any) { group.expanded = !group.expanded }
function batchAction(action: string) {
  if (selectedIds.value.size === 0) { showToast('请先选择反馈记录', 'warning'); return }
  showToast(`批量操作：已选中 ${selectedIds.value.size} 项执行「${action}」`, 'success')
}

// Add modal
function addFeedback() { showAddModal.value = true }
function handleAddToast(msg: string, type: string) { showToast(msg, type as any) }
function handleAddSubmit(item: FeedbackItem) { store.addItem(item); showAddModal.value = false; showToast(`反馈 ${item.id} 已创建成功`, 'success') }

// Template modal
function openTemplateSettings() { showTemplateModal.value = true }
function handleTemplateToast(msg: string, type: string) { showToast(msg, type as any) }

// Review modal
function handleReviewSave(id: string, data: Partial<FeedbackItem>) {
  store.updateItem(id, data); showReviewModal.value = false; showToast(`反馈 ${id} 已完成人工复核`, 'success'); reviewItem.value = null
}
function handleReviewClose() { showReviewModal.value = false; reviewItem.value = null }

// Import modal
function batchImport() { showImportModal.value = true }
function closeImportModal() { showImportModal.value = false }
function startImport() { showImportModal.value = false; showToast('批量导入完成，已创建反馈记录', 'success') }
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
      <FeedbackFilter
        :search-query="store.searchQuery"
        :active-tab="store.activeTab"
        :filter-visible="store.filterVisible"
        :filters="store.filters"
        :tab-counts="store.tabCounts"
        @update:search-query="store.searchQuery = $event"
        @update:active-tab="store.activeTab = $event"
        @update:filter-visible="store.filterVisible = $event"
        @update:filters="Object.assign(store.filters, $event)"
        @reset-filters="store.resetFilters()"
      />
      <FeedbackTable
        :filtered-groups="store.filteredGroups"
        :selected-ids="selectedIds"
        @toggle-select="handleToggleSelect"
        @toggle-select-all="handleToggleSelectAll"
        @open-detail="handleOpenDetail"
        @unmerge-item="handleUnmergeItem"
        @manual-review="handleManualReview"
        @toggle-group-expand="handleToggleGroupExpand"
      />
    </div>

    <FeedbackDetailDrawer :item="detailItem" @close="handleCloseDetail" @save="handleSaveDetail" @apply-route="handleApplyRoute" />
    <FeedbackMergeModal :group-id="mergeGroupId" :visible="showMergeModal" @close="showMergeModal=false;mergeGroupId=null" />
    <FeedbackAddModal :visible="showAddModal" @close="showAddModal=false" @submit="handleAddSubmit" @toast="handleAddToast" />
    <FeedbackTemplateModal :visible="showTemplateModal" @close="showTemplateModal=false" @toast="handleTemplateToast" />
    <FeedbackReviewModal :visible="showReviewModal" :item="reviewItem" :data="reviewData" @close="handleReviewClose" @save="handleReviewSave" />

    <!-- ==================== Batch Import Modal ==================== -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-xl">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div><span class="text-xs text-gray-400">批量导入</span><h3 class="text-base font-extrabold text-gray-900">批量导入</h3><p class="text-[11px] text-gray-400">上传 Excel 表格后批量创建反馈单。</p></div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeImportModal"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-5 space-y-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">上传Excel表格</span><input type="file" accept=".xlsx,.xls" class="h-9 text-xs border border-gray-300 rounded-md px-2 py-1.5" /></label>
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">导入模式</span><select v-model="importForm.mode" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>按模板字段导入</option><option>自动匹配表头</option></select></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">去重方式</span><select v-model="importForm.dedup" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>按内容+型号</option><option>按反馈ID</option></select></label>
          </div>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">说明</span><textarea rows="3" placeholder="请上传 .xlsx 或 .xls 文件。系统会读取表格字段并批量创建反馈，需人工确认的记录会进入复核队列。" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
        </div>
        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeImportModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="startImport">开始导入</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type==='success'?'bg-green-600':toast.type==='warning'?'bg-orange-500':'bg-blue-600'">
      {{ toast.msg }}
    </div>
  </div>
</template>
