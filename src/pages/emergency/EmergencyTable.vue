<template>
  <div class="space-y-4">
    <div
      v-for="ex in exceptions"
      :key="ex.id"
      class="bg-white border rounded-lg overflow-hidden transition-shadow hover:shadow-md"
      :class="ex.overdue ? 'border-l-4 border-l-red-500 bg-red-50/30' : 'border-gray-200'"
    >
      <!-- Card Top -->
      <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-3 flex-wrap">
        <span :class="levelClass(ex.level)">{{ ex.level }}</span>
        <span class="text-sm font-extrabold text-gray-900">{{ ex.id }}</span>
        <span
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
          :class="ex.overdue ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'"
        >{{ ex.status }}</span>
        <span
          v-if="ex.overdue"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white"
        >
          <Clock class="w-3 h-3" />
          超时
        </span>
        <span class="ml-auto text-xs font-bold text-gray-500">
          <Clock class="w-3 h-3 inline mr-1" />
          {{ ex.deadline }}
        </span>
      </div>

      <!-- Card Body -->
      <div class="px-5 py-4">
        <h3 class="text-base font-extrabold text-gray-900 mb-3">{{ ex.issue }}</h3>

        <!-- Meta Grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-2 mb-4">
          <div class="text-xs">
            <span class="text-gray-400 font-bold">区域</span>
            <p class="font-bold text-gray-700">{{ ex.region }}</p>
          </div>
          <div class="text-xs">
            <span class="text-gray-400 font-bold">站点</span>
            <p class="font-bold text-gray-700">{{ ex.site }}</p>
          </div>
          <div class="text-xs">
            <span class="text-gray-400 font-bold">产品线</span>
            <p class="font-bold text-gray-700">{{ ex.productLine }}</p>
          </div>
          <div class="text-xs">
            <span class="text-gray-400 font-bold">内部型号</span>
            <p class="font-bold text-gray-700">{{ ex.internal }}</p>
          </div>
          <div class="text-xs">
            <span class="text-gray-400 font-bold">创建人</span>
            <p class="font-bold text-gray-700">{{ ex.creator }}</p>
          </div>
          <div class="text-xs">
            <span class="text-gray-400 font-bold">维度</span>
            <p class="font-bold text-gray-700">{{ ex.dimension }}</p>
          </div>
          <div class="text-xs">
            <span class="text-gray-400 font-bold">来源</span>
            <p class="font-bold text-gray-700">{{ ex.source }}</p>
          </div>
          <div class="text-xs">
            <span class="text-gray-400 font-bold">负责人</span>
            <p class="font-bold text-gray-700">{{ ex.owner }}</p>
          </div>
          <div class="text-xs">
            <span class="text-gray-400 font-bold">团队</span>
            <p class="font-bold text-gray-700">{{ ex.team }}</p>
          </div>
        </div>

        <!-- Impact & Action -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div class="bg-gray-50 rounded-md px-3 py-2">
            <span class="text-xs font-bold text-gray-400">影响范围</span>
            <p class="text-sm font-bold text-gray-700 mt-0.5">{{ ex.impactScope }}</p>
          </div>
          <div class="bg-gray-50 rounded-md px-3 py-2">
            <span class="text-xs font-bold text-gray-400">处理动作</span>
            <p class="text-sm font-bold text-gray-700 mt-0.5">{{ ex.action }}</p>
          </div>
        </div>

        <!-- Associated Feedback -->
        <div class="mb-4 text-xs">
          <span class="font-bold text-gray-400">关联反馈: </span>
          <span class="font-bold text-blue-600">{{ ex.feedback }}</span>
        </div>

        <!-- 5-Step Process Indicator -->
        <div class="mb-4">
          <div class="flex items-center gap-1 mb-2">
            <div v-for="(label, idx) in stepLabels" :key="idx" class="flex-1">
              <div class="h-1.5 rounded-full transition-colors" :class="idx < ex.step ? 'bg-green-500' : 'bg-gray-200'"></div>
              <span class="block text-[10px] font-bold mt-1 text-center" :class="idx < ex.step ? 'text-green-600' : 'text-gray-400'">{{ label }}</span>
            </div>
          </div>
        </div>

        <!-- Plan Section -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div class="rounded-md px-3 py-2 border" :class="ex.tempPlan ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'">
            <span class="text-xs font-bold text-gray-400">临时方案</span>
            <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.tempPlan || '待填写' }}</p>
          </div>
          <div class="rounded-md px-3 py-2 border" :class="ex.rootCause && ex.rootCause !== '待根因分析' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'">
            <span class="text-xs font-bold text-gray-400">根因分析</span>
            <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.rootCause || '待填写' }}</p>
          </div>
          <div class="rounded-md px-3 py-2 border" :class="ex.fixPlan && ex.fixPlan !== '待整改措施' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'">
            <span class="text-xs font-bold text-gray-400">整改措施</span>
            <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.fixPlan || '待填写' }}</p>
          </div>
          <div class="rounded-md px-3 py-2 border" :class="ex.verifyResult && ex.verifyResult !== '待验证' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'">
            <span class="text-xs font-bold text-gray-400">验证结果</span>
            <p class="text-xs font-bold text-gray-700 mt-0.5">{{ ex.verifyResult || '待验证' }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 border-t border-gray-100 pt-3">
          <button class="btn-secondary text-xs flex items-center" @click="handleOpenDetail(ex)">
            查看详情
            <ChevronRight class="w-3.5 h-3.5 ml-1" />
          </button>
          <button class="btn-primary text-xs" @click="handleOpenDetail(ex)">添加处置</button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="exceptions.length === 0" class="bg-white border border-gray-200 rounded-lg py-16 text-center">
      <AlertTriangle class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="text-sm font-bold text-gray-400">暂无匹配的紧急异常。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, Clock, ChevronRight } from 'lucide-vue-next'
import type { EmergencyException } from '@/types'

defineProps<{
  exceptions: EmergencyException[]
  stepLabels: string[]
}>()

const emit = defineEmits<{
  'open-detail': [ex: EmergencyException]
}>()

function handleOpenDetail(ex: EmergencyException) {
  emit('open-detail', ex)
}

function levelClass(level: string): string {
  if (level === 'P0') return 'level-p0'
  if (level === 'P1') return 'level-p1'
  return 'bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-black'
}
</script>
