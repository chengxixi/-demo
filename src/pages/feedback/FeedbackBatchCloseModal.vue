<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { FeedbackItem } from '@/types'

const props = defineProps<{
  open: boolean
  items: FeedbackItem[]
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'confirm', value: { route: string; closeReason: string; qa: boolean }): void
}>()

const form = reactive({
  route: '已转工单',
  closeReason: '',
  qa: true,
})

const previewRows = computed(() => {
  return props.items.map((item) => ({
    id: item.id,
    model: item.model,
    issue: item.level3,
    route: item.processRoute,
    suggestion: suggestRoute(item),
  }))
})

function suggestRoute(item: FeedbackItem) {
  if (item.exception === 'P0' || item.exception === 'P1') {
    return '已转异常'
  }

  if (item.returned === '退货' || item.returned === '换货' || item.returned === '退货+换货') {
    return '已转工单'
  }

  if (item.level1 === '产品体验') {
    return '已转需求'
  }

  return '已直接回复关闭'
}

function closeModal() {
  emit('update:open', false)
}

function confirmClose() {
  emit('confirm', { ...form })
  closeModal()
}
</script>

<template>
  <a-modal
    :open="props.open"
    title="批量处理"
    width="860px"
    @cancel="closeModal"
  >
    <a-alert
      class="mb-4"
      type="warning"
      show-icon
      :message="`已选择 ${props.items.length} 条反馈，确认后会统一更新处理去向与状态。`"
    />

    <a-form layout="vertical">
      <a-row :gutter="12">
        <a-col :xs="24" :md="12">
          <a-form-item label="批量处理方式">
            <a-select
              v-model:value="form.route"
              :options="['已直接回复关闭', '已转工单', '已转需求', '已转异常', '已转Q&A'].map((item) => ({ label: item, value: item }))"
            />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :md="12">
          <a-form-item label="同步沉淀Q&A">
            <a-switch v-model:checked="form.qa" checked-children="是" un-checked-children="否" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="处理说明">
            <a-textarea
              v-model:value="form.closeReason"
              :rows="3"
              placeholder="填写批量处理原因、证据或交接说明。"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <vxe-table :data="previewRows" border size="mini" stripe height="260">
      <vxe-column field="id" title="反馈编号" width="160" />
      <vxe-column field="model" title="销售型号" width="120" />
      <vxe-column field="issue" title="三级问题" min-width="160" />
      <vxe-column field="route" title="当前处理去向" width="140" />
      <vxe-column field="suggestion" title="AI建议去向" width="150" />
    </vxe-table>

    <template #footer>
      <a-space>
        <a-button @click="closeModal">取消</a-button>
        <a-button type="primary" @click="confirmClose">确认处理</a-button>
      </a-space>
    </template>
  </a-modal>
</template>
