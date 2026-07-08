<script setup lang="ts">
import type { EmergencyException } from '@/types'

const props = defineProps<{
  items: EmergencyException[]
}>()

const emit = defineEmits<{
  (event: 'openDetail', item: EmergencyException): void
  (event: 'advanceStep', item: EmergencyException): void
}>()

function levelColor(level: string) {
  if (level === 'P0') {
    return 'red'
  }

  if (level === 'P1') {
    return 'orange'
  }

  if (level === 'P2') {
    return 'blue'
  }

  return 'default'
}
</script>

<template>
  <vxe-table
    :data="props.items"
    border
    stripe
    show-overflow
    height="320"
    :row-config="{ keyField: 'id' }"
    :export-config="{}"
  >
    <vxe-column field="id" title="异常编号" width="150" fixed="left" />
    <vxe-column field="level" title="级别" width="80">
      <template #default="{ row }">
        <a-tag :color="levelColor(row.level)">{{ row.level }}</a-tag>
      </template>
    </vxe-column>
    <vxe-column field="dimension" title="异常维度" width="120" />
    <vxe-column field="region" title="地区" width="80" />
    <vxe-column field="site" title="站点" width="100" />
    <vxe-column field="source" title="来源" width="120" />
    <vxe-column field="productLine" title="产品线" width="110" />
    <vxe-column field="internal" title="内部型号" width="140" />
    <vxe-column field="issue" title="异常描述" min-width="220" />
    <vxe-column field="impactScope" title="影响范围" min-width="220" />
    <vxe-column field="owner" title="负责人" width="100" />
    <vxe-column field="team" title="协同团队" min-width="180" />
    <vxe-column field="deadline" title="响应时限" width="120">
      <template #default="{ row }">
        <a-tag :color="row.overdue ? 'red' : 'green'">{{ row.deadline }}</a-tag>
      </template>
    </vxe-column>
    <vxe-column field="status" title="状态" width="140" />
    <vxe-column field="action" title="当前动作" min-width="220" />
    <vxe-column title="操作" width="160" fixed="right" align="center">
      <template #default="{ row }">
        <a-space size="small">
          <a-button size="small" type="link" @click="emit('openDetail', row)">详情</a-button>
          <a-button size="small" @click="emit('advanceStep', row)">推进</a-button>
        </a-space>
      </template>
    </vxe-column>
  </vxe-table>
</template>
