<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, X, ArrowLeft } from 'lucide-vue-next'
import { candidateLeadData, requirementPoolData } from '@/api/mock-data'
import type { CandidateLead, RequirementPoolItem } from '@/types'

// ==================== Toast ====================
const toast = ref<{ msg: string; type: string } | null>(null)
function showToast(msg: string, type = 'info') { toast.value = { msg, type }; setTimeout(() => { toast.value = null }, 2500) }

// ==================== Tabs ====================
const activeTab = ref<'candidates' | 'pool'>('candidates')

// ==================== Candidate Leads ====================
const candidateLeads = ref<CandidateLead[]>([...candidateLeadData])

// ==================== Requirement Pool ====================
const requirementPool = ref<RequirementPoolItem[]>([...requirementPoolData])
const filterLevel = ref('')
const filteredPool = computed(() => {
  if (!filterLevel.value) return requirementPool.value
  return requirementPool.value.filter(r => r.level === filterLevel.value)
})
const levelCounts = computed(() => ({
  L1: requirementPool.value.filter(r => r.level === 'L1').length,
  L2: requirementPool.value.filter(r => r.level === 'L2').length,
  L3: requirementPool.value.filter(r => r.level === 'L3').length,
  L4: requirementPool.value.filter(r => r.level === 'L4').length,
}))

const levelInfo: Record<string, { title: string; desc: string; pill: string }> = {
  L1: { title: 'L1 紧急修复', desc: '安全/合规/高退货风险，先处置再复盘', pill: 'p1' },
  L2: { title: 'L2 体验优化', desc: '高频体验问题，进入近期迭代评审', pill: 'p2' },
  L3: { title: 'L3 功能升级', desc: '竞品或用户价值明确，进入版本规划', pill: 'p3' },
  L4: { title: 'L4 换代开发', desc: '中长期机会，进入产品规划观察', pill: 'info' },
}
const scoreLabels = ['用户价值', '业务影响', '可行性', '竞争影响', '库存影响']

// ==================== Promote Modal ====================
const showPromoteModal = ref(false)
const promotingCandidate = ref<CandidateLead | null>(null)
const promoteForm = ref({
  reqId: '',
  title: '',
  source: '',
  product: '',
  level: 'L2',
  path: '体验优化',
  status: '评分确认',
  owner: '产品经理',
  due: '',
  scores: { userValue: 3, businessImpact: 3, feasibility: 3, competitiveImpact: 3, inventoryImpact: 3 },
  evidence: '',
  description: '',
  painPoint: '',
  expectedValue: '',
  risk: '',
  nextAction: '',
  relatedFeedback: '',
})

function openPromoteModal(c: CandidateLead) {
  promotingCandidate.value = c
  promoteForm.value = {
    reqId: `REQ-${c.id.replace('REQ-CAND-', '')}`,
    title: c.title,
    source: c.category,
    product: c.product,
    level: 'L2',
    path: '体验优化',
    status: '评分确认',
    owner: '产品经理',
    due: '',
    scores: { userValue: 3, businessImpact: 3, feasibility: 3, competitiveImpact: 3, inventoryImpact: 3 },
    evidence: c.evidence,
    description: '',
    painPoint: '',
    expectedValue: '',
    risk: '',
    nextAction: c.nextAction,
    relatedFeedback: c.sourceFeedback,
  }
  showPromoteModal.value = true
}

function confirmPromote() {
  const f = promoteForm.value
  const newReq: RequirementPoolItem = {
    id: f.reqId,
    candidate: promotingCandidate.value?.id || '',
    title: f.title,
    source: f.source,
    evidence: f.evidence,
    product: f.product,
    scores: { ...f.scores },
    level: f.level,
    path: f.path,
    status: f.status,
    owner: f.owner,
    due: f.due || '待定',
    description: f.description,
    painPoint: f.painPoint,
    expectedValue: f.expectedValue,
    risk: f.risk,
    nextAction: f.nextAction,
    relatedFeedback: f.relatedFeedback,
  }
  requirementPool.value.unshift(newReq)
  showPromoteModal.value = false
  showToast(`${f.reqId} 已转入产品需求池`, 'success')
}

function convertToWorkOrder(c: CandidateLead) {
  showToast(`已为线索 ${c.id} 生成工单`, 'success')
}

// ==================== Detail Drawer ====================
const showDetail = ref(false)
const detailReq = ref<RequirementPoolItem | null>(null)
const processSteps = ['候选导入', '信息补齐', '五维评分', 'L级分级', '审批/评审', '下游立项', '复盘回写']

function openDetail(req: RequirementPoolItem) {
  detailReq.value = req
  const idx = processSteps.indexOf('审批/评审')
  const curStep = req.status === '待审批' ? 3 : req.status === '已入池' ? 5 : req.status === '观察池' ? 3 : req.status === '评分确认' ? 1 : 4
  showDetail.value = true
  void idx // keep for future use
  void curStep
}

function getStepClass(req: RequirementPoolItem, stepIdx: number): string {
  const stepMap: Record<string, number> = {
    '待补充': 0, '待评分': 1, '评分确认': 2, '待审批': 3, '已入池': 4, '观察池': 2,
  }
  const cur = stepMap[req.status] ?? 0
  if (stepIdx < cur) return 'done'
  if (stepIdx === cur) return 'active'
  return ''
}

// ==================== New Candidate Modal ====================
const showNewCandidateModal = ref(false)
const newCandidate = ref({
  id: '',
  sourceFeedback: '',
  category: '',
  title: '',
  evidence: '',
  product: '',
  status: '待补充',
  nextAction: '',
})

function openNewCandidate() {
  const n = candidateLeads.value.length + 1
  newCandidate.value = {
    id: `REQ-CAND-${String(n).padStart(3, '0')}`,
    sourceFeedback: '',
    category: '',
    title: '',
    evidence: '',
    product: '',
    status: '待补充',
    nextAction: '',
  }
  showNewCandidateModal.value = true
}

function createCandidate() {
  candidateLeads.value.unshift({ ...newCandidate.value })
  showNewCandidateModal.value = false
  showToast(`已创建线索 ${newCandidate.value.id}`, 'success')
}
</script>

<template>
  <div class="p-6 max-w-full overflow-auto">
    <!-- Toast -->
    <div v-if="toast" class="fixed top-6 right-6 z-[100] rounded-lg px-4 py-2.5 text-sm font-extrabold shadow-lg text-white"
      :class="toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'">{{ toast.msg }}</div>

    <!-- Page Header -->
    <div class="mb-4">
      <span class="text-xs text-gray-400">需求管理</span>
      <h1 class="text-xl font-extrabold text-gray-900 mt-0.5">需求管理</h1>
      <p class="text-xs text-gray-400 mt-0.5">承接反馈清单/异常处理/工单池/竞品分析的转需求事项，完成候选线索收集、五维评分、L1-L4分级后导入产品需求池。</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-4">
      <button
        class="px-4 py-1.5 rounded-md text-xs font-extrabold transition-colors"
        :class="activeTab === 'candidates' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'candidates'"
      >候选线索（{{ candidateLeads.length }}）</button>
      <button
        class="px-4 py-1.5 rounded-md text-xs font-extrabold transition-colors"
        :class="activeTab === 'pool' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'pool'"
      >产品需求池（{{ requirementPool.length }}）</button>
    </div>

    <!-- ==================== Candidate Leads Tab ==================== -->
    <template v-if="activeTab === 'candidates'">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-3">
          <span class="text-sm font-extrabold text-gray-800">候选需求线索（反馈承接区）</span>
        </div>
        <button class="btn-primary text-xs h-8 px-3 flex items-center gap-1" @click="openNewCandidate"><Plus class="w-3.5 h-3.5" />新增线索</button>
      </div>

      <div class="overflow-x-auto">
        <table class="data-table w-full text-xs border-collapse">
          <thead>
            <tr class="border-b border-gray-200 text-left">
              <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">线索ID</th>
              <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">来源反馈</th>
              <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">分类</th>
              <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">线索标题</th>
              <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">证据摘要</th>
              <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">适用产品</th>
              <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">状态</th>
              <th class="px-3 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">下一步动作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in candidateLeads" :key="c.id" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-3 py-2.5"><button class="link-button text-xs font-extrabold text-blue-600 hover:underline">{{ c.id }}</button></td>
              <td class="px-3 py-2.5 text-xs">{{ c.sourceFeedback }}</td>
              <td class="px-3 py-2.5 text-xs">{{ c.category }}</td>
              <td class="px-3 py-2.5 text-xs font-extrabold max-w-[260px] truncate">{{ c.title }}</td>
              <td class="px-3 py-2.5"><em class="text-xs text-gray-500">{{ c.evidence }}</em></td>
              <td class="px-3 py-2.5 text-xs">{{ c.product }}</td>
              <td class="px-3 py-2.5"><span class="status-tag text-[10px] px-2 py-0.5 rounded font-extrabold" :class="c.status === '待评分' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'">{{ c.status }}</span></td>
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-1 flex-wrap">
                  <button class="mini-action text-[10px] px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold">合并</button>
                  <button class="mini-action text-[10px] px-2 py-0.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold">补证据</button>
                  <button class="mini-action primary text-[10px] px-2 py-0.5 rounded bg-blue-500 text-white hover:bg-blue-600 font-bold" @click="openPromoteModal(c)">转产品需求</button>
                  <button class="mini-action warning text-[10px] px-2 py-0.5 rounded border border-orange-400 text-orange-600 hover:bg-orange-50 font-bold" @click="convertToWorkOrder(c)">转为工单</button>
                </div>
              </td>
            </tr>
            <tr v-if="candidateLeads.length === 0">
              <td colspan="8" class="text-center py-10 text-gray-400 text-sm font-bold">暂无候选线索</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ==================== Product Requirement Pool Tab ==================== -->
    <template v-if="activeTab === 'pool'">
      <!-- L1-L4 Filter Cards -->
      <div class="grid grid-cols-4 gap-3 mb-4">
        <button
          v-for="lvl in ['L1', 'L2', 'L3', 'L4']"
          :key="lvl"
          class="text-left p-3 rounded-lg border transition-all hover:shadow-md"
          :class="filterLevel === lvl ? 'border-blue-400 bg-blue-50 shadow' : 'border-gray-200 bg-white'"
          @click="filterLevel = filterLevel === lvl ? '' : lvl"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="pill text-[10px] px-2 py-0.5 rounded font-extrabold" :class="lvl === 'L1' ? 'bg-red-100 text-red-700' : lvl === 'L2' ? 'bg-orange-100 text-orange-700' : lvl === 'L3' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'">{{ lvl }}</span>
            <strong class="text-xs text-gray-800">{{ levelInfo[lvl].title }}</strong>
          </div>
          <em class="text-[10px] text-gray-500 block">{{ levelInfo[lvl].desc }}</em>
          <b class="text-lg font-extrabold text-gray-800 mt-1">{{ (levelCounts as any)[lvl] }}</b>
        </button>
      </div>

      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-extrabold text-gray-800">产品需求池（MVP试运行）</span>
        <button class="text-xs text-blue-600 font-extrabold hover:underline">导出评分表</button>
      </div>

      <div class="overflow-x-auto">
        <table class="data-table w-full text-xs border-collapse">
          <thead>
            <tr class="border-b border-gray-200 text-left">
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">需求ID</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">候选来源</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">需求标题</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">来源/证据</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">适用产品</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">五维评分</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">等级</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">处理路径</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">状态</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">责任人</th>
              <th class="px-2.5 py-2.5 font-extrabold text-gray-500 text-[11px] whitespace-nowrap">完成时限</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filteredPool" :key="r.id" class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" @click="openDetail(r)">
              <td class="px-2.5 py-2.5"><button class="link-button text-xs font-extrabold text-blue-600 hover:underline">{{ r.id }}</button></td>
              <td class="px-2.5 py-2.5 text-xs">{{ r.candidate }}</td>
              <td class="px-2.5 py-2.5 text-xs font-extrabold max-w-[240px] truncate">{{ r.title }}</td>
              <td class="px-2.5 py-2.5">
                <strong class="text-xs block">{{ r.source }}</strong>
                <em class="text-[10px] text-gray-500">{{ r.evidence }}</em>
              </td>
              <td class="px-2.5 py-2.5 text-xs">{{ r.product }}</td>
              <td class="px-2.5 py-2.5">
                <div class="score-bars flex items-end gap-1 h-9">
                  <div v-for="(label, si) in scoreLabels" :key="si" class="flex flex-col items-center gap-0.5" :title="`${label}：${(r.scores as any)[Object.keys(r.scores)[si]]}分`">
                    <b class="text-[9px] font-extrabold">{{ (r.scores as any)[Object.keys(r.scores)[si]] }}</b>
                    <i class="w-3 rounded-t" :style="{ height: (r.scores as any)[Object.keys(r.scores)[si]] * 18 + '%', backgroundColor: si === 0 ? '#1f73e8' : si === 1 ? '#22a06b' : si === 2 ? '#ffb020' : si === 3 ? '#8b5cf6' : '#06b6d4' }"></i>
                  </div>
                </div>
              </td>
              <td class="px-2.5 py-2.5">
                <span class="pill text-[10px] px-2 py-0.5 rounded font-extrabold"
                  :class="r.level === 'L1' ? 'bg-red-100 text-red-700' : r.level === 'L2' ? 'bg-orange-100 text-orange-700' : r.level === 'L3' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                >{{ r.level }}</span>
              </td>
              <td class="px-2.5 py-2.5 text-xs">{{ r.path }}</td>
              <td class="px-2.5 py-2.5"><span class="status-tag text-[10px] px-2 py-0.5 rounded font-extrabold bg-blue-100 text-blue-700">{{ r.status }}</span></td>
              <td class="px-2.5 py-2.5 text-xs">{{ r.owner }}</td>
              <td class="px-2.5 py-2.5 text-xs">{{ r.due }}</td>
            </tr>
            <tr v-if="filteredPool.length === 0">
              <td colspan="11" class="text-center py-10 text-gray-400 text-sm font-bold">暂无匹配的需求</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ==================== Promote Modal ==================== -->
    <div v-if="showPromoteModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mt-6">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <span class="text-xs text-gray-400">候选线索转产品需求</span>
            <h3 class="text-base font-extrabold text-gray-900">转产品需求</h3>
            <p class="text-[11px] text-gray-400">{{ promotingCandidate?.id }} / {{ promotingCandidate?.title }}</p>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="showPromoteModal = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-5 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-3 mb-4">
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">需求ID</span><input v-model="promoteForm.reqId" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">当前状态</span>
              <select v-model="promoteForm.status" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>评分确认</option><option>待审批</option><option>已入池</option><option>观察池</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 col-span-2"><span class="text-[11px] font-bold text-gray-600">需求标题</span><input v-model="promoteForm.title" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">来源/证据类型</span><input v-model="promoteForm.source" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">适用产品</span><input v-model="promoteForm.product" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">需求等级</span>
              <select v-model="promoteForm.level" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>L1 紧急修复</option><option>L2 体验优化</option><option>L3 功能升级</option><option>L4 换代开发</option>
              </select>
            </label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">处理路径</span>
              <select v-model="promoteForm.path" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold">
                <option>紧急修复</option><option>体验优化</option><option>功能升级</option><option>换代开发观察</option>
              </select>
            </label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">责任人</span><input v-model="promoteForm.owner" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">完成时限</span><input type="date" v-model="promoteForm.due" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          </div>

          <!-- Five-dimension Scoring -->
          <fieldset class="border border-gray-200 rounded-lg p-3 mb-4">
            <legend class="text-[11px] font-extrabold text-gray-600 px-1">五维评分</legend>
            <div class="grid grid-cols-5 gap-3">
              <label v-for="(label, si) in scoreLabels" :key="si" class="flex flex-col items-center gap-1">
                <span class="text-[10px] font-bold text-gray-500">{{ label }}</span>
                <select
                  class="h-8 w-full text-xs border border-gray-300 rounded-md px-2 font-bold text-center"
                  :value="(promoteForm.scores as any)[Object.keys(promoteForm.scores)[si]]"
                  @change="(e: Event) => { const t = e.target as HTMLSelectElement; (promoteForm.scores as any)[Object.keys(promoteForm.scores)[si]] = Number(t.value) }"
                >
                  <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                </select>
              </label>
            </div>
          </fieldset>

          <div class="space-y-3">
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">证据摘要</span><textarea v-model="promoteForm.evidence" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">需求描述</span><textarea v-model="promoteForm.description" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">用户痛点</span><textarea v-model="promoteForm.painPoint" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">预期价值</span><textarea v-model="promoteForm.expectedValue" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">风险与待确认</span><textarea v-model="promoteForm.risk" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
            <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">下一步动作</span><textarea v-model="promoteForm.nextAction" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          </div>
        </div>
        <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-primary text-xs h-8 px-4" @click="confirmPromote">确认转入产品需求池</button>
          <button class="btn-secondary text-xs h-8 px-4" @click="showPromoteModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- ==================== New Candidate Modal ==================== -->
    <div v-if="showNewCandidateModal" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg mt-10">
        <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
          <div>
            <h3 class="text-base font-extrabold text-gray-900">新增候选线索</h3>
          </div>
          <button class="text-gray-400 hover:text-gray-600" @click="showNewCandidateModal = false"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-5 space-y-3">
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">线索ID</span><input v-model="newCandidate.id" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">来源反馈</span><input v-model="newCandidate.sourceFeedback" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">分类</span><input v-model="newCandidate.category" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">线索标题</span><input v-model="newCandidate.title" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">证据摘要</span><textarea v-model="newCandidate.evidence" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold"></textarea></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">适用产品</span><input v-model="newCandidate.product" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">状态</span>
            <select v-model="newCandidate.status" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold"><option>待补充</option><option>待评分</option></select>
          </label>
          <label class="flex flex-col gap-1"><span class="text-[11px] font-bold text-gray-600">下一步动作</span><input v-model="newCandidate.nextAction" class="h-8 text-xs border border-gray-300 rounded-md px-2 font-bold" /></label>
        </div>
        <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-primary text-xs h-8 px-4" @click="createCandidate">创建线索</button>
          <button class="btn-secondary text-xs h-8 px-4" @click="showNewCandidateModal = false">取消</button>
        </div>
      </div>
    </div>

    <!-- ==================== Detail Drawer ==================== -->
    <div v-if="showDetail && detailReq" class="fixed inset-y-0 right-0 z-50 w-[480px] max-w-[90vw] bg-white shadow-2xl flex flex-col">
      <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 flex-shrink-0">
        <button class="flex items-center gap-1.5 text-xs font-extrabold text-gray-600 hover:text-gray-800" @click="showDetail = false"><ArrowLeft class="w-4 h-4" />返回</button>
        <span class="text-[10px] text-gray-400">需求详情</span>
      </div>

      <div class="flex-1 overflow-y-auto p-5">
        <!-- Process Steps -->
        <div class="process-bar flex items-center gap-0 mb-5">
          <template v-for="(step, si) in processSteps" :key="step">
            <div class="flex flex-col items-center gap-1">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold"
                :class="getStepClass(detailReq, si) === 'done' ? 'bg-emerald-500 text-white' : getStepClass(detailReq, si) === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'"
              >{{ si + 1 }}</div>
              <span class="text-[9px] font-bold text-gray-400 whitespace-nowrap">{{ step }}</span>
            </div>
            <div v-if="si < processSteps.length - 1" class="flex-1 h-0.5 mx-0.5" :class="getStepClass(detailReq, si) === 'done' ? 'bg-emerald-300' : 'bg-gray-200'"></div>
          </template>
        </div>

        <div class="space-y-4">
          <div>
            <h2 class="text-sm font-extrabold text-gray-900 mb-2">{{ detailReq.title }}</h2>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div><span class="text-gray-400">候选来源：</span><span class="font-bold">{{ detailReq.candidate }}</span></div>
              <div><span class="text-gray-400">需求等级：</span><span class="font-bold">{{ detailReq.level }}</span></div>
              <div><span class="text-gray-400">处理路径：</span><span class="font-bold">{{ detailReq.path }}</span></div>
              <div><span class="text-gray-400">当前状态：</span><span class="font-bold">{{ detailReq.status }}</span></div>
              <div><span class="text-gray-400">责任人：</span><span class="font-bold">{{ detailReq.owner }}</span></div>
              <div><span class="text-gray-400">完成时限：</span><span class="font-bold">{{ detailReq.due }}</span></div>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-3">
            <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">需求描述</h4>
            <p class="text-xs text-gray-700">{{ detailReq.description }}</p>
          </div>

          <div>
            <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">用户痛点</h4>
            <p class="text-xs text-gray-700">{{ detailReq.painPoint }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div><span class="text-[10px] text-gray-400">来源与证据</span><p class="text-xs font-bold mt-0.5">{{ detailReq.source }} / {{ detailReq.evidence }}</p></div>
            <div><span class="text-[10px] text-gray-400">适用产品</span><p class="text-xs font-bold mt-0.5">{{ detailReq.product }}</p></div>
          </div>

          <div>
            <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">五维评分</h4>
            <div class="score-bars flex items-end gap-2 h-14">
              <div v-for="(label, si) in scoreLabels" :key="si" class="flex flex-col items-center gap-0.5" :title="`${label}：${(detailReq.scores as any)[Object.keys(detailReq.scores)[si]]}分`">
                <b class="text-[10px] font-extrabold">{{ (detailReq.scores as any)[Object.keys(detailReq.scores)[si]] }}</b>
                <i class="w-4 rounded-t" :style="{ height: (detailReq.scores as any)[Object.keys(detailReq.scores)[si]] * 18 + '%', backgroundColor: si === 0 ? '#1f73e8' : si === 1 ? '#22a06b' : si === 2 ? '#ffb020' : si === 3 ? '#8b5cf6' : '#06b6d4' }"></i>
                <span class="text-[9px] text-gray-400 font-bold">{{ label }}</span>
              </div>
            </div>
            <p class="text-[10px] text-gray-400 mt-2">L级分级说明：{{ detailReq.level === 'L1' ? '紧急修复：安全、合规、批量质量或高退货风险，需要快速审批和资源优先配置。' : detailReq.level === 'L2' ? '体验优化：高频痛点或满意度问题，纳入近期迭代评审。' : detailReq.level === 'L3' ? '功能升级：用户价值和竞争影响明确，进入版本规划和资源评估。' : '换代开发：中长期机会或平台级能力，进入产品规划观察池。' }}</p>
          </div>

          <div>
            <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">预期价值</h4>
            <p class="text-xs text-gray-700">{{ detailReq.expectedValue }}</p>
          </div>

          <div>
            <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">风险与待确认</h4>
            <p class="text-xs text-gray-700">{{ detailReq.risk }}</p>
          </div>

          <div>
            <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">下一步动作</h4>
            <p class="text-xs text-gray-700">{{ detailReq.nextAction }}</p>
          </div>

          <div>
            <h4 class="text-[11px] font-extrabold text-gray-500 mb-2">关联记录</h4>
            <p class="text-xs text-gray-700">{{ detailReq.relatedFeedback || '无' }}</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <button class="btn-primary text-xs h-8 px-3">进入审批</button>
        <button class="btn-secondary text-xs h-8 px-3">退回补充</button>
        <button class="btn-secondary text-xs h-8 px-3">加入观察池</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-table { background: white; border-radius: 8px; overflow: hidden; }
.data-table th { background: #f8f9fa; }
.scale-x-reverse { transform: scaleX(-1); }
.link-button { background: none; border: none; cursor: pointer; padding: 0; font: inherit; }
.link-button:hover { text-decoration: underline; }
.mini-action { white-space: nowrap; cursor: pointer; transition: all 0.15s; }
.mini-action.primary:hover { background: #1d4ed8 !important; }
.mini-action.warning:hover { background: #fff7ed !important; }
.status-tag { white-space: nowrap; }
.process-bar { min-width: 0; }
</style>
