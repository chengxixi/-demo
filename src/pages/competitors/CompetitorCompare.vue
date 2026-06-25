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

function setCompareSlot(slotIdx: number, competitorIdx: number) {
  const newSlots = [...props.compareSlots]
  newSlots[slotIdx] = competitorIdx
  emit('update:compareSlots', newSlots)
}

function getCompareProducts(): Competitor[] {
  return props.compareSlots
    .filter(i => i >= 0 && i < props.allCompetitors.length)
    .map(i => props.allCompetitors[i])
}

const compareFields = computed(() => {
  const prods = getCompareProducts()
  if (prods.length < 2) return []
  const groups: { group: string; label: string; values: string[] }[] = []
  const rows = [
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
  for (const row of rows) {
    groups.push({
      group: row.group,
      label: row.label,
      values: prods.map(p => String((p as any)[row.key] || '')),
    })
  }
  return groups
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content compare-modal">
        <div class="modal-head">
          <div><h2>产品对比</h2><p>已选 {{ getCompareProducts().length }}/4 个产品</p></div>
          <button class="icon-button" @click="$emit('close')">×</button>
        </div>
        <div class="compare-picker">
          <label v-for="(slot, i) in compareSlots" :key="i" class="compare-slot" :class="{ active: slot >= 0 }">
            <span>对比产品 {{ i + 1 }}</span>
            <select :value="slot" @change="setCompareSlot(i, Number(($event.target as HTMLSelectElement).value))">
              <option :value="-1">请选择产品</option>
              <option v-for="(c, ci) in allCompetitors" :key="c.id" :value="ci">{{ c.brand }} {{ c.name }}</option>
            </select>
            <em v-if="slot >= 0">{{ allCompetitors[slot]?.productType }} / {{ allCompetitors[slot]?.dealPrice }}</em>
            <em v-else>未选择</em>
          </label>
        </div>
        <div v-if="getCompareProducts().length >= 2" class="compare-table-wrap">
          <table class="data-table compact">
            <thead>
              <tr>
                <th>字段</th>
                <th v-for="p in getCompareProducts()" :key="p.id">{{ p.brand }} {{ p.name }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(row, ri) in compareFields" :key="ri">
                <tr v-if="ri === 0 || compareFields[ri-1].group !== row.group" class="compare-group-row">
                  <td :colspan="getCompareProducts().length + 1">{{ row.group }}</td>
                </tr>
                <tr>
                  <td>{{ row.label }}</td>
                  <td v-for="(val, vi) in row.values" :key="vi">{{ val }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div v-else style="text-align:center;padding:40px;color:#999;">请至少选择 2 个产品进行对比</div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-start; justify-content: center; z-index: 999; padding-top: 5vh; overflow-y: auto; }
.modal-content { background: #fff; border-radius: 12px; width: min(700px, 95vw); max-height: 85vh; overflow-y: auto; box-shadow: 0 4px 24px rgba(0,0,0,0.15); }
.compare-modal { width: min(700px, 95vw); }
.modal-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 20px 12px; border-bottom: 1px solid #e4eaf3; position: sticky; top: 0; background: #fff; z-index: 1; }
.modal-head h2 { margin: 4px 0 2px; font-size: 18px; }
.modal-head p { margin: 0; color: #667085; font-size: 12px; }
.icon-button { background: none; border: 1px solid #d7deea; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 16px; }
.compare-picker { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 12px 20px; }
.compare-slot { display: flex; flex-direction: column; gap: 4px; padding: 10px; border: 1px solid #d7deea; border-radius: 8px; font-size: 12px; }
.compare-slot.active { border-color: #175cd3; background: #eef4ff; }
.compare-slot span { font-weight: 700; color: #667085; font-size: 11px; }
.compare-slot select { padding: 4px; border: 1px solid #d7deea; border-radius: 4px; font-size: 12px; }
.compare-slot em { color: #667085; font-size: 11px; }
.compare-table-wrap { padding: 0 20px 16px; overflow-x: auto; }
.compare-table-wrap table { width: 100%; }
.compare-group-row td { background: #f8fafc; font-weight: 700; color: #475467; font-size: 12px; padding: 6px 10px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.data-table th, .data-table td { border: 1px solid #e4eaf3; padding: 6px 10px; text-align: left; white-space: nowrap; }
.data-table th { background: #f8fafc; font-weight: 700; color: #475467; }
.data-table.compact th, .data-table.compact td { padding: 4px 8px; }
</style>
