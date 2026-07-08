<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { message } from 'ant-design-vue'
import type { WorkOrder } from '@/types'
import { workOrderData } from '@/api/mock'
import WorkOrderDetailDrawer from './WorkOrderDetailDrawer.vue'
import WorkOrderFilter from './WorkOrderFilter.vue'
import WorkOrderTable from './WorkOrderTable.vue'

type RouteType = 'requirement' | 'exception' | 'qa' | 'close'

const orders = ref<WorkOrder[]>([...workOrderData])
const detailOpen = shallowRef(false)
const aiOpen = shallowRef(false)
const routeOpen = shallowRef(false)
const detailOrder = ref<WorkOrder | null>(null)
const routeTarget = ref<WorkOrder | null>(null)

const filters = ref({
  keyword: '',
  status: '',
  owner: '',
})

const stats = computed(() => ({
  total: orders.value.length,
  processing: orders.value.filter((order) => order.status === '处理中').length,
  closed: orders.value.filter((order) => order.status === '已闭环').length,
  toRequirement: orders.value.filter((order) => order.requirement === '是' || order.requirement === '预留').length,
}))

const routeCards = [
  { key: 'requirement', title: '转产品需求', desc: '有产品价值的问题进入需求池，补充证据和评分。' },
  { key: 'exception', title: '转紧急异常', desc: '安全、法规、合规、集中投诉或重大风险进入 P0/P1 流程。' },
  { key: 'qa', title: '沉淀 Q&A', desc: '咨询类或已解决问题沉淀为标准回复和案例库。' },
  { key: 'close', title: '直接关闭', desc: '确认已回复用户并记录关闭原因。' },
] as const

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const keyword = filters.value.keyword.trim().toLowerCase()
    const text = `${order.id} ${order.summary} ${order.productLine} ${order.relatedFeedback}`.toLowerCase()
    const matchesKeyword = !keyword || text.includes(keyword)
    const matchesStatus = !filters.value.status || order.status === filters.value.status
    const matchesOwner = !filters.value.owner || order.owner.includes(filters.value.owner)

    return matchesKeyword && matchesStatus && matchesOwner
  })
})

function openDetail(order: WorkOrder) {
  detailOrder.value = order
  detailOpen.value = true
}

function saveOrder(order: WorkOrder) {
  orders.value = orders.value.map((item) => (item.id === order.id ? order : item))
  message.success('工单已更新')
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

function openRouteWorkbench(order?: WorkOrder) {
  routeTarget.value = order || filteredOrders.value[0] || null
  routeOpen.value = true
}

function applyRoute(route: RouteType) {
  if (!routeTarget.value) {
    return
  }

  routeOrder({ order: routeTarget.value, route })
  routeOpen.value = false
}
</script>

<template>
  <section class="space-y-4 p-4">
    <a-row justify="space-between" align="middle">
      <a-col>
        <a-space direction="vertical" size="small">
          <a-typography-title :level="4" class="m-0">工单池</a-typography-title>
          <a-typography-text type="secondary">
            集中承接反馈清单转入的问题，按 AI 辅助建议推进转需求、转异常、沉淀 Q&A 或直接关闭。
          </a-typography-text>
        </a-space>
      </a-col>
      <a-col>
        <a-space>
          <a-button @click="aiOpen = true">AI辅助处理</a-button>
          <a-button type="primary" @click="openRouteWorkbench()">处理去向</a-button>
        </a-space>
      </a-col>
    </a-row>

    <a-row :gutter="[12, 12]">
      <a-col :xs="12" :md="6"><a-card size="small"><a-statistic title="工单总数" :value="stats.total" /></a-card></a-col>
      <a-col :xs="12" :md="6"><a-card size="small"><a-statistic title="处理中" :value="stats.processing" /></a-card></a-col>
      <a-col :xs="12" :md="6"><a-card size="small"><a-statistic title="已闭环" :value="stats.closed" /></a-card></a-col>
      <a-col :xs="12" :md="6"><a-card size="small"><a-statistic title="转需求/预留" :value="stats.toRequirement" /></a-card></a-col>
    </a-row>

    <a-card :bordered="false">
      <a-steps size="small" :current="1">
        <a-step title="AI摘要" description="识别问题、等级和建议去向" />
        <a-step title="工单处理" description="质量/研发跟进排查" />
        <a-step title="处理去向" description="需求、异常、Q&A或关闭" />
        <a-step title="复盘沉淀" description="更新案例库和月报" />
      </a-steps>
    </a-card>

    <a-alert
      type="info"
      show-icon
      message="处理建议"
      description="咨询类可直接回复关闭并沉淀 Q&A；集中质量问题转工单持续跟进；安全、法规、合规或高风险问题转紧急异常；有产品价值的问题转需求池。"
    />

    <WorkOrderFilter v-model:filters="filters" />
    <WorkOrderTable :items="filteredOrders" @open-detail="openDetail" />
    <WorkOrderDetailDrawer v-model:open="detailOpen" :item="detailOrder" @save="saveOrder" @route="routeOrder" />

    <a-modal v-model:open="aiOpen" title="AI辅助处理建议" width="720px" :footer="null">
      <a-row :gutter="[12, 12]">
        <a-col v-for="item in routeCards" :key="item.key" :xs="24" :md="12">
          <a-card size="small" :title="item.title">
            <a-typography-paragraph>{{ item.desc }}</a-typography-paragraph>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>

    <a-modal v-model:open="routeOpen" :title="routeTarget ? `${routeTarget.id} 处理去向` : '处理去向'" width="760px" :footer="null">
      <a-row :gutter="[12, 12]">
        <a-col v-for="item in routeCards" :key="item.key" :xs="24" :md="12">
          <a-card size="small" :title="item.title">
            <a-typography-paragraph>{{ item.desc }}</a-typography-paragraph>
            <a-button block @click="applyRoute(item.key)">选择</a-button>
          </a-card>
        </a-col>
      </a-row>
    </a-modal>
  </section>
</template>
