<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlertTriangle, Clock, Search, ChevronRight, X, Plus } from 'lucide-vue-next'
import { useEmergencyStore } from '@/stores'
import { emergencyStepLabels, siteOptions } from '@/api/mock-data'
import type { EmergencyException } from '@/types'

const store = useEmergencyStore()

const filters = ref({
  level: '',
  region: '',
  site: '',
  productLine: '',
  creator: '',
  dimension: '',
  source: '',
  deadline: '',
  search: '',
})

const regionOptions = ['海外', '国内']
const dimensionOptions = ['平台合规', '客户伤害', '产品质量', '产品体验']
const sourceOptions = ['投诉/舆情', '退货原因', '商品评论', '客服沟通']
const productLineOptions = ['八电极秤', '体脂秤', '筋膜枪', '血压计']

const stats = computed(() => {
  const all = store.exceptions
  return {
    p0: all.filter(e => e.level === 'P0').length,
    p1: all.filter(e => e.level === 'P1').length,
    overdue: all.filter(e => e.overdue).length,
    total: all.length,
  }
})

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
      e.id.toLowerCase().includes(q) ||
      e.issue.toLowerCase().includes(q) ||
      e.internal.toLowerCase().includes(q) ||
      e.owner.toLowerCase().includes(q)
    )
  }
  return result
})

function resetFilters() {
  filters.value = {
    level: '', region: '', site: '', productLine: '',
    creator: '', dimension: '', source: '', deadline: '', search: '',
  }
}

function levelClass(level: string): string {
  if (level === 'P0') return 'level-p0'
  if (level === 'P1') return 'level-p1'
  return 'bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-black'
}

// Toast
const toast = ref<string | null>(null)
function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 2500)
}

// ==================== Emergency Detail Modal ====================
const showDetailModal = ref(false)
const detailItem = ref<EmergencyException | null>(null)
const editFields = ref({
  issue: '',
  impactScope: '',
  tempPlan: '',
  rootCause: '',
  fixPlan: '',
  verifyResult: '',
})

function openDetail(ex: EmergencyException) {
  detailItem.value = ex
  editFields.value = {
    issue: ex.issue,
    impactScope: ex.impactScope || '',
    tempPlan: ex.tempPlan,
    rootCause: ex.rootCause,
    fixPlan: ex.fixPlan,
    verifyResult: ex.verifyResult,
  }
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
  detailItem.value = null
}

function saveEmergency() {
  if (!detailItem.value) return
  const f = editFields.value
  store.updateException(detailItem.value.id, {
    issue: f.issue,
    impactScope: f.impactScope,
    tempPlan: f.tempPlan,
    rootCause: f.rootCause,
    fixPlan: f.fixPlan,
    verifyResult: f.verifyResult,
    step: f.verifyResult && f.verifyResult !== '待验证' ? 4
      : f.fixPlan && f.fixPlan !== '待整改措施' ? 3
      : f.rootCause && f.rootCause !== '待根因分析' ? 2
      : f.tempPlan ? 1 : detailItem.value.step,
    status: f.tempPlan ? '临时方案输出' : detailItem.value.status,
  })
  closeDetailModal()
  showToast(`${detailItem.value.id} 流程已保存`)
}

function closeArchive() {
  if (!detailItem.value) return
  store.updateException(detailItem.value.id, {
    step: 5,
    status: '关闭归档',
    verifyResult: detailItem.value.verifyResult || '验证完成',
  })
  closeDetailModal()
  showToast(`${detailItem.value.id} 已关闭归档`)
}

// ==================== Create Emergency Modal ====================
const showCreateModal = ref(false)
const newEmergency = ref({
  id: '',
  level: 'P0',
  region: '国内',
  owner: '刘海州',
  site: '京东',
  productLine: '八电极秤',
  internal: '',
  source: '',
  impact: '',
  issue: '',
})

function openCreateModal() {
  const now = new Date()
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  newEmergency.value = {
    id: `P0-${dateCode}-0003`,
    level: 'P0',
    region: '国内',
    owner: '刘海州',
    site: '京东',
    productLine: '八电极秤',
    internal: '',
    source: '',
    impact: '',
    issue: '',
  }
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

function syncRegionOwner() {
  if (newEmergency.value.region === '海外') {
    newEmergency.value.owner = '陈总'
    newEmergency.value.site = 'Amazon'
  } else {
    newEmergency.value.owner = '刘海州'
    newEmergency.value.site = '京东'
  }
}

function syncId() {
  const now = new Date()
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  newEmergency.value.id = `${newEmergency.value.level}-${dateCode}-0003`
}

function createEmergency() {
  const v = newEmergency.value
  const item: EmergencyException = {
    id: v.id,
    level: v.level,
    region: v.region,
    site: v.site,
    productLine: v.productLine,
    internal: v.internal || '待补充',
    dimension: v.level === 'P0' ? '客户伤害' : '平台合规',
    source: v.source || '手动录入',
    deadline: '剩余 2h',
    reminderLimit: '2h',
    reminderDeadline: '待确认',
    overdue: false,
    owner: v.owner,
    team: v.region === '海外' ? '海外运营+产品经理' : '售后负责人+质量负责人',
    status: '待临时方案',
    issue: v.issue || '待补充异常问题',
    impactScope: v.impact || '待补充影响范围',
    action: '待补充处置方案',
    feedback: v.source || '手动录入',
    tempPlan: '',
    rootCause: '待根因分析',
    fixPlan: '待整改措施',
    verifyResult: '待验证',
    step: 0,
    creator: '管理员',
  }
  store.exceptions.unshift(item)
  closeCreateModal()
  showToast(`异常 ${item.id} 已创建`)
}
</script>

<template>
  <div class="p-6 max-w-[1400px] mx-auto">
    <!-- Header -->
    <div class="mb-5 flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-extrabold text-gray-900">紧急异常处理</h2>
        <p class="text-sm text-gray-500 mt-1">P0/P1 紧急异常事项跟踪与闭环处理，P2/P3 仅纳入统计观察。</p>
      </div>
      <button class="btn-primary flex items-center gap-1" @click="openCreateModal">
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
    <div class="bg-white border border-gray-200 rounded-lg mb-5 px-4 py-3">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <select v-model="filters.level" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">级别</option>
          <option value="P0">P0</option>
          <option value="P1">P1</option>
          <option value="P2">P2</option>
          <option value="P3">P3</option>
        </select>
        <select v-model="filters.region" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">区域</option>
          <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
        </select>
        <select v-model="filters.site" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">站点</option>
          <option v-for="s in siteOptions" :key="s" :value="s">{{ s }}</option>
          <option value="Amazon">Amazon</option>
          <option value="京东">京东</option>
        </select>
        <select v-model="filters.productLine" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">产品线</option>
          <option v-for="p in productLineOptions" :key="p" :value="p">{{ p }}</option>
        </select>
        <input
          v-model="filters.creator"
          type="text"
          placeholder="创建人"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
        />
        <select v-model="filters.dimension" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">维度</option>
          <option v-for="d in dimensionOptions" :key="d" :value="d">{{ d }}</option>
        </select>
        <select v-model="filters.source" class="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white outline-none focus:border-blue-500">
          <option value="">来源</option>
          <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
        </select>
        <input
          v-model="filters.deadline"
          type="text"
          placeholder="截止时间"
          class="px-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
        />
        <div class="relative lg:col-span-2">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            v-model="filters.search"
            type="search"
            placeholder="搜索异常ID、问题、内部型号、负责人..."
            class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md outline-none focus:border-blue-500"
          />
        </div>
      </div>
      <div class="mt-3 flex justify-end">
        <button class="btn-secondary text-xs" @click="resetFilters">重置筛选</button>
      </div>
    </div>

    <!-- Card List -->
    <div class="space-y-4">
      <div
        v-for="ex in filteredExceptions"
        :key="ex.id"
        class="bg-white border rounded-lg overflow-hidden transition-shadow hover:shadow-md"
        :class="ex.overdue ? 'border-l-4 border-l-red-500 bg-red-50/30' : 'border-gray-200'"
      >
        <!-- Card Top -->
        <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <span :class="levelClass(ex.level)">{{ ex.level }}</span>
          <span class="text-sm font-extrabold text-gray-900">{{ ex.id }}</span>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
            :class="ex.overdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'"
          >{{ ex.status }}</span>
          <span
            v-if="ex.overdue"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white"
          >
            <Clock class="w-3 h-3" />
            超时
          </span>
          <span class="ml-auto text-xs font-bold text-gray-500">
            <Clock class="w-3 h-3 inline mr-1" />
            {{ ex.deadline }}
          </span>
        </div>

        <!-- Card Body -->
        <div class="px-5 py-4">
          <!-- Title -->
          <h3 class="text-base font-extrabold text-gray-900 mb-3">{{ ex.issue }}</h3>

          <!-- Meta Grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-2 mb-4">
            <div class="text-xs">
              <span class="text-gray-400 font-bold">区域</span>
              <p class="font-bold text-gray-700">{{ ex.region }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">站点</span>
              <p class="font-bold text-gray-700">{{ ex.site }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">产品线</span>
              <p class="font-bold text-gray-700">{{ ex.productLine }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">内部型号</span>
              <p class="font-bold text-gray-700">{{ ex.internal }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">创建人</span>
              <p class="font-bold text-gray-700">{{ ex.creator }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">维度</span>
              <p class="font-bold text-gray-700">{{ ex.dimension }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">来源</span>
              <p class="font-bold text-gray-700">{{ ex.source }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">负责人</span>
              <p class="font-bold text-gray-700">{{ ex.owner }}</p>
            </div>
            <div class="text-xs">
              <span class="text-gray-400 font-bold">团队</span>
              <p class="font-bold text-gray-700">{{ ex.team }}</p>
            </div>
          </div>

          <!-- Impact & Action -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-gray-50 rounded-md px-3 py-2">
              <span class="text-xs font-bold text-gray-400">影响范围</span>
              <p class="text-sm font-bold text-gray-700 mt-0.5">{{ ex.impactScope }}</p>
            </div>
            <div class="bg-gray-50 rounded-md px-3 py-2">
              <span class="text-xs font-bold text-gray-400">处理动作</span>
              <p class="text-sm font-bold text-gray-700 mt-0.5">{{ ex.action }}</p>
            </div>
          </div>

          <!-- Associated Feedback -->
          <div class="mb-4 text-xs">
            <span class="font-bold text-gray-400">关联反馈: </span>
            <span class="font-bold text-blue-600">{{ ex.feedback }}</span>
          </div>

          <!-- 5-Step Process Indicator -->
          <div class="mb-4">
            <div class="flex items-center gap-1 mb-2">
              <div
                v-for="(label, idx) in emergencyStepLabels"
                :key="idx"
                class="flex-1"
              >
                <div
                  class="h-1.5 rounded-full transition-colors"
                  :class="idx < ex.step ? 'bg-green-500' : 'bg-gray-200'"
                ></div>
                <span
                  class="block text-[10px] font-bold mt-1 text-center"
                  :class="idx < ex.step ? 'text-green-600' : 'text-gray-400'"
                >{{ label }}</span>
              </div>
            </div>
          </div>

          <!-- Plan Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div
              class="rounded-md px-3 py-2 border"
              :class="ex.tempPlan ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'"
            >
              <span class="text-xs font-bold text-gray-400">临时方案</span>
              <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.tempPlan || '待填写' }}</p>
            </div>
            <div
              class="rounded-md px-3 py-2 border"
              :class="ex.rootCause && ex.rootCause !== '待根因分析' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'"
            >
              <span class="text-xs font-bold text-gray-400">根因分析</span>
              <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.rootCause || '待填写' }}</p>
            </div>
            <div
              class="rounded-md px-3 py-2 border"
              :class="ex.fixPlan && ex.fixPlan !== '待整改措施' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'"
            >
              <span class="text-xs font-bold text-gray-400">整改措施</span>
              <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.fixPlan || '待填写' }}</p>
            </div>
            <div
              class="rounded-md px-3 py-2 border"
              :class="ex.verifyResult && ex.verifyResult !== '待验证' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'"
            >
              <span class="text-xs font-bold text-gray-400">验证结果</span>
              <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.verifyResult || '待验证' }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 border-t border-gray-100 pt-3">
            <button class="btn-secondary text-xs flex items-center" @click="openDetail(ex)">
              查看详情
              <ChevronRight class="w-3.5 h-3.5 ml-1" />
            </button>
            <button class="btn-primary text-xs" @click="openDetail(ex)">添加处置</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredExceptions.length === 0" class="bg-white border border-gray-200 rounded-lg py-16 text-center">
        <AlertTriangle class="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p class="text-sm font-bold text-gray-400">暂无匹配的紧急异常。</p>
      </div>
    </div>

    <!-- ==================== Emergency Detail Modal ==================== -->
    <div v-if="showDetailModal && detailItem" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">紧急异常详情</span>
            <h3 class="text-base font-extrabold text-gray-900">{{ detailItem.id }}</h3>
            <p class="text-[11px] text-gray-400">{{ detailItem.level }} / {{ detailItem.region }} / {{ detailItem.dimension }}</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeDetailModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          <!-- Step indicator -->
          <div class="flex items-center gap-1">
            <div v-for="(label, idx) in emergencyStepLabels" :key="idx" class="flex-1">
              <div class="h-1.5 rounded-full" :class="idx < detailItem.step ? 'bg-green-500' : 'bg-gray-200'"></div>
              <span class="block text-[10px] font-bold mt-1 text-center" :class="idx < detailItem.step ? 'text-green-600' : 'text-gray-400'">{{ idx + 1 }}. {{ label }}</span>
            </div>
          </div>

          <!-- Time limit reminder -->
          <div class="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
            <Clock class="w-4 h-4 text-orange-500" />
            <span class="text-xs font-bold text-gray-500">时限提醒</span>
            <strong class="text-sm font-extrabold text-gray-900">{{ detailItem.reminderLimit || '2h' }}</strong>
            <span class="text-xs text-gray-500">截止: {{ detailItem.reminderDeadline || '待确认' }}</span>
          </div>

          <!-- Info grid -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">当前处理人</span>
              <strong class="block mt-1 text-sm">{{ detailItem.owner }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">处理团队</span>
              <strong class="block mt-1 text-sm">{{ detailItem.team }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">临时方案倒计时</span>
              <strong class="block mt-1 text-sm" :class="detailItem.overdue ? 'text-red-600' : ''">{{ detailItem.deadline }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">状态</span>
              <strong class="block mt-1 text-sm">{{ detailItem.status }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">反馈来源</span>
              <strong class="block mt-1 text-sm">{{ detailItem.feedback }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">触发来源</span>
              <strong class="block mt-1 text-sm">{{ detailItem.source }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">创建人</span>
              <strong class="block mt-1 text-sm">{{ detailItem.creator }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">站点</span>
              <strong class="block mt-1 text-sm">{{ detailItem.site }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">产品线</span>
              <strong class="block mt-1 text-sm">{{ detailItem.productLine }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">内部型号</span>
              <strong class="block mt-1 text-sm">{{ detailItem.internal }}</strong>
            </div>
          </div>

          <!-- Editable fields -->
          <div class="space-y-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">异常问题</span>
              <textarea v-model="editFields.issue" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">影响范围</span>
              <textarea v-model="editFields.impactScope" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">临时处置</span>
              <textarea v-model="editFields.tempPlan" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">根因分析</span>
              <textarea v-model="editFields.rootCause" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">整改措施</span>
              <textarea v-model="editFields.fixPlan" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">验证结果</span>
              <textarea v-model="editFields.verifyResult" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea>
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="closeDetailModal">关闭</button>
          <button class="btn-primary text-xs h-8 px-4" @click="saveEmergency">保存流程</button>
          <button class="btn-success text-xs h-8 px-4" @click="closeArchive">关闭归档</button>
        </div>
      </div>
    </div>

    <!-- ==================== Create Emergency Modal ==================== -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">紧急异常</span>
            <h3 class="text-base font-extrabold text-gray-900">新建异常</h3>
            <p class="text-[11px] text-gray-400">录入 P0/P1 紧急异常事项。</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="closeCreateModal"><X class="w-5 h-5" /></button>
        </div>

        <div class="p-5 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-3">
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">异常ID</span>
              <input v-model="newEmergency.id" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold bg-gray-50" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">P级</span>
              <select v-model="newEmergency.level" @change="syncId" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>P0</option>
                <option>P1</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">地区</span>
              <select v-model="newEmergency.region" @change="syncRegionOwner" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
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
                <option>京东</option>
                <option>天猫</option>
                <option>抖音</option>
                <option>Amazon</option>
                <option>Walmart</option>
                <option>独立站</option>
              </select>
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[11px] font-bold text-gray-600">产品线</span>
              <select v-model="newEmergency.productLine" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>八电极秤</option>
                <option>体脂秤</option>
                <option>筋膜枪</option>
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
          <button class="btn-secondary text-xs h-8 px-4" @click="closeCreateModal">取消</button>
          <button class="btn-primary text-xs h-8 px-5" @click="createEmergency">保存</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white bg-green-600">
      {{ toast }}
    </div>
  </div>
</template>
