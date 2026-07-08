<script setup lang="ts">
import { computed } from 'vue'
import { ExternalLink, FileText, Lock, RefreshCw } from 'lucide-vue-next'

type ReportTab = 'feedback' | 'competitor'
type ReportRow = { title: string; period: string; owner: string; status: string; type: string }

const props = defineProps<{
  feedbackHistory: ReportRow[]
  competitorHistory: ReportRow[]
  activeTab: ReportTab
}>()

const emit = defineEmits<{
  'update:activeTab': [value: ReportTab]
  preview: [type: ReportTab]
}>()

const activeKey = computed({
  get: () => props.activeTab,
  set: (value: ReportTab) => emit('update:activeTab', value),
})

const activeRows = computed(() =>
  props.activeTab === 'feedback' ? props.feedbackHistory : props.competitorHistory,
)

function statusColor(status: string) {
  if (status === '刷新中') return 'blue'
  if (status === '已冻结') return 'default'
  return 'green'
}

function statusIcon(status: string) {
  if (status === '刷新中') return RefreshCw
  if (status === '已冻结') return Lock
  return FileText
}

function handlePreview() {
  emit('preview', props.activeTab)
}
</script>

<template>
  <a-tabs v-model:active-key="activeKey" class="reports-tabs">
    <a-tab-pane key="feedback" tab="用户反馈月报" />
    <a-tab-pane key="competitor" tab="竞品分析月报" />
  </a-tabs>

  <div class="flex-1 overflow-auto p-6 space-y-4">
    <section class="bg-white border border-gray-200 rounded-lg p-5">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <FileText class="w-5 h-5 text-blue-500" />
            <h3 class="text-base font-extrabold text-gray-900">
              {{ activeTab === 'feedback' ? '用户反馈月报' : '竞品分析月报' }}
            </h3>
          </div>
          <p class="text-xs text-gray-600 leading-relaxed mt-1">
            {{ activeTab === 'feedback'
              ? '汇总反馈量、反馈率、差评率、问题分类、处理去向和重点案例。'
              : '按产品线生成竞品分析报告，覆盖市场动态、拆机分析和品牌影响评估。' }}
          </p>
        </div>
        <a-button type="primary" size="small" class="flex items-center gap-1" @click="handlePreview">
          <ExternalLink class="w-3.5 h-3.5" />
          查看当前月报
        </a-button>
      </div>
    </section>

    <section class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-200">
        <h3 class="text-sm font-extrabold text-gray-900">历史报告</h3>
      </div>
      <vxe-table :data="activeRows" border="inner" size="mini" stripe show-overflow :export-config="{}">
        <vxe-column field="title" title="报告名称" min-width="220" />
        <vxe-column field="type" title="类型" width="120" />
        <vxe-column field="period" title="周期" width="180" />
        <vxe-column field="owner" title="负责人" width="120" />
        <vxe-column field="status" title="状态" width="120">
          <template #default="{ row }">
            <a-tag :color="statusColor(row.status)">
              <component :is="statusIcon(row.status)" class="w-3 h-3 inline mr-0.5" />
              {{ row.status }}
            </a-tag>
          </template>
        </vxe-column>
        <vxe-column title="操作" width="100" align="center" fixed="right">
          <template #default>
            <a-button size="small" @click="handlePreview">查看</a-button>
          </template>
        </vxe-column>
      </vxe-table>
    </section>
  </div>
</template>

<style scoped>
.reports-tabs {
  flex-shrink: 0;
  padding: 0 24px;
  background: #fff;
}
</style>
