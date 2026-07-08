<script setup lang="ts">
import type { WorkOrder } from '@/types'

const props = defineProps<{
  items: WorkOrder[]
}>()

const emit = defineEmits<{
  (event: 'openDetail', item: WorkOrder): void
}>()

function statusColor(status: string) {
  if (status === '已闭环') {
    return 'green'
  }

  if (status === '待确认') {
    return 'orange'
  }

  if (status.includes('转')) {
    return 'purple'
  }

  return 'blue'
}
</script>

<template>
  <vxe-table :data="props.items" border stripe show-overflow height="560" :export-config="{}">
    <vxe-column field="id" title="工单编号" width="160" fixed="left" />
    <vxe-column field="summary" title="摘要" min-width="260" />
    <vxe-column field="relatedFeedback" title="关联反馈" width="170" />
    <vxe-column field="productLine" title="产品线" width="140" />
    <vxe-column field="status" title="状态" width="110">
      <template #default="{ row }">
        <a-tag :color="statusColor(row.status)">{{ row.status }}</a-tag>
      </template>
    </vxe-column>
    <vxe-column field="owner" title="负责人" width="100" />
    <vxe-column field="dept" title="部门" width="100" />
    <vxe-column field="sla" title="SLA" width="100" />
    <vxe-column field="result" title="处理结果" min-width="160" />
    <vxe-column field="exception" title="异常" width="80" />
    <vxe-column field="requirement" title="需求" width="80" />
    <vxe-column field="qa" title="Q&A" width="80" />
    <vxe-column title="操作" width="100" fixed="right" align="center">
      <template #default="{ row }">
        <a-button size="small" type="link" @click="emit('openDetail', row)">详情</a-button>
      </template>
    </vxe-column>
  </vxe-table>
</template>
