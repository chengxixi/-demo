<script setup lang="ts">
import { ref, computed } from 'vue'
import { candidateLeadData, requirementPoolData } from '@/api/mock-data'
import type { CandidateLead, RequirementPoolItem } from '@/types'
import CandidateLeadsTab from './CandidateLeadsTab.vue'
import RequirementPoolTab from './RequirementPoolTab.vue'
import RequirementPromoteModal from './RequirementPromoteModal.vue'
import RequirementDetailDrawer from './RequirementDetailDrawer.vue'

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

// ==================== Promote Modal ====================
const showPromoteModal = ref(false)
const promotingCandidate = ref<CandidateLead | null>(null)

function handleOpenPromoteModal(c: CandidateLead) {
  promotingCandidate.value = c
  showPromoteModal.value = true
}

function handleConfirmPromote(newReq: RequirementPoolItem) {
  requirementPool.value.unshift(newReq)
  showPromoteModal.value = false
  showToast(`${newReq.id} 已转入产品需求池`, 'success')
}

function handleClosePromoteModal() {
  showPromoteModal.value = false
}

// ==================== Detail Drawer ====================
const showDetail = ref(false)
const detailReq = ref<RequirementPoolItem | null>(null)

function handleOpenDetail(req: RequirementPoolItem) {
  detailReq.value = req
  showDetail.value = true
}

function handleCloseDetail() {
  showDetail.value = false
}

// ==================== Candidate Actions ====================
function handleCreateCandidate(c: CandidateLead) {
  candidateLeads.value.unshift({ ...c })
  showToast(`已创建线索 ${c.id}`, 'success')
}

function handleConvertToWorkOrder(c: CandidateLead) {
  showToast(`已为线索 ${c.id} 生成工单`, 'success')
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

    <!-- Candidate Leads Tab -->
    <CandidateLeadsTab
      v-if="activeTab === 'candidates'"
      :candidates="candidateLeads"
      @open-promote="handleOpenPromoteModal"
      @convert-to-work-order="handleConvertToWorkOrder"
      @create-candidate="handleCreateCandidate"
    />

    <!-- Requirement Pool Tab -->
    <RequirementPoolTab
      v-if="activeTab === 'pool'"
      :pool="filteredPool"
      :level-filter="filterLevel"
      :level-counts="levelCounts"
      @update:level-filter="filterLevel = $event"
      @open-detail="handleOpenDetail"
    />

    <!-- Promote Modal -->
    <RequirementPromoteModal
      :visible="showPromoteModal"
      :source="promotingCandidate"
      @confirm="handleConfirmPromote"
      @close="handleClosePromoteModal"
    />

    <!-- Detail Drawer -->
    <RequirementDetailDrawer
      :item="detailReq"
      :visible="showDetail"
      @close="handleCloseDetail"
    />
  </div>
</template>

<style scoped>
.link-button { background: none; border: none; cursor: pointer; padding: 0; font: inherit; }
.link-button:hover { text-decoration: underline; }
</style>
