<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { CandidateLead, RequirementPoolItem } from '@/types'
import { candidateLeadData, requirementPoolData } from '@/api/mock'
import CandidateLeadsTab from './CandidateLeadsTab.vue'
import RequirementDetailDrawer from './RequirementDetailDrawer.vue'
import RequirementPoolTab from './RequirementPoolTab.vue'
import RequirementPromoteModal from './RequirementPromoteModal.vue'

const activeTab = ref('candidates')
const candidateLeads = ref<CandidateLead[]>([...candidateLeadData])
const requirementPool = ref<RequirementPoolItem[]>([...requirementPoolData])
const filterLevel = ref('')
const showPromoteModal = ref(false)
const promotingCandidate = ref<CandidateLead | null>(null)
const showDetail = ref(false)
const detailReq = ref<RequirementPoolItem | null>(null)

const filteredPool = computed(() => {
  if (!filterLevel.value) {
    return requirementPool.value
  }

  return requirementPool.value.filter((item) => item.level === filterLevel.value)
})

const levelCounts = computed(() => ({
  L1: requirementPool.value.filter((item) => item.level === 'L1').length,
  L2: requirementPool.value.filter((item) => item.level === 'L2').length,
  L3: requirementPool.value.filter((item) => item.level === 'L3').length,
  L4: requirementPool.value.filter((item) => item.level === 'L4').length,
}))

function openPromoteModal(candidate: CandidateLead) {
  promotingCandidate.value = candidate
  showPromoteModal.value = true
}

function confirmPromote(newReq: RequirementPoolItem) {
  requirementPool.value = [newReq, ...requirementPool.value]
  showPromoteModal.value = false
  message.success(`${newReq.id} 已转入产品需求池`)
}

function openDetail(item: RequirementPoolItem) {
  detailReq.value = item
  showDetail.value = true
}

function createCandidate(candidate: CandidateLead) {
  candidateLeads.value = [candidate, ...candidateLeads.value]
  message.success(`已创建线索 ${candidate.id}`)
}

function convertToWorkOrder(candidate: CandidateLead) {
  message.success(`已为线索 ${candidate.id} 生成工单`)
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-space direction="vertical" size="small">
      <a-typography-title :level="4" class="m-0">需求管理</a-typography-title>
      <a-typography-text type="secondary">
        从反馈、工单、异常和竞品线索中沉淀有效信息，按证据、评分和 L1-L4 优先级进入产品需求池。
      </a-typography-text>
    </a-space>

    <a-card :bordered="false">
      <a-steps size="small" :current="1">
        <a-step title="来源汇聚" description="反馈、异常、工单、竞品线索" />
        <a-step title="候选线索" description="合并证据并补充材料" />
        <a-step title="五维评分" description="用户价值、业务影响、可行性等" />
        <a-step title="产品需求池" description="按 L1-L4 进入评审" />
        <a-step title="排期跟进" description="进入版本规划或观察池" />
      </a-steps>
    </a-card>

    <a-row :gutter="[12, 12]">
      <a-col :xs="12" :md="6">
        <a-card size="small"><a-statistic title="候选线索" :value="candidateLeads.length" /></a-card>
      </a-col>
      <a-col :xs="12" :md="6">
        <a-card size="small"><a-statistic title="需求池" :value="requirementPool.length" /></a-card>
      </a-col>
      <a-col :xs="12" :md="6">
        <a-card size="small"><a-statistic title="L1/L2" :value="levelCounts.L1 + levelCounts.L2" /></a-card>
      </a-col>
      <a-col :xs="12" :md="6">
        <a-card size="small"><a-statistic title="L3/L4" :value="levelCounts.L3 + levelCounts.L4" /></a-card>
      </a-col>
    </a-row>

    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane key="candidates" :tab="`候选线索（${candidateLeads.length}）`">
        <CandidateLeadsTab
          :candidates="candidateLeads"
          @open-promote="openPromoteModal"
          @convert-to-work-order="convertToWorkOrder"
          @create-candidate="createCandidate"
        />
      </a-tab-pane>
      <a-tab-pane key="pool" :tab="`产品需求池（${requirementPool.length}）`">
        <RequirementPoolTab
          :pool="filteredPool"
          :level-filter="filterLevel"
          :level-counts="levelCounts"
          @update:level-filter="filterLevel = $event"
          @open-detail="openDetail"
        />
      </a-tab-pane>
    </a-tabs>

    <RequirementPromoteModal
      :visible="showPromoteModal"
      :source="promotingCandidate"
      @confirm="confirmPromote"
      @close="showPromoteModal = false"
    />
    <RequirementDetailDrawer
      :item="detailReq"
      :visible="showDetail"
      @close="showDetail = false"
    />
  </section>
</template>
