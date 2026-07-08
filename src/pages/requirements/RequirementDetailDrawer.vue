<script setup lang="ts">
import type { RequirementPoolItem } from '@/types'

const props = defineProps<{
  visible: boolean
  item: RequirementPoolItem | null
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()

function scoreTotal(item: RequirementPoolItem) {
  return Object.values(item.scores).reduce((sum, score) => sum + score, 0)
}
</script>

<template>
  <a-drawer
    :open="props.visible"
    :title="props.item?.title || '需求详情'"
    width="640"
    @close="emit('close')"
  >
    <template v-if="props.item">
      <a-descriptions bordered size="small" :column="1">
        <a-descriptions-item label="需求编号">{{ props.item.id }}</a-descriptions-item>
        <a-descriptions-item label="适用产品">{{ props.item.product }}</a-descriptions-item>
        <a-descriptions-item label="等级">{{ props.item.level }}</a-descriptions-item>
        <a-descriptions-item label="路径">{{ props.item.path }}</a-descriptions-item>
        <a-descriptions-item label="负责人">{{ props.item.owner }}</a-descriptions-item>
        <a-descriptions-item label="总分">{{ scoreTotal(props.item) }}</a-descriptions-item>
        <a-descriptions-item label="证据">{{ props.item.evidence }}</a-descriptions-item>
        <a-descriptions-item label="需求描述">{{ props.item.description }}</a-descriptions-item>
        <a-descriptions-item label="用户痛点">{{ props.item.painPoint }}</a-descriptions-item>
        <a-descriptions-item label="预期价值">{{ props.item.expectedValue }}</a-descriptions-item>
        <a-descriptions-item label="风险">{{ props.item.risk }}</a-descriptions-item>
        <a-descriptions-item label="下一步">{{ props.item.nextAction }}</a-descriptions-item>
      </a-descriptions>
    </template>
  </a-drawer>
</template>
