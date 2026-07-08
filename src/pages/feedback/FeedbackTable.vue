<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FeedbackItem } from '@/types'

type FeedbackTableRow =
  | {
      rowType: 'group'
      id: string
      mergeGroup: string
      title: string
      members: FeedbackItem[]
      lead: FeedbackItem
    }
  | {
      rowType: 'item'
      id: string
      item: FeedbackItem
      parentGroup?: string
      childIndex?: number
    }

const props = defineProps<{
  items: FeedbackItem[]
  selectedIds: Set<string>
}>()

const emit = defineEmits<{
  (event: 'toggleSelect', id: string): void
  (event: 'toggleSelectMany', ids: string[]): void
  (event: 'toggleSelectAll'): void
  (event: 'openDetail', item: FeedbackItem): void
  (event: 'openMerge', groupId: string): void
  (event: 'manualReview', item: FeedbackItem): void
}>()

const expandedGroups = ref<Set<string>>(new Set())

const allSelected = computed(() => {
  return props.items.length > 0 && props.items.every((item) => props.selectedIds.has(item.id))
})

const someSelected = computed(() => {
  return props.items.some((item) => props.selectedIds.has(item.id)) && !allSelected.value
})

const groupedRows = computed<FeedbackTableRow[]>(() => {
  const grouped = new Map<string, FeedbackItem[]>()
  const singles: FeedbackItem[] = []

  props.items.forEach((item) => {
    if (!item.mergeGroup) {
      singles.push(item)
      return
    }

    const bucket = grouped.get(item.mergeGroup) || []
    bucket.push(item)
    grouped.set(item.mergeGroup, bucket)
  })

  const rows: FeedbackTableRow[] = []

  grouped.forEach((members, mergeGroup) => {
    if (members.length === 1) {
      rows.push({ rowType: 'item', id: members[0].id, item: members[0] })
      return
    }

    const lead = members[0]
    rows.push({
      rowType: 'group',
      id: `group-${mergeGroup}`,
      mergeGroup,
      title: `${lead.model || lead.internal} ${lead.level3}合并反馈`,
      members,
      lead,
    })

    if (expandedGroups.value.has(mergeGroup)) {
      members.forEach((item, index) => {
        rows.push({
          rowType: 'item',
          id: item.id,
          item,
          parentGroup: mergeGroup,
          childIndex: index + 1,
        })
      })
    }
  })

  singles.forEach((item) => {
    rows.push({ rowType: 'item', id: item.id, item })
  })

  return rows
})

function exceptionColor(level: string) {
  if (level === 'P0' || level === 'P1') {
    return 'red'
  }

  if (level === 'P2') {
    return 'orange'
  }

  return 'blue'
}

function isGroupExpanded(group: string) {
  return expandedGroups.value.has(group)
}

function toggleGroup(group: string) {
  const next = new Set(expandedGroups.value)

  if (next.has(group)) {
    next.delete(group)
  } else {
    next.add(group)
  }

  expandedGroups.value = next
}

function groupAllSelected(members: FeedbackItem[]) {
  return members.every((item) => props.selectedIds.has(item.id))
}

function groupSomeSelected(members: FeedbackItem[]) {
  return members.some((item) => props.selectedIds.has(item.id)) && !groupAllSelected(members)
}

function groupIds(members: FeedbackItem[]) {
  return members.map((item) => item.id)
}

function groupRawSummary(members: FeedbackItem[]) {
  return members.map((item) => item.raw).join(' / ')
}

function groupAiSummary(members: FeedbackItem[]) {
  return members.map((item) => item.ai).join(' / ')
}

function rowItem(row: FeedbackTableRow) {
  return row.rowType === 'group' ? row.lead : row.item
}

function rowRegion(item: FeedbackItem) {
  return item.region || (item.site.includes('Amazon') ? '海外' : '国内')
}

function rowDataSource(item: FeedbackItem) {
  return item.dataSource || item.source
}

function rowOrderNo(item: FeedbackItem) {
  return item.orderNo || item.asin || '-'
}

function rowExpressNo(item: FeedbackItem) {
  if (item.expressNo) {
    return item.expressNo
  }

  return item.returned === '退货' || item.returned === '换货' || item.returned === '退货+换货'
    ? '待补充'
    : '-'
}

function rowImage(item: FeedbackItem) {
  return item.image || '-'
}

function rowVideo(item: FeedbackItem) {
  return item.video || '-'
}

function rowSolution(item: FeedbackItem) {
  return item.solution || item.processRoute || '待产品经理确认处理方案。'
}

function rowClassName({ row }: { row: FeedbackTableRow }) {
  if (row.rowType === 'group') {
    return 'feedback-group-row'
  }

  if (row.parentGroup) {
    return 'feedback-child-row'
  }

  return ''
}
</script>

<template>
  <vxe-table
    :data="groupedRows"
    border
    stripe
    show-overflow
    height="560"
    :row-config="{ keyField: 'id' }"
    :row-class-name="rowClassName"
    :export-config="{}"
  >
    <vxe-column width="54" align="center" fixed="left">
      <template #header>
        <a-checkbox
          :checked="allSelected"
          :indeterminate="someSelected"
          @change="emit('toggleSelectAll')"
        />
      </template>
      <template #default="{ row }">
        <a-checkbox
          v-if="row.rowType === 'item'"
          :checked="props.selectedIds.has(row.item.id)"
          @change="emit('toggleSelect', row.item.id)"
        />
        <a-checkbox
          v-else
          :checked="groupAllSelected(row.members)"
          :indeterminate="groupSomeSelected(row.members)"
          @change="emit('toggleSelectMany', groupIds(row.members))"
        />
      </template>
    </vxe-column>

    <vxe-column title="编号/合并组" width="230" fixed="left">
      <template #default="{ row }">
        <a-space v-if="row.rowType === 'group'" direction="vertical" size="small">
          <a-space>
            <a-button size="small" @click="toggleGroup(row.mergeGroup)">
              {{ isGroupExpanded(row.mergeGroup) ? '-' : '+' }}
            </a-button>
            <a-typography-text strong>{{ row.title }}</a-typography-text>
          </a-space>
          <a-typography-text type="secondary">
            {{ row.members.length }} 条反馈 / {{ row.lead.source }} / {{ row.lead.feedbackUser }}
          </a-typography-text>
        </a-space>
        <a-space v-else direction="vertical" size="small">
          <a-typography-text strong>
            {{ row.parentGroup ? `第 ${row.childIndex} 条明细` : row.item.id }}
          </a-typography-text>
          <a-typography-text v-if="row.parentGroup" type="secondary">{{ row.item.id }}</a-typography-text>
        </a-space>
      </template>
    </vxe-column>

    <vxe-column title="地区" width="90">
      <template #default="{ row }">{{ rowRegion(rowItem(row)) }}</template>
    </vxe-column>
    <vxe-column title="数据来源" width="150">
      <template #default="{ row }">
        <a-tag>{{ rowDataSource(rowItem(row)) }}</a-tag>
      </template>
    </vxe-column>
    <vxe-column title="品牌" width="100">
      <template #default="{ row }">{{ rowItem(row).brand }}</template>
    </vxe-column>
    <vxe-column title="设备类型" width="120">
      <template #default="{ row }">{{ rowItem(row).productType }}</template>
    </vxe-column>
    <vxe-column title="内部型号/料号" width="150">
      <template #default="{ row }">{{ rowItem(row).internal }}</template>
    </vxe-column>
    <vxe-column title="销售型号" width="120">
      <template #default="{ row }">{{ rowItem(row).model }}</template>
    </vxe-column>
    <vxe-column title="订单号/ASIN" width="150">
      <template #default="{ row }">{{ rowOrderNo(rowItem(row)) }}</template>
    </vxe-column>
    <vxe-column title="快递单号" width="130">
      <template #default="{ row }">{{ rowExpressNo(rowItem(row)) }}</template>
    </vxe-column>
    <vxe-column title="用户反馈" min-width="240">
      <template #default="{ row }">
        {{ row.rowType === 'group' ? groupRawSummary(row.members) : row.item.raw }}
      </template>
    </vxe-column>
    <vxe-column title="AI翻译/摘要" min-width="240">
      <template #default="{ row }">
        {{ row.rowType === 'group' ? groupAiSummary(row.members) : row.item.ai }}
      </template>
    </vxe-column>
    <vxe-column title="图片补充" width="110">
      <template #default="{ row }">{{ rowImage(rowItem(row)) }}</template>
    </vxe-column>
    <vxe-column title="视频补充" width="110">
      <template #default="{ row }">{{ rowVideo(rowItem(row)) }}</template>
    </vxe-column>
    <vxe-column title="问题反馈时间" width="130">
      <template #default="{ row }">{{ rowItem(row).date }}</template>
    </vxe-column>
    <vxe-column title="问题回答/处理方案" min-width="220">
      <template #default="{ row }">{{ rowSolution(rowItem(row)) }}</template>
    </vxe-column>
    <vxe-column title="一级职能划分" width="130">
      <template #default="{ row }">{{ rowItem(row).level1 }}</template>
    </vxe-column>
    <vxe-column title="二级问题场景" width="150">
      <template #default="{ row }">{{ rowItem(row).level2 }}</template>
    </vxe-column>
    <vxe-column title="三级问题" width="140">
      <template #default="{ row }">{{ rowItem(row).level3 }}</template>
    </vxe-column>
    <vxe-column title="异常级别" width="100">
      <template #default="{ row }">
        <a-tag :color="exceptionColor(rowItem(row).exception)">
          {{ rowItem(row).exception }}
        </a-tag>
      </template>
    </vxe-column>
    <vxe-column title="创建方式" width="130">
      <template #default="{ row }">{{ rowItem(row).createMode }}</template>
    </vxe-column>
    <vxe-column title="处理去向" width="130">
      <template #default="{ row }">{{ rowItem(row).processRoute }}</template>
    </vxe-column>
    <vxe-column title="状态" width="120">
      <template #default="{ row }">{{ rowItem(row).processState }}</template>
    </vxe-column>
    <vxe-column title="反馈人" width="100">
      <template #default="{ row }">{{ rowItem(row).feedbackUser }}</template>
    </vxe-column>
    <vxe-column title="处理人" width="100">
      <template #default="{ row }">{{ rowItem(row).handler }}</template>
    </vxe-column>
    <vxe-column title="操作" width="150" align="center" fixed="right">
      <template #default="{ row }">
        <a-space v-if="row.rowType === 'item'" size="small">
          <a-button size="small" type="link" @click="emit('openDetail', row.item)">详情</a-button>
          <a-button size="small" @click="emit('manualReview', row.item)">复核</a-button>
        </a-space>
        <a-space v-else size="small">
          <a-button size="small" type="link" @click="emit('openMerge', row.mergeGroup)">详情</a-button>
          <a-button size="small" @click="toggleGroup(row.mergeGroup)">
            {{ isGroupExpanded(row.mergeGroup) ? '收起' : '展开' }}
          </a-button>
        </a-space>
      </template>
    </vxe-column>
  </vxe-table>
</template>

<style scoped>
:deep(.feedback-group-row) {
  background: #f2f7ff;
  font-weight: 600;
}

:deep(.feedback-child-row) {
  background: #fcfdff;
  color: #475569;
}
</style>
