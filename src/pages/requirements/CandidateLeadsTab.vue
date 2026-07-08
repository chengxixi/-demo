<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import { message } from 'ant-design-vue'
import type { CandidateLead } from '@/types'

const props = defineProps<{
  candidates: CandidateLead[]
}>()

const emit = defineEmits<{
  (event: 'openPromote', candidate: CandidateLead): void
  (event: 'convertToWorkOrder', candidate: CandidateLead): void
  (event: 'createCandidate', candidate: CandidateLead): void
}>()

const showNewCandidateModal = shallowRef(false)
const newCandidate = reactive<CandidateLead>({
  id: '',
  sourceFeedback: '',
  category: '',
  title: '',
  evidence: '',
  product: '',
  status: '待补充',
  nextAction: '',
})

const statusRows = computed(() => {
  const groups = ['待补充', '待评分', '已转需求']

  return groups.map((status) => ({
    status,
    count: props.candidates.filter((item) => item.status === status).length,
  }))
})

function resetCandidate() {
  const nextNumber = props.candidates.length + 1

  Object.assign(newCandidate, {
    id: `REQ-CAND-${String(nextNumber).padStart(3, '0')}`,
    sourceFeedback: '',
    category: '',
    title: '',
    evidence: '',
    product: '',
    status: '待补充',
    nextAction: '',
  })
}

function openNewCandidate() {
  resetCandidate()
  showNewCandidateModal.value = true
}

function createCandidate() {
  emit('createCandidate', { ...newCandidate })
  showNewCandidateModal.value = false
}

function mergeCandidate(candidate: CandidateLead) {
  message.info(`已标记 ${candidate.id} 进入合并确认`)
}

function supplementEvidence(candidate: CandidateLead) {
  message.info(`请补充 ${candidate.id} 的样本、退货率和差评证据`)
}
</script>

<template>
  <div class="space-y-4">
    <a-row :gutter="[12, 12]">
      <a-col :xs="24" :md="8">
        <a-card size="small"><a-statistic title="候选线索" :value="props.candidates.length" /></a-card>
      </a-col>
      <a-col v-for="row in statusRows" :key="row.status" :xs="24" :md="8">
        <a-card size="small"><a-statistic :title="row.status" :value="row.count" /></a-card>
      </a-col>
    </a-row>

    <a-row justify="space-between" align="middle">
      <a-col><a-typography-title :level="5" class="m-0">候选需求线索</a-typography-title></a-col>
      <a-col><a-button type="primary" @click="openNewCandidate">新增线索</a-button></a-col>
    </a-row>

    <vxe-table :data="props.candidates" border stripe show-overflow height="520" :export-config="{}">
      <vxe-column field="id" title="线索ID" width="150" fixed="left" />
      <vxe-column field="sourceFeedback" title="来源反馈" min-width="210" />
      <vxe-column field="category" title="分类" min-width="170" />
      <vxe-column field="title" title="线索标题" min-width="240" />
      <vxe-column field="evidence" title="证据摘要" min-width="300" />
      <vxe-column field="product" title="适用产品" min-width="160" />
      <vxe-column field="status" title="状态" width="110">
        <template #default="{ row }">
          <a-tag :color="row.status === '待评分' ? 'blue' : row.status === '已转需求' ? 'green' : 'orange'">
            {{ row.status }}
          </a-tag>
        </template>
      </vxe-column>
      <vxe-column field="nextAction" title="下一步动作" min-width="260" />
      <vxe-column title="操作" width="310" fixed="right" align="center">
        <template #default="{ row }">
          <a-space size="small" wrap>
            <a-button size="small" @click="mergeCandidate(row)">合并</a-button>
            <a-button size="small" @click="supplementEvidence(row)">补证据</a-button>
            <a-button size="small" type="primary" @click="emit('openPromote', row)">转产品需求</a-button>
            <a-button size="small" @click="emit('convertToWorkOrder', row)">转为工单</a-button>
          </a-space>
        </template>
      </vxe-column>
    </vxe-table>

    <a-modal v-model:open="showNewCandidateModal" title="新增候选线索" width="680px" @ok="createCandidate">
      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :span="12"><a-form-item label="线索ID"><a-input v-model:value="newCandidate.id" /></a-form-item></a-col>
          <a-col :span="12">
            <a-form-item label="状态">
              <a-select v-model:value="newCandidate.status" :options="['待补充', '待评分', '已转需求'].map((item) => ({ label: item, value: item }))" />
            </a-form-item>
          </a-col>
          <a-col :span="12"><a-form-item label="来源反馈"><a-input v-model:value="newCandidate.sourceFeedback" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="分类"><a-input v-model:value="newCandidate.category" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="线索标题"><a-input v-model:value="newCandidate.title" /></a-form-item></a-col>
          <a-col :span="24"><a-form-item label="证据摘要"><a-textarea v-model:value="newCandidate.evidence" :rows="3" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="适用产品"><a-input v-model:value="newCandidate.product" /></a-form-item></a-col>
          <a-col :span="12"><a-form-item label="下一步动作"><a-input v-model:value="newCandidate.nextAction" /></a-form-item></a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>
