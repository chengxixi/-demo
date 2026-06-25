<template>
  <div v-if="order" class="flex-1 overflow-auto p-6 bg-gray-50">
    <div class="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg">
      <!-- Detail Header -->
      <div class="flex items-start justify-between px-5 py-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div>
          <h2 class="text-lg font-extrabold text-gray-900">{{ order.id }}</h2>
          <p class="text-xs text-gray-500 mt-1">
            关联反馈 <span class="font-extrabold text-blue-600">{{ order.relatedFeedback }}</span>
            / {{ order.status }} / {{ order.owner }}
          </p>
        </div>
        <button class="btn-secondary text-xs flex items-center gap-1 h-7 px-3" @click="handleClose">
          <ArrowLeft class="w-3 h-3" /> 返回列表
        </button>
      </div>

      <div class="p-5 space-y-4">
        <!-- Info Grid -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100 col-span-2">
            <span class="block text-[11px] font-bold text-gray-500">AI工单摘要</span>
            <p class="mt-1 text-xs text-gray-700 font-bold leading-relaxed line-clamp-2">{{ order.aiAbstract || order.summary }}</p>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">当前处理人</span>
            <strong class="block mt-1 text-sm">{{ order.owner }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">处理状态</span>
            <strong class="block mt-1 text-sm">{{ order.status }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">处理去向</span>
            <strong class="block mt-1 text-sm">{{ getRoute(order) }}</strong>
          </div>
        </div>

        <!-- AI Abstract -->
        <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 class="text-xs font-extrabold text-blue-700 mb-2">AI自动摘要</h4>
          <p class="text-xs text-gray-700 leading-relaxed font-bold">{{ order.aiAbstract || '暂无AI摘要' }}</p>
        </div>

        <!-- Step Progress -->
        <div class="flex gap-1.5 items-center py-2">
          <span
            v-for="i in 5"
            :key="i"
            class="flex-1 flex items-center justify-center h-7 rounded-full border text-[10px] font-extrabold"
            :class="i <= order.step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400 bg-white'"
          >{{ i }}. {{ steps[i - 1] }}</span>
        </div>

        <!-- Route Actions -->
        <div class="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <button class="btn-danger text-xs h-7 px-4" @click="handleDoRoute('exception')">转异常</button>
          <button class="btn-secondary text-xs h-7 px-4" @click="handleDoRoute('qa')">转Q&A</button>
          <button class="btn-success text-xs h-7 px-4" @click="handleDoRoute('requirement')">转需求</button>
          <button class="btn-primary text-xs h-7 px-4" @click="handleDoRoute('close')">直接关闭</button>
        </div>
      </div>
    </div>

    <!-- Close Modal -->
    <div v-if="showCloseModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3 class="text-sm font-extrabold text-gray-900">关闭工单</h3>
          <button class="text-gray-400 hover:text-gray-600" @click="handleCancelClose"><X class="w-4 h-4" /></button>
        </div>
        <div class="p-5">
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-extrabold text-gray-700">关闭说明 <span class="text-red-500">*</span></span>
            <textarea
              :value="closeNote"
              rows="3"
              placeholder="请填写关闭原因和处理说明..."
              class="w-full text-xs border border-gray-300 rounded-md p-2.5 resize-y font-bold"
              @input="handleCloseNoteInput(($event.target as HTMLTextAreaElement).value)"
            ></textarea>
          </label>
        </div>
        <div class="flex justify-end gap-2 px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-200">
          <button class="btn-secondary text-xs h-8 px-4" @click="handleCancelClose">取消</button>
          <button class="btn-primary text-xs h-8 px-4" @click="handleConfirmClose">确认关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, X } from 'lucide-vue-next'
import type { WorkOrder } from '@/types'

defineProps<{
  order: WorkOrder | null
  showCloseModal: boolean
  closeNote: string
  steps: string[]
}>()

const emit = defineEmits<{
  close: []
  'do-route': [route: string]
  'update:close-note': [value: string]
  'cancel-close': []
  'confirm-close': []
}>()

function handleClose() {
  emit('close')
}

function handleDoRoute(route: string) {
  emit('do-route', route)
}

function handleCloseNoteInput(value: string) {
  emit('update:close-note', value)
}

function handleCancelClose() {
  emit('cancel-close')
}

function handleConfirmClose() {
  emit('confirm-close')
}

function getRoute(order: WorkOrder): string {
  if (order.status === '已闭环' && order.closeReason !== '-') return '直接关闭'
  if (order.exception === '是') return '已转异常'
  if (order.requirement === '是' || order.requirement === '预留') return '已转需求'
  if (order.qa === '是') return '已转Q&A'
  return '继续处理'
}
</script>
