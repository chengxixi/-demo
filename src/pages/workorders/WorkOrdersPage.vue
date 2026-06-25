<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
      <h2 class="text-lg font-extrabold text-gray-900">工单池</h2>
      <p class="text-xs text-gray-400 mt-0.5">从反馈清单生成的处理协同事项，按SLA进行分派、跟进和闭环。</p>
    </div>

    <!-- List View -->
    <template v-if="!detailOrder">
      <!-- Stats -->
      <div class="px-6 pt-4 grid grid-cols-4 gap-3 flex-shrink-0">
        <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-extrabold text-gray-900">{{ stats.total }}</div>
          <div class="text-[11px] font-bold text-gray-500 mt-0.5">工单总数</div>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-extrabold text-blue-600">{{ stats.processing }}</div>
          <div class="text-[11px] font-bold text-gray-500 mt-0.5">处理中</div>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-extrabold text-green-600">{{ stats.closed }}</div>
          <div class="text-[11px] font-bold text-gray-500 mt-0.5">已闭环</div>
        </div>
        <div class="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div class="text-2xl font-extrabold text-orange-600">{{ stats.toRequirement }}</div>
          <div class="text-[11px] font-bold text-gray-500 mt-0.5">已转需求</div>
        </div>
      </div>

      <!-- Filter -->
      <WorkOrderFilter
        v-model:product-line="filterProductLine"
        v-model:status="filterStatus"
        v-model:owner="filterOwner"
        :product-line-options="productLineOptions"
        :status-options="statusOptions"
        :owner-options="ownerOptions"
        :filtered-count="filteredOrders.length"
      />

      <!-- Table -->
      <WorkOrderTable :orders="filteredOrders" @open-detail="handleOpenDetail" />
    </template>

    <!-- Detail View -->
    <WorkOrderDetailDrawer
      v-else
      :order="detailOrder"
      :show-close-modal="showCloseModal"
      :close-note="closeNote"
      :steps="workOrderSteps"
      @close="handleCloseDetail"
      @do-route="handleDoRoute"
      @update:close-note="handleUpdateCloseNote"
      @cancel-close="handleCancelClose"
      @confirm-close="handleConfirmClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { workOrderData, workOrderSteps } from '@/api/mock-data'
import type { WorkOrder } from '@/types'
import WorkOrderFilter from './WorkOrderFilter.vue'
import WorkOrderTable from './WorkOrderTable.vue'
import WorkOrderDetailDrawer from './WorkOrderDetailDrawer.vue'

const orders = ref<WorkOrder[]>([...workOrderData])
const detailOrder = ref<WorkOrder | null>(null)
const filterProductLine = ref('')
const filterStatus = ref('')
const filterOwner = ref('')
const showCloseModal = ref(false)
const closeNote = ref('')

const stats = computed(() => ({
  total: orders.value.length,
  processing: orders.value.filter(o => o.status === '处理中').length,
  closed: orders.value.filter(o => o.status === '已闭环').length,
  toRequirement: orders.value.filter(o => o.requirement === '是' || o.requirement === '预留').length,
}))

const filteredOrders = computed(() => {
  let result = orders.value
  if (filterProductLine.value) result = result.filter(o => o.productLine === filterProductLine.value)
  if (filterStatus.value) result = result.filter(o => o.status === filterStatus.value)
  if (filterOwner.value) result = result.filter(o => o.owner === filterOwner.value)
  return result
})

const productLineOptions = computed(() => [...new Set(orders.value.map(o => o.productLine))])
const statusOptions = computed(() => [...new Set(orders.value.map(o => o.status))])
const ownerOptions = computed(() => [...new Set(orders.value.map(o => o.owner))])

function handleOpenDetail(order: WorkOrder) {
  detailOrder.value = { ...order }
}

function handleCloseDetail() {
  detailOrder.value = null
  showCloseModal.value = false
  closeNote.value = ''
}

function handleDoRoute(route: string) {
  if (!detailOrder.value) return
  if (route === 'close') {
    showCloseModal.value = true
    return
  }
  const idx = orders.value.findIndex(o => o.id === detailOrder.value!.id)
  if (idx < 0) return
  if (route === 'exception') orders.value[idx].exception = '是'
  else if (route === 'qa') orders.value[idx].qa = '是'
  else if (route === 'requirement') orders.value[idx].requirement = '是'
  detailOrder.value = { ...orders.value[idx] }
}

function handleUpdateCloseNote(value: string) {
  closeNote.value = value
}

function handleCancelClose() {
  showCloseModal.value = false
}

function handleConfirmClose() {
  if (!detailOrder.value || !closeNote.value.trim()) return
  const idx = orders.value.findIndex(o => o.id === detailOrder.value!.id)
  if (idx < 0) return
  orders.value[idx].status = '已闭环'
  orders.value[idx].step = 5
  orders.value[idx].closeReason = closeNote.value.trim()
  orders.value[idx].closeNote = closeNote.value.trim()
  detailOrder.value = { ...orders.value[idx] }
  showCloseModal.value = false
  closeNote.value = ''
}
</script>
