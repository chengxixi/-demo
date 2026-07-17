<script setup lang="ts">
import type { WorkOrder } from '@/types'

const props = defineProps<{
  items: WorkOrder[]
}>()

const emit = defineEmits<{
  (event: 'openDetail', item: WorkOrder): void
}>()

function routeLabel(row: WorkOrder) {
  if (row.status === '已直接关闭' || row.closeNote) return '直接关闭'
  if (row.exception === '是') return '已转异常'
  if (row.requirement === '是') return '已转需求'
  if (row.qa === '是') return '已转Q&A'
  return row.status || '-'
}

function statusColor(status: string) {
  if (status === '已直接关闭') {
    return 'green'
  }

  if (status === '待处理') {
    return 'orange'
  }

  if (status.includes('转')) {
    return 'purple'
  }

  return 'blue'
}
</script>

<template>
  <vxe-table :data="props.items" border stripe height="560" :export-config="{}">
    <vxe-column field="id" title="工单编号" width="160" fixed="left" />
    <vxe-column field="summary" title="摘要" min-width="260" />
    <vxe-column title="关联反馈" min-width="240">
      <template #default="{ row }">
        <div class="feedback-tags">
          <a-tag v-for="feedback in String(row.relatedFeedback).split(' / ')" :key="feedback">{{ feedback }}</a-tag>
        </div>
      </template>
    </vxe-column>
    <vxe-column field="productLine" title="产品线" width="140" />
    <vxe-column field="status" title="状态" width="110">
      <template #default="{ row }">
        <a-tag :color="statusColor(row.status)">{{ row.status }}</a-tag>
      </template>
    </vxe-column>
    <vxe-column field="owner" title="负责人" width="100" />
    <vxe-column field="dept" title="部门" width="100" />
    <vxe-column field="result" title="处理结果" min-width="160" />
    <vxe-column title="处理去向" width="120">
      <template #default="{ row }">
        {{ routeLabel(row) }}
      </template>
    </vxe-column>
    <vxe-column title="操作" width="100" fixed="right" align="center">
      <template #default="{ row }">
        <a-button size="small" type="link" @click="emit('openDetail', row)">详情</a-button>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<style scoped>
.feedback-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  line-height: 1.8;
  white-space: normal;
}
</style>
