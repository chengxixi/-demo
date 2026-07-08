<script setup lang="ts">
import { computed } from 'vue'
import type { Competitor } from '@/types'

const props = defineProps<{
  allCompetitors: Competitor[]
  compareSlots: number[]
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  'update:compareSlots': [slots: number[]]
}>()

const selectedProducts = computed(() =>
  props.compareSlots
    .filter((index) => index >= 0 && index < props.allCompetitors.length)
    .map((index) => props.allCompetitors[index]),
)

const compareRows = computed(() => {
  if (selectedProducts.value.length < 2) return []

  const fields = [
    { group: '基础档案', label: '竞品类型', key: 'type' },
    { group: '基础档案', label: '产品类型', key: 'productType' },
    { group: '基础档案', label: '型号', key: 'model' },
    { group: '基础档案', label: '定位', key: 'position' },
    { group: '价格与评价', label: '到手价', key: 'dealPrice' },
    { group: '价格与评价', label: '评分', key: 'rating' },
    { group: '价格与评价', label: '评论数', key: 'reviews' },
    { group: '痛点与风险', label: '核心卖点', key: 'sellingPoints' },
    { group: '痛点与风险', label: '用户痛点', key: 'pain' },
  ]

  return fields.map((field) => {
    const row: Record<string, string> = {
      group: field.group,
      label: field.label,
    }

    selectedProducts.value.forEach((product, index) => {
      const value = (product as any)[field.key]
      row[`value${index}`] = Array.isArray(value) ? value.join(' / ') : String(value || '')
    })

    return row
  })
})

function setCompareSlot(slotIndex: number, competitorIndex: number) {
  const nextSlots = [...props.compareSlots]
  nextSlots[slotIndex] = competitorIndex
  emit('update:compareSlots', nextSlots)
}
</script>

<template>
  <a-modal
    :open="visible"
    title="产品对比"
    :width="920"
    :footer="null"
    @cancel="emit('close')"
  >
    <p class="text-xs text-gray-500 mb-3">已选 {{ selectedProducts.length }}/4 个产品</p>

    <a-row :gutter="[10, 10]" class="mb-4">
      <a-col v-for="(slot, index) in compareSlots" :key="index" :span="6">
        <a-card size="small" :class="{ active: slot >= 0 }">
          <span class="text-[11px] font-bold text-gray-500">对比产品 {{ index + 1 }}</span>
          <a-select
            :value="slot"
            size="small"
            class="w-full mt-1"
            @change="setCompareSlot(index, Number($event))"
          >
            <a-select-option :value="-1">请选择产品</a-select-option>
            <a-select-option v-for="(competitor, competitorIndex) in allCompetitors" :key="competitor.id" :value="competitorIndex">
              {{ competitor.brand }} {{ competitor.name }}
            </a-select-option>
          </a-select>
          <em class="block text-[11px] text-gray-500 mt-1">
            <template v-if="slot >= 0">
              {{ allCompetitors[slot]?.productType }} / {{ allCompetitors[slot]?.dealPrice }}
            </template>
            <template v-else>未选择</template>
          </em>
        </a-card>
      </a-col>
    </a-row>

    <vxe-table
      v-if="selectedProducts.length >= 2"
      :data="compareRows"
      border="inner"
      size="mini"
      stripe
      show-overflow
      :export-config="{}"
    >
      <vxe-column field="group" title="分组" width="120" />
      <vxe-column field="label" title="字段" width="120" />
      <vxe-column
        v-for="(product, index) in selectedProducts"
        :key="product.id"
        :field="`value${index}`"
        :title="`${product.brand} ${product.name}`"
        min-width="180"
      />
    </vxe-table>
    <a-empty v-else description="请至少选择 2 个产品进行对比" />
  </a-modal>
</template>

<style scoped>
:deep(.active) {
  border-color: #1677ff;
  background: #e6f4ff;
}
</style>
