<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900">紧急异常处理</h2>
        <p class="text-sm text-gray-500 mt-1">P0/P1 紧急异常事项跟踪与闭环处理，P2/P3 仅纳入统计观察。</p>
      </div>
      <button class="btn-primary flex items-center gap-1" @click="handleOpenCreateModal">
        <Plus class="w-4 h-4" /> 新建异常
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div class="bg-white border rounded-lg p-4" style="border-left: 3px solid #ef4444;">
        <div class="flex items-center gap-2 mb-1">
          <span class="level-p0">P0</span>
          <span class="text-xs font-bold text-gray-500">异常</span>
        </div>
        <strong class="text-2xl font-extrabold text-gray-900">{{ stats.p0 }}</strong>
      </div>
      <div class="bg-white border rounded-lg p-4" style="border-left: 3px solid #f97316;">
        <div class="flex items-center gap-2 mb-1">
          <span class="level-p1">P1</span>
          <span class="text-xs font-bold text-gray-500">异常</span>
        </div>
        <strong class="text-2xl font-extrabold text-gray-900">{{ stats.p1 }}</strong>
      </div>
      <div class="bg-white border rounded-lg p-4" style="border-left: 3px solid #ef4444;">
        <div class="flex items-center gap-2 mb-1">
          <AlertTriangle class="w-4 h-4 text-red-500" />
          <span class="text-xs font-bold text-gray-500">超时</span>
        </div>
        <strong class="text-2xl font-extrabold text-gray-900">{{ stats.overdue }}</strong>
      </div>
      <div class="bg-white border rounded-lg p-4" style="border-left: 3px solid #2563eb;">
        <div class="flex items-center gap-2 mb-1">
          <AlertTriangle class="w-4 h-4 text-blue-500" />
          <span class="text-xs font-bold text-gray-500">总异常</span>
        </div>
        <strong class="text-2xl font-extrabold text-gray-900">{{ stats.total }}</strong>
      </div>
    </div>

    <!-- Filter Panel -->
    <EmergencyFilter
      :filters="filters"
      :region-options="regionOptions"
      :site-options="siteOptions"
      :product-line-options="productLineOptions"
      :dimension-options="dimensionOptions"
      :source-options="sourceOptions"
      @update:filters="handleFilterChange"
      @reset-filters="handleResetFilters"
    />

    <!-- Card List -->
    <EmergencyTable
      :exceptions="filteredExceptions"
      :step-labels="emergencyStepLabels"
      @open-detail="handleOpenDetail"
    />

    <!-- Detail Modal -->
    <EmergencyDetailDrawer
      :detail-item="detailItem"
      :edit-fields="editFields"
      :show-detail-modal="showDetailModal"
      :step-labels="emergencyStepLabels"
      @close-detail-modal="handleCloseDetailModal"
      @save-emergency="handleSaveEmergency"
      @close-archive="handleCloseArchive"
      @update:edit-fields="handleEditFieldChange"
    />

    <!-- Create Emergency Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">紧急异常</span>
            <h3 class="text-base font-extrabold text-gray-900">新建异常</h3>
            <p class="text-[11px] text-gray-400">录入 P0/P1 紧急异常事项。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="handleCloseCreateModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">异常ID</span>
              <input v-model="newEmergency.id" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold bg-gray-50" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">P级</span>
              <select v-model="newEmergency.level" @change="handleSyncId" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>P0</option>
                <option>P1</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">地区</span>
              <select v-model="newEmergency.region" @change="handleSyncRegionOwner" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>国内</option>
                <option>海外</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">处理人</span>
              <input v-model="newEmergency.owner" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">站点</span>
              <select v-model="newEmergency.site" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>京东</option><option>天猫</option><option>抖音</option><option>Amazon</option><option>Walmart</option><option>独立站</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">产品线</span>
              <select v-model="newEmergency.productLine" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>八电极秤</option><option>体脂秤</option><option>筋膜枪</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">内部型号</span>
              <input v-model="newEmergency.internal" placeholder="填写内部型号/料号" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">触发来源</span>
              <input v-model="newEmergency.source" placeholder="关联反馈/工单/投诉来源" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" />
            </label>
          </div>

          <div class="mt-3 space-y-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">影响范围</span>
              <textarea v-model="newEmergency.impact" rows="2" placeholder="填写受影响批次、数量、站点、用户范围" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">异常问题</span>
              <textarea v-model="newEmergency.issue" rows="3" placeholder="描述异常情况、风险和当前表现" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="handleCloseCreateModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="handleCreateEmergency">保存</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white bg-green-600">
      {{ toast }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlertTriangle, Plus, X } from 'lucide-vue-next'
import { useEmergencyStore } from '@/stores'
import { emergencyStepLabels, siteOptions } from '@/api/mock-data'
import type { EmergencyException } from '@/types'
import EmergencyFilter from './EmergencyFilter.vue'
import EmergencyTable from './EmergencyTable.vue'
import EmergencyDetailDrawer from './EmergencyDetailDrawer.vue'

const store = useEmergencyStore()

const filters = ref({
  level: '', region: '', site: '', productLine: '',
  creator: '', dimension: '', source: '', deadline: '', search: '',
})

const regionOptions = ['海外', '国内']
const dimensionOptions = ['平台合规', '客户伤害', '产品质量', '产品体验']
const sourceOptions = ['投诉/舆情', '退货原因', '商品评论', '客服沟通']
const productLineOptions = ['八电极秤', '体脂秤', '筋膜枪', '血压计']

// Stats
const stats = computed(() => {
  const all = store.exceptions
  return {
    p0: all.filter(e => e.level === 'P0').length,
    p1: all.filter(e => e.level === 'P1').length,
    overdue: all.filter(e => e.overdue).length,
    total: all.length,
  }
})

// Filtered
const filteredExceptions = computed(() => {
  let result = store.exceptions
  const f = filters.value
  if (f.level) result = result.filter(e => e.level === f.level)
  if (f.region) result = result.filter(e => e.region === f.region)
  if (f.site) result = result.filter(e => e.site === f.site)
  if (f.productLine) result = result.filter(e => e.productLine === f.productLine)
  if (f.creator) result = result.filter(e => e.creator.includes(f.creator))
  if (f.dimension) result = result.filter(e => e.dimension === f.dimension)
  if (f.source) result = result.filter(e => e.source === f.source)
  if (f.deadline) result = result.filter(e => e.deadline.includes(f.deadline))
  if (f.search) {
    const q = f.search.toLowerCase()
    result = result.filter(e =>
      e.id.toLowerCase().includes(q) || e.issue.toLowerCase().includes(q) ||
      e.internal.toLowerCase().includes(q) || e.owner.toLowerCase().includes(q)
    )
  }
  return result
})

// Toast
const toast = ref<string | null>(null)
function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 2500)
}

// Detail modal
const showDetailModal = ref(false)
const detailItem = ref<EmergencyException | null>(null)
const editFields = ref({
  issue: '', impactScope: '', tempPlan: '',
  rootCause: '', fixPlan: '', verifyResult: '',
})

function handleOpenDetail(ex: EmergencyException) {
  detailItem.value = ex
  editFields.value = {
    issue: ex.issue, impactScope: ex.impactScope || '',
    tempPlan: ex.tempPlan, rootCause: ex.rootCause,
    fixPlan: ex.fixPlan, verifyResult: ex.verifyResult,
  }
  showDetailModal.value = true
}

function handleCloseDetailModal() {
  showDetailModal.value = false
  detailItem.value = null
}

function handleEditFieldChange(key: string, value: string) {
  editFields.value = { ...editFields.value, [key]: value }
}

function handleSaveEmergency() {
  if (!detailItem.value) return
  const f = editFields.value
  store.updateException(detailItem.value.id, {
    issue: f.issue, impactScope: f.impactScope,
    tempPlan: f.tempPlan, rootCause: f.rootCause,
    fixPlan: f.fixPlan, verifyResult: f.verifyResult,
    step: f.verifyResult && f.verifyResult !== '待验证' ? 4
      : f.fixPlan && f.fixPlan !== '待整改措施' ? 3
      : f.rootCause && f.rootCause !== '待根因分析' ? 2
      : f.tempPlan ? 1 : detailItem.value.step,
    status: f.tempPlan ? '临时方案输出' : detailItem.value.status,
  })
  handleCloseDetailModal()
  showToast(`${detailItem.value.id} 流程已保存`)
}

function handleCloseArchive() {
  if (!detailItem.value) return
  store.updateException(detailItem.value.id, {
    step: 5, status: '关闭归档',
    verifyResult: detailItem.value.verifyResult || '验证完成',
  })
  handleCloseDetailModal()
  showToast(`${detailItem.value.id} 已关闭归档`)
}

// Filter handlers
function handleFilterChange(key: string, value: string) {
  filters.value = { ...filters.value, [key]: value }
}

function handleResetFilters() {
  filters.value = {
    level: '', region: '', site: '', productLine: '',
    creator: '', dimension: '', source: '', deadline: '', search: '',
  }
}

// Create modal
const showCreateModal = ref(false)
const newEmergency = ref({
  id: '', level: 'P0', region: '国内', owner: '刘海州',
  site: '京东', productLine: '八电极秤', internal: '', source: '', impact: '', issue: '',
})

function handleOpenCreateModal() {
  const now = new Date()
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  newEmergency.value = {
    id: `P0-${dateCode}-0003`, level: 'P0', region: '国内',
    owner: '刘海州', site: '京东', productLine: '八电极秤',
    internal: '', source: '', impact: '', issue: '',
  }
  showCreateModal.value = true
}

function handleCloseCreateModal() {
  showCreateModal.value = false
}

function handleSyncRegionOwner() {
  if (newEmergency.value.region === '海外') {
    newEmergency.value.owner = '陈总'
    newEmergency.value.site = 'Amazon'
  } else {
    newEmergency.value.owner = '刘海州'
    newEmergency.value.site = '京东'
  }
}

function handleSyncId() {
  const now = new Date()
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  newEmergency.value.id = `${newEmergency.value.level}-${dateCode}-0003`
}

function handleCreateEmergency() {
  const v = newEmergency.value
  const item: EmergencyException = {
    id: v.id, level: v.level, region: v.region, site: v.site,
    productLine: v.productLine, internal: v.internal || '待补充',
    dimension: v.level === 'P0' ? '客户伤害' : '平台合规',
    source: v.source || '手动录入', deadline: '剩余 2h',
    reminderLimit: '2h', reminderDeadline: '待确认',
    overdue: false, owner: v.owner,
    team: v.region === '海外' ? '海外运营+产品经理' : '售后负责人+质量负责人',
    status: '待临时方案', issue: v.issue || '待补充异常问题',
    impactScope: v.impact || '待补充影响范围',
    action: '待补充处置方案', feedback: v.source || '手动录入',
    tempPlan: '', rootCause: '待根因分析',
    fixPlan: '待整改措施', verifyResult: '待验证',
    step: 0, creator: '管理员',
  }
  store.exceptions.unshift(item)
  handleCloseCreateModal()
  showToast(`异常 ${item.id} 已创建`)
}
</script>
