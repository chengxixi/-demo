<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import type { RequirementPoolItem } from '@/types'

const props = defineProps<{
  pool: RequirementPoolItem[]
  levelFilter: string
  levelCounts: { L1: number; L2: number; L3: number; L4: number }
}>()

const emit = defineEmits<{
  (event: 'update:level-filter', value: string): void
  (event: 'openDetail', item: RequirementPoolItem): void
}>()

const poolTableRef = useTemplateRef('poolTableRef')

const scoreColumns = [
  { key: 'userValue', label: '用户价值' },
  { key: 'businessImpact', label: '业务影响' },
  { key: 'feasibility', label: '可行性' },
  { key: 'competitiveImpact', label: '竞争影响' },
  { key: 'inventoryImpact', label: '库存影响' },
] as const

const levelCards = computed(() => [
  { level: 'L1', title: 'L1 紧急修复', desc: '安全、合规或高退货风险，先处置再复盘', count: props.levelCounts.L1 },
  { level: 'L2', title: 'L2 体验优化', desc: '高频体验问题，进入近期迭代评审', count: props.levelCounts.L2 },
  { level: 'L3', title: 'L3 功能升级', desc: '用户价值明确，进入版本规划', count: props.levelCounts.L3 },
  { level: 'L4', title: 'L4 换代观察', desc: '中长期机会，进入产品规划观察池', count: props.levelCounts.L4 },
])

function totalScore(item: RequirementPoolItem) {
  return Object.values(item.scores).reduce((sum, score) => sum + score, 0)
}

function handleFilterClick(level: string) {
  emit('update:level-filter', props.levelFilter === level ? '' : level)
}

function exportRequirementScores() {
  poolTableRef.value?.exportData({ filename: 'requirement-score-table', type: 'csv' })
}
</script>

<template>
  <div class="space-y-4">
    <a-row :gutter="[12, 12]">
      <a-col v-for="card in levelCards" :key="card.level" :xs="24" :md="6">
        <a-card
          size="small"
          class="cursor-pointer"
          :class="{ 'border-blue-500 bg-blue-50': props.levelFilter === card.level }"
          @click="handleFilterClick(card.level)"
        >
          <a-space direction="vertical" size="small">
            <a-typography-text strong>{{ card.title }}</a-typography-text>
            <a-typography-text type="secondary">{{ card.desc }}</a-typography-text>
            <a-statistic :value="card.count" />
          </a-space>
        </a-card>
      </a-col>
    </a-row>

    <a-row justify="space-between" align="middle">
      <a-col><a-typography-title :level="5" class="m-0">产品需求池</a-typography-title></a-col>
      <a-col>
        <a-space>
          <a-tag v-if="props.levelFilter" color="blue">{{ props.levelFilter }}</a-tag>
          <a-button @click="exportRequirementScores">导出评分表</a-button>
        </a-space>
      </a-col>
    </a-row>

    <vxe-table
      ref="poolTableRef"
      :data="props.pool"
      border
      stripe
      show-overflow
      height="560"
      :export-config="{}"
      @cell-dblclick="({ row }) => emit('openDetail', row)"
    >
      <vxe-column field="id" title="需求ID" width="160" fixed="left" />
      <vxe-column field="candidate" title="候选来源" width="150" />
      <vxe-column field="title" title="需求标题" min-width="240" />
      <vxe-column field="source" title="来源/证据类型" min-width="180" />
      <vxe-column field="evidence" title="证据摘要" min-width="300" />
      <vxe-column field="product" title="适用产品" width="160" />
      <vxe-column v-for="column in scoreColumns" :key="column.key" :title="column.label" width="95" align="center">
        <template #default="{ row }">
          <a-rate :value="row.scores[column.key]" disabled :count="5" />
        </template>
      </vxe-column>
      <vxe-column title="总分" width="80" align="center">
        <template #default="{ row }">{{ totalScore(row) }}</template>
      </vxe-column>
      <vxe-column field="level" title="等级" width="80">
        <template #default="{ row }">
          <a-tag :color="row.level === 'L1' ? 'red' : row.level === 'L2' ? 'orange' : row.level === 'L3' ? 'blue' : 'default'">
            {{ row.level }}
          </a-tag>
        </template>
      </vxe-column>
      <vxe-column field="path" title="处理路径" width="130" />
      <vxe-column field="status" title="状态" width="110" />
      <vxe-column field="owner" title="责任人" width="100" />
      <vxe-column field="due" title="完成时限" width="120" />
      <vxe-column field="nextAction" title="下一步动作" min-width="220" />
      <vxe-column title="操作" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <a-button size="small" type="link" @click.stop="emit('openDetail', row)">详情</a-button>
        </template>
      </vxe-column>
    </vxe-table>
  </div>
</template>
