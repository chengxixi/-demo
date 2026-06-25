<template>
  <div class="flex-1 overflow-auto px-6 pb-6">
    <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table class="w-full text-xs">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">工单ID</th>
            <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">工单摘要</th>
            <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">关联反馈</th>
            <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">产品线</th>
            <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">处理状态</th>
            <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">当前处理人</th>
            <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">处理结果</th>
            <th class="text-left px-3 py-2.5 font-extrabold text-gray-600">关闭原因</th>
            <th class="text-center px-3 py-2.5 font-extrabold text-gray-600">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in orders"
            :key="order.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-3 py-2.5 font-extrabold text-blue-600">{{ order.id }}</td>
            <td class="px-3 py-2.5 text-gray-700 font-bold max-w-[280px] truncate">{{ order.summary || '待补充工单摘要' }}</td>
            <td class="px-3 py-2.5">
              <span class="font-extrabold text-blue-600 cursor-pointer hover:underline">{{ order.relatedFeedback }}</span>
            </td>
            <td class="px-3 py-2.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold" :class="getProductLineClass(order.productLine)">{{ order.productLine }}</span>
            </td>
            <td class="px-3 py-2.5">
              <span :class="getStatusClass(order.status)">{{ order.status }}</span>
            </td>
            <td class="px-3 py-2.5 font-bold">{{ order.owner }}</td>
            <td class="px-3 py-2.5 text-gray-600 font-bold max-w-[180px] truncate">{{ order.result }}</td>
            <td class="px-3 py-2.5 text-gray-400">{{ order.closeReason }}</td>
            <td class="px-3 py-2.5 text-center">
              <button class="btn-secondary text-[11px] h-6 px-3" @click="handleOpenDetail(order)">详情</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorkOrder } from '@/types'

defineProps<{
  orders: WorkOrder[]
}>()

const emit = defineEmits<{
  'open-detail': [order: WorkOrder]
}>()

function handleOpenDetail(order: WorkOrder) {
  emit('open-detail', order)
}

function getStatusClass(status: string) {
  if (status === '处理中') return 'status-processing'
  if (status === '待确认') return 'status-pending'
  if (status === '已闭环') return 'status-done'
  return ''
}

function getProductLineClass(line: string) {
  if (line.includes('八电极')) return 'bg-blue-50 text-blue-700'
  if (line.includes('筋膜枪')) return 'bg-purple-50 text-purple-700'
  if (line.includes('体脂秤')) return 'bg-green-50 text-green-700'
  return 'bg-gray-50 text-gray-700'
}
</script>
