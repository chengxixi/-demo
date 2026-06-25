<template>
  <!-- Detail Modal -->
  <div v-if="showDetailModal && detailItem" class="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-auto">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl mt-10">
      <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
        <div>
          <span class="text-xs text-gray-400">紧急异常详情</span>
          <h3 class="text-base font-extrabold text-gray-900">{{ detailItem.id }}</h3>
          <p class="text-[11px] text-gray-400">{{ detailItem.level }} / {{ detailItem.region }} / {{ detailItem.dimension }}</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600" @click="handleCloseDetailModal"><X class="w-5 h-5" /></button>
      </div>

      <div class="p-5 max-h-[70vh] overflow-y-auto space-y-4">
        <!-- Step indicator -->
        <div class="flex items-center gap-1">
          <div v-for="(label, idx) in stepLabels" :key="idx" class="flex-1">
            <div class="h-1.5 rounded-full" :class="idx < detailItem.step ? 'bg-green-500' : 'bg-gray-200'"></div>
            <span class="block text-[10px] font-bold mt-1 text-center" :class="idx < detailItem.step ? 'text-green-600' : 'text-gray-400'">{{ idx + 1 }}. {{ label }}</span>
          </div>
        </div>

        <!-- Time limit reminder -->
        <div class="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2">
          <Clock class="w-4 h-4 text-orange-500" />
          <span class="text-xs font-bold text-gray-500">时限提醒</span>
          <strong class="text-sm font-extrabold text-gray-900">{{ detailItem.reminderLimit || '2h' }}</strong>
          <span class="text-xs text-gray-500">截止: {{ detailItem.reminderDeadline || '待确认' }}</span>
        </div>

        <!-- Info grid -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">当前处理人</span>
            <strong class="block mt-1 text-sm">{{ detailItem.owner }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">处理团队</span>
            <strong class="block mt-1 text-sm">{{ detailItem.team }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">临时方案倒计时</span>
            <strong class="block mt-1 text-sm" :class="detailItem.overdue ? 'text-red-600' : ''">{{ detailItem.deadline }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">状态</span>
            <strong class="block mt-1 text-sm">{{ detailItem.status }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">反馈来源</span>
            <strong class="block mt-1 text-sm">{{ detailItem.feedback }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">触发来源</span>
            <strong class="block mt-1 text-sm">{{ detailItem.source }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">创建人</span>
            <strong class="block mt-1 text-sm">{{ detailItem.creator }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">站点</span>
            <strong class="block mt-1 text-sm">{{ detailItem.site }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">产品线</span>
            <strong class="block mt-1 text-sm">{{ detailItem.productLine }}</strong>
          </div>
          <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <span class="block text-[11px] font-bold text-gray-500">内部型号</span>
            <strong class="block mt-1 text-sm">{{ detailItem.internal }}</strong>
          </div>
        </div>

        <!-- Editable fields -->
        <div class="space-y-3">
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">异常问题</span>
            <textarea :value="editFields.issue" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold" @input="handleEditFieldChange('issue', ($event.target as HTMLTextAreaElement).value)"></textarea>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">影响范围</span>
            <textarea :value="editFields.impactScope" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold" @input="handleEditFieldChange('impactScope', ($event.target as HTMLTextAreaElement).value)"></textarea>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">临时处置</span>
            <textarea :value="editFields.tempPlan" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold" @input="handleEditFieldChange('tempPlan', ($event.target as HTMLTextAreaElement).value)"></textarea>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">根因分析</span>
            <textarea :value="editFields.rootCause" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold" @input="handleEditFieldChange('rootCause', ($event.target as HTMLTextAreaElement).value)"></textarea>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">整改措施</span>
            <textarea :value="editFields.fixPlan" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold" @input="handleEditFieldChange('fixPlan', ($event.target as HTMLTextAreaElement).value)"></textarea>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[11px] font-bold text-gray-600">验证结果</span>
            <textarea :value="editFields.verifyResult" rows="2" class="w-full text-xs border border-gray-300 rounded-md p-2 resize-y font-bold" @input="handleEditFieldChange('verifyResult', ($event.target as HTMLTextAreaElement).value)"></textarea>
          </label>
        </div>
      </div>

      <div class="flex justify-end gap-2 px-5 py-3.5 bg-gray-50 rounded-b-xl border-t border-gray-200">
        <button class="btn-secondary text-xs h-8 px-4" @click="handleCloseDetailModal">关闭</button>
        <button class="btn-primary text-xs h-8 px-4" @click="handleSaveEmergency">保存流程</button>
        <button class="btn-success text-xs h-8 px-4" @click="handleCloseArchive">关闭归档</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, Clock } from 'lucide-vue-next'
import type { EmergencyException } from '@/types'

defineProps<{
  detailItem: EmergencyException | null
  editFields: {
    issue: string
    impactScope: string
    tempPlan: string
    rootCause: string
    fixPlan: string
    verifyResult: string
  }
  showDetailModal: boolean
  stepLabels: string[]
}>()

const emit = defineEmits<{
  'close-detail-modal': []
  'save-emergency': []
  'close-archive': []
  'update:edit-fields': [key: string, value: string]
}>()

function handleCloseDetailModal() {
  emit('close-detail-modal')
}

function handleSaveEmergency() {
  emit('save-emergency')
}

function handleCloseArchive() {
  emit('close-archive')
}

function handleEditFieldChange(key: string, value: string) {
  emit('update:edit-fields', key, value)
}
</script>
