<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { WorkOrder } from '@/types'

const props = defineProps<{
  open: boolean
  item: WorkOrder | null
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'save', value: WorkOrder): void
  (event: 'route', value: { order: WorkOrder; route: 'requirement' | 'exception' | 'qa' | 'close' }): void
}>()

const form = reactive({
  status: '',
  owner: '',
  result: '',
  closeNote: '',
})

watch(
  () => props.item,
  (item) => {
    form.status = item?.status || ''
    form.owner = item?.owner || ''
    form.result = item?.result || ''
    form.closeNote = item?.closeNote || ''
  },
  { immediate: true },
)

function closeDrawer() {
  emit('update:open', false)
}

function saveItem() {
  if (!props.item) {
    closeDrawer()
    return
  }

  emit('save', {
    ...props.item,
    status: form.status,
    owner: form.owner,
    result: form.result,
    closeNote: form.closeNote,
  })
  closeDrawer()
}

function routeTo(route: 'requirement' | 'exception' | 'qa' | 'close') {
  if (!props.item) {
    return
  }

  emit('route', { order: props.item, route })
  closeDrawer()
}
</script>

<template>
  <a-drawer
    :open="props.open"
    :title="props.item?.id || '工单详情'"
    width="760"
    @close="closeDrawer"
  >
    <template v-if="props.item">
      <a-descriptions bordered size="small" :column="1">
        <a-descriptions-item label="摘要">{{ props.item.summary }}</a-descriptions-item>
        <a-descriptions-item label="关联反馈">{{ props.item.relatedFeedback }}</a-descriptions-item>
        <a-descriptions-item label="AI摘要">{{ props.item.aiAbstract }}</a-descriptions-item>
      </a-descriptions>

      <a-steps class="my-5" :current="Math.max(0, props.item.step - 1)" size="small">
        <a-step title="转工单" />
        <a-step title="分派责任人" />
        <a-step title="处理中" />
        <a-step title="待确认" />
        <a-step title="已闭环" />
      </a-steps>

      <a-alert
        class="mb-4"
        type="info"
        show-icon
        message="AI推荐"
        description="该工单可根据处理结果转需求、转紧急异常、沉淀 Q&A，或直接回复关闭。"
      />

      <a-form layout="vertical">
        <a-form-item label="状态">
          <a-select
            v-model:value="form.status"
            :options="['处理中', '待确认', '已闭环', '转需求', '转异常', '转Q&A'].map((item) => ({ label: item, value: item }))"
          />
        </a-form-item>
        <a-form-item label="负责人">
          <a-input v-model:value="form.owner" />
        </a-form-item>
        <a-form-item label="处理结果">
          <a-textarea v-model:value="form.result" :rows="3" />
        </a-form-item>
        <a-form-item label="关闭说明">
          <a-textarea v-model:value="form.closeNote" :rows="3" />
        </a-form-item>
      </a-form>
    </template>
    <template #footer>
      <a-space wrap>
        <a-button @click="routeTo('requirement')">转需求</a-button>
        <a-button @click="routeTo('exception')">转异常</a-button>
        <a-button @click="routeTo('qa')">转Q&A</a-button>
        <a-button @click="routeTo('close')">直接关闭</a-button>
        <a-button type="primary" @click="saveItem">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
