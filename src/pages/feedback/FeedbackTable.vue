<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'
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
const GROUP_ROW_INFO_COLSPAN = 19
const GROUP_ROW_OPERATION_COLUMN_INDEX = 20

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
      title: `${lead.productType}-${lead.level3 || lead.level2 || '待分类'}`, 
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

function displayException(level: string) {
  return ['P0', 'P1', 'P2', 'P3'].includes(level) ? level : '无异常'
}

function exceptionColor(level: string) {
  const displayLevel = displayException(level)
  if (displayLevel === 'P0' || displayLevel === 'P1') return 'red'
  if (displayLevel === 'P2') return 'orange'
  if (displayLevel === 'P3') return 'blue'
  return 'default'
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


function mergeSpanMethod({ row, columnIndex }: { row: FeedbackTableRow; columnIndex: number }) {
  if (row.rowType !== 'group') return undefined

  if (columnIndex === 1) {
    return { rowspan: 1, colspan: GROUP_ROW_INFO_COLSPAN }
  }

  if (columnIndex > 1 && columnIndex < GROUP_ROW_OPERATION_COLUMN_INDEX) {
    return { rowspan: 0, colspan: 0 }
  }

  return undefined
}

function rowClassName({ row }: { row: FeedbackTableRow }) {
  if (row.rowType === 'group') {
    return 'feedback-group-row'
  }

  if (row.parentGroup) {
    return 'feedback-child-row'
  }

  return 'feedback-single-row'
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
    :span-method="mergeSpanMethod"
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

    <vxe-column title="编号/合并组" width="230">
      <template #default="{ row }">
        <div v-if="row.rowType === 'group'" class="merge-group-cell">
          <a-tooltip :title="isGroupExpanded(row.mergeGroup) ? '收起' : '展开'">
            <a-button class="merge-toggle" size="small" type="text" @click.stop="toggleGroup(row.mergeGroup)">
              <ChevronDown v-if="isGroupExpanded(row.mergeGroup)" :size="14" />
              <ChevronRight v-else :size="14" />
            </a-button>
          </a-tooltip>
          <a-tag color="blue" class="feedback-row-kind merge-group-kind">合并</a-tag>
          <span class="merge-title">{{ row.title }}</span>
          <span class="merge-meta">
            （数量：{{ row.members.length }}）
          </span>
        </div>
        <div v-else :class="['feedback-id-cell', { 'feedback-child-cell': row.parentGroup, 'feedback-single-cell': !row.parentGroup }]">
          <span v-if="!row.parentGroup" class="feedback-toggle-spacer"></span>
          <a-tag v-if="row.parentGroup" class="feedback-row-kind">明细</a-tag>
          <a-tag v-else color="blue" class="feedback-row-kind">单条</a-tag>
          <a-typography-text strong>{{ row.item.id }}</a-typography-text>
        </div>
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
    <vxe-column title="AI翻译/摘要" min-width="320">
      <template #default="{ row }">
        {{ rowItem(row).ai }}
      </template>
    </vxe-column>
    <vxe-column title="问题反馈时间" width="130">
      <template #default="{ row }">{{ rowItem(row).date }}</template>
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
          {{ displayException(rowItem(row).exception) }}
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
:deep(.feedback-group-row td) {
  background: #dbeafe !important;
  border-top: 1px solid #93c5fd;
  border-bottom: 1px solid #93c5fd;
  color: #1e293b;
  font-weight: 600;
}

:deep(.feedback-child-row td) {
  background: #f8fafc !important;
  color: #475569;
}

:deep(.feedback-child-row:nth-child(even) td) {
  background: #f1f5f9 !important;
}

:deep(.feedback-single-row td) {
  background: #fff !important;
}

:deep(.feedback-single-row td:nth-child(2)) {
  box-shadow: inset 3px 0 0 #60a5fa;
}

.merge-group-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  white-space: nowrap;
}

.merge-toggle,
.feedback-toggle-spacer {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.merge-toggle {
  padding: 0;
  color: #2563eb;
}

.merge-title {
  color: #0f172a;
  font-weight: 700;
}

.merge-meta {
  overflow: hidden;
  color: #334155;
  text-overflow: ellipsis;
}

.feedback-id-cell {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
}

.feedback-child-cell {
  padding-left: 18px;
}

.feedback-row-kind {
  flex: none;
  margin-inline-end: 0;
}

.merge-group-kind {
  background: #eff6ff;
  border-color: #91caff;
}
</style>
