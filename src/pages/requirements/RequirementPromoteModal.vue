<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { CandidateLead, RequirementPoolItem } from '@/types'

const props = defineProps<{
  visible: boolean
  source: CandidateLead | null
}>()

const emit = defineEmits<{
  (event: 'confirm', value: RequirementPoolItem): void
  (event: 'close'): void
}>()

const form = reactive({
  title: '',
  product: '',
  level: 'L3',
  path: '功能升级',
  owner: '李工',
  due: '',
  evidence: '',
  description: '',
})

watch(
  () => props.source,
  (source) => {
    form.title = source?.title || ''
    form.product = source?.product || ''
    form.evidence = source?.evidence || ''
    form.description = source?.nextAction || ''
  },
  { immediate: true },
)

function confirmPromote() {
  emit('confirm', {
    id: `REQ-${Date.now()}`,
    candidate: props.source?.id || '',
    title: form.title,
    source: props.source?.category || '人工创建',
    evidence: form.evidence,
    product: form.product,
    scores: {
      userValue: 3,
      businessImpact: 3,
      feasibility: 3,
      competitiveImpact: 3,
      inventoryImpact: 1,
    },
    level: form.level,
    path: form.path,
    status: '待评审',
    owner: form.owner,
    due: form.due,
    description: form.description,
    painPoint: '待补充',
    expectedValue: '待评估',
    risk: '待确认',
    nextAction: '进入产品评审',
    relatedFeedback: props.source?.sourceFeedback || '',
  })
}
</script>

<template>
  <a-modal
    :open="props.visible"
    title="转入产品需求池"
    width="760px"
    @cancel="emit('close')"
  >
    <a-form layout="vertical">
      <a-row :gutter="12">
        <a-col :span="12">
          <a-form-item label="需求标题">
            <a-input v-model:value="form.title" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="适用产品">
            <a-input v-model:value="form.product" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="等级">
            <a-select
              v-model:value="form.level"
              :options="['L1', 'L2', 'L3', 'L4'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="路径">
            <a-select
              v-model:value="form.path"
              :options="['紧急修复', '体验优化', '功能升级', '换代观察'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="负责人">
            <a-input v-model:value="form.owner" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="证据摘要">
            <a-textarea v-model:value="form.evidence" :rows="3" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="需求描述">
            <a-textarea v-model:value="form.description" :rows="3" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="emit('close')">取消</a-button>
        <a-button type="primary" @click="confirmPromote">确认转入</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
