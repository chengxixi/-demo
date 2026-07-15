<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { feedbackData } from '@/api/mock'
import type { FeedbackItem, WorkOrder } from '@/types'

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

const relatedFeedbackIds = computed<string[]>(() => {
  const raw = props.item?.relatedFeedback || ''
  return raw.match(/[A-Z]{2}-\d{8}-\d{4}/g) || []
})

const relatedFeedbackRows = computed<FeedbackItem[]>(() => {
  if (!relatedFeedbackIds.value.length) return []
  return feedbackData.filter((item) => relatedFeedbackIds.value.includes(item.id))
})

const workOrderRoute = computed(() => {
  const item = props.item
  if (!item) return '-'
  if (item.status === '已关闭' || item.closeNote) return '直接关闭'
  if (item.exception === '是') return '已转异常'
  if (item.requirement === '是' || item.requirement === '预留') return '已转需求'
  if (item.qa === '是') return '已转Q&A'
  return item.status || '处理中'
})

const detailSummary = computed(() => {
  if (!props.item) return ''
  return props.item.aiAbstract || props.item.summary || '待补充工单摘要'
})

const detailCards = computed(() => {
  if (!props.item) return []
  return [
    { label: 'AI工单摘要', value: props.item.summary || '待补充工单摘要' },
    { label: '当前处理人', value: props.item.owner || '-' },
    { label: '处理状态', value: props.item.status || '-' },
    { label: '处理去向', value: workOrderRoute.value },
    { label: '关闭原因', value: props.item.closeReason || props.item.closeNote || '-' },
  ]
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
  if (!props.item) return
  emit('route', { order: props.item, route })
  closeDrawer()
}
</script>

<template>
  <a-drawer
    :open="props.open"
    :title="props.item?.id || '工单详情'"
    width="860"
    @close="closeDrawer"
  >
    <template v-if="props.item">
      <div class="detail-head">
        <div>
          <a-typography-title :level="4" class="m-0">{{ props.item.id }}</a-typography-title>
          <a-typography-text type="secondary">
            关联反馈 {{ props.item.relatedFeedback }} / {{ props.item.status }} / {{ props.item.owner }}
          </a-typography-text>
        </div>
      </div>

      <div class="detail-grid mb-4">
        <article v-for="card in detailCards" :key="card.label" class="detail-grid-item">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>
      </div>

      <a-card :bordered="false" class="detail-card mb-4">
        <a-steps :current="Math.max(0, props.item.step - 1)" size="small">
          <a-step title="转工单" />
          <a-step title="分派责任人" />
          <a-step title="处理中" />
          <a-step title="待确认" />
          <a-step title="已闭环" />
        </a-steps>
      </a-card>

      <a-card :bordered="false" class="detail-card mb-4" title="AI自动摘要">
        <a-typography-paragraph class="m-0">{{ detailSummary }}</a-typography-paragraph>
      </a-card>

      <a-card :bordered="false" class="detail-card mb-4" title="关联反馈明细">
        <a-empty v-if="!relatedFeedbackRows.length" description="暂无可匹配的关联反馈明细" />
        <a-space v-else direction="vertical" size="middle" class="w-full">
          <article v-for="feedback in relatedFeedbackRows" :key="feedback.id" class="feedback-card">
            <div>
              <a-typography-text strong>{{ feedback.id }} · {{ feedback.level3 || feedback.level2 }}</a-typography-text>
              <p>{{ feedback.productType }} / {{ feedback.model }} / {{ feedback.internal }}</p>
              <p>{{ feedback.ai || feedback.raw }}</p>
            </div>
            <a-space wrap>
              <a-tag>{{ feedback.source }}</a-tag>
              <a-tag>{{ feedback.exception }}</a-tag>
              <a-tag>{{ feedback.processState }}</a-tag>
            </a-space>
          </article>
        </a-space>
      </a-card>

      <a-alert
        class="mb-4"
        type="info"
        show-icon
        message="AI推荐"
        description="该工单可根据处理结果转需求、转紧急异常、沉淀 Q&A，或直接回复关闭。"
      />

      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :xs="24" :md="12">
            <a-form-item label="状态">
              <a-select
                v-model:value="form.status"
                :options="['处理中', '待确认', '已闭环', '转需求', '转异常', '转Q&A'].map((item) => ({ label: item, value: item }))"
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="负责人">
              <a-input v-model:value="form.owner" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="处理结果">
              <a-textarea v-model:value="form.result" :rows="3" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="关闭说明">
              <a-textarea v-model:value="form.closeNote" :rows="3" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </template>
    <template #footer>
      <a-space v-if="props.item" wrap>
        <a-button danger @click="routeTo('exception')">转异常</a-button>
        <a-button @click="routeTo('qa')">转Q&A</a-button>
        <a-button @click="routeTo('requirement')">转需求</a-button>
        <a-button @click="routeTo('close')">直接关闭</a-button>
        <a-button type="primary" @click="saveItem">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<style scoped>
.detail-head {
  margin-bottom: 16px;
}

.detail-card {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgb(15 23 42 / 8%);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-grid-item {
  display: grid;
  gap: 6px;
  min-height: 84px;
  padding: 14px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  background: #fff;
}

.detail-grid-item span {
  color: #667085;
  font-size: 13px;
}

.detail-grid-item strong {
  color: #101828;
  line-height: 1.5;
}

.feedback-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  background: #fff;
}

.feedback-card p {
  margin: 4px 0 0;
  color: #475467;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .feedback-card {
    flex-direction: column;
  }
}
</style>
