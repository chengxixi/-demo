<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { message } from 'ant-design-vue'
import type { WorkOrder } from '@/types'
import { workOrderData } from '@/api/mock'
import WorkOrderDetailDrawer from './WorkOrderDetailDrawer.vue'
import WorkOrderFilter from './WorkOrderFilter.vue'
import WorkOrderTable from './WorkOrderTable.vue'

type RouteType = 'requirement' | 'exception' | 'qa' | 'close'

const GENERATED_WORKORDERS_KEY = 'feedback-generated-workorders'

const orders = ref<WorkOrder[]>([...workOrderData])
const detailOpen = shallowRef(false)
const detailOrder = ref<WorkOrder | null>(null)

const filters = ref({
  keyword: '',
  productLine: '',
  status: '',
  owner: '',
})


const productLineOptions = computed(() => uniqueValues(orders.value.map((order) => order.productLine)))
const statusOptions = computed(() => uniqueValues(orders.value.map((order) => order.status)))
const ownerOptions = computed(() => uniqueValues(orders.value.map((order) => order.owner)))

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const keyword = filters.value.keyword.trim().toLowerCase()
    const text = `${order.id} ${order.summary} ${order.productLine} ${order.relatedFeedback}`.toLowerCase()
    const matchesKeyword = !keyword || text.includes(keyword)
    const matchesProductLine = !filters.value.productLine || order.productLine === filters.value.productLine
    const matchesStatus = !filters.value.status || order.status === filters.value.status
    const matchesOwner = !filters.value.owner || order.owner === filters.value.owner

    return matchesKeyword && matchesProductLine && matchesStatus && matchesOwner
  })
})

const stats = computed(() => ({
  total: filteredOrders.value.length,
  processing: filteredOrders.value.filter((order) => ['转工单', '处理中', '待确认'].includes(order.status) || order.status.includes('处理')).length,
  closed: filteredOrders.value.filter((order) => ['已闭环', '已关闭'].includes(order.status)).length,
  toRequirement: filteredOrders.value.filter((order) => order.requirement === '是' || order.requirement === '预留' || order.status.includes('需求')).length,
}))

onMounted(() => {
  loadGeneratedWorkOrders()
})

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function loadGeneratedWorkOrders() {
  const generated = JSON.parse(localStorage.getItem(GENERATED_WORKORDERS_KEY) || '[]') as WorkOrder[]
  const existing = new Set(orders.value.map((order) => order.id))
  orders.value = [...generated.filter((order) => !existing.has(order.id)), ...orders.value]
}

function openDetail(order: WorkOrder) {
  detailOrder.value = order
  detailOpen.value = true
}

function saveOrder(order: WorkOrder) {
  orders.value = orders.value.map((item) => (item.id === order.id ? order : item))
  persistGeneratedWorkOrders()
  message.success('工单已更新')
}

function persistGeneratedWorkOrders() {
  const generated = orders.value.filter((order) => order.id.startsWith('TK-') && !workOrderData.some((item) => item.id === order.id))
  localStorage.setItem(GENERATED_WORKORDERS_KEY, JSON.stringify(generated))
}

function routeOrder(payload: { order: WorkOrder; route: RouteType }) {
  const routeMap = {
    requirement: { status: '转需求', requirement: '是', qa: payload.order.qa, exception: payload.order.exception },
    exception: { status: '转异常', exception: '是', requirement: payload.order.requirement, qa: payload.order.qa },
    qa: { status: '转Q&A', qa: '是', requirement: payload.order.requirement, exception: payload.order.exception },
    close: { status: '已闭环', qa: payload.order.qa, requirement: payload.order.requirement, exception: payload.order.exception },
  }
  const next = routeMap[payload.route]

  saveOrder({
    ...payload.order,
    status: next.status,
    requirement: next.requirement,
    exception: next.exception,
    qa: next.qa,
    closeReason: payload.route === 'close' ? '已回复关闭' : payload.order.closeReason,
  })
}

</script>

<template>
  <section class="space-y-4 p-4">
    <a-row justify="space-between" align="middle">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">工单池</a-typography-title>
          <a-typography-text type="secondary">
            集中承接反馈清单转入的问题，推进转需求、转异常、沉淀 Q&A 或直接关闭。
          </a-typography-text>
        </a-space>
      </a-col>
    </a-row>

    <a-row :gutter="[12, 12]">
      <a-col :xs="12" :md="6"><a-card size="small"><a-statistic title="工单总数" :value="stats.total" /></a-card></a-col>
      <a-col :xs="12" :md="6"><a-card size="small"><a-statistic title="处理中" :value="stats.processing" /></a-card></a-col>
      <a-col :xs="12" :md="6"><a-card size="small"><a-statistic title="已闭环" :value="stats.closed" /></a-card></a-col>
      <a-col :xs="12" :md="6"><a-card size="small"><a-statistic title="已转需求" :value="stats.toRequirement" /></a-card></a-col>
    </a-row>

    <WorkOrderFilter
      v-model:filters="filters"
      :product-lines="productLineOptions"
      :statuses="statusOptions"
      :owners="ownerOptions"
    />
    <WorkOrderTable :items="filteredOrders" @open-detail="openDetail" />
    <WorkOrderDetailDrawer v-model:open="detailOpen" :item="detailOrder" @save="saveOrder" @route="routeOrder" />
  </section>
</template>