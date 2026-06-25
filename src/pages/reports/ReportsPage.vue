<script setup lang="ts">
import { ref } from 'vue'
import ReportsList from './ReportsList.vue'
import ReportsPreview from './ReportsPreview.vue'

const activeTab = ref<'feedback' | 'competitor'>('feedback')
const showPreview = ref(false)
const previewType = ref<'feedback' | 'competitor'>('feedback')

const toast = ref<{ msg: string; type: string } | null>(null)
function showToast(msg: string, type = 'info') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 2500)
}

const feedbackHistory = [
  { title: '用户反馈月报', period: '2026-06', owner: '产品经理', status: '刷新中', type: '月报' },
  { title: '用户反馈月报', period: '2026-05', owner: '产品经理', status: '已冻结', type: '月报' },
  { title: '用户反馈月报', period: '2026-04', owner: '产品经理', status: '已归档', type: '月报' },
]

const competitorHistory = [
  { title: '竞品分析月报', period: '2026-06', owner: '产品经理', status: '刷新中', type: '月报' },
  { title: '竞品分析月报', period: '2026-05', owner: '产品经理', status: '已冻结', type: '月报' },
  { title: '竞品分析月报', period: '2026-04', owner: '产品经理', status: '已归档', type: '月报' },
]

function handlePreview(type: 'feedback' | 'competitor') {
  previewType.value = type
  showPreview.value = true
}

function handleClosePreview() {
  showPreview.value = false
}

function handleDownload() {
  showToast('下载中...', 'success')
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="text-lg font-extrabold text-gray-900">报告中心</h2>
      <p class="text-xs text-gray-400 mt-0.5">系统每月初自动创建两类月报，每日刷新，月末冻结；默认展示用户反馈月报。</p>
    </div>

    <ReportsList
      v-model:activeTab="activeTab"
      :feedbackHistory="feedbackHistory"
      :competitorHistory="competitorHistory"
      @preview="handlePreview"
    />

    <ReportsPreview
      :visible="showPreview"
      :reportType="previewType"
      @close="handleClosePreview"
      @download="handleDownload"
    />

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-[60] px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white" :class="toast.type === 'warning' ? 'bg-orange-500' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'">{{ toast.msg }}</div>
  </div>
</template>
