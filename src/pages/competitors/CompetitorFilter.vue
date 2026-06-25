<script setup lang="ts">
interface Filters {
  name: string
  channelType: string
  asin: string
  line: string
  price: string
}

const props = defineProps<{
  filters: Filters
}>()

const emit = defineEmits<{
  'update:filters': [filters: Filters]
  reset: []
  compare: []
  export: []
}>()

function updateField<K extends keyof Filters>(key: K, value: Filters[K]) {
  emit('update:filters', { ...props.filters, [key]: value })
}

function resetFilters() {
  emit('reset')
}

function handleCompare() {
  emit('compare')
}

function handleExport() {
  emit('export')
}
</script>

<template>
  <div class="local-fixed-filter-panel">
    <label>竞品名称<input type="text" placeholder="品牌/产品名称" :value="filters.name" @input="updateField('name', ($event.target as HTMLInputElement).value)" /></label>
    <label>渠道类型
      <select :value="filters.channelType" @change="updateField('channelType', ($event.target as HTMLSelectElement).value)">
        <option value="">全部</option><option>海外</option><option>国内</option>
      </select>
    </label>
    <label>ASIN<input type="text" placeholder="海外渠道必填" :value="filters.asin" @input="updateField('asin', ($event.target as HTMLInputElement).value)" /></label>
    <label>产品线
      <select :value="filters.line" @change="updateField('line', ($event.target as HTMLSelectElement).value)">
        <option value="">全部</option><option>八电极秤</option><option>体脂秤</option><option>筋膜枪</option>
      </select>
    </label>
    <label>价格<input type="text" placeholder="输入价格" :value="filters.price" @input="updateField('price', ($event.target as HTMLInputElement).value)" /></label>
    <label class="local-filter-actions"><button class="secondary-button" @click="resetFilters">重置</button></label>
    <label class="local-filter-actions" style="margin-left:auto;display:flex;gap:8px;">
      <button class="secondary-button" @click="handleCompare">产品对比</button>
      <button class="secondary-button" @click="handleExport">导出</button>
    </label>
  </div>
</template>

<style scoped>
.local-fixed-filter-panel { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; background: #f8fafc; padding: 12px; border: 1px solid #d7deea; border-radius: 8px; margin-bottom: 12px; }
.local-fixed-filter-panel label { font-size: 12px; color: #475467; font-weight: 600; display: flex; flex-direction: column; gap: 4px; }
.local-fixed-filter-panel input,
.local-fixed-filter-panel select { padding: 6px 10px; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; min-width: 120px; }
.local-filter-actions { align-self: flex-end; }
.secondary-button { padding: 8px 16px; background: #fff; color: #475467; border: 1px solid #d7deea; border-radius: 6px; font-size: 13px; cursor: pointer; }
</style>
