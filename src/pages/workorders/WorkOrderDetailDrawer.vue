<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { feedbackData } from '@/api/mock'
import type { FeedbackItem, WorkOrder } from '@/types'

const props = defineProps<{
  open: boolean
  item: WorkOrder | null
}>()

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'save', value: WorkOrder): void
  (event: 'route', value: { order: WorkOrder; route: 'requirement' | 'exception' | 'qa' | 'close'; exceptionLevel?: string; exceptionOwner?: string }): void
}>()

const actionMode = shallowRef<'requirement' | 'exception' | 'qa' | 'close' | ''>('')
const exceptionOpen = shallowRef(false)

const form = reactive({
  status: '',
  owner: '',
  result: '',
  closeNote: '',
  processedAt: '',
  exceptionLevel: 'P1',
  exceptionOwner: '刘海洲',
})

const relatedFeedbackIds = computed<string[]>(() => {
  const raw = props.item?.relatedFeedback || ''
  return raw.match(/[A-Z]{2}-\d{8}-\d{4}/g) || []
})

const relatedFeedbackRows = computed<FeedbackItem[]>(() => {
  if (!relatedFeedbackIds.value.length) return []
  return feedbackData.filter((item) => relatedFeedbackIds.value.includes(item.id))
})

const isClosedOrder = computed(() => props.item?.status === '已直接关闭' || Boolean(props.item?.closeNote))

const workOrderRoute = computed(() => {
  const item = props.item
  if (!item) return '-'
  if (item.status === '已直接关闭' || item.closeNote) return '直接关闭'
  if (item.exception === '是') return '已流转紧急异常处理'
  if (item.requirement === '是' || item.requirement === '预留') return '已转需求'
  if (item.qa === '是') return '已转Q&A'
  return item.status || '处理中'
})


const stepCurrent = computed(() => {
  if (!props.item) return 0
  if (props.item.status === '已直接关闭' || ['已转需求', '已转Q&A', '转异常', '已流转紧急异常处理'].includes(props.item.status)) return 2
  if (props.item.status.includes('处理')) return 1
  return 0
})

const resultDisplay = computed(() => {
  const item = props.item
  if (!item) return { label: '-', href: '' }
  if (item.status === '已直接关闭' || item.closeNote) return { label: '已直接关闭', href: '' }
  if (item.exception === '是' || item.status === '已流转紧急异常处理') return { label: '已流转紧急异常处理', href: '#/emergency' }
  if (item.requirement === '是' || item.requirement === '预留' || item.status === '已转需求') return { label: '已流转需求', href: '#/requirements' }
  if (item.qa === '是' || item.status === '已转Q&A') return { label: '已流转Q&A', href: '#/knowledge' }
  return { label: item.result || '待处理', href: '' }
})

const detailCards = computed(() => {
  if (!props.item) return []
  return [
    { label: '工单摘要', value: props.item.summary || '待补充工单摘要' },
    { label: '当前处理人', value: props.item.owner || '-' },
    { label: '处理状态', value: props.item.status || '-' },
    { label: '处理去向', value: workOrderRoute.value },
    { label: '流入操作人', value: props.item.inflowOperator || props.item.owner || '-' },
    { label: '流入时间', value: props.item.inflowTime || '-' },
    { label: '处理时间', value: props.item.processedAt || '-' },
  ]
})

watch(
  () => props.item,
  (item) => {
    form.status = item?.status || ''
    form.owner = item?.owner || ''
    form.result = item?.result || ''
    form.closeNote = item?.closeNote || ''
    form.processedAt = item?.processedAt || ''
    form.exceptionLevel = item?.exceptionLevel || 'P1'
    form.exceptionOwner = item?.exceptionOwner || '刘海洲'
    actionMode.value = item?.status === '已直接关闭' ? 'close' : ''
  },
  { immediate: true },
)

function closeDrawer() {
  emit('update:open', false)
}

function currentMinute() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ')
}

function saveItem() {
  if (!props.item) {
    closeDrawer()
    return
  }

  emit('save', {
    ...props.item,
    status: actionMode.value === 'close' ? '已直接关闭' : props.item.status,
    owner: form.owner,
    result: resultDisplay.value.label,
    closeNote: form.closeNote,
    processedAt: form.processedAt || (form.result.trim() || actionMode.value === 'close' ? currentMinute() : props.item.processedAt),
  })
  closeDrawer()
}

function routeTo(route: 'requirement' | 'exception' | 'qa' | 'close') {
  if (!props.item) return
  if (route === 'exception') {
    exceptionOpen.value = true
    return
  }
  if (route === 'close') {
    actionMode.value = 'close'
    form.status = '已直接关闭'
    return
  }
  emit('route', { order: props.item, route })
  closeDrawer()
}

function confirmExceptionRoute() {
  if (!props.item) return
  emit('route', {
    order: props.item,
    route: 'exception',
    exceptionLevel: form.exceptionLevel,
    exceptionOwner: form.exceptionOwner,
  })
  exceptionOpen.value = false
  closeDrawer()
}
</script>

<template>
  <section v-if="props.open && props.item" class="workorder-detail-page">
    <template v-if="props.item">
      <div class="detail-head">
        <a-button @click="closeDrawer">返回工单池</a-button>
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
        <a-steps :current="stepCurrent" size="small">
          <a-step title="转工单" />
          <a-step title="处理中" />
          <a-step title="已处理" />
        </a-steps>
      </a-card>

      <a-card :bordered="false" class="detail-card mb-4" title="关联反馈明细">
        <a-empty v-if="!relatedFeedbackRows.length" description="暂无可匹配的关联反馈明细" />
        <a-space v-else direction="vertical" size="middle" class="w-full">
          <article v-for="feedback in relatedFeedbackRows" :key="feedback.id" class="feedback-card">
            <div class="feedback-main">
              <a-typography-text strong>{{ feedback.id }} · {{ feedback.level3 || feedback.level2 }}</a-typography-text>
              <p>分类：{{ feedback.level1 }} / {{ feedback.level2 }} / {{ feedback.level3 }}</p>
              <p>参数：{{ feedback.region || '-' }} / {{ feedback.source }} / {{ feedback.brand }} / {{ feedback.site }} / {{ feedback.productType }} / {{ feedback.model }} / {{ feedback.internal }}</p>
              <p>反馈：{{ feedback.ai || feedback.raw }}</p>
              <p>退换货：{{ feedback.returned || '-' }}；反馈人：{{ feedback.feedbackUser || '-' }}；反馈时间：{{ feedback.date || '-' }}</p>
            </div>
            <a-space wrap>
              <a-tag>{{ feedback.source }}</a-tag>
              <a-tag>{{ feedback.exception }}</a-tag>
            </a-space>
          </article>
        </a-space>
      </a-card>

      <a-form layout="vertical">
        <a-row :gutter="12">
          <a-col :xs="24" :md="12">
            <a-form-item label="负责人">
              <a-input v-model:value="form.owner" />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :md="12">
            <a-form-item label="处理时间">
              <a-input v-model:value="form.processedAt" placeholder="处理完成后自动记录" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="处理结果">
              <a-typography-link v-if="resultDisplay.href" :href="resultDisplay.href">
                {{ resultDisplay.label }}
              </a-typography-link>
              <a-typography-text v-else strong>{{ resultDisplay.label }}</a-typography-text>
            </a-form-item>
          </a-col>
          <a-col v-if="actionMode === 'close'" :span="24">
            <a-form-item label="关闭说明">
              <a-textarea v-model:value="form.closeNote" :rows="3" placeholder="选择直接关闭时填写关闭说明" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </template>
    <a-modal v-model:open="exceptionOpen" title="流转紧急异常" @ok="confirmExceptionRoute">
      <a-form layout="vertical">
        <a-form-item label="异常等级">
          <a-select v-model:value="form.exceptionLevel" :options="['P0', 'P1'].map((item) => ({ label: item, value: item }))" />
        </a-form-item>
        <a-form-item label="异常处理人">
          <a-select v-model:value="form.exceptionOwner" :options="['刘海洲', '陈华军'].map((item) => ({ label: item, value: item }))" />
        </a-form-item>
      </a-form>
    </a-modal>

    <div class="detail-actions">
      <a-space v-if="props.item" wrap>
        <template v-if="!isClosedOrder">
          <a-button @click="routeTo('close')">直接关闭</a-button>
          <a-button @click="routeTo('requirement')">流转需求</a-button>
          <a-button @click="routeTo('qa')">流转Q&A</a-button>
          <a-button @click="routeTo('exception')">流转紧急异常</a-button>
        </template>
        <a-button type="primary" @click="saveItem">保存</a-button>
      </a-space>
    </div>
  </section>
</template>

<style scoped>
.workorder-detail-page {
  min-height: calc(100vh - 96px);
  padding: 4px 0 24px;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
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

.feedback-main {
  min-width: 0;
}

.feedback-card p {
  margin: 4px 0 0;
  color: #475467;
  line-height: 1.6;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
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
