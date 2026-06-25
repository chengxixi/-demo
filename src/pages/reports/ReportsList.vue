<script setup lang="ts">
import { FileText, RefreshCw, Lock, ExternalLink } from 'lucide-vue-next'

defineProps<{
  feedbackHistory: Array<{ title: string; period: string; owner: string; status: string; type: string }>
  competitorHistory: Array<{ title: string; period: string; owner: string; status: string; type: string }>
  activeTab: 'feedback' | 'competitor'
}>()

const emit = defineEmits<{
  'update:activeTab': [value: 'feedback' | 'competitor']
  preview: [type: 'feedback' | 'competitor']
}>()

function statusClass(status: string) {
  if (status === '刷新中') return 'bg-blue-100 text-blue-700'
  if (status === '已冻结') return 'bg-gray-100 text-gray-600'
  return 'bg-green-100 text-green-700'
}

function statusIcon(status: string) {
  if (status === '刷新中') return RefreshCw
  if (status === '已冻结') return Lock
  return FileText
}

function handleTabClick(tab: 'feedback' | 'competitor') {
  emit('update:activeTab', tab)
}

function handlePreview(type: 'feedback' | 'competitor') {
  emit('preview', type)
}
</script>

<template>
  <!-- Tabs -->
  <div class="px-6 pt-4 flex items-center gap-0 border-b border-gray-200 flex-shrink-0">
    <button
      class="px-4 py-2 text-xs font-extrabold border-b-2 transition-colors -mb-px"
      :class="activeTab === 'feedback' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
      @click="handleTabClick('feedback')"
    >用户反馈月报</button>
    <button
      class="px-4 py-2 text-xs font-extrabold border-b-2 transition-colors -mb-px"
      :class="activeTab === 'competitor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
      @click="handleTabClick('competitor')"
    >竞品分析月报</button>
  </div>

  <!-- ==================== Tab 1: 用户反馈月报 ==================== -->
  <div v-if="activeTab === 'feedback'" class="flex-1 overflow-auto p-6 space-y-4">
    <!-- Panel Card -->
    <div class="bg-white border border-gray-200 rounded-lg p-5">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <FileText class="w-5 h-5 text-blue-500" />
            <h3 class="text-base font-extrabold text-gray-900">用户反馈月报</h3>
          </div>
          <p class="text-xs text-gray-600 leading-relaxed mt-1">汇总反馈量、反馈率、差评率、问题分类、处理去向、退换货与重点案例。</p>
          <div class="flex items-center gap-3 mt-3 text-[11px]">
            <span class="text-gray-400 font-bold">2026-06</span>
            <span class="text-gray-300">|</span>
            <span class="text-gray-400 font-bold">每日 02:00 刷新</span>
            <span class="text-gray-300">|</span>
            <span class="text-gray-400 font-bold">月末冻结</span>
          </div>
        </div>
        <button class="btn-primary text-xs h-8 px-4 flex items-center gap-1" @click="handlePreview('feedback')">
          <ExternalLink class="w-3.5 h-3.5" /> 查看当前月报
        </button>
      </div>
    </div>

    <!-- Auto Generate Rule -->
    <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
      <h4 class="text-xs font-extrabold text-blue-700 mb-1">自动生成规则</h4>
      <p class="text-[11px] text-gray-600 leading-relaxed">系统每月 1 日自动创建当月报告；每日上午刷新数据；月末 24:00 冻结归档。无需手动创建、自动刷新、冻结后只读。</p>
    </div>

    <!-- History List -->
    <div>
      <h3 class="text-sm font-extrabold text-gray-900 mb-3">历史报告</h3>
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">报告名称</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">类型</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">周期</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">负责人</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">状态</th>
              <th class="text-center px-3 py-2.5 font-extrabold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in feedbackHistory" :key="i" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-3 py-2.5 font-extrabold text-gray-900">{{ r.title }}</td>
              <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.type }}</td>
              <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.period }}</td>
              <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.owner }}</td>
              <td class="px-3 py-2.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold" :class="statusClass(r.status)">
                  <component :is="statusIcon(r.status)" class="w-3 h-3 inline mr-0.5" />{{ r.status }}
                </span>
              </td>
              <td class="px-3 py-2.5 text-center">
                <button class="btn-secondary text-[11px] h-6 px-3" @click="handlePreview('feedback')">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- ==================== Tab 2: 竞品分析月报 ==================== -->
  <div v-if="activeTab === 'competitor'" class="flex-1 overflow-auto p-6 space-y-4">
    <div class="bg-white border border-gray-200 rounded-lg p-5">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <FileText class="w-5 h-5 text-purple-500" />
            <h3 class="text-base font-extrabold text-gray-900">竞品分析月报</h3>
          </div>
          <p class="text-xs text-gray-600 leading-relaxed mt-1">按产品线生成完整竞品分析报告，品牌竞品/ODM竞品各输出一份，涵盖市场动态、拆机分析和品牌影响评估。</p>
          <div class="flex items-center gap-3 mt-3 text-[11px]">
            <span class="text-gray-400 font-bold">2026-06</span>
            <span class="text-gray-300">|</span>
            <span class="text-gray-400 font-bold">八电极秤 / 体脂秤 / 筋膜枪</span>
            <span class="text-gray-300">|</span>
            <span class="text-gray-400 font-bold">品牌竞品 + ODM竞品</span>
          </div>
        </div>
        <button class="btn-primary text-xs h-8 px-4 flex items-center gap-1" @click="handlePreview('competitor')">
          <ExternalLink class="w-3.5 h-3.5" /> 查看当前月报
        </button>
      </div>
    </div>

    <div class="bg-purple-50 border border-purple-100 rounded-lg p-4">
      <h4 class="text-xs font-extrabold text-purple-700 mb-1">生成规则</h4>
      <p class="text-[11px] text-gray-600 leading-relaxed">按产品线生成完整报告，品牌竞品/ODM竞品各输出一份。包含重点结论、竞品动态、用户反馈分析、拆机分析和品牌影响评估。</p>
    </div>

    <div>
      <h3 class="text-sm font-extrabold text-gray-900 mb-3">历史报告</h3>
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">报告名称</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">类型</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">周期</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">负责人</th>
              <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">状态</th>
              <th class="text-center px-3 py-2.5 font-extrabold text-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in competitorHistory" :key="i" class="border-b border-gray-100 hover:bg-gray-50">
              <td class="px-3 py-2.5 font-extrabold text-gray-900">{{ r.title }}</td>
              <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.type }}</td>
              <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.period }}</td>
              <td class="px-3 py-2.5 font-bold text-gray-600">{{ r.owner }}</td>
              <td class="px-3 py-2.5">
                <span class="px-2 py-0.5 rounded text-[10px] font-extrabold" :class="statusClass(r.status)">
                  <component :is="statusIcon(r.status)" class="w-3 h-3 inline mr-0.5" />{{ r.status }}
                </span>
              </td>
              <td class="px-3 py-2.5 text-center">
                <button class="btn-secondary text-[11px] h-6 px-3" @click="handlePreview('competitor')">查看</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
