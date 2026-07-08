<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { FeedbackItem } from '@/types'
import { feedbackData } from '@/api/mock'
import FeedbackAddModal from './feedback/FeedbackAddModal.vue'
import FeedbackBatchCloseModal from './feedback/FeedbackBatchCloseModal.vue'
import FeedbackFilter from './feedback/FeedbackFilter.vue'
import FeedbackImportModal from './feedback/FeedbackImportModal.vue'
import FeedbackReviewModal from './feedback/FeedbackReviewModal.vue'
import FeedbackTable from './feedback/FeedbackTable.vue'
import FeedbackTemplateModal from './feedback/FeedbackTemplateModal.vue'

const router = useRouter()
const items = ref<FeedbackItem[]>([...feedbackData])
const selectedIds = ref<Set<string>>(new Set())
const activeTab = ref('all')
const addOpen = ref(false)
const reviewOpen = ref(false)
const templateOpen = ref(false)
const importOpen = ref(false)
const batchCloseOpen = ref(false)
const currentItem = ref<FeedbackItem | null>(null)

const filters = ref({
  keyword: '',
  source: '',
  processState: '',
  exception: '',
  brand: '',
  site: '',
  productType: '',
  model: '',
  feedbackUser: '',
  processRoute: '',
})

const tabOptions = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'review', label: '待人工复核' },
  { key: 'done', label: '已处理' },
  { key: 'mine', label: '我的反馈' },
]

const filteredItems = computed(() => {
  return items.value.filter((item) => {
    const keyword = filters.value.keyword.trim().toLowerCase()
    const text = [
      item.id,
      item.brand,
      item.site,
      item.model,
      item.internal,
      item.asin,
      item.orderNo,
      item.raw,
      item.ai,
      item.feedbackUser,
      item.handler,
    ]
      .join(' ')
      .toLowerCase()

    const matchesKeyword = !keyword || text.includes(keyword)
    const matchesSource = !filters.value.source || item.source === filters.value.source
    const matchesState =
      !filters.value.processState ||
      item.processState === filters.value.processState ||
      (filters.value.processState === '待人工复核' && item.processState === '待复核')
    const matchesException = !filters.value.exception || item.exception === filters.value.exception
    const matchesBrand = !filters.value.brand || item.brand === filters.value.brand
    const matchesSite = !filters.value.site || item.site === filters.value.site
    const matchesProductType = !filters.value.productType || item.productType === filters.value.productType
    const matchesModel = !filters.value.model || item.model === filters.value.model
    const matchesFeedbackUser = !filters.value.feedbackUser || item.feedbackUser.includes(filters.value.feedbackUser)
    const matchesProcessRoute = !filters.value.processRoute || item.processRoute === filters.value.processRoute
    const matchesTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'pending' && item.processState === '待处理') ||
      (activeTab.value === 'review' && ['待复核', '待人工复核'].includes(item.processState)) ||
      (activeTab.value === 'done' && item.processState === '已处理') ||
      (activeTab.value === 'mine' && item.handler === '李工')

    return (
      matchesKeyword &&
      matchesSource &&
      matchesState &&
      matchesException &&
      matchesBrand &&
      matchesSite &&
      matchesProductType &&
      matchesModel &&
      matchesFeedbackUser &&
      matchesProcessRoute &&
      matchesTab
    )
  })
})

const feedbackStats = computed(() => {
  const mergeGroups = new Set(
    items.value
      .map((item) => item.mergeGroup)
      .filter(Boolean),
  )

  return [
    {
      title: '反馈总数',
      value: items.value.length,
      note: '覆盖商品评论、退货反馈、APP反馈、客服沟通',
    },
    {
      title: '合并组',
      value: mergeGroups.size,
      note: '同类问题可展开合并处理',
    },
    {
      title: '待处理',
      value: items.value.filter((item) => item.processState === '待处理').length,
      note: '需要分派、转异常或转需求',
    },
    {
      title: '待复核',
      value: items.value.filter((item) => ['待复核', '待人工复核'].includes(item.processState)).length,
      note: '等待人工确认分类和处理去向',
    },
  ]
})

const selectedItems = computed(() => {
  return items.value.filter((item) => selectedIds.value.has(item.id))
})

function openDetail(item: FeedbackItem) {
  router.push(`/feedback/detail/${encodeURIComponent(item.id)}`)
}

function openMergeDetail(groupId: string) {
  router.push(`/feedback/merge/${encodeURIComponent(groupId)}`)
}

function openReview(item: FeedbackItem) {
  currentItem.value = item
  reviewOpen.value = true
}

function addFeedback(item: FeedbackItem) {
  items.value = [item, ...items.value]
  message.success('反馈已新增')
}

function updateFeedback(item: FeedbackItem) {
  items.value = items.value.map((row) => (row.id === item.id ? item : row))
  message.success('反馈已更新')
}

function toggleSelect(id: string) {
  const next = new Set(selectedIds.value)

  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  selectedIds.value = next
}

function toggleSelectMany(ids: string[]) {
  const next = new Set(selectedIds.value)
  const allSelected = ids.every((id) => next.has(id))

  ids.forEach((id) => {
    if (allSelected) {
      next.delete(id)
    } else {
      next.add(id)
    }
  })
  selectedIds.value = next
}

function toggleSelectAll() {
  if (selectedIds.value.size === filteredItems.value.length) {
    selectedIds.value = new Set()
    return
  }

  selectedIds.value = new Set(filteredItems.value.map((item) => item.id))
}

function batchClose() {
  if (selectedIds.value.size === 0) {
    message.info('请先选择反馈')
    return
  }

  batchCloseOpen.value = true
}

function confirmBatchClose(payload: { route: string; closeReason: string; qa: boolean }) {
  items.value = items.value.map((item) => {
    if (!selectedIds.value.has(item.id)) {
      return item
    }

    return {
      ...item,
      processRoute: payload.route,
      processState: '已处理',
      solution: payload.closeReason || item.solution || '批量关闭确认',
      note: payload.qa ? '已同步沉淀Q&A' : item.note,
    }
  })
  selectedIds.value = new Set()
  message.success('已批量关闭')
}

function submitImport() {
  message.success('导入任务已创建，需复核的数据会进入待人工复核')
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-row :gutter="[12, 12]" align="middle" justify="space-between">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">反馈清单</a-typography-title>
          <a-typography-text type="secondary">
            按来源汇聚反馈，支持同类问题合并展开、复核、转异常、转需求和批量关闭。
          </a-typography-text>
        </a-space>
      </a-col>
      <a-col>
        <a-space>
          <a-button @click="templateOpen = true">我的模板设置</a-button>
          <a-button @click="importOpen = true">批量导入</a-button>
          <a-button @click="batchClose">批量关闭</a-button>
          <a-button type="primary" @click="addOpen = true">新增反馈</a-button>
        </a-space>
      </a-col>
    </a-row>

    <a-row :gutter="[12, 12]">
      <a-col v-for="stat in feedbackStats" :key="stat.title" :xs="12" :lg="6">
        <a-card size="small" :bordered="false" class="feedback-stat-card">
          <a-statistic :title="stat.title" :value="stat.value" />
          <a-typography-text type="secondary">{{ stat.note }}</a-typography-text>
        </a-card>
      </a-col>
    </a-row>

    <a-tabs v-model:active-key="activeTab">
      <a-tab-pane v-for="tab in tabOptions" :key="tab.key" :tab="tab.label" />
    </a-tabs>

    <FeedbackFilter v-model:filters="filters" />

    <FeedbackTable
      :items="filteredItems"
      :selected-ids="selectedIds"
      @toggle-select="toggleSelect"
      @toggle-select-many="toggleSelectMany"
      @toggle-select-all="toggleSelectAll"
      @open-detail="openDetail"
      @open-merge="openMergeDetail"
      @manual-review="openReview"
    />

    <FeedbackAddModal v-model:open="addOpen" @add="addFeedback" />
    <FeedbackImportModal v-model:open="importOpen" @submit="submitImport" />
    <FeedbackBatchCloseModal
      v-model:open="batchCloseOpen"
      :items="selectedItems"
      @confirm="confirmBatchClose"
    />
    <FeedbackReviewModal v-model:open="reviewOpen" :item="currentItem" @save="updateFeedback" />
    <FeedbackTemplateModal v-model:open="templateOpen" />
  </section>
</template>

<style scoped>
.feedback-stat-card {
  border-radius: 8px;
  min-height: 122px;
}
</style>
