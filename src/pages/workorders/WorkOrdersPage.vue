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
  id: '',
  summary: '',
  feedbackId: '',
  productLine: '',
  inflowTime: '',
  owner: '',
  dept: '',
  route: '',
})


const productLineOptions = ['八电极', '体脂秤', '筋膜枪']
const routeOptions = ['直接关闭', '已转异常', '已转需求', '已转Q&A', '待处理', '处理中']
const ownerOptions = computed(() => uniqueValues(orders.value.map((order) => order.owner)))
const departmentOptions = computed(() => uniqueValues(orders.value.map((order) => order.dept)))

function routeLabel(order: WorkOrder) {
  if (order.status === '已直接关闭' || order.closeNote) return '直接关闭'
  if (order.exception === '是') return '已转异常'
  if (order.requirement === '是' || order.requirement === '预留') return '已转需求'
  if (order.qa === '是') return '已转Q&A'
  return order.status || '-'
}

function includesText(value: string, query: string) {
  return !query.trim() || value.toLowerCase().includes(query.trim().toLowerCase())
}

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const matchesId = includesText(order.id, filters.value.id)
    const matchesSummary = includesText(order.summary, filters.value.summary)
    const matchesFeedbackId = includesText(order.relatedFeedback, filters.value.feedbackId)
    const matchesProductLine = !filters.value.productLine || order.productLine === filters.value.productLine
    const matchesInflowTime = includesText(order.inflowTime || '', filters.value.inflowTime)
    const matchesOwner = !filters.value.owner || order.owner === filters.value.owner
    const matchesDept = !filters.value.dept || order.dept === filters.value.dept
    const matchesRoute = !filters.value.route || routeLabel(order) === filters.value.route

    return matchesId && matchesSummary && matchesFeedbackId && matchesProductLine && matchesInflowTime && matchesOwner && matchesDept && matchesRoute
  })
})

const stats = computed(() => ({
  total: filteredOrders.value.length,
  processing: filteredOrders.value.filter((order) => ['转工单', '处理中', '待确认'].includes(order.status) || order.status.includes('处理')).length,
  closed: filteredOrders.value.filter((order) => order.status === '已直接关闭').length,
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
    requirement: { status: '已转需求', requirement: '是', qa: payload.order.qa, exception: payload.order.exception },
    exception: { status: '转异常', exception: '是', requirement: payload.order.requirement, qa: payload.order.qa },
    qa: { status: '已转Q&A', qa: '是', requirement: payload.order.requirement, exception: payload.order.exception },
    close: { status: '已直接关闭', qa: payload.order.qa, requirement: payload.order.requirement, exception: payload.order.exception },
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
  <section v-if="!detailOpen" class="space-y-4 p-4">
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
      :owners="ownerOptions"
      :departments="departmentOptions"
      :routes="routeOptions"
    />
    <WorkOrderTable :items="filteredOrders" @open-detail="openDetail" />
  </section>
  <section v-else class="space-y-4 p-4">
    <WorkOrderDetailDrawer v-model:open="detailOpen" :item="detailOrder" @save="saveOrder" @route="routeOrder" />
  </section>
</template>