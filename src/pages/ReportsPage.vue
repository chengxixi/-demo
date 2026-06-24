<script setup lang="ts">
import { ref } from 'vue'
import { reportData } from '@/api/mock-data'
import { FileText, Download, ExternalLink } from 'lucide-vue-next'

const toast = ref<string | null>(null)
function showToast(msg: string) {
  toast.value = msg
  setTimeout(() => { toast.value = null }, 2500)
}

function viewReport(title: string) {
  showToast(`正在打开报告：${title}`)
}

function downloadReport(title: string) {
  showToast(`下载中：${title}.pdf`)
}

function getTypeClass(type: string) {
  if (type === '周报') return 'bg-blue-100 text-blue-700'
  if (type === '月报') return 'bg-green-100 text-green-700'
  return 'bg-purple-100 text-purple-700'
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="text-lg font-extrabold text-gray-900">报告中心</h2>
      <p class="text-xs text-gray-400 mt-0.5">用户反馈周/月报、异常统计分析和有效信息转需求清单。</p>
    </div>
    <div class="flex-1 overflow-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="report in reportData"
          :key="report.id"
          class="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-3"
        >
          <div class="flex items-start justify-between">
            <FileText class="w-6 h-6 text-blue-500" />
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold" :class="getTypeClass(report.type)">
              {{ report.type }}
            </span>
          </div>
          <h3 class="text-sm font-extrabold text-gray-900">{{ report.title }}</h3>
          <p class="text-[11px] text-gray-500 font-bold">{{ report.period }}</p>
          <p class="text-xs text-gray-600 leading-relaxed line-clamp-2">{{ report.summary }}</p>
          <div class="flex items-center gap-2 mt-auto pt-3 border-t border-gray-100">
            <button class="btn-secondary text-[11px] flex items-center gap-1" @click="viewReport(report.title)">
              <ExternalLink class="w-3 h-3" /> 查看详情
            </button>
            <button class="btn-primary text-[11px] flex items-center gap-1" @click="downloadReport(report.title)">
              <Download class="w-3 h-3" /> 下载报告
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast" class="fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white bg-blue-600">
      {{ toast }}
    </div>
  </div>
</template>
