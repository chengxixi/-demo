<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import { workOrderData, workOrderSteps } from '@/api/mock-data'
import type { WorkOrder } from '@/types'

const orders = ref([...workOrderData])
const detailOrder = ref<WorkOrder | null>(null)

function openDetail(order: WorkOrder) {
  detailOrder.value = { ...order }
}

function closeDetail() {
  detailOrder.value = null
}

function getStatusClass(status: string) {
  if (status === '处理中' || status === '转工单') return 'status-processing'
  if (status === '待确认') return 'status-pending'
  if (status === '已闭环') return 'status-done'
  return ''
}

function getRoute(order: WorkOrder): string {
  if (order.exception === '是') return '已转异常'
  if (order.requirement === '是' || order.requirement === '预留') return '已转需求'
  return '-'
}

function updateOrderRoute(order: WorkOrder, route: string) {
  const idx = orders.value.findIndex(o => o.id === order.id)
  if (idx < 0) return
  if (route === 'exception') orders.value[idx].exception = '是'
  else if (route === 'requirement') orders.value[idx].requirement = '是'
  else if (route === 'close') { orders.value[idx].status = '已闭环'; orders.value[idx].step = 5 }
  closeDetail()
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="text-lg font-extrabold text-gray-900">工单池</h2>
      <p class="text-xs text-gray-400 mt-0.5">从反馈清单生成的处理协同事项，按SLA进行分派、跟进和闭环。</p>
    </div>

    <div v-if="!detailOrder" class="flex-1 overflow-auto p-6">
      <!-- Table -->
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table class="w-full text-xs">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">工单ID</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">关联反馈</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">状态</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">负责人</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">部门</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">SLA</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">处理结果</th>
              <th class="text-left px-3 py-2 font-extrabold text-gray-600">关闭原因</th>
              <th class="text-center px-3 py-2 font-extrabold text-gray-600">是否转异常</th>
              <th class="text-center px-3 py-2 font-extrabold text-gray-600">是否转需求</th>
              <th class="text-center px-3 py-2 font-extrabold text-gray-600">步骤</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.id"
              class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
              @click="openDetail(order)"
            >
              <td class="px-3 py-2 font-extrabold text-blue-600">{{ order.id }}</td>
              <td class="px-3 py-2 text-gray-600">{{ order.relatedFeedback }}</td>
              <td class="px-3 py-2">
                <span :class="getStatusClass(order.status)">{{ order.status }}</span>
              </td>
              <td class="px-3 py-2 font-bold">{{ order.owner }}</td>
              <td class="px-3 py-2 text-gray-500">{{ order.dept }}</td>
              <td class="px-3 py-2 font-bold">{{ order.sla }}</td>
              <td class="px-3 py-2 text-gray-600">{{ order.result }}</td>
              <td class="px-3 py-2 text-gray-400">{{ order.closeReason }}</td>
              <td class="px-3 py-2 text-center">{{ order.exception }}</td>
              <td class="px-3 py-2 text-center">{{ order.requirement }}</td>
              <td class="px-3 py-2">
                <div class="flex flex-col items-center gap-1">
                  <div class="flex gap-0.5">
                    <span
                      v-for="i in 5"
                      :key="i"
                      class="w-4 h-4 rounded-full border text-[10px] flex items-center justify-center font-extrabold"
                      :class="i <= order.step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400 bg-white'"
                    >{{ i }}</span>
                  </div>
                  <span class="text-[10px] font-bold text-gray-500">{{ workOrderSteps[Math.max(0, Math.min(order.step - 1, 4))] }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail View -->
    <div v-else class="flex-1 overflow-auto p-6 bg-gray-50">
      <div class="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg">
        <div class="flex items-start justify-between px-5 py-4 border-b border-gray-200 bg-white rounded-t-lg">
          <div>
            <h2 class="text-xl font-extrabold text-gray-900">工单详情</h2>
            <p class="text-xs text-gray-500 mt-1">关联反馈 {{ detailOrder.relatedFeedback }} / {{ detailOrder.status }} / {{ detailOrder.owner }}</p>
          </div>
          <button class="btn-secondary text-xs flex items-center gap-1" @click="closeDetail">
            <ArrowLeft class="w-3 h-3" /> 返回列表
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Detail Grid -->
          <div class="grid grid-cols-3 gap-3">
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">工单ID</span>
              <strong class="block mt-1 text-sm">{{ detailOrder.id }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">状态</span>
              <strong class="block mt-1 text-sm">{{ detailOrder.status }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">负责人</span>
              <strong class="block mt-1 text-sm">{{ detailOrder.owner }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">部门</span>
              <strong class="block mt-1 text-sm">{{ detailOrder.dept }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">SLA</span>
              <strong class="block mt-1 text-sm">{{ detailOrder.sla }}</strong>
            </div>
            <div class="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span class="block text-[11px] font-bold text-gray-500">处理去向</span>
              <strong class="block mt-1 text-sm">{{ getRoute(detailOrder) }}</strong>
            </div>
          </div>

          <!-- Step Progress (Large) -->
          <div class="flex gap-2 items-center py-3">
            <span
              v-for="i in 5"
              :key="i"
              class="flex-1 flex items-center justify-center h-8 rounded-full border text-xs font-extrabold"
              :class="i <= detailOrder.step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'"
            >{{ i }}. {{ workOrderSteps[i - 1] }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button class="btn-danger text-xs" @click="updateOrderRoute(detailOrder, 'exception')">转异常</button>
          <button class="btn-secondary text-xs" @click="updateOrderRoute(detailOrder, 'qa')">转Q&A</button>
          <button class="btn-success text-xs" @click="updateOrderRoute(detailOrder, 'requirement')">转需求</button>
          <button class="btn-primary text-xs" @click="updateOrderRoute(detailOrder, 'close')">直接关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>
